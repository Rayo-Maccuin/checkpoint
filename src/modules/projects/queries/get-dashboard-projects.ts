import { createClient } from '@/infrastructure/supabase/server';
import { isPlatformAdmin } from '@/modules/auth/utils/authorization';

import { calculateProgress } from '@/modules/projects/utils/calculate-progress';
import type {
  DashboardCheckpoint,
  DashboardPhase,
  DashboardProject,
  DashboardProjectPriority,
  DashboardProjectStatus,
  DashboardUser,
} from '@/modules/projects/types/dashboard';

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  status: DashboardProjectStatus;
  priority: DashboardProjectPriority;
  updated_at: string;
  current_phase_id: string | null;
}

interface PhaseRow {
  id: string;
  name: string;
  position: number;
  project_id: string;
}

interface TaskRow {
  id: string;
  status: string;
  project_id: string;
}

interface CheckpointRow {
  id: string;
  project_id: string;
  what_done: string;
  what_works: string;
  what_remains: string;
  blockers: string;
  next_step: string;
  created_at: string;
}

export interface DashboardProjectsSuccess {
  success: true;
  user: DashboardUser;
  projects: DashboardProject[];
}

export interface DashboardProjectsError {
  success: false;
  message: string;
}

export type GetDashboardProjectsResult =
  | DashboardProjectsSuccess
  | DashboardProjectsError;

export async function getDashboardProjects(): Promise<GetDashboardProjectsResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      success: false,
      message: 'No fue posible verificar tu sesión.',
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, name')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Dashboard profile query error:', profileError);

    return {
      success: false,
      message: 'No fue posible cargar tu perfil.',
    };
  }

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(
      `
        id,
        name,
        description,
        status,
        priority,
        updated_at,
        current_phase_id
      `,
    )
    .order('updated_at', { ascending: false });

  if (projectsError) {
    console.error('Dashboard projects query error:', projectsError);

    return {
      success: false,
      message: 'No fue posible cargar tus proyectos.',
    };
  }

  const dashboardUser: DashboardUser = {
    id: user.id,
    name: profile?.name ?? null,
    isAdmin: isPlatformAdmin(user),
  };

  if (!projects || projects.length === 0) {
    return {
      success: true,
      user: dashboardUser,
      projects: [],
    };
  }

  const projectIds = projects.map((project) => project.id);

  const [
    { data: phases, error: phasesError },
    { data: tasks, error: tasksError },
    { data: checkpoints, error: checkpointsError },
  ] = await Promise.all([
    supabase
      .from('phases')
      .select('id, name, position, project_id')
      .in('project_id', projectIds)
      .order('position', { ascending: true }),

    supabase
      .from('tasks')
      .select('id, status, project_id')
      .in('project_id', projectIds),

    supabase
      .from('checkpoints')
      .select(
        `
          id,
          project_id,
          what_done,
          what_works,
          what_remains,
          blockers,
          next_step,
          created_at
        `,
      )
      .in('project_id', projectIds)
      .order('created_at', { ascending: false }),
  ]);

  if (phasesError || tasksError || checkpointsError) {
    console.error('Dashboard related data query error:', {
      phasesError,
      tasksError,
      checkpointsError,
    });

    return {
      success: false,
      message: 'No fue posible cargar toda la información del dashboard.',
    };
  }

  const typedProjects = projects as ProjectRow[];
  const typedPhases = (phases ?? []) as PhaseRow[];
  const typedTasks = (tasks ?? []) as TaskRow[];
  const typedCheckpoints = (checkpoints ?? []) as CheckpointRow[];

  const dashboardProjects: DashboardProject[] = typedProjects.map(
    (project) => {
      const projectPhases = typedPhases.filter(
        (phase) => phase.project_id === project.id,
      );

      const currentPhase =
        projectPhases.find(
          (phase) => phase.id === project.current_phase_id,
        ) ?? null;

      const projectTasks = typedTasks.filter(
        (task) => task.project_id === project.id,
      );

      const completedTasks = projectTasks.filter(
        (task) => task.status === 'completed',
      ).length;

      const projectCheckpoint =
        typedCheckpoints.find(
          (checkpoint) => checkpoint.project_id === project.id,
        ) ?? null;

      const latestCheckpoint: DashboardCheckpoint | null =
        projectCheckpoint
          ? {
              id: projectCheckpoint.id,
              whatDone: projectCheckpoint.what_done,
              whatWorks: projectCheckpoint.what_works,
              whatRemains: projectCheckpoint.what_remains,
              blockers: projectCheckpoint.blockers,
              nextStep: projectCheckpoint.next_step,
              createdAt: projectCheckpoint.created_at,
            }
          : null;

      const dashboardPhase: DashboardPhase | null = currentPhase
        ? {
            id: currentPhase.id,
            name: currentPhase.name,
            position: currentPhase.position,
          }
        : null;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        priority: project.priority,
        currentPhase: dashboardPhase,
        totalTasks: projectTasks.length,
        completedTasks,
        progress: calculateProgress(
          projectTasks.length,
          completedTasks,
        ),
        latestCheckpoint,
        updatedAt: project.updated_at,
      };
    },
  );

  return {
    success: true,
    user: dashboardUser,
    projects: dashboardProjects,
  };
}