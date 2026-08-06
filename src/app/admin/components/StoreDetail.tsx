"use client";

import { useMemo } from "react";
import { X, Store, Package, ShoppingCart, Users, Receipt, TrendingUp, Wallet, MapPin, Calendar, CreditCard } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"];

interface StoreDetailProps {
  store: any;
  products: any[];
  orders: any[];
  customers: any[];
  invoices: any[];
  expenses: any[];
  employees: any[];
  onClose: () => void;
}

export default function StoreDetail({ store, products, orders, customers, invoices, expenses, employees, onClose }: StoreDetailProps) {
  const storeProducts = useMemo(() => products.filter((p) => p.store_id === store.id), [products, store]);
  const storeOrders = useMemo(() => orders.filter((o) => o.store_id === store.id), [orders, store]);
  const storeCustomers = useMemo(() => customers.filter((c) => c.store_id === store.id), [customers, store]);
  const storeInvoices = useMemo(() => invoices.filter((i) => i.store_id === store.id), [invoices, store]);
  const storeExpenses = useMemo(() => expenses.filter((e) => e.store_id === store.id), [expenses, store]);
  const storeEmployees = useMemo(() => employees.filter((e) => e.store_id === store.id), [employees, store]);

  const totalRevenue = useMemo(() => storeOrders.reduce((s, o) => s + (o.total || 0), 0), [storeOrders]);
  const totalExpenses = useMemo(() => storeExpenses.reduce((s, e) => s + (e.amount || 0), 0), [storeExpenses]);
  const netProfit = totalRevenue - totalExpenses;

  const topProducts = useMemo(() =>
    storeProducts.sort((a, b) => (b.stock || 0) - (a.stock || 0)).slice(0, 6).map((p) => ({
      name: p.name?.length > 12 ? p.name.slice(0, 12) + "..." : p.name,
      stock: p.stock || 0,
      price: p.price || 0,
    })),
  [storeProducts]);

  const orderStatusData = useMemo(() => {
    const map: Record<string, number> = {};
    storeOrders.forEach((o) => {
      map[o.status || "Other"] = (map[o.status || "Other"] || 0) + 1;
    });
    const labels: Record<string, string> = { Completed: "مكتمل", Pending: "معلق", Cancelled: "ملغي", Processing: "قيد التنفيذ" };
    return Object.entries(map).map(([s, c]) => ({ name: labels[s] || s, value: c }));
  }, [storeOrders]);

  const expenseCategories = useMemo(() => {
    const map: Record<string, number> = {};
    storeExpenses.forEach((e) => {
      map[e.category || "أخرى"] = (map[e.category || "أخرى"] || 0) + (e.amount || 0);
    });
    const catLabels: Record<string, string> = { rent: "إيجار", utilities: "مرافق", salaries: "رواتب", supplies: "مستلزمات", marketing: "تسويق", other: "أخرى" };
    return Object.entries(map).map(([c, v]) => ({ name: catLabels[c] || c, value: v })).sort((a, b) => b.value - a.value);
  }, [storeExpenses]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden mx-4 border border-slate-700/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Store className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{store.name}</h3>
              <p className="text-sm text-slate-400">{store.owner_name} - {store.owner_email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          {/* Store Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">المالك</p>
              <p className="text-sm text-white font-medium">{store.owner_name || "—"}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">الهاتف</p>
              <p className="text-sm text-white font-medium">{store.phone || "—"}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">المدينة</p>
              <p className="text-sm text-white font-medium flex items-center gap-1"><MapPin className="w-3 h-3 text-orange-400" />{store.city || "—"}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">العملة</p>
              <p className="text-sm text-white font-medium">{store.currency || "ج.م"}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">تاريخ الإنشاء</p>
              <p className="text-sm text-white font-medium flex items-center gap-1"><Calendar className="w-3 h-3 text-blue-400" />{store.created_at ? new Date(store.created_at).toLocaleDateString("ar-EG") : "—"}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">الدورات</p>
              <p className={`text-sm font-medium ${store.onboarding_done ? "text-green-400" : "text-amber-400"}`}>{store.onboarding_done ? "مكتملة" : "غير مكتملة"}</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">الميزات المفعلة</p>
              <p className="text-sm text-white font-medium">{store.enabled_features?.length || 15} ميزة</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-xs text-slate-500">ملاحظات</p>
              <p className="text-sm text-white font-medium truncate">{store.notes || "—"}</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <TrendingUp className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-emerald-400">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-slate-400">الإيرادات (ج.م)</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <Wallet className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-red-400">{totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-slate-400">المصروفات (ج.م)</p>
            </div>
            <div className={`border rounded-xl p-4 text-center ${netProfit >= 0 ? "bg-blue-500/10 border-blue-500/20" : "bg-red-500/10 border-red-500/20"}`}>
              <CreditCard className={`w-5 h-5 mx-auto mb-1 ${netProfit >= 0 ? "text-blue-400" : "text-red-400"}`} />
              <p className={`text-xl font-bold ${netProfit >= 0 ? "text-blue-400" : "text-red-400"}`}>{netProfit.toLocaleString()}</p>
              <p className="text-xs text-slate-400">صافي الربح (ج.م)</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 text-center">
              <ShoppingCart className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-xl font-bold text-purple-400">{storeOrders.length}</p>
              <p className="text-xs text-slate-400">الأوردرات</p>
            </div>
          </div>

          {/* Counts Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Package className="w-5 h-5 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{storeProducts.length}</p>
              <p className="text-xs text-slate-500">المنتجات</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{storeCustomers.length}</p>
              <p className="text-xs text-slate-500">الزبائن</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Receipt className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{storeInvoices.length}</p>
              <p className="text-xs text-slate-500">الفواتير</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Wallet className="w-5 h-5 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{storeExpenses.length}</p>
              <p className="text-xs text-slate-500">المصروفات</p>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3 text-center">
              <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-white">{storeEmployees.length}</p>
              <p className="text-xs text-slate-500">الموظفين</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top Products */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">المنتجات</h4>
              {topProducts.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">لا توجد منتجات</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", fontSize: "11px" }} />
                    <Bar dataKey="stock" fill="#10b981" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Order Status */}
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">حالة الأوردرات</h4>
              {orderStatusData.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-8">لا توجد أوردرات</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-slate-800/30 rounded-xl p-4">
            <h4 className="text-sm font-bold text-white mb-3">أحدث الأوردرات</h4>
            {storeOrders.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">لا توجد أوردرات</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {storeOrders.slice(0, 8).map((o) => (
                  <div key={o.id} className="flex items-center justify-between py-2 px-3 bg-slate-900/50 rounded-lg text-xs">
                    <div>
                      <span className="text-white font-medium">{o.order_number}</span>
                      <span className="text-slate-500 mr-2">{o.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-orange-400 font-bold">{o.total?.toLocaleString()} ج.م</span>
                      <span className={`px-2 py-0.5 rounded-full ${
                        o.status === "Completed" ? "bg-green-500/20 text-green-400" :
                        o.status === "Pending" ? "bg-amber-500/20 text-amber-400" :
                        "bg-slate-500/20 text-slate-400"
                      }`}>
                        {o.status === "Completed" ? "مكتمل" : o.status === "Pending" ? "معلق" : o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Employees */}
          {storeEmployees.length > 0 && (
            <div className="bg-slate-800/30 rounded-xl p-4">
              <h4 className="text-sm font-bold text-white mb-3">الموظفين ({storeEmployees.length})</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {storeEmployees.slice(0, 8).map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 px-3 bg-slate-900/50 rounded-lg text-xs">
                    <div>
                      <span className="text-white font-medium">{e.name}</span>
                      <span className="text-slate-500 mr-2">{e.position}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400">{e.department}</span>
                      <span className="text-emerald-400 font-bold">{e.salary?.toLocaleString()} ج.م</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
