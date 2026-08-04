import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const snapshot = await collections.purchaseOrders
    .where("storeId", "==", user.storeId)
    .get();

  const purchaseOrders = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return NextResponse.json({ purchaseOrders });
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { supplierName, items, total, expectedDate } = body;

  if (!supplierName || items === undefined || total === undefined) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  const poNumber = "PO-" + Date.now().toString(36);

  const docRef = await collections.purchaseOrders.add({
    poNumber,
    supplierName,
    items: parseInt(items),
    total: parseFloat(total),
    expectedDate: expectedDate || null,
    status: "Pending",
    storeId: user.storeId,
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
