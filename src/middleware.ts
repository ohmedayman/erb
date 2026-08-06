import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Security headers for CSP
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // ========================================
  // 1. Content Security Policy (CSP)
  // ========================================
  const cspDirectives = [
    `default-src 'self'`,
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jotfor.ms https://www.jotfor.ms`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `img-src 'self' data: blob: https://*.supabase.co https://ipapi.co https://api.ipify.org`,
    `font-src 'self' https://fonts.gstatic.com`,
    `connect-src 'self' https://*.supabase.co https://ipapi.co https://api.ipify.org`,
    `frame-src 'self' https://cdn.jotfor.ms https://www.jotfor.ms`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  // ========================================
  // 2. Security Headers (OWASP Recommended)
  // ========================================
  response.headers.set("Content-Security-Policy", cspDirectives);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=(), display-capture=()");
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("X-Permitted-Cross-Domain-Policies", "none");

  // Remove server identification headers
  response.headers.delete("X-Powered-By");
  response.headers.delete("Server");

  // ========================================
  // 3. Skip auth checks for public routes
  // ========================================
  const { pathname } = request.nextUrl;

  // Static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".ico") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt"
  ) {
    return response;
  }

  // Public routes
  const publicPaths = ["/", "/login", "/signup", "/checkout", "/privacy", "/terms", "/setup", "/offline"];
  if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth")) {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons).*)",
  ],
};
