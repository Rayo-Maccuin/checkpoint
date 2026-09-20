'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import {
  CircleAlert,
  CircleCheck,
  CircleDot,
  CircleUserRound,
  X,
} from 'lucide-react';

import {
  useEffect,
  useTransition,
} from 'react';

import {
  Controller,
  useForm,
} from 'react-hook-form';

import { gooeyToast } from 'goey-toast';

import {
  createTask,
  updateTask,
} from '@/modules/projects/actions/task-actions';

import {
  createTaskSchema,
  updateTaskSchema,
  type CreateTaskFormData,
  type UpdateTaskFormData,
} from '@/modules/projects/schemas/task';

import type {
  ProjectDetail,
  ProjectDetailTask,
} from '@/modules/projects/types/project-detail';

import { CheckpointSelect } from '@/shared/components/checkpoint-select';

interface TaskFormDialogProps {
  project: ProjectDetail;
  task: ProjectDetailTask | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const priorityOptions = [
  {
    value: 'low',
    label: 'Baja',
    icon: (
      <CircleCheck
        size={15}
        className="text-white/35"
      />
    ),
  },
  {
    value: 'medium',
    label: 'Media',
    icon: (
      <CircleDot
        size={15}
        className="text-yellow-300/70"
      />
    ),
  },
  {
    value: 'high',
    label: 'Alta',
    icon: (
      <CircleAlert
        size={15}
        className="text-orange-300/80"
      />
    ),
  },
  {
    value: 'critical',
    label: 'Crítica',
    icon: (
      <CircleAlert
        size={15}
        className="text-red-300/80"
      />
    ),
  },
] as const;

const phaseColors = [
  'bg-cyan-400',
  'bg-violet-400',
  'bg-blue-400',
  'bg-[#02F5A1]',
  'bg-amber-400',
  'bg-orange-400',
  'bg-pink-400',
  'bg-indigo-400',
];

function DialogShell({
  title,
  description,
  children,
  onClose,
  isPending,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  onClose: () => void;
  isPending: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#02090b]/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-dialog-title"
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isPending
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-xl overflow-visible rounded-3xl border border-white/10 bg-[#0b2025] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 p-5 sm:p-6">
          <div>
            <h2
              id="task-dialog-title"
              className="text-lg font-semibold text-white"
            >
              {title}
            </h2>

            <p className="mt-1.5 text-sm leading-6 text-white/40">
              {description}
            </p>
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

        {children}
      </div>
    </div>
  );
}

function buildPhaseOptions(
  project: ProjectDetail,
) {
  return [
    {
      value: '',
      label: 'Sin fase',
    },
    ...project.phases.map(
      (phase, index) => ({
        value: phase.id,
        label: phase.name,
        icon: (
          <span
            className={[
              'size-2 rounded-full',
              phaseColors[
                index % phaseColors.length
              ],
            ].join(' ')}
          />
        ),
      }),
    ),
  ];
}

function buildMemberOptions(
  project: ProjectDetail,
) {
  return [
    {
      value: '',
      label: 'Sin responsable',
    },
    ...project.members.map((member) => ({
      value: member.id,
      label: member.name ?? 'Usuario',
      icon: (
        <CircleUserRound
          size={15}
          className="text-white/40"
        />
      ),
    })),
  ];
}

function CreateTaskForm({
  project,
  onClose,
  onSuccess,
}: {
  project: ProjectDetail;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] =
    useTransition();

  const form =
    useForm<CreateTaskFormData>({
      resolver: zodResolver(
        createTaskSchema,
      ),
      defaultValues: {
        projectId: project.id,
        title: '',
        description: '',
        phaseId:
          project.currentPhaseId,
        priority: 'medium',
        assignedTo: null,
      },
    });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(
    data: CreateTaskFormData,
  ) {
    startTransition(async () => {
      const result = await createTask(data);

      if (!result.success) {
        gooeyToast.error(result.message);
        return;
      }

      gooeyToast.success('Tarea creada');
      onSuccess();
    });
  }

  const phaseOptions =
    buildPhaseOptions(project);

  const memberOptions =
    buildMemberOptions(project);

  return (
    <DialogShell
      title="Nueva tarea"
      description="Define una tarea concreta para continuar el proyecto."
      onClose={onClose}
      isPending={isPending}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 p-5 sm:p-6"
      >
        <input
          type="hidden"
          {...register('projectId')}
        />

        <div>
          <label
            htmlFor="create-task-title"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Título
          </label>

          <input
            id="create-task-title"
            type="text"
            autoFocus
            maxLength={160}
            placeholder="Ej. Crear endpoint de autenticación"
            {...register('title')}
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          />

          {errors.title && (
            <p className="mt-1.5 text-xs text-red-300">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="create-task-description"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Descripción
          </label>

          <textarea
            id="create-task-description"
            rows={4}
            maxLength={1000}
            placeholder="Describe qué debe hacerse y qué resultado esperas."
            {...register('description')}
            disabled={isPending}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          />

          {errors.description && (
            <p className="mt-1.5 text-xs text-red-300">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="create-task-phase"
              className="mb-2 block text-sm font-medium text-white/75"
            >
              Fase
            </label>

            <Controller
              name="phaseId"
              control={control}
              render={({ field }) => (
                <CheckpointSelect
                  ariaLabel="Fase de la tarea"
                  value={field.value ?? ''}
                  options={phaseOptions}
                  placeholder="Sin fase"
                  onChange={(value) =>
                    field.onChange(
                      value || null,
                    )
                  }
                  disabled={isPending}
                />
              )}
            />

            {errors.phaseId && (
              <p className="mt-1.5 text-xs text-red-300">
                {errors.phaseId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="create-task-priority"
              className="mb-2 block text-sm font-medium text-white/75"
            >
              Prioridad
            </label>

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <CheckpointSelect
                  ariaLabel="Prioridad de la tarea"
                  value={field.value}
                  options={[
                    ...priorityOptions,
                  ]}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />

            {errors.priority && (
              <p className="mt-1.5 text-xs text-red-300">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="create-task-assigned-to"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Responsable
          </label>

          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <CheckpointSelect
                ariaLabel="Responsable de la tarea"
                value={field.value ?? ''}
                options={memberOptions}
                placeholder="Sin responsable"
                onChange={(value) =>
                  field.onChange(
                    value || null,
                  )
                }
                disabled={isPending}
              />
            )}
          />

          {errors.assignedTo && (
            <p className="mt-1.5 text-xs text-red-300">
              {errors.assignedTo.message}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#02F5A1] px-5 py-2.5 text-sm font-semibold text-[#07191E] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? 'Creando...'
              : 'Crear tarea'}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

function UpdateTaskForm({
  project,
  task,
  onClose,
  onSuccess,
}: {
  project: ProjectDetail;
  task: ProjectDetailTask;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [isPending, startTransition] =
    useTransition();

  const form =
    useForm<UpdateTaskFormData>({
      resolver: zodResolver(
        updateTaskSchema,
      ),
      defaultValues: {
        projectId: project.id,
        taskId: task.id,
        title: task.title,
        description:
          task.description ?? '',
        phaseId: task.phaseId,
        priority: task.priority,
        assignedTo: task.assignedTo,
      },
    });

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(
    data: UpdateTaskFormData,
  ) {
    startTransition(async () => {
      const result = await updateTask(data);

      if (!result.success) {
        gooeyToast.error(result.message);
        return;
      }

      gooeyToast.success(
        'Tarea actualizada',
      );

      onSuccess();
    });
  }

  const phaseOptions =
    buildPhaseOptions(project);

  const memberOptions =
    buildMemberOptions(project);

  return (
    <DialogShell
      title="Editar tarea"
      description="Actualiza la información de esta tarea."
      onClose={onClose}
      isPending={isPending}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-5 p-5 sm:p-6"
      >
        <input
          type="hidden"
          {...register('projectId')}
        />

        <input
          type="hidden"
          {...register('taskId')}
        />

        <div>
          <label
            htmlFor="update-task-title"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Título
          </label>

          <input
            id="update-task-title"
            type="text"
            autoFocus
            maxLength={160}
            {...register('title')}
            disabled={isPending}
            className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          />

          {errors.title && (
            <p className="mt-1.5 text-xs text-red-300">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="update-task-description"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Descripción
          </label>

          <textarea
            id="update-task-description"
            rows={4}
            maxLength={1000}
            {...register('description')}
            disabled={isPending}
            className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.04] disabled:cursor-not-allowed disabled:opacity-50"
          />

          {errors.description && (
            <p className="mt-1.5 text-xs text-red-300">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="update-task-phase"
              className="mb-2 block text-sm font-medium text-white/75"
            >
              Fase
            </label>

            <Controller
              name="phaseId"
              control={control}
              render={({ field }) => (
                <CheckpointSelect
                  ariaLabel="Fase de la tarea"
                  value={field.value ?? ''}
                  options={phaseOptions}
                  placeholder="Sin fase"
                  onChange={(value) =>
                    field.onChange(
                      value || null,
                    )
                  }
                  disabled={isPending}
                />
              )}
            />

            {errors.phaseId && (
              <p className="mt-1.5 text-xs text-red-300">
                {errors.phaseId.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="update-task-priority"
              className="mb-2 block text-sm font-medium text-white/75"
            >
              Prioridad
            </label>

            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <CheckpointSelect
                  ariaLabel="Prioridad de la tarea"
                  value={field.value}
                  options={[
                    ...priorityOptions,
                  ]}
                  onChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />

            {errors.priority && (
              <p className="mt-1.5 text-xs text-red-300">
                {errors.priority.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="update-task-assigned-to"
            className="mb-2 block text-sm font-medium text-white/75"
          >
            Responsable
          </label>

          <Controller
            name="assignedTo"
            control={control}
            render={({ field }) => (
              <CheckpointSelect
                ariaLabel="Responsable de la tarea"
                value={field.value ?? ''}
                options={memberOptions}
                placeholder="Sin responsable"
                onChange={(value) =>
                  field.onChange(
                    value || null,
                  )
                }
                disabled={isPending}
              />
            )}
          />

          {errors.assignedTo && (
            <p className="mt-1.5 text-xs text-red-300">
              {errors.assignedTo.message}
            </p>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-[#02F5A1] px-5 py-2.5 text-sm font-semibold text-[#07191E] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? 'Guardando...'
              : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </DialogShell>
  );
}

export function TaskFormDialog({
  project,
  task,
  open,
  onClose,
  onSuccess,
}: TaskFormDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  if (task) {
    return (
      <UpdateTaskForm
        key={task.id}
        project={project}
        task={task}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <CreateTaskForm
      project={project}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}