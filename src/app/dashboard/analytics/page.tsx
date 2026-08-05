"use client";

import { useEffect, useState } from "react";
import { BarChart3, Package, ShoppingCart, TrendingUp } from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";


import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Pending: "#eab308",
  Processing: "#3b82f6",
  Shipped: "#a855f7",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  Pending: "معلق",
  Processing: "قيد المعالجة",
  Shipped: "تم الشحن",
  Delivered: "تم التوصيل",
  Cancelled: "ملغي",
};

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
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

        const totalProducts = productsData.length;
        const pendingOrders = ordersData.filter((o: any) => o.status === "Pending").length;
        const totalCustomers = customersData.length;
        const totalInvoices = invoicesData.length;
        const totalExpenses = expensesData.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
        const netProfit = totalInvoices - totalExpenses;

        setStats({
          stats: { totalProducts, pendingOrders },
          totalInvoices,
          totalExpenses,
          netProfit,
          totalCustomers,
        });
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statusCounts = orders.reduce(
    (acc: Record<string, number>, order: any) => {
      const status = order.status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const pieData = Object.entries(statusCounts)
    .filter(([status]) => STATUS_COLORS[status])
    .map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status],
    }));

  const categoryCounts = products.reduce(
    (acc: Record<string, number>, product: any) => {
      const cat = product.category || "غير مصنف";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const categoryData = Object.entries(categoryCounts).map(
    ([category, count]) => ({
      name: category,
      عدد: count,
    })
  );

  const stockData = [...products]
    .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
    .slice(0, 10)
    .map((p: any) => ({
      name: p.name,
      المخزون: p.stock || 0,
    }));

  const maxStock = Math.max(
    ...products.map((p: any) => p.stock || 0),
    1
  );

  const revenueData = (() => {
    if (!orders.length) return [];
    const monthOrder = [
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
    const grouped: Record<string, number> = {};
    orders.forEach((o: any) => {
      const date = new Date(o.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key] += Number(o.total) || 0;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, revenue]) => {
        const [year, month] = key.split("-").map(Number);
        return {
          name: `${monthOrder[month]} ${year}`,
          الإيرادات: revenue,
        };
      });
  })();

  const summaryCards = [
    {
      label: "الإيرادات",
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "إجمالي الطلبات",
      value: stats?.totalOrders || orders.length || 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "تم التوصيل",
      value: stats?.deliveredOrders || statusCounts["Delivered"] || 0,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "المنتجات",
      value: stats?.stats?.totalProducts || products.length || 0,
      icon: BarChart3,
      color: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">التحليلات</h1>
        <p className="text-muted-foreground text-sm mt-1">
          رؤى ومقاييس الأداء
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((s, i) => (
          <div
            key={i}
            className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-11 h-11 ${s.color} rounded-xl flex items-center justify-center`}
              >
                <s.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-foreground">
                {loading ? "..." : s.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Overview + Orders by Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">
            نظرة عامة على الإيرادات
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : revenueData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  لا توجد بيانات إيرادات بعد
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  angle={-30}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="الإيرادات"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">
            توزيع حالات الطلبات
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : pieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  لا توجد بيانات طلبات بعد
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Products by Category + Stock Levels */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">
            المنتجات حسب الفئة
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  لا توجد منتجات بعد
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="عدد" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="font-semibold text-foreground mb-4">
            مستويات المخزون
          </h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : stockData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">
                  لا توجد بيانات مخزون بعد
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="المخزون"
                  fill="#a855f7"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products List */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">أفضل المنتجات</h2>
        <div className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground text-center">
              جاري التحميل...
            </p>
          ) : products.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              لا توجد منتجات بعد
            </p>
          ) : (
            [...products]
              .sort((a: any, b: any) => (b.stock || 0) - (a.stock || 0))
              .slice(0, 8)
              .map((product: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {product.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {product.category || "غير مصنف"}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2 transition-all"
                        style={{
                          width: `${Math.min(100, ((product.stock || 0) / maxStock) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {product.stock || 0} وحدة في المخزون
                      {product.price
                        ? ` · $${product.price}`
                        : ""}
                    </p>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
