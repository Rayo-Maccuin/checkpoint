import { z } from 'zod';

const phaseNameSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa el nombre de la fase.')
  .max(100, 'El nombre no puede superar los 100 caracteres.');

const phaseDescriptionSchema = z
  .string()
  .trim()
  .max(500, 'La descripción no puede superar los 500 caracteres.');

export const createPhaseSchema = z.object({
  projectId: z.string().uuid('El proyecto no es válido.'),
  name: phaseNameSchema,
  description: phaseDescriptionSchema.optional(),
});

export const updatePhaseSchema = z.object({
  projectId: z.string().uuid('El proyecto no es válido.'),
  phaseId: z.string().uuid('La fase no es válida.'),
  name: phaseNameSchema,
  description: phaseDescriptionSchema.optional(),
});

export const deletePhaseSchema = z.object({
  projectId: z.string().uuid('El proyecto no es válido.'),
  phaseId: z.string().uuid('La fase no es válida.'),
});

export const changeCurrentPhaseSchema = z.object({
  projectId: z.string().uuid('El proyecto no es válido.'),
  phaseId: z.string().uuid('La fase no es válida.'),
});

export type CreatePhaseFormData = z.infer<
  typeof createPhaseSchema
>;

export type UpdatePhaseFormData = z.infer<
  typeof updatePhaseSchema
>;

export type DeletePhaseData = z.infer<
  typeof deletePhaseSchema
>;

export type ChangeCurrentPhaseData = z.infer<
  typeof changeCurrentPhaseSchema
>;