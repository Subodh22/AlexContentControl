export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { PipelineBoard } from "./ui";

export default function PipelinePage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Pipeline</h1>
      </div>
      <div className="mt-4">
        <PipelineBoard />
      </div>
    </AppShell>
  );
}
