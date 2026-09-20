import { LoginForm } from '@/modules/auth/components/login-form';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07191E] px-4 py-8">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-[#02F5A1]/20 bg-[#02F5A1]/10">
            <span
              aria-hidden="true"
              className="size-3 rounded-full bg-[#02F5A1] shadow-[0_0_24px_rgba(2,245,161,0.7)]"
            />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Checkpoint
          </h1>

          <p className="mt-2 text-sm text-white/50">
            Continúa donde dejaste tus proyectos.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">
              Iniciar sesión
            </h2>

            <p className="mt-1 text-sm text-white/45">
              Accede a tu espacio de trabajo.
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-white/30">
          Tu espacio personal para saber siempre dónde dejaste cada proyecto.
        </p>
      </section>
    </main>
  );
}