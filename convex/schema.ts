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
  name: v.optional(v.string()),
  role: v.string(),
  voice: v.string(),
  avatarImageUrl: v.optional(v.string()),
  avatarStorageId: v.optional(v.id("_storage")),
  goal: v.string(),
  language: v.optional(v.string()),
  demeanor: v.optional(v.string()),
  instructions: v.optional(v.string()),
  openingLine: v.optional(v.string()),
  /** What this participant must achieve before closing the conversation. */
  endCondition: v.optional(v.string()),
});

const languagePreference = v.object({
  sourceLanguage: v.string(),
  targetLanguage: v.string(),
});

const practiceRuntime = v.object({
  interpreterRole: v.string(),
  sourceLanguage: v.string(),
  targetLanguage: v.string(),
  openingSpeaker: v.union(v.literal("agent_a"), v.literal("agent_b")),
  briefing: v.string(),
  assessmentFocus: v.array(v.string()),
  /** "interpreting" (default): learner bridges two speakers. "roleplay": learner speaks as themselves (OET, IELTS, OSCE). */
  practiceType: v.optional(v.union(v.literal("interpreting"), v.literal("roleplay"))),
  /** Who the learner plays in a role-play, e.g. "Registered nurse", "IELTS candidate". */
  learnerRole: v.optional(v.string()),
  /** Candidate card / instructions shown before and during the session. */
  taskCard: v.optional(v.string()),
  /** Role-play only: true when the learner speaks first (OET, AMC); false when the AI opens (IELTS examiner). */
  learnerOpens: v.optional(v.boolean()),
  /** Exam-style time limit for the live session. */
  timeLimitMinutes: v.optional(v.number()),
});

const transcriptEntry = v.object({
  id: v.string(),
  role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system")),
  speaker: v.string(),
  text: v.string(),
  createdAt: v.string(),
});

const assessmentBreakdown = v.object({
  accuracy: v.number(),
  terminology: v.number(),
  fluency: v.number(),
  turnManagement: v.number(),
  professionalism: v.number(),
});

const aiUsageSource = v.union(
  v.literal("realtime"),
  v.literal("assessment"),
  v.literal("translation"),
  v.literal("other"),
);

const stripeChargeStatus = v.union(
  v.literal("not_applicable"),
  v.literal("pending"),
  v.literal("invoiced"),
  v.literal("failed"),
);

const attemptStatus = v.union(
  v.literal("in_progress"),
  v.literal("completed"),
  v.literal("needs_review"),
  v.literal("ungraded"),
  v.literal("abandoned"),
);

