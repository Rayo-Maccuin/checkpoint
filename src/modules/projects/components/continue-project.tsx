import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { DashboardProject } from '@/modules/projects/types/dashboard';

interface ContinueProjectProps {
  project: DashboardProject | null;
}

export function ContinueProject({
  project,
}: ContinueProjectProps) {
  return (
    <section>
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#02F5A1]/70">
          Continuar
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Donde lo dejaste
        </h2>
      </div>

      {project ? (
        <div className="rounded-3xl border border-[#02F5A1]/10 bg-white/[0.035] p-6 transition-colors hover:border-[#02F5A1]/20 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[#02F5A1]">
                {project.currentPhase?.name ?? 'Sin fase'}
              </p>

              <h3 className="mt-2 text-2xl font-semibold text-white">
                {project.name}
              </h3>

              {project.description && (
                <p className="mt-2 text-sm leading-6 text-white/45">
                  {project.description}
                </p>
              )}

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                    Último checkpoint
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {project.latestCheckpoint?.whatDone ||
                      'Sin información registrada.'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-white/30">
                    Siguiente paso
                  </p>

                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {project.latestCheckpoint?.nextStep ||
                      'No se ha definido un siguiente paso.'}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={`/projects/${project.id}`}
              className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#02F5A1] px-5 text-sm font-semibold text-[#07191E] transition-all duration-200 hover:brightness-95"
            >
              Continuar proyecto

              <ArrowRight
                aria-hidden="true"
                className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8">
          <h3 className="font-semibold text-white">
            Todavía no tienes un checkpoint.
          </h3>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
            Cuando trabajes en un proyecto, guarda un checkpoint
            para que Checkpoint pueda recordarte exactamente dónde
            quedaste.
          </p>
        </div>
      )}
    </section>
  );
}