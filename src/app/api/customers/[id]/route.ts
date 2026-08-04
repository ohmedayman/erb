import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await params;
  const doc = await collections.customers.doc(id).get();

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
  const doc = await collections.customers.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const existing = doc.data()!;
  const body = await request.json();

  const updateData: Record<string, unknown> = {
    name: body.name ?? existing.name,
    phone: body.phone ?? existing.phone,
    email: body.email ?? existing.email,
    address: body.address ?? existing.address,
    taxId: body.taxId ?? existing.taxId,
    type: body.type ?? existing.type,
    balance: body.balance !== undefined ? parseFloat(body.balance) : existing.balance,
    updatedAt: new Date().toISOString(),
  };

  await collections.customers.doc(id).update(updateData);
  const updated = await collections.customers.doc(id).get();
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
  const doc = await collections.customers.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  await collections.customers.doc(id).delete();
  return NextResponse.json({ success: true });
}
