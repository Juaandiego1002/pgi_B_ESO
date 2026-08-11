import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { z } from 'zod/v4'

const contactUpdateSchema = z.object({
  atendido: z.boolean().optional(),
  notasInternas: z.string().max(3000).optional().or(z.literal('')),
})

// ─── PATCH (protected, toggle atendido + notasInternas) ───────────────

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
    const parsed = contactUpdateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const existing = await db.contactMessage.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Mensaje no encontrado', 404)
    }

    // Note: ContactMessage model does not have notasInternas in schema.
    // Only atendido can be updated.
    const data: Record<string, unknown> = {}
    if (parsed.data.atendido !== undefined) data.atendido = parsed.data.atendido

    const message = await db.contactMessage.update({
      where: { id },
      data,
    })

    return apiResponse(message)
  } catch {
    return apiError('Error al actualizar el mensaje', 500)
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

    const existing = await db.contactMessage.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Mensaje no encontrado', 404)
    }

    await db.contactMessage.delete({ where: { id } })

    return apiResponse({ message: 'Mensaje eliminado' })
  } catch {
    return apiError('Error al eliminar el mensaje', 500)
  }
}
