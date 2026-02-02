"use client";

import { useMemo } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { Button } from "@/components/ui/button";

export function ConceptDetail({ id }: { id: string }) {
  const concept = useQuery(api.videoConcepts.get, { id: id as any });
  const start = useAction(api.agentPipeline.startGeneration);
  const content = useQuery(api.content.listByConcept, { conceptId: id as any });

  const isLoading = concept === undefined || content === undefined;

  const derivatives = useMemo(() => content ?? [], [content]);

  if (isLoading) return <div className="text-zinc-600">Loading…</div>;
  if (!concept) return <div className="text-zinc-600">Not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{concept.title}</h1>
          <div className="mt-1 text-sm text-zinc-600">
            {concept.pillar} • {concept.status} • {concept.source}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={async () => {
              await start({ conceptId: concept._id, mode: "research" });
            }}
          >
            Do research
          </Button>
          <Button
            onClick={async () => {
              await start({ conceptId: concept._id, mode: "full" });
            }}
          >
            Generate pack
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium text-zinc-900">Outline</div>
          <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
            {concept.outline || "—"}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="text-sm font-medium text-zinc-900">Derivatives</div>
          <div className="mt-2 text-sm text-zinc-700">
            {derivatives.length === 0 ? (
              <div className="text-zinc-500">None yet. Click Generate pack.</div>
            ) : (
              <ul className="list-disc pl-5">
                {derivatives.map((d) => (
                  <li key={d._id}>
                    <span className="font-medium">{d.contentType}</span>: {d.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
