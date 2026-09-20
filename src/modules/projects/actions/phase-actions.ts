'use server';

import { createClient } from '@/infrastructure/supabase/server';

import {
  changeCurrentPhaseSchema,
  createPhaseSchema,
  deletePhaseSchema,
  updatePhaseSchema,
  type ChangeCurrentPhaseData,
  type CreatePhaseFormData,
  type DeletePhaseData,
  type UpdatePhaseFormData,
} from '@/modules/projects/schemas/phase';

type ActionSuccess = {
  success: true;
};

type ActionError = {
  success: false;
  message: string;
};

export type CreatePhaseResult =
  | {
      success: true;
      phaseId: string;
    }
  | ActionError;

export type PhaseActionResult =
  | ActionSuccess
  | ActionError;

async function verifyProjectOwner(
  projectId: string,
): Promise<
  | {
      success: true;
      userId: string;
    }
  | ActionError
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('Phase action session error:', {
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
    console.error('Phase action membership query error:', {
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

  if (!membership || membership.role !== 'owner') {
    return {
      success: false,
      message: 'No tienes permisos para administrar las fases.',
    };
  }

  return {
    success: true,
    userId: user.id,
  };
}

async function verifyPhaseBelongsToProject(
  projectId: string,
  phaseId: string,
): Promise<
  | {
      success: true;
    }
  | ActionError
> {
  const supabase = await createClient();

  const { data: phase, error: phaseError } = await supabase
    .from('phases')
    .select('id')
    .eq('id', phaseId)
    .eq('project_id', projectId)
    .maybeSingle();

  if (phaseError) {
    console.error('Phase ownership query error:', {
      code: phaseError.code,
      details: phaseError.details,
      hint: phaseError.hint,
      message: phaseError.message,
    });

    return {
      success: false,
      message: 'No fue posible verificar la fase.',
    };
  }

  if (!phase) {
    return {
      success: false,
      message: 'La fase no existe en este proyecto.',
    };
  }

  return {
    success: true,
  };
}

export async function createPhase(
  data: CreatePhaseFormData,
): Promise<CreatePhaseResult> {
  const validation = createPhaseSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Los datos de la fase no son válidos.',
    };
  }

  const {
    projectId,
    name,
    description,
  } = validation.data;

  const permission = await verifyProjectOwner(projectId);

  if (!permission.success) {
    return permission;
  }

  const supabase = await createClient();

  const { data: lastPhase, error: lastPhaseError } =
    await supabase
      .from('phases')
      .select('position')
      .eq('project_id', projectId)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

  if (lastPhaseError) {
    console.error('Create phase position query error:', {
      code: lastPhaseError.code,
      details: lastPhaseError.details,
      hint: lastPhaseError.hint,
      message: lastPhaseError.message,
    });

    return {
      success: false,
      message: 'No fue posible determinar la posición de la fase.',
    };
  }

  const nextPosition = lastPhase
    ? lastPhase.position + 1
    : 0;

  const phaseId = crypto.randomUUID();

  const { error: insertError } = await supabase
    .from('phases')
    .insert({
      id: phaseId,
      project_id: projectId,
      name,
      description: description || null,
      position: nextPosition,
    });

  if (insertError) {
    console.error('Create phase error:', {
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
      message: insertError.message,
    });

    return {
      success: false,
      message: 'No fue posible crear la fase.',
    };
  }

  return {
    success: true,
    phaseId,
  };
}

export async function updatePhase(
  data: UpdatePhaseFormData,
): Promise<PhaseActionResult> {
  const validation = updatePhaseSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Los datos de la fase no son válidos.',
    };
  }

  const {
    projectId,
    phaseId,
    name,
    description,
  } = validation.data;

  const permission = await verifyProjectOwner(projectId);

  if (!permission.success) {
    return permission;
  }

  const phaseValidation =
    await verifyPhaseBelongsToProject(
      projectId,
      phaseId,
    );

  if (!phaseValidation.success) {
    return phaseValidation;
  }

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from('phases')
    .update({
      name,
      description: description || null,
    })
    .eq('id', phaseId)
    .eq('project_id', projectId);

  if (updateError) {
    console.error('Update phase error:', {
      code: updateError.code,
      details: updateError.details,
      hint: updateError.hint,
      message: updateError.message,
    });

    return {
      success: false,
      message: 'No fue posible actualizar la fase.',
    };
  }

  return {
    success: true,
  };
}

