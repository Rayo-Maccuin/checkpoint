'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/infrastructure/supabase/server';

import {
  archiveProjectSchema,
  createProjectSchema,
  deleteProjectSchema,
  updateProjectSchema,
  type ArchiveProjectFormData,
  type CreateProjectFormData,
  type DeleteProjectFormData,
  type UpdateProjectFormData,
} from '@/modules/projects/schemas/create-project';

export type CreateProjectResult =
  | {
      success: true;
      projectId: string;
    }
  | {
      success: false;
      message: string;
    };

export type ProjectActionResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

function generateProjectId(): string {
  return crypto.randomUUID();
}

async function getAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('Project action session error:', {
      message: error?.message,
      code: error?.code,
      status: error?.status,
    });

    return {
      supabase,
      user: null,
    };
  }

  return {
    supabase,
    user,
  };
}

async function verifyProjectOwner(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .eq('created_by', userId)
    .maybeSingle();

  if (error) {
    console.error('Verify project owner error:', {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });

    return false;
  }

  return Boolean(data);
}

export async function createProject(
  data: CreateProjectFormData,
): Promise<CreateProjectResult> {
  const validation = createProjectSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Los datos del proyecto no son válidos.',
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: 'No fue posible verificar tu sesión.',
    };
  }

  const projectId = generateProjectId();

  const { error: projectError } = await supabase
    .from('projects')
    .insert({
      id: projectId,
      name: validation.data.name,
      description: validation.data.description || null,
      priority: validation.data.priority,
      created_by: user.id,
    });

  if (projectError) {
    console.error('Create project error:', {
      code: projectError.code,
      details: projectError.details,
      hint: projectError.hint,
      message: projectError.message,
    });

    return {
      success: false,
      message: 'No fue posible crear el proyecto.',
    };
  }

  const { data: project, error: projectQueryError } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();

  if (projectQueryError || !project) {
    console.error('Create project verification error:', {
      code: projectQueryError?.code,
      details: projectQueryError?.details,
      hint: projectQueryError?.hint,
      message: projectQueryError?.message,
    });

    return {
      success: false,
      message: 'El proyecto fue creado, pero no pudimos verificarlo.',
    };
  }

  revalidatePath('/');
  revalidatePath(`/projects/${project.id}`);

  return {
    success: true,
    projectId: project.id,
  };
}

export async function updateProject(
  data: UpdateProjectFormData,
): Promise<ProjectActionResult> {
  const validation = updateProjectSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'Los datos del proyecto no son válidos.',
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: 'No fue posible verificar tu sesión.',
    };
  }

  const isOwner = await verifyProjectOwner(
    supabase,
    validation.data.projectId,
    user.id,
  );

  if (!isOwner) {
    return {
      success: false,
      message: 'No tienes permisos para editar este proyecto.',
    };
  }

  const { error } = await supabase
    .from('projects')
    .update({
      name: validation.data.name,
      description: validation.data.description || null,
      priority: validation.data.priority,
      status: validation.data.status,
    })
    .eq('id', validation.data.projectId)
    .eq('created_by', user.id);

  if (error) {
    console.error('Update project error:', {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });

    return {
      success: false,
      message: 'No fue posible actualizar el proyecto.',
    };
  }

  revalidatePath('/');
  revalidatePath(`/projects/${validation.data.projectId}`);

  return {
    success: true,
  };
}

export async function archiveProject(
  data: ArchiveProjectFormData,
): Promise<ProjectActionResult> {
  const validation = archiveProjectSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'El proyecto no es válido.',
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: 'No fue posible verificar tu sesión.',
    };
  }

  const isOwner = await verifyProjectOwner(
    supabase,
    validation.data.projectId,
    user.id,
  );

  if (!isOwner) {
    return {
      success: false,
      message: 'No tienes permisos para archivar este proyecto.',
    };
  }

  const { error } = await supabase
    .from('projects')
    .update({
      status: 'archived',
    })
    .eq('id', validation.data.projectId)
    .eq('created_by', user.id);

  if (error) {
    console.error('Archive project error:', {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });

    return {
      success: false,
      message: 'No fue posible archivar el proyecto.',
    };
  }

  revalidatePath('/');
  revalidatePath(`/projects/${validation.data.projectId}`);

  return {
    success: true,
  };
}

export async function deleteProject(
  data: DeleteProjectFormData,
): Promise<ProjectActionResult> {
  const validation = deleteProjectSchema.safeParse(data);

  if (!validation.success) {
    return {
      success: false,
      message: 'El proyecto no es válido.',
    };
  }

  const { supabase, user } = await getAuthenticatedUser();

  if (!user) {
    return {
      success: false,
      message: 'No fue posible verificar tu sesión.',
    };
  }

  const isOwner = await verifyProjectOwner(
    supabase,
    validation.data.projectId,
    user.id,
  );

  if (!isOwner) {
    return {
      success: false,
      message: 'No tienes permisos para eliminar este proyecto.',
    };
  }

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', validation.data.projectId)
    .eq('created_by', user.id);

  if (error) {
    console.error('Delete project error:', {
      code: error.code,
      details: error.details,
      hint: error.hint,
      message: error.message,
    });

    return {
      success: false,
      message: 'No fue posible eliminar el proyecto.',
    };
  }

  revalidatePath('/');

  return {
    success: true,
  };
}