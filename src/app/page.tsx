export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Boards</h1>
        <p className="text-zinc-600">
          Go to <Link className="underline" href="/kanban">/kanban</Link>.
        </p>
      </div>
    </AppShell>
  );
}
