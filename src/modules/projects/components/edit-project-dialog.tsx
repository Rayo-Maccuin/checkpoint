'use client';

import { useEffect, useState } from 'react';
import { Pencil, X } from 'lucide-react';
import { EditProjectForm } from '@/modules/projects/components/edit-project-form';
import type {
ProjectDetailPriority,
ProjectDetailStatus,
} from '@/modules/projects/types/project-detail';

interface EditProjectDialogProps {
project: {
id: string;
name: string;
description: string | null;
priority: ProjectDetailPriority;
status: ProjectDetailStatus;
};
}

export function EditProjectDialog({
project,
}: EditProjectDialogProps) {
const [isOpen, setIsOpen] = useState(false);

useEffect(() => {
if (!isOpen) {
return;
}


function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    setIsOpen(false);
  }
}

document.addEventListener('keydown', handleKeyDown);

return () => {
  document.removeEventListener('keydown', handleKeyDown);
};


}, [isOpen]);

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

return (
<>
<button
type="button"
onClick={() => setIsOpen(true)}
className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition hover:border-[#02F5A1]/30 hover:bg-[#02F5A1]/10 hover:text-[#02F5A1]"
> <Pencil className="h-4 w-4" />
Editar </button>

  {isOpen ? (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsOpen(false);
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-project-dialog-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-[#07191E] p-6 shadow-2xl shadow-black/40"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2
              id="edit-project-dialog-title"
              className="text-xl font-semibold text-white"
            >
              Editar proyecto
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Actualiza la información y el estado del proyecto.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-xl p-2 text-white/50 transition hover:bg-white/5 hover:text-white"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <EditProjectForm
          project={project}
          onSuccess={() => setIsOpen(false)}
        />
      </div>
    </div>
  ) : null}
</>


);
}
