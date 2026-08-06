import { NextRequest, NextResponse } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { JWT_SECRET, ADMIN_EMAILS } from "@/lib/admin-config";

const COOKIE_NAME = "sf_auth";

export async function POST(request: NextRequest) {
  try {
    const { userId, email, subscriptionStatus } = await request.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const role = ADMIN_EMAILS.includes(email.toLowerCase().trim()) ? "admin" : "user";

    const token = await new SignJWT({
      userId,
      email: email.toLowerCase().trim(),
      role,
      subscriptionStatus: subscriptionStatus || "pending",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    const response = NextResponse.json({ success: true });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error: any) {
    console.error("Session error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ authenticated: false });

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({ authenticated: true, user: payload });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
