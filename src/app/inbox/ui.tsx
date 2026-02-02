"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function InboxList() {
  const items = useQuery(api.telegram.inboxList, {});

  if (items === undefined) return <div className="text-zinc-600">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">
        No inbox items yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((x) => (
        <div key={x._id} className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-zinc-500">
                chat {x.chatId} • msg {x.messageId} • {x.pillar ?? "(no pillar)"}
              </div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-zinc-900">
                {x.text}
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {new Date(x.createdAt).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
