// ============================================
// Session Security Manager
// Session fixation protection, rotation, timeout
// ============================================

import { SignJWT, jwtVerify } from "jose";
import { JWT_SECRET } from "./admin-config";
import { auditLog } from "./audit";

const SESSION_COOKIE = "sf_auth";
const CSRF_COOKIE = "sf_csrf";

interface SessionData {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
  createdAt: number;
  lastActivity: number;
  ip: string;
  userAgent: string;
  rotationCount: number;
}

// In-memory session store (for production, use Redis)
const sessionStore = new Map<string, SessionData>();
const MAX_SESSIONS_PER_USER = 5;
const SESSION_TIMEOUT = 30 * 24 * 60 * 60 * 1000; // 30 days
const ABSOLUTE_TIMEOUT = 90 * 24 * 60 * 60 * 1000; // 90 days
const IDLE_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 7 days
const ROTATION_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, session] of sessionStore) {
    if (
      now - session.createdAt > ABSOLUTE_TIMEOUT ||
      now - session.lastActivity > IDLE_TIMEOUT
    ) {
      sessionStore.delete(key);
    }
  }
}, 600000);

/**
 * Create a new session with security features
 */
export async function createSession(
  userId: string,
  email: string,
  role: string,
  ip: string,
  userAgent: string
): Promise<{ token: string; csrfToken: string }> {
  const sessionId = crypto.randomUUID();
  const now = Date.now();

  // Enforce max sessions per user
  const userSessions = Array.from(sessionStore.entries()).filter(
    ([_, s]) => s.userId === userId
  );

  if (userSessions.length >= MAX_SESSIONS_PER_USER) {
    // Remove oldest session
    const oldest = userSessions.sort(
      (a, b) => a[1].lastActivity - b[1].lastActivity
    )[0];
    sessionStore.delete(oldest[0]);
  }

  // Store session data
  const sessionData: SessionData = {
    userId,
    email,
    role,
    sessionId,
    createdAt: now,
    lastActivity: now,
    ip,
    userAgent,
    rotationCount: 0,
  };

  sessionStore.set(sessionId, sessionData);

  // Create JWT with session ID
  const token = await new SignJWT({
    userId,
    email: email.toLowerCase().trim(),
    role,
    sessionId,
    type: "session",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);

  // Create CSRF token
  const csrfToken = await new SignJWT({
    userId,
    sessionId,
    type: "csrf",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(JWT_SECRET);

  return { token, csrfToken };
}

/**
 * Validate and refresh a session
 */
export async function validateSession(
  token: string,
  ip: string,
  userAgent: string
): Promise<{
  valid: boolean;
  user?: { userId: string; email: string; role: string };
  needsRotation?: boolean;
  error?: string;
}> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.type !== "session") {
      return { valid: false, error: "Invalid token type" };
    }

    const sessionId = payload.sessionId as string;
    const session = sessionStore.get(sessionId);

    if (!session) {
      return { valid: false, error: "Session not found" };
    }

    const now = Date.now();

    // Check absolute timeout
    if (now - session.createdAt > ABSOLUTE_TIMEOUT) {
      sessionStore.delete(sessionId);
      await auditLog({
        action: "auth.session_expired",
        userId: session.userId,
        userEmail: session.email,
        details: { reason: "Absolute timeout" },
        ipAddress: ip,
        userAgent,
        success: false,
        severity: "info",
      });
      return { valid: false, error: "Session expired" };
    }

    // Check idle timeout
    if (now - session.lastActivity > IDLE_TIMEOUT) {
      sessionStore.delete(sessionId);
      await auditLog({
        action: "auth.session_expired",
        userId: session.userId,
        userEmail: session.email,
        details: { reason: "Idle timeout" },
        ipAddress: ip,
        userAgent,
        success: false,
        severity: "info",
      });
      return { valid: false, error: "Session expired" };
    }

    // Session fixation protection: check if IP/UA changed significantly
    if (session.ip !== ip) {
      // IP changed - possible session hijacking
      await auditLog({
        action: "security.suspicious_activity",
        userId: session.userId,
        userEmail: session.email,
        details: {
          reason: "Session IP mismatch",
          originalIp: session.ip,
          newIp: ip,
        },
        ipAddress: ip,
        userAgent,
        success: false,
        severity: "warning",
      });

      // Don't block immediately, but flag for rotation
    }

    // Check if rotation is needed
    const needsRotation = now - session.lastActivity > ROTATION_INTERVAL;

    // Update last activity
    session.lastActivity = now;
    session.ip = ip; // Update IP
    sessionStore.set(sessionId, session);

    return {
      valid: true,
      user: {
        userId: session.userId,
        email: session.email,
        role: session.role,
      },
      needsRotation,
    };
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return { valid: false, error: "Token expired" };
    }
    return { valid: false, error: "Invalid token" };
  }
}

