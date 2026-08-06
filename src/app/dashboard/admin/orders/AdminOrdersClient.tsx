"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, CheckCircle, XCircle, Clock, Search, Filter, Eye,
  User, Mail, Phone, CreditCard, Calendar, Building2, Smartphone,
  Wallet, ChevronDown, Loader2, AlertCircle, ArrowLeft, Trash2,
  Bell, RefreshCw, Download, BarChart3
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const STATUS_CONFIG = {
  pending: { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500", icon: Clock },
  approved: { label: "تم التأكيد", color: "bg-green-100 text-green-700", dot: "bg-green-500", icon: CheckCircle },
  rejected: { label: "مرفوض", color: "bg-red-100 text-red-700", dot: "bg-red-500", icon: XCircle },
};

const PAYMENT_METHODS: Record<string, string> = {
  fawry: "فوري",
  vodafone_cash: "فودافون كاش",
  instapay: "InstaPay",
  bank_transfer: "حوالة بنكية",
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      router.push("/login");
      return;
    }
    loadOrders();
  }, [router]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error loading orders:", err);
    }
    setLoading(false);
  };

  const handleApprove = async (orderId: string) => {
    setActionLoading(true);
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

      setOrders(orders.map(o => o.id === orderId ? {
        ...o,
        status: "approved",
        approved_at: new Date().toISOString(),
        admin_note: adminNote || "تم التأكيد"
      } : o));

      setShowDetail(false);
      setSelectedOrder(null);
      setAdminNote("");
    } catch (err) {
      console.error("Error approving order:", err);
    }
    setActionLoading(false);
  };

  const handleReject = async (orderId: string) => {
    setActionLoading(true);
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

      setOrders(orders.map(o => o.id === orderId ? {
        ...o,
        status: "rejected",
        admin_note: adminNote || "مرفوض"
      } : o));

      setShowDetail(false);
      setSelectedOrder(null);
      setAdminNote("");
    } catch (err) {
      console.error("Error rejecting order:", err);
    }
    setActionLoading(false);
  };

  const filteredOrders = orders.filter(order => {
    if (filter !== "all" && order.status !== filter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        order.user_name?.toLowerCase().includes(term) ||
        order.user_email?.toLowerCase().includes(term) ||
        order.user_phone?.includes(term) ||
        order.transaction_id?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    approved: orders.filter(o => o.status === "approved").length,
    rejected: orders.filter(o => o.status === "rejected").length,
    revenue: orders.filter(o => o.status === "approved").reduce((sum, o) => sum + (o.plan_price || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">طلبات الدفع</h1>
          <p className="text-sm text-muted-foreground mt-1">إدارة طلبات اشتراك العملاء</p>
        </div>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 bg-muted rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          تحديث
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "الكل", value: stats.total, color: "text-foreground" },
          { label: "قيد المراجعة", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "تم التأكيد", value: stats.approved, color: "text-green-600", bg: "bg-green-50" },
          { label: "مرفوض", value: stats.rejected, color: "text-red-600", bg: "bg-red-50" },
          { label: "الإيراد", value: `${stats.revenue.toLocaleString()} ج.م`, color: "text-primary", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <div key={i} className={`rounded-xl border border-border p-4 ${stat.bg || ""}`}>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color} mt-1`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="دور بالاسم، الإيميل، أو رقم العملية..."
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "approved", "rejected"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {f === "all" ? "الكل" : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-2xl border border-border">
          <Package className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">مفيش طلبات</p>
          <p className="text-sm text-muted-foreground mt-1">مفيش طلبات دفع حالياً</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => { setSelectedOrder(order); setShowDetail(true); setAdminNote(""); }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${status.color}`}>
                      <StatusIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">{order.user_name}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{order.user_email}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-primary">{order.plan_price?.toLocaleString()} ج.م</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {PAYMENT_METHODS[order.payment_method] || order.payment_method}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetail && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">تفاصيل الطلب</h2>
                  <button
                    onClick={() => { setShowDetail(false); setSelectedOrder(null); }}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <XCircle className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* User Info */}
                <div className="bg-muted rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedOrder.user_name}</p>
                      <p className="text-xs text-muted-foreground">الاسم</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedOrder.user_email}</p>
                      <p className="text-xs text-muted-foreground">البريد الإلكتروني</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{selectedOrder.user_phone || "—"}</p>
                      <p className="text-xs text-muted-foreground">رقم الموبايل</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-muted rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الخطة</span>
                    <span className="text-sm font-medium text-foreground">{selectedOrder.plan_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">المبلغ</span>
                    <span className="text-sm font-bold text-primary">{selectedOrder.plan_price?.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">طريقة الدفع</span>
                    <span className="text-sm font-medium text-foreground">
                      {PAYMENT_METHODS[selectedOrder.payment_method] || selectedOrder.payment_method}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">رقم العملية</span>
                    <span className="text-sm font-mono font-medium text-foreground">{selectedOrder.transaction_id || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تاريخ الطلب</span>
                    <span className="text-sm text-foreground">
                      {new Date(selectedOrder.created_at).toLocaleDateString("ar-EG", {
                        year: "numeric", month: "long", day: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <div className={`rounded-xl p-4 ${
                  selectedOrder.status === "approved" ? "bg-green-50 border border-green-200" :
                  selectedOrder.status === "rejected" ? "bg-red-50 border border-red-200" :
                  "bg-yellow-50 border border-yellow-200"
                }`}>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const s = STATUS_CONFIG[selectedOrder.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                      const Icon = s.icon;
                      return (
                        <>
                          <Icon className={`w-5 h-5 ${
                            selectedOrder.status === "approved" ? "text-green-600" :
                            selectedOrder.status === "rejected" ? "text-red-600" :
                            "text-yellow-600"
                          }`} />
                          <span className={`font-medium ${
                            selectedOrder.status === "approved" ? "text-green-800" :
                            selectedOrder.status === "rejected" ? "text-red-800" :
                            "text-yellow-800"
                          }`}>{s.label}</span>
                        </>
                      );
                    })()}
                  </div>
                  {selectedOrder.admin_note && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedOrder.admin_note}</p>
                  )}
                </div>

                {/* Admin Note */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">ملاحظة الادمن</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                    placeholder="اضف ملاحظة (اختياري)..."
                  />
                </div>
              </div>

              {/* Actions */}
              {selectedOrder.status === "pending" && (
                <div className="p-6 border-t border-border flex gap-3">
                  <button
                    onClick={() => handleReject(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    رفض
                  </button>
                  <button
                    onClick={() => handleApprove(selectedOrder.id)}
                    disabled={actionLoading}
                    className="flex-1 bg-green-500 text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
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
