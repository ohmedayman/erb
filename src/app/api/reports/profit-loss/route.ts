import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/lib/auth";
import { collections } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const user = await verifyFirebaseToken(request);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const [invoicesSnap, expensesSnap] = await Promise.all([
    collections.invoices.where("storeId", "==", user.storeId).get(),
    collections.expenses.where("storeId", "==", user.storeId).get(),
  ]);

  const invoices = invoicesSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );
  const expenses = expensesSnap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as any)
  );

  const totalRevenue = invoices.reduce(
    (sum: number, inv: any) => sum + (inv.total ?? 0),
    0
  );

  const totalExpenses = expenses.reduce(
    (sum: number, e: any) => sum + (e.amount ?? 0),
    0
  );

  const grossProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const now = new Date();
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

  const monthlyDataMap: Record<
    string,
    { revenue: number; expenses: number; profit: number }
  > = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyDataMap[key] = { revenue: 0, expenses: 0, profit: 0 };
  }

  for (const inv of invoices) {
    const dateStr = inv.date || inv.createdAt;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyDataMap) {
      monthlyDataMap[key].revenue += inv.total ?? 0;
    }
  }

  for (const exp of expenses) {
    const dateStr = exp.date || exp.createdAt;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in monthlyDataMap) {
      monthlyDataMap[key].expenses += exp.amount ?? 0;
    }
  }

  const monthlyBreakdown = Object.entries(monthlyDataMap).map(
    ([key, data]) => {
      const [year, month] = key.split("-");
      return {
        month: `${monthNames[parseInt(month) - 1]} ${year}`,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      };
    }
  );

  const categoryLabels: Record<string, string> = {
    rent: "إيجار",
    utilities: "مرافق",
    salaries: "رواتب",
    marketing: "تسويق",
    transport: "نقل",
    other: "أخرى",
  };

  const expensesByCategoryRaw: Record<string, number> = {};
  for (const exp of expenses) {
    const cat = exp.category || "other";
    expensesByCategoryRaw[cat] =
      (expensesByCategoryRaw[cat] ?? 0) + (exp.amount ?? 0);
  }

  const expenseCategories = Object.entries(expensesByCategoryRaw)
    .map(([key, amount]) => ({
      key,
      label: categoryLabels[key] || key,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    totalRevenue,
    totalExpenses,
    grossProfit,
    netProfit: grossProfit,
    profitMargin: Math.round(profitMargin * 100) / 100,
    monthlyBreakdown,
    expenseCategories,
  });
}
