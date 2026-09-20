'use client';

import {
  Check,
  Circle,
  CircleAlert,
  CircleCheck,
  Clock3,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { gooeyToast } from 'goey-toast';

import {
  changeTaskPriority,
  changeTaskStatus,
  completeTask,
} from '@/modules/projects/actions/task-actions';

import { DeleteTaskDialog } from '@/modules/projects/components/delete-task-dialog';
import { TaskFormDialog } from '@/modules/projects/components/task-form-dialog';

import { CheckpointSelect } from '@/shared/components/checkpoint-select';

import type {
  ProjectDetail,
  ProjectDetailTask,
  ProjectDetailTaskPriority,
  ProjectDetailTaskStatus,
} from '@/modules/projects/types/project-detail';

interface TaskManagerProps {
  project: ProjectDetail;
}

const statusLabels: Record<
  ProjectDetailTaskStatus,
  string
> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  completed: 'Completada',
  blocked: 'Bloqueada',
  cancelled: 'Cancelada',
};

const priorityLabels: Record<
  ProjectDetailTaskPriority,
  string
> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  critical: 'Crítica',
};

const statusIcons: Record<
  ProjectDetailTaskStatus,
  typeof Circle
> = {
  pending: Circle,
  in_progress: Clock3,
  completed: CircleCheck,
  blocked: CircleAlert,
  cancelled: Circle,
};

const statusOrder: ProjectDetailTaskStatus[] = [
  'pending',
  'in_progress',
  'blocked',
  'completed',
  'cancelled',
];

const priorityOrder: ProjectDetailTaskPriority[] = [
  'low',
  'medium',
  'high',
  'critical',
];

const phaseAccentClasses = [
  'border-l-cyan-400/60',
  'border-l-violet-400/60',
  'border-l-blue-400/60',
  'border-l-[#02F5A1]/70',
  'border-l-amber-400/60',
  'border-l-orange-400/60',
  'border-l-pink-400/60',
  'border-l-indigo-400/60',
];

const phaseBadgeClasses = [
  'border-cyan-400/20 bg-cyan-400/[0.07] text-cyan-300/80',
  'border-violet-400/20 bg-violet-400/[0.07] text-violet-300/80',
  'border-blue-400/20 bg-blue-400/[0.07] text-blue-300/80',
  'border-[#02F5A1]/20 bg-[#02F5A1]/[0.07] text-[#02F5A1]/80',
  'border-amber-400/20 bg-amber-400/[0.07] text-amber-300/80',
  'border-orange-400/20 bg-orange-400/[0.07] text-orange-300/80',
  'border-pink-400/20 bg-pink-400/[0.07] text-pink-300/80',
  'border-indigo-400/20 bg-indigo-400/[0.07] text-indigo-300/80',
];

const phaseDotClasses = [
  'bg-cyan-400',
  'bg-violet-400',
  'bg-blue-400',
  'bg-[#02F5A1]',
  'bg-amber-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-indigo-400',
];

function getPhase(
  project: ProjectDetail,
  phaseId: string | null,
) {
  if (!phaseId) {
    return null;
  }

  return (
    project.phases.find(
      (phase) => phase.id === phaseId,
    ) ?? null
  );
}

function getPhaseIndex(
  project: ProjectDetail,
  phaseId: string | null,
) {
  if (!phaseId) {
    return -1;
  }

  return project.phases.findIndex(
    (phase) => phase.id === phaseId,
  );
}

function getStatusIcon(
  status: ProjectDetailTaskStatus,
) {
  return statusIcons[status];
}

function getPriorityClass(
  priority: ProjectDetailTaskPriority,
) {
  switch (priority) {
    case 'critical':
      return 'border-red-400/20 bg-red-400/10 text-red-300';

    case 'high':
      return 'border-orange-400/20 bg-orange-400/10 text-orange-300';

    case 'medium':
      return 'border-yellow-400/20 bg-yellow-400/10 text-yellow-300';

    case 'low':
      return 'border-white/10 bg-white/[0.03] text-white/40';
  }
}

function getStatusClass(
  status: ProjectDetailTaskStatus,
) {
  switch (status) {
    case 'completed':
      return 'border-[#02F5A1]/20 bg-[#02F5A1]/10 text-[#02F5A1]';

    case 'blocked':
      return 'border-red-400/20 bg-red-400/10 text-red-300';

    case 'in_progress':
      return 'border-blue-400/20 bg-blue-400/10 text-blue-300';

    case 'cancelled':
      return 'border-white/10 bg-white/[0.03] text-white/35';

    case 'pending':
      return 'border-white/10 bg-white/[0.03] text-white/45';
  }
}

function getPhaseAccentClass(
  project: ProjectDetail,
  phaseId: string | null,
) {
  const index = getPhaseIndex(
    project,
    phaseId,
  );

  if (index < 0) {
    return 'border-l-white/10';
  }

  return phaseAccentClasses[
    index % phaseAccentClasses.length
  ];
}

