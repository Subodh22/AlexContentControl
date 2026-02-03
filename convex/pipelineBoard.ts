import { query } from "./_generated/server";

const STAGES = [
  "Inbox",
  "Concept",
  "Research",
  "Hooks",
  "Threads",
  "Reels",
  "LinkedIn",
  "Lead Magnet",
  "Email Sequence",
  "Discussion",
  "Done",
] as const;

type Stage = (typeof STAGES)[number];

const REQUIRED_BY_STAGE: Array<{ stage: Exclude<Stage, "Inbox" | "Concept" | "Done">; type: string }> = [
  { stage: "Research", type: "Research_Doc" },
  { stage: "Hooks", type: "Hook" },
  { stage: "Threads", type: "X_Thread" },
  { stage: "Reels", type: "Reel" },
  { stage: "LinkedIn", type: "LinkedIn" },
  { stage: "Lead Magnet", type: "Lead_Magnet" },
  { stage: "Email Sequence", type: "Email_Sequence" },
  { stage: "Discussion", type: "Discussion" },
];

function computeStage(contentTypes: Set<string>): Stage {
  if (contentTypes.size === 0) return "Concept";
  for (const req of REQUIRED_BY_STAGE) {
    if (!contentTypes.has(req.type)) return req.stage;
  }
  return "Done";
}

export const board = query({
  args: {},
  handler: async (ctx) => {
    // Inbox items that haven't been processed into concepts (best-effort)
    const inbox = await ctx.db
      .query("telegramInbox")
      .order("desc")
      .take(100);

    const concepts = await ctx.db.query("videoConcepts").order("desc").take(100);

    // Build content-type lookup
    const content = await ctx.db.query("content").order("desc").take(500);
    const byConcept = new Map<string, Set<string>>();
    for (const c of content) {
      const set = byConcept.get(c.parentConceptId) ?? new Set<string>();
      set.add(c.contentType);
      byConcept.set(c.parentConceptId, set);
    }

    const conceptCards = concepts.map((concept) => {
      const types = byConcept.get(concept._id) ?? new Set<string>();
      const stage = computeStage(types);
      const checklist = {
        research: types.has("Research_Doc"),
        hooks: types.has("Hook"),
        threads: types.has("X_Thread"),
        reels: types.has("Reel"),
        linkedin: types.has("LinkedIn"),
        leadMagnet: types.has("Lead_Magnet"),
        email: types.has("Email_Sequence"),
        discussion: types.has("Discussion"),
      };
      return { concept, stage, checklist };
    });

    return {
      stages: STAGES,
      inbox,
      concepts: conceptCards,
    };
  },
});
