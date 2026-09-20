'use server';

import { createClient } from '@/infrastructure/supabase/server';
import {
assignTaskSchema,
changeTaskPrioritySchema,
changeTaskStatusSchema,
completeTaskSchema,
createTaskSchema,
deleteTaskSchema,
updateTaskSchema,
type AssignTaskData,
type ChangeTaskPriorityData,
type ChangeTaskStatusData,
type CompleteTaskData,
type CreateTaskFormData,
type DeleteTaskData,
type UpdateTaskFormData,
} from '@/modules/projects/schemas/task';

type ProjectRole = 'owner' | 'collaborator' | 'viewer';

type ProjectAccessSuccess = {
success: true;
userId: string;
role: ProjectRole;
};

type ActionError = {
success: false;
message: string;
};

type ProjectAccessResult = ProjectAccessSuccess | ActionError;

type TaskActionResult =
| {
success: true;
}
| ActionError;

export type { TaskActionResult };

async function getProjectAccess(
projectId: string,
): Promise<ProjectAccessResult> {
const supabase = await createClient();

const {
data: { user },
error: userError,
} = await supabase.auth.getUser();

if (userError || !user) {
console.error('Task action session error:', {
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
console.error('Task project membership error:', {
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

function canEditTasks(role: ProjectRole): boolean {
return role === 'owner' || role === 'collaborator';
}

function isOwner(role: ProjectRole): boolean {
return role === 'owner';
}

async function verifyTaskBelongsToProject(
projectId: string,
taskId: string,
): Promise<ActionError | { success: true }> {
const supabase = await createClient();

const { data: task, error } = await supabase
.from('tasks')
.select('id, project_id')
.eq('id', taskId)
.eq('project_id', projectId)
.maybeSingle();

if (error) {
console.error('Task ownership verification error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible verificar la tarea.',
};

}

if (!task) {
return {
success: false,
message: 'La tarea no pertenece a este proyecto.',
};
}

return {
success: true,
};
}

async function verifyPhaseBelongsToProject(
projectId: string,
phaseId: string | null | undefined,
): Promise<ActionError | { success: true }> {
if (!phaseId) {
return {
success: true,
};
}

const supabase = await createClient();

const { data: phase, error } = await supabase
.from('phases')
.select('id')
.eq('id', phaseId)
.eq('project_id', projectId)
.maybeSingle();

if (error) {
console.error('Task phase verification error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible verificar la fase.',
};


}

if (!phase) {
return {
success: false,
message: 'La fase no pertenece a este proyecto.',
};
}

return {
success: true,
};
}

async function verifyAssigneeBelongsToProject(
projectId: string,
assignedTo: string | null | undefined,
): Promise<ActionError | { success: true }> {
if (!assignedTo) {
return {
success: true,
};
}

const supabase = await createClient();

const { data: member, error } = await supabase
.from('project_members')
.select('user_id')
.eq('project_id', projectId)
.eq('user_id', assignedTo)
.maybeSingle();

if (error) {
console.error('Task assignee verification error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible verificar el responsable.',
};


}

if (!member) {
return {
success: false,
message: 'El responsable no pertenece a este proyecto.',
};
}

return {
success: true,
};
}

export async function createTask(
data: CreateTaskFormData,
): Promise<TaskActionResult & { taskId?: string }> {
const validation = createTaskSchema.safeParse(data);

if (!validation.success) {
return {
success: false,
message: 'Los datos de la tarea no son válidos.',
};
}

const access = await getProjectAccess(
validation.data.projectId,
);

if (!access.success) {
return access;
}

if (!canEditTasks(access.role)) {
return {
success: false,
message: 'No tienes permisos para crear tareas.',
};
}

const phaseValidation = await verifyPhaseBelongsToProject(
validation.data.projectId,
validation.data.phaseId,
);

if (!phaseValidation.success) {
return phaseValidation;
}

const assigneeValidation =
await verifyAssigneeBelongsToProject(
validation.data.projectId,
validation.data.assignedTo,
);

if (!assigneeValidation.success) {
return assigneeValidation;
}

const supabase = await createClient();
const taskId = crypto.randomUUID();

const { error } = await supabase.from('tasks').insert({
id: taskId,
project_id: validation.data.projectId,
phase_id: validation.data.phaseId ?? null,
title: validation.data.title,
description: validation.data.description || null,
priority: validation.data.priority,
assigned_to: validation.data.assignedTo ?? null,
created_by: access.userId,
status: 'pending',
});

if (error) {
console.error('Create task error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});

return {
  success: false,
  message: 'No fue posible crear la tarea.',
};


}

return {
success: true,
taskId,
};
}

export async function updateTask(
data: UpdateTaskFormData,
): Promise<TaskActionResult> {
const validation = updateTaskSchema.safeParse(data);

if (!validation.success) {
return {
success: false,
message: 'Los datos de la tarea no son válidos.',
};
}

const access = await getProjectAccess(
validation.data.projectId,
);

if (!access.success) {
return access;
}

if (!canEditTasks(access.role)) {
return {
success: false,
message: 'No tienes permisos para editar tareas.',
};
}

const taskValidation = await verifyTaskBelongsToProject(
validation.data.projectId,
validation.data.taskId,
);

if (!taskValidation.success) {
return taskValidation;
}

const phaseValidation = await verifyPhaseBelongsToProject(
validation.data.projectId,
validation.data.phaseId,
);

if (!phaseValidation.success) {
return phaseValidation;
}

const assigneeValidation =
await verifyAssigneeBelongsToProject(
validation.data.projectId,
validation.data.assignedTo,
);

if (!assigneeValidation.success) {
return assigneeValidation;
}

const supabase = await createClient();

const { error } = await supabase
.from('tasks')
.update({
phase_id: validation.data.phaseId ?? null,
title: validation.data.title,
description: validation.data.description || null,
priority: validation.data.priority,
assigned_to: validation.data.assignedTo ?? null,
})
.eq('id', validation.data.taskId)
.eq('project_id', validation.data.projectId);

if (error) {
console.error('Update task error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible actualizar la tarea.',
};


}

return {
success: true,
};
}

export async function changeTaskStatus(
data: ChangeTaskStatusData,
): Promise<TaskActionResult> {
const validation = changeTaskStatusSchema.safeParse(data);

if (!validation.success) {
return {
success: false,
message: 'El estado de la tarea no es válido.',
};
}

const access = await getProjectAccess(
validation.data.projectId,
);

if (!access.success) {
return access;
}

if (!canEditTasks(access.role)) {
return {
success: false,
message: 'No tienes permisos para cambiar el estado.',
};
}

const taskValidation = await verifyTaskBelongsToProject(
validation.data.projectId,
validation.data.taskId,
);

if (!taskValidation.success) {
return taskValidation;
}

const supabase = await createClient();

const { error } = await supabase
.from('tasks')
.update({
status: validation.data.status,
})
.eq('id', validation.data.taskId)
.eq('project_id', validation.data.projectId);

if (error) {
console.error('Change task status error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible cambiar el estado de la tarea.',
};


}

return {
success: true,
};
}

export async function changeTaskPriority(
data: ChangeTaskPriorityData,
): Promise<TaskActionResult> {
const validation = changeTaskPrioritySchema.safeParse(data);

if (!validation.success) {
return {
success: false,
message: 'La prioridad de la tarea no es válida.',
};
}

const access = await getProjectAccess(
validation.data.projectId,
);

if (!access.success) {
return access;
}

if (!canEditTasks(access.role)) {
return {
success: false,
message: 'No tienes permisos para cambiar la prioridad.',
};
}

const taskValidation = await verifyTaskBelongsToProject(
validation.data.projectId,
validation.data.taskId,
);

if (!taskValidation.success) {
return taskValidation;
}

const supabase = await createClient();

const { error } = await supabase
.from('tasks')
.update({
priority: validation.data.priority,
})
.eq('id', validation.data.taskId)
.eq('project_id', validation.data.projectId);

if (error) {
console.error('Change task priority error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible cambiar la prioridad.',
};


}

return {
success: true,
};
}

export async function assignTask(
data: AssignTaskData,
): Promise<TaskActionResult> {
const validation = assignTaskSchema.safeParse(data);

if (!validation.success) {
return {
success: false,
message: 'Los datos de asignación no son válidos.',
};
}

const access = await getProjectAccess(
validation.data.projectId,
);

if (!access.success) {
return access;
}

if (!canEditTasks(access.role)) {
return {
success: false,
message: 'No tienes permisos para asignar tareas.',
};
}

const taskValidation = await verifyTaskBelongsToProject(
validation.data.projectId,
validation.data.taskId,
);

if (!taskValidation.success) {
return taskValidation;
}

const assigneeValidation =
await verifyAssigneeBelongsToProject(
validation.data.projectId,
validation.data.assignedTo,
);

if (!assigneeValidation.success) {
return assigneeValidation;
}

const supabase = await createClient();

const { error } = await supabase
.from('tasks')
.update({
assigned_to: validation.data.assignedTo ?? null,
})
.eq('id', validation.data.taskId)
.eq('project_id', validation.data.projectId);

if (error) {
console.error('Assign task error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible asignar la tarea.',
};


}

return {
success: true,
};
}

export async function completeTask(
data: CompleteTaskData,
): Promise<TaskActionResult> {
const validation = completeTaskSchema.safeParse(data);

if (!validation.success) {
return {
success: false,
message: 'Los datos de la tarea no son válidos.',
};
}

const access = await getProjectAccess(
validation.data.projectId,
);

if (!access.success) {
return access;
}

if (!canEditTasks(access.role)) {
return {
success: false,
message: 'No tienes permisos para completar tareas.',
};
}

const taskValidation = await verifyTaskBelongsToProject(
validation.data.projectId,
validation.data.taskId,
);

if (!taskValidation.success) {
return taskValidation;
}

const supabase = await createClient();

const { error } = await supabase
.from('tasks')
.update({
status: 'completed',
})
.eq('id', validation.data.taskId)
.eq('project_id', validation.data.projectId);

if (error) {
console.error('Complete task error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible completar la tarea.',
};


}

return {
success: true,
};
}

export async function deleteTask(
data: DeleteTaskData,
): Promise<TaskActionResult> {
const validation = deleteTaskSchema.safeParse(data);

if (!validation.success) {
return {
success: false,
message: 'Los datos de la tarea no son válidos.',
};
}

const access = await getProjectAccess(
validation.data.projectId,
);

if (!access.success) {
return access;
}

if (!isOwner(access.role)) {
return {
success: false,
message: 'Solo el propietario puede eliminar tareas.',
};
}

const taskValidation = await verifyTaskBelongsToProject(
validation.data.projectId,
validation.data.taskId,
);

if (!taskValidation.success) {
return taskValidation;
}

const supabase = await createClient();

const { error } = await supabase
.from('tasks')
.delete()
.eq('id', validation.data.taskId)
.eq('project_id', validation.data.projectId);

if (error) {
console.error('Delete task error:', {
code: error.code,
details: error.details,
hint: error.hint,
message: error.message,
});


return {
  success: false,
  message: 'No fue posible eliminar la tarea.',
};


}

return {
success: true,
};
}

