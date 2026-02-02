export const dynamic = "force-dynamic";

import { AppShell } from "@/components/AppShell";
import { ContentEditor } from "./ui";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AppShell>
      <ContentEditor id={id} />
    </AppShell>
  );
}
