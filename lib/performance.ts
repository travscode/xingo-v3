import type { PracticeSession } from "@/types/session";

type ModuleLike = {
  id: string;
  title: string;
  industryCategory: string;
};

export type PerformanceBadge = {
  id: string;
  label: string;
  description: string;
};

export function getCompletedSessions(sessions: PracticeSession[]) {
  return sessions.filter((session) => session.completionStatus !== "in_progress");
}

export function getScenarioScoreSummary(sessions: PracticeSession[]) {
  const completed = getCompletedSessions(sessions);

  if (completed.length === 0) {
    return {
      attempts: 0,
      averageScore: 0,
      bestScore: 0,
      latestScore: 0,
    };
  }

  return {
    attempts: completed.length,
    averageScore: Math.round(
      completed.reduce((sum, session) => sum + session.score, 0) / completed.length,
    ),
    bestScore: Math.max(...completed.map((session) => session.score)),
    latestScore: completed[0]?.score ?? 0,
  };
}

export function getTopIndustry(modules: ModuleLike[], sessions: PracticeSession[]) {
  const completed = getCompletedSessions(sessions);
  const counts = new Map<string, number>();

  for (const session of completed) {
    const matchedModule = modules.find((item) => item.id === session.moduleId);
    if (!matchedModule) {
      continue;
    }

    counts.set(matchedModule.industryCategory, (counts.get(matchedModule.industryCategory) ?? 0) + 1);
  }

  const top = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return top ? top[0] : null;
}

export function getPerformanceBadges(modules: ModuleLike[], sessions: PracticeSession[]) {
  const completed = getCompletedSessions(sessions);
  const average =
    completed.length > 0
      ? completed.reduce((sum, session) => sum + session.score, 0) / completed.length
      : 0;
  const passedModules = new Set(completed.filter((session) => session.score >= 75).map((session) => session.moduleId));
  const topIndustry = getTopIndustry(modules, completed);

  const badges: PerformanceBadge[] = [];

  if (average >= 85) {
    badges.push({
      id: "precision",
      label: "Precision",
      description: "Average score above 85 across completed sessions.",
    });
  }

  if (completed.length >= 3) {
    badges.push({
      id: "consistency",
      label: "Consistency",
      description: "Three or more completed practice attempts recorded.",
    });
  }

  if (passedModules.size >= 2) {
    badges.push({
      id: "credential-track",
      label: "Credential Track",
      description: "Passed work across multiple modules.",
    });
  }

  if (completed.some((session) => session.score >= 90)) {
    badges.push({
      id: "distinction",
      label: "Distinction",
      description: "At least one assessment scored 90 or above.",
    });
  }

  if (topIndustry) {
    badges.push({
      id: `sector-${topIndustry}`,
      label: `${topIndustry[0].toUpperCase()}${topIndustry.slice(1)} Focus`,
      description: `Most completed work is in ${topIndustry}.`,
    });
  }

  return badges;
}
