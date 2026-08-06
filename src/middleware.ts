import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "stockflow-secret-key-change-in-production-2026"
);

const COOKIE_NAME = "sf_auth";

const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

const PROTECTED_ROUTES = ["/dashboard", "/admin", "/onboarding"];
const SUBSCRIPTION_ROUTES = ["/dashboard"];
const ADMIN_ROUTES = ["/admin"];
const PUBLIC_PREFIXES = ["/login", "/signup", "/checkout", "/privacy", "/terms", "/setup", "/api", "/_next", "/icons"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Skip static files and public routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/icons") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/" ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return response;
  }

  // Check if route needs protection
  const needsAuth = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!needsAuth) return response;

  // Get auth from cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let authData: any;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    authData = payload;
  } catch {
    // Invalid token — clear cookie and redirect to login
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
    return res;
  }

  // Admin routes — must be admin email
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  if (isAdminRoute) {
    const isAdmin = ADMIN_EMAILS.includes(authData.email?.toLowerCase?.()?.trim());
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Subscription routes — must have approved subscription
  const needsSubscription = SUBSCRIPTION_ROUTES.some((route) => pathname.startsWith(route));
  if (needsSubscription) {
    const status = authData.subscriptionStatus;
    if (status !== "active" && status !== "approved") {
      if (status === "pending") {
        // Redirect back to login to show pending message
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return NextResponse.redirect(new URL("/checkout", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};
