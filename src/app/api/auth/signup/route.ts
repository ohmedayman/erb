import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    const rateLimit = checkRateLimit(`signup:${ip}`);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `تم تجاوز حد المحاولات. حاول تاني بعد ${rateLimit.retryAfter} ثانية` },
        { status: 429 }
      );
    }

    const { email, password, fullName } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    // Signup is handled by Supabase Auth on the client side
    // This endpoint is kept for backward compatibility
    return NextResponse.json(
      { error: "التسجيل يتم من الصفحة الرئيسية" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
}
