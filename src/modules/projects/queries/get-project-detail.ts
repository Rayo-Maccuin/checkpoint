import { createClient } from '@/infrastructure/supabase/server';

import { calculateProgress } from '@/modules/projects/utils/calculate-progress';

import type {
  GetProjectDetailResult,
  ProjectDetail,
  ProjectDetailActivity,
  ProjectDetailCheckpoint,
  ProjectDetailMember,
  ProjectDetailPhase,
  ProjectDetailTask,
} from '@/modules/projects/types/project-detail';

interface ProjectRow {
  id: string;
  name: string;
  description: string | null;
  status: ProjectDetail['status'];
  priority: ProjectDetail['priority'];
  current_phase_id: string | null;
}

interface PhaseRow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  position: number;
}

interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: ProjectDetailTask['status'];
  priority: ProjectDetailTask['priority'];
  phase_id: string | null;
  assigned_to: string | null;
  created_by: string;
  completed_by: string | null;
  created_at: string;
  completed_at: string | null;
}

interface CheckpointRow {
  id: string;
  project_id: string;
  phase_id: string | null;
  what_done: string;
  what_works: string;
  what_remains: string;
  blockers: string;
  next_step: string;
  created_at: string;
}

interface ActivityRow {
  id: string;
  project_id: string;
  type: string;
  user_id: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface MemberRow {
  user_id: string;
  role: ProjectDetailMember['role'];
  profile: {
    id: string;
    name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ProfileRow {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export async function getProjectDetail(
  projectId: string,
): Promise<GetProjectDetailResult> {
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

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select(
      `
        id,
        name,
        description,
        status,
        priority,
        current_phase_id
      `,
    )
    .eq('id', projectId)
    .maybeSingle();

  if (projectError) {
    console.error('Project detail query error:', projectError);

    return {
      success: false,
      message: 'No fue posible cargar el proyecto.',
    };
  }

  if (!project) {
    return {
      success: false,
      message: 'El proyecto no existe o no tienes acceso.',
    };
  }

  const [
    { data: phases, error: phasesError },
    { data: tasks, error: tasksError },
    { data: checkpoints, error: checkpointsError },
    { data: activities, error: activitiesError },
    { data: members, error: membersError },
  ] = await Promise.all([
    supabase
      .from('phases')
      .select(
        `
          id,
          project_id,
          name,
          description,
          position
        `,
      )
      .eq('project_id', projectId)
      .order('position', { ascending: true }),

    supabase
      .from('tasks')
      .select(
        `
          id,
          project_id,
          title,
          description,
          status,
          priority,
          phase_id,
          assigned_to,
          created_by,
          completed_by,
          created_at,
          completed_at
        `,
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),

    supabase
      .from('checkpoints')
      .select(
        `
          id,
          project_id,
          phase_id,
          what_done,
          what_works,
          what_remains,
          blockers,
          next_step,
          created_at
        `,
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),

    supabase
      .from('activity')
      .select(
        `
          id,
          project_id,
          type,
          user_id,
          entity_id,
          metadata,
          created_at
        `,
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: false }),

    supabase
      .from('project_members')
      .select(
        `
          user_id,
          role,
          profile:profiles (
            id,
            name,
            avatar_url
          )
        `,
      )
      .eq('project_id', projectId)
      .order('created_at', { ascending: true }),
  ]);

  if (
    phasesError ||
    tasksError ||
    checkpointsError ||
    activitiesError ||
    membersError
  ) {
    console.error('Project detail related data error:', {
      phasesError,
      tasksError,
      checkpointsError,
      activitiesError,
      membersError,
    });

    return {
      success: false,
      message: 'No fue posible cargar toda la información del proyecto.',
    };
  }

  const typedProject = project as ProjectRow;
  const typedPhases = (phases ?? []) as PhaseRow[];
  const typedTasks = (tasks ?? []) as TaskRow[];
  const typedCheckpoints = (checkpoints ?? []) as CheckpointRow[];
  const typedActivities = (activities ?? []) as ActivityRow[];
  const typedMembers = (members ?? []) as unknown as MemberRow[];

  const taskUserIds = [
    ...new Set(
      typedTasks.flatMap((task) =>
        [task.assigned_to, task.created_by, task.completed_by].filter(
          (id): id is string => Boolean(id),
        ),
      ),
    ),
  ];

  const activityUserIds = typedActivities
    .map((activity) => activity.user_id)
    .filter((id): id is string => Boolean(id));

  const userIds = [
    ...new Set([...taskUserIds, ...activityUserIds]),
  ];

  let profiles: ProfileRow[] = [];

  if (userIds.length > 0) {
    const { data: profileRows, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name, avatar_url')
      .in('id', userIds);

    if (profilesError) {
      console.error('Project profiles query error:', profilesError);

      return {
        success: false,
        message: 'No fue posible cargar los usuarios del proyecto.',
      };
    }

    profiles = (profileRows ?? []) as ProfileRow[];
  }

  const profileMap = new Map(
    profiles.map((profile) => [profile.id, profile]),
  );

  const mappedMembers: ProjectDetailMember[] = typedMembers.map(
    (member) => ({
      id: member.user_id,
      name: member.profile?.name ?? null,
      avatarUrl: member.profile?.avatar_url ?? null,
      role: member.role,
    }),
  );

  const mappedPhases: ProjectDetailPhase[] = typedPhases.map(
    (phase) => ({
      id: phase.id,
      name: phase.name,
      description: phase.description,
      position: phase.position,
    }),
  );

  const mappedTasks: ProjectDetailTask[] = typedTasks.map((task) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    phaseId: task.phase_id,
    assignedTo: task.assigned_to,
    assignedToName: task.assigned_to
      ? profileMap.get(task.assigned_to)?.name ?? null
      : null,
    createdBy: task.created_by,
    createdByName: profileMap.get(task.created_by)?.name ?? null,
    completedBy: task.completed_by,
    completedByName: task.completed_by
      ? profileMap.get(task.completed_by)?.name ?? null
      : null,
    createdAt: task.created_at,
    completedAt: task.completed_at,
  }));

  const mappedCheckpoints: ProjectDetailCheckpoint[] =
    typedCheckpoints.map((checkpoint) => ({
      id: checkpoint.id,
      phaseId: checkpoint.phase_id,
      whatDone: checkpoint.what_done,
      whatWorks: checkpoint.what_works,
      whatRemains: checkpoint.what_remains,
      blockers: checkpoint.blockers,
      nextStep: checkpoint.next_step,
      createdAt: checkpoint.created_at,
    }));

  const mappedActivities: ProjectDetailActivity[] =
    typedActivities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      userName: activity.user_id
        ? profileMap.get(activity.user_id)?.name ?? null
        : null,
      entityId: activity.entity_id,
      metadata: activity.metadata ?? {},
      createdAt: activity.created_at,
    }));

  const currentPhase =
    mappedPhases.find(
      (phase) => phase.id === typedProject.current_phase_id,
    ) ?? null;

  const completedTasks = mappedTasks.filter(
    (task) => task.status === 'completed',
  ).length;

  const latestCheckpoint = mappedCheckpoints[0] ?? null;

const projectDetail: ProjectDetail = {
  id: typedProject.id,
  name: typedProject.name,
  description: typedProject.description,
  status: typedProject.status,
  priority: typedProject.priority,
  currentPhaseId: typedProject.current_phase_id,
  currentPhase,
  phases: mappedPhases,
  tasks: mappedTasks,
  checkpoints: mappedCheckpoints,
  activities: mappedActivities,
  members: mappedMembers,
  currentUserId: user.id,
  totalTasks: mappedTasks.length,
  completedTasks,
  progress: calculateProgress(
    mappedTasks.length,
    completedTasks,
  ),
  latestCheckpoint,
};

  return {
    success: true,
    project: projectDetail,
  };
}