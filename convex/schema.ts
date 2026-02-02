import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    email: v.union(v.string(), v.null()),
    name: v.union(v.string(), v.null()),
  })
    .index("by_clerkUserId", ["clerkUserId"])
    .index("by_email", ["email"]),

  boards: defineTable({
    ownerUserId: v.id("users"),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_owner", ["ownerUserId"]),

  columns: defineTable({
    boardId: v.id("boards"),
    name: v.string(),
    order: v.number(),
  }).index("by_board", ["boardId"]),

  cards: defineTable({
    boardId: v.id("boards"),
    columnId: v.id("columns"),
    title: v.string(),
    description: v.union(v.string(), v.null()),
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_board", ["boardId"])
    .index("by_column", ["columnId"]),
});
