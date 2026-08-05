import { NextRequest, NextResponse } from "next/server";
import { ADMIN_USER, comparePassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم وكلمة المرور مطلوبين" },
        { status: 400 }
      );
    }

    if (username === ADMIN_USER.username) {
      const valid = await comparePassword(password, ADMIN_USER.password);
      if (!valid) {
        return NextResponse.json(
          { error: "كلمة المرور غير صحيحة" },
          { status: 401 }
        );
      }

      const token = await createToken({
        userId: ADMIN_USER.id,
        username: ADMIN_USER.username,
        email: ADMIN_USER.email,
        role: ADMIN_USER.role,
        storeId: ADMIN_USER.storeId,
      });

      return NextResponse.json({
        token,
        user: {
          id: ADMIN_USER.id,
          username: ADMIN_USER.username,
          email: ADMIN_USER.email,
          fullName: ADMIN_USER.fullName,
          role: ADMIN_USER.role,
          storeId: ADMIN_USER.storeId,
        },
      });
    }

    return NextResponse.json(
      { error: "بيانات الدخول غير صحيحة" },
      { status: 401 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
}
