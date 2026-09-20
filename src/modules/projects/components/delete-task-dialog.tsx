'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useEffect, useTransition } from 'react';
import { gooeyToast } from 'goey-toast';

import { deleteTask } from '@/modules/projects/actions/task-actions';
import type { ProjectDetailTask } from '@/modules/projects/types/project-detail';

interface DeleteTaskDialogProps {
  projectId: string;
  task: ProjectDetailTask | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteTaskDialog({
  projectId,
  task,
  open,
  onClose,
  onSuccess,
}: DeleteTaskDialogProps) {
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isPending) {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isPending, onClose]);

  if (!open || !task) {
    return null;
  }

  const taskId = task.id;
  const taskTitle = task.title;
  const taskDescription = task.description;

  function handleDelete() {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      const result = await deleteTask({
        projectId,
        taskId,
      });

      if (!result.success) {
        gooeyToast.error(result.message);
        return;
      }

      gooeyToast.success('Tarea eliminada');
      onSuccess();
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#02090b]/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-task-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isPending) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0b2025] shadow-2xl">
        <div className="flex items-start justify-between gap-4 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/10 text-red-300">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h2
                id="delete-task-title"
                className="text-lg font-semibold text-white"
              >
                Eliminar tarea
              </h2>

              <p className="mt-1.5 text-sm leading-6 text-white/40">
                Esta acción eliminará permanentemente la tarea.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            aria-label="Cerrar"
            className="flex size-9 shrink-0 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 pb-5 sm:px-6">
          <div className="rounded-2xl border border-white/5 bg-white/[0.025] px-4 py-3">
            <p className="text-sm font-medium text-white">
              {taskTitle}
            </p>

            {taskDescription && (
              <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white/35">
                {taskDescription}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/5 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-xl bg-red-400/10 px-4 py-2.5 text-sm font-semibold text-red-300 ring-1 ring-inset ring-red-400/20 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? 'Eliminando...' : 'Eliminar tarea'}
          </button>
        </div>
      </div>
    </div>
  );
}