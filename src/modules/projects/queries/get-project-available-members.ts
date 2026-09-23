'use server';

import { createClient } from '@/infrastructure/supabase/server';

export interface ProjectAvailableMember {
id: string;
name: string | null;
avatarUrl: string | null;
}

export interface GetProjectAvailableMembersSuccess {
success: true;
members: ProjectAvailableMember[];
}

export interface GetProjectAvailableMembersError {
success: false;
message: string;
}

export type GetProjectAvailableMembersResult =
| GetProjectAvailableMembersSuccess
| GetProjectAvailableMembersError;

export async function getProjectAvailableMembers(
projectId: string,
): Promise<GetProjectAvailableMembersResult> {
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

const { data: projectMembers, error: membersError } = await supabase
.from('project_members')
.select('user_id')
.eq('project_id', projectId);

if (membersError) {
return {
success: false,
message: 'No fue posible obtener los miembros del proyecto.',
};
}

const memberIds = (projectMembers ?? []).map(
(member) => member.user_id,
);

let profilesQuery = supabase
.from('profiles')
.select('id, name, avatar_url')
.order('name', { ascending: true });

if (memberIds.length > 0) {
profilesQuery = profilesQuery.not(
'id',
'in',
`(${memberIds.join(',')})`,
);
}

const { data: profiles, error: profilesError } = await profilesQuery;

if (profilesError) {
return {
success: false,
message: 'No fue posible obtener los usuarios disponibles.',
};
}

return {
success: true,
members: (profiles ?? []).map((profile) => ({
id: profile.id,
name: profile.name,
avatarUrl: profile.avatar_url,
})),
};
}