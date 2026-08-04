import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [invoicesSnap, expensesSnap, productsSnap, ordersSnap] =
    await Promise.all([
      collections.invoices.where("storeId", "==", user.storeId).get(),
      collections.expenses.where("storeId", "==", user.storeId).get(),
      collections.products.where("storeId", "==", user.storeId).get(),
      collections.orders.where("storeId", "==", user.storeId).get(),
    ]);

  const invoices = invoicesSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );
  const expenses = expensesSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );
  const products = productsSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );
  const orders = ordersSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );

  const totalRevenue = orders
    .filter((o: any) => o.status === "Delivered")
    .reduce((sum: number, o: any) => sum + (o.total ?? 0), 0);

  const totalExpenses = expenses.reduce(
    (sum: number, e: any) => sum + (e.amount ?? 0),
    0
  );

  const netProfit = totalRevenue - totalExpenses;

  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
  for (const order of orders) {
    if (order.status !== "Delivered") continue;
    const items = order.items ?? order.itemsCount ?? 0;
    const total = order.total ?? 0;
    const productName = order.productName || order.customerName || "منتج";
    const key = productName;
    if (!productSales[key]) {
      productSales[key] = { name: productName, quantity: 0, revenue: 0 };
    }
    productSales[key].quantity += typeof items === "number" ? items : parseInt(items) || 1;
    productSales[key].revenue += total;
  }

  const topSellingProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const categoryLabels: Record<string, string> = {
    rent: "إيجار",
    utilities: "مرافق",
    salaries: "رواتب",
    marketing: "تسويق",
    transport: "نقل",
    other: "أخرى",
  };

  const expensesByCategoryRaw: Record<string, number> = {};
  for (const expense of expenses) {
    const cat = expense.category || "other";
    expensesByCategoryRaw[cat] =
      (expensesByCategoryRaw[cat] ?? 0) + (expense.amount ?? 0);
  }

  const expensesByCategory = Object.entries(expensesByCategoryRaw).map(
    ([key, amount]) => ({
      category: categoryLabels[key] || key,
      categoryKey: key,
      amount,
    })
  );

  const monthlyRevenueMap: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyRevenueMap[key] = 0;
  }

  for (const order of orders) {
    if (order.status !== "Delivered") continue;
    const dateStr = order.date || order.createdAt;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyRevenueMap) {
      monthlyRevenueMap[key] += order.total ?? 0;
    }
  }

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

  const monthlyRevenue = Object.entries(monthlyRevenueMap).map(
    ([key, amount]) => {
      const [year, month] = key.split("-");
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year}`,
        amount,
      };
    }
  );

  const outstandingInvoices = invoices
    .filter(
      (inv: any) => inv.status === "unpaid" || inv.status === "partial"
    )
    .map((inv: any) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      total: inv.total ?? 0,
      status: inv.status,
      createdAt: inv.createdAt,
    }));

  const totalInvoices = invoices.length;
  const unpaidInvoices = outstandingInvoices.length;

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    netProfit,
    topSellingProducts,
    expensesByCategory,
    monthlyRevenue,
    outstandingInvoices,
    totalInvoices,
    unpaidInvoices,
  });
}
