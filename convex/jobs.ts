import { query } from "./_generated/server";

export const listVisible = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkId = identity?.subject ?? identity?.tokenIdentifier;
    const jobs = await ctx.db.query("jobs").collect();

    return jobs.filter(
      (job) => job.status === "open" || (clerkId ? job.assignedInterpreterClerkId === clerkId : false),
    );
  },
});
