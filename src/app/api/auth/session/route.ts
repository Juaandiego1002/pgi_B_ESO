import { NextRequest } from 'next/server'
import { getAuthAdminFromRequest, apiResponse, apiError } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const admin = await getAuthAdminFromRequest(req)
    if (!admin) {
      return apiError('No autenticado', 401)
    }

    return apiResponse({
      id: admin.id,
      nombre: admin.nombre,
      email: admin.email,
      rol: admin.rol,
      activo: admin.activo,
    })
  } catch {
    return apiError('Error interno del servidor', 500)
  }
}
