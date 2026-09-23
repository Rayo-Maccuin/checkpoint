import { CheckpointFormDialog } from '@/modules/projects/components/checkpoint-form-dialog';
import { DeleteProjectDialog } from '@/modules/projects/components/delete-project-dialog';
import { EditProjectDialog } from '@/modules/projects/components/edit-project-dialog';
import { MemberManager } from '@/modules/projects/components/member-manager';
import { PhaseManager } from '@/modules/projects/components/phase-manager';
import { TaskManager } from '@/modules/projects/components/task-manager';

import type { ProjectDetail } from '@/modules/projects/types/project-detail';

interface ProjectDetailViewProps {
project: ProjectDetail;
}

const statusLabels: Record<ProjectDetail['status'], string> = {
idea: 'Idea',
active: 'Activo',
paused: 'Pausado',
blocked: 'Bloqueado',
completed: 'Completado',
archived: 'Archivado',
};

function formatDate(date: string) {
return new Intl.DateTimeFormat('es-CO', {
dateStyle: 'medium',
timeStyle: 'short',
}).format(new Date(date));
}

const activityLabels: Record<string, string> = {
project_created: 'Proyecto creado',
project_updated: 'Proyecto actualizado',
project_status_changed: 'Estado del proyecto cambiado',
phase_created: 'Fase creada',
phase_updated: 'Fase actualizada',
phase_deleted: 'Fase eliminada',
phase_changed: 'Fase actual cambiada',
task_created: 'Tarea creada',
task_updated: 'Tarea actualizada',
task_completed: 'Tarea completada',
task_reopened: 'Tarea reabierta',
checkpoint_created: 'Checkpoint creado',
checkpoint_updated: 'Checkpoint actualizado',
member_added: 'Colaborador agregado',
member_removed: 'Colaborador eliminado',
member_role_changed: 'Rol de colaborador cambiado',
};

export function ProjectDetailView({
project,
}: ProjectDetailViewProps) {
const statusLabel = statusLabels[project.status];

const currentUserRole = project.members.find(
(member) => member.id === project.currentUserId,
)?.role;

const isOwner = currentUserRole === 'owner';

const taskCountsByPhase = Object.fromEntries(
project.phases.map((phase) => {
const phaseTasks = project.tasks.filter(
(task) => task.phaseId === phase.id,
);

  return [
    phase.id,
    {
      total: phaseTasks.length,
      completed: phaseTasks.filter(
        (task) => task.status === 'completed',
      ).length,
    },
  ];
}),

);

return (
<div className="space-y-8">
<section id="informacion" className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
<div className="min-w-0">
<p className="text-sm font-medium text-[#02F5A1]">
{project.currentPhase?.name ?? 'Sin fase actual'}
</p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {project.name}
        </h1>

        {project.description && (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
            {project.description}
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/55">
            {statusLabel}
          </span>

          <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
            {project.completedTasks} de {project.totalTasks} tareas
          </span>
        </div>

        {isOwner && (
          <div className="mt-5 flex flex-wrap gap-2">
            <EditProjectDialog
              project={{
                id: project.id,
                name: project.name,
                description: project.description,
                priority: project.priority,
                status: project.status,
              }}
            />

            <DeleteProjectDialog
              projectId={project.id}
              projectName={project.name}
            />
          </div>
        )}
      </div>

      <div className="w-full max-w-xs lg:w-64">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/40">Progreso</span>

          <span className="font-semibold text-white">
            {project.progress}%
          </span>
        </div>

        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"
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
    </div>
  </section>

  <section id="checkpoints">
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-[#02F5A1]/70">
          Contexto
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Último checkpoint
        </h2>
      </div>

      <CheckpointFormDialog
        projectId={project.id}
        currentPhaseName={project.currentPhase?.name ?? null}
      />
    </div>

    {project.latestCheckpoint ? (
      <div className="rounded-3xl border border-[#02F5A1]/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/30">
              Qué hiciste
            </p>

            <p className="mt-2 text-sm leading-6 text-white/65">
              {project.latestCheckpoint.whatDone ||
                'Sin información registrada.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/30">
              Qué funciona
            </p>

            <p className="mt-2 text-sm leading-6 text-white/65">
              {project.latestCheckpoint.whatWorks ||
                'Sin información registrada.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/30">
              Qué falta
            </p>

            <p className="mt-2 text-sm leading-6 text-white/65">
              {project.latestCheckpoint.whatRemains ||
                'Nada registrado.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-white/30">
              Problemas
            </p>

            <p className="mt-2 text-sm leading-6 text-white/65">
              {project.latestCheckpoint.blockers ||
                'No hay problemas registrados.'}
            </p>
          </div>
        </div>

        <div className="mt-6 border-t border-white/5 pt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-[#02F5A1]/70">
            Siguiente paso
          </p>

          <p className="mt-2 text-base font-medium leading-6 text-white">
            {project.latestCheckpoint.nextStep ||
              'No se ha definido un siguiente paso.'}
          </p>

          <p className="mt-3 text-xs text-white/30">
            Guardado el{' '}
            {formatDate(project.latestCheckpoint.createdAt)}
          </p>
        </div>
      </div>
    ) : (
      <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-8">
        <h3 className="font-semibold text-white">
          Este proyecto todavía no tiene checkpoints.
        </h3>

        <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
          Cuando termines una sesión de trabajo, guarda un checkpoint para conservar el contexto.
        </p>
      </div>
    )}
  </section>

  <div id="colaboradores">
  <MemberManager
    projectId={project.id}
    members={project.members}
    currentUserId={project.currentUserId}
  />
  </div>

  <section id="fases">
    <div className="mb-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
        Estructura
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
        Fases
      </h2>

      <p className="mt-2 text-sm leading-6 text-white/40">
        Selecciona una fase para establecerla como el punto actual del proyecto.
      </p>
    </div>

    <PhaseManager
      projectId={project.id}
      currentPhaseId={project.currentPhaseId}
      phases={project.phases}
      taskCounts={taskCountsByPhase}
    />
  </section>

  <section id="tareas">
    <TaskManager project={project} />
  </section>

  <section id="historial" className="pb-10">
    <div className="mb-4">
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
        Registro
      </p>

      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
        Historial
      </h2>
    </div>

    <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-6">
      {project.activities.length === 0 ? (
        <p className="text-sm text-white/40">
          Todavía no hay actividad registrada.
        </p>
      ) : (
        <div className="space-y-6">
          {project.activities.map((activity) => (
            <div
              key={activity.id}
              className="relative pl-6"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-1.5 size-2 rounded-full bg-[#02F5A1]"
              />

              <p className="text-sm font-medium text-white/75">
                {activityLabels[activity.type] ??
                  'Actividad registrada'}
              </p>

              <p className="mt-1 text-xs text-white/35">
                {activity.userName
                  ? `${activity.userName} · `
                  : ''}
                {formatDate(activity.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  </section>
</div>

);
}