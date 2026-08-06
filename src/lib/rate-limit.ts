// ============================================
// Rate Limiting backed by Supabase
// Works in serverless/production environments
// ============================================

import { supabase } from "./supabase";

interface RateLimitResult {
  allowed: boolean;
  retryAfter?: number;
  remaining?: number;
  attemptsRemaining?: number;
}

/**
 * Check rate limit using Supabase (persists across server restarts)
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number = 60,
  windowMs: number = 60000
): Promise<RateLimitResult> {
  try {
    const now = Date.now();
    const windowStart = new Date(now - windowMs).toISOString();

    // Count requests in the window
    const { count, error } = await supabase
      .from("rate_limit_log")
      .select("id", { count: "exact", head: true })
      .eq("key", key)
      .gte("created_at", windowStart);

    if (error) {
      // If table doesn't exist, allow the request (fail open)
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const currentCount = count || 0;

    if (currentCount >= maxRequests) {
      return {
        allowed: false,
        retryAfter: Math.ceil(windowMs / 1000),
        remaining: 0,
      };
    }

    // Log this request
    await supabase.from("rate_limit_log").insert({
      key,
      created_at: new Date().toISOString(),
    });

    return {
      allowed: true,
      remaining: maxRequests - currentCount - 1,
    };
  } catch {
    // Fail open - allow request if rate limiting fails
    return { allowed: true, remaining: maxRequests - 1 };
  }
}

/**
 * Login-specific rate limiter with progressive blocking
 */
export async function checkLoginRateLimit(
  identifier: string
): Promise<RateLimitResult> {
  const MAX_ATTEMPTS = 5;
  const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
  const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  try {
    const now = Date.now();
    const windowStart = new Date(now - WINDOW_MS).toISOString();

    // Check if currently blocked
    const { data: blockedEntry } = await supabase
      .from("rate_limit_log")
      .select("blocked_until")
      .eq("key", `login:${identifier}`)
      .eq("is_block", true)
      .gt("blocked_until", new Date().toISOString())
      .limit(1)
      .single();

    if (blockedEntry) {
      const retryAfter = Math.ceil(
        (new Date(blockedEntry.blocked_until).getTime() - now) / 1000
      );
      return { allowed: false, retryAfter };
    }

    // Count failed attempts in window
    const { count, error } = await supabase
      .from("rate_limit_log")
      .select("id", { count: "exact", head: true })
      .eq("key", `login:${identifier}`)
      .gte("created_at", windowStart);

    if (error) {
      return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
    }

    const attempts = count || 0;

    if (attempts >= MAX_ATTEMPTS) {
      // Block the user
      const blockedUntil = new Date(now + BLOCK_DURATION_MS).toISOString();
      await supabase.from("rate_limit_log").insert({
        key: `login:${identifier}`,
        is_block: true,
        blocked_until: blockedUntil,
        created_at: new Date().toISOString(),
      });

      return {
        allowed: false,
        retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000),
      };
    }

    return {
      allowed: true,
      attemptsRemaining: MAX_ATTEMPTS - attempts,
    };
  } catch {
    return { allowed: true, attemptsRemaining: 5 };
  }
}

/**
 * Log a failed login attempt
 */
export async function logLoginAttempt(
  identifier: string,
  success: boolean
): Promise<void> {
  try {
    if (!success) {
      await supabase.from("rate_limit_log").insert({
        key: `login:${identifier}`,
        created_at: new Date().toISOString(),
      });
    } else {
      // Clear failed attempts on success
      await supabase
        .from("rate_limit_log")
        .delete()
        .eq("key", `login:${identifier}`)
        .is("is_block", null);
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Reset rate limit for a key
 */
export async function resetRateLimit(key: string): Promise<void> {
  try {
    await supabase.from("rate_limit_log").delete().eq("key", key);
  } catch {
    // Non-blocking
  }
}

export const API_RATE_LIMITS = {
  auth: { maxRequests: 5, windowMs: 15 * 60 * 1000 },
  read: { maxRequests: 100, windowMs: 60 * 1000 },
  write: { maxRequests: 30, windowMs: 60 * 1000 },
  delete: { maxRequests: 10, windowMs: 60 * 1000 },
  upload: { maxRequests: 10, windowMs: 60 * 1000 },
  search: { maxRequests: 20, windowMs: 60 * 1000 },
  admin: { maxRequests: 50, windowMs: 60 * 1000 },
} as const;

export async function checkApiRateLimit(
  ip: string,
  endpointType: keyof typeof API_RATE_LIMITS
): Promise<RateLimitResult> {
  const limits = API_RATE_LIMITS[endpointType];
  const key = `api:${endpointType}:${ip}`;
  return checkRateLimit(key, limits.maxRequests, limits.windowMs);
}