const sessionAssessment = v.object({
  overallScore: v.number(),
  summary: v.string(),
  strengths: v.array(v.string()),
  improvementAreas: v.array(v.string()),
  recommendedNextStep: v.string(),
  completionDecision: v.union(
    v.literal("completed"),
    v.literal("needs_review"),
  ),
  breakdown: assessmentBreakdown,
  /** Did the learner get through the task? Unfinished sessions are scaled down (lib/scoring.ts). */
  completion: v.optional(
    v.object({
      reachedEnd: v.boolean(),
      coveragePercent: v.number(),
      rawScore: v.number(),
      unfinished: v.string(),
    }),
  ),
});

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    /** True when `email` came from the Clerk identity token rather than the client. */
    emailVerified: v.optional(v.boolean()),
    name: v.string(),
    imageUrl: v.optional(v.string()),
    role: platformRole,
    organizationId: v.optional(v.string()),
    subscriptionStatus,
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    stripeSubscriptionStatus: v.optional(v.string()),
    languagePreferences: v.optional(v.array(languagePreference)),
    practiceGoal: v.optional(v.string()),
    onboardedAt: v.optional(v.string()),
    /** Terms of Service + Privacy Policy acceptance (lib/legal.ts LEGAL_VERSION). */
    termsVersion: v.optional(v.string()),
    termsAcceptedAt: v.optional(v.string()),
    /** Unsubscribed from admin/marketing emails (Spam Act). */
    emailOptOut: v.optional(v.boolean()),
    emailOptOutAt: v.optional(v.string()),
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
    /** "community" courses come from the marketplace and only appear for people who add them. Absent = XINGO. */
    source: v.optional(v.union(v.literal("xingo"), v.literal("community"))),
    ownerClerkId: v.optional(v.string()),
  })
    .index("by_public_id", ["id"])
    .index("by_category", ["industryCategory"])
    .index("by_owner", ["ownerClerkId"]),

  scenarios: defineTable({
    id: v.string(),
    moduleId: v.string(),
    title: v.string(),
    description: v.string(),
    agentCount: v.optional(v.union(v.literal(1), v.literal(2))),
    aiAgentA: voiceAgent,
    aiAgentB: v.optional(voiceAgent),
    practiceRuntime: v.optional(practiceRuntime),
    expectedSkills: v.array(v.string()),
    difficultyLevel,
    /** Playable on the free plan even when the parent module is premium. */
    isFreePreview: v.optional(v.boolean()),
  })
    .index("by_public_id", ["id"])
    .index("by_moduleId", ["moduleId"]),

  sessions: defineTable({
    id: v.string(),
    clerkId: v.string(),
    moduleId: v.string(),
    scenarioId: v.string(),
    startedAt: v.optional(v.string()),
    endedAt: v.optional(v.string()),
    durationSeconds: v.optional(v.number()),
    durationMinutes: v.number(),
    score: v.number(),
    completionStatus: attemptStatus,
    transcriptSummary: v.string(),
    transcriptEntries: v.optional(v.array(transcriptEntry)),
    assessment: v.optional(sessionAssessment),
    timestamp: v.string(),
    /** Server-side metering (ms since epoch). Absent on pre-v4 attempts. */
    startedAtMs: v.optional(v.number()),
    lastActiveAtMs: v.optional(v.number()),
    realtimeKeysIssued: v.optional(v.number()),
    chargedMinutes: v.optional(v.number()),
    sourceLanguage: v.optional(v.string()),
    targetLanguage: v.optional(v.string()),
    /** "assessed" is scored with the transcript hidden; "practice" shows it and is never scored. */
    mode: v.optional(v.union(v.literal("assessed"), v.literal("practice"))),
    ungradedReason: v.optional(v.string()),
    /** Why the live session ended (lib/scoring.ts endReasons). */
    endReason: v.optional(
      v.union(
        v.literal("objective_met"),
        v.literal("learner_finished"),
        v.literal("time_up"),
        v.literal("stalled"),
        v.literal("out_of_minutes"),
      ),
    ),
  })
    .index("by_public_id", ["id"])
    .index("by_clerkId", ["clerkId"])
    .index("by_moduleId", ["moduleId"])
    .index("by_scenarioId", ["scenarioId"])
    .index("by_status", ["completionStatus"]),

  /** Marketplace page for a community course (one per course). */
  courseListings: defineTable({
    moduleId: v.string(),
    ownerClerkId: v.string(),
    status: v.union(v.literal("draft"), v.literal("published"), v.literal("removed")),
    slug: v.string(),
    kind: v.union(v.literal("roleplay"), v.literal("interpreting")),
    title: v.string(),
    tagline: v.string(),
    description: v.string(),
    keywords: v.array(v.string()),
    whatYouGet: v.array(v.string()),
    audience: v.optional(v.string()),
    creatorName: v.string(),
    bannerStorageId: v.optional(v.id("_storage")),
    logoStorageId: v.optional(v.id("_storage")),
    certifications: v.array(
      v.object({
        name: v.string(),
        issuer: v.optional(v.string()),
        url: v.optional(v.string()),
        logoStorageId: v.optional(v.id("_storage")),
      }),
    ),
    guidelinesAcceptedAt: v.optional(v.string()),
    publishedAt: v.optional(v.string()),
    removedAt: v.optional(v.string()),
    removedReason: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
    /** Denormalised counters for sorting and analytics. */
    viewCount: v.number(),
    addCount: v.number(),
  })
    .index("by_moduleId", ["moduleId"])
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerClerkId"])
    .index("by_status", ["status"]),

  /** Courses a learner added from the marketplace. */
  libraryItems: defineTable({
    clerkId: v.string(),
    moduleId: v.string(),
    addedAt: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_moduleId", ["moduleId"])
    .index("by_clerk_module", ["clerkId", "moduleId"]),

  /** Listing page views per course per UTC day. */
  courseViews: defineTable({
    moduleId: v.string(),
    day: v.string(),
    views: v.number(),
  }).index("by_module_day", ["moduleId", "day"]),

  /** A creator's payout account (Stripe Connect Express). */
  creatorAccounts: defineTable({
    clerkId: v.string(),
    stripeAccountId: v.optional(v.string()),
    detailsSubmitted: v.boolean(),
    payoutsEnabled: v.boolean(),
    country: v.optional(v.string()),
    updatedAt: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_stripeAccountId", ["stripeAccountId"]),

  /** One row per charged attempt in a community course. Amounts in AUD cents. */
  creatorEarnings: defineTable({
    ownerClerkId: v.string(),
    moduleId: v.string(),
    attemptId: v.string(),
    learnerClerkId: v.string(),
    minutes: v.number(),
    paidMinutes: v.number(),
    amountCents: v.number(),
    createdAt: v.string(),
    payoutId: v.optional(v.id("creatorPayouts")),
  })
    .index("by_owner", ["ownerClerkId"])
    .index("by_moduleId", ["moduleId"])
    .index("by_attemptId", ["attemptId"]),

  creatorPayouts: defineTable({
    ownerClerkId: v.string(),
    amountCents: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid"), v.literal("failed")),
    stripeTransferId: v.optional(v.string()),
    error: v.optional(v.string()),
    createdAt: v.string(),
    paidAt: v.optional(v.string()),
  })
    .index("by_owner", ["ownerClerkId"])
    .index("by_status", ["status"]),

  /** Learner reports about marketplace courses, reviewed in Admin → Reports. */
  contentReports: defineTable({
    moduleId: v.string(),
    reporterClerkId: v.string(),
    reason: v.union(
      v.literal("inappropriate"),
      v.literal("misleading"),
      v.literal("copyright"),
      v.literal("unsafe"),
      v.literal("spam"),
      v.literal("other"),
    ),
    details: v.string(),
    status: v.union(v.literal("open"), v.literal("dismissed"), v.literal("actioned")),
    createdAt: v.string(),
    resolvedAt: v.optional(v.string()),
    resolvedBy: v.optional(v.string()),
    resolution: v.optional(v.string()),
  })
    .index("by_status", ["status"])
    .index("by_moduleId", ["moduleId"]),

  aiUsageEvents: defineTable({
    id: v.string(),
    clerkId: v.string(),
    source: aiUsageSource,
    model: v.string(),
    moduleId: v.optional(v.string()),
    scenarioId: v.optional(v.string()),
    attemptId: v.optional(v.string()),
    requestPath: v.optional(v.string()),
    promptTokens: v.number(),
    completionTokens: v.number(),
    totalTokens: v.number(),
    usageCredits: v.optional(v.number()),
    overageCredits: v.optional(v.number()),
    overageChargeCents: v.optional(v.number()),
    stripeChargeStatus: v.optional(stripeChargeStatus),
    stripeInvoiceItemId: v.optional(v.string()),
    stripeChargeError: v.optional(v.string()),
    billingMonth: v.string(),
    createdAt: v.string(),
  })
    .index("by_public_id", ["id"])
    .index("by_clerkId", ["clerkId"])
    .index("by_clerkId_billingMonth", ["clerkId", "billingMonth"])
    .index("by_attemptId", ["attemptId"]),

  /** One row per attempt that consumed practice minutes. */
  usageCharges: defineTable({
    clerkId: v.string(),
    attemptId: v.string(),
    minutes: v.number(),
    fromAllowance: v.number(),
    fromPacks: v.number(),
    billingMonth: v.string(),
    createdAt: v.string(),
  })
    .index("by_clerkId_billingMonth", ["clerkId", "billingMonth"])
    .index("by_clerkId", ["clerkId"])
    .index("by_attemptId", ["attemptId"]),

  /** Purchased or granted practice minutes outside the monthly allowance. */
  minuteGrants: defineTable({
    clerkId: v.string(),
    minutes: v.number(),
    source: v.union(v.literal("pack"), v.literal("admin"), v.literal("promo")),
    packId: v.optional(v.string()),
    stripeCheckoutSessionId: v.optional(v.string()),
    note: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_stripeCheckoutSessionId", ["stripeCheckoutSessionId"]),

  /** Admin-issued invitations. Roles apply when the invitee signs in with this email. */
  invites: defineTable({
    email: v.string(),
    role: platformRole,
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("revoked")),
    invitedByClerkId: v.string(),
    clerkInvitationId: v.optional(v.string()),
    createdAt: v.string(),
    acceptedAt: v.optional(v.string()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  /** Admin email campaigns (docs/runbooks/email-setup.md). */
  emailCampaigns: defineTable({
    name: v.string(),
    subject: v.string(),
    preheader: v.string(),
    fromName: v.string(),
    templateId: v.union(v.literal("announcement"), v.literal("spotlight"), v.literal("newsletter"), v.literal("letter")),
    content: v.object({
      kicker: v.optional(v.string()),
      headline: v.optional(v.string()),
      body: v.string(),
      heroImageUrl: v.optional(v.string()),
      ctaLabel: v.optional(v.string()),
      ctaUrl: v.optional(v.string()),
      sections: v.optional(
        v.array(
          v.object({
            title: v.string(),
            body: v.string(),
            imageUrl: v.optional(v.string()),
            linkLabel: v.optional(v.string()),
            linkUrl: v.optional(v.string()),
          }),
        ),
      ),
      signature: v.optional(v.string()),
    }),
    audience: v.object({
      mode: v.union(v.literal("all"), v.literal("selected")),
      clerkIds: v.array(v.string()),
    }),
    batchSize: v.number(),
    batchIntervalMinutes: v.number(),
    status: v.union(v.literal("draft"), v.literal("sending"), v.literal("sent"), v.literal("cancelled")),
    /** Trackable URLs, frozen at send time; click tokens refer to their index. */
    links: v.optional(v.array(v.string())),
    createdByClerkId: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
    sendStartedAt: v.optional(v.string()),
    sentAt: v.optional(v.string()),
  }).index("by_status", ["status"]),

  emailRecipients: defineTable({
    campaignId: v.id("emailCampaigns"),
    clerkId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    /** Random token used in open/click/unsubscribe URLs. */
    token: v.string(),
    status: v.union(v.literal("queued"), v.literal("sending"), v.literal("sent"), v.literal("failed"), v.literal("bounced")),
    providerMessageId: v.optional(v.string()),
    error: v.optional(v.string()),
    sentAt: v.optional(v.string()),
    openCount: v.number(),
    firstOpenedAt: v.optional(v.string()),
    clickCount: v.number(),
    firstClickedAt: v.optional(v.string()),
    unsubscribedAt: v.optional(v.string()),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_campaign_status", ["campaignId", "status"])
    .index("by_token", ["token"])
    .index("by_providerMessageId", ["providerMessageId"]),

  emailClicks: defineTable({
    campaignId: v.id("emailCampaigns"),
    recipientId: v.id("emailRecipients"),
    linkIndex: v.number(),
    createdAt: v.string(),
  }).index("by_campaign", ["campaignId"]),

  /** Processed Stripe webhook events, for idempotency. */
  stripeEvents: defineTable({
    eventId: v.string(),
    type: v.string(),
    processedAt: v.string(),
  }).index("by_eventId", ["eventId"]),

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
