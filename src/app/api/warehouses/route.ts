import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.warehouses
    .where("storeId", "==", user.storeId)
    .get();

  const warehouses = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return NextResponse.json(warehouses);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { name, code, address, city, capacity, manager, phone } = body;

  if (!name) {
    return NextResponse.json(
      { error: "اسم المستودع مطلوب" },
      { status: 400 }
    );
  }

  const finalCode = code || `WH-${Date.now()}`;

  const docRef = await collections.warehouses.add({
    name,
    code: finalCode,
    address: address || "",
    city: city || "",
    capacity: parseInt(capacity) || 0,
    usedCapacity: 0,
    manager: manager || "",
    phone: phone || "",
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
