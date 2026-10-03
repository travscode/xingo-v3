import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, query, type MutationCtx, type QueryCtx } from "./_generated/server";
import { getClerkIdFromIdentity, getUserByClerkId, requireUser } from "./model/auth";
import { queueEmail } from "./model/notify";
import {
  activateInvite,
  addCollectionToLibrary,
  getMembership,
  getOrg,
  getProfile,
  hasCourseAccess,
  newToken,
  orgMinutesUsed,
  requireOrgRole,
  syncCourseVisibility,
} from "./model/orgs";
import { listingCard } from "./marketplace";
import { siteUrlFromEnv } from "./emails";
import { slugify } from "../lib/marketplace";
import {
  canManageOrg,
  handleProblem,
  MAX_INVITES_PER_BATCH,
  normaliseEmail,
  normaliseHandle,
  ORG_ROLE_LABELS,
  type OrgRole,
} from "../lib/orgs";

/**
 * Organisations on the marketplace (D-039): self-serve creation, a team, collections
 * of courses that are public or invite only, email invites, access requests and an
 * admin-set minute pool. Pages: /<handle> (public), /<handle>/<collection>,
 * /marketplace/org/<handle> (dashboard), /join/<token> (invitations).
 */

type Ctx = QueryCtx | MutationCtx;

const MAX_ORGS_PER_USER = 5;
const MAX_COLLECTION_COURSES = 50;

const clip = (value: string | undefined, max: number) => (value ?? "").trim().slice(0, max);

async function optionalUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  return identity ? getUserByClerkId(ctx, getClerkIdFromIdentity(identity)) : null;
}

async function storageUrl(ctx: Ctx, id: Id<"_storage"> | undefined) {
  return id ? ctx.storage.getUrl(id) : null;
}

