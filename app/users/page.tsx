import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { UsersPanel } from '@/modules/auth/components/users-panel';
import { getUsers } from '@/modules/auth/queries/get-users';

export default async function UsersPage() {
  const result = await getUsers();

  return (
    <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white">
            <ArrowLeft className="size-4" />
            Volver al dashboard
          </Link>
        </header>

        {result.success ? (
          <UsersPanel users={result.users} />
        ) : (
          <section className="rounded-3xl border border-red-400/10 bg-red-400/[0.04] p-8">
            <h1 className="text-xl font-semibold">No pudimos cargar los usuarios</h1>
            <p className="mt-2 text-sm text-white/45">{result.message}</p>
          </section>
        )}
      </div>
    </main>
  );
}
