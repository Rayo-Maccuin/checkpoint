'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  Circle,
  Eye,
  EyeOff,
  LoaderCircle,
  UserPlus,
  X,
} from 'lucide-react';
import { gooeyToast } from 'goey-toast';

import { CheckpointSelect } from '@/shared/components/checkpoint-select';

interface CreateUserDialogProps {
onSuccess?: () => void;
}

export function CreateUserDialog({
onSuccess,
}: CreateUserDialogProps) {
const [open, setOpen] = useState(false);
const [name, setName] = useState('');
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [role, setRole] = useState<
  'admin' | 'collaborator' | 'viewer'
>('collaborator');
const [showPassword, setShowPassword] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [status, setStatus] = useState<'idle' | 'error'>('idle');

const passwordRequirements = [
  { label: '8 caracteres como mínimo', valid: password.length >= 8 },
  { label: 'Una letra mayúscula', valid: /[A-Z]/.test(password) },
  { label: 'Una letra minúscula', valid: /[a-z]/.test(password) },
  { label: 'Un número', valid: /[0-9]/.test(password) },
];

useEffect(() => {
if (!open) {
return;
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && !isSubmitting) {
    setOpen(false);
  }
}

window.addEventListener('keydown', handleKeyDown);

return () => {
  window.removeEventListener('keydown', handleKeyDown);
};

}, [open, isSubmitting]);

function resetForm() {
setName('');
setEmail('');
setPassword('');
setRole('collaborator');
setShowPassword(false);
setStatus('idle');
}

function handleClose() {
if (isSubmitting) {
return;
}

setOpen(false);
resetForm();

}

async function handleSubmit(
event: React.FormEvent<HTMLFormElement>,
) {
event.preventDefault();

if (isSubmitting) {
  return;
}

setIsSubmitting(true);
setStatus('idle');

try {
  const { createUser } = await import(
    '@/modules/auth/actions/create-user'
  );

  const result = await createUser({
    name,
    email,
    password,
    role,
  });

  if (!result.success) {
    setStatus('error');
    gooeyToast.error(result.message);
    return;
  }

  gooeyToast.success(result.message);

  setOpen(false);
  resetForm();
  onSuccess?.();
} catch {
  setStatus('error');

  gooeyToast.error(
    'No fue posible crear el usuario. Intenta nuevamente.',
  );
} finally {
  setIsSubmitting(false);
}

}

return (
<>
<button
type="button"
onClick={() => setOpen(true)}
className="inline-flex items-center gap-2 rounded-xl border border-[#02F5A1]/30 bg-[#02F5A1]/10 px-4 py-2 text-sm font-medium text-[#02F5A1] transition hover:border-[#02F5A1]/50 hover:bg-[#02F5A1]/15 disabled:cursor-not-allowed disabled:opacity-50"
>
<UserPlus className="h-4 w-4" />
Crear usuario
</button>

  {open && (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !isSubmitting
        ) {
          handleClose();
        }
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="create-user-title" className="w-full max-w-md rounded-3xl border border-white/10 bg-[#07191E] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 id="create-user-title" className="text-lg font-semibold text-white">
              Crear usuario
            </h2>

            <p className="mt-1 text-sm text-white/50">
              Registra una persona en la plataforma Checkpoint.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-white/50 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          {status === 'error' && (
            <div role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              No se pudo crear el usuario. Revisa los datos e
              inténtalo de nuevo.
            </div>
          )}

          <div>
            <label
              htmlFor="create-user-name"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Nombre
            </label>

            <input
              id="create-user-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              autoComplete="name"
              disabled={isSubmitting}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label
              htmlFor="create-user-email"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Correo electrónico
            </label>

            <input
              id="create-user-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              maxLength={254}
              autoComplete="email"
              disabled={isSubmitting}
              required
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label
              htmlFor="create-user-role"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Rol global
            </label>

            <CheckpointSelect
              id="create-user-role"
              value={role}
              onChange={(value) =>
                setRole(value as 'admin' | 'collaborator' | 'viewer')
              }
              options={[
                { value: 'collaborator', label: 'Colaborador' },
                { value: 'viewer', label: 'Viewer' },
                { value: 'admin', label: 'Administrador' },
              ]}
              ariaLabel="Rol global"
              disabled={isSubmitting}
              className="w-full"
            />

            <p className="mt-2 text-xs leading-5 text-white/40">
              El administrador puede gestionar usuarios y asignar roles globales.
            </p>
          </div>

          <div>
            <label
              htmlFor="create-user-password"
              className="mb-2 block text-sm font-medium text-white/80"
            >
              Contraseña inicial
            </label>

            <div className="relative">
              <input
                id="create-user-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                disabled={isSubmitting}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-12 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#02F5A1]/50 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Mínimo 8 caracteres"
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                disabled={isSubmitting}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                  <Eye aria-hidden="true" className="size-4" />
                )}
              </button>
            </div>

            <ul aria-label="Requisitos de contraseña" className="mt-3 grid gap-1.5 text-xs">
              {passwordRequirements.map((requirement) => (
                <li key={requirement.label} className={requirement.valid ? 'flex items-center gap-2 text-[#02F5A1]' : 'flex items-center gap-2 text-white/40'}>
                  {requirement.valid ? <Check className="size-3.5" /> : <Circle className="size-3.5" />}
                  {requirement.label}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !name.trim() ||
                !email.trim() ||
                !password
              }
              className="inline-flex items-center gap-2 rounded-xl bg-[#02F5A1] px-4 py-2.5 text-sm font-semibold text-[#07191E] transition hover:bg-[#02F5A1]/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  Creando...
                </>
              ) : status === 'error' ? (
                'Reintentar'
              ) : (
                'Crear usuario'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</>

);
}