export async function deletePhase(
  data: DeletePhaseData,
): Promise<PhaseActionResult> {
  const validation = deletePhaseSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Los datos de la fase no son válidos.',
    };
  }

  const {
    projectId,
    phaseId,
  } = validation.data;

  const permission = await verifyProjectOwner(projectId);

  if (!permission.success) {
    return permission;
  }

  const phaseValidation =
    await verifyPhaseBelongsToProject(
      projectId,
      phaseId,
    );

  if (!phaseValidation.success) {
    return phaseValidation;
  }

  const supabase = await createClient();

  const { data: project, error: projectError } =
    await supabase
      .from('projects')
      .select('current_phase_id')
      .eq('id', projectId)
      .maybeSingle();

  if (projectError) {
    console.error('Delete phase project query error:', {
      code: projectError.code,
      details: projectError.details,
      hint: projectError.hint,
      message: projectError.message,
    });

    return {
      success: false,
      message: 'No fue posible verificar la fase actual.',
    };
  }

  if (!project) {
    return {
      success: false,
      message: 'El proyecto no existe.',
    };
  }

  if (project.current_phase_id === phaseId) {
    return {
      success: false,
      message:
        'No puedes eliminar la fase actual. Cambia primero a otra fase.',
    };
  }

  const { count: taskCount, error: tasksError } =
    await supabase
      .from('tasks')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('project_id', projectId)
      .eq('phase_id', phaseId);

  if (tasksError) {
    console.error('Delete phase task query error:', {
      code: tasksError.code,
      details: tasksError.details,
      hint: tasksError.hint,
      message: tasksError.message,
    });

    return {
      success: false,
      message:
        'No fue posible verificar las tareas asociadas a la fase.',
    };
  }

  if ((taskCount ?? 0) > 0) {
    return {
      success: false,
      message:
        'No puedes eliminar una fase que todavía tiene tareas asociadas.',
    };
  }

  const { error: deleteError } = await supabase
    .from('phases')
    .delete()
    .eq('id', phaseId)
    .eq('project_id', projectId);

  if (deleteError) {
    console.error('Delete phase error:', {
      code: deleteError.code,
      details: deleteError.details,
      hint: deleteError.hint,
      message: deleteError.message,
    });

    return {
      success: false,
      message: 'No fue posible eliminar la fase.',
    };
  }

  return {
    success: true,
  };
}

export async function changeCurrentPhase(
  data: ChangeCurrentPhaseData,
): Promise<PhaseActionResult> {
  const validation =
    changeCurrentPhaseSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Los datos de la fase no son válidos.',
    };
  }

  const {
    projectId,
    phaseId,
  } = validation.data;

  const permission = await verifyProjectOwner(projectId);

  if (!permission.success) {
    return permission;
  }

  const phaseValidation =
    await verifyPhaseBelongsToProject(
      projectId,
      phaseId,
    );

  if (!phaseValidation.success) {
    return phaseValidation;
  }

  const supabase = await createClient();

  const { error: updateError } = await supabase
    .from('projects')
    .update({
      current_phase_id: phaseId,
    })
    .eq('id', projectId);

  if (updateError) {
    console.error('Change current phase error:', {
      code: updateError.code,
      details: updateError.details,
      hint: updateError.hint,
      message: updateError.message,
    });

    return {
      success: false,
      message: 'No fue posible cambiar la fase actual.',
    };
  }

  return {
    success: true,
  };
}