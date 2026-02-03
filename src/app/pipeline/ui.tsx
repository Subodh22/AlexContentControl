"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "rounded bg-green-100 px-2 py-0.5 text-xs text-green-700"
          : "rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
      }
    >
      {ok ? "✓" : "·"}
    </span>
  );
}

export function PipelineBoard() {
  const data = useQuery(api.pipelineBoard.board, {});

  if (data === undefined) return <div className="text-zinc-600">Loading…</div>;

  const stageOrder = data.stages as string[];

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[1200px] gap-3">
        {/* Inbox column */}
        <Column title="Inbox">
          {data.inbox.map((m: any) => (
            <div
              key={m._id}
              className="rounded-lg border border-zinc-200 bg-white p-3"
            >
              <div className="text-xs text-zinc-500">
                {m.pillar ?? "(no pillar)"}
              </div>
              <div className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-zinc-900">
                {m.text}
              </div>
            </div>
          ))}
        </Column>

        {stageOrder
          .filter((s) => s !== "Inbox")
          .map((stage) => (
            <Column key={stage} title={stage}>
              {data.concepts
                .filter((c: any) => c.stage === stage)
                .map((c: any) => (
                  <Link
                    key={c.concept._id}
                    href={`/concepts/${c.concept._id}`}
                    className="block rounded-lg border border-zinc-200 bg-white p-3 hover:bg-zinc-50"
                  >
                    <div className="text-xs text-zinc-500">{c.concept.pillar}</div>
                    <div className="mt-1 font-medium text-zinc-900">
                      {c.concept.title}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="text-xs text-zinc-500">R</span>
                      <Badge ok={c.checklist.research} />
                      <span className="text-xs text-zinc-500">H</span>
                      <Badge ok={c.checklist.hooks} />
                      <span className="text-xs text-zinc-500">T</span>
                      <Badge ok={c.checklist.threads} />
                      <span className="text-xs text-zinc-500">Re</span>
                      <Badge ok={c.checklist.reels} />
                      <span className="text-xs text-zinc-500">LI</span>
                      <Badge ok={c.checklist.linkedin} />
                      <span className="text-xs text-zinc-500">LM</span>
                      <Badge ok={c.checklist.leadMagnet} />
                      <span className="text-xs text-zinc-500">E</span>
                      <Badge ok={c.checklist.email} />
                      <span className="text-xs text-zinc-500">D</span>
                      <Badge ok={c.checklist.discussion} />
                    </div>
                  </Link>
                ))}
            </Column>
          ))}
      </div>
    </div>
  );
}

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-72 shrink-0">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
