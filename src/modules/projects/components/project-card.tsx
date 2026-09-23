import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import type { DashboardProject } from '@/modules/projects/types/dashboard';

interface ProjectCardProps {
  project: DashboardProject;
}

const statusLabels: Record<DashboardProject['status'], string> = {
  idea: 'Idea',
  active: 'Activo',
  paused: 'Pausado',
  blocked: 'Bloqueado',
  completed: 'Completado',
  archived: 'Archivado',
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(
    new Date(date),
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusLabel = statusLabels[project.status];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="dashboard-project-card group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
      aria-label={`Abrir proyecto ${project.name}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white">
            {project.name}
          </h3>

          <p className="mt-1 text-sm text-white/40">
            {project.currentPhase?.name ?? 'Sin fase actual'}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/45">
            {statusLabel}
          </span>

          <ArrowUpRight
            aria-hidden="true"
            className="size-4 text-white/20 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#02F5A1]"
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/35">Progreso</span>

          <span className="font-medium text-white/65">
            {project.progress}%
          </span>
        </div>

        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={project.progress}
          aria-label={`Progreso de ${project.name}`}
        >
          <div
            className="h-full rounded-full bg-[#02F5A1] transition-all"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-6 border-t border-white/5 pt-4">
        <p className="text-xs text-white/30">Siguiente paso</p>

        <p className="mt-1 line-clamp-2 text-sm leading-5 text-white/60">
          {project.latestCheckpoint?.nextStep ||
            'Crea tu primer checkpoint.'}
        </p>

        <p className="mt-3 text-xs text-white/30">
          Actualizado el {formatDate(project.updatedAt)}
        </p>
      </div>
    </Link>
  );
}