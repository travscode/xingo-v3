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

// Creator payouts (D-031, D-041): 23:30 UTC on the 1st ≈ 9:30–10:30am on the 2nd in Sydney.
crons.monthly("pay creators", { day: 1, hourUTC: 23, minuteUTC: 30 }, internal.connect.monthlyPayouts, {});

export default crons;
