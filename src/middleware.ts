// ============================================
// Next.js Middleware - Security Layer
// Applied to ALL routes before they reach the app
// ============================================

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "sf_auth";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "stockflow-dev-only-secret-do-not-use-in-prod"
);

// Protected routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/onboarding"];
// Public routes that should never require auth
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/checkout", "/contact", "/terms", "/privacy", "/setup", "/api/auth"];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function isAdminRoute(pathname: string): boolean {
  return pathname.startsWith("/admin");
}

const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") && !pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  // ========== SECURITY HEADERS ==========
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  // ========== ATTACK DETECTION ==========
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";
  const userAgent = request.headers.get("user-agent") || "";

  // Block known scanner user agents
  const blockedAgents = [
    /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /dirb/i,
    /gobuster/i, /wfuzz/i, /burpsuite/i, /acunetix/i,
    /nessus/i, /openvas/i, /havij/i, /masscan/i,
  ];

  for (const pattern of blockedAgents) {
    if (pattern.test(userAgent)) {
      return new NextResponse(JSON.stringify({ error: "Access denied" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // Block path traversal attempts
  if (/\.\.\//.test(pathname) || /\.\.%2f/i.test(pathname)) {
    return new NextResponse(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Block common attack paths
  const attackPaths = [
    "/wp-admin", "/wp-login", "/phpmyadmin", "/.env",
    "/.git", "/config.php", "/wp-config.php", "/cgi-bin",
  ];

  for (const attackPath of attackPaths) {
    if (pathname.toLowerCase().includes(attackPath)) {
      return new NextResponse(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // ========== AUTH CHECK FOR PROTECTED ROUTES ==========
  if (isProtectedRoute(pathname)) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      // Redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (!payload.userId || !payload.email) {
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
      }

      // Admin route check
      if (isAdminRoute(pathname)) {
        const email = (payload.email as string).toLowerCase().trim();
        if (!ADMIN_EMAILS.includes(email)) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      // Add user info to headers for server components
      response.headers.set("X-User-Id", payload.userId as string);
      response.headers.set("X-User-Email", payload.email as string);
      response.headers.set("X-User-Role", (payload.role as string) || "user");
    } catch {
      // Invalid token - redirect to login
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ========== CORS FOR API ROUTES ==========
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = [
      "https://stockflow.vexonet.online",
      "http://localhost:3000",
    ];

    // Handle preflight
    if (request.method === "OPTIONS") {
      const preflightResponse = new NextResponse(null, { status: 204 });
      if (origin && allowedOrigins.includes(origin)) {
        preflightResponse.headers.set("Access-Control-Allow-Origin", origin);
      }
      preflightResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      preflightResponse.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, X-CSRF-Token");
      preflightResponse.headers.set("Access-Control-Allow-Credentials", "true");
      preflightResponse.headers.set("Access-Control-Max-Age", "86400");
      return preflightResponse;
    }

    // Add CORS headers to regular API responses
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
    }
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
