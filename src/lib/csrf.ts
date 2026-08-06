// ============================================
// CSRF Protection & Token Management
// Double-submit cookie pattern
// ============================================

import { SignJWT, jwtVerify } from "jose";
import { JWT_SECRET } from "./admin-config";

const CSRF_SECRET = new TextEncoder().encode(
  process.env.CSRF_SECRET || "stockflow-csrf-secret-2026-change-in-prod"
);

const CSRF_COOKIE = "sf_csrf";
const CSRF_HEADER = "x-csrf-token";

/**
 * Generate a CSRF token tied to the user's session
 */
export async function generateCSRFToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ userId, sessionId, type: "csrf" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(CSRF_SECRET);
}

/**
 * Verify a CSRF token
 */
export async function verifyCSRFToken(
  token: string,
  userId: string,
  sessionId: string
): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, CSRF_SECRET);
    return payload.userId === userId && payload.sessionId === sessionId && payload.type === "csrf";
  } catch {
    return false;
  }
}

/**
 * Validate CSRF token from request
 * Checks both header and body token against cookie
 */
export async function validateCSRF(
  request: Request,
  userId: string,
  sessionId: string
): Promise<{ valid: boolean; error?: string }> {
  // GET/HEAD/OPTIONS are safe methods - skip CSRF
  const method = request.method.toUpperCase();
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true };
  }

  const headerToken = request.headers.get(CSRF_HEADER);
  const bodyToken = (await request.clone().json().catch(() => ({})))?._csrf;

  const token = headerToken || bodyToken;

  if (!token) {
    return { valid: false, error: "CSRF token missing" };
  }

  const valid = await verifyCSRFToken(token, userId, sessionId);
  if (!valid) {
    return { valid: false, error: "CSRF token invalid" };
  }

  return { valid: true };
}

/**
 * Generate session ID for CSRF binding
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
}
