// Simple in-memory rate limiter.
// For production, use Redis or a similar distributed store.

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}, 10 * 60 * 1000)

/**
 * Check if a request is allowed under the rate limit.
 * @param key - Unique identifier (e.g., IP address)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if allowed, false if rate limited
 */
export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= maxRequests) {
    return false
  }

  entry.count++
  return true
}

/**
 * Get remaining requests for a key.
 */
export function getRateLimitInfo(key: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    return { remaining: maxRequests, resetAt: now + windowMs }
  }

  return {
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
  }
}

/**
 * Sanitize user input by stripping HTML tags and trimming.
 */
export function sanitizeInput(str: string): string {
  return str
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&[^\s;]+;/g, '') // strip HTML entities
    .trim()
}

/**
 * Get client IP from request headers.
 */
export function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
}