function getPhaseBadgeClass(
  project: ProjectDetail,
  phaseId: string | null,
) {
  const index = getPhaseIndex(
    project,
    phaseId,
  );

  if (index < 0) {
    return 'border-white/10 bg-white/[0.02] text-white/35';
  }

  return phaseBadgeClasses[
    index % phaseBadgeClasses.length
  ];
}

function getPhaseDotClass(
  project: ProjectDetail,
  phaseId: string | null,
) {
  const index = getPhaseIndex(
    project,
    phaseId,
  );

  if (index < 0) {
    return 'bg-white/20';
  }

  return phaseDotClasses[
    index % phaseDotClasses.length
  ];
}

export function TaskManager({
  project,
}: TaskManagerProps) {
  const router = useRouter();

  const [isCreateOpen, setIsCreateOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<ProjectDetailTask | null>(null);

  const [deletingTask, setDeletingTask] =
    useState<ProjectDetailTask | null>(null);

  const [openMenuTaskId, setOpenMenuTaskId] =
    useState<string | null>(null);

  const [isPending, startTransition] =
    useTransition();

  const currentUserMember =
    project.members.find(
      (member) =>
        member.id === project.currentUserId,
    );

  const canEdit =
    currentUserMember?.role === 'owner' ||
    currentUserMember?.role === 'collaborator';

  const canDelete =
    currentUserMember?.role === 'owner';

  function refreshProject() {
    router.refresh();
  }

  function handleStatusChange(
    task: ProjectDetailTask,
    status: ProjectDetailTaskStatus,
  ) {
    if (task.status === status) {
      return;
    }

    startTransition(async () => {
      const result =
        await changeTaskStatus({
          projectId: project.id,
          taskId: task.id,
          status,
        });

      if (!result.success) {
        gooeyToast.error(result.message);
        return;
      }

      gooeyToast.success(
        `Estado actualizado: ${statusLabels[status]}`,
      );

      refreshProject();
    });
  }

  function handlePriorityChange(
    task: ProjectDetailTask,
    priority: ProjectDetailTaskPriority,
  ) {
    if (task.priority === priority) {
      return;
    }

    startTransition(async () => {
      const result =
        await changeTaskPriority({
          projectId: project.id,
          taskId: task.id,
          priority,
        });

      if (!result.success) {
        gooeyToast.error(result.message);
        return;
      }

      gooeyToast.success(
        `Prioridad actualizada: ${priorityLabels[priority]}`,
      );

      refreshProject();
    });
  }

  function handleComplete(
    task: ProjectDetailTask,
  ) {
    if (task.status === 'completed') {
      return;
    }

    startTransition(async () => {
      const result = await completeTask({
        projectId: project.id,
        taskId: task.id,
      });

      if (!result.success) {
        gooeyToast.error(result.message);
        return;
      }

      gooeyToast.success('Tarea completada');

      refreshProject();
    });
  }

  const statusOptions =
    statusOrder.map((status) => ({
      value: status,
      label: statusLabels[status],
    }));

  const priorityOptions =
    priorityOrder.map((priority) => ({
      value: priority,
      label: priorityLabels[priority],
    }));

  return (
    <>
      <div className="overflow-visible rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="flex flex-col gap-4 border-b border-white/5 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">
              {project.tasks.length === 1
                ? '1 tarea'
                : `${project.tasks.length} tareas`}
            </p>

            <p className="mt-1 text-xs text-white/35">
              {project.completedTasks} completadas ·{' '}
              {project.progress}% del proyecto
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(true)
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-4 py-2.5 text-sm font-semibold text-[#07191E] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isPending}
            >
              <Plus
                size={17}
                strokeWidth={2.2}
              />

              Nueva tarea
            </button>
          )}
        </div>

        {project.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035]">
              <Check className="size-5 text-white/30" />
            </div>

            <h3 className="mt-4 font-semibold text-white">
              No hay tareas todavía.
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/40">
              Divide el trabajo del proyecto en
              tareas concretas para saber exactamente
              qué queda por hacer.
            </p>

            {canEdit && (
              <button
                type="button"
                onClick={() =>
                  setIsCreateOpen(true)
                }
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white"
              >
                <Plus size={16} />
                Crear primera tarea
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {project.tasks.map((task) => {
              const StatusIcon =
                getStatusIcon(task.status);

              const phase = getPhase(
                project,
                task.phaseId,
              );

              const phaseAccentClass =
                getPhaseAccentClass(
                  project,
                  task.phaseId,
                );

              const phaseBadgeClass =
                getPhaseBadgeClass(
                  project,
                  task.phaseId,
                );

              const phaseDotClass =
                getPhaseDotClass(
                  project,
                  task.phaseId,
                );

              return (
                <div
                  key={task.id}
                  className={[
                    'group relative flex flex-col gap-4 border-l-2 p-5',
                    'transition hover:bg-white/[0.015]',
                    'sm:p-6',
                    phaseAccentClass,
                  ].join(' ')}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={[
                        'mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border',
                        getStatusClass(
                          task.status,
                        ),
                      ].join(' ')}
                    >
                      <StatusIcon
                        size={17}
                        strokeWidth={1.8}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3
                            className={[
                              'font-medium leading-6',
                              task.status ===
                              'completed'
                                ? 'text-white/40 line-through'
                                : 'text-white',
                            ].join(' ')}
                          >
                            {task.title}
                          </h3>

                          {task.description && (
                            <p className="mt-1.5 max-w-3xl text-sm leading-6 text-white/40">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {canEdit && (
                          <div className="relative shrink-0">
                            <button
                              type="button"
                              aria-label={`Acciones de ${task.title}`}
                              aria-expanded={
                                openMenuTaskId ===
                                task.id
                              }
                              onClick={() =>
                                setOpenMenuTaskId(
                                  openMenuTaskId ===
                                  task.id
                                    ? null
                                    : task.id,
                                )
                              }
                              disabled={isPending}
                              className="flex size-9 items-center justify-center rounded-xl text-white/35 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
                            >
                              <MoreHorizontal
                                size={18}
                              />
                            </button>

                            {openMenuTaskId ===
                              task.id && (
                              <div className="absolute right-0 top-11 z-40 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#0b2025] p-1.5 shadow-2xl">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuTaskId(
                                      null,
                                    );
                                    setEditingTask(
                                      task,
                                    );
                                  }}
                                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                                >
                                  <Pencil
                                    size={15}
                                  />
                                  Editar tarea
                                </button>

                                {task.status !==
                                  'completed' && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleComplete(
                                        task,
                                      )
                                    }
                                    disabled={
                                      isPending
                                    }
                                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-[#02F5A1]/80 transition hover:bg-[#02F5A1]/5 hover:text-[#02F5A1] disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    <CircleCheck
                                      size={15}
                                    />
                                    Completar
                                  </button>
                                )}

                                {canDelete && (
                                  <>
                                    <div className="my-1 border-t border-white/5" />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOpenMenuTaskId(
                                          null,
                                        );
                                        setDeletingTask(
                                          task,
                                        );
                                      }}
                                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-300/80 transition hover:bg-red-400/5 hover:text-red-300"
                                    >
                                      <Trash2
                                        size={15}
                                      />
                                      Eliminar tarea
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span
                          className={[
                            'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                            getStatusClass(
                              task.status,
                            ),
                          ].join(' ')}
                        >
                          {statusLabels[
                            task.status
                          ]}
                        </span>

                        <span
                          className={[
                            'rounded-full border px-2.5 py-1 text-[11px] font-medium',
                            getPriorityClass(
                              task.priority,
                            ),
                          ].join(' ')}
                        >
                          {priorityLabels[
                            task.priority
                          ]}
                        </span>

                        <span
                          className={[
                            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium',
                            phaseBadgeClass,
                          ].join(' ')}
                        >
                          <span
                            className={[
                              'size-1.5 rounded-full',
                              phaseDotClass,
                            ].join(' ')}
                          />

                          {phase?.name ??
                            'Sin fase'}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-white/30">
                        <span className="inline-flex items-center gap-1.5">
                          <UserRound size={13} />

                          {task.assignedToName ??
                            'Sin responsable'}
                        </span>

                        <span>
                          Creada por{' '}
                          {task.createdByName ??
                            'Usuario'}
                        </span>

                        {task.completedByName && (
                          <span>
                            Completada por{' '}
                            {task.completedByName}
                          </span>
                        )}
                      </div>

                      {canEdit && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <CheckpointSelect
                            ariaLabel={`Estado de ${task.title}`}
                            value={task.status}
                            options={statusOptions}
                            onChange={(value) =>
                              handleStatusChange(
                                task,
                                value as ProjectDetailTaskStatus,
                              )
                            }
                            disabled={isPending}
                            className="w-40"
                          />

                          <CheckpointSelect
                            ariaLabel={`Prioridad de ${task.title}`}
                            value={task.priority}
                            options={
                              priorityOptions
                            }
                            onChange={(value) =>
                              handlePriorityChange(
                                task,
                                value as ProjectDetailTaskPriority,
                              )
                            }
                            disabled={isPending}
                            className="w-36"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <TaskFormDialog
        project={project}
        open={
          isCreateOpen ||
          Boolean(editingTask)
        }
        task={editingTask}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingTask(null);
        }}
        onSuccess={() => {
          setIsCreateOpen(false);
          setEditingTask(null);
          refreshProject();
        }}
      />

      <DeleteTaskDialog
        projectId={project.id}
        task={deletingTask}
        open={Boolean(deletingTask)}
        onClose={() =>
          setDeletingTask(null)
        }
        onSuccess={() => {
          setDeletingTask(null);
          refreshProject();
        }}
      />
    </>
  );
}