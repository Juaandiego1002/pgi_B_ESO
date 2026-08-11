import { NextResponse } from 'next/server'
import { apiResponse, apiError, TOKEN_NAME } from '@/lib/auth'

export async function POST() {
  try {
    const response = apiResponse({ message: 'Sesión cerrada' })

    const headers = new Headers(response.headers)
    headers.append(
      'Set-Cookie',
      `${TOKEN_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
    )

    return new NextResponse(response.body, {
      status: 200,
      headers,
    })
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
