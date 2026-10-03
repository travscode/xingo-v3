import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "close stale practice attempts",
  { minutes: 2 },
  internal.practice.sweepStaleAttempts,
  {},
);

// 23:07 UTC ≈ 9–10am in Sydney: the day's onboarding emails (D-037).
crons.daily("send onboarding emails", { hourUTC: 23, minuteUTC: 7 }, internal.onboarding.dispatch, {});

export default crons;
