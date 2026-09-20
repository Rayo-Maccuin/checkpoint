'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, LoaderCircle, X } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

import { deletePhase } from '@/modules/projects/actions/phase-actions';

interface DeletePhaseDialogProps {
  projectId: string;
  phaseId: string;
  phaseName: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeletePhaseDialog({
  projectId,
  phaseId,
  phaseName,
  open,
  onClose,
  onSuccess,
}: DeletePhaseDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isDeleting) {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isDeleting, onClose]);

  if (!open) {
    return null;
  }

  async function handleDelete() {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    const result = await deletePhase({
      projectId,
      phaseId,
    });

    if (!result.success) {
      gooeyToast.error('No se pudo eliminar la fase', {
        description: result.message,
      });

      setIsDeleting(false);

      return;
    }

    gooeyToast.success('Fase eliminada', {
      description: 'La fase fue eliminada correctamente.',
    });

    onSuccess();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isDeleting
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-phase-title"
        className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B2025] p-6 shadow-2xl shadow-black/40 sm:p-7"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-400/15 bg-red-400/10 text-red-300">
            <AlertTriangle
              aria-hidden="true"
              className="size-5"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2
                id="delete-phase-title"
                className="text-xl font-semibold text-white"
              >
                Eliminar fase
              </h2>

              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="rounded-xl p-2 text-white/35 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Cerrar"
              >
                <X aria-hidden="true" className="size-5" />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-white/50">
              ¿Seguro que quieres eliminar la fase{' '}
              <span className="font-medium text-white/80">
                «{phaseName}»
              </span>
              ?
            </p>

            <p className="mt-2 text-sm leading-6 text-white/35">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-400/90 px-5 text-sm font-semibold text-white transition-all hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting && (
              <LoaderCircle
                aria-hidden="true"
                className="size-4 animate-spin"
              />
            )}

            Eliminar fase
          </button>
        </div>
      </div>
    </div>
  );
}