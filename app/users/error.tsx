'use client';

import { RefreshCw } from 'lucide-react';

export default function UsersError({ reset }: { reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07191E] px-5 py-8 text-white sm:px-8">
      <section className="w-full max-w-lg rounded-3xl border border-red-400/15 bg-red-400/[0.04] p-7">
        <h1 className="text-2xl font-semibold">No pudimos cargar los usuarios</h1>
        <p className="mt-2 text-sm leading-6 text-white/50">Revisa tu conexión e inténtalo nuevamente.</p>
        <button type="button" onClick={() => reset()} className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-[#02F5A1] px-4 text-sm font-semibold text-[#07191E] transition hover:brightness-95">
          <RefreshCw className="size-4" />
          Reintentar
        </button>
      </section>
    </main>
  );
}
