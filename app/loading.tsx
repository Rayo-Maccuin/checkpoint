export default function Loading() {
  return (
    <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="h-3 w-24 rounded bg-white/10" />
            <div className="mt-4 h-10 w-64 rounded-xl bg-white/10" />
            <div className="mt-3 h-4 w-80 max-w-full rounded bg-white/10" />
          </div>
          <div className="h-11 w-40 rounded-xl bg-white/10" />
        </div>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
        <div className="mt-12 h-64 rounded-3xl border border-white/10 bg-white/[0.03]" />
        <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-52 rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      </div>
    </main>
  );
}
