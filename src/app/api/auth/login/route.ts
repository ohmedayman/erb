import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

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

    const adminAuth = getAdminAuth();
    const customToken = await adminAuth.createCustomToken(userDoc.id);

    return NextResponse.json({
      customToken,
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
      { error: "حدث خطأ داخلي" },
      { status: 500 }
    );
  }
}
