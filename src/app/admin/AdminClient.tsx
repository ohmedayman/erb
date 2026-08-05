"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Warehouse, Users, Package, ShoppingCart, Receipt, CreditCard,
  Wallet, UserCog, TrendingUp, BarChart3, Clock, CheckCircle,
  XCircle, Eye, RefreshCw, Shield, LogOut, Search, ChevronDown,
  DollarSign, AlertCircle, Building2, Truck, FileText, Bell,
  Settings, Home, ArrowLeft, Loader2, Database, Download
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getDocsFromCollection } from "@/lib/localdb";

const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com"];

const TABS = [
  { id: "overview", label: "نظرة عامة", icon: Home },
  { id: "orders", label: "طلبات الدفع", icon: CreditCard },
  { id: "users", label: "المستخدمين", icon: Users },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "customers", label: "الزبائن", icon: UserCog },
  { id: "invoices", label: "الفواتير", icon: Receipt },
  { id: "expenses", label: "المصروفات", icon: Wallet },
];

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalOrders: 0,
    totalInvoices: 0,
    totalExpenses: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    totalRevenue: 0,
  });

  const [subscriptionOrders, setSubscriptionOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      router.push("/login");
      return;
    }

    const email = user.email?.toLowerCase() || "";
    if (!ADMIN_EMAILS.includes(email)) {
      setIsAdmin(false);
      setChecked(true);
      return;
    }

    setIsAdmin(true);
    setChecked(true);
    loadAllData();
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [subOrders, prods, custs, ords, invs, exps] = await Promise.all([
        getDocsFromCollection("subscription_orders"),
        getDocsFromCollection("products"),
        getDocsFromCollection("customers"),
        getDocsFromCollection("orders"),
        getDocsFromCollection("invoices"),
        getDocsFromCollection("expenses"),
      ]);

      setSubscriptionOrders(subOrders);
      setProducts(prods);
      setCustomers(custs);
      setOrders(ords);
      setInvoices(invs);
      setExpenses(exps);

      setStats({
        totalUsers: subOrders.length,
        totalProducts: prods.length,
        totalCustomers: custs.length,
        totalOrders: ords.length,
        totalInvoices: invs.length,
        totalExpenses: exps.length,
        pendingOrders: subOrders.filter((o: any) => o.status === "pending").length,
        approvedOrders: subOrders.filter((o: any) => o.status === "approved").length,
        totalRevenue: subOrders
          .filter((o: any) => o.status === "approved")
          .reduce((sum: number, o: any) => sum + (o.plan_price || 0), 0),
      });
    } catch (err) {
      console.error("Error loading admin data:", err);
    }
    setLoading(false);
  };

  const handleApproveOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      const { error } = await supabase
        .from("subscription_orders")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          admin_note: adminNote || "تم التأكيد",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;
      await loadAllData();
      setSelectedOrder(null);
      setAdminNote("");
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleRejectOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const { error } = await supabase
        .from("subscription_orders")
        .update({
          status: "rejected",
          admin_note: adminNote || "مرفوض",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      if (error) throw error;
      await loadAllData();
      setSelectedOrder(null);
      setAdminNote("");
    } catch (err) {
      console.error(err);
    }
    setActionLoading(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!checked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-border p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">غير مصرح لك</h1>
          <p className="text-muted-foreground mb-6">صفحة الادمن متاحة لصاحب المنصة فقط</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-hover transition-all"
          >
            <Home className="w-5 h-5" />
            رجوع للبورد
          </Link>
        </div>
      </div>
    );
  }

  const filteredSubscriptionOrders = subscriptionOrders.filter(o => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      o.user_name?.toLowerCase().includes(term) ||
      o.user_email?.toLowerCase().includes(term) ||
      o.transaction_id?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">لوحة تحكم الادمن</h1>
              <p className="text-xs text-muted-foreground">StockFlow Admin Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="تحديث"
            >
              <RefreshCw className="w-5 h-5 text-muted-foreground" />
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              البورد
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/25"
                  : "bg-white text-muted-foreground border border-border hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "orders" && stats.pendingOrders > 0 && (
                <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "المستخدمين", value: stats.totalUsers, icon: Users, color: "from-blue-500 to-blue-600" },
                    { label: "المنتجات", value: stats.totalProducts, icon: Package, color: "from-green-500 to-green-600" },
                    { label: "الزبائن", value: stats.totalCustomers, icon: UserCog, color: "from-purple-500 to-purple-600" },
                    { label: "الأوردرات", value: stats.totalOrders, icon: ShoppingCart, color: "from-orange-500 to-orange-600" },
                    { label: "الفواتير", value: stats.totalInvoices, icon: Receipt, color: "from-red-500 to-red-600" },
                    { label: "المصروفات", value: stats.totalExpenses, icon: Wallet, color: "from-yellow-500 to-yellow-600" },
                    { label: "طلبات معلقة", value: stats.pendingOrders, icon: Clock, color: "from-yellow-500 to-yellow-600" },
                    { label: "الإيراد", value: `${stats.totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, color: "from-green-500 to-green-600" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-all">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                        <stat.icon className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Subscription Orders */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-foreground">آخر طلبات الدفع</h2>
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="text-sm text-primary hover:text-primary-hover transition-colors"
                    >
                      عرض الكل
                    </button>
                  </div>
                  {subscriptionOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">مفيش طلبات دفع</p>
                  ) : (
                    <div className="space-y-3">
                      {subscriptionOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-colors"
                          onClick={() => { setSelectedOrder(order); setActiveTab("orders"); }}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              order.status === "approved" ? "bg-green-100 text-green-600" :
                              order.status === "rejected" ? "bg-red-100 text-red-600" :
                              "bg-yellow-100 text-yellow-600"
                            }`}>
                              {order.status === "approved" ? <CheckCircle className="w-4 h-4" /> :
                               order.status === "rejected" ? <XCircle className="w-4 h-4" /> :
                               <Clock className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{order.user_name}</p>
                              <p className="text-xs text-muted-foreground">{order.user_email}</p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-primary">{order.plan_price?.toLocaleString()} ج.م</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="دور بالاسم أو الإيميل..."
                    />
                  </div>
                </div>

                {filteredSubscriptionOrders.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-border p-12 text-center">
                    <CreditCard className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-lg font-medium text-foreground">مفيش طلبات</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredSubscriptionOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl border border-border p-5 hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => { setSelectedOrder(order); setAdminNote(""); }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              order.status === "approved" ? "bg-green-100 text-green-600" :
                              order.status === "rejected" ? "bg-red-100 text-red-600" :
                              "bg-yellow-100 text-yellow-600"
                            }`}>
                              {order.status === "approved" ? <CheckCircle className="w-6 h-6" /> :
                               order.status === "rejected" ? <XCircle className="w-6 h-6" /> :
                               <Clock className="w-6 h-6" />}
                            </div>
                            <div>
                              <h3 className="font-bold text-foreground">{order.user_name}</h3>
                              <p className="text-sm text-muted-foreground">{order.user_email}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                رقم العملية: {order.transaction_id || "—"}
                              </p>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-lg font-bold text-primary">{order.plan_price?.toLocaleString()} ج.م</p>
                            <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.created_at).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">المستخدمين المسجلين ({subscriptionOrders.length})</h2>
                  {subscriptionOrders.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">مفيش مستخدمين مسجلين</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الاسم</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">البريد</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الموبايل</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الخطة</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subscriptionOrders.map((user) => (
                            <tr key={user.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium text-foreground">{user.user_name}</td>
                              <td className="py-3 px-4 text-muted-foreground">{user.user_email}</td>
                              <td className="py-3 px-4 text-muted-foreground">{user.user_phone || "—"}</td>
                              <td className="py-3 px-4 text-muted-foreground">{user.plan_name}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  user.status === "approved" ? "bg-green-100 text-green-700" :
                                  user.status === "rejected" ? "bg-red-100 text-red-700" :
                                  "bg-yellow-100 text-yellow-700"
                                }`}>
                                  {user.status === "approved" ? "مفعل" :
                                   user.status === "rejected" ? "مرفوض" : "معلق"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-muted-foreground text-xs">
                                {new Date(user.created_at).toLocaleDateString("ar-EG")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">المنتجات ({products.length})</h2>
                  {products.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">مفيش منتجات</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">المنتج</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الفئة</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">السعر</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">المخزون</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((p) => (
                            <tr key={p.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium text-foreground">{p.name}</td>
                              <td className="py-3 px-4 text-muted-foreground">{p.category || "—"}</td>
                              <td className="py-3 px-4 text-primary font-medium">{p.price?.toLocaleString()} ج.م</td>
                              <td className="py-3 px-4 text-muted-foreground">{p.stock}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  p.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}>
                                  {p.status === "Active" ? "نشط" : "غير نشط"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">الزبائن ({customers.length})</h2>
                  {customers.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">مفيش زبائن</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الاسم</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">التليفون</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الإيميل</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الرصيد</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customers.map((c) => (
                            <tr key={c.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium text-foreground">{c.name}</td>
                              <td className="py-3 px-4 text-muted-foreground">{c.phone || "—"}</td>
                              <td className="py-3 px-4 text-muted-foreground">{c.email || "—"}</td>
                              <td className="py-3 px-4 text-primary font-medium">{c.balance?.toLocaleString()} ج.م</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">الفواتير ({invoices.length})</h2>
                  {invoices.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">مفيش فواتير</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">رقم الفاتورة</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الزبون</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الإجمالي</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoices.map((inv) => (
                            <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium text-foreground">{inv.invoice_number || inv.id?.slice(0, 8)}</td>
                              <td className="py-3 px-4 text-muted-foreground">{inv.customer_name || "—"}</td>
                              <td className="py-3 px-4 text-primary font-medium">{inv.total?.toLocaleString()} ج.م</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  inv.status === "paid" ? "bg-green-100 text-green-700" :
                                  inv.status === "sent" ? "bg-blue-100 text-blue-700" :
                                  "bg-yellow-100 text-yellow-700"
                                }`}>
                                  {inv.status === "paid" ? "مدفوعة" :
                                   inv.status === "sent" ? "مرسلة" : "مسودة"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Expenses Tab */}
            {activeTab === "expenses" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="text-lg font-bold text-foreground mb-4">المصروفات ({expenses.length})</h2>
                  {expenses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">مفيش مصروفات</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الوصف</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">المبلغ</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">الفئة</th>
                            <th className="text-right py-3 px-4 font-medium text-muted-foreground">التاريخ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {expenses.map((e) => (
                            <tr key={e.id} className="border-b border-border/50 hover:bg-muted/50">
                              <td className="py-3 px-4 font-medium text-foreground">{e.description}</td>
                              <td className="py-3 px-4 text-red-500 font-medium">{e.amount?.toLocaleString()} ج.م</td>
                              <td className="py-3 px-4 text-muted-foreground">{e.category || "—"}</td>
                              <td className="py-3 px-4 text-muted-foreground">
                                {e.date || new Date(e.created_at).toLocaleDateString("ar-EG")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">تفاصيل الطلب</h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-muted rounded-lg">
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-muted rounded-xl p-4 space-y-2 text-right">
                  <p className="text-sm"><span className="text-muted-foreground">الاسم:</span> <span className="font-medium">{selectedOrder.user_name}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">البريد:</span> <span className="font-medium">{selectedOrder.user_email}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">الموبايل:</span> <span className="font-medium">{selectedOrder.user_phone || "—"}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">المبلغ:</span> <span className="font-bold text-primary">{selectedOrder.plan_price?.toLocaleString()} ج.م</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">طريقة الدفع:</span> <span className="font-medium">{selectedOrder.payment_method}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">رقم العملية:</span> <span className="font-mono font-medium">{selectedOrder.transaction_id || "—"}</span></p>
                  <p className="text-sm"><span className="text-muted-foreground">التاريخ:</span> <span className="font-medium">{new Date(selectedOrder.created_at).toLocaleString("ar-EG")}</span></p>
                </div>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  rows={3}
                  placeholder="ملاحظة (اختياري)..."
                />
              </div>
              {selectedOrder.status === "pending" && (
                <div className="p-6 border-t border-border flex gap-3">
                  <button
                    onClick={() => handleRejectOrder(selectedOrder.id)}
                    disabled={actionLoading === selectedOrder.id}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedOrder.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    رفض
                  </button>
                  <button
                    onClick={() => handleApproveOrder(selectedOrder.id)}
                    disabled={actionLoading === selectedOrder.id}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedOrder.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    تأكيد الدفع
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
