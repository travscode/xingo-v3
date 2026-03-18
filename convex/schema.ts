import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const subscriptionStatus = v.union(
  v.literal("free"),
  v.literal("professional"),
  v.literal("organization"),
);

const platformRole = v.union(
  v.literal("interpreter"),
  v.literal("student"),
  v.literal("organization_admin"),
  v.literal("platform_admin"),
);

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

const voiceAgent = v.object({
  role: v.string(),
  voice: v.string(),
  goal: v.string(),
});

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: platformRole,
    organizationId: v.optional(v.string()),
    subscriptionStatus,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_stripeCustomerId", ["stripeCustomerId"]),

  organizations: defineTable({
    id: v.string(),
    name: v.string(),
    ownerId: v.string(),
    createdAt: v.string(),
  }).index("by_public_id", ["id"]),

  organizationMembers: defineTable({
    organizationId: v.string(),
    userClerkId: v.string(),
    role: v.union(v.literal("student"), v.literal("organization_admin")),
  })
    .index("by_organizationId", ["organizationId"])
    .index("by_userClerkId", ["userClerkId"]),

  modules: defineTable({
    id: v.string(),
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
    createdAt: v.string(),
  })
    .index("by_public_id", ["id"])
    .index("by_category", ["industryCategory"]),

  scenarios: defineTable({
    id: v.string(),
    moduleId: v.string(),
    title: v.string(),
    description: v.string(),
    aiAgentA: voiceAgent,
    aiAgentB: voiceAgent,
    expectedSkills: v.array(v.string()),
    difficultyLevel,
  })
    .index("by_public_id", ["id"])
    .index("by_moduleId", ["moduleId"]),

  sessions: defineTable({
    id: v.string(),
    clerkId: v.string(),
    moduleId: v.string(),
    scenarioId: v.string(),
    durationMinutes: v.number(),
    score: v.number(),
    completionStatus: v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("needs_review"),
    ),
    transcriptSummary: v.string(),
    timestamp: v.string(),
  })
    .index("by_public_id", ["id"])
    .index("by_clerkId", ["clerkId"])
    .index("by_moduleId", ["moduleId"])
    .index("by_scenarioId", ["scenarioId"]),

  jobs: defineTable({
    id: v.string(),
    title: v.string(),
    description: v.string(),
    industry: industryCategory,
    date: v.string(),
    location: v.string(),
    payRate: v.string(),
    organizationId: v.string(),
    assignedInterpreterClerkId: v.optional(v.string()),
    status: v.union(
      v.literal("open"),
      v.literal("assigned"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  })
    .index("by_public_id", ["id"])
    .index("by_status", ["status"])
    .index("by_assignedInterpreterClerkId", ["assignedInterpreterClerkId"]),
});
