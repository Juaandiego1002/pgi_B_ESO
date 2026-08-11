import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'
import { sanitizeInput, getClientIp, rateLimit } from '@/lib/rate-limit'
import { contactMessageSchema } from '@/lib/validations'

// ─── POST (public, rate-limited) ────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 3 messages per IP per 10 minutes
    const ip = getClientIp(req)
    if (!rateLimit(`contact:${ip}`, 3, 10 * 60 * 1000)) {
      return apiError('Demasiados mensajes. Intenta de nuevo en 10 minutos.', 429)
    }

    const body = await req.json()
    const parsed = contactMessageSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const { nombre, email, telefono, mensaje } = parsed.data

    const message = await db.contactMessage.create({
      data: {
        nombre: sanitizeInput(nombre),
        email: sanitizeInput(email),
        telefono: telefono ? sanitizeInput(telefono) : null,
        mensaje: sanitizeInput(mensaje),
      },
    })

    return apiResponse(message, 201)
  } catch {
    return apiError('Error al enviar el mensaje', 500)
  }
}

// ─── GET (protected, list with pagination) ───────────────────────────

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    const { searchParams } = new URL(req.url)
    const atendido = searchParams.get('atendido')
    const page = Math.max(1, Number(searchParams.get('page')) || 1)
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20))

    const where: Record<string, unknown> = {}
    if (atendido === 'true') {
      where.atendido = true
    } else if (atendido === 'false') {
      where.atendido = false
    }

    const [messages, total] = await Promise.all([
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.contactMessage.count({ where }),
    ])

    return apiResponse({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch {
    return apiError('Error al obtener los mensajes', 500)
  }
}
