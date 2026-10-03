import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId } from "./model/auth";
import {
  getEntitlement,
  getScenarioAccess,
  type Entitlement,
} from "./model/entitlements";
import { normalizeScenario } from "./model/scenario";
import {
  canPractiseCourse,
  getListing,
  inLibrary,
  libraryModuleIds,
  publishedCommunityIds,
} from "./model/courses";
import { orderModulesForGoal } from "../lib/goals";
import { isPassingScore } from "../lib/scoring";

type ScenarioStats = {
  attempts: number;
  bestScore: number | null;
  lastScore: number | null;
  passed: boolean;
};

const GRADED = new Set(["completed", "needs_review"]);

async function avatarUrl(
  ctx: QueryCtx,
  agent: { avatarStorageId?: Doc<"scenarios">["aiAgentA"]["avatarStorageId"]; avatarImageUrl?: string },
) {
  if (agent.avatarStorageId) {
    return (await ctx.storage.getUrl(agent.avatarStorageId)) ?? agent.avatarImageUrl;
  }

  return agent.avatarImageUrl;
}

function statsByScenario(sessions: Doc<"sessions">[]) {
  const stats = new Map<string, ScenarioStats>();
  const ordered = [...sessions].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  for (const session of ordered) {
    if (!GRADED.has(session.completionStatus)) {
      continue;
    }

    const current = stats.get(session.scenarioId) ?? {
      attempts: 0,
      bestScore: null,
      lastScore: null,
      passed: false,
    };

    current.attempts += 1;
    current.bestScore = Math.max(current.bestScore ?? 0, session.score);
    current.lastScore = session.score;
    current.passed ||= isPassingScore(session.moduleId, session.score);
    stats.set(session.scenarioId, current);
  }

  return stats;
}

/**
 * The practice library for the signed-in user: modules in goal order, each
 * scenario's lock state and the user's results, plus one recommended next step.
 */
export const forCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const user = identity
      ? await getUserByClerkId(ctx, getClerkIdFromIdentity(identity))
      : null;
    const entitlement: Pick<Entitlement, "premiumAccess"> | Entitlement = user
      ? await getEntitlement(ctx, user)
      : { premiumAccess: false };
    const [allModules, scenarios, sessions, added, publishedIds, listings] = await Promise.all([
      ctx.db.query("modules").collect(),
      ctx.db.query("scenarios").collect(),
      user
        ? ctx.db
            .query("sessions")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
            .collect()
        : Promise.resolve([] as Doc<"sessions">[]),
      user ? libraryModuleIds(ctx, user.clerkId) : Promise.resolve(new Set<string>()),
      publishedCommunityIds(ctx),
      ctx.db.query("courseListings").collect(),
    ]);
    // Marketplace courses appear only once the learner adds them (or owns them).
    const modules = allModules.filter((course) => inLibrary(course, user, added, publishedIds));
    const listingByModule = new Map(listings.map((listing) => [listing.moduleId, listing]));
    const stats = statsByScenario(sessions);

    const catalogModules = await Promise.all(
      orderModulesForGoal(modules, user?.practiceGoal).map(async (learningModule) => {
        const moduleScenarios = await Promise.all(
          scenarios
            .filter((scenario) => scenario.moduleId === learningModule.id)
            .map(async (scenario) => {
              const access = getScenarioAccess(entitlement, learningModule, scenario);
              const normalized = normalizeScenario(scenario);

              return {
                id: scenario.id,
                title: scenario.title,
                description: scenario.description,
                difficultyLevel: scenario.difficultyLevel,
                isFreePreview: Boolean(scenario.isFreePreview),
                locked: !access.allowed,
                participants: await Promise.all(
                  [normalized.aiAgentA, normalized.aiAgentB]
                    .filter((agent) => agent !== undefined)
                    .map(async (agent) => ({
                      name: agent.name ?? agent.role,
                      role: agent.role,
                      avatarUrl: await avatarUrl(ctx, agent),
                    })),
                ),
                stats: stats.get(scenario.id) ?? {
                  attempts: 0,
                  bestScore: null,
                  lastScore: null,
                  passed: false,
                },
              };
            }),
        );

        // Free previews first, then by difficulty, so the first card is playable.
        const difficultyRank = { beginner: 0, intermediate: 1, advanced: 2 } as const;
        moduleScenarios.sort(
          (a, b) =>
            Number(a.locked) - Number(b.locked) ||
            difficultyRank[a.difficultyLevel] - difficultyRank[b.difficultyLevel],
        );

        return {
          id: learningModule.id,
          title: learningModule.title,
          description: learningModule.description,
          industryCategory: learningModule.industryCategory,
          difficultyLevel: learningModule.difficultyLevel,
          durationMinutes: learningModule.durationMinutes,
          learningObjectives: learningModule.learningObjectives,
          isFree: learningModule.isFree,
          isAccredited: learningModule.isAccredited,
          accreditationProvider: learningModule.accreditationProvider,
          source: learningModule.source ?? ("xingo" as const),
          creatorName: listingByModule.get(learningModule.id)?.creatorName ?? null,
          listingSlug: listingByModule.get(learningModule.id)?.slug ?? null,
          listingStatus: listingByModule.get(learningModule.id)?.status ?? null,
          scenarios: moduleScenarios,
          passedCount: moduleScenarios.filter((s) => s.stats.passed).length,
          attemptCount: moduleScenarios.reduce((sum, s) => sum + s.stats.attempts, 0),
          practiceType: scenarios.some(
            (scenario) => scenario.moduleId === learningModule.id && scenario.practiceRuntime?.practiceType === "roleplay",
          )
            ? ("roleplay" as const)
            : ("interpreting" as const),
        };
      }),
    );

    const nextUp =
      catalogModules
        .flatMap((m) => m.scenarios.map((s) => ({ module: m, scenario: s })))
        .find(({ scenario }) => !scenario.locked && !scenario.stats.passed) ??
      null;

    return {
      practiceGoal: user?.practiceGoal ?? null,
      modules: catalogModules,
      nextUp: nextUp
        ? {
            moduleId: nextUp.module.id,
            moduleTitle: nextUp.module.title,
            scenarioId: nextUp.scenario.id,
            scenarioTitle: nextUp.scenario.title,
            scenarioDescription: nextUp.scenario.description,
            attempts: nextUp.scenario.stats.attempts,
          }
        : null,
    };
  },
});

