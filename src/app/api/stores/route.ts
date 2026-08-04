import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const doc = await collections.stores.doc(user.storeId).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const doc = await collections.stores.doc(user.storeId).get();

  if (!doc.exists) {
    return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
  }

  const body = await request.json();
  const updateData: Record<string, unknown> = {};

  const fields = [
    "name",
    "description",
    "logo",
    "website",
    "category",
    "taxId",
    "currency",
    "timezone",
    "address",
    "city",
    "state",
    "zipCode",
    "country",
    "ownerName",
    "ownerEmail",
    "ownerPhone",
    "emailNotifs",
    "orderAlerts",
    "lowStockAlerts",
    "weeklyReports",
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field];
    }
  }

  updateData.updatedAt = new Date().toISOString();

  await collections.stores.doc(user.storeId).update(updateData);
  const updated = await collections.stores.doc(user.storeId).get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}
