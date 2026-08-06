"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, Users, FileText, CreditCard, TrendingUp,
  TrendingDown, ArrowUpRight, ArrowDownRight, AlertTriangle,
  Plus, Eye, BarChart3, Wallet, Truck, RotateCcw, Clock,
  CheckCircle, XCircle, ChevronLeft, Search, Bell, Star,
  PackageCheck, Receipt, UserCog, CalendarDays, Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { getDocsFromCollection } from "@/lib/localdb";
import { DashboardSkeleton } from "@/components/Skeleton";

const STATUS_MAP: Record<string, string> = {
  Delivered: "اتسلّم", Shipped: "اتشحن", Processing: "بيتعالج", Pending: "معلّق", Cancelled: "ملغي",
};
const STATUS_STYLE: Record<string, string> = {
  Delivered: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  Shipped: "bg-blue-50 text-blue-600 border border-blue-200",
  Processing: "bg-amber-50 text-amber-600 border border-amber-200",
  Pending: "bg-slate-50 text-slate-600 border border-slate-200",
  Cancelled: "bg-red-50 text-red-600 border border-red-200",
};
const INVOICE_STATUS: Record<string, { label: string; style: string }> = {
  paid: { label: "مدفوعة", style: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
  partial: { label: "جزئي", style: "bg-amber-50 text-amber-600 border border-amber-200" },
  unpaid: { label: "مش مدفوعة", style: "bg-red-50 text-red-600 border border-red-200" },
};

const CHART_COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [storeName, setStoreName] = useState("");
  const [features, setFeatures] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    const storedPrefs = JSON.parse(localStorage.getItem("user_prefs") || "null");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const store = JSON.parse(localStorage.getItem("store") || "{}");
    setStoreName(store.name || storedPrefs?.storeName || "");
    setFeatures(storedPrefs?.features || ["products", "orders", "invoices", "customers", "inventory"]);

    const fetchData = async () => {
      try {
        const sid = user.storeId;
        const f = (field: string) => sid ? [{ field: "storeId", op: "==", value: sid }] : [];
        const has = (feat: string) => (storedPrefs?.features || []).includes(feat);

        const [prods, ords, custs, invs, exps, emps] = await Promise.all([
          has("products") ? getDocsFromCollection("products", f("storeId")) : [],
          has("orders") ? getDocsFromCollection("orders", f("storeId")) : [],
          has("customers") ? getDocsFromCollection("customers", f("storeId")) : [],
          has("invoices") ? getDocsFromCollection("invoices", f("storeId")) : [],
          has("expenses") ? getDocsFromCollection("expenses", f("storeId")) : [],
          has("employees") ? getDocsFromCollection("employees", f("storeId")) : [],
        ]);

        setProducts(prods); setOrders(ords); setCustomers(custs);
        setInvoices(invs); setExpenses(exps); setEmployees(emps);
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const has = (f: string) => features.includes(f);

  // Stats
  const stats = useMemo(() => {
    const totalRevenue = invoices.reduce((s: number, i: any) => s + (i.total || 0), 0);
    const totalExpenses = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const pendingOrders = orders.filter((o: any) => o.status === "Pending").length;
    const deliveredOrders = orders.filter((o: any) => o.status === "Delivered").length;
    const paidInvoices = invoices.filter((i: any) => i.status === "paid").length;
    const unpaidInvoices = invoices.filter((i: any) => i.status === "unpaid").length;
    const lowStockProducts = products.filter((p: any) => (p.stock || 0) <= (p.minStock || 10) && (p.stock || 0) > 0).length;
    const outOfStock = products.filter((p: any) => (p.stock || 0) === 0).length;
    return { totalRevenue, totalExpenses, netProfit, pendingOrders, deliveredOrders, paidInvoices, unpaidInvoices, lowStockProducts, outOfStock };
  }, [invoices, expenses, orders, products]);

  // Charts data
  const revenueVsExpensesChart = useMemo(() => {
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const data = months.slice(0, 6).map((m, i) => {
      const monthInvs = invoices.filter(inv => { const d = new Date(inv.created_at || inv.createdAt); return d.getMonth() === i; });
      const monthExps = expenses.filter(exp => { const d = new Date(exp.date || exp.created_at); return d.getMonth() === i; });
      return { name: m, الإيراد: monthInvs.reduce((s, inv) => s + (inv.total || 0), 0), المصروفات: monthExps.reduce((s, exp) => s + (exp.amount || 0), 0) };
    });
    return data;
  }, [invoices, expenses]);

  const orderStatusPie = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.status || "Pending"] = (counts[o.status || "Pending"] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ name: STATUS_MAP[status] || status, value: count }));
  }, [orders]);

  const categoryPie = useMemo(() => {
    const cats: Record<string, number> = {};
    products.forEach(p => { const cat = p.category || "بدون فئة"; cats[cat] = (cats[cat] || 0) + 1; });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [products]);

  const recentOrders = orders.slice(0, 6);
  const recentInvoices = invoices.slice(0, 5);
  const lowStockProducts = products.filter((p: any) => (p.stock || 0) <= (p.minStock || 10)).slice(0, 5);

  const formatCurrency = (n: number) => n.toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const StatCard = ({ label, value, icon: Icon, color, trend, trendUp, link }: any) => (
    <Link href={link || "#"} className="bg-card rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-border/60 hover:shadow-lg hover:border-border transition-all duration-300 group block">
      <div className="flex items-start justify-between mb-2 sm:mb-4">
        <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6" />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg ${trendUp ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
            {trendUp ? <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> : <ArrowDownRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
            {trend}
          </span>
        )}
      </div>
      <p className="text-lg sm:text-2xl font-bold text-foreground mb-0.5 sm:mb-1 tracking-tight leading-tight">{loading ? "..." : value}</p>
      <p className="text-xs sm:text-sm text-muted-foreground truncate">{label}</p>
      {link && (
        <div className="flex items-center gap-1 mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span>عرض التفاصيل</span>
          <ChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </div>
      )}
    </Link>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {loading ? (
        <DashboardSkeleton />
      ) : (<>
      {/* Welcome Header */}
      <div className="bg-gradient-to-l from-primary/10 via-orange-50/50 to-white rounded-2xl p-4 sm:p-6 border border-primary/10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-foreground tracking-tight">
              {storeName ? `مرحباً بيك في ${storeName}` : "مرحباً بيك!"}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2 text-xs sm:text-sm">
              <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link href="/dashboard/products" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-hover transition-colors shadow-md shadow-primary/20">
              <Plus className="w-4 h-4" /> <span className="hidden xs:inline">منتج جديد</span><span className="xs:hidden">منتج</span>
            </Link>
            <Link href="/dashboard/orders" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-foreground px-4 py-2.5 rounded-xl text-sm font-semibold border border-border hover:bg-muted transition-colors">
              <ShoppingCart className="w-4 h-4" /> <span className="hidden xs:inline">أوردر جديد</span><span className="xs:hidden">أوردر</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {has("invoices") && (
          <StatCard label="إجمالي الإيرادات" value={`${formatCurrency(stats.totalRevenue)} ج.م`} icon={TrendingUp} color="bg-emerald-50 text-emerald-600" link="/dashboard/invoices" />
        )}
        {has("orders") && (
          <StatCard label="الأوردرات المعلّقة" value={stats.pendingOrders} icon={Clock} color="bg-amber-50 text-amber-600" link="/dashboard/orders" />
        )}
        {has("products") && (
          <StatCard label="المنتجات" value={products.length} icon={Package} color="bg-blue-50 text-blue-600" link="/dashboard/products" />
        )}
        {has("customers") && (
          <StatCard label="الزبائن" value={customers.length} icon={Users} color="bg-purple-50 text-purple-600" link="/dashboard/customers" />
        )}
        {has("expenses") && (
          <StatCard label="المصروفات" value={`${formatCurrency(stats.totalExpenses)} ج.م`} icon={Wallet} color="bg-red-50 text-red-600" link="/dashboard/expenses" />
        )}
        {has("expenses") && (
          <StatCard label="الربح الصافي" value={`${formatCurrency(stats.netProfit)} ج.م`} icon={stats.netProfit >= 0 ? TrendingUp : TrendingDown} color={stats.netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"} />
        )}
        {has("invoices") && (
          <StatCard label="فواتير مدفوعة" value={stats.paidInvoices} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" link="/dashboard/invoices" />
        )}
        {has("products") && (
          <StatCard label="مخزون قليل" value={stats.lowStockProducts + stats.outOfStock} icon={AlertTriangle} color={stats.lowStockProducts > 0 ? "bg-amber-50 text-amber-600" : "bg-gray-50 text-gray-400"} link="/dashboard/inventory" />
        )}
      </div>

      {/* Charts Row */}
      {(has("invoices") || has("expenses") || has("orders") || has("products")) && (
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Revenue vs Expenses Chart */}
          {has("invoices") && has("expenses") && (
            <div className="lg:col-span-2 bg-card rounded-xl sm:rounded-2xl border border-border/60 p-4 sm:p-5">
              <div className="flex items-center justify-between mb-4 sm:mb-5">
                <div>
                  <h3 className="font-bold text-foreground text-sm sm:text-base">الإيرادات مقابل المصروفات</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">آخر 6 شهور</p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
                  <span className="flex items-center gap-1 sm:gap-1.5"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-primary" /> الإيراد</span>
                  <span className="flex items-center gap-1 sm:gap-1.5"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-red-400" /> المصروفات</span>
                </div>
              </div>
              {loading ? (
                <div className="h-[180px] sm:h-[250px] flex items-center justify-center text-gray-400 text-sm">بيتحمّل...</div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={revenueVsExpensesChart}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    <Area type="monotone" dataKey="الإيراد" stroke="#f97316" strokeWidth={2} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="المصروفات" stroke="#ef4444" strokeWidth={2} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* Order Status Pie */}
          {has("orders") && (
            <div className="bg-card rounded-xl sm:rounded-2xl border border-border/60 p-4 sm:p-5">
              <h3 className="font-bold text-foreground mb-4 sm:mb-5 text-sm sm:text-base">حالة الأوردرات</h3>
              {loading ? (
                <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">بيتحمّل...</div>
              ) : orderStatusPie.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-10 h-10 mb-2" />
                  <p className="text-sm">مفيش أوردرات لسه</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={orderStatusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                        {orderStatusPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-3 mt-2">
                    {orderStatusPie.map((item, i) => (
                      <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                        {item.name} ({item.value})
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Category Pie */}
          {has("products") && !has("orders") && (
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
              <h3 className="font-bold text-gray-900 mb-5">المنتجات حسب الفئة</h3>
              {loading ? (
                <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">بيتحمّل...</div>
              ) : categoryPie.length === 0 ? (
                <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
                  <Package className="w-10 h-10 mb-2" />
                  <p className="text-sm">مفيش منتجات لسه</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={categoryPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {categoryPie.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tables Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        {has("orders") && (
          <div className="lg:col-span-2 bg-card rounded-2xl border border-border/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">آخر الأوردرات</h3>
                  <p className="text-xs text-muted-foreground">{orders.length} أوردر الكلي</p>
                </div>
              </div>
              <Link href="/dashboard/orders" className="text-primary text-sm font-semibold hover:text-primary-hover flex items-center gap-1">
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">رقم الطلب</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">العميل</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">الحالة</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">المجموع</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
                  ) : recentOrders.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground text-sm">مفيش أوردرات لسه — ابدأ بإضافة أوردر جديد</td></tr>
                  ) : recentOrders.map((order: any, i: number) => (
                    <tr key={order.id || i} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-foreground">{order.orderNumber || order.id?.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{order.customerName || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[order.status] || STATUS_STYLE.Pending}`}>
                          {STATUS_MAP[order.status] || order.status || "معلّق"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-foreground">{(order.total || 0).toLocaleString("ar-EG")} ج.م</td>
                      <td className="px-5 py-3 text-xs text-muted-foreground">{order.date || new Date(order.created_at).toLocaleDateString("ar-EG")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Low Stock Alert */}
        {has("products") && (
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">مخزون قليل</h3>
                  <p className="text-xs text-muted-foreground">{lowStockProducts.length} منتج محتاج تعبئة</p>
                </div>
              </div>
              <Link href="/dashboard/inventory" className="text-primary text-sm font-semibold hover:text-primary-hover flex items-center gap-1">
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-3">
              {loading ? (
                <p className="text-center text-muted-foreground text-sm py-6">بيتحمّل...</p>
              ) : lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <PackageCheck className="w-10 h-10 text-emerald-300 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">المخزون كله تمام!</p>
                </div>
              ) : lowStockProducts.map((product: any, i: number) => (
                <div key={product.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${(product.stock || 0) === 0 ? "bg-red-50" : "bg-amber-50"}`}>
                    <Package className={`w-5 h-5 ${(product.stock || 0) === 0 ? "text-red-500" : "text-amber-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="text-left">
                    <span className={`text-sm font-bold ${(product.stock || 0) === 0 ? "text-red-500" : "text-amber-600"}`}>
                      {product.stock || 0}
                    </span>
                    <p className="text-[10px] text-muted-foreground">المتبقي</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Invoices */}
        {has("invoices") && (
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">آخر الفواتير</h3>
                  <p className="text-xs text-muted-foreground">{invoices.length} فاتورة الكلي</p>
                </div>
              </div>
              <Link href="/dashboard/invoices" className="text-primary text-sm font-semibold hover:text-primary-hover flex items-center gap-1">
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">رقم الفاتورة</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">العميل</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">الحالة</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground px-5 py-3">المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">بيتحمّل...</td></tr>
                  ) : recentInvoices.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground text-sm">مفيش فواتير لسه</td></tr>
                  ) : recentInvoices.map((inv: any, i: number) => (
                    <tr key={inv.id || i} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold text-foreground">{inv.invoiceNumber || inv.id?.slice(0, 8)}</td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{inv.customerName || "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${INVOICE_STATUS[inv.status]?.style || INVOICE_STATUS.unpaid.style}`}>
                          {INVOICE_STATUS[inv.status]?.label || inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm font-bold text-foreground">{(inv.total || 0).toLocaleString("ar-EG")} ج.م</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Products */}
        {has("products") && (
          <div className="bg-card rounded-2xl border border-border/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">المنتجات</h3>
                  <p className="text-xs text-muted-foreground">{products.length} منتج الكلي</p>
                </div>
              </div>
              <Link href="/dashboard/products" className="text-primary text-sm font-semibold hover:text-primary-hover flex items-center gap-1">
                عرض الكل <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-3">
              {loading ? (
                <p className="text-center text-muted-foreground text-sm py-6">بيتحمّل...</p>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">مفيش منتجات لسه</p>
                  <Link href="/dashboard/products" className="text-primary text-sm font-semibold hover:underline mt-2 inline-block">إضافة منتج</Link>
                </div>
              ) : products.slice(0, 6).map((product: any, i: number) => (
                <div key={product.id || i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.category || product.sku}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-primary">{(product.price || 0).toLocaleString("ar-EG")} ج.م</p>
                    <p className="text-[10px] text-muted-foreground">مخزون: {product.stock || 0}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-l from-muted/50 to-white rounded-2xl border border-border/60 p-5">
        <h3 className="font-bold text-foreground mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {[
            { label: "نقطة البيع", icon: CreditCard, href: "/dashboard/pos", color: "bg-primary/10 text-primary" },
            { label: "إضافة منتج", icon: Package, href: "/dashboard/products", color: "bg-blue-50 text-blue-600" },
            { label: "أوردر جديد", icon: ShoppingCart, href: "/dashboard/orders", color: "bg-emerald-50 text-emerald-600" },
            { label: "فاتورة جديدة", icon: FileText, href: "/dashboard/invoices", color: "bg-indigo-50 text-indigo-600" },
            { label: "إضافة زبون", icon: Users, href: "/dashboard/customers", color: "bg-purple-50 text-purple-600" },
            { label: "تسجيل مصروف", icon: Wallet, href: "/dashboard/expenses", color: "bg-red-50 text-red-600" },
          ].map((action) => (
            <Link key={action.href} href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border/60 hover:shadow-md hover:border-border transition-all group">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-foreground">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
      </>)}
    </div>
  );
}
