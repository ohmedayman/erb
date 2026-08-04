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

  const [totalProducts, pendingOrders, shippedOrders, deliveredOrders, totalOrders, activeUsers, totalStock, lowStockProducts] =
    await Promise.all([
      prisma.product.count({ where: { storeId: user.storeId } }),
      prisma.order.count({ where: { storeId: user.storeId, status: "Pending" } }),
      prisma.order.count({ where: { storeId: user.storeId, status: "Shipped" } }),
      prisma.order.count({ where: { storeId: user.storeId, status: "Delivered" } }),
      prisma.order.count({ where: { storeId: user.storeId } }),
      prisma.teamMember.count({ where: { storeId: user.storeId, status: "Active" } }),
      prisma.product.aggregate({ where: { storeId: user.storeId }, _sum: { stock: true } }),
      prisma.product.count({
        where: {
          storeId: user.storeId,
          AND: [{ stock: { gt: 0 } }, { stock: { lte: 10 } }],
        },
      }),
    ]);

  const recentOrders = await prisma.order.findMany({
    where: { storeId: user.storeId },
    orderBy: { date: "desc" },
    take: 5,
  });

  const topProducts = await prisma.product.findMany({
    where: { storeId: user.storeId },
    orderBy: { stock: "desc" },
    take: 4,
  });

  const totalRevenue = await prisma.order.aggregate({
    where: { storeId: user.storeId, status: "Delivered" },
    _sum: { total: true },
  });

  return NextResponse.json({
    stats: {
      totalProducts,
      pendingOrders,
      inTransit: shippedOrders,
      activeUsers,
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.orderNumber,
      customer: o.customerName,
      status: o.status,
      total: `$${o.total.toLocaleString()}`,
      date: o.date.toISOString(),
    })),
    topProducts: topProducts.map((p) => ({
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      sold: 0,
    })),
    revenue: totalRevenue._sum.total || 0,
    totalOrders,
    deliveredOrders,
  });
}
