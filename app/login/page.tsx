import { LoginForm } from '@/modules/auth/components/login-form';
import { ArrowUpRight, CircleCheck, CircleDot } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="login-page px-5 py-8 text-white sm:px-8">
      <div className="login-page__ambient login-page__ambient--one" aria-hidden="true" />
      <div className="login-page__ambient login-page__ambient--two" aria-hidden="true" />

      <div className="login-layout">
        <section className="login-intro hidden md:block" aria-label="Sobre Checkpoint">
          <div className="login-brand">
            <div className="login-brand__mark" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span>Checkpoint</span>
          </div>

          <div className="login-intro__copy">
            <p className="login-eyebrow">Tu contexto, sin ruido</p>
            <h1>Vuelve exactamente donde lo dejaste.</h1>
            <p>
              Guarda el punto de control de cada proyecto y retoma tu trabajo
              con claridad, incluso después de semanas.
            </p>
          </div>

          <div className="login-pathway" aria-hidden="true">
            <div className="login-pathway__line" />
            <div className="login-pathway__node login-pathway__node--active">
              <CircleCheck />
              <span>Captura</span>
            </div>
            <div className="login-pathway__node">
              <CircleDot />
              <span>Recuerda</span>
            </div>
            <div className="login-pathway__node">
              <ArrowUpRight />
              <span>Continúa</span>
            </div>
          </div>

          <p className="login-intro__note">Un punto claro para volver a empezar.</p>
        </section>

        <section className="login-auth" aria-labelledby="login-title">
          <div className="login-auth__card">
            <div className="login-auth__mobile-brand md:hidden">
              <div className="login-brand__mark" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
              <span>Checkpoint</span>
            </div>

            <div className="mb-7">
              <p className="login-eyebrow">Espacio personal</p>
              <h2 id="login-title" className="mt-2 text-2xl font-semibold tracking-tight text-white">
                Iniciar sesión
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Accede para continuar con tus proyectos.
              </p>
            </div>

            <LoginForm />

            <p className="login-auth__footer">
              Tu trabajo queda exactamente donde lo dejaste.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}