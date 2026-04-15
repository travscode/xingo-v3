import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";

const difficultyLevel = v.union(
  v.literal("beginner"),
  v.literal("intermediate"),
  v.literal("advanced"),
);

const industryCategory = v.union(
  v.literal("medical"),
  v.literal("legal"),
  v.literal("immigration"),
  v.literal("community"),
  v.literal("business"),
);

const moduleFields = {
  title: v.string(),
  description: v.string(),
  industryCategory,
  durationMinutes: v.number(),
  difficultyLevel,
  learningObjectives: v.array(v.string()),
  isFree: v.boolean(),
  isAccredited: v.boolean(),
  accreditationProvider: v.optional(v.string()),
  badgeIcon: v.string(),
} as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function requirePlatformAdmin(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Not authenticated");
  }

  const clerkId = identity.subject ?? identity.tokenIdentifier;
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", clerkId))
    .unique();

  if (!user || user.role !== "platform_admin") {
    throw new Error("Not authorized");
  }

  return user;
}

async function ensureUniqueId(ctx: MutationCtx, base: string, currentId?: string) {
  const initial = slugify(base) || "module";

  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? initial : `${initial}-${index + 1}`;
    const existing = await ctx.db
      .query("modules")
      .withIndex("by_public_id", (q) => q.eq("id", candidate))
      .unique();

    if (!existing || existing.id === currentId) {
      return candidate;
    }
  }

  throw new Error("Could not generate a unique module id");
}

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

export const createAdmin = mutation({
  args: moduleFields,
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);

    const id = await ensureUniqueId(ctx, args.title);
    const createdAt = new Date().toISOString();

    const doc = {
      id,
      ...args,
      learningObjectives: args.learningObjectives.filter(Boolean),
      accreditationProvider: args.isAccredited ? args.accreditationProvider : undefined,
      createdAt,
    };

    const insertedId = await ctx.db.insert("modules", doc);
    return { _id: insertedId, id };
  },
});

export const updateAdmin = mutation({
  args: {
    id: v.string(),
    ...moduleFields,
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);

    const existing = await ctx.db
      .query("modules")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!existing) {
      throw new Error("Module not found");
    }

    await ctx.db.patch(existing._id, {
      title: args.title,
      description: args.description,
      industryCategory: args.industryCategory,
      durationMinutes: args.durationMinutes,
      difficultyLevel: args.difficultyLevel,
      learningObjectives: args.learningObjectives.filter(Boolean),
      isFree: args.isFree,
      isAccredited: args.isAccredited,
      accreditationProvider: args.isAccredited ? args.accreditationProvider : undefined,
      badgeIcon: args.badgeIcon,
    });

    return { ok: true };
  },
});
