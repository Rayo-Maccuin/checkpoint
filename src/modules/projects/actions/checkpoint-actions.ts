'use server';

import { createClient } from '@/infrastructure/supabase/server';

import {
  createCheckpointSchema,
  type CreateCheckpointFormData,
} from '@/modules/projects/schemas/checkpoint';

type ActionSuccess = {
  success: true;
};

type ActionError = {
  success: false;
  message: string;
};

export type CheckpointActionResult =
  | ActionSuccess
  | ActionError;

type ProjectRole = 'owner' | 'collaborator' | 'viewer';

type ProjectAccessResult =
  | {
      success: true;
      userId: string;
      role: ProjectRole;
    }
  | ActionError;

async function getProjectAccess(
  projectId: string,
): Promise<ProjectAccessResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Checkpoint action session error:', {
      message: userError?.message,
      code: userError?.code,
      status: userError?.status,
    });

    return {
      success: false,
      message: 'No fue posible verificar tu sesión.',
    };
  }

  const { data: membership, error: membershipError } =
    await supabase
      .from('project_members')
      .select('role')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .maybeSingle();

  if (membershipError) {
    console.error('Checkpoint membership query error:', {
      code: membershipError.code,
      details: membershipError.details,
      hint: membershipError.hint,
      message: membershipError.message,
    });

    return {
      success: false,
      message: 'No fue posible verificar tus permisos.',
    };
  }

  if (!membership) {
    return {
      success: false,
      message: 'No tienes acceso a este proyecto.',
    };
  }

  return {
    success: true,
    userId: user.id,
    role: membership.role as ProjectRole,
  };
}

function canCreateCheckpoint(role: ProjectRole): boolean {
  return role === 'owner' || role === 'collaborator';
}

export async function createCheckpoint(
  data: CreateCheckpointFormData,
): Promise<CheckpointActionResult> {
  const validation = createCheckpointSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Los datos del checkpoint no son válidos.',
    };
  }

  const {
    projectId,
    whatDone,
    whatWorks,
    whatRemains,
    blockers,
    nextStep,
  } = validation.data;

  const access = await getProjectAccess(projectId);

  if (!access.success) {
    return access;
  }

  if (!canCreateCheckpoint(access.role)) {
    return {
      success: false,
      message: 'No tienes permisos para crear checkpoints.',
    };
  }

  const supabase = await createClient();

  const { data: project, error: projectError } =
    await supabase
      .from('projects')
      .select('current_phase_id')
      .eq('id', projectId)
      .maybeSingle();

  if (projectError) {
    console.error('Checkpoint project query error:', {
      code: projectError.code,
      details: projectError.details,
      hint: projectError.hint,
      message: projectError.message,
    });

    return {
      success: false,
      message: 'No fue posible obtener la fase actual del proyecto.',
    };
  }

  if (!project) {
    return {
      success: false,
      message: 'El proyecto no existe.',
    };
  }

  const checkpointId = crypto.randomUUID();

  const { error: insertError } = await supabase
    .from('checkpoints')
    .insert({
      id: checkpointId,
      project_id: projectId,
      phase_id: project.current_phase_id,
      created_by: access.userId,
      what_done: whatDone,
      what_works: whatWorks || '',
      what_remains: whatRemains || '',
      blockers: blockers || '',
      next_step: nextStep,
    });

  if (insertError) {
    console.error('Create checkpoint error:', {
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
      message: insertError.message,
    });

    return {
      success: false,
      message: 'No fue posible guardar el checkpoint.',
    };
  }

  return {
    success: true,
  };
}