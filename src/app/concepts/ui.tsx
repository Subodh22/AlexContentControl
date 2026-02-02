"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function ConceptsList() {
  const concepts = useQuery(api.videoConcepts.list, {});

  if (concepts === undefined) {
    return <div className="text-zinc-600">Loading…</div>;
  }

  if (concepts.length === 0) {
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-6 text-zinc-600">
        No concepts yet.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {concepts.map((c) => (
        <Link
          key={c._id}
          href={`/concepts/${c._id}`}
          className="block rounded-lg border border-zinc-200 bg-white p-4 hover:bg-zinc-50"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-zinc-900">{c.title}</div>
              <div className="mt-1 text-sm text-zinc-600">
                {c.pillar} • {c.status} • {c.source}
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              {new Date(c.createdAt).toLocaleString()}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
