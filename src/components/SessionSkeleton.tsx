export function SessionSkeleton() {
  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-5 w-36" />
            <div className="skeleton h-8 w-64" />
          </div>
          <div className="skeleton h-10 w-36" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
          <div className="skeleton h-28" />
        </div>
        <div className="skeleton h-12" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="skeleton h-56" />
          <div className="skeleton h-56" />
          <div className="skeleton h-56" />
          <div className="skeleton h-56" />
        </div>
      </div>
    </main>
  );
}
