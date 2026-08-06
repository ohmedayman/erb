// ============================================
// Next.js Middleware - Ultimate Security Layer
// WAF + IDS + Auth + Headers + CORS
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { inspectRequest, inspectBody, processWAFResult } from "@/lib/waf";
import { runIDS } from "@/lib/ids";

const COOKIE_NAME = "sf_auth";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "stockflow-dev-only-secret-do-not-use-in-prod"
);

const PROTECTED_ROUTES = ["/dashboard", "/admin", "/onboarding"];
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/checkout", "/contact", "/terms", "/privacy", "/setup", "/api/auth"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    (pathname.includes(".") && !pathname.startsWith("/api"))
  ) {
    return NextResponse.next();
  }

  // ========== LAYER 1: WAF INSPECTION ==========
  const wafResult = inspectRequest(request);
  if (wafResult.blocked) {
    const wafResponse = await processWAFResult(request, wafResult);
    if (wafResponse) return wafResponse;
  }

  // ========== LAYER 2: BODY INSPECTION (POST/PUT/PATCH) ==========
  if (["POST", "PUT", "PATCH"].includes(request.method)) {
    const bodyResult = await inspectBody(request);
    if (bodyResult.blocked) {
      const bodyResponse = await processWAFResult(request, bodyResult);
      if (bodyResponse) return bodyResponse;
    }
  }

  // ========== LAYER 3: IDS (INTRUSION DETECTION) ==========
  const idsResult = await runIDS(request);
  if (idsResult.blocked && idsResult.response) {
    return idsResult.response;
  }

  // ========== LAYER 4: SECURITY HEADERS ==========
  const response = NextResponse.next();

  // Core security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), display-capture=()");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // Anti-cache for sensitive routes
  if (pathname.startsWith("/api/") || pathname.includes("/login") || pathname.includes("/signup")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    response.headers.set("Pragma", "no-cache");
  }

  // WAF indicator
  response.headers.set("X-WAF-Protected", "true");
  response.headers.set("X-IDS-Active", "true");

  // ========== LAYER 5: AUTH CHECK ==========
  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (!payload.userId || !payload.email) {
        return NextResponse.redirect(new URL("/login", request.url));
      }

      if (isAdminRoute(pathname)) {
        const email = (payload.email as string).toLowerCase().trim();
        if (!ADMIN_EMAILS.includes(email)) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      response.headers.set("X-User-Id", payload.userId as string);
      response.headers.set("X-User-Email", payload.email as string);
      response.headers.set("X-User-Role", (payload.role as string) || "user");
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // ========== LAYER 6: CORS ==========
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "https://stockflow.vexonet.online",
      "http://localhost:3000",
    ];

    if (request.method === "OPTIONS") {
      const preflightResponse = new NextResponse(null, { status: 204 });
      if (origin && allowedOrigins.includes(origin)) {
        preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
      }
      preflightResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      preflightResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Request-Timestamp, X-Request-Nonce, X-Request-Signature");
      preflightResponse.headers.set("Access-Control-Allow-Credentials", "true");
      preflightResponse.headers.set("Access-Control-Max-Age", "86400");
      return preflightResponse;
    }

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
