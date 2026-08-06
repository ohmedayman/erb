"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Home, CreditCard, Users, Package, ShoppingCart, Receipt, Wallet,
  UserCog, Store, Settings, Activity, LogOut, Shield, Menu, X, Search,
  ChevronDown, Eye, CheckCircle, XCircle, Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Overview from "./components/Overview";
import StoresManager from "./components/StoresManager";
import UsersManager from "./components/UsersManager";
import SubscriptionsManager from "./components/SubscriptionsManager";
import PlansManager from "./components/PlansManager";
import ProductsManager from "./components/ProductsManager";
import OrdersManager from "./components/OrdersManager";
import InvoicesManager from "./components/InvoicesManager";
import CustomersManager from "./components/CustomersManager";
import ExpensesManager from "./components/ExpensesManager";
import EmployeesManager from "./components/EmployeesManager";
import ActivityLogManager from "./components/ActivityLogManager";
import SettingsManager from "./components/SettingsManager";
import SecurityDashboard from "./components/SecurityDashboard";

const ADMIN_EMAILS = ["admin@stockflow.com", "m44408335@gmail.com", "admin@stockflow.vexonet.online"];

const SIDEBAR_ITEMS = [
  { id: "overview", label: "لوحة التحكم", icon: Home },
  { id: "stores", label: "المتاجر", icon: Store },
  { id: "users", label: "المستخدمين", icon: Users },
  { id: "subscriptions", label: "طلبات الاشتراك", icon: CreditCard },
  { id: "plans", label: "خطط الاشتراك", icon: CreditCard },
  { id: "products", label: "المنتجات", icon: Package },
  { id: "orders", label: "الأوردرات", icon: ShoppingCart },
  { id: "invoices", label: "الفواتير", icon: Receipt },
  { id: "customers", label: "الزبائن", icon: UserCog },
  { id: "expenses", label: "المصروفات", icon: Wallet },
  { id: "employees", label: "الموظفين", icon: UserCog },
  { id: "activity", label: "سجل النشاطات", icon: Activity },
  { id: "security", label: "الأمان", icon: Shield },
  { id: "settings", label: "الإعدادات", icon: Settings },
];

