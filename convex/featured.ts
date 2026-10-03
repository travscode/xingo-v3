import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requirePlatformAdmin } from "./model/auth";
import { isSafeFeatureLink } from "../lib/orgs";

/** Up to three admin-picked banners at the top of the marketplace (D-039). */

export const FEATURED_SLOTS = [1, 2, 3] as const;

export const list = query({
  args: {},
  handler: async (ctx) => {
    const slots = await ctx.db.query("featuredSlots").withIndex("by_position").collect();
    return Promise.all(
      slots
        .filter((slot) => slot.active)
        .map(async (slot) => ({
          position: slot.position,
          title: slot.title,
          subtitle: slot.subtitle ?? null,
          linkUrl: slot.linkUrl,
          imageUrl: slot.imageStorageId ? await ctx.storage.getUrl(slot.imageStorageId) : null,
        })),
    );
  },
});

export const adminList = query({
  args: {},
  handler: async (ctx) => {
    await requirePlatformAdmin(ctx);
    const slots = await ctx.db.query("featuredSlots").withIndex("by_position").collect();
    return Promise.all(
      FEATURED_SLOTS.map(async (position) => {
        const slot = slots.find((item) => item.position === position);
        return {
          position,
          title: slot?.title ?? "",
          subtitle: slot?.subtitle ?? "",
          linkUrl: slot?.linkUrl ?? "",
          active: slot?.active ?? false,
          imageStorageId: slot?.imageStorageId ?? null,
          imageUrl: slot?.imageStorageId ? await ctx.storage.getUrl(slot.imageStorageId) : null,
          updatedAt: slot?.updatedAt ?? null,
        };
      }),
    );
  },
});

export const save = mutation({
  args: {
    position: v.number(),
    title: v.string(),
    subtitle: v.optional(v.string()),
    linkUrl: v.string(),
    active: v.boolean(),
    imageStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    await requirePlatformAdmin(ctx);
    if (!FEATURED_SLOTS.includes(args.position as 1 | 2 | 3)) throw new ConvexError("FEATURE_INVALID");
    const title = args.title.trim().slice(0, 80);
    const linkUrl = args.linkUrl.trim();
    if (args.active && (!title || !isSafeFeatureLink(linkUrl))) throw new ConvexError("FEATURE_INVALID");

    const existing = await ctx.db
      .query("featuredSlots")
      .withIndex("by_position", (q) => q.eq("position", args.position))
      .unique();
    const fields = {
      title,
      subtitle: args.subtitle?.trim().slice(0, 140) || undefined,
      linkUrl,
      active: args.active,
      ...(args.imageStorageId !== undefined ? { imageStorageId: args.imageStorageId ?? undefined } : {}),
      updatedAt: new Date().toISOString(),
    };
    if (existing) await ctx.db.patch(existing._id, fields);
    else await ctx.db.insert("featuredSlots", { position: args.position, ...fields });
  },
});
