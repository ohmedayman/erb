import { NextRequest, NextResponse } from "next/server";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName, storeName } =
      await request.json();

    if (!username || !email || !password || !fullName || !storeName) {
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

    const token = await createToken({
      userId: "user-" + Date.now(),
      username,
      email,
      role: "admin",
      storeId: "store-" + Date.now(),
    });

    return NextResponse.json({
      token,
      user: {
        id: "user-" + Date.now(),
        username,
        fullName,
        role: "admin",
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
}
