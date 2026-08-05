import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimit = checkRateLimit(`login:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز حد المحاولات. حاول تاني بعد ${rateLimit.retryAfter} ثانية` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "البريد الإلكتروني وكلمة المرور مطلوبين" },
        { status: 400 }
      );
    }

    // Login is handled by Supabase Auth on the client side
    // This endpoint is kept for backward compatibility
    return NextResponse.json(
      { error: "تسجيل الدخول يتم من الصفحة الرئيسية" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
}
