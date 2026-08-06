// ============================================
// Rate Limiting & Brute Force Protection
// In-memory sliding window rate limiter
// ============================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blocked: boolean;
  blockedUntil?: number;
}

interface BruteForceEntry {
  attempts: number;
  lastAttempt: number;
  locked: boolean;
  lockedUntil?: number;
}

// In-memory stores (reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();
const bruteForceStore = new Map<string, BruteForceEntry>();
const ipBlocklist = new Set<string>();
const suspiciousIPs = new Map<string, { count: number; lastSeen: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key);
  }
  for (const [key, entry] of bruteForceStore) {
    if (entry.lockedUntil && entry.lockedUntil < now) {
      bruteForceStore.delete(key);
    }
  }
  for (const [ip, entry] of suspiciousIPs) {
    if (now - entry.lastSeen > 3600000) suspiciousIPs.delete(ip);
  }
}, 300000);

/**
 * Sliding window rate limiter
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs, blocked: false });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.blocked && entry.blockedUntil && entry.blockedUntil > now) {
    return { allowed: false, remaining: 0, resetAt: entry.blockedUntil };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    entry.blocked = true;
    entry.blockedUntil = now + windowMs * 5; // Block for 5x the window
    trackSuspiciousActivity(key.split(":")[0]);
    return { allowed: false, remaining: 0, resetAt: entry.blockedUntil };
  }

  return { allowed: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Brute force protection for login attempts
 */
export function checkBruteForce(
  identifier: string,
  maxAttempts: number = 5,
  lockoutMs: number = 900000 // 15 minutes
): { allowed: boolean; attempts: number; lockedUntil?: number } {
  const now = Date.now();
  const entry = bruteForceStore.get(identifier);

  if (!entry) {
    bruteForceStore.set(identifier, { attempts: 1, lastAttempt: now, locked: false });
    return { allowed: true, attempts: 1 };
  }

  if (entry.locked && entry.lockedUntil && entry.lockedUntil > now) {
    return { allowed: false, attempts: entry.attempts, lockedUntil: entry.lockedUntil };
  }

  // Reset if lockout expired
  if (entry.locked && entry.lockedUntil && entry.lockedUntil <= now) {
    entry.attempts = 0;
    entry.locked = false;
  }

  entry.attempts++;
  entry.lastAttempt = now;

  if (entry.attempts >= maxAttempts) {
    entry.locked = true;
    entry.lockedUntil = now + lockoutMs;
    trackSuspiciousActivity(identifier);
    return { allowed: false, attempts: entry.attempts, lockedUntil: entry.lockedUntil };
  }

  return { allowed: true, attempts: entry.attempts };
}

/**
 * Reset brute force counter (on successful login)
 */
export function resetBruteForce(identifier: string): void {
  bruteForceStore.delete(identifier);
}

/**
 * Track suspicious activity per IP
 */
function trackSuspiciousActivity(ip: string): void {
  const now = Date.now();
  const entry = suspiciousIPs.get(ip);

  if (!entry) {
    suspiciousIPs.set(ip, { count: 1, lastSeen: now });
    return;
  }

  entry.count++;
  entry.lastSeen = now;

  // Auto-block IP after 5 suspicious events
  if (entry.count >= 5) {
    ipBlocklist.add(ip);
  }
}

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): boolean {
  return ipBlocklist.has(ip);
}

/**
 * Get security stats for monitoring
 */
export function getSecurityStats(): {
  blockedIPs: number;
  suspiciousIPs: number;
  activeRateLimits: number;
  activeBruteForce: number;
} {
  return {
    blockedIPs: ipBlocklist.size,
    suspiciousIPs: suspiciousIPs.size,
    activeRateLimits: rateLimitStore.size,
    activeBruteForce: bruteForceStore.size,
  };
}

/**
 * Manually block/unblock IP
 */
export function blockIP(ip: string): void {
  ipBlocklist.add(ip);
}

export function unblockIP(ip: string): void {
  ipBlocklist.delete(ip);
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetAt: number
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
    "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
  };
}
