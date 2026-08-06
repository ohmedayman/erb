"use client";

import { useMemo } from "react";
import { Store, Users, Package, ShoppingCart, Receipt, Wallet, UserCog, TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import StatCard from "./StatCard";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

interface OverviewProps {
  stats: {
    totalStores: number;
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    totalExpenses: number;
    pendingOrders: number;
    approvedOrders: number;
    activeUsers: number;
    totalCustomers: number;
    totalInvoices: number;
    totalEmployees: number;
  };
  recentOrders: any[];
  stores: any[];
  orders: any[];
  expenses: any[];
  products: any[];
  customers: any[];
}

export default function Overview({ stats, recentOrders, stores, orders, expenses, products, customers }: OverviewProps) {
  const netProfit = stats.totalRevenue - stats.totalExpenses;

  // Revenue trend (last 30 days)
  const revenueTrend = useMemo(() => {
    const days: { date: string; label: string; revenue: number; expenses: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayRevenue = orders
        .filter((o) => o.created_at?.startsWith(dateStr))
        .reduce((sum, o) => sum + (o.total || 0), 0);
      const dayExpenses = expenses
        .filter((e) => e.date === dateStr || e.created_at?.startsWith(dateStr))
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      days.push({
        date: dateStr,
        label: d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }),
        revenue: dayRevenue,
        expenses: dayExpenses,
      });
    }
    return days;
  }, [orders, expenses]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const statusMap: Record<string, number> = {};
    orders.forEach((o) => {
      const s = o.status || "Other";
      statusMap[s] = (statusMap[s] || 0) + 1;
    });
    const statusLabels: Record<string, string> = {
      Completed: "مكتمل",
      Pending: "معلق",
      Cancelled: "ملغي",
      Processing: "قيد التنفيذ",
    };
    return Object.entries(statusMap).map(([status, count]) => ({
      name: statusLabels[status] || status,
      value: count,
    }));
  }, [orders]);

  // Expense breakdown by category
  const expenseCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    expenses.forEach((e) => {
      const c = e.category || "أخرى";
      catMap[c] = (catMap[c] || 0) + (e.amount || 0);
    });
    const catLabels: Record<string, string> = {
      rent: "إيجار",
      utilities: "مرافق",
      salaries: "رواتب",
      supplies: "مستلزمات",
      marketing: "تسويق",
      transport: "نقل",
      other: "أخرى",
    };
    return Object.entries(catMap)
      .map(([cat, amount]) => ({ name: catLabels[cat] || cat, value: amount }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [expenses]);

  // Top products by stock
  const topProductsData = useMemo(() => {
    return products
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 8)
      .map((p) => ({
        name: p.name?.length > 15 ? p.name.slice(0, 15) + "..." : p.name,
        stock: p.stock || 0,
        price: p.price || 0,
      }));
  }, [products]);

  // Customer growth (last 30 days)
  const customerGrowth = useMemo(() => {
    const days: { date: string; label: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = customers.filter((c) => c.created_at?.startsWith(dateStr)).length;
      days.push({
        date: dateStr,
        label: d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" }),
        count,
      });
    }
    return days;
  }, [customers]);

  // Store performance
  const storePerformance = useMemo(() => {
    return stores.slice(0, 6).map((s) => {
      const storeOrders = orders.filter((o) => o.store_id === s.id);
      const storeRevenue = storeOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return {
        name: s.name?.length > 12 ? s.name.slice(0, 12) + "..." : s.name,
        revenue: storeRevenue,
        orders: storeOrders.length,
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }, [stores, orders]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          {payload.map((p: any, i: number) => (
            <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
              {p.name}: {p.value?.toLocaleString()} ج.م
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">لوحة التحكم الرئيسية</h2>
        <p className="text-slate-400 text-sm">نظرة عامة على كل المنصة</p>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="المتاجر" value={stats.totalStores} icon={Store} color="bg-orange-500/20 text-orange-400" />
        <StatCard label="المستخدمين" value={stats.totalUsers} icon={Users} color="bg-blue-500/20 text-blue-400" />
        <StatCard label="المنتجات" value={stats.totalProducts} icon={Package} color="bg-green-500/20 text-green-400" />
        <StatCard label="الزبائن" value={stats.totalCustomers} icon={UserCog} color="bg-purple-500/20 text-purple-400" />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الإيرادات" value={`${stats.totalRevenue.toLocaleString()} ج.م`} icon={TrendingUp} color="bg-emerald-500/20 text-emerald-400" />
        <StatCard label="المصروفات" value={`${stats.totalExpenses.toLocaleString()} ج.م`} icon={Wallet} color="bg-red-500/20 text-red-400" />
        <StatCard label="صافي الربح" value={`${netProfit.toLocaleString()} ج.م`} icon={netProfit >= 0 ? TrendingUp : TrendingDown} color={netProfit >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"} />
        <StatCard label="الأوردرات" value={stats.totalOrders} icon={ShoppingCart} color="bg-cyan-500/20 text-cyan-400" />
      </div>

      {/* KPI Cards Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="طلبات معلقة" value={stats.pendingOrders} icon={AlertCircle} color="bg-amber-500/20 text-amber-400" />
        <StatCard label="طلبات مقبولة" value={stats.approvedOrders} icon={CheckCircle} color="bg-green-500/20 text-green-400" />
        <StatCard label="الفواتير" value={stats.totalInvoices} icon={Receipt} color="bg-indigo-500/20 text-indigo-400" />
        <StatCard label="الموظفين" value={stats.totalEmployees} icon={UserCog} color="bg-pink-500/20 text-pink-400" />
      </div>

      {/* Charts Row 1: Revenue Trend + Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-1">المبيعات والمصروفات</h3>
          <p className="text-slate-500 text-xs mb-4">آخر 30 يوم</p>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueTrend}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="الإيرادات" stroke="#f97316" fill="url(#revenueGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="المصروفات" stroke="#ef4444" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Donut */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-1">حالة الأوردرات</h3>
          <p className="text-slate-500 text-xs mb-4">توزيع الأوردرات</p>
          {orderStatusData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-16">لا توجد أوردرات</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {orderStatusData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  itemStyle={{ color: "#e2e8f0" }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px" }}
                  formatter={(value) => <span style={{ color: "#94a3b8" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 2: Expense Categories + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Categories Pie */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-1">توزيع المصروفات</h3>
          <p className="text-slate-500 text-xs mb-4">حسب الفئة</p>
          {expenseCategoryData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-16">لا توجد مصروفات</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: "#64748b" }}
                >
                  {expenseCategoryData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  formatter={(value: number) => [`${value.toLocaleString()} ج.م`, "المبلغ"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-1">أكتر المنتجات مخزوناً</h3>
          <p className="text-slate-500 text-xs mb-4">أعلى 8 منتجات</p>
          {topProductsData.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-16">لا توجد منتجات</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProductsData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  formatter={(value: number) => [value, "المخزون"]}
                />
                <Bar dataKey="stock" fill="#f97316" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Charts Row 3: Customer Growth + Store Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-1">نمو الزبائن</h3>
          <p className="text-slate-500 text-xs mb-4">آخر 30 يوم</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                formatter={(value: number) => [value, "زبون جديد"]}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Store Performance */}
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-1">أداء المتاجر</h3>
          <p className="text-slate-500 text-xs mb-4">المتاجر حسب الإيرادات</p>
          {storePerformance.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-16">لا توجد متاجر</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={storePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                  formatter={(value: number, name: string) => [`${value.toLocaleString()} ج.م`, name === "revenue" ? "الإيرادات" : "الأوردرات"]}
                />
                <Bar dataKey="revenue" name="revenue" fill="#f97316" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-4">أحدث الأوردرات</h3>
          {recentOrders.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">لا توجد أوردرات بعد</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                  <div>
                    <p className="text-white text-sm font-medium">{order.order_number || order.customer_name}</p>
                    <p className="text-slate-400 text-xs">{order.customer_name} - {new Date(order.created_at).toLocaleDateString("ar-EG")}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-orange-400 font-bold text-sm">{order.total?.toLocaleString()} ج.م</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${order.status === "Completed" ? "bg-green-500/20 text-green-400" : order.status === "Pending" ? "bg-amber-500/20 text-amber-400" : "bg-slate-500/20 text-slate-400"}`}>
                      {order.status === "Completed" ? "مكتمل" : order.status === "Pending" ? "معلق" : order.status === "Cancelled" ? "ملغي" : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-slate-700/50 p-5">
          <h3 className="text-white font-bold mb-4">المتاجر النشطة</h3>
          {stores.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">لا توجد متاجر بعد</p>
          ) : (
            <div className="space-y-3">
              {stores.slice(0, 5).map((store) => (
                <div key={store.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f172a] border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <Store className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{store.name}</p>
                      <p className="text-slate-400 text-xs">{store.owner_email}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${store.onboarding_done ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                      {store.onboarding_done ? "نشط" : "جديد"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
