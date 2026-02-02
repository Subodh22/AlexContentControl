import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const pillar = v.union(v.literal("AI_Apps"), v.literal("Sales_Entrepreneurship"));

export default defineSchema({
  videoConcepts: defineTable({
    createdAt: v.number(),
    updatedAt: v.number(),

    title: v.string(),
    pillar,
    source: v.union(
      v.literal("telegram"),
      v.literal("dashboard"),
      v.literal("import")
    ),
    sourceRef: v.union(v.string(), v.null()), // message id, url, etc.

    outline: v.union(v.string(), v.null()),
    keyPoints: v.array(v.string()),
    targetAudience: v.union(v.string(), v.null()),

    status: v.union(
      v.literal("concept"),
      v.literal("in-production"),
      v.literal("published"),
      v.literal("evergreen")
    ),

    linkedTaskId: v.union(v.id("tasks"), v.null()),
  })
    .index("by_status", ["status"]) 
    .index("by_pillar", ["pillar"]) 
    .index("by_source", ["source"]) ,

  content: defineTable({
    createdAt: v.number(),
    updatedAt: v.number(),

    title: v.string(),
    pillar,
    contentType: v.union(
      v.literal("YouTube_Script"),
      v.literal("X_Thread"),
      v.literal("Reel"),
      v.literal("LinkedIn"),
      v.literal("Lead_Magnet"),
      v.literal("Email_Sequence"),
      v.literal("Hook"),
      v.literal("Discussion"),
      v.literal("Research_Doc")
    ),
    status: v.union(
      v.literal("idea"),
      v.literal("outline"),
      v.literal("draft"),
      v.literal("review"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    ),

    body: v.union(v.string(), v.null()),
    blocks: v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal("heading"),
          v.literal("paragraph"),
          v.literal("bullets"),
          v.literal("numbered"),
          v.literal("quote"),
          v.literal("code")
        ),
        text: v.string(),
      })
    ),

    platforms: v.array(v.string()),
    scheduledDate: v.union(v.string(), v.null()),
    publishedDate: v.union(v.string(), v.null()),

    metrics: v.object({
      views: v.number(),
      impressions: v.number(),
      engagement: v.number(),
      clicks: v.number(),
      conversions: v.number(),
      engagementRate: v.number(),
    }),

    owner: v.union(v.string(), v.null()), // agent name

    parentConceptId: v.id("videoConcepts"),
    linkedTaskIds: v.array(v.id("tasks")),
  })
    .index("by_concept", ["parentConceptId"]) 
    .index("by_type", ["contentType"]) 
    .index("by_status", ["status"]) ,

  researchDatabase: defineTable({
    createdAt: v.number(),
    updatedAt: v.number(),

    topic: v.string(),
    pillar,

    // store as simple arrays for MVP; we can normalize later
    notes: v.string(),

    owner: v.union(v.string(), v.null()),
    lastUpdated: v.union(v.number(), v.null()),
    nextResearchDate: v.union(v.number(), v.null()),
  })
    .index("by_pillar", ["pillar"]) 
    .index("by_topic", ["topic"]) ,

  tasks: defineTable({
    createdAt: v.number(),
    updatedAt: v.number(),

    owner: v.string(), // JARVIS | FURY ...
    title: v.string(),
    description: v.union(v.string(), v.null()),
    dueDate: v.union(v.string(), v.null()),
    priority: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    status: v.union(
      v.literal("not-started"),
      v.literal("in-progress"),
      v.literal("review"),
      v.literal("blocked"),
      v.literal("done")
    ),

    triggerSource: v.union(
      v.literal("telegram"),
      v.literal("dashboard"),
      v.literal("agent_subtask"),
      v.literal("automated_workflow")
    ),
    triggerCommand: v.union(v.string(), v.null()),
    userMessage: v.union(v.string(), v.null()),

    parentTaskId: v.union(v.id("tasks"), v.null()),
    linkedConceptId: v.union(v.id("videoConcepts"), v.null()),
    linkedContentIds: v.array(v.id("content")),

    blockers: v.array(v.string()),
    completionPercentage: v.number(),
  })
    .index("by_status", ["status"]) 
    .index("by_owner", ["owner"]) 
    .index("by_parent", ["parentTaskId"]) ,

  contentCalendar: defineTable({
    weekStart: v.string(),
    weekEnd: v.string(),
    entries: v.array(
      v.object({
        date: v.string(),
        pillar,
        contentType: v.string(),
        title: v.string(),
        owner: v.string(),
        status: v.string(),
        conceptId: v.id("videoConcepts"),
        contentIds: v.array(v.id("content")),
      })
    ),
    weeklyTargets: v.object({
      videoConceptsTarget: v.number(),
      videoConceptsActual: v.number(),
      totalDerivativesTarget: v.number(),
      totalDerivativesActual: v.number(),
      researchItemsAddedTarget: v.number(),
      researchItemsAddedActual: v.number(),
    }),
  }).index("by_weekStart", ["weekStart"]),

  workingPriorities: defineTable({
    currentWeek: v.string(),
    top3Priorities: v.array(
      v.object({
        priority: v.number(),
        owner: v.string(),
        title: v.string(),
        dueDate: v.union(v.string(), v.null()),
        completionPercentage: v.number(),
      })
    ),
    activeExperiments: v.array(
      v.object({
        name: v.string(),
        hypothesis: v.string(),
        metric: v.string(),
        status: v.string(),
        owner: v.string(),
      })
    ),
    blockers: v.array(
      v.object({
        description: v.string(),
        impact: v.string(),
        owner: v.string(),
      })
    ),
    weeklyOutputTarget: v.object({
      videoConceptsFromYou: v.number(),
      derivativeContent: v.number(),
      researchItems: v.number(),
    }),
  }).index("by_week", ["currentWeek"]),

  brandVoiceGuide: defineTable({
    updatedAt: v.number(),
    tone: v.object({
      primary: v.array(v.string()),
      avoid: v.array(v.string()),
    }),
    vocabularyPatterns: v.object({
      use: v.array(v.string()),
      avoid: v.array(v.string()),
    }),
    favoriteStructures: v.array(v.string()),
    storytellingExamples: v.object({
      ai_apps: v.string(),
      sales_case_study: v.string(),
      roi_angle: v.string(),
    }),
    visualStyle: v.object({
      colorPalette: v.array(v.string()),
      fonts: v.array(v.string()),
      bRollAesthetic: v.string(),
    }),
  }),

  swipeFile: defineTable({
    updatedAt: v.number(),
    hooks: v.array(
      v.object({
        type: v.string(),
        text: v.string(),
        platform: v.string(),
        performance: v.string(),
        notes: v.string(),
        derivedFrom: v.union(v.id("videoConcepts"), v.null()),
      })
    ),
    videoStructures: v.array(
      v.object({
        name: v.string(),
        outline: v.string(),
        timing: v.string(),
      })
    ),
  }),

  strategyDoc: defineTable({
    updatedAt: v.number(),
    ninetyDayGoals: v.array(
      v.object({
        goal: v.string(),
        metric: v.string(),
        target: v.number(),
        current: v.number(),
      })
    ),
    contentOutputPlan: v.object({
      videoConceptsNeeded: v.number(),
      derivativesPerConcept: v.number(),
      totalDerivativesGenerated: v.number(),
      researchItemsToCollect: v.number(),
    }),
    contentPillarsBreakdown: v.array(
      v.object({
        pillar,
        percentageAllocation: v.number(),
        keyAngles: v.array(v.string()),
        evergreen_vs_timely: v.string(),
      })
    ),
  }),
});
