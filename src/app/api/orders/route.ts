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

  const orders = await prisma.order.findMany({
    where: { storeId: user.storeId },
    orderBy: { date: "desc" },
    include: { shipments: true },
  });

  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const user = getTokenUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { customerName, items, total, status, payment } = body;

  if (!customerName || !items || !total) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const count = await prisma.order.count({ where: { storeId: user.storeId } });
  const orderNumber = `ORD-${String(count + 7891).padStart(4, "0")}`;

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      items: parseInt(items),
      total: parseFloat(total),
      status: status || "Pending",
      payment: payment || "Pending",
      storeId: user.storeId,
    },
  });

  return NextResponse.json(order, { status: 201 });
}
