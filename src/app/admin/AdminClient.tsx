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
  Settings, Home, ArrowLeft, Loader2, Database, Download, Menu
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getDocsFromCollection } from "@/lib/localdb";
import Image from "next/image";

const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      router.push("/login");
      return;
    }

    const email = user.email?.toLowerCase() || "";
    setUserEmail(email);

    if (email.includes("admin") || ADMIN_EMAILS.includes(email)) {
      setIsAdmin(true);
      setChecked(true);
      loadAllData();
    } else {
      setIsAdmin(false);
      setChecked(true);
    }
  }, [router]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [subOrders, regUsers, prods, custs, ords, invs, exps] = await Promise.all([
        getDocsFromCollection("subscription_orders"),
        getDocsFromCollection("registered_users"),
        getDocsFromCollection("products"),
        getDocsFromCollection("customers"),
        getDocsFromCollection("orders"),
        getDocsFromCollection("invoices"),
        getDocsFromCollection("expenses"),
      ]);

      setSubscriptionOrders(subOrders);
      setRegisteredUsers(regUsers);
      setProducts(prods);
      setCustomers(custs);
      setOrders(ords);
      setInvoices(invs);
      setExpenses(exps);

      setStats({
        totalUsers: regUsers.length,
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
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">غير مصرح لك</h1>
          <p className="text-slate-400 mb-6">صفحة الادمن متاحة لصاحب المنصة فقط</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-all"
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

  const StatusBadge = ({ status }: { status: string }) => {
    const styles = {
      approved: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      rejected: "bg-red-500/10 text-red-400 border border-red-500/20",
      pending: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
      paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      sent: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
      draft: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    };
    const labels: Record<string, string> = {
      approved: "مفعل",
      rejected: "مرفوض",
      pending: "معلق",
      paid: "مدفوعة",
      sent: "مرسلة",
      draft: "مسودة",
    };
    return (
      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex" dir="rtl">
      {/* Sidebar Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : 280 }}
        className="fixed lg:sticky top-0 right-0 h-screen w-[280px] bg-[#1e293b] border-l border-slate-700 z-50 flex flex-col"
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <Image src="/favicon.svg" alt="StockFlow" width={40} height={40} />
            <div>
              <h1 className="text-white font-bold text-lg">لوحة التحكم</h1>
              <p className="text-slate-400 text-xs">StockFlow Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-orange-500/10 text-orange-500 border border-orange-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-700/50"
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
              {tab.id === "orders" && stats.pendingOrders > 0 && (
                <span className="mr-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-lg">
                  {stats.pendingOrders}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-9 h-9 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <UserCog className="w-4 h-4 text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">مدير المنصة</p>
              <p className="text-slate-400 text-xs truncate">{userEmail}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700/50 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
            >
              <Home className="w-4 h-4" />
              البورد
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors border border-red-500/20"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-white font-bold text-lg">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-slate-400 text-xs">
                  إدارة {TABS.find(t => t.id === activeTab)?.label}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAllData}
                className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                title="تحديث البيانات"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-slate-300 text-sm">متصل</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-400 text-sm">جاري تحميل البيانات...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "المستخدمين", value: stats.totalUsers, icon: Users, gradient: "from-blue-500 to-blue-600", change: "+12%" },
                      { label: "المنتجات", value: stats.totalProducts, icon: Package, gradient: "from-emerald-500 to-emerald-600", change: "+5%" },
                      { label: "الزبائن", value: stats.totalCustomers, icon: UserCog, gradient: "from-purple-500 to-purple-600", change: "+8%" },
                      { label: "الأوردرات", value: stats.totalOrders, icon: ShoppingCart, gradient: "from-orange-500 to-orange-600", change: "+3%" },
                      { label: "الفواتير", value: stats.totalInvoices, icon: Receipt, gradient: "from-rose-500 to-rose-600", change: "+15%" },
                      { label: "المصروفات", value: stats.totalExpenses, icon: Wallet, gradient: "from-amber-500 to-amber-600", change: "+2%" },
                      { label: "طلبات معلقة", value: stats.pendingOrders, icon: Clock, gradient: "from-yellow-500 to-yellow-600", change: "" },
                      { label: "الإيراد", value: `${stats.totalRevenue.toLocaleString()} ج.م`, icon: DollarSign, gradient: "from-teal-500 to-teal-600", change: "+20%" },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 hover:border-slate-600 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                            <stat.icon className="w-5 h-5 text-white" />
                          </div>
                          {stat.change && (
                            <span className="flex items-center gap-1 text-emerald-400 text-xs font-medium">
                              <TrendingUp className="w-3 h-3" />
                              {stat.change}
                            </span>
                          )}
                        </div>
                        <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                        <p className="text-slate-400 text-sm">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Recent Subscription Orders */}
                  <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                      <div>
                        <h3 className="text-white font-bold">آخر طلبات الدفع</h3>
                        <p className="text-slate-400 text-xs mt-0.5">أحدث 5 طلبات اشتراك</p>
                      </div>
                      <button
                        onClick={() => setActiveTab("orders")}
                        className="text-orange-500 text-sm font-medium hover:text-orange-400 transition-colors"
                      >
                        عرض الكل
                      </button>
                    </div>
                    {subscriptionOrders.length === 0 ? (
                      <div className="py-12 text-center">
                        <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">مفيش طلبات دفع</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-700">
                        {subscriptionOrders.slice(0, 5).map((order, i) => (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center justify-between px-6 py-4 hover:bg-slate-700/30 cursor-pointer transition-colors"
                            onClick={() => { setSelectedOrder(order); setActiveTab("orders"); }}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                order.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                                order.status === "rejected" ? "bg-red-500/10 text-red-400" :
                                "bg-amber-500/10 text-amber-400"
                              }`}>
                                {order.status === "approved" ? <CheckCircle className="w-5 h-5" /> :
                                 order.status === "rejected" ? <XCircle className="w-5 h-5" /> :
                                 <Clock className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-white font-medium text-sm">{order.user_name}</p>
                                <p className="text-slate-400 text-xs">{order.user_email}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-orange-500 font-bold">{order.plan_price?.toLocaleString()} ج.م</p>
                              <p className="text-slate-400 text-xs">
                                {new Date(order.created_at).toLocaleDateString("ar-EG")}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-700 bg-[#1e293b] text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all placeholder-slate-500"
                        placeholder="دور بالاسم أو الإيميل أو رقم العملية..."
                      />
                    </div>
                  </div>

                  {filteredSubscriptionOrders.length === 0 ? (
                    <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-16 text-center">
                      <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-white font-medium text-lg">مفيش طلبات</p>
                      <p className="text-slate-400 text-sm mt-1">مفيش طلبات اشتراك حالياً</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredSubscriptionOrders.map((order, i) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="bg-[#1e293b] rounded-2xl border border-slate-700 p-5 hover:border-slate-600 transition-all cursor-pointer group"
                          onClick={() => { setSelectedOrder(order); setAdminNote(""); }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                order.status === "approved" ? "bg-emerald-500/10 text-emerald-400" :
                                order.status === "rejected" ? "bg-red-500/10 text-red-400" :
                                "bg-amber-500/10 text-amber-400"
                              }`}>
                                {order.status === "approved" ? <CheckCircle className="w-6 h-6" /> :
                                 order.status === "rejected" ? <XCircle className="w-6 h-6" /> :
                                 <Clock className="w-6 h-6" />}
                              </div>
                              <div>
                                <h3 className="text-white font-bold group-hover:text-orange-500 transition-colors">{order.user_name}</h3>
                                <p className="text-slate-400 text-sm">{order.user_email}</p>
                                <p className="text-slate-500 text-xs mt-0.5">
                                  رقم العملية: {order.transaction_id || "—"}
                                </p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-xl font-bold text-orange-500">{order.plan_price?.toLocaleString()} ج.م</p>
                              <p className="text-slate-400 text-xs">{order.payment_method}</p>
                              <p className="text-slate-500 text-xs">
                                {new Date(order.created_at).toLocaleDateString("ar-EG")}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center justify-between">
                            <StatusBadge status={order.status} />
                            <span className="text-slate-500 text-xs">
                              {order.plan_name || "خطة اشتراك"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700">
                      <h3 className="text-white font-bold">المستخدمين المسجلين ({registeredUsers.length})</h3>
                    </div>
                    {registeredUsers.length === 0 ? (
                      <div className="py-12 text-center">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">مفيش مستخدمين مسجلين</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الاسم</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">البريد</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الدور</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الاشتراك</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">التاريخ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {registeredUsers.map((user) => {
                              const subOrder = subscriptionOrders.find((o: any) => o.user_id === user.id);
                              return (
                                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                                  <td className="py-3 px-6 font-medium text-white">{user.full_name}</td>
                                  <td className="py-3 px-6 text-slate-400">{user.email}</td>
                                  <td className="py-3 px-6">
                                    <StatusBadge status={user.role === "admin" ? "approved" : "draft"} />
                                  </td>
                                  <td className="py-3 px-6">
                                    <StatusBadge status={subOrder?.status || user.subscription_status || "pending"} />
                                  </td>
                                  <td className="py-3 px-6 text-slate-500 text-xs">
                                    {new Date(user.created_at).toLocaleDateString("ar-EG")}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Products Tab */}
              {activeTab === "products" && (
                <motion.div
                  key="products"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700">
                      <h3 className="text-white font-bold">المنتجات ({products.length})</h3>
                    </div>
                    {products.length === 0 ? (
                      <div className="py-12 text-center">
                        <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">مفيش منتجات</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-right py-3 px-6 font-medium text-slate-400">المنتج</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الفئة</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">السعر</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">المخزون</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الحالة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {products.map((p) => (
                              <tr key={p.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="py-3 px-6 font-medium text-white">{p.name}</td>
                                <td className="py-3 px-6 text-slate-400">{p.category || "—"}</td>
                                <td className="py-3 px-6 text-orange-500 font-medium">{p.price?.toLocaleString()} ج.م</td>
                                <td className="py-3 px-6 text-slate-400">{p.stock}</td>
                                <td className="py-3 px-6">
                                  <StatusBadge status={p.status === "Active" ? "approved" : "rejected"} />
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
                <motion.div
                  key="customers"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700">
                      <h3 className="text-white font-bold">الزبائن ({customers.length})</h3>
                    </div>
                    {customers.length === 0 ? (
                      <div className="py-12 text-center">
                        <UserCog className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">مفيش زبائن</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الاسم</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">التليفون</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الإيميل</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الرصيد</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {customers.map((c) => (
                              <tr key={c.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="py-3 px-6 font-medium text-white">{c.name}</td>
                                <td className="py-3 px-6 text-slate-400">{c.phone || "—"}</td>
                                <td className="py-3 px-6 text-slate-400">{c.email || "—"}</td>
                                <td className="py-3 px-6 text-orange-500 font-medium">{c.balance?.toLocaleString()} ج.م</td>
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
                <motion.div
                  key="invoices"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700">
                      <h3 className="text-white font-bold">الفواتير ({invoices.length})</h3>
                    </div>
                    {invoices.length === 0 ? (
                      <div className="py-12 text-center">
                        <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">مفيش فواتير</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-right py-3 px-6 font-medium text-slate-400">رقم الفاتورة</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الزبون</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الإجمالي</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الحالة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {invoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="py-3 px-6 font-medium text-white">{inv.invoice_number || inv.id?.slice(0, 8)}</td>
                                <td className="py-3 px-6 text-slate-400">{inv.customer_name || "—"}</td>
                                <td className="py-3 px-6 text-orange-500 font-medium">{inv.total?.toLocaleString()} ج.م</td>
                                <td className="py-3 px-6"><StatusBadge status={inv.status} /></td>
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
                <motion.div
                  key="expenses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="bg-[#1e293b] rounded-2xl border border-slate-700 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-700">
                      <h3 className="text-white font-bold">المصروفات ({expenses.length})</h3>
                    </div>
                    {expenses.length === 0 ? (
                      <div className="py-12 text-center">
                        <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400">مفيش مصروفات</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الوصف</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">المبلغ</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">الفئة</th>
                              <th className="text-right py-3 px-6 font-medium text-slate-400">التاريخ</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-700/50">
                            {expenses.map((e) => (
                              <tr key={e.id} className="hover:bg-slate-700/30 transition-colors">
                                <td className="py-3 px-6 font-medium text-white">{e.description}</td>
                                <td className="py-3 px-6 text-red-400 font-medium">{e.amount?.toLocaleString()} ج.م</td>
                                <td className="py-3 px-6 text-slate-400">{e.category || "—"}</td>
                                <td className="py-3 px-6 text-slate-500 text-xs">
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
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="px-6 py-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="text-white font-bold text-lg">تفاصيل الطلب</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">الاسم</span>
                    <span className="text-white font-medium">{selectedOrder.user_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">البريد</span>
                    <span className="text-white font-medium">{selectedOrder.user_email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">الموبايل</span>
                    <span className="text-white font-medium">{selectedOrder.user_phone || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">المبلغ</span>
                    <span className="text-orange-500 font-bold text-lg">{selectedOrder.plan_price?.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">طريقة الدفع</span>
                    <span className="text-white font-medium">{selectedOrder.payment_method}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">رقم العملية</span>
                    <span className="text-white font-mono font-medium">{selectedOrder.transaction_id || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-sm">التاريخ</span>
                    <span className="text-white font-medium">{new Date(selectedOrder.created_at).toLocaleString("ar-EG")}</span>
                  </div>
                </div>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#0f172a] text-white text-sm text-right focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none transition-all placeholder-slate-500"
                  rows={3}
                  placeholder="ملاحظة (اختياري)..."
                />
              </div>
              {selectedOrder.status === "pending" && (
                <div className="px-6 py-4 border-t border-slate-700 flex gap-3">
                  <button
                    onClick={() => handleRejectOrder(selectedOrder.id)}
                    disabled={actionLoading === selectedOrder.id}
                    className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl font-medium hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedOrder.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <XCircle className="w-5 h-5" />
                    )}
                    رفض
                  </button>
                  <button
                    onClick={() => handleApproveOrder(selectedOrder.id)}
                    disabled={actionLoading === selectedOrder.id}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading === selectedOrder.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
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