function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}${"•".repeat(Math.max(1, Math.min(6, name.length - 1)))}@${domain}`;
}

async function orgCollections(ctx: Ctx, orgHandle: string) {
  return ctx.db
    .query("orgCollections")
    .withIndex("by_org", (q) => q.eq("orgHandle", orgHandle))
    .collect();
}

async function orgListings(ctx: Ctx, orgHandle: string) {
  const listings = await ctx.db
    .query("courseListings")
    .withIndex("by_creatorHandle", (q) => q.eq("creatorHandle", orgHandle))
    .collect();
  return listings.filter((listing) => listing.orgHandle === orgHandle);
}

async function scenarioCount(ctx: Ctx, moduleId: string) {
  return (
    await ctx.db
      .query("scenarios")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .collect()
  ).length;
}

async function managers(ctx: Ctx, orgHandle: string) {
  const members = await ctx.db
    .query("orgMembers")
    .withIndex("by_org", (q) => q.eq("orgHandle", orgHandle))
    .collect();
  return members.filter((member) => canManageOrg(member.role));
}

async function requireCollection(ctx: Ctx, collectionId: Id<"orgCollections">, need: "member" | "manager" = "member") {
  const collection = await ctx.db.get(collectionId);
  if (!collection) throw new ConvexError("ORG_NOT_FOUND");
  const auth = await requireOrgRole(ctx, collection.orgHandle, need);
  return { ...auth, collection };
}

/** Removes restricted courses from a learner's library once they've lost access to them. */
async function pruneLibrary(ctx: MutationCtx, clerkId: string, moduleIds: string[]) {
  const user = await getUserByClerkId(ctx, clerkId);
  for (const moduleId of moduleIds) {
    const listing = await ctx.db
      .query("courseListings")
      .withIndex("by_moduleId", (q) => q.eq("moduleId", moduleId))
      .unique();
    if (!listing?.restricted || (await hasCourseAccess(ctx, user, listing))) continue;
    const item = await ctx.db
      .query("libraryItems")
      .withIndex("by_clerk_module", (q) => q.eq("clerkId", clerkId).eq("moduleId", moduleId))
      .unique();
    if (item) {
      await ctx.db.delete(item._id);
      await ctx.db.patch(listing._id, { addCount: Math.max(0, listing.addCount - 1) });
    }
  }
}

// ---- Public ------------------------------------------------------------------------------

/**
 * xingo.ai/<handle>. Organisations get their page with collections; for a person's
 * handle this returns `{ kind: "person" }` and the page shows their creator profile.
 */
export const page = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const profile = await getProfile(ctx, normaliseHandle(args.handle));
    if (!profile) return null;
    if (profile.kind !== "organization") return { kind: "person" as const, handle: profile.handle };

    const viewer = await optionalUser(ctx);
    const membership = viewer ? await getMembership(ctx, profile.handle, viewer.clerkId) : null;
    const isPlatformAdmin = viewer?.role === "platform_admin";
    const isTeam = Boolean(membership) || isPlatformAdmin;

    const viewerRows = viewer
      ? [
          ...(await ctx.db
            .query("orgInvites")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", viewer.clerkId))
            .collect()),
          ...(await ctx.db
            .query("orgInvites")
            .withIndex("by_email", (q) => q.eq("email", normaliseEmail(viewer.email)))
            .collect()),
        ].filter((row) => row.orgHandle === profile.handle && row.collectionId)
      : [];
    const statusFor = (collectionId: Id<"orgCollections">) => {
      const rows = viewerRows.filter((row) => row.collectionId === collectionId);
      for (const status of ["active", "invited", "requested", "declined"] as const) {
        if (rows.some((row) => row.status === status)) return status;
      }
      return "none" as const;
    };

    const added = viewer
      ? new Set(
          (
            await ctx.db
              .query("libraryItems")
              .withIndex("by_clerkId", (q) => q.eq("clerkId", viewer.clerkId))
              .collect()
          ).map((item) => item.moduleId),
        )
      : new Set<string>();

    const listings = new Map((await orgListings(ctx, profile.handle)).map((listing) => [listing.moduleId, listing]));
    const collections = [];
    for (const collection of (await orgCollections(ctx, profile.handle)).sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
      const published = collection.moduleIds
        .map((moduleId) => listings.get(moduleId))
        .filter((listing): listing is Doc<"courseListings"> => listing?.status === "published");
      if (published.length === 0 && !isTeam) continue;
      const access = isTeam ? ("team" as const) : collection.visibility === "public" ? ("public" as const) : statusFor(collection._id);
      const canSee = access === "team" || access === "public" || access === "active";
      collections.push({
        id: collection._id,
        slug: collection.slug,
        title: collection.title,
        description: collection.description,
        visibility: collection.visibility,
        bannerUrl: await storageUrl(ctx, collection.bannerStorageId),
        courseCount: published.length,
        access,
        courses: canSee
          ? await Promise.all(
              published.map(async (listing) => ({
                ...(await listingCard(ctx, listing, await scenarioCount(ctx, listing.moduleId))),
                inLibrary: added.has(listing.moduleId),
                isOwner: false,
              })),
            )
          : [],
      });
    }

    return {
      kind: "organization" as const,
      handle: profile.handle,
      displayName: profile.displayName,
      tagline: profile.tagline,
      bio: profile.bio,
      location: profile.location ?? null,
      accent: profile.accent,
      verified: Boolean(profile.verifiedAt),
      avatarUrl: await storageUrl(ctx, profile.avatarStorageId),
      bannerUrl: await storageUrl(ctx, profile.bannerStorageId),
      viewer: {
        signedIn: Boolean(viewer),
        teamRole: (membership?.role ?? (isPlatformAdmin ? "owner" : null)) as OrgRole | null,
      },
      collections,
    };
  },
});

/** What an invitation link is for, shown on /join/<token> before accepting. */
export const invitation = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const invite = await ctx.db
      .query("orgInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite) return null;
    const org = await getOrg(ctx, invite.orgHandle);
    if (!org) return null;
    const collection = invite.collectionId ? await ctx.db.get(invite.collectionId) : null;
    const viewer = await optionalUser(ctx);
    return {
      orgHandle: org.handle,
      orgName: org.displayName,
      verified: Boolean(org.verifiedAt),
      avatarUrl: await storageUrl(ctx, org.avatarStorageId),
      kind: invite.collectionId ? ("collection" as const) : ("team" as const),
      collectionTitle: collection?.title ?? null,
      collectionSlug: collection?.slug ?? null,
      collectionDescription: collection?.description ?? null,
      role: invite.memberRole ? ORG_ROLE_LABELS[invite.memberRole] : null,
      status: invite.status,
      sentTo: maskEmail(invite.email),
      signedIn: Boolean(viewer),
      acceptedByViewer: Boolean(viewer && invite.clerkId === viewer.clerkId && invite.status === "active"),
    };
  },
});

/** Accepts an invitation link for the signed-in user. */
export const acceptInvitation = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const invite = await ctx.db
      .query("orgInvites")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (!invite || invite.status === "revoked" || invite.status === "declined") throw new ConvexError("ORG_INVITE_INVALID");
    if (invite.status === "active" && invite.clerkId && invite.clerkId !== user.clerkId) throw new ConvexError("ORG_INVITE_INVALID");
    if (invite.status !== "active") await activateInvite(ctx, invite, user.clerkId);
    const collection = invite.collectionId ? await ctx.db.get(invite.collectionId) : null;
    return { orgHandle: invite.orgHandle, collectionSlug: collection?.slug ?? null, team: !invite.collectionId };
  },
});

/** Asks an organisation for access to an invite-only collection. */
export const requestAccess = mutation({
  args: { collectionId: v.id("orgCollections"), note: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const collection = await ctx.db.get(args.collectionId);
    if (!collection || collection.visibility !== "invite") throw new ConvexError("ORG_NOT_FOUND");
    const org = await getOrg(ctx, collection.orgHandle);
    if (!org) throw new ConvexError("ORG_NOT_FOUND");

    const email = normaliseEmail(user.email);
    const rows = (
      await ctx.db
        .query("orgInvites")
        .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
        .collect()
    ).filter((row) => row.clerkId === user.clerkId || row.email === email);
    const now = new Date().toISOString();

    if (rows.some((row) => row.status === "active")) return { status: "active" as const };
    const invited = rows.find((row) => row.status === "invited");
    if (invited) {
      // Already invited: a verified matching email gets in now; otherwise keep the invitation (the email link still works).
      if (!user.emailVerified) return { status: "invited" as const };
      await activateInvite(ctx, invited, user.clerkId);
      return { status: "active" as const };
    }
    if (rows.some((row) => row.status === "requested")) return { status: "requested" as const };

    const note = clip(args.note, 300) || undefined;
    const existing = rows[0];
    const inviteId = existing
      ? (await ctx.db.patch(existing._id, { status: "requested", clerkId: user.clerkId, note, updatedAt: now }), existing._id)
      : await ctx.db.insert("orgInvites", {
          orgHandle: org.handle,
          collectionId: collection._id,
          email,
          clerkId: user.clerkId,
          status: "requested",
          token: newToken(),
          note,
          createdAt: now,
          updatedAt: now,
        });

    for (const manager of await managers(ctx, org.handle)) {
      await queueEmail(ctx, {
        clerkId: manager.clerkId,
        email: {
          kind: "org_access_requested",
          requesterName: user.name,
          requesterEmail: user.email,
          collectionTitle: collection.title,
          url: `${siteUrlFromEnv()}/marketplace/org/${org.handle}?tab=people&collection=${collection._id}`,
        },
        dedupeKey: `org-request-${inviteId}-${manager.clerkId}-${now.slice(0, 10)}`,
      });
    }
    return { status: "requested" as const };
  },
});

// ---- Creating and belonging --------------------------------------------------------------

/** Self-serve: any signed-in user can create an organisation and becomes its owner. */
export const create = mutation({
  args: { displayName: v.string(), handle: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const displayName = clip(args.displayName, 80);
    const handle = normaliseHandle(args.handle);
    if (!displayName || handleProblem(handle)) throw new ConvexError("HANDLE_INVALID");
    if (await getProfile(ctx, handle)) throw new ConvexError("HANDLE_TAKEN");

    const owned = (
      await ctx.db
        .query("orgMembers")
        .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
        .collect()
    ).filter((member) => member.role === "owner");
    if (owned.length >= MAX_ORGS_PER_USER && user.role !== "platform_admin") throw new ConvexError("ORG_LIMIT");

    const now = new Date().toISOString();
    // No ownerClerkId: org profiles belong to the team, not one person's creator profile.
    await ctx.db.insert("creatorProfiles", {
      handle,
      displayName,
      tagline: "",
      bio: "",
      accent: "#111111",
      isHouse: false,
      kind: "organization",
      createdAt: now,
    });
    await ctx.db.insert("orgMembers", { orgHandle: handle, clerkId: user.clerkId, role: "owner", createdAt: now });
    return { handle };
  },
});

/** Organisation pages and public collections for the sitemap. */
export const publicPages = query({
  args: {},
  handler: async (ctx) => {
    const orgs = (await ctx.db.query("creatorProfiles").collect()).filter((profile) => profile.kind === "organization");
    const pages: Array<{ path: string; updatedAt: string }> = [];
    for (const org of orgs) {
      const collections = (await orgCollections(ctx, org.handle)).filter((collection) => collection.visibility === "public" && collection.moduleIds.length > 0);
      if (collections.length === 0) continue;
      pages.push({ path: `/${org.handle}`, updatedAt: collections.reduce((latest, c) => (c.updatedAt > latest ? c.updatedAt : latest), org.createdAt) });
      for (const collection of collections) pages.push({ path: `/${org.handle}/${collection.slug}`, updatedAt: collection.updatedAt });
    }
    return pages;
  },
});

/** Whether a handle is free, for the create form. */
export const handleAvailable = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const handle = normaliseHandle(args.handle);
    const problem = handleProblem(handle);
    if (problem) return { available: false, problem };
    return (await getProfile(ctx, handle)) ? { available: false, problem: "That name is taken." } : { available: true, problem: null };
  },
});

/** Organisations the signed-in user is on the team of. */
export const mine = query({
  args: {},
  handler: async (ctx) => {
    const user = await optionalUser(ctx);
    if (!user) return [];
    const memberships = await ctx.db
      .query("orgMembers")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", user.clerkId))
      .collect();
    const orgs = await Promise.all(
      memberships.map(async (membership) => {
        const org = await getOrg(ctx, membership.orgHandle);
        return org
          ? {
              handle: org.handle,
              displayName: org.displayName,
              role: membership.role,
              verified: Boolean(org.verifiedAt),
              avatarUrl: await storageUrl(ctx, org.avatarStorageId),
            }
          : null;
      }),
    );
    return orgs.filter((org) => org !== null);
  },
});

// ---- Dashboard -------------------------------------------------------------------------

/** Everything the organisation dashboard needs. Team only. */
export const dashboard = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const { org, role, user } = await requireOrgRole(ctx, args.handle);
    const [members, invites, collections, listings, used] = await Promise.all([
      ctx.db
        .query("orgMembers")
        .withIndex("by_org", (q) => q.eq("orgHandle", org.handle))
        .collect(),
      ctx.db
        .query("orgInvites")
        .withIndex("by_org", (q) => q.eq("orgHandle", org.handle))
        .collect(),
      orgCollections(ctx, org.handle),
      orgListings(ctx, org.handle),
      orgMinutesUsed(ctx, org.handle),
    ]);

    return {
      me: { clerkId: user.clerkId, role },
      org: {
        handle: org.handle,
        displayName: org.displayName,
        tagline: org.tagline,
        bio: org.bio,
        location: org.location ?? "",
        accent: org.accent,
        verified: Boolean(org.verifiedAt),
        avatarUrl: await storageUrl(ctx, org.avatarStorageId),
        bannerUrl: await storageUrl(ctx, org.bannerStorageId),
      },
      pool: {
        monthlyMinutes: org.orgMonthlyMinutes ?? 0,
        usedThisMonth: used,
        remaining: Math.max(0, (org.orgMonthlyMinutes ?? 0) - used),
      },
      members: await Promise.all(
        members.map(async (member) => {
          const person = await getUserByClerkId(ctx, member.clerkId);
          return {
            clerkId: member.clerkId,
            name: person?.name ?? "Unknown",
            email: person?.email ?? "",
            role: member.role,
            createdAt: member.createdAt,
          };
        }),
      ),
      teamInvites: invites
        .filter((invite) => invite.memberRole && invite.status === "invited")
        .map((invite) => ({ id: invite._id, email: invite.email, role: invite.memberRole!, createdAt: invite.createdAt })),
      collections: await Promise.all(
        collections
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .map(async (collection) => {
            const rows = invites.filter((invite) => invite.collectionId === collection._id);
            return {
              id: collection._id,
              slug: collection.slug,
              title: collection.title,
              description: collection.description,
              visibility: collection.visibility,
              moduleIds: collection.moduleIds,
              bannerUrl: await storageUrl(ctx, collection.bannerStorageId),
              counts: {
                active: rows.filter((row) => row.status === "active").length,
                invited: rows.filter((row) => row.status === "invited").length,
                requested: rows.filter((row) => row.status === "requested").length,
              },
            };
          }),
      ),
      requestsWaiting: invites.filter((invite) => invite.collectionId && invite.status === "requested").length,
      courses: await Promise.all(
        listings
          .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
          .map(async (listing) => ({
            moduleId: listing.moduleId,
            slug: listing.slug,
            title: listing.title,
            tagline: listing.tagline,
            status: listing.status,
            restricted: Boolean(listing.restricted),
            scenarioCount: await scenarioCount(ctx, listing.moduleId),
            bannerUrl: await storageUrl(ctx, listing.bannerStorageId),
            practiceCount: listing.practiceCount ?? 0,
            updatedAt: listing.updatedAt,
          })),
      ),
    };
  },
});

/** People invited to, requesting or holding access to a collection. Team only. */
export const collectionPeople = query({
  args: { collectionId: v.id("orgCollections") },
  handler: async (ctx, args) => {
    const { collection } = await requireCollection(ctx, args.collectionId);
    const rows = await ctx.db
      .query("orgInvites")
      .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
      .collect();
    return Promise.all(
      rows
        .filter((row) => row.status !== "revoked")
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .map(async (row) => {
          const person = row.clerkId ? await getUserByClerkId(ctx, row.clerkId) : null;
          return {
            id: row._id,
            email: row.email,
            name: person?.name ?? null,
            status: row.status,
            note: row.note ?? null,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
          };
        }),
    );
  },
});

export const updateProfile = mutation({
  args: {
    handle: v.string(),
    displayName: v.string(),
    tagline: v.string(),
    bio: v.string(),
    location: v.optional(v.string()),
    accent: v.optional(v.string()),
    avatarStorageId: v.optional(v.union(v.id("_storage"), v.null())),
    bannerStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const { org } = await requireOrgRole(ctx, args.handle, "manager");
    const displayName = clip(args.displayName, 80) || org.displayName;
    await ctx.db.patch(org._id, {
      displayName,
      tagline: clip(args.tagline, 140),
      bio: clip(args.bio, 1200),
      location: clip(args.location, 60) || undefined,
      accent: args.accent && /^#[0-9a-f]{6}$/i.test(args.accent) ? args.accent : org.accent,
      ...(args.avatarStorageId !== undefined ? { avatarStorageId: args.avatarStorageId ?? undefined } : {}),
      ...(args.bannerStorageId !== undefined ? { bannerStorageId: args.bannerStorageId ?? undefined } : {}),
    });
    if (displayName !== org.displayName) {
      for (const listing of await orgListings(ctx, org.handle)) await ctx.db.patch(listing._id, { creatorName: displayName });
    }
  },
});

// ---- Team ----------------------------------------------------------------------------

export const inviteTeam = mutation({
  args: { handle: v.string(), emails: v.array(v.string()), role: v.union(v.literal("admin"), v.literal("creator")) },
  handler: async (ctx, args) => {
    const { org, user } = await requireOrgRole(ctx, args.handle, "manager");
    if (args.emails.length > MAX_INVITES_PER_BATCH) throw new ConvexError("ORG_TOO_MANY_INVITES");
    const now = new Date().toISOString();
    let invited = 0;
    let skipped = 0;
    for (const raw of args.emails) {
      const email = normaliseEmail(raw);
      if (!email.includes("@")) {
        skipped++;
        continue;
      }
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();
      if (existingUser && (await getMembership(ctx, org.handle, existingUser.clerkId))) {
        skipped++;
        continue;
      }
      const pending = (
        await ctx.db
          .query("orgInvites")
          .withIndex("by_email", (q) => q.eq("email", email))
          .collect()
      ).find((row) => row.orgHandle === org.handle && row.memberRole && row.status === "invited");
      const token = pending?.token ?? newToken();
      const inviteId = pending
        ? (await ctx.db.patch(pending._id, { memberRole: args.role, updatedAt: now }), pending._id)
        : await ctx.db.insert("orgInvites", {
            orgHandle: org.handle,
            memberRole: args.role,
            email,
            status: "invited",
            token,
            invitedByClerkId: user.clerkId,
            createdAt: now,
            updatedAt: now,
          });
      await queueEmail(ctx, {
        toEmail: email,
        email: {
          kind: "org_team_invite",
          orgName: org.displayName,
          role: ORG_ROLE_LABELS[args.role],
          inviterName: user.name,
          url: `${siteUrlFromEnv()}/join/${token}`,
        },
        dedupeKey: `org-team-${inviteId}-${now}`,
      });
      invited++;
    }
    return { invited, skipped };
  },
});

export const setMemberRole = mutation({
  args: { handle: v.string(), clerkId: v.string(), role: v.union(v.literal("owner"), v.literal("admin"), v.literal("creator")) },
  handler: async (ctx, args) => {
    const { org, role: myRole } = await requireOrgRole(ctx, args.handle, "manager");
    const member = await getMembership(ctx, org.handle, args.clerkId);
    if (!member) throw new ConvexError("ORG_NOT_FOUND");
    if ((args.role === "owner" || member.role === "owner") && myRole !== "owner") throw new ConvexError("ORG_FORBIDDEN");
    if (member.role === "owner" && args.role !== "owner") await requireAnotherOwner(ctx, org.handle, member.clerkId);
    await ctx.db.patch(member._id, { role: args.role });
  },
});

export const removeMember = mutation({
  args: { handle: v.string(), clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const leavingSelf = user.clerkId === args.clerkId;
    const { org, role: myRole } = await requireOrgRole(ctx, args.handle, leavingSelf ? "member" : "manager");
    const member = await getMembership(ctx, org.handle, args.clerkId);
    if (!member) return;
    if (member.role === "owner" && myRole !== "owner" && !leavingSelf) throw new ConvexError("ORG_FORBIDDEN");
    if (member.role === "owner") await requireAnotherOwner(ctx, org.handle, member.clerkId);
    await ctx.db.delete(member._id);
  },
});

async function requireAnotherOwner(ctx: Ctx, orgHandle: string, clerkId: string) {
  const owners = (
    await ctx.db
      .query("orgMembers")
      .withIndex("by_org", (q) => q.eq("orgHandle", orgHandle))
      .collect()
  ).filter((member) => member.role === "owner" && member.clerkId !== clerkId);
  if (owners.length === 0) throw new ConvexError("ORG_LAST_OWNER");
}

// ---- Collections -----------------------------------------------------------------------

async function uniqueCollectionSlug(ctx: MutationCtx, orgHandle: string, title: string, exceptId?: Id<"orgCollections">) {
  const base = slugify(title, 40) || "collection";
  for (let index = 0; index < 100; index += 1) {
    const candidate = index === 0 ? base : `${base}-${index + 1}`;
    const existing = await ctx.db
      .query("orgCollections")
      .withIndex("by_org_slug", (q) => q.eq("orgHandle", orgHandle).eq("slug", candidate))
      .unique();
    if (!existing || existing._id === exceptId) return candidate;
  }
  throw new Error("Could not create a unique collection address");
}

/** Creates or updates a collection and keeps course visibility and learners' libraries in step. */
export const saveCollection = mutation({
  args: {
    handle: v.string(),
    collectionId: v.optional(v.id("orgCollections")),
    title: v.string(),
    description: v.string(),
    visibility: v.union(v.literal("public"), v.literal("invite")),
    moduleIds: v.array(v.string()),
    bannerStorageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    const { org } = await requireOrgRole(ctx, args.handle);
    const title = clip(args.title, 80);
    if (!title) throw new ConvexError("COURSE_INCOMPLETE");

    const own = new Set((await orgListings(ctx, org.handle)).map((listing) => listing.moduleId));
    const moduleIds = [...new Set(args.moduleIds)].filter((id) => own.has(id)).slice(0, MAX_COLLECTION_COURSES);
    const now = new Date().toISOString();
    const existing = args.collectionId ? await ctx.db.get(args.collectionId) : null;
    if (args.collectionId && (!existing || existing.orgHandle !== org.handle)) throw new ConvexError("ORG_NOT_FOUND");

    const fields = {
      title,
      description: clip(args.description, 400),
      visibility: args.visibility,
      moduleIds,
      ...(args.bannerStorageId !== undefined ? { bannerStorageId: args.bannerStorageId ?? undefined } : {}),
      updatedAt: now,
    };
    let collectionId: Id<"orgCollections">;
    if (existing) {
      const slug = existing.title === title ? existing.slug : await uniqueCollectionSlug(ctx, org.handle, title, existing._id);
      await ctx.db.patch(existing._id, { ...fields, slug });
      collectionId = existing._id;
    } else {
      collectionId = await ctx.db.insert("orgCollections", {
        orgHandle: org.handle,
        slug: await uniqueCollectionSlug(ctx, org.handle, title),
        ...fields,
        createdAt: now,
      });
    }

    const before = existing?.moduleIds ?? [];
    for (const moduleId of new Set([...before, ...moduleIds])) await syncCourseVisibility(ctx, org.handle, moduleId);

    // Learners with access get new courses in their library and lose ones they can no longer open.
    const collection = (await ctx.db.get(collectionId))!;
    const removed = before.filter((id) => !moduleIds.includes(id));
    const holders = (
      await ctx.db
        .query("orgInvites")
        .withIndex("by_collection", (q) => q.eq("collectionId", collectionId))
        .collect()
    ).filter((row) => row.status === "active" && row.clerkId);
    for (const holder of holders) {
      await addCollectionToLibrary(ctx, collection, holder.clerkId!);
      if (removed.length) await pruneLibrary(ctx, holder.clerkId!, removed);
    }
    return { collectionId, slug: collection.slug };
  },
});

export const deleteCollection = mutation({
  args: { collectionId: v.id("orgCollections") },
  handler: async (ctx, args) => {
    const { collection } = await requireCollection(ctx, args.collectionId, "manager");
    const rows = await ctx.db
      .query("orgInvites")
      .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
      .collect();
    await ctx.db.delete(collection._id);
    for (const moduleId of collection.moduleIds) await syncCourseVisibility(ctx, collection.orgHandle, moduleId);
    for (const row of rows) {
      await ctx.db.delete(row._id);
      if (row.status === "active" && row.clerkId) await pruneLibrary(ctx, row.clerkId, collection.moduleIds);
    }
  },
});

/** Invites people by email to a collection. They get access once they sign in with that email or open the link. */
export const inviteToCollection = mutation({
  args: { collectionId: v.id("orgCollections"), emails: v.array(v.string()) },
  handler: async (ctx, args) => {
    const { collection, org, user } = await requireCollection(ctx, args.collectionId);
    if (args.emails.length > MAX_INVITES_PER_BATCH) throw new ConvexError("ORG_TOO_MANY_INVITES");
    const rows = await ctx.db
      .query("orgInvites")
      .withIndex("by_collection", (q) => q.eq("collectionId", collection._id))
      .collect();
    const now = new Date().toISOString();
    let invited = 0;
    let alreadyIn = 0;
    let approved = 0;

    for (const raw of new Set(args.emails.map(normaliseEmail))) {
      if (!raw.includes("@")) continue;
      const existing = rows.find((row) => row.email === raw);
      if (existing?.status === "active") {
        alreadyIn++;
        continue;
      }
      if (existing?.status === "requested" && existing.clerkId) {
        // They asked first: inviting them approves the request.
        await activateInvite(ctx, existing, existing.clerkId);
        approved++;
        continue;
      }
      const token = existing?.token ?? newToken();
      const inviteId = existing
        ? (await ctx.db.patch(existing._id, { status: "invited", invitedByClerkId: user.clerkId, updatedAt: now }), existing._id)
        : await ctx.db.insert("orgInvites", {
            orgHandle: org.handle,
            collectionId: collection._id,
            email: raw,
            status: "invited",
            token,
            invitedByClerkId: user.clerkId,
            createdAt: now,
            updatedAt: now,
          });
      await queueEmail(ctx, {
        toEmail: raw,
        email: {
          kind: "org_collection_invite",
          orgName: org.displayName,
          collectionTitle: collection.title,
          inviterName: user.name,
          url: `${siteUrlFromEnv()}/join/${token}`,
        },
        dedupeKey: `org-invite-${inviteId}-${now}`,
      });
      invited++;
    }
    return { invited, alreadyIn, approved };
  },
});

export const respondToRequest = mutation({
  args: { inviteId: v.id("orgInvites"), approve: v.boolean() },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite?.collectionId || invite.status !== "requested" || !invite.clerkId) throw new ConvexError("ORG_INVITE_INVALID");
    const { collection, org } = await requireCollection(ctx, invite.collectionId);
    if (!args.approve) {
      await ctx.db.patch(invite._id, { status: "declined", updatedAt: new Date().toISOString() });
      return;
    }
    await activateInvite(ctx, invite, invite.clerkId);
    await queueEmail(ctx, {
      clerkId: invite.clerkId,
      email: {
        kind: "org_access_approved",
        orgName: org.displayName,
        collectionTitle: collection.title,
        url: `${siteUrlFromEnv()}/${org.handle}/${collection.slug}`,
      },
      dedupeKey: `org-approved-${invite._id}`,
    });
  },
});

/** Withdraws an invitation or removes someone's access (collection) or pending team invite. */
export const revokeInvite = mutation({
  args: { inviteId: v.id("orgInvites") },
  handler: async (ctx, args) => {
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) return;
    await requireOrgRole(ctx, invite.orgHandle, invite.collectionId ? "member" : "manager");
    const wasActive = invite.status === "active";
    await ctx.db.patch(invite._id, { status: "revoked", updatedAt: new Date().toISOString() });
    if (wasActive && invite.clerkId && invite.collectionId) {
      const collection = await ctx.db.get(invite.collectionId);
      if (collection) await pruneLibrary(ctx, invite.clerkId, collection.moduleIds);
    }
  },
});
