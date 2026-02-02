import Link from "next/link";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-semibold text-zinc-900">
              MasterControl
            </Link>
            <nav className="hidden gap-3 text-sm text-zinc-600 sm:flex">
              <Link href="/concepts" className="hover:text-zinc-900">
                Concepts
              </Link>
              <Link href="/inbox" className="hover:text-zinc-900">
                Inbox
              </Link>
              <Link href="/calendar" className="hover:text-zinc-900">
                Calendar
              </Link>
            </nav>
          </div>
          <div className="text-sm text-zinc-500">No auth</div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
