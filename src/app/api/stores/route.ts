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
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await prisma.store.findUnique({ where: { id: user.storeId } });
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  return NextResponse.json(store);
}

export async function PUT(req: NextRequest) {
  const user = getTokenUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const store = await prisma.store.update({
    where: { id: user.storeId },
    data: {
      name: body.storeName ?? undefined,
      description: body.description ?? undefined,
      logo: body.logo ?? undefined,
      website: body.website ?? undefined,
      category: body.category ?? undefined,
      taxId: body.taxId ?? undefined,
      currency: body.currency ?? undefined,
      timezone: body.timezone ?? undefined,
      address: body.address ?? undefined,
      city: body.city ?? undefined,
      state: body.state ?? undefined,
      zipCode: body.zipCode ?? undefined,
      country: body.country ?? undefined,
      ownerName: body.ownerName ?? undefined,
      ownerEmail: body.ownerEmail ?? undefined,
      ownerPhone: body.ownerPhone ?? undefined,
      emailNotifs: body.emailNotifs ?? undefined,
      orderAlerts: body.orderAlerts ?? undefined,
      lowStockAlerts: body.lowStockAlerts ?? undefined,
      weeklyReports: body.weeklyReports ?? undefined,
    },
  });

  return NextResponse.json(store);
}
