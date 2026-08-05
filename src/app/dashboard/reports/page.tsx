"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Package,
  AlertCircle,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";

interface ReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  topSellingProducts: { name: string; quantity: number; revenue: number }[];
  expensesByCategory: { category: string; categoryKey: string; amount: number }[];
  monthlyRevenue: { month: string; amount: number }[];
  outstandingInvoices: {
    id: string;
    invoiceNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }[];
  totalInvoices: number;
  unpaidInvoices: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const filters = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];
        const ordersData = getDocsFromCollection("orders", filters);
        const productsData = getDocsFromCollection("products", filters);
        const invoicesData = getDocsFromCollection("invoices", filters);
        const expensesData = getDocsFromCollection("expenses", filters);
        const customersData = getDocsFromCollection("customers", filters);

        const totalRevenue = invoicesData.reduce((sum: number, i: any) => sum + (i.total || 0), 0);
        const totalExpenses = expensesData.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;

        setData({
          totalRevenue,
          totalExpenses,
          netProfit,
          topSellingProducts: productsData.slice(0, 5).map((p: any) => ({ name: p.name, quantity: p.stock || 0, revenue: (p.price || 0) * (p.stock || 0) })),
          expensesByCategory: expensesData.reduce((acc: any[], e: any) => {
            const existing = acc.find((a) => a.categoryKey === e.category);
            if (existing) { existing.amount += e.amount || 0; } else { acc.push({ category: e.category, categoryKey: e.category, amount: e.amount || 0 }); }
            return acc;
          }, []),
          monthlyRevenue: [],
          outstandingInvoices: invoicesData.filter((i: any) => i.status !== "paid").slice(0, 10).map((i: any) => ({ id: i.id, invoiceNumber: i.invoiceNumber, customerName: i.customerName, total: i.total || 0, status: i.status, createdAt: i.createdAt || i.date })),
          totalInvoices: invoicesData.length,
          unpaidInvoices: invoicesData.filter((i: any) => i.status !== "paid").length,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("ar-SA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const maxRevenue =
    data?.monthlyRevenue.length
      ? Math.max(...data.monthlyRevenue.map((m) => m.amount), 1)
      : 1;

  const totalCategoryAmount =
    data?.expensesByCategory.reduce((sum, c) => sum + c.amount, 0) || 1;

  const categoryColors: Record<string, string> = {
    rent: "bg-blue-500",
    utilities: "bg-yellow-500",
    salaries: "bg-green-500",
    marketing: "bg-purple-500",
    transport: "bg-orange-500",
    other: "bg-gray-500",
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
      label: "الفواتير اللي لسه مش مدفوعة",
      value: data?.unpaidInvoices ?? 0,
      icon: AlertCircle,
      color: "bg-orange-50 text-orange-600 border-orange-200",
      iconBg: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">التقارير المالية</h1>
        <p className="text-muted-foreground text-sm mt-1">
          نظرة شاملة على الأداء المالي لمخزنك.
        </p>
      </div>

      {/* Financial Summary */}
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
                {loading ? "..." : formatCurrency(card.value)}
              </p>
              <p className="text-sm mt-1 opacity-80">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              الإيرادات الشهرية
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                بيتحمّل...
              </p>
            ) : !data?.monthlyRevenue?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                مفيش بيانات لسه
              </p>
            ) : (
              <div className="space-y-3">
                {data.monthlyRevenue.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-20 text-left shrink-0">
                      {item.month}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(
                            (item.amount / maxRevenue) * 100,
                            item.amount > 0 ? 4 : 0
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-foreground w-24 text-left shrink-0">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              المصروفات حسب الصنف
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                بيتحمّل...
              </p>
            ) : !data?.expensesByCategory?.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                مفيش مصروفات لسه
              </p>
            ) : (
              <div className="space-y-4">
                {/* Pie chart simulation with stacked bar */}
                <div className="flex h-4 rounded-full overflow-hidden">
                  {data.expensesByCategory.map((cat, i) => (
                    <div
                      key={i}
                      className={`${categoryColors[cat.categoryKey] || "bg-gray-400"} transition-all duration-500`}
                      style={{
                        width: `${(cat.amount / totalCategoryAmount) * 100}%`,
                      }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  {data.expensesByCategory.map((cat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${categoryColors[cat.categoryKey] || "bg-gray-400"}`}
                        />
                        <span className="text-sm text-foreground">
                          {cat.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {((cat.amount / totalCategoryAmount) * 100).toFixed(1)}%
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {formatCurrency(cat.amount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <Package className="w-4 h-4" />
              أكتر منتجات اتباعت
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    المنتج
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    الكمية المباعة
                  </th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">
                    الإيراد
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      بيتحمّل...
                    </td>
                  </tr>
                ) : !data?.topSellingProducts?.length ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-muted-foreground text-sm"
                    >
                      مفيش بيانات لسه
                    </td>
                  </tr>
                ) : (
                  data.topSellingProducts.map((product, i) => (
                    <tr
                      key={i}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {product.name}
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">
                        {product.quantity}
                      </td>
                      <td className="px-5 py-3 text-sm font-medium text-foreground">
                        {formatCurrency(product.revenue)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Outstanding Invoices */}
        <div className="bg-card rounded-xl border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              الفواتير اللي لسه مش مدفوعة
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                بيتحمّل...
              </p>
            ) : !data?.outstandingInvoices?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                مفيش فواتير لسه مش مدفوعة
              </p>
            ) : (
              data.outstandingInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {invoice.invoiceNumber}
                      </p>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          invoice.status === "unpaid"
                            ? "bg-red-50 text-red-600"
                            : "bg-yellow-50 text-yellow-600"
                        }`}
                      >
                        {invoice.status === "unpaid" ? "مش مدفوعة" : "جزئي"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {invoice.customerName}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
