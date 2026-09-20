'use client';

import { useState } from 'react';

import { Check, Pencil, Plus, Trash2, LoaderCircle } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { useRouter } from 'next/navigation';

import { changeCurrentPhase } from '@/modules/projects/actions/phase-actions';
import { DeletePhaseDialog } from '@/modules/projects/components/delete-phase-dialog';
import { PhaseFormDialog } from '@/modules/projects/components/phase-form-dialog';
import type { ProjectDetailPhase } from '@/modules/projects/types/project-detail';

interface PhaseManagerProps {
  projectId: string;
  currentPhaseId: string | null;
  phases: ProjectDetailPhase[];
  taskCounts: Record<
    string,
    {
      total: number;
      completed: number;
    }
  >;
}

type DialogState =
  | {
      type: 'create';
    }
  | {
      type: 'edit';
      phase: ProjectDetailPhase;
    }
  | {
      type: 'delete';
      phase: ProjectDetailPhase;
    }
  | null;

export function PhaseManager({
  projectId,
  currentPhaseId,
  phases,
  taskCounts,
}: PhaseManagerProps) {
  const router = useRouter();

  const [changingPhaseId, setChangingPhaseId] = useState<string | null>(
    null,
  );

  const [dialog, setDialog] = useState<DialogState>(null);

  async function handleChangePhase(phaseId: string) {
    if (
      phaseId === currentPhaseId ||
      changingPhaseId !== null
    ) {
      return;
    }

    setChangingPhaseId(phaseId);

    const result = await changeCurrentPhase({
      projectId,
      phaseId,
    });

    if (!result.success) {
      setChangingPhaseId(null);

      gooeyToast.error('No se pudo cambiar la fase', {
        description: result.message,
      });

      return;
    }

    gooeyToast.success('Fase actualizada', {
      description: 'La fase actual del proyecto cambió correctamente.',
    });

    setChangingPhaseId(null);
    router.refresh();
  }

  function handleDialogSuccess() {
    setDialog(null);
    router.refresh();
  }

  const hasActiveOperation = changingPhaseId !== null;

  if (phases.length === 0) {
    return (
      <>
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-white">
                No hay fases
              </h3>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Agrega la primera fase para comenzar a estructurar
                este proyecto.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setDialog({ type: 'create' })}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-4 text-sm font-semibold text-[#07191E] transition-all hover:brightness-95"
            >
              <Plus aria-hidden="true" className="size-4" />
              Nueva fase
            </button>
          </div>
        </div>

        <PhaseFormDialog
          mode="create"
          projectId={projectId}
          open={dialog?.type === 'create'}
          onClose={() => setDialog(null)}
          onSuccess={handleDialogSuccess}
        />
      </>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-white/40">
              {phases.length}{' '}
              {phases.length === 1 ? 'fase' : 'fases'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setDialog({ type: 'create' })}
            disabled={hasActiveOperation}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#02F5A1]/20 bg-[#02F5A1]/10 px-4 text-sm font-medium text-[#02F5A1] transition-colors hover:bg-[#02F5A1]/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus aria-hidden="true" className="size-4" />
            Nueva fase
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {phases.map((phase) => {
            const isCurrent = phase.id === currentPhaseId;
            const isChanging = phase.id === changingPhaseId;

            const counts = taskCounts[phase.id] ?? {
              total: 0,
              completed: 0,
            };

            const canDelete =
              !isCurrent && counts.total === 0;

            return (
              <div
                key={phase.id}
                className={[
                  'group flex flex-col gap-4 p-5 transition-colors',
                  'sm:flex-row sm:items-center sm:justify-between',
                  isCurrent
                    ? 'bg-[#02F5A1]/[0.045]'
                    : 'hover:bg-white/[0.02]',
                  hasActiveOperation && !isChanging
                    ? 'opacity-70'
                    : '',
                ].join(' ')}
              >
                <button
                  type="button"
                  disabled={
                    isCurrent ||
                    hasActiveOperation
                  }
                  onClick={() => handleChangePhase(phase.id)}
                  className="flex min-w-0 flex-1 items-start gap-4 text-left disabled:cursor-default"
                  aria-current={
                    isCurrent ? 'step' : undefined
                  }
                >
                  <div
                    className={[
                      'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                      isCurrent
                        ? 'border-[#02F5A1]/30 bg-[#02F5A1]/10 text-[#02F5A1]'
                        : 'border-white/10 bg-white/[0.03] text-white/35 group-hover:border-white/20 group-hover:text-white/60',
                    ].join(' ')}
                  >
                    {isChanging ? (
                      <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin"
                      />
                    ) : isCurrent ? (
                      <Check
                        aria-hidden="true"
                        className="size-4"
                      />
                    ) : (
                      phase.position + 1
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p
                        className={[
                          'font-medium',
                          isCurrent
                            ? 'text-white'
                            : 'text-white/70 group-hover:text-white',
                        ].join(' ')}
                      >
                        {phase.name}
                      </p>

                      {isCurrent && (
                        <span className="rounded-full border border-[#02F5A1]/20 bg-[#02F5A1]/10 px-2 py-0.5 text-[11px] font-medium text-[#02F5A1]">
                          Actual
                        </span>
                      )}
                    </div>

                    {phase.description && (
                      <p className="mt-1 text-sm leading-5 text-white/35">
                        {phase.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-white/25">
                      {counts.completed}/{counts.total} tareas
                    </p>
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-2 border-t border-white/5 pt-3 sm:border-t-0 sm:pt-0">
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() =>
                        handleChangePhase(phase.id)
                      }
                      disabled={hasActiveOperation}
                      className="h-9 rounded-lg border border-white/10 px-3 text-xs font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Establecer actual
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setDialog({
                        type: 'edit',
                        phase,
                      })
                    }
                    disabled={hasActiveOperation}
                    className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/40 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Editar ${phase.name}`}
                    title={`Editar ${phase.name}`}
                  >
                    <Pencil
                      aria-hidden="true"
                      className="size-4"
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDialog({
                        type: 'delete',
                        phase,
                      })
                    }
                    disabled={
                      hasActiveOperation ||
                      !canDelete
                    }
                    className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/35 transition-colors hover:border-red-400/20 hover:bg-red-400/5 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-25"
                    aria-label={
                      isCurrent
                        ? 'No se puede eliminar la fase actual'
                        : counts.total > 0
                          ? 'No se puede eliminar una fase con tareas'
                          : `Eliminar ${phase.name}`
                    }
                    title={
                      isCurrent
                        ? 'Cambia primero la fase actual'
                        : counts.total > 0
                          ? 'Esta fase tiene tareas asociadas'
                          : `Eliminar ${phase.name}`
                    }
                  >
                    <Trash2
                      aria-hidden="true"
                      className="size-4"
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <PhaseFormDialog
        mode="create"
        projectId={projectId}
        open={dialog?.type === 'create'}
        onClose={() => setDialog(null)}
        onSuccess={handleDialogSuccess}
      />

      <PhaseFormDialog
        mode="edit"
        projectId={projectId}
        phaseId={
          dialog?.type === 'edit'
            ? dialog.phase.id
            : undefined
        }
        initialName={
          dialog?.type === 'edit'
            ? dialog.phase.name
            : ''
        }
        initialDescription={
          dialog?.type === 'edit'
            ? dialog.phase.description
            : ''
        }
        open={dialog?.type === 'edit'}
        onClose={() => setDialog(null)}
        onSuccess={handleDialogSuccess}
      />

      <DeletePhaseDialog
        projectId={projectId}
        phaseId={
          dialog?.type === 'delete'
            ? dialog.phase.id
            : ''
        }
        phaseName={
          dialog?.type === 'delete'
            ? dialog.phase.name
            : ''
        }
        open={dialog?.type === 'delete'}
        onClose={() => setDialog(null)}
        onSuccess={handleDialogSuccess}
      />
    </>
  );
}