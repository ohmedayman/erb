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
    include: { shipments: true },
  });

  const shipments = orders.flatMap((order) =>
    order.shipments.map((s) => ({
      id: s.id,
      shipmentNumber: s.shipmentNumber,
      order: order.orderNumber,
      carrier: s.carrier,
      status: s.status,
      origin: s.origin,
      destination: s.destination,
      eta: s.eta,
    }))
  );

  return NextResponse.json(shipments);
}
