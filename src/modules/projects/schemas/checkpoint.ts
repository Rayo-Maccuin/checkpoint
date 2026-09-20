import { z } from 'zod';

const checkpointTextSchema = z
  .string()
  .trim()
  .max(2000, 'El texto no puede superar los 2000 caracteres.');

const requiredCheckpointTextSchema = checkpointTextSchema.min(
  1,
  'Este campo es obligatorio.',
);

export const createCheckpointSchema = z.object({
  projectId: z.string().uuid('El proyecto no es válido.'),
  whatDone: requiredCheckpointTextSchema,
  whatWorks: checkpointTextSchema.optional(),
  whatRemains: checkpointTextSchema.optional(),
  blockers: checkpointTextSchema.optional(),
  nextStep: requiredCheckpointTextSchema.max(
    1000,
    'El siguiente paso no puede superar los 1000 caracteres.',
  ),
});

export type CreateCheckpointFormData = z.infer<
  typeof createCheckpointSchema
>;