export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { KanbanBoard } from "./ui";

export default function KanbanPage() {
  return (
    <AppShell>
      <KanbanBoard />
    </AppShell>
  );
}
