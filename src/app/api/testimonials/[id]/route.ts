import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { testimonialUpdateSchema } from '@/lib/validations'

// ─── PATCH (protected) ───────────────────────────────────────────────

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    const { id } = await params
    const body = await req.json()
    const parsed = testimonialUpdateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const existing = await db.testimonial.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Testimonio no encontrado', 404)
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.nombre !== undefined) data.nombre = sanitizeInput(parsed.data.nombre)
    if (parsed.data.servicioId !== undefined) data.servicioId = parsed.data.servicioId || null
    if (parsed.data.calificacion !== undefined) data.calificacion = parsed.data.calificacion
    if (parsed.data.comentario !== undefined) data.comentario = sanitizeInput(parsed.data.comentario)
    if (parsed.data.aprobado !== undefined) data.aprobado = parsed.data.aprobado

    const testimonial = await db.testimonial.update({
      where: { id },
      data,
      include: { servicio: { select: { id: true, nombre: true } } },
    })

    return apiResponse(testimonial)
  } catch {
    return apiError('Error al actualizar el testimonio', 500)
  }
}

// ─── DELETE (protected, SUPERADMIN only) ────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }
    if (admin.rol !== 'SUPERADMIN') {
      return apiError('Acceso denegado: se requiere SUPERADMIN', 403)
    }

    const { id } = await params

    const existing = await db.testimonial.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Testimonio no encontrado', 404)
    }

    await db.testimonial.delete({ where: { id } })

    return apiResponse({ message: 'Testimonio eliminado' })
  } catch {
    return apiError('Error al eliminar el testimonio', 500)
  }
}
