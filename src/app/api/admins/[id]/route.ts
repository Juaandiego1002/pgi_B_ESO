import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { adminUpdateSchema } from '@/lib/validations'

// ─── PATCH (SUPERADMIN only, update admin) ───────────────────────────

export async function PATCH(
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
    const body = await req.json()
    const parsed = adminUpdateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const existing = await db.adminUser.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Administrador no encontrado', 404)
    }

    const data: Record<string, unknown> = {}
    if (parsed.data.nombre !== undefined) data.nombre = sanitizeInput(parsed.data.nombre)
    if (parsed.data.email !== undefined) {
      const sanitizedEmail = sanitizeInput(parsed.data.email.toLowerCase())
      // Check email uniqueness if changing
      if (sanitizedEmail !== existing.email) {
        const emailTaken = await db.adminUser.findUnique({ where: { email: sanitizedEmail } })
        if (emailTaken) {
          return apiError('Ya existe un administrador con ese email', 409)
        }
      }
      data.email = sanitizedEmail
    }
    if (parsed.data.rol !== undefined) data.rol = parsed.data.rol

    const updated = await db.adminUser.update({
      where: { id },
      data,
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true, updatedAt: true },
    })

    return apiResponse(updated)
  } catch {
    return apiError('Error al actualizar el administrador', 500)
  }
}

// ─── DELETE (SUPERADMIN only, deactivate admin) ──────────────────────

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

    const existing = await db.adminUser.findUnique({ where: { id } })
    if (!existing) {
      return apiError('Administrador no encontrado', 404)
    }

    // Prevent deactivating yourself
    if (existing.id === admin.id) {
      return apiError('No puedes desactivar tu propia cuenta', 400)
    }

    // Soft delete (deactivate)
    await db.adminUser.update({
      where: { id },
      data: { activo: false },
    })

    return apiResponse({ message: 'Administrador desactivado' })
  } catch {
    return apiError('Error al desactivar el administrador', 500)
  }
}
