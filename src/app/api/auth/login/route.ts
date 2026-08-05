import { NextRequest, NextResponse } from "next/server";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { comparePassword, createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "اسم المستخدم وكلمة المرور مطلوبين" },
        { status: 400 }
      );
    }

    const firestore = getAdminFirestore();
    const usersSnapshot = await firestore
      .collection("users")
      .where("username", "==", username)
      .get();

    if (usersSnapshot.empty) {
      return NextResponse.json(
        { error: "بيانات الدخول غير صحيحة" },
        { status: 401 }
      );
    }

    const userDoc = usersSnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.password) {
      const valid = await comparePassword(password, userData.password);
      if (!valid) {
        return NextResponse.json(
          { error: "بيانات الدخول غير صحيحة" },
          { status: 401 }
        );
      }
    }

    const token = await createToken({
      userId: userDoc.id,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      storeId: userData.storeId,
    });

    return NextResponse.json({
      token,
      user: {
        id: userDoc.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        storeId: userData.storeId,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
}
