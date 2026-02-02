export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { ConceptDetail } from "./ui";

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <ConceptDetail id={id} />
    </AppShell>
  );
}
