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
  const order = await prisma.order.findFirst({
    where: { id, storeId: user.storeId },
    include: { shipments: true },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.order.findFirst({
    where: { id, storeId: user.storeId },
  });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const order = await prisma.order.update({
    where: { id },
    data: {
      customerName: body.customerName ?? existing.customerName,
      items: body.items !== undefined ? parseInt(body.items) : existing.items,
      total: body.total !== undefined ? parseFloat(body.total) : existing.total,
      status: body.status ?? existing.status,
      payment: body.payment ?? existing.payment,
    },
  });

  return NextResponse.json(order);
}
