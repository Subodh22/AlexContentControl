export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { InboxList } from "./ui";

export default function InboxPage() {
  return (
    <AppShell>
      <h1 className="text-2xl font-semibold text-zinc-900">Idea inbox</h1>
      <div className="mt-4">
        <InboxList />
      </div>
    </AppShell>
  );
}
