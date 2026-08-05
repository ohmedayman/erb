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
  const productsCol = await col("products");
  const doc = await productsCol.doc(id).get();

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
  const productsCol = await col("products");
  const doc = await productsCol.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  const existing = doc.data()!;
  const body = await request.json();

  const stock =
    body.stock !== undefined ? parseInt(body.stock) : existing.stock;
  const minStock =
    body.minStock !== undefined ? parseInt(body.minStock) : existing.minStock;

  let status = existing.status;
  if (stock === 0) status = "Out of Stock";
  else if (stock <= minStock) status = "Low Stock";
  else status = "Active";

  const updateData: Record<string, unknown> = {
    name: body.name ?? existing.name,
    sku: body.sku ?? existing.sku,
    category: body.category ?? existing.category,
    price: body.price !== undefined ? parseFloat(body.price) : existing.price,
    stock,
    minStock,
    status,
  };

  await productsCol.doc(id).update(updateData);
  const updated = await productsCol.doc(id).get();
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
  const productsCol = await col("products");
  const doc = await productsCol.doc(id).get();

  if (!doc.exists || doc.data()?.storeId !== user.storeId) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  await productsCol.doc(id).delete();
  return NextResponse.json({ success: true });
}
