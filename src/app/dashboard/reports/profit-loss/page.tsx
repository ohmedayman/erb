"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  FileText,
  Download,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";
import { generateReportPDF } from "@/lib/pdf-export";

interface MonthlyBreakdown {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ExpenseCategory {
  key: string;
  label: string;
  amount: number;
  percentage: number;
}

interface ProfitLossData {
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  monthlyBreakdown: MonthlyBreakdown[];
  expenseCategories: ExpenseCategory[];
}

const categoryColors: Record<string, string> = {
  rent: "bg-blue-500",
  utilities: "bg-yellow-500",
  salaries: "bg-green-500",
  marketing: "bg-purple-500",
  transport: "bg-orange-500",
  other: "bg-gray-500",
};

export default function ProfitLossPage() {
  const [data, setData] = useState<ProfitLossData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const filters = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];
        const invoicesData = await getDocsFromCollection("invoices", filters);
        const expensesData = await getDocsFromCollection("expenses", filters);

        const totalRevenue = invoicesData.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
        const totalExpenses = expensesData.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const grossProfit = totalRevenue - totalExpenses;
        const netProfit = grossProfit;
        const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

        const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
        const monthlyBreakdown: MonthlyBreakdown[] = months.slice(0, 6).map((month, i) => {
          const monthInvs = invoicesData.filter((inv: any) => new Date(inv.created_at || inv.createdAt).getMonth() === i);
          const monthExps = expensesData.filter((exp: any) => new Date(exp.date || exp.created_at).getMonth() === i);
          const revenue = monthInvs.reduce((s: number, inv: any) => s + (inv.total || 0), 0);
          const expenses = monthExps.reduce((s: number, exp: any) => s + (exp.amount || 0), 0);
          return { month, revenue, expenses, profit: revenue - expenses };
        });

        const expenseCategoriesRaw = expensesData.reduce((acc: any[], e: any) => {
          const existing = acc.find((a) => a.key === e.category);
          if (existing) { existing.amount += e.amount || 0; } else { acc.push({ key: e.category || "other", label: e.category || "أخرى", amount: e.amount || 0, percentage: 0 }); }
          return acc;
        }, []);
        const totalExpensesForPct = expenseCategoriesRaw.reduce((s: number, c: any) => s + c.amount, 0);
        expenseCategoriesRaw.forEach((c: any) => { c.percentage = totalExpensesForPct > 0 ? (c.amount / totalExpensesForPct) * 100 : 0; });

        setData({
          totalRevenue,
          totalExpenses,
          grossProfit,
          netProfit,
          profitMargin,
          monthlyBreakdown,
          expenseCategories: expenseCategoriesRaw,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ar-EG", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const summaryCards = [
    {
      label: "توتال الإيرادات",
      value: data?.totalRevenue ?? 0,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600 border-green-200",
      iconBg: "bg-green-100",
    },
    {
      label: "توتال المصروفات",
      value: data?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "bg-red-50 text-red-600 border-red-200",
      iconBg: "bg-red-100",
    },
    {
      label: "الربح الصافي",
      value: data?.netProfit ?? 0,
      icon: DollarSign,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      iconBg: "bg-blue-100",
    },
    {
      label: "هامش الربح",
      value: data?.profitMargin ?? 0,
      icon: Percent,
      suffix: "%",
      color: "bg-purple-50 text-purple-600 border-purple-200",
      iconBg: "bg-purple-100",
    },
  ];

  const maxMonthlyRevenue = data?.monthlyBreakdown.length
    ? Math.max(...data.monthlyBreakdown.map((m) => m.revenue), 1)
    : 1;

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            تقرير الأرباح والخسائر
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            تحليل مفصل للأرباح والمصروفات
          </p>
        </div>
        <button
          onClick={() => {
            if (data) {
              const reportData = data.monthlyBreakdown.length > 0
                ? data.monthlyBreakdown.map(m => ({ month: m.month, revenue: m.revenue, expenses: m.expenses, profit: m.profit }))
                : [{ month: "الإجمالي", revenue: data.totalRevenue, expenses: data.totalExpenses, profit: data.netProfit }];
              generateReportPDF("تقرير الأرباح والخسائر", reportData, ["month", "revenue", "expenses", "profit"]);
            }
          }}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          تصدير PDF
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`rounded-xl p-5 border ${card.color} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center`}
              >
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold">
                {loading
                  ? "..."
                  : card.suffix
                    ? `${card.value}${card.suffix}`
                    : formatCurrency(card.value)}
              </p>
              <p className="text-sm mt-1 opacity-80">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              التفصيل الشهري (آخر 6 شهور)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    الشهر
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    الإيرادات
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    المصروفات
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    الربح
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      بيتحمّل...
                    </td>
                  </tr>
                ) : !data?.monthlyBreakdown?.length ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      مفيش بيانات لسه
                    </td>
                  </tr>
                ) : (
                  data.monthlyBreakdown.map((item, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {item.month}
                      </td>
                      <td className="px-5 py-3 text-sm text-green-600 font-medium">
                        {formatCurrency(item.revenue)} ج.م
                      </td>
                      <td className="px-5 py-3 text-sm text-red-600 font-medium">
                        {formatCurrency(item.expenses)} ج.م
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-sm font-semibold ${
                            item.profit >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.profit >= 0 ? "+" : ""}
                          {formatCurrency(item.profit)} ج.م
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              توزيع المصروفات حسب الصنف
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                بيتحمّل...
              </p>
            ) : !data?.expenseCategories?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                مفيش مصروفات لسه
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex h-4 rounded-full overflow-hidden">
                  {data.expenseCategories.map((cat, i) => (
                    <div
                      key={i}
                      className={`${
                        categoryColors[cat.key] || "bg-gray-400"
                      } transition-all duration-500`}
                      style={{
                        width: `${Math.max(cat.percentage, 2)}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="space-y-3">
                  {data.expenseCategories.map((cat, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              categoryColors[cat.key] || "bg-gray-400"
                            }`}
                          />
                          <span className="text-sm text-foreground">
                            {cat.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">
                            {cat.percentage.toFixed(1)}%
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {formatCurrency(cat.amount)} ج.م
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            categoryColors[cat.key] || "bg-gray-400"
                          }`}
                          style={{
                            width: `${Math.max(cat.percentage, 2)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