export default function AdminClient() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stores, setStores] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [subscriptionOrders, setSubscriptionOrders] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ table: string; id: string } | null>(null);
  const [editItem, setEditItem] = useState<{ table: string; item: any } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        storesRes, usersRes, subsRes, plansRes, productsRes,
        ordersRes, invoicesRes, customersRes, expensesRes, employeesRes, activityRes,
      ] = await Promise.all([
        supabase.from("stores").select("*").order("created_at", { ascending: false }),
        supabase.from("registered_users").select("*").order("created_at", { ascending: false }),
        supabase.from("subscription_orders").select("*").order("created_at", { ascending: false }),
        supabase.from("subscription_plans").select("*").order("created_at", { ascending: false }),
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        supabase.from("customers").select("*").order("created_at", { ascending: false }),
        supabase.from("expenses").select("*").order("created_at", { ascending: false }),
        supabase.from("employees").select("*").order("created_at", { ascending: false }),
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(200),
      ]);

      setStores(storesRes.data || []);
      setUsers(usersRes.data || []);
      setSubscriptionOrders(subsRes.data || []);
      setPlans(plansRes.data || []);
      setProducts(productsRes.data || []);
      setOrders(ordersRes.data || []);
      setInvoices(invoicesRes.data || []);
      setCustomers(customersRes.data || []);
      setExpenses(expensesRes.data || []);
      setEmployees(employeesRes.data || []);
      setActivityLogs(activityRes.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user.email) { router.push("/login"); return; }
    const admin = user.role === "admin" || ADMIN_EMAILS.includes(user.email);
    setIsAdmin(admin);
    setChecked(true);
    if (!admin) return;
    loadAllData();
    // Request notification permission for admin
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [router, loadAllData]);

  useEffect(() => {
    const channel = supabase
      .channel("admin-changes")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "subscription_orders" }, (payload) => {
        loadAllData();
        // Browser notification for new orders
        if (Notification.permission === "granted") {
          new Notification("طلب اشتراك جديد! 🎉", {
            body: `طلب من ${payload.new?.user_name || "مستخدم جديد"}`,
            icon: "/icons/icon-192.png",
            tag: "new-order",
          });
        }
        // Play notification sound
        try {
          const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH+JkI+If3V1goqOj42JhYB7foOJkI+NiYSAfH2FiZCPjYmEgHx+hYqQj42JhYB8foWKkI+NiYWAfH6FipCPjYmFgHx+hYqQj42JhYB8foWKkI+NiYWAfH6FipCPjYmFgHx+hYqQj42JhYB8foWKkI+NiYWAfH6FipCPjYmFgHx+hYqQj42JhYB8fg==");
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch {}
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "registered_users" }, () => loadAllData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadAllData]);

  const handleApproveOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const { error } = await supabase.from("subscription_orders").update({
        status: "approved", approved_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(), admin_note: adminNote || "تم التأكيد",
        updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      if (error) throw error;
      setSubscriptionOrders(subscriptionOrders.map(o => o.id === orderId ? { ...o, status: "approved", admin_note: adminNote || "تم التأكيد" } : o));
      setSelectedOrder(null); setAdminNote("");
    } catch (e: any) { alert("خطأ: " + e.message); }
    finally { setActionLoading(null); }
  };

  const handleRejectOrder = async (orderId: string) => {
    setActionLoading(orderId);
    try {
      const { error } = await supabase.from("subscription_orders").update({
        status: "rejected", admin_note: adminNote || "مرفوض", updated_at: new Date().toISOString(),
      }).eq("id", orderId);
      if (error) throw error;
      setSubscriptionOrders(subscriptionOrders.map(o => o.id === orderId ? { ...o, status: "rejected", admin_note: adminNote || "مرفوض" } : o));
      setSelectedOrder(null); setAdminNote("");
    } catch (e: any) { alert("خطأ: " + e.message); }
    finally { setActionLoading(null); }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setActionLoading(deleteConfirm.id);
    try {
      const { error } = await supabase.from(deleteConfirm.table).delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      await loadAllData(); setDeleteConfirm(null);
    } catch (e: any) { alert("خطأ في الحذف: " + (e.message || "تأكد من صلاحياتك")); }
    finally { setActionLoading(null); }
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setActionLoading(editItem.item.id);
    try {
      const { id, created_at, updated_at, ...fields } = editItem.item;
      const { error } = await supabase.from(editItem.table).update({ ...fields, updated_at: new Date().toISOString() }).eq("id", editItem.item.id);
      if (error) throw error;
      await loadAllData(); setEditItem(null);
    } catch (e: any) { alert("خطأ في الحفظ: " + (e.message || "تأكد من صلاحياتك")); }
    finally { setActionLoading(null); }
  };

  const handleCreatePlan = async (plan: any) => {
    try {
      const { error } = await supabase.from("subscription_plans").insert(plan);
      if (error) throw error;
      await loadAllData();
    } catch (e: any) { alert("خطأ: " + e.message); }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", planId);
      if (error) throw error;
      await loadAllData();
    } catch (e: any) { alert("خطأ: " + e.message); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const stats = {
    totalStores: stores.length,
    totalUsers: users.length,
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue: subscriptionOrders.filter(o => o.status === "approved").reduce((s, o) => s + (o.plan_price || 0), 0),
    totalExpenses: expenses.reduce((s, e) => s + (e.amount || 0), 0),
    pendingOrders: subscriptionOrders.filter(o => o.status === "pending").length,
    approvedOrders: subscriptionOrders.filter(o => o.status === "approved").length,
    activeUsers: users.filter(u => u.subscription_status === "active" || u.subscription_status === "approved").length,
    totalCustomers: customers.length,
    totalInvoices: invoices.length,
    totalEmployees: employees.length,
  };

  if (!checked) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">جاري التحميل...</p>
      </div>
    </div>
  );

  if (!isAdmin) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-8 max-w-md text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">غير مصرح لك</h1>
        <p className="text-slate-400 mb-6">صفحة الادمن متاحة لصاحب المنصة فقط</p>
        <Link href="/dashboard" className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-orange-600 transition-all">
          <Home className="w-5 h-5" /> رجوع للبورد
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f172a] flex" dir="rtl">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 right-0 left-auto z-50 w-64 bg-[#1e293b] border-l border-slate-700/50 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-5 h-16 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-white font-bold text-sm">StockFlow</span>
                <p className="text-[10px] text-slate-400">Admin Panel</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-orange-500/20 text-orange-400" : "text-slate-400 hover:text-white hover:bg-slate-700/50"}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="p-3 border-t border-slate-700/50">
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              <LogOut className="w-5 h-5" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-[#1e293b] border-b border-slate-700/50 flex items-center gap-4 px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث في كل البيانات..."
                className="w-full pr-10 pl-4 py-2 bg-[#0f172a] border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mr-auto">
            <span className="text-slate-400 text-xs hidden md:block">
              {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {activeTab === "overview" && <Overview stats={stats} recentOrders={orders} stores={stores} />}
              {activeTab === "stores" && <StoresManager stores={stores} onEdit={(item) => setEditItem({ table: "stores", item })} onDelete={(item) => setDeleteConfirm({ table: "stores", id: item.id })} />}
              {activeTab === "users" && <UsersManager users={users} onEdit={(item) => setEditItem({ table: "registered_users", item })} onDelete={(item) => setDeleteConfirm({ table: "registered_users", id: item.id })} />}
              {activeTab === "subscriptions" && <SubscriptionsManager orders={subscriptionOrders} onApprove={handleApproveOrder} onReject={handleRejectOrder} onView={setSelectedOrder} />}
              {activeTab === "plans" && <PlansManager plans={plans} onEdit={(item) => setEditItem({ table: "subscription_plans", item })} onDelete={(item) => handleDeletePlan(item.id)} onCreate={handleCreatePlan} />}
              {activeTab === "products" && <ProductsManager products={products} stores={stores} onEdit={(item) => setEditItem({ table: "products", item })} onDelete={(item) => setDeleteConfirm({ table: "products", id: item.id })} />}
              {activeTab === "orders" && <OrdersManager orders={orders} stores={stores} onEdit={(item) => setEditItem({ table: "orders", item })} onDelete={(item) => setDeleteConfirm({ table: "orders", id: item.id })} />}
              {activeTab === "invoices" && <InvoicesManager invoices={invoices} stores={stores} onEdit={(item) => setEditItem({ table: "invoices", item })} onDelete={(item) => setDeleteConfirm({ table: "invoices", id: item.id })} />}
              {activeTab === "customers" && <CustomersManager customers={customers} stores={stores} onEdit={(item) => setEditItem({ table: "customers", item })} onDelete={(item) => setDeleteConfirm({ table: "customers", id: item.id })} />}
              {activeTab === "expenses" && <ExpensesManager expenses={expenses} stores={stores} onEdit={(item) => setEditItem({ table: "expenses", item })} onDelete={(item) => setDeleteConfirm({ table: "expenses", id: item.id })} />}
              {activeTab === "employees" && <EmployeesManager employees={employees} stores={stores} onEdit={(item) => setEditItem({ table: "employees", item })} onDelete={(item) => setDeleteConfirm({ table: "employees", id: item.id })} />}
              {activeTab === "activity" && <ActivityLogManager logs={activityLogs} stores={stores} />}
              {activeTab === "security" && <SecurityDashboard />}
              {activeTab === "settings" && <SettingsManager />}
            </>
          )}
        </main>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => { setSelectedOrder(null); setAdminNote(""); }}>
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">تفاصيل طلب الاشتراك</h3>
              <button onClick={() => { setSelectedOrder(null); setAdminNote(""); }} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm"><span className="text-slate-400">المستخدم</span><span className="text-white">{selectedOrder.user_name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">البريد</span><span className="text-white">{selectedOrder.user_email}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">الهاتف</span><span className="text-white">{selectedOrder.user_phone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">الخطة</span><span className="text-white">{selectedOrder.plan_name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">السعر</span><span className="text-orange-400 font-bold">{selectedOrder.plan_price?.toLocaleString()} ج.م</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">طريقة الدفع</span><span className="text-white">{selectedOrder.payment_method}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">رقم المعاملة</span><span className="text-white">{selectedOrder.transaction_id}</span></div>
              {selectedOrder.screenshot_url && (
                <div><span className="text-slate-400 text-sm block mb-2">صورة الإيصال</span>
                  <img src={selectedOrder.screenshot_url} alt="receipt" className="w-full rounded-lg border border-slate-700" />
                </div>
              )}
            </div>
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-2">ملاحظة المدير</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none" rows={3} placeholder="أضف ملاحظة..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => handleApproveOrder(selectedOrder.id)} disabled={actionLoading === selectedOrder.id} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                <CheckCircle className="w-5 h-5" /> تأكيد
              </button>
              <button onClick={() => handleRejectOrder(selectedOrder.id)} disabled={actionLoading === selectedOrder.id} className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                <XCircle className="w-5 h-5" /> رفض
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">تأكيد الحذف</h3>
            <p className="text-slate-400 text-sm text-center mb-6">هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء.</p>
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={actionLoading === deleteConfirm.id} className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                {actionLoading === deleteConfirm.id ? "جاري الحذف..." : "نعم، حذف"}
              </button>
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl font-medium transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {editItem && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setEditItem(null)}>
          <div className="bg-[#1e293b] rounded-2xl border border-slate-700 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">تعديل السجل</h3>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 mb-6">
              {Object.entries(editItem.item).filter(([key]) => !["id", "created_at", "updated_at"].includes(key)).map(([key, value]) => (
                <div key={key}>
                  <label className="block text-sm text-slate-400 mb-1">{key}</label>
                  {typeof value === "boolean" ? (
                    <select value={String(value)} onChange={(e) => setEditItem({ ...editItem, item: { ...editItem.item, [key]: e.target.value === "true" } })} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50">
                      <option value="true">نعم</option>
                      <option value="false">لا</option>
                    </select>
                  ) : typeof value === "number" ? (
                    <input type="number" value={value} onChange={(e) => setEditItem({ ...editItem, item: { ...editItem.item, [key]: Number(e.target.value) } })} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  ) : (
                    <input type="text" value={String(value || "")} onChange={(e) => setEditItem({ ...editItem, item: { ...editItem.item, [key]: e.target.value } })} className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-[#0f172a] text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={handleSaveEdit} disabled={actionLoading === editItem.item.id} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50">
                {actionLoading === editItem.item.id ? "جاري الحفظ..." : "حفظ"}
              </button>
              <button onClick={() => setEditItem(null)} className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-xl font-medium transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
