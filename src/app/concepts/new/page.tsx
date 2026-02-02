export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { NewConceptForm } from "./ui";

export default function NewConceptPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-zinc-900">New concept</h1>
      <div className="mt-4">
        <NewConceptForm />
      </div>
    </AppShell>
  );
}
