export default function UsersLoading() {
  return (
    <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl animate-pulse">
        <div className="h-4 w-36 rounded bg-white/10" />
        <div className="mt-12 h-10 w-48 rounded-xl bg-white/10" />
        <div className="mt-3 h-4 w-96 max-w-full rounded bg-white/10" />
        <div className="mt-8 h-[30rem] rounded-3xl border border-white/10 bg-white/[0.03]" />
      </div>
    </main>
  );
}
