import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function getTokenUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  try {
    const parts = token.split(".");
    const payload = JSON.parse(atob(parts[1]));
    return { userId: payload.userId, storeId: payload.storeId };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, storeId: user.storeId },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.product.findFirst({
    where: { id, storeId: user.storeId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stock = body.stock !== undefined ? parseInt(body.stock) : existing.stock;
  const minStock = body.minStock !== undefined ? parseInt(body.minStock) : existing.minStock;

  let status = existing.status;
  if (stock === 0) status = "Out of Stock";
  else if (stock <= minStock) status = "Low Stock";
  else status = "Active";

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name ?? existing.name,
      sku: body.sku ?? existing.sku,
      category: body.category ?? existing.category,
      price: body.price !== undefined ? parseFloat(body.price) : existing.price,
      stock,
      minStock,
      status,
    },
  });

  return NextResponse.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.product.findFirst({
    where: { id, storeId: user.storeId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
