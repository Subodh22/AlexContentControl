"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewConceptForm() {
  const router = useRouter();
  const create = useMutation(api.videoConcepts.create);

  const [title, setTitle] = useState("");
  const [pillar, setPillar] = useState<"AI_Apps" | "Sales_Entrepreneurship">(
    "AI_Apps"
  );
  const [outline, setOutline] = useState("");

  return (
    <div className="max-w-2xl rounded-lg border border-zinc-200 bg-white p-6">
      <div className="space-y-4">
        <div>
          <div className="text-sm font-medium">Title</div>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>

        <div>
          <div className="text-sm font-medium">Pillar</div>
          <select
            className="mt-1 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm"
            value={pillar}
            onChange={(e) => setPillar(e.target.value as any)}
          >
            <option value="AI_Apps">AI Applications & Automation</option>
            <option value="Sales_Entrepreneurship">Sales & Entrepreneurship</option>
          </select>
        </div>

        <div>
          <div className="text-sm font-medium">Outline (Notion-style blocks later)</div>
          <textarea
            className="mt-1 min-h-40 w-full rounded-md border border-zinc-200 bg-white p-3 text-sm"
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder="Write the structured outline here…"
          />
        </div>

        <Button
          onClick={async () => {
            const id = await create({
              title: title.trim(),
              pillar,
              source: "dashboard",
              outline: outline.trim() || undefined,
            });
            router.push(`/concepts/${id}`);
          }}
          disabled={!title.trim()}
        >
          Create
        </Button>
      </div>
    </div>
  );
}
