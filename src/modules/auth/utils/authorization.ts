import type { User } from '@supabase/supabase-js';

import { createClient } from '@/infrastructure/supabase/server';

export type PlatformRole = 'admin' | 'collaborator' | 'viewer';

export function isPlatformAdmin(user: User | null | undefined) {
  return user?.app_metadata?.role === 'admin';
}

export async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
