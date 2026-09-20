'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
AlertTriangle,
LoaderCircle,
Trash2,
X,
} from 'lucide-react';
import { gooeyToast } from 'goey-toast';

import { deleteProject } from '@/modules/projects/actions';
import {
deleteProjectSchema,
type DeleteProjectFormData,
} from '@/modules/projects/schemas/create-project';

interface DeleteProjectDialogProps {
projectId: string;
projectName: string;
}

export function DeleteProjectDialog({
projectId,
projectName,
}: DeleteProjectDialogProps) {
const router = useRouter();
const [isOpen, setIsOpen] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [serverError, setServerError] = useState<string | null>(null);

useEffect(() => {
if (!isOpen) {
return;
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !isDeleting) {
    setIsOpen(false);
  }
}

document.addEventListener('keydown', handleKeyDown);

return () => {
  document.removeEventListener('keydown', handleKeyDown);
};

}, [isOpen, isDeleting]);

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

function openDialog() {
setServerError(null);
setIsOpen(true);
}

function closeDialog() {
if (isDeleting) {
return;
}


setIsOpen(false);


}

async function handleDelete() {
if (isDeleting) {
return;
}


const validation = deleteProjectSchema.safeParse({
  projectId,
});

if (!validation.success) {
  setServerError('El proyecto no es válido.');
  return;
}

setServerError(null);
setIsDeleting(true);

const data: DeleteProjectFormData = validation.data;
const result = await deleteProject(data);

if (!result.success) {
  setServerError(result.message);

  gooeyToast.error('No se pudo eliminar el proyecto', {
    description: result.message,
  });

  setIsDeleting(false);
  return;
}

gooeyToast.success('Proyecto eliminado', {
  description: 'El proyecto se eliminó correctamente.',
});

setIsOpen(false);
router.replace('/');
router.refresh();
setIsDeleting(false);

}

return (
<> <button
     type="button"
     onClick={openDialog}
     className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2 text-sm font-medium text-red-300 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-200"
   > <Trash2 className="h-4 w-4" />
Eliminar </button>

  {isOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isDeleting
        ) {
          closeDialog();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-project-dialog-title"
        aria-describedby="delete-project-dialog-description"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#07191E] p-6 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="delete-project-dialog-title"
              className="text-xl font-semibold text-white"
            >
              Eliminar proyecto
            </h2>

            <p
              id="delete-project-dialog-description"
              className="mt-2 text-sm leading-6 text-white/60"
            >
              ¿Estás seguro de que quieres eliminar{' '}
              <span className="font-medium text-white">
                {projectName}
              </span>
              ?
            </p>

            <p className="mt-3 text-sm leading-6 text-red-300/80">
              Esta acción eliminará también sus fases, tareas,
              checkpoints, colaboradores e historial. No se puede
              deshacer.
            </p>
          </div>

          <button
            type="button"
            onClick={closeDialog}
            disabled={isDeleting}
            className="shrink-0 rounded-xl p-2 text-white/40 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {serverError ? (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {serverError}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={closeDialog}
            disabled={isDeleting}
            className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-500/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Eliminar proyecto
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null}
</>


);
}
