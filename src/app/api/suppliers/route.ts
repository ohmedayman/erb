import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.suppliers
    .where("storeId", "==", user.storeId)
    .get();

  const suppliers = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return NextResponse.json(suppliers);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, code, contactName, email, phone, address, category, rating } =
    body;

  if (!name) {
    return NextResponse.json(
      { error: "اسم المورد مطلوب" },
      { status: 400 }
    );
  }

  const finalCode = code || `SUP-${Date.now()}`;

  const docRef = await collections.suppliers.add({
    name,
    code: finalCode,
    contactName: contactName || "",
    email: email || "",
    phone: phone || "",
    address: address || "",
    category: category || "",
    rating: parseInt(rating) || 0,
    status: "Active",
    storeId: user.storeId,
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
