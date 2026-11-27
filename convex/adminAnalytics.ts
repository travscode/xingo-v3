import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query, type QueryCtx } from "./_generated/server";
import { requirePlatformAdmin } from "./model/auth";
import { estimateCostUsd } from "../lib/costs";
import { getGoal } from "../lib/goals";
import { heardAboutLabel } from "../lib/heard-about";
import { formatLanguageName } from "../lib/languages";
import { isPackId, packs } from "../lib/plans";
import { analyticsWindow, bucketKey, localHour, localWeekday, percentChange, type AnalyticsRange } from "../lib/admin-analytics";

/**
 * Admin Analytics tab (D-057): how XINGO is being used over time.
 * Reads raw tables, bounded by `_creationTime` to the range plus the period before it.
 * Admin accounts are left out unless `includeAdmins`.
 */

export const analyticsRange = v.union(v.literal("30d"), v.literal("90d"), v.literal("12m"), v.literal("all"));

const DAY_MS = 86_400_000;

const endReasonLabels: Record<string, string> = {
  objective_met: "Conversation completed",
  learner_finished: "Learner pressed Finish",
  time_up: "Time ran out",
  stalled: "Stalled (no one speaking)",
  out_of_minutes: "Ran out of minutes",
};

/** Rows created at or after `sinceIso` (with a day's slack), or every row when null. */
function since<T extends "sessions" | "aiUsageEvents" | "usageCharges">(ctx: QueryCtx, table: T, sinceIso: string | null) {
  const from = sinceIso ? Date.parse(sinceIso) - DAY_MS : 0;
  return ctx.db
    .query(table)
    .withIndex("by_creation_time", (q) => q.gte("_creationTime", from as never))
    .collect() as Promise<Doc<T>[]>;
}

function isGraded(session: Doc<"sessions">) {
  return session.completionStatus === "completed" || session.completionStatus === "needs_review";
}

function top<T>(map: Map<string, T>, score: (value: T) => number, limit: number) {
  return [...map.entries()].sort((a, b) => score(b[1]) - score(a[1])).slice(0, limit);
}

