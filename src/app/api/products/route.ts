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

export async function GET(req: NextRequest) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    where: { storeId: user.storeId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, sku, category, price, stock, minStock } = body;

  if (!name || !sku || !category || price === undefined || stock === undefined) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const existing = await prisma.product.findUnique({ where: { sku } });
  if (existing) {
    return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
  }

  let status = "Active";
  if (stock === 0) status = "Out of Stock";
  else if (stock <= (minStock || 10)) status = "Low Stock";

  const product = await prisma.product.create({
    data: {
      name,
      sku,
      category,
      price: parseFloat(price),
      stock: parseInt(stock),
      minStock: minStock ? parseInt(minStock) : 10,
      status,
      storeId: user.storeId,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
