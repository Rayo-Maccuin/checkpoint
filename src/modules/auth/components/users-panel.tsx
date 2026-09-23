'use client';

import { useMemo, useState } from 'react';
import { Search, Trash2, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { gooeyToast } from 'goey-toast';

import { CreateUserDialog } from '@/modules/auth/components/create-user-dialog';
import { deleteUser } from '@/modules/auth/actions/delete-user';
import type { CheckpointUser } from '@/modules/auth/queries/get-users';

interface UsersPanelProps {
  users: CheckpointUser[];
}

const roleLabels = {
  admin: 'Administrador',
  collaborator: 'Colaborador',
  viewer: 'Viewer',
} as const;

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(
    new Date(date),
  );
}

export function UsersPanel({ users: initialUsers }: UsersPanelProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<CheckpointUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const users = initialUsers;

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term),
    );
  }, [search, users]);

  function handleCreated() {
    router.refresh();
  }

  async function handleDelete() {
    if (!userToDelete || isDeleting) return;

    setIsDeleting(true);
    const result = await deleteUser(userToDelete.id);

    if (!result.success) {
      gooeyToast.error(result.message);
      setIsDeleting(false);
      return;
    }

    gooeyToast.success(result.message);
    setUserToDelete(null);
    setIsDeleting(false);
    router.refresh();
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#02F5A1]/70">
            Administración global
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Usuarios
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/45">
            Personas registradas en Checkpoint, independientes de cualquier proyecto.
          </p>
        </div>
        <CreateUserDialog onSuccess={handleCreated} />
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Directorio</h2>
            <p className="mt-1 text-xs text-white/40">
              {users.length} {users.length === 1 ? 'usuario registrado' : 'usuarios registrados'}
            </p>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <span className="sr-only">Buscar usuarios</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre o correo"
              className="w-full rounded-xl border border-white/10 bg-black/10 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/40"
            />
          </label>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-sm text-white/40">
            {search ? 'No encontramos usuarios con esa búsqueda.' : 'Todavía no hay usuarios registrados.'}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredUsers.map((user) => (
              <div key={user.id} className="grid gap-4 px-5 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_auto_auto] sm:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#02F5A1]/10 text-sm font-semibold text-[#02F5A1]">
                    {user.name.charAt(0).toUpperCase() || <UserRound className="size-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{user.name}</p>
                    <p className="truncate text-xs text-white/40 sm:hidden">{user.email}</p>
                  </div>
                </div>
                <p className="hidden truncate text-sm text-white/55 sm:block">{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-white/55">
                    {roleLabels[user.role]}
                  </span>
                  <span className="rounded-full bg-[#02F5A1]/10 px-2.5 py-1 text-[#02F5A1]">{user.status}</span>
                  <span className="text-white/35">{formatDate(user.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    title={`Eliminar ${user.name}`}
                    aria-label={`Eliminar ${user.name}`}
                    onClick={() => setUserToDelete(user)}
                    className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/35 transition hover:border-red-400/30 hover:text-red-300"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div role="dialog" aria-modal="true" aria-labelledby="delete-user-title" className="w-full max-w-md rounded-3xl border border-white/10 bg-[#07191E] p-6 shadow-2xl">
            <h2 id="delete-user-title" className="text-lg font-semibold text-white">Eliminar usuario</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              ¿Quieres eliminar a <span className="font-medium text-white">{userToDelete.name}</span>? También perderá el acceso a sus proyectos.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setUserToDelete(null)} disabled={isDeleting} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/65 transition hover:bg-white/5 disabled:opacity-40">
                Cancelar
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting} className="rounded-xl bg-red-400/90 px-4 py-2.5 text-sm font-semibold text-[#07191E] transition hover:bg-red-300 disabled:opacity-40">
                {isDeleting ? 'Eliminando...' : 'Eliminar usuario'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
