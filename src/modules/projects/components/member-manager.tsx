'use client';

import { useState, useTransition } from 'react';
import { Trash2, Users } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

import { AddMemberDialog } from '@/modules/projects/components/add-member-dialog';
import { removeProjectMember } from '@/modules/projects/actions/member-actions';

import type {
ProjectDetailMember,
ProjectDetailMemberRole,
} from '@/modules/projects/types/project-detail';

interface MemberManagerProps {
projectId: string;
members: ProjectDetailMember[];
currentUserId: string;
}

const roleLabels: Record<ProjectDetailMemberRole, string> = {
owner: 'Propietario',
collaborator: 'Colaborador',
viewer: 'Visualizador',
};

export function MemberManager({
projectId,
members,
currentUserId,
}: MemberManagerProps) {
const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
const [isPending, startTransition] = useTransition();

const currentUser = members.find(
(member) => member.id === currentUserId,
);

const isOwner = currentUser?.role === 'owner';

const handleMemberAdded = () => {
window.location.reload();
};

function handleRemove(memberId: string) {
startTransition(async () => {
  const result = await removeProjectMember(projectId, memberId);

  if (!result.success) {
    gooeyToast.error(result.message);
    return;
  }

  gooeyToast.success(result.message);
  window.location.reload();
});
}

return (
<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
<div className="mb-5 flex items-center justify-between gap-4">
<div className="flex items-center gap-3">
<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#02F5A1]/10 text-[#02F5A1]">
<Users size={20} />
</div>

      <div>
        <h2 className="text-sm font-semibold text-white">
          Colaboradores
        </h2>

        <p className="text-xs text-white/50">
          Personas con acceso a este proyecto
        </p>
      </div>
    </div>

    {isOwner && (
      <div className="flex items-center gap-2">
        <AddMemberDialog
          projectId={projectId}
          onSuccess={handleMemberAdded}
        />
      </div>
    )}
  </div>

  {members.length === 0 ? (
    <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center">
      <p className="text-sm text-white/50">
        No hay miembros asociados a este proyecto.
      </p>
    </div>
  ) : (
    <div className="space-y-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/10 px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white">
              {member.name?.charAt(0).toUpperCase() ?? '?'}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {member.name ?? 'Usuario sin nombre'}
              </p>

              {member.id === currentUserId && (
                <p className="text-xs text-white/40">
                  Tú
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={
                member.role === 'owner'
                  ? 'rounded-full bg-[#02F5A1]/10 px-2.5 py-1 text-[11px] font-medium text-[#02F5A1]'
                  : 'rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-medium text-white/50'
              }
            >
              {roleLabels[member.role]}
            </span>

            {isOwner && member.role !== 'owner' && (
              memberToRemove === member.id ? (
                <button
                  type="button"
                  onClick={() => handleRemove(member.id)}
                  disabled={isPending}
                  className="rounded-lg border border-red-400/20 px-2 py-1 text-[11px] font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
                >
                  {isPending ? 'Quitando...' : 'Confirmar'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMemberToRemove(member.id)}
                  className="inline-flex size-8 items-center justify-center rounded-lg text-white/30 transition hover:bg-red-400/10 hover:text-red-300"
                  aria-label={`Quitar a ${member.name ?? 'este usuario'} del proyecto`}
                  title="Quitar del proyecto"
                >
                  <Trash2 className="size-4" />
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )}
</section>

);
}