"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { Button } from "@/components/ui/button";

const TYPES = [
  "heading",
  "paragraph",
  "bullets",
  "numbered",
  "quote",
  "code",
] as const;

type BlockType = (typeof TYPES)[number];

type Block = { id: string; type: BlockType; text: string };

export function ContentEditor({ id }: { id: string }) {
  const doc = useQuery(api.content.get, { id: id as any });
  const save = useMutation(api.content.updateBlocks);

  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    if (!doc) return;
    setBlocks((doc.blocks ?? []) as any);
  }, [doc?._id]);

  const dirty = useMemo(() => {
    if (!doc) return false;
    return JSON.stringify(blocks) !== JSON.stringify(doc.blocks ?? []);
  }, [blocks, doc]);

  if (doc === undefined) return <div className="text-zinc-600">Loading…</div>;
  if (!doc) return <div className="text-zinc-600">Not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500">{doc.contentType}</div>
          <h1 className="text-2xl font-semibold text-zinc-900">{doc.title}</h1>
          <div className="mt-1 text-sm text-zinc-600">
            <Link className="underline" href={`/concepts/${doc.parentConceptId}`}>
              Back to concept
            </Link>
          </div>
        </div>
        <Button
          onClick={async () => {
            await save({ id: doc._id, blocks: blocks as any });
          }}
          disabled={!dirty}
        >
          Save
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="space-y-3">
          {blocks.map((b, idx) => (
            <div key={b.id} className="rounded-md border border-zinc-200 p-3">
              <div className="flex items-center justify-between gap-2">
                <select
                  className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm"
                  value={b.type}
                  onChange={(e) => {
                    const type = e.target.value as BlockType;
                    setBlocks((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, type } : x))
                    );
                  }}
                >
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setBlocks((prev) => {
                        if (idx === 0) return prev;
                        const copy = [...prev];
                        const tmp = copy[idx - 1];
                        copy[idx - 1] = copy[idx];
                        copy[idx] = tmp;
                        return copy;
                      });
                    }}
                  >
                    Up
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setBlocks((prev) => {
                        if (idx === prev.length - 1) return prev;
                        const copy = [...prev];
                        const tmp = copy[idx + 1];
                        copy[idx + 1] = copy[idx];
                        copy[idx] = tmp;
                        return copy;
                      });
                    }}
                  >
                    Down
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setBlocks((prev) => prev.filter((x) => x.id !== b.id))}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <textarea
                className="mt-2 min-h-24 w-full rounded-md border border-zinc-200 p-2 text-sm"
                value={b.text}
                onChange={(e) => {
                  const text = e.target.value;
                  setBlocks((prev) => prev.map((x) => (x.id === b.id ? { ...x, text } : x)));
                }}
              />
            </div>
          ))}

          <Button
            variant="secondary"
            onClick={() => {
              setBlocks((prev) => [
                ...prev,
                { id: crypto.randomUUID(), type: "paragraph", text: "" },
              ]);
            }}
          >
            + Add block
          </Button>
        </div>
      </div>
    </div>
  );
}
