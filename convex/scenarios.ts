import { v } from "convex/values";
import { query } from "./_generated/server";

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("scenarios")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();
  },
});

export const listByModule = query({
  args: { moduleId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});
