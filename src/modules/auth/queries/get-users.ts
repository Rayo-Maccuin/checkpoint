'use server';

import { createAdminClient } from '@/infrastructure/supabase/admin';
import { createClient } from '@/infrastructure/supabase/server';
import {
  getAuthenticatedUser,
  isPlatformAdmin,
  type PlatformRole,
} from '@/modules/auth/utils/authorization';

export interface CheckpointUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  status: 'Activo' | 'Invitado';
  role: PlatformRole;
  avatarUrl: string | null;
}

export interface GetUsersResult {
  success: boolean;
  message?: string;
  users: CheckpointUser[];
}

export async function getUsers(): Promise<GetUsersResult> {
  const user = await getAuthenticatedUser();

  if (!user) {
    return { success: false, message: 'No autenticado.', users: [] };
  }

  if (!isPlatformAdmin(user)) {
    return {
      success: false,
      message: 'No tienes permisos para administrar usuarios.',
      users: [],
    };
  }

  const supabase = await createClient();

  const [{ data: profiles, error: profilesError }, { data: authUsers, error: authError }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, avatar_url, created_at')
        .order('name', { ascending: true }),
      createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
    ]);

  if (profilesError || authError) {
    return {
      success: false,
      message: 'No fue posible cargar los usuarios.',
      users: [],
    };
  }

  const authById = new Map(
    (authUsers?.users ?? []).map((authUser) => [authUser.id, authUser]),
  );

  return {
    success: true,
    users: (profiles ?? []).map((profile) => {
      const authUser = authById.get(profile.id);
      return {
        id: profile.id,
        name: profile.name,
        email: authUser?.email ?? 'Sin correo',
        createdAt: profile.created_at,
        status: authUser?.email_confirmed_at ? 'Activo' : 'Invitado',
        role:
          authUser?.app_metadata?.role === 'admin'
            ? 'admin'
            : authUser?.app_metadata?.role === 'viewer'
              ? 'viewer'
              : 'collaborator',
        avatarUrl: profile.avatar_url,
      };
    }),
  };
}
