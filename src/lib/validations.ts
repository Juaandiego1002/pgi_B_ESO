import { z } from 'zod/v4'

// ─── Inquiry (público) ──────────────────────────────────────────────

export const inquiryCreateSchema = z.object({
  nombreCliente: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  telefono: z
    .string()
    .min(7, 'El teléfono debe tener al menos 7 dígitos')
    .max(20, 'El teléfono es muy largo')
    .regex(/^[+\d\s\-().]+$/, 'Formato de teléfono inválido'),
  email: z
    .string()
    .email('Email inválido')
    .max(150)
    .optional()
    .or(z.literal('')),
  servicioInteresId: z.string().optional().or(z.literal('')),
  motivoConsulta: z
    .string()
    .min(20, 'Cuéntanos más detalle, al menos 20 caracteres')
    .max(2000, 'El mensaje no puede exceder 2000 caracteres'),
})

// ─── Inquiry (admin updates) ───────────────────────────────────────

export const inquiryUpdateSchema = z.object({
  estado: z.enum(['NUEVO', 'CONTACTADO', 'EN_NEGOCIACION', 'CONFIRMADO', 'COMPLETADO', 'DESCARTADO']).optional(),
  notasInternas: z.string().max(3000).optional().or(z.literal('')),
})

// ─── Service ───────────────────────────────────────────────────────

export const serviceCreateSchema = z.object({
  nombre: z.string().min(3, 'Mínimo 3 caracteres').max(120),
  descripcion: z.string().min(10, 'Mínimo 10 caracteres').max(2000),
  categoria: z.string().min(2).max(80),
  precio: z.coerce.number().min(0, 'El precio no puede ser negativo'),
  imagenUrl: z.string().max(500).optional().or(z.literal('')),
 activo: z.boolean().optional(),
  orden: z.coerce.number().int().min(0).optional(),
})

export const serviceUpdateSchema = serviceCreateSchema.partial()

// ─── Testimonial ───────────────────────────────────────────────────

export const testimonialCreateSchema = z.object({
  nombre: z.string().min(2).max(100),
  servicioId: z.string().optional().or(z.literal('')),
  calificacion: z.coerce.number().int().min(1).max(5),
  comentario: z.string().min(10, 'Mínimo 10 caracteres').max(1000),
  aprobado: z.boolean().optional(),
})

export const testimonialUpdateSchema = testimonialCreateSchema.partial()

// ─── Admin ──────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Contraseña demasiado corta'),
})

export const adminCreateSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email('Email inválido').max(150),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  rol: z.enum(['SUPERADMIN', 'ADMIN']).optional(),
})

export const adminUpdateSchema = adminCreateSchema.partial().omit({ password: true })

export const adminChangePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
})

// ─── Contact Message (público) ─────────────────────────────────────

export const contactMessageSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email('Email inválido').max(150),
  telefono: z.string().max(20).optional().or(z.literal('')),
  mensaje: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000),
})

// ─── Infers ────────────────────────────────────────────────────────

export type InquiryCreateInput = z.infer<typeof inquiryCreateSchema>
export type InquiryUpdateInput = z.infer<typeof inquiryUpdateSchema>
export type ServiceCreateInput = z.infer<typeof serviceCreateSchema>
export type ServiceUpdateInput = z.infer<typeof serviceUpdateSchema>
export type TestimonialCreateInput = z.infer<typeof testimonialCreateSchema>
export type TestimonialUpdateInput = z.infer<typeof testimonialUpdateSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
export type AdminCreateInput = z.infer<typeof adminCreateSchema>
export type AdminUpdateInput = z.infer<typeof adminUpdateSchema>
export type ContactMessageInput = z.infer<typeof contactMessageSchema>
