'use server';

import { createClient } from '@/infrastructure/supabase/server';

export type LoginResult =
  | {
      success: true;
    }
  | {
      success: false;
      message: string;
    };

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

if (error) {
  console.error('Supabase login error:', {
    message: error.message,
    code: error.code,
    status: error.status,
  });

  return {
    success: false,
    message: 'No fue posible iniciar sesión.',
  };
}
  return {
    success: true,
  };
}

export async function logout(): Promise<LoginResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      message: 'No fue posible cerrar la sesión.',
    };
  }

  return {
    success: true,
  };
}