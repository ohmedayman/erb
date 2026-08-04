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

  const inventory = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    warehouse: "Main Warehouse",
    stock: p.stock,
    min: p.minStock,
    status: p.stock === 0 ? "Critical" : p.stock <= p.minStock ? "Low" : "Healthy",
  }));

  return NextResponse.json(inventory);
}
