export default function ProjectLoading() {
  return (
    <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-5 w-36 animate-pulse rounded-lg bg-white/10" />

          <div className="h-10 w-32 animate-pulse rounded-xl bg-white/10" />
        </div>

        <div className="space-y-8">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
            <div className="animate-pulse">
              <div className="h-4 w-28 rounded bg-white/10" />

              <div className="mt-4 h-10 w-72 rounded-xl bg-white/10" />

              <div className="mt-4 h-4 w-full max-w-2xl rounded bg-white/10" />

              <div className="mt-8 h-2 w-full max-w-xs rounded-full bg-white/10" />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />

              <div className="mt-3 h-7 w-48 animate-pulse rounded-lg bg-white/10" />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6 sm:p-8">
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse"
                  >
                    <div className="h-3 w-24 rounded bg-white/10" />

                    <div className="mt-3 h-12 w-full rounded-lg bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <div className="h-3 w-20 animate-pulse rounded bg-white/10" />

              <div className="mt-3 h-7 w-32 animate-pulse rounded-lg bg-white/10" />
            </div>

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex animate-pulse items-center gap-4 border-b border-white/5 p-5 last:border-b-0"
                >
                  <div className="size-8 shrink-0 rounded-full bg-white/10" />

                  <div className="flex-1">
                    <div className="h-4 w-40 rounded bg-white/10" />

                    <div className="mt-2 h-3 w-64 rounded bg-white/10" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}