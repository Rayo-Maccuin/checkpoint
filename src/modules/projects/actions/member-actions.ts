'use server';

import { createClient } from '@/infrastructure/supabase/server';

export type ProjectMemberRole = 'collaborator' | 'viewer';

export interface AddProjectMemberResult {
success: boolean;
message: string;
}

export interface RemoveProjectMemberResult {
success: boolean;
message: string;
}

export async function addProjectMember(
projectId: string,
userId: string,
role: ProjectMemberRole,
): Promise<AddProjectMemberResult> {
const supabase = await createClient();

const {
data: { user },
error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
return {
success: false,
message: 'No autenticado.',
};
}

const { data: membership, error: membershipError } = await supabase
.from('project_members')
.select('role')
.eq('project_id', projectId)
.eq('user_id', user.id)
.maybeSingle();

if (membershipError) {
return {
success: false,
message: 'No fue posible verificar los permisos.',
};
}

if (membership?.role !== 'owner') {
return {
success: false,
message: 'Solo el propietario puede agregar miembros.',
};
}

const { data: targetUser, error: targetUserError } = await supabase
.from('profiles')
.select('id')
.eq('id', userId)
.maybeSingle();

if (targetUserError) {
return {
success: false,
message: 'No fue posible verificar el usuario.',
};
}

if (!targetUser) {
return {
success: false,
message: 'El usuario seleccionado no existe.',
};
}

const { data: existingMember, error: existingMemberError } = await supabase
.from('project_members')
.select('id')
.eq('project_id', projectId)
.eq('user_id', userId)
.maybeSingle();

if (existingMemberError) {
return {
success: false,
message: 'No fue posible verificar la membresía.',
};
}

if (existingMember) {
return {
success: false,
message: 'El usuario ya pertenece a este proyecto.',
};
}

const { error: insertError } = await supabase
.from('project_members')
.insert({
project_id: projectId,
user_id: userId,
role,
});

if (insertError) {
return {
success: false,
message: 'No fue posible agregar al usuario al proyecto.',
};
}

return {
success: true,
message: 'Miembro agregado correctamente.',
};
}

export async function removeProjectMember(
projectId: string,
userId: string,
): Promise<RemoveProjectMemberResult> {
const supabase = await createClient();

const {
data: { user },
error: authError,
} = await supabase.auth.getUser();

if (authError || !user) {
return { success: false, message: 'No autenticado.' };
}

const { data: ownerMembership, error: ownerError } = await supabase
.from('project_members')
.select('role')
.eq('project_id', projectId)
.eq('user_id', user.id)
.maybeSingle();

if (ownerError || ownerMembership?.role !== 'owner') {
return {
success: false,
message: 'Solo el propietario puede quitar colaboradores.',
};
}

const { data: targetMembership, error: targetError } = await supabase
.from('project_members')
.select('role')
.eq('project_id', projectId)
.eq('user_id', userId)
.maybeSingle();

if (targetError) {
return { success: false, message: 'No fue posible verificar la membresía.' };
}

if (!targetMembership) {
return { success: false, message: 'El usuario no pertenece a este proyecto.' };
}

if (targetMembership.role === 'owner') {
return { success: false, message: 'El propietario no puede ser quitado del proyecto.' };
}

const { error: deleteError } = await supabase
.from('project_members')
.delete()
.eq('project_id', projectId)
.eq('user_id', userId);

if (deleteError) {
return { success: false, message: 'No fue posible quitar al colaborador.' };
}

return { success: true, message: 'Colaborador quitado del proyecto.' };
}