// ============================================
// Secure API Handler Wrapper
// Combines all security measures into one
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest, AuthUser, handleCORS, addSecurityHeaders } from "./auth-middleware";
import { checkRateLimit, isIPBlocked, getRateLimitHeaders } from "./rate-limiter";
import { getClientIP, getUserAgent, auditSecurity } from "./audit";

type HandlerFn = (
  request: NextRequest,
  context: { user?: AuthUser; params?: any }
) => Promise<NextResponse>;

interface SecureHandlerOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  rateLimit?: { maxRequests: number; windowMs: number };
  maxBodySize?: number; // bytes
}

/**
 * Wrap an API handler with all security measures
 */
export function createSecureHandler(
  handler: HandlerFn,
  options: SecureHandlerOptions = {}
) {
  const {
    requireAuth = false,
    requireAdmin = false,
    rateLimit = { maxRequests: 100, windowMs: 60000 },
    maxBodySize = 10 * 1024 * 1024, // 10MB
  } = options;

  return async function securedHandler(
    request: NextRequest,
    context?: { params?: any }
  ): Promise<NextResponse> {
    const ip = getClientIP(request);
    const userAgent = getUserAgent(request);

    // 1. CORS preflight
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    // 2. IP blocklist check
    if (isIPBlocked(ip)) {
      await auditSecurity("security.suspicious_activity", {
        details: { reason: "Blocked IP access attempt", ip, path: request.url },
        request,
      });
      return addSecurityHeaders(
        NextResponse.json({ error: "Access denied" }, { status: 403 })
      );
    }

    // 3. Rate limiting
    const rateLimitKey = `${ip}:${request.nextUrl.pathname}`;
    const { allowed, remaining, resetAt } = checkRateLimit(
      rateLimitKey,
      rateLimit.maxRequests,
      rateLimit.windowMs
    );

    if (!allowed) {
      await auditSecurity("security.rate_limit", {
        details: { ip, path: request.url, remaining },
        request,
      });
      const response = NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
      const headers = getRateLimitHeaders(remaining, resetAt);
      for (const [key, value] of Object.entries(headers)) {
        response.headers.set(key, value);
      }
      return addSecurityHeaders(response);
    }

    // 4. Request size check for write methods
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const contentLength = parseInt(request.headers.get("content-length") || "0");
      if (contentLength > maxBodySize) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Request too large" }, { status: 413 })
        );
      }

      // Content-Type check
      const contentType = request.headers.get("content-type") || "";
      if (!contentType.includes("application/json") && !contentType.includes("multipart/form-data")) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Invalid Content-Type" }, { status: 415 })
        );
      }
    }

    // 5. Suspicious header detection
    const suspiciousHeaders = ["x-forwarded-host", "x-host", "x-original-url", "x-rewrite-url"];
    for (const header of suspiciousHeaders) {
      if (request.headers.get(header)) {
        await auditSecurity("security.suspicious_activity", {
          details: { header, value: request.headers.get(header), ip, path: request.url },
          request,
        });
      }
    }

    // 6. Authentication
    let user: AuthUser | undefined;

    if (requireAuth || requireAdmin) {
      const authResult = await authenticateRequest(request);

      if (!authResult.authenticated || !authResult.user) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: authResult.error || "غير مصرح" },
            { status: 401 }
          )
        );
      }

      user = authResult.user;

      if (requireAdmin && user.role !== "admin") {
        await auditSecurity("security.suspicious_activity", {
          details: { reason: "Non-admin accessing admin route", email: user.email, path: request.url },
          request,
        });
        return addSecurityHeaders(
          NextResponse.json({ error: "غير مصرح" }, { status: 403 })
        );
      }
    }

    // 7. Call the handler
    try {
      const response = await handler(request, { user, params: context?.params });
      return addSecurityHeaders(response);
    } catch (error: any) {
      console.error("API error:", error);
      return addSecurityHeaders(
        NextResponse.json({ error: "Internal server error" }, { status: 500 })
      );
    }
  };
}
