import type { DashboardStats } from '@/modules/projects/types/dashboard';

interface ProjectStatsProps {
  stats: DashboardStats;
}

const statsConfig = [
  {
    key: 'totalProjects',
    label: 'Proyectos',
  },
  {
    key: 'activeProjects',
    label: 'Activos',
  },
  {
    key: 'pausedProjects',
    label: 'Pausados',
  },
] as const;

export function ProjectStats({ stats }: ProjectStatsProps) {
  return (
    <section aria-label="Resumen de proyectos">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {statsConfig.map((item) => (
          <div
            key={item.key}
            className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition-colors hover:bg-white/[0.05]"
          >
            <p className="text-sm text-white/45">{item.label}</p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {stats[item.key]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}