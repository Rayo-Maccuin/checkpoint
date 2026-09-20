import { z } from 'zod';

const projectNameSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa el nombre del proyecto.')
  .max(120, 'El nombre no puede superar los 120 caracteres.');

const projectDescriptionSchema = z
  .string()
  .trim()
  .max(500, 'La descripción no puede superar los 500 caracteres.')
  .optional();

const projectPrioritySchema = z.enum([
  'low',
  'medium',
  'high',
  'critical',
]);

const projectStatusSchema = z.enum([
  'idea',
  'active',
  'paused',
  'blocked',
  'completed',
  'archived',
]);

export const createProjectSchema = z.object({
  name: projectNameSchema,
  description: projectDescriptionSchema,
  priority: projectPrioritySchema,
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = z.object({
  projectId: z.uuid('El proyecto no es válido.'),
  name: projectNameSchema,
  description: projectDescriptionSchema,
  priority: projectPrioritySchema,
  status: projectStatusSchema,
});

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

export const archiveProjectSchema = z.object({
  projectId: z.uuid('El proyecto no es válido.'),
});

export type ArchiveProjectFormData = z.infer<typeof archiveProjectSchema>;

export const deleteProjectSchema = z.object({
  projectId: z.uuid('El proyecto no es válido.'),
});

export type DeleteProjectFormData = z.infer<typeof deleteProjectSchema>;