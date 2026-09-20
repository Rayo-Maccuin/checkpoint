import { ContinueProject } from '@/modules/projects/components/continue-project';

import { CreateProjectDialog } from '@/modules/projects/components/create-project-dialog';

import { DashboardHeader } from '@/modules/projects/components/dashboard-header';

import { ProjectCard } from '@/modules/projects/components/project-card';

import { ProjectStats } from '@/modules/projects/components/project-stats';

import { getDashboardProjects } from '@/modules/projects/queries/get-dashboard-projects';

import { UserMenu } from '@/modules/auth/components/user-menu';

import type { DashboardStats } from '@/modules/projects/types/dashboard';

export default async function HomePage() {
const result = await getDashboardProjects();

if (!result.success) {
return ( <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8"> <div className="mx-auto max-w-6xl"> <header className="flex items-center justify-between"> <p className="text-sm font-semibold text-[#02F5A1]">
Checkpoint </p> </header>

      <section className="mt-16 rounded-3xl border border-red-400/10 bg-red-400/[0.04] p-8">
        <h1 className="text-xl font-semibold">
          No pudimos cargar tus proyectos
        </h1>

        <p className="mt-2 text-sm text-white/45">
          {result.message}
        </p>
      </section>
    </div>
  </main>
);


}

const { projects, user } = result;

const stats: DashboardStats = {
totalProjects: projects.length,
activeProjects: projects.filter(
(project) => project.status === 'active',
).length,
pausedProjects: projects.filter(
(project) => project.status === 'paused',
).length,
};

const projectsWithCheckpoints = projects.filter(
(project) => project.latestCheckpoint !== null,
);

const projectToContinue =
projectsWithCheckpoints.length > 0
? projectsWithCheckpoints.reduce((latest, project) => {
if (!latest.latestCheckpoint) {
return project;
}


      if (!project.latestCheckpoint) {
        return latest;
      }

      return new Date(project.latestCheckpoint.createdAt) >
        new Date(latest.latestCheckpoint.createdAt)
        ? project
        : latest;
    })
  : null;


return ( <main className="min-h-screen bg-[#07191E] px-5 py-8 text-white sm:px-8"> <div className="mx-auto max-w-6xl"> <div className="flex items-start justify-between gap-6"> <DashboardHeader userName={user.name} />


      <div className="flex shrink-0 items-center gap-3">
        <CreateProjectDialog />
        <UserMenu userName={user.name} />
      </div>
    </div>

    <div className="mt-10">
      <ProjectStats stats={stats} />
    </div>

    <div className="mt-12">
      <ContinueProject project={projectToContinue} />
    </div>

    <section className="mt-12 pb-10">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
            Espacio de trabajo
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Mis proyectos
          </h2>
        </div>

        <span className="text-sm text-white/35">
          {projects.length}{' '}
          {projects.length === 1 ? 'proyecto' : 'proyectos'}
        </span>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8">
          <h3 className="font-semibold">
            Empieza tu primer proyecto
          </h3>

          <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
            Aquí aparecerán tus proyectos y podrás continuar desde
            el último punto en el que trabajaste.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </div>
      )}
    </section>
  </div>
</main>

);
}
