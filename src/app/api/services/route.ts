import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { serviceCreateSchema } from '@/lib/validations'

// ─── GET (public active by default, all if ?all=true & authenticated) ──────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const allParam = searchParams.get('all')

    if (allParam === 'true') {
      const admin = await getAuthAdminFromRequest(req)
      if (!admin) {
        return apiError('No autenticado', 401)
      }
      const services = await db.service.findMany({
        orderBy: { orden: 'asc' },
        include: {
          _count: { select: { inquiries: true, testimonials: true } },
        },
      })
      return apiResponse(services)
    }

    const services = await db.service.findMany({
      where: { activo: true },
      orderBy: { orden: 'asc' },
    })

    return apiResponse(services)
  } catch {
    return apiError('Error al obtener los servicios', 500)
  }
}

// ─── POST (protected, create service) ────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    const body = await req.json()
    const parsed = serviceCreateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const { nombre, descripcion, categoria, precio, imagenUrl, activo, orden } = parsed.data

    const service = await db.service.create({
      data: {
        nombre: sanitizeInput(nombre),
        descripcion: sanitizeInput(descripcion),
        categoria: sanitizeInput(categoria),
        precio,
        imagenUrl: imagenUrl ? sanitizeInput(imagenUrl) : null,
        activo: activo ?? true,
        orden: orden ?? 0,
      },
    })

    return apiResponse(service, 201)
  } catch {
    return apiError('Error al crear el servicio', 500)
  }
}
