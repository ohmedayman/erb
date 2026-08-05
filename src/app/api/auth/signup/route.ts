import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";

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

    const adminAuth = getAdminAuth();
    const firestore = getAdminFirestore();

    const existingUser = await firestore
      .collection("users")
      .where("username", "==", username)
      .get();

    if (!existingUser.empty) {
      return NextResponse.json(
        { error: "اسم المستخدم موجود بالفعل" },
        { status: 409 }
      );
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
    });

    const storeRef = firestore.collection("stores").doc();
    await storeRef.set({
      id: storeRef.id,
      name: storeName,
      ownerName: fullName,
      ownerEmail: email,
      createdAt: new Date().toISOString(),
    });

    await firestore.collection("users").doc(userRecord.uid).set({
      id: userRecord.uid,
      username,
      email,
      fullName,
      role: "admin",
      storeId: storeRef.id,
      createdAt: new Date().toISOString(),
    });

    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    return NextResponse.json({
      customToken,
      user: {
        id: userRecord.uid,
        username,
        fullName,
        role: "admin",
        storeId: storeRef.id,
      },
      store: { id: storeRef.id, name: storeName },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || error.toString() || "حدث خطأ داخلي", stack: error.stack },
      { status: 500 }
    );
  }
}
