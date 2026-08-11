import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { serviceUpdateSchema } from '@/lib/validations'

// ─── GET (public for active, protected for inactive) ─────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params

    const service = await db.service.findUnique({
      where: { id },
      include: {
        _count: {
          select: { inquiries: true, testimonials: true },
        },
      },
    })

    if (!service) {
      return apiError('Servicio no encontrado', 404)
    }

    // If inactive, require auth
    if (!service.activo) {
      const admin = await getAuthAdminFromRequest(req)
      if (!admin) {
        return apiError('Servicio no encontrado', 404)
      }
    }

    return apiResponse(service)
  } catch {
    return apiError('Error al obtener el servicio', 500)
  }
}

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
    const parsed = serviceUpdateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.nombre !== undefined) data.nombre = sanitizeInput(parsed.data.nombre)
    if (parsed.data.descripcion !== undefined) data.descripcion = sanitizeInput(parsed.data.descripcion)
    if (parsed.data.categoria !== undefined) data.categoria = sanitizeInput(parsed.data.categoria)
    if (parsed.data.precio !== undefined) data.precio = parsed.data.precio
    if (parsed.data.imagenUrl !== undefined) data.imagenUrl = parsed.data.imagenUrl ? sanitizeInput(parsed.data.imagenUrl) : null
    if (parsed.data.activo !== undefined) data.activo = parsed.data.activo
    if (parsed.data.orden !== undefined) data.orden = parsed.data.orden

    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Servicio no encontrado', 404)
    }

    const service = await db.service.update({
      where: { id },
      data,
    })

    return apiResponse(service)
  } catch {
    return apiError('Error al actualizar el servicio', 500)
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

    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Servicio no encontrado', 404)
    }

    await db.service.delete({ where: { id } })

    return apiResponse({ message: 'Servicio eliminado' })
  } catch {
    return apiError('Error al eliminar el servicio', 500)
  }
}
