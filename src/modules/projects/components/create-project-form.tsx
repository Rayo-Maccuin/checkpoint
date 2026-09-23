'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Plus } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

import { CheckpointSelect } from '@/shared/components/checkpoint-select';

import { createProject } from '@/modules/projects/actions';
import {
  createProjectSchema,
  type CreateProjectFormData,
} from '@/modules/projects/schemas/create-project';

interface CreateProjectFormProps {
  onSuccess?: () => void;
}

const priorityOptions = [
  {
    value: 'low',
    label: 'Baja',
  },
  {
    value: 'medium',
    label: 'Media',
  },
  {
    value: 'high',
    label: 'Alta',
  },
  {
    value: 'critical',
    label: 'Crítica',
  },
] as const;

export function CreateProjectForm({
  onSuccess,
}: CreateProjectFormProps) {
  const router = useRouter();

  const [serverError, setServerError] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      priority: 'medium',
    },
    mode: 'onBlur',
  });

  async function onSubmit(data: CreateProjectFormData) {
    if (isSubmitting) {
      return;
    }

    setServerError(null);

    const result = await createProject(data);

    if (!result.success) {
      setServerError(result.message);

      gooeyToast.error('No se pudo crear el proyecto', {
        description: result.message,
      });

      return;
    }

    reset();

    gooeyToast.success('Proyecto creado', {
      description: 'El proyecto se creó correctamente.',
    });

    onSuccess?.();

    router.push(`/projects/${result.projectId}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5"
    >
      <div className="space-y-2">
        <label
          htmlFor="project-name"
          className="block text-sm font-medium text-white"
        >
          Nombre del proyecto
        </label>

        <input
          id="project-name"
          type="text"
          autoComplete="off"
          maxLength={120}
          placeholder="Ej. Sistema de inventario"
          disabled={isSubmitting}
          {...register('name')}
          className="h-11 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
        />

        {errors.name && (
          <p
            role="alert"
            className="text-xs text-red-400"
          >
            {errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="project-description"
          className="block text-sm font-medium text-white"
        >
          Descripción
          <span className="ml-1 font-normal text-white/30">
            opcional
          </span>
        </label>

        <textarea
          id="project-description"
          maxLength={500}
          rows={4}
          placeholder="Describe brevemente qué quieres construir."
          disabled={isSubmitting}
          {...register('description')}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/60 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-60"
        />

        {errors.description && (
          <p
            role="alert"
            className="text-xs text-red-400"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="project-priority"
          className="block text-sm font-medium text-white"
        >
          Prioridad
        </label>

        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <CheckpointSelect
              id="project-priority"
              value={field.value}
              onChange={field.onChange}
              options={priorityOptions.map((option) => ({
                value: option.value,
                label: option.label,
              }))}
              ariaLabel="Prioridad"
              disabled={isSubmitting}
              className="w-full"
            />
          )}
        />

        {errors.priority && (
          <p
            role="alert"
            className="text-xs text-red-400"
          >
            {errors.priority.message}
          </p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300"
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-4 text-sm font-semibold text-[#07191E] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
            />
            Creando proyecto...
          </>
        ) : (
          <>
            <Plus
              aria-hidden="true"
              className="size-4"
            />
            Crear proyecto
          </>
        )}
      </button>
    </form>
  );
}