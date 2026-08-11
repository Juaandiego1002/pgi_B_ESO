import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput } from '@/lib/rate-limit'
import { testimonialCreateSchema } from '@/lib/validations'

// ─── GET (public approved by default, all if ?all=true & authenticated) ──────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const allParam = searchParams.get('all')

    if (allParam === 'true') {
      const admin = await getAuthAdminFromRequest(req)
      if (!admin) {
        return apiError('No autenticado', 401)
      }
      const testimonials = await db.testimonial.findMany({
        include: { servicio: { select: { id: true, nombre: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return apiResponse(testimonials)
    }

    const testimonials = await db.testimonial.findMany({
      where: { aprobado: true },
      include: { servicio: { select: { id: true, nombre: true } } },
      orderBy: { createdAt: 'desc' },
    })

    return apiResponse(testimonials)
  } catch {
    return apiError('Error al obtener los testimonios', 500)
  }
}

// ─── POST (protected, create) ────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    const body = await req.json()
    const parsed = testimonialCreateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const { nombre, servicioId, calificacion, comentario, aprobado } = parsed.data

    const testimonial = await db.testimonial.create({
      data: {
        nombre: sanitizeInput(nombre),
        servicioId: servicioId || null,
        calificacion,
        comentario: sanitizeInput(comentario),
        aprobado: aprobado ?? false,
      },
      include: { servicio: { select: { id: true, nombre: true } } },
    })

    return apiResponse(testimonial, 201)
  } catch {
    return apiError('Error al crear el testimonio', 500)
  }
}
