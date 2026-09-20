'use client';

import { useEffect, useState, useTransition } from 'react';

import {
  ArrowRight,
  CircleAlert,
  CircleCheck,
  FileCheck2,
  LoaderCircle,
  X,
} from 'lucide-react';

import { gooeyToast } from 'goey-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';

import { createCheckpoint } from '@/modules/projects/actions/checkpoint-actions';
import {
  createCheckpointSchema,
  type CreateCheckpointFormData,
} from '@/modules/projects/schemas/checkpoint';

interface CheckpointFormDialogProps {
  projectId: string;
  currentPhaseName: string | null;
}

const defaultValues: CreateCheckpointFormData = {
  projectId: '',
  whatDone: '',
  whatWorks: '',
  whatRemains: '',
  blockers: '',
  nextStep: '',
};

function FieldMessage({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-300">
      <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
      {message}
    </p>
  );
}

function DialogShell({
  children,
  onClose,
  titleId,
}: {
  children: React.ReactNode;
  onClose: () => void;
  titleId: string;
}) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#07191E] shadow-2xl shadow-black/40"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function CheckpointFormDialog({
  projectId,
  currentPhaseName,
}: CheckpointFormDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCheckpointFormData>({
    resolver: zodResolver(createCheckpointSchema),
    defaultValues: {
      ...defaultValues,
      projectId,
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  function handleClose() {
    if (isPending) {
      return;
    }

    setOpen(false);
    reset({
      ...defaultValues,
      projectId,
    });
  }

  function handleOpen() {
    if (isPending) {
      return;
    }

    reset({
      ...defaultValues,
      projectId,
    });

    setOpen(true);
  }

  function onSubmit(data: CreateCheckpointFormData) {
    if (isPending) {
      return;
    }

    startTransition(async () => {
      const result = await createCheckpoint(data);

      if (!result.success) {
        gooeyToast.error('No se pudo guardar el checkpoint', {
          description: result.message,
        });

        return;
      }

      gooeyToast.success('Checkpoint guardado', {
        description: 'El contexto del proyecto se guardó correctamente.',
      });

      setOpen(false);

      reset({
        ...defaultValues,
        projectId,
      });

      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-4 text-sm font-semibold text-[#07191E] transition-all hover:brightness-95 active:scale-[0.98]"
      >
        <FileCheck2 aria-hidden="true" className="size-4" />
        Guardar checkpoint
      </button>

      {open && (
        <DialogShell
          onClose={handleClose}
          titleId="checkpoint-dialog-title"
        >
          <div className="flex items-start justify-between gap-4 border-b border-white/5 px-6 py-5 sm:px-7">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[#02F5A1]">
                <FileCheck2
                  aria-hidden="true"
                  className="size-4"
                />

                <span className="text-xs font-medium uppercase tracking-[0.16em]">
                  Punto de control
                </span>
              </div>

              <h2
                id="checkpoint-dialog-title"
                className="mt-2 text-xl font-semibold tracking-tight text-white"
              >
                Guardar checkpoint
              </h2>

              <p className="mt-1.5 text-sm leading-5 text-white/40">
                Guarda el contexto actual para poder retomar el proyecto
                más adelante.
              </p>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={isPending}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/10 text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Cerrar"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[calc(90vh-105px)] overflow-y-auto"
          >
            <div className="space-y-6 px-6 py-6 sm:px-7">
              <div className="rounded-2xl border border-[#02F5A1]/10 bg-[#02F5A1]/[0.035] px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                  Fase actual
                </p>

                <p className="mt-1 text-sm font-medium text-white">
                  {currentPhaseName ?? 'Sin fase actual'}
                </p>
              </div>

              <div>
                <label
                  htmlFor="checkpoint-what-done"
                  className="text-sm font-medium text-white/80"
                >
                  ¿Qué hiciste?
                </label>

                <textarea
                  id="checkpoint-what-done"
                  {...register('whatDone')}
                  autoFocus
                  rows={4}
                  maxLength={2000}
                  placeholder="Describe brevemente lo que avanzaste..."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.05]"
                />

                <div className="mt-1.5 flex justify-between gap-4">
                  <FieldMessage message={errors.whatDone?.message} />

                  <span className="ml-auto text-[11px] text-white/20">
                    Máx. 2000
                  </span>
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkpoint-what-works"
                  className="text-sm font-medium text-white/80"
                >
                  ¿Qué funciona?
                  <span className="ml-2 text-xs font-normal text-white/25">
                    Opcional
                  </span>
                </label>

                <textarea
                  id="checkpoint-what-works"
                  {...register('whatWorks')}
                  rows={3}
                  maxLength={2000}
                  placeholder="Qué quedó funcionando correctamente..."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.05]"
                />

                <FieldMessage message={errors.whatWorks?.message} />
              </div>

              <div>
                <label
                  htmlFor="checkpoint-what-remains"
                  className="text-sm font-medium text-white/80"
                >
                  ¿Qué quedó pendiente?
                  <span className="ml-2 text-xs font-normal text-white/25">
                    Opcional
                  </span>
                </label>

                <textarea
                  id="checkpoint-what-remains"
                  {...register('whatRemains')}
                  rows={3}
                  maxLength={2000}
                  placeholder="Qué falta por terminar o revisar..."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.05]"
                />

                <FieldMessage message={errors.whatRemains?.message} />
              </div>

              <div>
                <label
                  htmlFor="checkpoint-blockers"
                  className="text-sm font-medium text-white/80"
                >
                  ¿Algún problema?
                  <span className="ml-2 text-xs font-normal text-white/25">
                    Opcional
                  </span>
                </label>

                <textarea
                  id="checkpoint-blockers"
                  {...register('blockers')}
                  rows={3}
                  maxLength={2000}
                  placeholder="Errores, bloqueos o cosas que debas recordar..."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.05]"
                />

                <FieldMessage message={errors.blockers?.message} />
              </div>

              <div>
                <label
                  htmlFor="checkpoint-next-step"
                  className="text-sm font-medium text-white/80"
                >
                  ¿Qué debes hacer después?
                </label>

                <textarea
                  id="checkpoint-next-step"
                  {...register('nextStep')}
                  rows={3}
                  maxLength={1000}
                  placeholder="Define la próxima acción concreta..."
                  className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.05]"
                />

                <div className="mt-1.5 flex justify-between gap-4">
                  <FieldMessage message={errors.nextStep?.message} />

                  <span className="ml-auto text-[11px] text-white/20">
                    Máx. 1000
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-white/5 bg-white/[0.015] px-6 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-5 text-sm font-semibold text-[#07191E] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CircleCheck
                      aria-hidden="true"
                      className="size-4"
                    />
                    Guardar checkpoint
                    <ArrowRight
                      aria-hidden="true"
                      className="size-4"
                    />
                  </>
                )}
              </button>
            </div>
          </form>
        </DialogShell>
      )}
    </>
  );
}