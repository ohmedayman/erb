import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "stockflow-secret-key-change-in-production-2026"
);

const COOKIE_NAME = "sf_auth";

const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

// Routes that require authentication
const PROTECTED_ROUTES = ["/dashboard", "/admin", "/checkout", "/onboarding"];

// Routes that require approved subscription
const SUBSCRIPTION_ROUTES = ["/dashboard"];

// Routes that require admin access
const ADMIN_ROUTES = ["/admin"];

// Public routes that don't need auth
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/checkout", "/privacy", "/terms", "/setup", "/api/auth"];

async function getAuthFromCookie(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as {
      userId: string;
      email: string;
      role: string;
      subscriptionStatus: string;
    };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Add security headers to all responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Skip auth for public routes
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  if (isPublicRoute) return response;

  // Skip static files
  if (pathname.startsWith("/_next") || pathname.startsWith("/icons") || pathname === "/favicon.ico" || pathname === "/manifest.json" || pathname === "/sw.js" || pathname === "/sitemap.xml" || pathname === "/robots.txt") {
    return response;
  }

  // Check if route needs protection
  const needsAuth = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  if (!needsAuth) return response;

  // Get auth from cookie
  const auth = getAuthFromCookie(request);

  // We need to use a synchronous approach since middleware can't be async for cookies
  // Actually middleware CAN be async in Next.js 13+
  return (async () => {
    const authData = await auth;

    if (!authData) {
      // Not logged in — redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check admin routes
    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
    if (isAdminRoute) {
      const isAdmin = ADMIN_EMAILS.includes(authData.email.toLowerCase().trim());
      if (!isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Check subscription routes
    const needsSubscription = SUBSCRIPTION_ROUTES.some((route) => pathname.startsWith(route));
    if (needsSubscription) {
      const hasActiveSubscription = ["active", "approved"].includes(authData.subscriptionStatus);
      if (!hasActiveSubscription) {
        // Check if they have a pending order
        if (authData.subscriptionStatus === "pending") {
          return NextResponse.redirect(new URL("/login", request.url));
        }
        // No order — go to checkout
        return NextResponse.redirect(new URL("/checkout", request.url));
      }
    }

    return response;
  })();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons).*)",
  ],
};
