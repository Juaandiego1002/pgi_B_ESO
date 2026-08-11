import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { inquiryUpdateSchema } from '@/lib/validations'

// ─── GET (protected) ────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    const { id } = await params

    const inquiry = await db.inquiry.findUnique({
      where: { id },
      include: { servicioInteres: true },
    })

    if (!inquiry) {
      return apiError('Consulta no encontrada', 404)
    }

    return apiResponse(inquiry)
  } catch {
    return apiError('Error al obtener la consulta', 500)
  }
}

// ─── PATCH (protected, update estado/notasInternas) ─────────────────

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
    const parsed = inquiryUpdateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.estado !== undefined) data.estado = parsed.data.estado
    if (parsed.data.notasInternas !== undefined) {
      data.notasInternas = parsed.data.notasInternas ? sanitizeInput(parsed.data.notasInternas) : null
    }

    const inquiry = await db.inquiry.update({
      where: { id },
      data,
      include: { servicioInteres: true },
    })

    return apiResponse(inquiry)
  } catch {
    return apiError('Error al actualizar la consulta', 500)
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

    const inquiry = await db.inquiry.findUnique({ where: { id } })
    if (!inquiry) {
      return apiError('Consulta no encontrada', 404)
    }

    await db.inquiry.delete({ where: { id } })

    return apiResponse({ message: 'Consulta eliminada' })
  } catch {
    return apiError('Error al eliminar la consulta', 500)
  }
}
