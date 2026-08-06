"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart3, Package, ShoppingCart, TrendingUp, TrendingDown,
  DollarSign, Users, Clock, ArrowUpRight, ArrowDownRight,
  Download, Calendar, RefreshCw, AlertTriangle, PackageCheck,
  Receipt, Wallet, Truck, RotateCcw, Filter,
} from "lucide-react";
import { getDocsFromCollection } from "@/lib/localdb";
import { exportToExcel } from "@/lib/excel";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area, Legend, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, ComposedChart,
} from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4", "#f59e0b", "#ef4444"];
const STATUS_MAP: Record<string, string> = {
  Pending: "معلّق", Processing: "قيد المعالجة", Shipped: "تم الشحن",
  Delivered: "تم التوصيل", Cancelled: "ملغي",
};
const STATUS_COLOR: Record<string, string> = {
  Pending: "#eab308", Processing: "#3b82f6", Shipped: "#a855f7",
  Delivered: "#22c55e", Cancelled: "#ef4444",
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<"week" | "month" | "quarter" | "year">("month");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const f = user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : [];
      const [prods, ords, invs, exps, custs, emps] = await Promise.all([
        getDocsFromCollection("products", f),
        getDocsFromCollection("orders", f),
        getDocsFromCollection("invoices", f),
        getDocsFromCollection("expenses", f),
        getDocsFromCollection("customers", f),
        getDocsFromCollection("employees", f),
      ]);
      setProducts(prods); setOrders(ords); setInvoices(invs);
      setExpenses(exps); setCustomers(custs); setEmployees(emps);
      setLastUpdated(new Date());
    } catch {} finally { setLoading(false); }
  };

  // Filter by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const ranges = { week: 7, month: 30, quarter: 90, year: 365 };
    const since = new Date(now.getTime() - ranges[dateRange] * 86400000);
    return orders.filter((o: any) => new Date(o.date || o.created_at) >= since);
  }, [orders, dateRange]);

  const filteredInvoices = useMemo(() => {
    const now = new Date();
    const ranges = { week: 7, month: 30, quarter: 90, year: 365 };
    const since = new Date(now.getTime() - ranges[dateRange] * 86400000);
    return invoices.filter((i: any) => new Date(i.created_at || i.createdAt) >= since);
  }, [invoices, dateRange]);

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const ranges = { week: 7, month: 30, quarter: 90, year: 365 };
    const since = new Date(now.getTime() - ranges[dateRange] * 86400000);
    return expenses.filter((e: any) => new Date(e.date || e.created_at) >= since);
  }, [expenses, dateRange]);

  // Main Stats
  const stats = useMemo(() => {
    const totalRevenue = filteredInvoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
    const totalExpenses = filteredExpenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const totalOrders = filteredOrders.length;
    const deliveredOrders = filteredOrders.filter((o: any) => o.status === "Delivered").length;
    const pendingOrders = filteredOrders.filter((o: any) => o.status === "Pending").length;
    const cancelledOrders = filteredOrders.filter((o: any) => o.status === "Cancelled").length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const conversionRate = totalOrders > 0 ? (deliveredOrders / totalOrders * 100) : 0;
    const lowStockProducts = products.filter((p: any) => (p.stock || 0) <= (p.minStock || 10) && (p.stock || 0) > 0).length;
    const outOfStock = products.filter((p: any) => (p.stock || 0) === 0).length;
    const totalStock = products.reduce((s: number, p: any) => s + (p.stock || 0), 0);
    return {
      totalRevenue, totalExpenses, netProfit, totalOrders, deliveredOrders,
      pendingOrders, cancelledOrders, avgOrderValue, conversionRate,
      lowStockProducts, outOfStock, totalStock,
    };
  }, [filteredOrders, filteredInvoices, filteredExpenses, products]);

  // Revenue by day chart
  const revenueByDay = useMemo(() => {
    const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const grouped: Record<string, number> = {};
    filteredInvoices.forEach((i: any) => {
      const d = new Date(i.created_at || i.createdAt);
      const key = days[d.getDay()];
      grouped[key] = (grouped[key] || 0) + (i.total || 0);
    });
    return days.map(d => ({ name: d, الإيرادات: grouped[d] || 0 }));
  }, [filteredInvoices]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filteredOrders.forEach((o: any) => {
      const items = o.items || [];
      items.forEach((item: any) => {
        const name = item.name || item.productName || "منتج";
        if (!productSales[name]) productSales[name] = { name, quantity: 0, revenue: 0 };
        productSales[name].quantity += item.quantity || 1;
        productSales[name].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [filteredOrders]);

  // Category distribution
  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    products.forEach(p => { const c = p.category || "بدون فئة"; cats[c] = (cats[c] || 0) + 1; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [products]);

  // Order status pie
  const orderStatusPie = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOrders.forEach(o => { const s = o.status || "Pending"; counts[s] = (counts[s] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_MAP[status] || status, value: count, color: STATUS_COLOR[status] || "#94a3b8",
    }));
  }, [filteredOrders]);

  // Expenses by category
  const expensesByCategory = useMemo(() => {
    const cats: Record<string, number> = {};
    filteredExpenses.forEach((e: any) => { const c = e.category || "أخرى"; cats[c] = (cats[c] || 0) + (e.amount || 0); });
    return Object.entries(cats).map(([name, amount]) => ({ name, المبلغ: amount })).sort((a, b) => b.المبلغ - a.المبلغ);
  }, [filteredExpenses]);

  // Monthly trend (composed chart)
  const monthlyTrend = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      const monthIdx = d.getMonth();
      const monthInvs = filteredInvoices.filter((inv: any) => { const dd = new Date(inv.created_at || inv.createdAt); return dd.getMonth() === monthIdx && dd.getFullYear() === d.getFullYear(); });
      const monthExps = filteredExpenses.filter((exp: any) => { const dd = new Date(exp.date || exp.created_at); return dd.getMonth() === monthIdx && dd.getFullYear() === d.getFullYear(); });
      const monthOrds = filteredOrders.filter((o: any) => { const dd = new Date(o.date || o.created_at); return dd.getMonth() === monthIdx && dd.getFullYear() === d.getFullYear(); });
      return {
        name: months[monthIdx],
        الإيرادات: monthInvs.reduce((s: number, inv: any) => s + (inv.total || 0), 0),
        المصروفات: monthExps.reduce((s: number, exp: any) => s + (exp.amount || 0), 0),
        الأوردرات: monthOrds.length,
      };
    });
  }, [filteredInvoices, filteredExpenses, filteredOrders]);

  const formatCurrency = (n: number) => n.toLocaleString("ar-EG", { maximumFractionDigits: 0 });

  const handleExport = () => {
    const data = filteredOrders.map((o: any) => ({
      "رقم الأوردر": o.orderNumber || o.id?.slice(0, 8),
      "الزبون": o.customerName || o.customer || "—",
      "المبلغ": o.total || 0,
      "الحالة": STATUS_MAP[o.status] || o.status,
      "التاريخ": new Date(o.date || o.created_at).toLocaleDateString("ar-EG"),
    }));
    exportToExcel(data, `تقرير-${dateRange}-${new Date().toISOString().slice(0, 10)}`);
  };

  const StatCard = ({ label, value, icon: Icon, color, change, changeUp, sub }: any) => (
    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border/60 hover:shadow-lg hover:border-border transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold px-2 py-1 rounded-lg ${changeUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {changeUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {change}%
          </span>
        )}
      </div>
      <p className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">{loading ? "..." : value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="space-y-5 sm:space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">التحليلات والتقارير</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            آخر تحديث: {lastUpdated.toLocaleTimeString("ar-EG")} • {filteredOrders.length} أوردر في الفترة المحددة
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex bg-muted rounded-lg p-0.5 flex-1 sm:flex-none">
            {(["week", "month", "quarter", "year"] as const).map((r) => (
              <button key={r} onClick={() => setDateRange(r)}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all ${dateRange === r ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {r === "week" ? "أسبوع" : r === "month" ? "شهر" : r === "quarter" ? "3 شهور" : "سنة"}
              </button>
            ))}
          </div>
          <button onClick={fetchData} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors">
            <Download className="w-3.5 h-3.5" /> تصدير
          </button>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="إجمالي الإيرادات" value={`${formatCurrency(stats.totalRevenue)} ج.م`} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" sub={`${filteredInvoices.length} فاتورة`} />
        <StatCard label="إجمالي المصروفات" value={`${formatCurrency(stats.totalExpenses)} ج.م`} icon={Wallet} color="bg-red-50 text-red-600" sub={`${filteredExpenses.length} مصروف`} />
        <StatCard label="الربح الصافي" value={`${formatCurrency(stats.netProfit)} ج.م`} icon={stats.netProfit >= 0 ? TrendingUp : TrendingDown} color={stats.netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"} sub={`هامش ${(stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue * 100).toFixed(1) : 0)}%`} />
        <StatCard label="متوسط قيمة الأوردر" value={`${formatCurrency(stats.avgOrderValue)} ج.م`} icon={DollarSign} color="bg-blue-50 text-blue-600" sub={`${stats.totalOrders} أوردر`} />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="الأوردرات المكتملة" value={stats.deliveredOrders} icon={PackageCheck} color="bg-emerald-50 text-emerald-600" sub={`${stats.conversionRate.toFixed(0)}% نسبة التحويل`} />
        <StatCard label="الأوردرات المعلّقة" value={stats.pendingOrders} icon={Clock} color="bg-amber-50 text-amber-600" />
        <StatCard label="الزبائن" value={customers.length} icon={Users} color="bg-purple-50 text-purple-600" />
        <StatCard label="مخزون منخفض" value={stats.lowStockProducts + stats.outOfStock} icon={AlertTriangle} color={stats.lowStockProducts > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"} sub={`${stats.outOfStock} نفد`} />
      </div>

      {/* Revenue + Expense Trend (Composed Chart) */}
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border/60 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground text-sm sm:text-base">الإيرادات والمصروفات</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">آخر 6 شهور</p>
          </div>
          <div className="flex items-center gap-3 text-[10px] sm:text-xs">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> الإيراد</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> المصروفات</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> الأوردرات</span>
          </div>
        </div>
        {loading ? (
          <div className="h-[200px] sm:h-[300px] flex items-center justify-center text-muted-foreground text-sm">بيتحمّل...</div>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={monthlyTrend}>
              <defs>
                <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={40} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
              <Area yAxisId="left" type="monotone" dataKey="الإيرادات" fill="url(#colorRevenue2)" stroke="#10b981" strokeWidth={2} />
              <Bar yAxisId="left" dataKey="المصروفات" fill="#fecaca" radius={[4, 4, 0, 0]} barSize={20} />
              <Line yAxisId="right" type="monotone" dataKey="الأوردرات" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Order Status Pie */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border/60 p-4 sm:p-5">
          <h3 className="font-bold text-foreground text-sm sm:text-base mb-4">حالة الأوردرات</h3>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">بيتحمّل...</div>
          ) : orderStatusPie.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">مفيش بيانات</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={orderStatusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {orderStatusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border/60 p-4 sm:p-5">
          <h3 className="font-bold text-foreground text-sm sm:text-base mb-4">المنتجات الأكثر مبيعاً</h3>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">بيتحمّل...</div>
          ) : topProducts.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">مفيش بيانات مبيعات</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="revenue" name="المبيعات" fill="#f97316" radius={[0, 6, 6, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Distribution */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border/60 p-4 sm:p-5">
          <h3 className="font-bold text-foreground text-sm sm:text-base mb-4">المنتجات حسب الصنف</h3>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">بيتحمّل...</div>
          ) : categoryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">مفيش منتجات</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} angle={-30} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="value" name="المنتجات" radius={[6, 6, 0, 0]} barSize={24}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-card rounded-xl sm:rounded-2xl border border-border/60 p-4 sm:p-5">
          <h3 className="font-bold text-foreground text-sm sm:text-base mb-4">المصروفات حسب النوع</h3>
          {loading ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">بيتحمّل...</div>
          ) : expensesByCategory.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-xs">مفيش مصروفات</div>
          ) : (
            <div className="space-y-3">
              {expensesByCategory.slice(0, 6).map((cat, i) => {
                const maxAmount = Math.max(...expensesByCategory.map(c => c.المبلغ), 1);
                const pct = (cat.المبلغ / maxAmount) * 100;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-foreground">{cat.name}</span>
                      <span className="text-xs text-muted-foreground">{formatCurrency(cat.المبلغ)} ج.م</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Insights */}
      <div className="bg-gradient-to-l from-primary/5 to-white rounded-xl sm:rounded-2xl border border-primary/10 p-4 sm:p-5">
        <h3 className="font-bold text-foreground text-sm sm:text-base mb-3">رؤى سريعة</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stats.netProfit > 0 && (
            <div className="flex items-start gap-2 bg-emerald-50 rounded-xl p-3">
              <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-emerald-800">الربح إيجابي</p>
                <p className="text-[10px] text-emerald-600">عندك أرباح {formatCurrency(stats.netProfit)} ج.م في الفترة دي</p>
              </div>
            </div>
          )}
          {stats.lowStockProducts > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-amber-800">مخزون قليل</p>
                <p className="text-[10px] text-amber-600">{stats.lowStockProducts} منتجات مخزونها قليل — حدّدهم</p>
              </div>
            </div>
          )}
          {stats.outOfStock > 0 && (
            <div className="flex items-start gap-2 bg-red-50 rounded-xl p-3">
              <Package className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-red-800">نفد المخزون</p>
                <p className="text-[10px] text-red-600">{stats.outOfStock} منتجات خلصت — لازم تطلب</p>
              </div>
            </div>
          )}
          {stats.pendingOrders > 0 && (
            <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
              <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-800">أوردرات معلّقة</p>
                <p className="text-[10px] text-blue-600">{stats.pendingOrders} أوردرات مستنية معالجة</p>
              </div>
            </div>
          )}
          {stats.conversionRate > 80 && (
            <div className="flex items-start gap-2 bg-purple-50 rounded-xl p-3">
              <PackageCheck className="w-4 h-4 text-purple-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-purple-800">نسبة تحويل ممتازة</p>
                <p className="text-[10px] text-purple-600">{stats.conversionRate.toFixed(0)}% من الأوردرات اتوصّلت</p>
              </div>
            </div>
          )}
          {stats.totalOrders > 0 && (
            <div className="flex items-start gap-2 bg-cyan-50 rounded-xl p-3">
              <BarChart3 className="w-4 h-4 text-cyan-600 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-cyan-800">متوسط الأوردرات</p>
                <p className="text-[10px] text-cyan-600">{stats.totalOrders} أوردر بمتوسط {formatCurrency(stats.avgOrderValue)} ج.م</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