/**
 * Rotate session (create new token, invalidate old)
 */
export async function rotateSession(
  oldToken: string,
  ip: string,
  userAgent: string
): Promise<{ token: string; csrfToken: string } | null> {
  try {
    const { payload } = await jwtVerify(oldToken, JWT_SECRET);

    if (payload.type !== "session") return null;

    const sessionId = payload.sessionId as string;
    const session = sessionStore.get(sessionId);

    if (!session) return null;

    // Create new session
    const newSession = await createSession(
      session.userId,
      session.email,
      session.role,
      ip,
      userAgent
    );

    // Invalidate old session
    sessionStore.delete(sessionId);

    // Log rotation
    await auditLog({
      action: "auth.session_expired",
      userId: session.userId,
      userEmail: session.email,
      details: { reason: "Session rotated" },
      ipAddress: ip,
      userAgent,
      success: true,
      severity: "info",
    });

    return newSession;
  } catch {
    return null;
  }
}

/**
 * Destroy a session (logout)
 */
export async function destroySession(
  token: string,
  ip: string,
  userAgent: string
): Promise<void> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const sessionId = payload.sessionId as string;
    const session = sessionStore.get(sessionId);

    if (session) {
      await auditLog({
        action: "auth.logout",
        userId: session.userId,
        userEmail: session.email,
        ipAddress: ip,
        userAgent,
        success: true,
        severity: "info",
      });
    }

    sessionStore.delete(sessionId);
  } catch {}
}

/**
 * Destroy all sessions for a user (force logout everywhere)
 */
export async function destroyAllUserSessions(
  userId: string,
  ip: string,
  userAgent: string
): Promise<void> {
  const userSessions = Array.from(sessionStore.entries()).filter(
    ([_, s]) => s.userId === userId
  );

  for (const [sessionId, session] of userSessions) {
    await auditLog({
      action: "auth.logout",
      userId: session.userId,
      userEmail: session.email,
      details: { reason: "Force logout all sessions" },
      ipAddress: ip,
      userAgent,
      success: true,
      severity: "info",
    });

    sessionStore.delete(sessionId);
  }
}

/**
 * Get active sessions for a user
 */
export function getActiveSessions(userId: string): Array<{
  sessionId: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastActivity: number;
}> {
  return Array.from(sessionStore.values())
    .filter((s) => s.userId === userId)
    .map((s) => ({
      sessionId: s.sessionId,
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      lastActivity: s.lastActivity,
    }));
}

/**
 * Get session statistics
 */
export function getSessionStats(): {
  totalSessions: number;
  activeUsers: number;
  avgSessionAge: number;
} {
  const now = Date.now();
  const sessions = Array.from(sessionStore.values());

  const uniqueUsers = new Set(sessions.map((s) => s.userId));

  const avgAge =
    sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (now - s.createdAt), 0) /
        sessions.length
      : 0;

  return {
    totalSessions: sessions.length,
    activeUsers: uniqueUsers.size,
    avgSessionAge: Math.round(avgAge / 60000), // in minutes
  };
}
