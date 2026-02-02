"use node";

import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Workaround: avoid TS7022 recursion by using function-style action definition.

export const startGeneration = action(async (ctx, args: any) => {
  const taskId = await ctx.runMutation(api.pipeline.createParent, {
    conceptId: args.conceptId,
    trigger: args.trigger ?? null,
  });

  await ctx.runMutation(api.pipeline.linkTask, {
    conceptId: args.conceptId,
    taskId,
  });

  await ctx.runMutation(api.pipeline.createDerivatives, {
    conceptId: args.conceptId,
    taskId,
    mode: args.mode ?? "full",
  });

  return { taskId };
});
