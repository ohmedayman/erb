import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/contact", "/privacy", "/terms"];
const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow static files and assets
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie
  const supabaseAuth = request.cookies.get("sb-access-token")?.value;
  const isLoggedIn = request.cookies.get("isLoggedIn")?.value;

  // If not authenticated, redirect to login
  if (!supabaseAuth && !isLoggedIn) {
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/checkout") || pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    // Check for admin session cookie
    const adminSession = request.cookies.get("admin-session")?.value;
    if (!adminSession) {
      // Try to verify from Supabase session
      const userEmail = request.cookies.get("user-email")?.value;
      if (!userEmail || !ADMIN_EMAILS.includes(userEmail) && !userEmail.includes("admin")) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)",
  ],
};
