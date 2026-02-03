/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as agentPipeline from "../agentPipeline.js";
import type * as content from "../content.js";
import type * as external from "../external.js";
import type * as llm from "../llm.js";
import type * as pipeline from "../pipeline.js";
import type * as pipelineBoard from "../pipelineBoard.js";
import type * as telegram from "../telegram.js";
import type * as videoConcepts from "../videoConcepts.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  agentPipeline: typeof agentPipeline;
  content: typeof content;
  external: typeof external;
  llm: typeof llm;
  pipeline: typeof pipeline;
  pipelineBoard: typeof pipelineBoard;
  telegram: typeof telegram;
  videoConcepts: typeof videoConcepts;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
