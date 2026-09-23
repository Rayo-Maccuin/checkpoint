'use client';

import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardLoadErrorProps {
  message: string;
}

export function DashboardLoadError({ message }: DashboardLoadErrorProps) {
  const router = useRouter();

  return (
    <section className="dashboard-load-error mt-16 rounded-3xl border border-red-400/10 bg-red-400/[0.04] p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-red-200/65">Dashboard</p>
      <h1 className="mt-3 text-xl font-semibold">No pudimos cargar tus proyectos</h1>
      <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">{message}</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      >
        <RefreshCw className="size-4" />
        Reintentar
      </button>
    </section>
  );
}
