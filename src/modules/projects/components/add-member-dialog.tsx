'use client';

import { useEffect, useState, useTransition } from 'react';
import { UserPlus, X } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

import { addProjectMember } from '@/modules/projects/actions/member-actions';
import { getProjectAvailableMembers } from '@/modules/projects/queries/get-project-available-members';
import { CheckpointSelect } from '@/shared/components/checkpoint-select';

interface AvailableMember {
id: string;
name: string | null;
avatarUrl: string | null;
}

interface AddMemberDialogProps {
projectId: string;
onSuccess: () => void;
}

export function AddMemberDialog({
projectId,
onSuccess,
}: AddMemberDialogProps) {
const [isOpen, setIsOpen] = useState(false);
const [members, setMembers] = useState<AvailableMember[]>([]);
const [selectedUserId, setSelectedUserId] = useState('');
const [role, setRole] = useState<'collaborator' | 'viewer'>('collaborator');
const [isLoadingMembers, setIsLoadingMembers] = useState(false);
const [isPending, startTransition] = useTransition();

useEffect(() => {
if (!isOpen) {
return;
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !isPending) {
    setIsOpen(false);
  }
}

document.addEventListener('keydown', handleKeyDown);

return () => {
  document.removeEventListener('keydown', handleKeyDown);
};

}, [isOpen, isPending]);

useEffect(() => {
if (!isOpen) {
return;
}

const previousOverflow = document.body.style.overflow;
document.body.style.overflow = 'hidden';

return () => {
  document.body.style.overflow = previousOverflow;
};

}, [isOpen]);

async function handleOpen() {
setIsOpen(true);
setSelectedUserId('');
setRole('collaborator');
setIsLoadingMembers(true);

const result = await getProjectAvailableMembers(projectId);

if (!result.success) {
  gooeyToast.error(result.message);
  setMembers([]);
  setIsLoadingMembers(false);
  return;
}

setMembers(result.members);
setIsLoadingMembers(false);

}

function handleClose() {
if (isPending) {
return;
}

setIsOpen(false);

}

function handleSubmit() {
if (!selectedUserId) {
gooeyToast.error('Selecciona un usuario.');
return;
}

startTransition(async () => {
  const result = await addProjectMember(
    projectId,
    selectedUserId,
    role,
  );

  if (!result.success) {
    gooeyToast.error(result.message);
    return;
  }

  gooeyToast.success(result.message);

  setIsOpen(false);
  setSelectedUserId('');
  setRole('collaborator');

  onSuccess();
});

}

return (
<>
<button type="button" onClick={handleOpen} className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/80 transition hover:border-[#02F5A1]/30 hover:bg-[#02F5A1]/5 hover:text-[#02F5A1]" >
<UserPlus className="size-4" />
Agregar miembro
</button>

  {isOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-dialog-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#07191E] p-6 shadow-2xl shadow-black/40"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-member-dialog-title"
              className="text-xl font-semibold text-white"
            >
              Agregar miembro
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Dale acceso a otra persona para trabajar en este proyecto.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isPending}
            className="rounded-xl p-2 text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label
              htmlFor="project-member"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Usuario
            </label>

            {isLoadingMembers ? (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/40">
                Cargando usuarios...
              </div>
            ) : members.length === 0 ? (
              <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-sm text-white/40">
                No hay usuarios disponibles para agregar.
              </div>
            ) : (
              <CheckpointSelect
                id="project-member"
                value={selectedUserId}
                onChange={setSelectedUserId}
                options={members.map((member) => ({
                  value: member.id,
                  label: member.name ?? 'Usuario sin nombre',
                }))}
                placeholder="Selecciona un usuario"
                ariaLabel="Usuario del proyecto"
                disabled={isPending}
                className="w-full"
              />
            )}
          </div>

          <div>
            <label
              htmlFor="project-member-role"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Permiso
            </label>

            <CheckpointSelect
              id="project-member-role"
              value={role}
              onChange={(value) =>
                setRole(value as 'collaborator' | 'viewer')
              }
              options={[
                { value: 'collaborator', label: 'Colaborador' },
                { value: 'viewer', label: 'Visualizador' },
              ]}
              ariaLabel="Permiso del miembro"
              disabled={isPending}
              className="w-full"
            />

            <p className="mt-2 text-xs leading-5 text-white/35">
              Los colaboradores pueden trabajar en las tareas.
              Los visualizadores solo pueden consultar el proyecto.
            </p>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                isPending ||
                isLoadingMembers ||
                members.length === 0 ||
                !selectedUserId
              }
              className="rounded-xl bg-[#02F5A1] px-4 py-2.5 text-sm font-semibold text-[#07191E] transition hover:bg-[#02F5A1]/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isPending ? 'Agregando...' : 'Agregar miembro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null}
</>

);
}