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
  ShoppingCart,
  Users,
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
  totalOrders: number;
  totalCustomers: number;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const filters = user.storeId
          ? [{ field: "storeId", op: "==", value: user.storeId }]
          : [];

        const ordersData = await getDocsFromCollection("orders", filters);
        const productsData = await getDocsFromCollection("products", filters);
        const invoicesData = await getDocsFromCollection("invoices", filters);
        const expensesData = await getDocsFromCollection("expenses", filters);
        const customersData = await getDocsFromCollection("customers", filters);

        const totalRevenue = invoicesData.reduce(
          (sum: number, i: any) => sum + (i.total || 0),
          0
        );
        const totalExpenses = expensesData.reduce(
          (sum: number, e: any) => sum + (e.amount || 0),
          0
        );
        const netProfit = totalRevenue - totalExpenses;

        // Calculate monthly revenue (last 6 months)
        const now = new Date();
        const monthlyRevenue: { month: string; amount: number }[] = [];
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
        for (let i = 5; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const monthLabel = monthNames[d.getMonth()];
          const amount = invoicesData
            .filter((inv: any) => {
              const dateStr = inv.createdAt || inv.date || "";
              if (!dateStr) return false;
              const invDate = new Date(dateStr);
              return (
                invDate.getFullYear() === d.getFullYear() &&
                invDate.getMonth() === d.getMonth()
              );
            })
            .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
          monthlyRevenue.push({ month: monthLabel, amount });
        }

        // Calculate top selling products from orders
        const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
        ordersData.forEach((order: any) => {
          const items = order.items || order.products || [];
          items.forEach((item: any) => {
            const productName = item.name || item.productName || item.productNameAr || "منتج";
            const qty = item.quantity || item.qty || 1;
            const price = item.price || item.unitPrice || 0;
            const total = item.total || qty * price;
            if (productSales[productName]) {
              productSales[productName].quantity += qty;
              productSales[productName].revenue += total;
            } else {
              productSales[productName] = { name: productName, quantity: qty, revenue: total };
            }
          });
        });
        const topSellingProducts = Object.values(productSales)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // If no order items, fallback to product stock data
        const finalTopProducts =
          topSellingProducts.length > 0
            ? topSellingProducts
            : productsData
                .filter((p: any) => (p.stock || 0) > 0)
                .sort((a: any, b: any) => (b.price || 0) - (a.price || 0))
                .slice(0, 5)
                .map((p: any) => ({
                  name: p.name,
                  quantity: p.stock || 0,
                  revenue: (p.price || 0) * (p.stock || 0),
                }));

        // Expenses by category
        const expensesByCategory: { category: string; categoryKey: string; amount: number }[] = [];
        const catMap: Record<string, number> = {};
        expensesData.forEach((e: any) => {
          const cat = e.category || "أخرى";
          const key = cat.toLowerCase().replace(/\s+/g, "_");
          if (catMap[key] !== undefined) {
            catMap[key] += e.amount || 0;
          } else {
            catMap[key] = e.amount || 0;
            expensesByCategory.push({ category: cat, categoryKey: key, amount: 0 });
          }
          const entry = expensesByCategory.find((c) => c.categoryKey === key);
          if (entry) entry.amount = catMap[key];
        });
        expensesByCategory.sort((a, b) => b.amount - a.amount);

        // Outstanding invoices
        const outstandingInvoices = invoicesData
          .filter((i: any) => i.status && i.status !== "paid")
          .sort((a: any, b: any) => (b.total || 0) - (a.total || 0))
          .slice(0, 10)
          .map((i: any) => ({
            id: i.id,
            invoiceNumber: i.invoiceNumber || i.invoiceNumberAr || `INV-${i.id?.slice(0, 6)}`,
            customerName: i.customerName || i.customerNameAr || "عميل",
            total: i.total || 0,
            status: i.status,
            createdAt: i.createdAt || i.date || "",
          }));

        setData({
          totalRevenue,
          totalExpenses,
          netProfit,
          topSellingProducts: finalTopProducts,
          expensesByCategory,
          monthlyRevenue,
          outstandingInvoices,
          totalInvoices: invoicesData.length,
          unpaidInvoices: invoicesData.filter((i: any) => i.status && i.status !== "paid").length,
          totalOrders: ordersData.length,
          totalCustomers: customersData.length,
        });
      } catch {
        // silent
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

  const maxRevenue =
    data?.monthlyRevenue.length
      ? Math.max(...data.monthlyRevenue.map((m) => m.amount), 1)
      : 1;

  const totalCategoryAmount =
    data?.expensesByCategory.reduce((sum, c) => sum + c.amount, 0) || 1;

  const categoryColors: Record<string, string> = {
    rent: "#3b82f6",
    utilities: "#eab308",
    salaries: "#22c55e",
    marketing: "#a855f7",
    transport: "#f97316",
    other: "#6b7280",
    أخرى: "#6b7280",
  };

  const categoryBgColors: Record<string, string> = {
    rent: "bg-blue-500",
    utilities: "bg-yellow-500",
    salaries: "bg-green-500",
    marketing: "bg-purple-500",
    transport: "bg-orange-500",
    other: "bg-gray-500",
    أخرى: "bg-gray-500",
  };

  // Build conic-gradient for pie chart
  const buildPieGradient = () => {
    if (!data?.expensesByCategory?.length) return "conic-gradient(#e5e7eb 0% 100%)";
    let accumulated = 0;
    const stops: string[] = [];
    data.expensesByCategory.forEach((cat) => {
      const start = accumulated;
      const end = accumulated + (cat.amount / totalCategoryAmount) * 100;
      const color = categoryColors[cat.categoryKey] || "#6b7280";
      stops.push(`${color} ${start}% ${end}%`);
      accumulated = end;
    });
    return `conic-gradient(${stops.join(", ")})`;
  };

  const summaryCards = [
    {
      label: "إجمالي الإيرادات",
      value: data?.totalRevenue ?? 0,
      icon: TrendingUp,
      color: "from-emerald-50 to-emerald-100/50 border-emerald-200",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
      stagger: "stagger-1",
    },
    {
      label: "إجمالي المصروفات",
      value: data?.totalExpenses ?? 0,
      icon: TrendingDown,
      color: "from-red-50 to-red-100/50 border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-700",
      stagger: "stagger-2",
    },
    {
      label: "الربح الصافي",
      value: data?.netProfit ?? 0,
      icon: DollarSign,
      color: "from-blue-50 to-blue-100/50 border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-blue-700",
      stagger: "stagger-3",
    },
    {
      label: "الفواتير غير المدفوعة",
      value: data?.unpaidInvoices ?? 0,
      icon: AlertCircle,
      color: "from-amber-50 to-amber-100/50 border-amber-200",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
      stagger: "stagger-4",
    },
  ];

  const quickStats = [
    {
      label: "عدد الطلبات",
      value: data?.totalOrders ?? 0,
      icon: ShoppingCart,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      stagger: "stagger-5",
    },
    {
      label: "عدد العملاء",
      value: data?.totalCustomers ?? 0,
      icon: Users,
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
      stagger: "stagger-6",
    },
    {
      label: "إجمالي الفواتير",
      value: data?.totalInvoices ?? 0,
      icon: FileText,
      color: "text-violet-600",
      bgColor: "bg-violet-50",
      stagger: "stagger-7",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold text-foreground">
          التقارير المالية
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          نظرة شاملة على الأداء المالي لمخزنك
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className={`animate-fade-in-up ${card.stagger} opacity-0 hover-lift rounded-xl p-5 border bg-gradient-to-br ${card.color} cursor-default`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center`}
              >
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className={`text-2xl font-bold ${card.valueColor}`}>
                {loading ? (
                  <span className="inline-block w-20 h-7 bg-black/5 rounded animate-pulse" />
                ) : card.label === "الفواتير غير المدفوعة" ? (
                  card.value.toLocaleString("ar-EG")
                ) : (
                  formatCurrency(card.value)
                )}
              </p>
              <p className="text-sm mt-1 text-muted-foreground">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, i) => (
          <div
            key={i}
            className={`animate-fade-in-up ${stat.stagger} opacity-0 hover-lift rounded-xl p-4 border border-border bg-card flex items-center gap-4`}
          >
            <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">
                {loading ? (
                  <span className="inline-block w-14 h-6 bg-black/5 rounded animate-pulse" />
                ) : (
                  stat.value.toLocaleString("ar-EG")
                )}
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="animate-fade-in-up stagger-3 opacity-0 bg-card rounded-xl border border-border hover-lift overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-l from-blue-50/50 to-transparent">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-blue-600" />
              </div>
              الإيرادات الشهرية - آخر 6 شهور
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-16 h-4 bg-black/5 rounded animate-pulse" />
                    <div className="flex-1 h-6 bg-black/5 rounded-full animate-pulse" />
                    <div className="w-20 h-4 bg-black/5 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : !data?.monthlyRevenue?.length ||
              data.monthlyRevenue.every((m) => m.amount === 0) ? (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  مفيش بيانات إيرادات لسه
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.monthlyRevenue.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <span className="text-xs text-muted-foreground w-16 text-right shrink-0 font-medium">
                      {item.month}
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-7 overflow-hidden relative">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-blue-500 to-blue-400 transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.max(
                            (item.amount / maxRevenue) * 100,
                            item.amount > 0 ? 5 : 0
                          )}%`,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                      <span className="absolute inset-0 flex items-center px-3 text-[11px] font-semibold text-white drop-shadow-sm">
                        {item.amount > 0 && (item.amount / maxRevenue) * 100 > 15
                          ? formatCurrency(item.amount)
                          : ""}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-foreground w-24 text-left shrink-0 tabular-nums">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Expenses by Category - Pie Chart */}
        <div className="animate-fade-in-up stagger-4 opacity-0 bg-card rounded-xl border border-border hover-lift overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-l from-red-50/50 to-transparent">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-red-600" />
              </div>
              المصروفات حسب التصنيف
            </h2>
          </div>
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-28 h-28 rounded-full bg-black/5 animate-pulse" />
              </div>
            ) : !data?.expensesByCategory?.length ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  مفيش مصروفات مسجلة لسه
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Pie Chart */}
                <div className="flex justify-center">
                  <div
                    className="w-32 h-32 rounded-full animate-scale-in"
                    style={{
                      background: buildPieGradient(),
                      boxShadow: "0 4px 20px -4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div className="w-full h-full rounded-full flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center shadow-inner">
                        <span className="text-xs font-bold text-foreground">
                          {data.expensesByCategory.length}
                        </span>
                        <span className="text-[9px] text-muted-foreground mr-0.5">
                          تصنيف
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend + Bars */}
                <div className="space-y-2.5">
                  {data.expensesByCategory.map((cat, i) => {
                    const percentage = (cat.amount / totalCategoryAmount) * 100;
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full shrink-0"
                              style={{
                                backgroundColor:
                                  categoryColors[cat.categoryKey] || "#6b7280",
                              }}
                            />
                            <span className="text-sm text-foreground">
                              {cat.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                              {percentage.toFixed(1)}%
                            </span>
                            <span className="text-sm font-bold text-foreground tabular-nums">
                              {formatCurrency(cat.amount)}
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 ease-out"
                            style={{
                              width: `${percentage}%`,
                              backgroundColor:
                                categoryColors[cat.categoryKey] || "#6b7280",
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="animate-fade-in-up stagger-5 opacity-0 bg-card rounded-xl border border-border hover-lift overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-l from-green-50/50 to-transparent">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-green-600" />
              </div>
              أكتر المنتجات مبيعاً
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">
                    المنتج
                  </th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-5 py-3">
                    الكمية
                  </th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3">
                    الإيراد
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        <div className="w-24 h-4 bg-black/5 rounded animate-pulse" />
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="w-10 h-4 bg-black/5 rounded animate-pulse mx-auto" />
                      </td>
                      <td className="px-5 py-3">
                        <div className="w-16 h-4 bg-black/5 rounded animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : !data?.topSellingProducts?.length ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-12 text-center"
                    >
                      <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        مفيش بيانات مبيعات لسه
                      </p>
                    </td>
                  </tr>
                ) : (
                  data.topSellingProducts.map((product, i) => (
                    <tr
                      key={i}
                      className="table-row-enter border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-foreground truncate">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground text-center tabular-nums">
                        {product.quantity.toLocaleString("ar-EG")}
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-foreground text-left tabular-nums">
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
        <div className="animate-fade-in-up stagger-6 opacity-0 bg-card rounded-xl border border-border hover-lift overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-l from-amber-50/50 to-transparent">
            <h2 className="font-semibold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              الفواتير غير المدفوعة
              {data && data.unpaidInvoices > 0 && (
                <span className="mr-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {data.unpaidInvoices}
                </span>
              )}
            </h2>
          </div>
          <div className="p-4 space-y-2 max-h-[420px] overflow-y-auto">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-3 rounded-lg bg-muted/50 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="w-24 h-4 bg-black/5 rounded" />
                      <div className="w-16 h-3 bg-black/5 rounded" />
                    </div>
                    <div className="w-20 h-4 bg-black/5 rounded" />
                  </div>
                </div>
              ))
            ) : !data?.outstandingInvoices?.length ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  مفيش فواتير غير مدفوعة - كلها تمام!
                </p>
              </div>
            ) : (
              data.outstandingInvoices.map((invoice, i) => (
                <div
                  key={invoice.id}
                  className="table-row-enter flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/70 transition-all border border-transparent hover:border-border"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {invoice.invoiceNumber}
                      </p>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                          invoice.status === "unpaid"
                            ? "bg-red-100 text-red-700"
                            : invoice.status === "partial"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {invoice.status === "unpaid"
                          ? "مدفوعش"
                          : invoice.status === "partial"
                          ? "جزئي"
                          : "معلق"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {invoice.customerName}
                    </p>
                  </div>
                  <div className="text-left shrink-0 mr-3">
                    <p className="text-sm font-bold text-red-600 tabular-nums">
                      {formatCurrency(invoice.total)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
