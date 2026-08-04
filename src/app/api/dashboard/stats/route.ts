import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [productsSnap, ordersSnap, teamSnap, customersSnap, invoicesSnap, expensesSnap] =
    await Promise.all([
      collections.products.where("storeId", "==", user.storeId).get(),
      collections.orders.where("storeId", "==", user.storeId).get(),
      collections.teamMembers.where("storeId", "==", user.storeId).get(),
      collections.customers.where("storeId", "==", user.storeId).get(),
      collections.invoices.where("storeId", "==", user.storeId).get(),
      collections.expenses.where("storeId", "==", user.storeId).get(),
    ]);

  const products = productsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const orders = ordersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const team = teamSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const customers = customersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const invoices = invoicesSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );
  const expenses = expensesSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );

  const totalProducts = products.length;
  const pendingOrders = orders.filter((o: any) => o.status === "Pending").length;
  const inTransit = orders.filter((o: any) => o.status === "Shipped").length;
  const deliveredOrders = orders.filter(
    (o: any) => o.status === "Delivered"
  ).length;
  const totalOrders = orders.length;
  const activeUsers = team.filter((m: any) => m.status === "Active").length;
  const totalCustomers = customers.length;
  const totalInvoices = invoices.length;

  const totalExpenses = expenses.reduce(
    (sum: number, e: any) => sum + (e.amount ?? 0),
    0
  );

  const totalRevenue = orders
    .filter((o: any) => o.status === "Delivered")
    .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);

  const netProfit = totalRevenue - totalExpenses;

  const recentOrders = orders
    .sort(
      (a: any, b: any) =>
        new Date(b.date ?? b.createdAt).getTime() -
        new Date(a.date ?? a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((o: any) => ({
      id: o.orderNumber,
      customer: o.customerName,
      status: o.status,
      total: `$${(o.total ?? 0).toLocaleString()}`,
      date: o.date ?? o.createdAt,
    }));

  const topProducts = products
    .sort((a: any, b: any) => (b.stock ?? 0) - (a.stock ?? 0))
    .slice(0, 4)
    .map((p: any) => ({
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      sold: 0,
    }));

  const recentInvoices = invoices
    .sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5)
    .map((inv: any) => ({
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      status: inv.status,
      total: inv.total ?? 0,
    }));

  const monthNames = [
    "يناير",
    "فبراير",
    "مارس",
    "أبريل",
    "مايو",
    "يونيو",
    "يوليو",
    "أغسطس",
    "سبتمبر",
    "أكتوبر",
    "نوفمبر",
    "ديسمبر",
  ];

  const monthlyExpensesMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyExpensesMap[key] = 0;
  }

  for (const expense of expenses) {
    const dateStr = expense.date || expense.createdAt;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyExpensesMap) {
      monthlyExpensesMap[key] += expense.amount ?? 0;
    }
  }

  const monthlyExpenses = Object.entries(monthlyExpensesMap).map(
    ([key, amount]) => {
      const [year, month] = key.split("-");
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year}`,
        amount,
      };
    }
  );

  return NextResponse.json({
    stats: { totalProducts, pendingOrders, inTransit, activeUsers },
    recentOrders,
    topProducts,
    recentInvoices,
    monthlyExpenses,
    revenue: totalRevenue,
    totalOrders,
    deliveredOrders,
    totalCustomers,
    totalInvoices,
    totalExpenses,
    netProfit,
  });
}
