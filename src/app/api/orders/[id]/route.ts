import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { col } from "@/lib/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const ordersCol = await col("orders");
  const doc = await ordersCol.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ id: doc.id, ...doc.data() });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const ordersCol = await col("orders");
  const doc = await ordersCol.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const existing = doc.data()!;
  const body = await request.json();

  const updateData: Record<string, unknown> = {
    customerName: body.customerName ?? existing.customerName,
    items: body.items !== undefined ? parseInt(body.items) : existing.items,
    total: body.total !== undefined ? parseFloat(body.total) : existing.total,
    status: body.status ?? existing.status,
    payment: body.payment ?? existing.payment,
  };

  await ordersCol.doc(id).update(updateData);
  const updated = await ordersCol.doc(id).get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}
