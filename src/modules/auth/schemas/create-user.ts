import { z } from 'zod';

export const createUserSchema = z.object({
name: z
.string()
.trim()
.min(1, 'El nombre es obligatorio.')
.max(120, 'El nombre no puede superar los 120 caracteres.'),

email: z
.string()
.trim()
.email('Ingresa un correo electrónico válido.')
.max(254, 'El correo electrónico no puede superar los 254 caracteres.'),

password: z
.string()
.min(8, 'La contraseña debe tener al menos 8 caracteres.')
.max(128, 'La contraseña no puede superar los 128 caracteres.')
.regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula.')
.regex(/[a-z]/, 'La contraseña debe contener al menos una minúscula.')
.regex(/[0-9]/, 'La contraseña debe contener al menos un número.'),

role: z.enum(['admin', 'collaborator', 'viewer']).default('collaborator'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;