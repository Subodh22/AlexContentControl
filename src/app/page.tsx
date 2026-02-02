export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Alex Content Control
        </h1>
        <p className="text-zinc-600">
          Mission Control dashboard for ideas → research → derivatives.
        </p>
        <div className="flex gap-3">
          <Link className="underline" href="/concepts">
            Concepts
          </Link>
          <Link className="underline" href="/inbox">
            Inbox
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
