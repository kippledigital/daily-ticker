/**
 * Simple in-memory rate limiting utility
 * For production, consider using Redis or Vercel Edge Config
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  rateLimitStore.forEach((entry, key) => {
    if (entry.resetTime < now) {
      keysToDelete.push(key)
    }
  })
  
  keysToDelete.forEach(key => rateLimitStore.delete(key))
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
}

/**
 * Check if request should be rate limited
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // If no entry exists or window has expired, create new entry
  if (!entry || entry.resetTime < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(identifier, newEntry)
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    }
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  // Increment count
  entry.count++
  rateLimitStore.set(identifier, entry)

  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  // Check various headers for IP (Vercel, Cloudflare, etc.)
  const headers = request.headers as Headers & {
    get: (key: string) => string | null
  }
  
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take first IP if multiple (client, proxy1, proxy2)
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback to 'unknown' if no IP found
  return 'unknown'
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  subscribe: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  unsubscribe: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
  checkout: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
} as const