/**
 * Everything the pre-practice briefing and the practice room need for one
 * scenario, including whether the user may start it right now.
 */
export const scenarioForPractice = query({
  args: { scenarioId: v.string() },
  handler: async (ctx, args) => {
    const scenario = await ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.scenarioId))
      .unique();

    if (!scenario) {
      return null;
    }

    const learningModule = await ctx.db
      .query("modules")
      .withIndex("by_public_id", (q) => q.eq("id", scenario.moduleId))
      .unique();

    if (!learningModule) {
      return null;
    }

    const identity = await ctx.auth.getUserIdentity();
    const user = identity
      ? await getUserByClerkId(ctx, getClerkIdFromIdentity(identity))
      : null;

    if (!canPractiseCourse(user, learningModule, await getListing(ctx, learningModule.id))) {
      return null;
    }
    const entitlement = user ? await getEntitlement(ctx, user) : null;
    const access = getScenarioAccess(
      entitlement ?? { premiumAccess: false },
      learningModule,
      scenario,
    );
    const normalized = normalizeScenario(scenario);
    const [agentAAvatar, agentBAvatar] = await Promise.all([
      avatarUrl(ctx, normalized.aiAgentA),
      normalized.aiAgentB ? avatarUrl(ctx, normalized.aiAgentB) : undefined,
    ]);

    return {
      scenario: {
        ...normalized,
        aiAgentA: { ...normalized.aiAgentA, avatarImageUrl: agentAAvatar },
        aiAgentB: normalized.aiAgentB
          ? { ...normalized.aiAgentB, avatarImageUrl: agentBAvatar }
          : undefined,
      },
      module: {
        id: learningModule.id,
        title: learningModule.title,
        isFree: learningModule.isFree,
      },
      access: {
        allowed: access.allowed,
        reason: access.reason,
        remainingMinutes: entitlement?.remainingMinutes ?? 0,
        plan: entitlement?.plan ?? "free",
      },
    };
  },
});
