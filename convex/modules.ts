import { v } from "convex/values";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const modules = await ctx.db.query("modules").collect();
    return modules.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },
});

export const getById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("modules")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();
  },
});
