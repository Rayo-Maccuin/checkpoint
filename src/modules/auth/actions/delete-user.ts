'use server';

import { createAdminClient } from '@/infrastructure/supabase/admin';
import { createClient } from '@/infrastructure/supabase/server';
import {
  getAuthenticatedUser,
  isPlatformAdmin,
} from '@/modules/auth/utils/authorization';

export interface DeleteUserResult {
  success: boolean;
  message: string;
}

export async function deleteUser(userId: string): Promise<DeleteUserResult> {
  const currentUser = await getAuthenticatedUser();

  if (!currentUser) {
    return { success: false, message: 'No autenticado.' };
  }

  if (!isPlatformAdmin(currentUser)) {
    return { success: false, message: 'Solo un administrador puede eliminar usuarios.' };
  }

  const supabase = await createClient();

  if (currentUser.id === userId) {
    return { success: false, message: 'No puedes eliminar tu propia cuenta.' };
  }

  const [
    { count: ownedProjects, error: projectsError },
    { count: createdTasks, error: tasksError },
    { count: createdCheckpoints, error: checkpointsError },
  ] = await Promise.all([
    supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId),
    supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId),
    supabase
      .from('checkpoints')
      .select('id', { count: 'exact', head: true })
      .eq('created_by', userId),
  ]);

  if (projectsError || tasksError || checkpointsError) {
    return {
      success: false,
      message: 'No fue posible verificar si el usuario puede eliminarse.',
    };
  }

  if (
    (ownedProjects ?? 0) > 0 ||
    (createdTasks ?? 0) > 0 ||
    (createdCheckpoints ?? 0) > 0
  ) {
    return {
      success: false,
      message: 'No se puede eliminar este usuario porque tiene contenido creado en Checkpoint.',
    };
  }

  const { error } = await createAdminClient().auth.admin.deleteUser(userId);

  if (error) {
    return { success: false, message: 'No fue posible eliminar el usuario.' };
  }

  return { success: true, message: 'Usuario eliminado correctamente.' };
}