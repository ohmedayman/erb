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

    let firestore: any;
    try {
      const mod = await import("@/lib/firebase-admin");
      firestore = mod.getAdminFirestore();
    } catch (e: any) {
      return NextResponse.json(
        { error: "Firebase Admin SDK failed: " + e.message },
        { status: 500 }
      );
    }

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

    const hashedPassword = await hashPassword(password);

    const storeRef = firestore.collection("stores").doc();
    await storeRef.set({
      id: storeRef.id,
      name: storeName,
      ownerName: fullName,
      ownerEmail: email,
      createdAt: new Date().toISOString(),
    });

    const userRef = firestore.collection("users").doc();
    await userRef.set({
      id: userRef.id,
      username,
      email,
      password: hashedPassword,
      fullName,
      role: "admin",
      storeId: storeRef.id,
      createdAt: new Date().toISOString(),
    });

    const token = await createToken({
      userId: userRef.id,
      username,
      email,
      role: "admin",
      storeId: storeRef.id,
    });

    return NextResponse.json({
      token,
      user: {
        id: userRef.id,
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
      { error: error.message || "حدث خطأ داخلي", stack: error.stack },
      { status: 500 }
    );
  }
}
