export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="mx-auto max-w-2xl rounded-lg border border-zinc-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-zinc-900">Not found</h1>
        <p className="mt-2 text-zinc-600">This page doesn’t exist.</p>
      </div>
    </div>
  );
}
