import { createClient } from '@/infrastructure/supabase/server';

export interface ProjectTask {
id: string;
projectId: string;
phaseId: string | null;
title: string;
description: string | null;
status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
priority: 'low' | 'medium' | 'high' | 'critical';
assignedTo: string | null;
createdBy: string;
completedAt: string | null;
completedBy: string | null;
createdAt: string;
updatedAt: string;
phase: {
id: string;
name: string;
position: number;
} | null;
}

export type GetProjectTasksResult =
| {
success: true;
tasks: ProjectTask[];
}
| {
success: false;
message: string;
};

export async function getProjectTasks(
projectId: string,
): Promise<GetProjectTasksResult> {
const supabase = await createClient();

const { data, error } = await supabase
.from('tasks')
.select('id, project_id, phase_id, title, description, status, priority, assigned_to, created_by, completed_at, completed_by, created_at, updated_at, phase:phases ( id, name, position )')
.eq('project_id', projectId)
.order('created_at', { ascending: false });

if (error) {
console.error('Get project tasks error:', error);

return {
  success: false,
  message: 'No fue posible cargar las tareas del proyecto.',
};

}

const tasks: ProjectTask[] = data.map((task) => {
const phase = Array.isArray(task.phase) ? task.phase[0] ?? null : task.phase;

return {
  id: task.id,
  projectId: task.project_id,
  phaseId: task.phase_id,
  title: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority,
  assignedTo: task.assigned_to,
  createdBy: task.created_by,
  completedAt: task.completed_at,
  completedBy: task.completed_by,
  createdAt: task.created_at,
  updatedAt: task.updated_at,
  phase,
};

});

return {
success: true,
tasks,
};
}