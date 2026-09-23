'use server';

import { createAdminClient } from '@/infrastructure/supabase/admin';
import {
createUserSchema,
type CreateUserInput,
} from '@/modules/auth/schemas/create-user';
import {
getAuthenticatedUser,
isPlatformAdmin,
} from '@/modules/auth/utils/authorization';

export interface CreateUserResult {
success: boolean;
message: string;
userId?: string;
}

export async function createUser(
input: CreateUserInput,
): Promise<CreateUserResult> {
const parsed = createUserSchema.safeParse(input);

if (!parsed.success) {
return {
success: false,
message: parsed.error.issues[0]?.message ?? 'Datos inválidos.',
};
}

const user = await getAuthenticatedUser();

if (!user) {
return {
success: false,
message: 'No autenticado.',
};
}

if (!isPlatformAdmin(user)) {
return {
success: false,
message: 'Solo un administrador puede crear usuarios.',
};
}

const admin = createAdminClient();

const { data, error } = await admin.auth.admin.createUser({
email: parsed.data.email,
password: parsed.data.password,
email_confirm: true,
user_metadata: {
name: parsed.data.name,
},
app_metadata: {
role: parsed.data.role,
},
});

if (error) {
if (error.message.toLowerCase().includes('already')) {
return {
success: false,
message: 'Ya existe un usuario con ese correo electrónico.',
};
}

return {
  success: false,
  message: 'No fue posible crear el usuario.',
};

}

if (!data.user) {
return {
success: false,
message: 'Supabase no devolvió el usuario creado.',
};
}

return {
success: true,
message: 'Usuario creado correctamente.',
userId: data.user.id,
};
}