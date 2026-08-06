// ============================================
// Advanced Rate Limiting & Brute Force Protection
// Enterprise-grade security
// ============================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockExpiry: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const loginAttempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean; blockExpiry: number }>();

// Clean up expired entries every 5 minutes
if (typeof window !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime && !entry.blocked) {
        rateLimitStore.delete(key);
      } else if (entry.blocked && now > entry.blockExpiry) {
        rateLimitStore.delete(key);
      }
    }
    for (const [key, entry] of loginAttempts.entries()) {
      if (entry.blocked && now > entry.blockExpiry) {
        loginAttempts.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * General rate limiter
 * @param key - Unique identifier (e.g., IP + endpoint)
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): { allowed: boolean; retryAfter?: number; remaining?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
      blocked: false,
      blockExpiry: 0,
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  if (entry.blocked) {
    if (now < entry.blockExpiry) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.blockExpiry - now) / 1000),
      };
    }
    entry.blocked = false;
    entry.count = 0;
    entry.resetTime = now + windowMs;
  }

  entry.count++;

  if (entry.count > maxRequests) {
    entry.blocked = true;
    entry.blockExpiry = now + windowMs * 2; // Block for double the window
    rateLimitStore.set(key, entry);
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockExpiry - now) / 1000),
    };
  }

  rateLimitStore.set(key, entry);
  return { allowed: true, remaining: maxRequests - entry.count };
}

/**
 * Login-specific rate limiter with progressive delays
 * Implements exponential backoff for brute force protection
 */
export function checkLoginRateLimit(
  identifier: string // email or IP
): { allowed: boolean; retryAfter?: number; attemptsRemaining?: number } {
  const now = Date.now();
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const BLOCK_DURATION = 30 * 60 * 1000; // 30 minutes block

  const entry = loginAttempts.get(identifier);

  if (!entry) {
    loginAttempts.set(identifier, {
      count: 1,
      lastAttempt: now,
      blocked: false,
      blockExpiry: 0,
    });
    return { allowed: true, attemptsRemaining: MAX_ATTEMPTS - 1 };
  }

  // Check if blocked
  if (entry.blocked) {
    if (now < entry.blockExpiry) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.blockExpiry - now) / 1000),
      };
    }
    // Unblock
    entry.blocked = false;
    entry.count = 0;
  }

  // Reset window if enough time has passed
  if (now - entry.lastAttempt > WINDOW_MS) {
    entry.count = 0;
  }

  entry.count++;
  entry.lastAttempt = now;

  if (entry.count > MAX_ATTEMPTS) {
    entry.blocked = true;
    entry.blockExpiry = now + BLOCK_DURATION;
    loginAttempts.set(identifier, entry);
    return {
      allowed: false,
      retryAfter: Math.ceil(BLOCK_DURATION / 1000),
    };
  }

  loginAttempts.set(identifier, entry);
  return { allowed: true, attemptsRemaining: MAX_ATTEMPTS - entry.count };
}

/**
 * Reset login attempts (call after successful login)
 */
export function resetLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

/**
 * API-specific rate limiter
 * Different limits for different endpoint types
 */
export const API_RATE_LIMITS = {
  // Authentication endpoints
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 per 15 min

  // Read endpoints
  read: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per min

  // Write endpoints
  write: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 per min

  // Delete endpoints
  delete: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per min

  // File upload
  upload: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 per min

  // Search endpoints
  search: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 per min

  // Admin endpoints
  admin: { maxRequests: 50, windowMs: 60 * 1000 }, // 50 per min
} as const;

/**
 * Check rate limit for API endpoint type
 */
export function checkApiRateLimit(
  ip: string,
  endpointType: keyof typeof API_RATE_LIMITS
): { allowed: boolean; retryAfter?: number } {
  const limits = API_RATE_LIMITS[endpointType];
  const key = `api:${endpointType}:${ip}`;
  return checkRateLimit(key, limits.maxRequests, limits.windowMs);
}

/**
 * Detect suspicious patterns
 */
export function detectSuspiciousActivity(ip: string): {
  suspicious: boolean;
  reason?: string;
} {
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;

  // Check for rapid requests from same IP
  const requestKey = `requests:${ip}`;
  const requestEntry = rateLimitStore.get(requestKey);

  if (requestEntry && requestEntry.count > 200 && now - (requestEntry.resetTime - 60000) < FIVE_MINUTES) {
    return { suspicious: true, reason: "Too many requests in short period" };
  }

  // Check for multiple failed login attempts
  const loginKey = `login:${ip}`;
  const loginEntry = loginAttempts.get(loginKey);

  if (loginEntry && loginEntry.count > 10) {
    return { suspicious: true, reason: "Multiple failed login attempts" };
  }

  return { suspicious: false };
}

/**
 * Get rate limit status for display
 */
export function getRateLimitStatus(key: string): {
  count: number;
  resetIn: number;
  blocked: boolean;
} | null {
  const entry = rateLimitStore.get(key);
  if (!entry) return null;

  return {
    count: entry.count,
    resetIn: Math.max(0, Math.ceil((entry.resetTime - Date.now()) / 1000)),
    blocked: entry.blocked,
  };
}
