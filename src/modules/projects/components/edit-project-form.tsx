'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Save } from 'lucide-react';
import { gooeyToast } from 'goey-toast';

import { updateProject } from '@/modules/projects/actions';
import { CheckpointSelect } from '@/shared/components/checkpoint-select';
import {
updateProjectSchema,
type UpdateProjectFormData,
} from '@/modules/projects/schemas/create-project';
import type {
ProjectDetailPriority,
ProjectDetailStatus,
} from '@/modules/projects/types/project-detail';

interface EditProjectFormProps {
project: {
id: string;
name: string;
description: string | null;
priority: ProjectDetailPriority;
status: ProjectDetailStatus;
};
onSuccess?: () => void;
}

const priorityOptions = [
{ value: 'low', label: 'Baja' },
{ value: 'medium', label: 'Media' },
{ value: 'high', label: 'Alta' },
{ value: 'critical', label: 'Crítica' },
];

const statusOptions = [
{ value: 'idea', label: 'Idea' },
{ value: 'active', label: 'Activo' },
{ value: 'paused', label: 'Pausado' },
{ value: 'blocked', label: 'Bloqueado' },
{ value: 'completed', label: 'Completado' },
{ value: 'archived', label: 'Archivado' },
];

export function EditProjectForm({
project,
onSuccess,
}: EditProjectFormProps) {
const router = useRouter();
const [serverError, setServerError] = useState<string | null>(null);

const {
register,
handleSubmit,
control,
formState: { errors, isSubmitting },
} = useForm<UpdateProjectFormData>({
resolver: zodResolver(updateProjectSchema),
defaultValues: {
projectId: project.id,
name: project.name,
description: project.description ?? '',
priority: project.priority,
status: project.status,
},
mode: 'onBlur',
});

async function onSubmit(data: UpdateProjectFormData) {
if (isSubmitting) {
return;
}

setServerError(null);

const result = await updateProject(data);

if (!result.success) {
  setServerError(result.message);

  gooeyToast.error('No se pudo actualizar el proyecto', {
    description: result.message,
  });

  return;
}

gooeyToast.success('Proyecto actualizado', {
  description: 'Los cambios se guardaron correctamente.',
});

onSuccess?.();
router.refresh();

}

return ( <form
   onSubmit={handleSubmit(onSubmit)}
   noValidate
   className="space-y-5"
 >
<input type="hidden" {...register('projectId')} />

```
  <div className="space-y-2">
    <label
      htmlFor="edit-project-name"
      className="text-sm font-medium text-white/80"
    >
      Nombre
    </label>

    <input
      id="edit-project-name"
      type="text"
      {...register('name')}
      disabled={isSubmitting}
      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/50 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
      placeholder="Nombre del proyecto"
    />

    {errors.name ? (
      <p className="text-sm text-red-400">
        {errors.name.message}
      </p>
    ) : null}
  </div>

  <div className="space-y-2">
    <label
      htmlFor="edit-project-description"
      className="text-sm font-medium text-white/80"
    >
      Descripción
    </label>

    <textarea
      id="edit-project-description"
      {...register('description')}
      disabled={isSubmitting}
      rows={4}
      className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/50 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
      placeholder="Describe brevemente el proyecto"
    />

    {errors.description ? (
      <p className="text-sm text-red-400">
        {errors.description.message}
      </p>
    ) : null}
  </div>

  <div className="grid gap-4 sm:grid-cols-2">
    <div className="space-y-2">
      <label
        htmlFor="edit-project-priority"
        className="text-sm font-medium text-white/80"
      >
        Prioridad
      </label>

      <Controller
        name="priority"
        control={control}
        render={({ field }) => (
          <CheckpointSelect
            value={field.value}
            onChange={field.onChange}
            options={priorityOptions}
            placeholder="Selecciona una prioridad"
            disabled={isSubmitting}
            ariaLabel="Prioridad del proyecto"
          />
        )}
      />

      {errors.priority ? (
        <p className="text-sm text-red-400">
          {errors.priority.message}
        </p>
      ) : null}
    </div>

    <div className="space-y-2">
      <label
        htmlFor="edit-project-status"
        className="text-sm font-medium text-white/80"
      >
        Estado
      </label>

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <CheckpointSelect
            value={field.value}
            onChange={field.onChange}
            options={statusOptions}
            placeholder="Selecciona un estado"
            disabled={isSubmitting}
            ariaLabel="Estado del proyecto"
          />
        )}
      />

      {errors.status ? (
        <p className="text-sm text-red-400">
          {errors.status.message}
        </p>
      ) : null}
    </div>
  </div>

  {serverError ? (
    <div
      role="alert"
      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
    >
      {serverError}
    </div>
  ) : null}

  <button
    type="submit"
    disabled={isSubmitting}
    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-4 py-3 text-sm font-semibold text-[#07191E] transition hover:bg-[#02F5A1]/90 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {isSubmitting ? (
      <>
        <LoaderCircle className="h-4 w-4 animate-spin" />
        Guardando...
      </>
    ) : (
      <>
        <Save className="h-4 w-4" />
        Guardar cambios
      </>
    )}
  </button>
</form>


);
}
