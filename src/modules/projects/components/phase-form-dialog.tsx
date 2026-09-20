'use client';

import { useEffect } from 'react';
import { LoaderCircle, X } from 'lucide-react';
import { gooeyToast } from 'goey-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  createPhase,
  updatePhase,
} from '@/modules/projects/actions/phase-actions';
import {
  createPhaseSchema,
  updatePhaseSchema,
  type CreatePhaseFormData,
  type UpdatePhaseFormData,
} from '@/modules/projects/schemas/phase';

interface PhaseFormDialogProps {
  mode: 'create' | 'edit';
  projectId: string;
  phaseId?: string;
  initialName?: string;
  initialDescription?: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface DialogContentProps {
  mode: 'create' | 'edit';
  projectId: string;
  phaseId?: string;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSuccess: () => void;
}

function CreatePhaseForm({
  projectId,
  onClose,
  onSuccess,
}: {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<CreatePhaseFormData>({
    resolver: zodResolver(createPhaseSchema),
    defaultValues: {
      projectId,
      name: '',
      description: '',
    },
  });

  useEffect(() => {
    form.reset({
      projectId,
      name: '',
      description: '',
    });
  }, [projectId, form]);

  async function handleSubmit(data: CreatePhaseFormData) {
    const result = await createPhase(data);

    if (!result.success) {
      gooeyToast.error('No se pudo crear la fase', {
        description: result.message,
      });

      return;
    }

    gooeyToast.success('Fase creada', {
      description: 'La nueva fase fue agregada al proyecto.',
    });

    onSuccess();
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="mt-6 space-y-5"
    >
      <div>
        <label
          htmlFor="phase-name"
          className="text-sm font-medium text-white/70"
        >
          Nombre
        </label>

        <input
          id="phase-name"
          type="text"
          maxLength={100}
          autoFocus
          {...form.register('name')}
          disabled={form.formState.isSubmitting}
          className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ej. Implementación"
        />

        {form.formState.errors.name?.message && (
          <p className="mt-1.5 text-xs text-red-300">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phase-description"
          className="text-sm font-medium text-white/70"
        >
          Descripción
          <span className="ml-1 font-normal text-white/25">
            (opcional)
          </span>
        </label>

        <textarea
          id="phase-description"
          maxLength={500}
          rows={4}
          {...form.register('description')}
          disabled={form.formState.isSubmitting}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-5 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Describe brevemente qué se trabaja en esta fase."
        />

        {form.formState.errors.description?.message && (
          <p className="mt-1.5 text-xs text-red-300">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={form.formState.isSubmitting}
          className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-5 text-sm font-semibold text-[#07191E] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting && (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
            />
          )}

          Crear fase
        </button>
      </div>
    </form>
  );
}

function UpdatePhaseForm({
  projectId,
  phaseId,
  initialName,
  initialDescription,
  onClose,
  onSuccess,
}: {
  projectId: string;
  phaseId: string;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const form = useForm<UpdatePhaseFormData>({
    resolver: zodResolver(updatePhaseSchema),
    defaultValues: {
      projectId,
      phaseId,
      name: initialName,
      description: initialDescription,
    },
  });

  useEffect(() => {
    form.reset({
      projectId,
      phaseId,
      name: initialName,
      description: initialDescription,
    });
  }, [
    projectId,
    phaseId,
    initialName,
    initialDescription,
    form,
  ]);

  async function handleSubmit(data: UpdatePhaseFormData) {
    const result = await updatePhase(data);

    if (!result.success) {
      gooeyToast.error('No se pudo actualizar la fase', {
        description: result.message,
      });

      return;
    }

    gooeyToast.success('Fase actualizada', {
      description: 'Los cambios fueron guardados correctamente.',
    });

    onSuccess();
  }

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="mt-6 space-y-5"
    >
      <div>
        <label
          htmlFor="phase-name"
          className="text-sm font-medium text-white/70"
        >
          Nombre
        </label>

        <input
          id="phase-name"
          type="text"
          maxLength={100}
          autoFocus
          {...form.register('name')}
          disabled={form.formState.isSubmitting}
          className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Ej. Implementación"
        />

        {form.formState.errors.name?.message && (
          <p className="mt-1.5 text-xs text-red-300">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="phase-description"
          className="text-sm font-medium text-white/70"
        >
          Descripción
          <span className="ml-1 font-normal text-white/25">
            (opcional)
          </span>
        </label>

        <textarea
          id="phase-description"
          maxLength={500}
          rows={4}
          {...form.register('description')}
          disabled={form.formState.isSubmitting}
          className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-5 text-white outline-none transition-colors placeholder:text-white/20 focus:border-[#02F5A1]/40 focus:bg-white/[0.055] disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Describe brevemente qué se trabaja en esta fase."
        />

        {form.formState.errors.description?.message && (
          <p className="mt-1.5 text-xs text-red-300">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={form.formState.isSubmitting}
          className="h-11 rounded-xl border border-white/10 px-5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cancelar
        </button>

        <button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-5 text-sm font-semibold text-[#07191E] transition-all hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {form.formState.isSubmitting && (
            <LoaderCircle
              aria-hidden="true"
              className="size-4 animate-spin"
            />
          )}

          Guardar cambios
        </button>
      </div>
    </form>
  );
}

function DialogContent({
  mode,
  projectId,
  phaseId,
  initialName,
  initialDescription,
  onClose,
  onSuccess,
}: DialogContentProps) {
  if (mode === 'create') {
    return (
      <CreatePhaseForm
        projectId={projectId}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );
  }

  if (!phaseId) {
    return null;
  }

  return (
    <UpdatePhaseForm
      projectId={projectId}
      phaseId={phaseId}
      initialName={initialName}
      initialDescription={initialDescription}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

export function PhaseFormDialog({
  mode,
  projectId,
  phaseId,
  initialName = '',
  initialDescription = '',
  open,
  onClose,
  onSuccess,
}: PhaseFormDialogProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
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
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
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
        aria-labelledby="phase-form-title"
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0B2025] p-6 shadow-2xl shadow-black/40 sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="phase-form-title"
              className="text-xl font-semibold text-white"
            >
              {mode === 'edit' ? 'Editar fase' : 'Nueva fase'}
            </h2>

            <p className="mt-1 text-sm leading-5 text-white/40">
              {mode === 'edit'
                ? 'Actualiza la información de esta fase.'
                : 'Agrega una nueva fase al proyecto.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-white/35 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Cerrar"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <DialogContent
          mode={mode}
          projectId={projectId}
          phaseId={phaseId}
          initialName={initialName}
          initialDescription={initialDescription ?? ''}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
}