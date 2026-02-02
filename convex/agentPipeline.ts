"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { openRouterChat } from "./llm";

// Orchestrator entrypoint.
// Phase A: real research + pack generation via OpenRouter.

export const startGeneration = action({
  args: {
    conceptId: v.id("videoConcepts"),
    mode: v.optional(v.union(v.literal("full"), v.literal("research"))),
    trigger: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const concept = await ctx.runQuery(api.videoConcepts.get, { id: args.conceptId });
    if (!concept) throw new Error("Concept not found");

    const taskId = await ctx.runMutation(api.pipeline.createParent, {
      conceptId: args.conceptId,
      trigger: args.trigger ?? null,
    });

    await ctx.runMutation(api.pipeline.linkTask, {
      conceptId: args.conceptId,
      taskId,
    });

    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("Missing OPENROUTER_API_KEY");

    const researchModel = process.env.OPENROUTER_MODEL_RESEARCH || "openrouter/auto";
    const genModel = process.env.OPENROUTER_MODEL_GEN || "openrouter/auto";

    const researchPrompt = `You are FURY, a brutal, numbers-driven research agent.\n\nTopic: ${concept.title}\nPillar: ${concept.pillar}\nOutline: ${concept.outline ?? "(none)"}\n\nReturn:\n- 5 case studies (title, industry, result metric, source placeholder)\n- 10 stats/claims with credibility (high/medium)\n- 5 tools/platforms with pricing + bestFor\n- 5 competitor strategies\n- 5 trending angles\nFormat as markdown.`;

    const research = await openRouterChat({
      apiKey: key,
      model: researchModel,
      messages: [
        { role: "system", content: "You are a research agent." },
        { role: "user", content: researchPrompt },
      ],
      temperature: 0.4,
      maxTokens: 1600,
    });

    const items: Array<{ contentType: string; titleSuffix: string; body: string }> = [
      { contentType: "Research_Doc", titleSuffix: "Research", body: research },
    ];

    const mode = args.mode ?? "full";

    if (mode === "full") {
      const genPrompt = `You are JARVIS, a content multiplication system.\n\nSeed concept:\nTitle: ${concept.title}\nPillar: ${concept.pillar}\nOutline: ${concept.outline ?? "(none)"}\nResearch notes:\n${research}\n\nGenerate the following, each as markdown with clear headings:\n1) 8 hook variations (platform-specific: YouTube/X/IG/LinkedIn)\n2) 3 X threads (3-5 posts each)\n3) 4 reels scripts (45-60 sec)\n4) LinkedIn carousel (5 slides)\n5) Lead magnet outline\n6) 5-email sequence\n7) 7 discussion prompts\n\nBe direct, numbers-first, no fluff.`;

      const pack = await openRouterChat({
        apiKey: key,
        model: genModel,
        messages: [
          { role: "system", content: "You generate high-performing content." },
          { role: "user", content: genPrompt },
        ],
        temperature: 0.7,
        maxTokens: 2400,
      });

      // MVP: store the full pack text into each derivative doc.
      // Next iteration: generate each derivative separately and store cleanly.
      items.push({ contentType: "Hook", titleSuffix: "Hooks (8 variants)", body: pack });
      items.push({ contentType: "X_Thread", titleSuffix: "X Threads (3)", body: pack });
      items.push({ contentType: "Reel", titleSuffix: "Reels (4)", body: pack });
      items.push({ contentType: "LinkedIn", titleSuffix: "LinkedIn carousel", body: pack });
      items.push({ contentType: "Lead_Magnet", titleSuffix: "Lead magnet", body: pack });
      items.push({ contentType: "Email_Sequence", titleSuffix: "Email sequence (5)", body: pack });
      items.push({ contentType: "Discussion", titleSuffix: "Discussion topics", body: pack });
    }

    const contentIds = await ctx.runMutation(api.content.createMany, {
      conceptId: args.conceptId,
      taskId,
      items,
    });

    await ctx.runMutation(api.pipeline.setTaskProgress, {
      taskId,
      linkedContentIds: contentIds,
      completionPercentage: mode === "full" ? 70 : 40,
    });

    return { taskId, contentIds };
  },
});
