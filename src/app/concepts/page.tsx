export const dynamic = "force-dynamic";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { ConceptsList } from "./ui";

export default function ConceptsPage() {
  return (
    <AppShell>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900">Video concepts</h1>
        <Link
          href="/concepts/new"
          className="rounded-md bg-black px-3 py-2 text-sm font-medium text-white"
        >
          New
        </Link>
      </div>
      <div className="mt-4">
        <ConceptsList />
      </div>
    </AppShell>
  );
}
