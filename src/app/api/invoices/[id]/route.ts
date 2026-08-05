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
  const invoicesCol = await col("invoices");
  const doc = await invoicesCol.doc(id).get();

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
  const invoicesCol = await col("invoices");
  const doc = await invoicesCol.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const existing = doc.data()!;
  const body = await request.json();

  const updateData: Record<string, unknown> = {
    customerName: body.customerName ?? existing.customerName,
    customerPhone: body.customerPhone ?? existing.customerPhone,
    items: body.items ?? existing.items,
    subtotal: body.subtotal !== undefined ? parseFloat(body.subtotal) : existing.subtotal,
    tax: body.tax !== undefined ? parseFloat(body.tax) : existing.tax,
    total: body.total !== undefined ? parseFloat(body.total) : existing.total,
    status: body.status ?? existing.status,
    notes: body.notes ?? existing.notes,
    paymentMethod: body.paymentMethod ?? existing.paymentMethod,
    updatedAt: new Date().toISOString(),
  };

  await invoicesCol.doc(id).update(updateData);
  const updated = await invoicesCol.doc(id).get();
  return NextResponse.json({ id: updated.id, ...updated.data() });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const invoicesCol = await col("invoices");
  const doc = await invoicesCol.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  await invoicesCol.doc(id).delete();
  return NextResponse.json({ success: true });
}
