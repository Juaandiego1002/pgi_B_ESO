import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError, hashPassword } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { adminCreateSchema } from '@/lib/validations'

// ─── GET (SUPERADMIN only, list all admins, exclude passwordHash) ───

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }
    if (admin.rol !== 'SUPERADMIN') {
      return apiError('Acceso denegado: se requiere SUPERADMIN', 403)
    }

    const admins = await db.adminUser.findMany({
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    })

    return apiResponse(admins)
  } catch {
    return apiError('Error al obtener los administradores', 500)
  }
}

// ─── POST (SUPERADMIN only, create admin) ────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }
    if (admin.rol !== 'SUPERADMIN') {
      return apiError('Acceso denegado: se requiere SUPERADMIN', 403)
    }

    const body = await req.json()
    const parsed = adminCreateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const { nombre, email, password, rol } = parsed.data
    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    // Check if email already exists
    const existing = await db.adminUser.findUnique({ where: { email: sanitizedEmail } })
    if (existing) {
      return apiError('Ya existe un administrador con ese email', 409)
    }

    const passwordHash = await hashPassword(password)

    const newAdmin = await db.adminUser.create({
      data: {
        nombre: sanitizeInput(nombre),
        email: sanitizedEmail,
        passwordHash,
        rol: rol || 'ADMIN',
      },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true },
    })

    return apiResponse(newAdmin, 201)
  } catch {
    return apiError('Error al crear el administrador', 500)
  }
}
