import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput, getClientIp, rateLimit } from '@/lib/rate-limit'
import { inquiryCreateSchema } from '@/lib/validations'

// ─── POST (public, rate-limited) ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 3 inquiries per IP per 10 minutes
    const ip = getClientIp(req)
    if (!rateLimit(`inquiry:${ip}`, 3, 10 * 60 * 1000)) {
      return apiError('Demasiadas consultas. Intenta de nuevo en 10 minutos.', 429)
    }

    const body = await req.json()
    const parsed = inquiryCreateSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const { nombreCliente, telefono, email, servicioInteresId, motivoConsulta } = parsed.data

    const inquiry = await db.inquiry.create({
      data: {
        nombreCliente: sanitizeInput(nombreCliente),
        telefono: sanitizeInput(telefono),
        email: email ? sanitizeInput(email) : null,
        servicioInteresId: servicioInteresId || null,
        motivoConsulta: sanitizeInput(motivoConsulta),
      },
      include: { servicioInteres: true },
    })

    return apiResponse(inquiry, 201)
  } catch {
    return apiError('Error al crear la consulta', 500)
  }
}

// ─── GET (protected, with filters) ──────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get('estado') || undefined
    const servicioInteresId = searchParams.get('servicioInteresId') || undefined
    const search = searchParams.get('search') || undefined
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))

    const where: Record<string, unknown> = {}

    if (estado) {
      where.estado = estado
    }
    if (servicioInteresId) {
      where.servicioInteresId = servicioInteresId
    }
    if (search) {
      where.OR = [
        { nombreCliente: { contains: search } },
        { email: { contains: search } },
        { telefono: { contains: search } },
        { motivoConsulta: { contains: search } },
      ]
    }

    const [inquiries, total] = await Promise.all([
      db.inquiry.findMany({
        where,
        include: { servicioInteres: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inquiry.count({ where }),
    ])

    return apiResponse({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch {
    return apiError('Error al obtener las consultas', 500)
  }
}
