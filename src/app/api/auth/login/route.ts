import { NextRequest } from 'next/server'
import { z } from 'zod/v4'
import { db } from '@/lib/db'
import { createToken, verifyPassword, apiResponse, apiError, TOKEN_NAME } from '@/lib/auth'
import { sanitizeInput, getClientIp } from '@/lib/rate-limit'
import { adminLoginSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    // Rate limit: max 5 login attempts per IP per 15 minutes
    const ip = getClientIp(req)
    if (!rateLimit(`login:${ip}`, 5, 15 * 60 * 1000)) {
      return apiError('Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos.', 429)
    }

    const body = await req.json()
    const parsed = adminLoginSchema.safeParse(body)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Datos inválidos'
      return apiError(firstError, 400)
    }

    const { email, password } = parsed.data
    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    const admin = await db.adminUser.findUnique({
      where: { email: sanitizedEmail },
    })

    if (!admin || !admin.activo) {
      return apiError('Credenciales inválidas', 401)
    }

    const validPassword = await verifyPassword(password, admin.passwordHash)
    if (!validPassword) {
      return apiError('Credenciales inválidas', 401)
    }

    const token = await createToken({
      adminId: admin.id,
      email: admin.email,
      nombre: admin.nombre,
      rol: admin.rol,
    })

    const response = apiResponse({
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      rol: admin.rol,
    })

    // Set cookie
    const headers = new Headers(response.headers)
    headers.append(
      'Set-Cookie',
      `${TOKEN_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`,
    )

    return new Response(response.body, {
      status: 200,
      headers,
    })
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
