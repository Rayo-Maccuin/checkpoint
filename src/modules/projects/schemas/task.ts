import { z } from 'zod';

const taskTitleSchema = z
.string()
.trim()
.min(1, 'Ingresa el título de la tarea.')
.max(160, 'El título no puede superar los 160 caracteres.');

const taskDescriptionSchema = z
.string()
.trim()
.max(1000, 'La descripción no puede superar los 1000 caracteres.');

const taskStatusSchema = z.enum([
'pending',
'in_progress',
'completed',
'blocked',
'cancelled',
]);

const taskPrioritySchema = z.enum([
'low',
'medium',
'high',
'critical',
]);

const optionalUuidSchema = z
.string()
.uuid('El identificador no es válido.')
.nullable()
.optional();

export const createTaskSchema = z.object({
projectId: z.string().uuid('El proyecto no es válido.'),
title: taskTitleSchema,
description: taskDescriptionSchema.optional(),
phaseId: optionalUuidSchema,
priority: taskPrioritySchema,
assignedTo: optionalUuidSchema,
});

export const updateTaskSchema = z.object({
projectId: z.string().uuid('El proyecto no es válido.'),
taskId: z.string().uuid('La tarea no es válida.'),
title: taskTitleSchema,
description: taskDescriptionSchema.optional(),
phaseId: optionalUuidSchema,
priority: taskPrioritySchema,
assignedTo: optionalUuidSchema,
});

export const changeTaskStatusSchema = z.object({
projectId: z.string().uuid('El proyecto no es válido.'),
taskId: z.string().uuid('La tarea no es válida.'),
status: taskStatusSchema,
});

export const changeTaskPrioritySchema = z.object({
projectId: z.string().uuid('El proyecto no es válido.'),
taskId: z.string().uuid('La tarea no es válida.'),
priority: taskPrioritySchema,
});

export const assignTaskSchema = z.object({
projectId: z.string().uuid('El proyecto no es válido.'),
taskId: z.string().uuid('La tarea no es válida.'),
assignedTo: optionalUuidSchema,
});

export const completeTaskSchema = z.object({
projectId: z.string().uuid('El proyecto no es válido.'),
taskId: z.string().uuid('La tarea no es válida.'),
});

export const deleteTaskSchema = z.object({
projectId: z.string().uuid('El proyecto no es válido.'),
taskId: z.string().uuid('La tarea no es válida.'),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;

export type ChangeTaskStatusData = z.infer<
typeof changeTaskStatusSchema

> ;

export type ChangeTaskPriorityData = z.infer<
typeof changeTaskPrioritySchema

> ;

export type AssignTaskData = z.infer<typeof assignTaskSchema>;

export type CompleteTaskData = z.infer<typeof completeTaskSchema>;

export type DeleteTaskData = z.infer<typeof deleteTaskSchema>;
