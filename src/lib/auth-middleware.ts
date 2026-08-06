// ============================================
// Server-Side Auth Middleware
// Verifies JWT tokens for protected API routes
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET, ADMIN_EMAILS } from "./admin-config";
import { getClientIP, getUserAgent, auditSecurity } from "./audit";

const COOKIE_NAME = "sf_auth";

export interface AuthUser {
  userId: string;
  email: string;
  role: "admin" | "user";
  subscriptionStatus?: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthUser;
  error?: string;
}

/**
 * Extract and verify JWT from request cookies
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthResult> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return { authenticated: false, error: "No authentication token" };
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.userId || !payload.email) {
      return { authenticated: false, error: "Invalid token payload" };
    }

    return {
      authenticated: true,
      user: {
        userId: payload.userId as string,
        email: payload.email as string,
        role: (payload.role as "admin" | "user") || "user",
        subscriptionStatus: payload.subscriptionStatus as string | undefined,
      },
    };
  } catch (error: any) {
    if (error.code === "ERR_JWT_EXPIRED") {
      return { authenticated: false, error: "Token expired" };
    }
    return { authenticated: false, error: "Invalid token" };
  }
}

/**
 * Require authenticated user - returns 401 if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<
  { user: AuthUser; response?: never } | { user?: never; response: NextResponse }
> {
  const result = await authenticateRequest(request);

  if (!result.authenticated || !result.user) {
    return {
      response: NextResponse.json(
        { error: result.error || "غير مصرح" },
        { status: 401 }
      ),
    };
  }

  return { user: result.user };
}

/**
 * Require admin role - returns 403 if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<
  { user: AuthUser; response?: never } | { user?: never; response: NextResponse }
> {
  const authResult = await requireAuth(request);

  if (authResult.response) {
    return authResult;
  }

  if (authResult.user!.role !== "admin") {
    await auditSecurity("security.suspicious_activity", {
      details: {
        reason: "Non-admin accessing admin route",
        email: authResult.user!.email,
        path: request.url,
      },
      request,
    });

    return {
      response: NextResponse.json(
        { error: "غير مصرح - لل administrators فقط" },
        { status: 403 }
      ),
    };
  }

  return { user: authResult.user! };
}

/**
 * CORS preflight handler
 */
export function handleCORS(request: NextRequest): NextResponse | null {
  if (request.method === "OPTIONS") {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "https://stockflow.vexonet.online",
      "http://localhost:3000",
    ];

    const response = new NextResponse(null, { status: 204 });

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }

    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400");

    return response;
  }

  return null;
}

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  return response;
}
