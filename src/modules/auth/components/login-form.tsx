'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';

import { login } from '@/modules/auth/actions';
import { loginSchema, type LoginFormData } from '@/modules/auth/schemas';

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  async function onSubmit(data: LoginFormData) {
    setServerError(null);

    const result = await login(data.email, data.password);

    if (!result.success) {
      setServerError(result.message);
      return;
    }

    window.sessionStorage.setItem('checkpoint:dashboard-entry', 'true');
    router.replace('/');
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
          htmlFor="email"
          className="block text-sm font-medium text-white"
        >
          Correo electrónico
        </label>

        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
          />

          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'login-email-error' : undefined}
            {...register('email')}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#06171c]/80 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-[#02F5A1]/60 focus:bg-[#06171c] disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        {errors.email && (
          <p id="login-email-error" className="text-xs text-red-300">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-white"
        >
          Contraseña
        </label>

        <div className="relative">
          <LockKeyhole
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40"
          />

          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Tu contraseña"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'login-password-error' : undefined}
            {...register('password')}
            className="h-12 w-full rounded-xl border border-white/10 bg-[#06171c]/80 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-white/25 hover:border-white/20 focus:border-[#02F5A1]/60 focus:bg-[#06171c] disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={isSubmitting}
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white disabled:pointer-events-none disabled:opacity-50"
          >
            {showPassword ? (
              <EyeOff aria-hidden="true" className="size-4" />
            ) : (
              <Eye aria-hidden="true" className="size-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p id="login-password-error" className="text-xs text-red-300">{errors.password.message}</p>
        )}
      </div>

      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-red-300/15 bg-red-300/[0.07] px-4 py-3 text-sm leading-5 text-red-200"
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-4 text-sm font-semibold text-[#07191E] shadow-[0_10px_30px_rgba(2,245,161,0.12)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#22f7ad] active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
        )}
      </button>
    </form>
  );
}