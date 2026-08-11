import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { db } from './db'
import { compare, hash } from 'bcryptjs'
import type { AdminRole } from '@prisma/client'

// ─── Types ──────────────────────────────────────────────────────────

export interface SessionPayload {
  adminId: string
  email: string
  nombre: string
  rol: AdminRole
}

export interface AuthAdmin {
  id: string
  nombre: string
  email: string
  rol: AdminRole
  activo: boolean
}

// ─── JWT helpers ────────────────────────────────────────────────────

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-change-in-production')
const TOKEN_NAME = 'admin_session'

export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(SECRET)
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as unknown as SessionPayload
  }
  catch {
    return null
  }
}

// ─── Session helpers (cookie-based for SSR + middleware) ────────────

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(TOKEN_NAME)?.value
  if (!token) return null
  return verifyToken(token)
}

export async function getAuthAdmin(): Promise<AuthAdmin | null> {
  const session = await getSession()
  if (!session) return null
  const admin = await db.adminUser.findUnique({
    where: { id: session.adminId },
    select: { id: true, nombre: true, email: true, rol: true, activo: true },
  })
  if (!admin || !admin.activo) return null
  return admin
}

export async function requireAdmin(): Promise<AuthAdmin> {
  const admin = await getAuthAdmin()
  if (!admin) throw new AuthError('No autenticado', 401)
  return admin
}

export async function requireSuperAdmin(): Promise<AuthAdmin> {
  const admin = await requireAdmin()
  if (admin.rol !== 'SUPERADMIN') throw new AuthError('Acceso denegado: se requiere SUPERADMIN', 403)
  return admin
}

// ─── Token from request (for API routes called from client) ────────

export function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7)
  return null
}

export async function getAuthAdminFromRequest(req: Request): Promise<AuthAdmin | null> {
  // 1. Try cookie first (SSR / same-origin)
  const cookieStore = await cookies()
  const cookieToken = cookieStore.get(TOKEN_NAME)?.value
  if (cookieToken) {
    const session = await verifyToken(cookieToken)
    if (session) {
      const admin = await db.adminUser.findUnique({
        where: { id: session.adminId },
        select: { id: true, nombre: true, email: true, rol: true, activo: true },
      })
      if (admin && admin.activo) return admin
    }
  }
  // 2. Try Bearer token
  const bearer = extractToken(req)
  if (bearer) {
    const session = await verifyToken(bearer)
    if (session) {
      const admin = await db.adminUser.findUnique({
        where: { id: session.adminId },
        select: { id: true, nombre: true, email: true, rol: true, activo: true },
      })
      if (admin && admin.activo) return admin
    }
  }
  return null
}

// ─── Password helpers ───────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 12)
}

export async function verifyPassword(password: string, hashValue: string): Promise<boolean> {
  return compare(password, hashValue)
}

// ─── API Response helpers ───────────────────────────────────────────

export function apiResponse<T>(data: T, status = 200) {
  return Response.json({ success: true, data }, { status })
}

export function apiError(message: string, status = 400) {
  return Response.json({ success: false, error: message }, { status })
}

// ─── Custom Error ───────────────────────────────────────────────────

export class AuthError extends Error {
  status: number
  constructor(message: string, status = 401) {
    super(message)
    this.status = status
  }
}

export { TOKEN_NAME }
