/**
 * Simple in-memory rate limiter using a fixed-window algorithm.
 *
 * Suitable for single-instance deployments (Vercel serverless functions
 * share memory within a single instance during its lifetime).
 *
 * For high-traffic production with multiple instances, consider
 * upgrading to Upstash Redis or a similar distributed store.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60_000);
}

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check whether a request from the given identifier is within rate limits.
 *
 * @param identifier - Unique key, typically "endpoint:ip" (e.g. "contact:1.2.3.4")
 * @param config - Rate limit configuration
 * @returns Whether the request is allowed and metadata for Retry-After headers
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  // No existing entry or window expired — start fresh
  if (!entry || entry.resetAt <= now) {
    store.set(identifier, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: now + config.windowMs,
    };
  }

  // Window still active — check count
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/** Pre-configured rate limits for different endpoint types */
export const RATE_LIMITS = {
  /** Login: 5 attempts per 15 minutes */
  login: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  /** Contact/Schedule forms: 5 per 10 minutes */
  contactForm: { windowMs: 10 * 60 * 1000, maxRequests: 5 },
  /** File uploads: 10 per 10 minutes */
  upload: { windowMs: 10 * 60 * 1000, maxRequests: 10 },
  /** Public read endpoints: 60 per minute */
  publicRead: { windowMs: 60 * 1000, maxRequests: 60 },
  /** Admin mutation endpoints: 30 per minute */
  adminMutation: { windowMs: 60 * 1000, maxRequests: 30 },
} as const;

/** Extract client IP from Next.js request headers */
export function getClientIp(req: { headers: { get(name: string): string | null } }): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
