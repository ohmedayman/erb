import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const ordersCol = await col("orders");
  const snapshot = await ordersCol
    .where("storeId", "==", user.storeId)
    .get();

  const orders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as any));
  orders.sort(
    (a: any, b: any) =>
      new Date(b.date ?? b.createdAt).getTime() -
      new Date(a.date ?? a.createdAt).getTime()
  );

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const body = await request.json();
  const { customerName, items, total, status, payment } = body;

  if (!customerName || !items || !total) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  const timestamp = Date.now().toString(36).toUpperCase();
  const orderNumber = `ORD-${timestamp}`;

  const ordersCol = await col("orders");
  const docRef = await ordersCol.add({
    orderNumber,
    customerName,
    items: parseInt(items),
    total: parseFloat(total),
    status: status || "Pending",
    payment: payment || "Pending",
    storeId: user.storeId,
    date: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  });

  const created = await docRef.get();
  return NextResponse.json(
    { id: created.id, ...created.data() },
    { status: 201 }
  );
}
