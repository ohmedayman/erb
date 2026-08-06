import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Admin emails - must match src/lib/admin-config.ts
const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // ========================================
  // 1. Security Headers
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
  // 2. Skip checks for static files and public routes
  // ========================================
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

  // Public routes - no auth needed
  const publicPaths = ["/", "/login", "/signup", "/checkout", "/privacy", "/terms", "/setup", "/offline"];
  if (publicPaths.includes(pathname) || pathname.startsWith("/api/auth")) {
    return response;
  }

  // ========================================
  // 3. Auth check for protected routes
  // ========================================
  // Check for Supabase auth cookie (sb-<project-ref>-auth-token)
  const authCookie = request.cookies.get("sb-gecangkwnbaznrrkmdyd-auth-token");

  // Also check localStorage-based auth (sent via cookie or header)
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;
  const userCookie = request.cookies.get("user")?.value;

  // Protected routes that require authentication
  const protectedPaths = ["/dashboard", "/onboarding", "/admin"];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected) {
    // Allow if has Supabase auth cookie OR localStorage-based auth
    const hasAuth = authCookie || isLoggedIn || userCookie;

    if (!hasAuth) {
      // Redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin routes - check if user is admin
    if (pathname.startsWith("/admin")) {
      if (userCookie) {
        try {
          const user = JSON.parse(decodeURIComponent(userCookie));
          const email = (user.email || "").toLowerCase();
          if (!ADMIN_EMAILS.includes(email) && user.role !== "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
          }
        } catch {
          // If can't parse, redirect to login
          return NextResponse.redirect(new URL("/login", request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|icons).*)",
  ],
};