export const dashboard = query({
  args: { range: analyticsRange, includeAdmins: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    const now = Date.now();

    const allUsers = await ctx.db.query("users").collect();
    const admins = new Set(allUsers.filter((u) => u.role === "platform_admin").map((u) => u.clerkId));
    const counts = (clerkId: string) => args.includeAdmins || !admins.has(clerkId);
    const users = allUsers.filter((u) => counts(u.clerkId));

    const firstAt = users.reduce<string | null>((min, u) => (!min || u.createdAt < min ? u.createdAt : min), null);
    const window = analyticsWindow(args.range as AnalyticsRange, now, firstAt);
    const readFrom = window.previousStart ?? (args.range === "all" ? null : window.start);

    const [rawSessions, rawEvents, rawCharges, grants, modules, scenarios] = await Promise.all([
      since(ctx, "sessions", readFrom),
      since(ctx, "aiUsageEvents", readFrom),
      since(ctx, "usageCharges", readFrom),
      ctx.db.query("minuteGrants").collect(),
      ctx.db.query("modules").collect(),
      ctx.db.query("scenarios").collect(),
    ]);

    const sessionAt = (s: Doc<"sessions">) => s.startedAt ?? s.timestamp;
    const allSessions = rawSessions.filter((s) => !s.id.startsWith("sess_") && counts(s.clerkId));
    const allEvents = rawEvents.filter((e) => counts(e.clerkId));
    const allCharges = rawCharges.filter((c) => counts(c.clerkId));
    const packGrants = grants.filter((g) => g.source === "pack" && counts(g.clerkId));

    const inRange = (at: string) => at >= window.start;
    const inPrevious = (at: string) => window.previousStart !== null && at >= window.previousStart && at < window.start;

    const sessions = allSessions.filter((s) => inRange(sessionAt(s)));
    const events = allEvents.filter((e) => inRange(e.createdAt));
    const charges = allCharges.filter((c) => inRange(c.createdAt));
    const signups = users.filter((u) => inRange(u.createdAt));

    // ---- Series, one value per bucket ----
    const index = new Map(window.keys.map((key, i) => [key, i]));
    const zeros = () => window.keys.map(() => 0);
    const slot = (at: string) => index.get(bucketKey(at, window.granularity));
    const add = (values: number[], at: string, amount = 1) => {
      const i = slot(at);
      if (i !== undefined) values[i] += amount;
    };

    const series = {
      signups: zeros(),
      onboarded: zeros(),
      totalUsers: zeros(),
      activeLearners: zeros(),
      newLearners: zeros(),
      sessions: zeros(),
      graded: zeros(),
      notGraded: zeros(),
      minutes: zeros(),
      costUsd: zeros(),
      voiceCostUsd: zeros(),
      gradingCostUsd: zeros(),
      packSales: zeros(),
      packRevenueCents: zeros(),
      averageScore: window.keys.map(() => null as number | null),
    };

    for (const u of signups) add(series.signups, u.createdAt);
    for (const u of users) if (u.onboardedAt && inRange(u.onboardedAt)) add(series.onboarded, u.onboardedAt);

    // Running total of accounts at the end of each bucket.
    const beforeRange = users.filter((u) => u.createdAt < window.start).length;
    let running = beforeRange;
    series.signups.forEach((n, i) => {
      running += n;
      series.totalUsers[i] = running;
    });

    // First session ever per learner, to tell new learners from returning ones.
    // Sessions older than what was read can't be seen, so "new" is only exact for "all".
    const firstSessionAt = new Map<string, string>();
    for (const s of allSessions) {
      const at = sessionAt(s);
      const seen = firstSessionAt.get(s.clerkId);
      if (!seen || at < seen) firstSessionAt.set(s.clerkId, at);
    }

    const activeByBucket = window.keys.map(() => new Set<string>());
    const scoreSum = zeros();
    const scoreCount = zeros();
    for (const s of sessions) {
      const at = sessionAt(s);
      const i = slot(at);
      if (i === undefined) continue;
      series.sessions[i]++;
      activeByBucket[i].add(s.clerkId);
      if (isGraded(s)) {
        series.graded[i]++;
        scoreSum[i] += s.score;
        scoreCount[i]++;
      } else {
        series.notGraded[i]++;
      }
    }
    activeByBucket.forEach((set, i) => (series.activeLearners[i] = set.size));
    series.averageScore = scoreCount.map((n, i) => (n ? Math.round(scoreSum[i] / n) : null));
    for (const at of firstSessionAt.values()) if (inRange(at)) add(series.newLearners, at);

    for (const c of charges) add(series.minutes, c.createdAt, c.minutes);

    let voiceCost = 0;
    let gradingCost = 0;
    for (const e of events) {
      const cost = estimateCostUsd(e.source, e.promptTokens, e.completionTokens);
      add(series.costUsd, e.createdAt, cost);
      if (e.source === "realtime") {
        add(series.voiceCostUsd, e.createdAt, cost);
        voiceCost += cost;
      } else {
        add(series.gradingCostUsd, e.createdAt, cost);
        gradingCost += cost;
      }
    }

    const packPrice = (g: Doc<"minuteGrants">) => (g.packId && isPackId(g.packId) ? packs[g.packId].priceCents : 0);
    for (const g of packGrants) {
      if (!inRange(g.createdAt)) continue;
      add(series.packSales, g.createdAt);
      add(series.packRevenueCents, g.createdAt, packPrice(g));
    }

    // ---- Headline numbers, with the period before for comparison ----
    const summarise = (pick: (at: string) => boolean) => {
      const ss = allSessions.filter((s) => pick(sessionAt(s)));
      const graded = ss.filter(isGraded);
      const minutes = allCharges.filter((c) => pick(c.createdAt)).reduce((sum, c) => sum + c.minutes, 0);
      const cost = allEvents
        .filter((e) => pick(e.createdAt))
        .reduce((sum, e) => sum + estimateCostUsd(e.source, e.promptTokens, e.completionTokens), 0);
      return {
        signups: users.filter((u) => pick(u.createdAt)).length,
        activeLearners: new Set(ss.map((s) => s.clerkId)).size,
        sessions: ss.length,
        gradedRate: ss.length ? Math.round((graded.length / ss.length) * 100) : 0,
        averageScore: graded.length ? Math.round(graded.reduce((sum, s) => sum + s.score, 0) / graded.length) : 0,
        minutes,
        costUsd: cost,
        costPerMinuteUsd: minutes ? cost / minutes : 0,
        packSales: packGrants.filter((g) => pick(g.createdAt)).length,
        packRevenueCents: packGrants.filter((g) => pick(g.createdAt)).reduce((sum, g) => sum + packPrice(g), 0),
      };
    };
    const current = summarise(inRange);
    const previous = window.previousStart ? summarise(inPrevious) : null;
    const change = Object.fromEntries(
      Object.entries(current).map(([key, value]) => [key, percentChange(value, previous?.[key as keyof typeof current])]),
    ) as Record<keyof typeof current, number | null>;

    // ---- Funnel: people who signed up in the range ----
    const learnerSessions = new Map<string, Doc<"sessions">[]>();
    for (const s of allSessions) {
      const list = learnerSessions.get(s.clerkId) ?? [];
      list.push(s);
      learnerSessions.set(s.clerkId, list);
    }
    const packBuyers = new Set(packGrants.map((g) => g.clerkId));
    const days = (list: Doc<"sessions">[]) => new Set(list.map((s) => bucketKey(sessionAt(s), "day"))).size;
    const cohort = signups;
    const funnel = [
      { label: "Signed up", count: cohort.length },
      { label: "Finished onboarding", count: cohort.filter((u) => u.onboardedAt).length },
      { label: "Started a session", count: cohort.filter((u) => learnerSessions.has(u.clerkId)).length },
      { label: "Got a score", count: cohort.filter((u) => (learnerSessions.get(u.clerkId) ?? []).some(isGraded)).length },
      { label: "Came back another day", count: cohort.filter((u) => days(learnerSessions.get(u.clerkId) ?? []) >= 2).length },
      {
        label: "Paid (pack or Pro)",
        count: cohort.filter((u) => packBuyers.has(u.clerkId) || u.subscriptionStatus === "professional").length,
      },
    ];

    // ---- How often learners come back (sessions in range) ----
    const rangeByLearner = new Map<string, Doc<"sessions">[]>();
    for (const s of sessions) {
      const list = rangeByLearner.get(s.clerkId) ?? [];
      list.push(s);
      rangeByLearner.set(s.clerkId, list);
    }
    const frequencyBands = [
      { label: "1 day", min: 1, max: 1 },
      { label: "2–3 days", min: 2, max: 3 },
      { label: "4–7 days", min: 4, max: 7 },
      { label: "8+ days", min: 8, max: Infinity },
    ];
    const frequency = frequencyBands.map((band) => ({
      label: band.label,
      count: [...rangeByLearner.values()].filter((list) => {
        const d = days(list);
        return d >= band.min && d <= band.max;
      }).length,
    }));

    // ---- What they practise ----
    const moduleTitle = new Map(modules.map((m) => [m.id, m.title]));
    const scenarioInfo = new Map(scenarios.map((s) => [s.id, { title: s.title, moduleId: s.moduleId }]));
    type Usage = { sessions: number; minutes: number; learners: Set<string>; graded: number; scoreSum: number };
    const usage = () => ({ sessions: 0, minutes: 0, learners: new Set<string>(), graded: 0, scoreSum: 0 });
    const byCourse = new Map<string, Usage>();
    const byScenario = new Map<string, Usage>();
    const byPair = new Map<string, number>();
    const byMode = new Map<string, number>();
    const byEnd = new Map<string, number>();
    const byHour = Array.from({ length: 24 }, () => 0);
    const byWeekday = Array.from({ length: 7 }, () => 0);
    const minutesFor = (s: Doc<"sessions">) => s.chargedMinutes ?? Math.ceil((s.durationSeconds ?? 0) / 60);

    for (const s of sessions) {
      for (const [map, key] of [
        [byCourse, s.moduleId],
        [byScenario, s.scenarioId],
      ] as const) {
        const row = map.get(key) ?? usage();
        row.sessions++;
        row.minutes += minutesFor(s);
        row.learners.add(s.clerkId);
        if (isGraded(s)) {
          row.graded++;
          row.scoreSum += s.score;
        }
        map.set(key, row);
      }
      if (s.sourceLanguage && s.targetLanguage) {
        const pair = `${formatLanguageName(s.sourceLanguage)} ↔ ${formatLanguageName(s.targetLanguage)}`;
        byPair.set(pair, (byPair.get(pair) ?? 0) + 1);
      }
      const mode = s.mode === "practice" ? "Practice (transcript shown)" : "Assessed (scored)";
      byMode.set(mode, (byMode.get(mode) ?? 0) + 1);
      const end = s.endReason ? endReasonLabels[s.endReason] : s.completionStatus === "abandoned" ? "Left the room" : "Not recorded";
      byEnd.set(end, (byEnd.get(end) ?? 0) + 1);
      const at = sessionAt(s);
      byHour[localHour(at)]++;
      byWeekday[localWeekday(at)]++;
    }

    const usageRow = (title: string, row: Usage) => ({
      title,
      sessions: row.sessions,
      minutes: row.minutes,
      learners: row.learners.size,
      averageScore: row.graded ? Math.round(row.scoreSum / row.graded) : null,
    });
    const counted = (map: Map<string, number>, limit = 8) =>
      top(map, (n) => n, limit).map(([label, count]) => ({ label, count }));

    // ---- Who signs up ----
    const tally = (pick: (u: Doc<"users">) => string | undefined, fallback: string) => {
      const map = new Map<string, number>();
      for (const u of signups) {
        const key = pick(u) ?? fallback;
        map.set(key, (map.get(key) ?? 0) + 1);
      }
      return counted(map, 10);
    };

    // ---- Money: top spenders of AI cost, cost per active learner ----
    const costByLearner = new Map<string, number>();
    for (const e of events) {
      costByLearner.set(e.clerkId, (costByLearner.get(e.clerkId) ?? 0) + estimateCostUsd(e.source, e.promptTokens, e.completionTokens));
    }
    const userById = new Map(allUsers.map((u) => [u.clerkId, u]));

    return {
      range: args.range,
      granularity: window.granularity,
      keys: window.keys,
      hasPrevious: previous !== null,
      series,
      current,
      previous,
      change,
      totals: {
        users: users.length,
        onboarded: users.filter((u) => u.onboardedAt).length,
        pro: users.filter((u) => u.subscriptionStatus === "professional").length,
        packBuyers: new Set(packGrants.map((g) => g.clerkId)).size,
        excludedAdmins: args.includeAdmins ? 0 : admins.size,
      },
      cost: {
        voiceUsd: voiceCost,
        gradingUsd: gradingCost,
        perActiveLearnerUsd: current.activeLearners ? (voiceCost + gradingCost) / current.activeLearners : 0,
        perSessionUsd: current.sessions ? (voiceCost + gradingCost) / current.sessions : 0,
        topLearners: top(costByLearner, (n) => n, 5).map(([clerkId, costUsd]) => ({
          name: userById.get(clerkId)?.name || userById.get(clerkId)?.email || "Unknown",
          costUsd,
          sessions: rangeByLearner.get(clerkId)?.length ?? 0,
        })),
      },
      funnel,
      frequency,
      courses: top(byCourse, (r) => r.minutes * 1000 + r.sessions, 8).map(([id, row]) =>
        usageRow(moduleTitle.get(id) ?? id, row),
      ),
      scenarios: top(byScenario, (r) => r.sessions * 1000 + r.minutes, 10).map(([id, row]) =>
        usageRow(scenarioInfo.get(id)?.title ?? id, row),
      ),
      languagePairs: counted(byPair),
      modes: counted(byMode),
      endReasons: counted(byEnd),
      byHour,
      byWeekday,
      signupsBy: {
        heardAbout: tally((u) => (u.heardAbout ? heardAboutLabel(u.heardAbout) : undefined), "Not answered"),
        goal: tally((u) => (u.practiceGoal ? (getGoal(u.practiceGoal)?.label ?? u.practiceGoal) : undefined), "Not set"),
      },
    };
  },
});
