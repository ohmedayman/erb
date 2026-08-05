"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, Trash2, ShoppingCart, Package, CreditCard, AlertTriangle, Info, Filter, X, Clock, ArrowLeft } from "lucide-react";
import { getNotifications, markAsRead, markAllAsRead, clearAll, deleteNotification, type Notification } from "@/lib/notifications";

const TYPE_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/20", label: "معلومات" },
  success: { icon: Check, color: "text-green-400", bg: "bg-green-500/20", label: "نجاح" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/20", label: "تنبيه" },
  error: { icon: X, color: "text-red-400", bg: "bg-red-500/20", label: "خطأ" },
  order: { icon: ShoppingCart, color: "text-cyan-400", bg: "bg-cyan-500/20", label: "أوردر" },
  stock: { icon: Package, color: "text-orange-400", bg: "bg-orange-500/20", label: "مخزون" },
  payment: { icon: CreditCard, color: "text-purple-400", bg: "bg-purple-500/20", label: "دفع" },
  system: { icon: Bell, color: "text-slate-400", bg: "bg-slate-500/20", label: "نظام" },
};

const CATEGORY_FILTERS = [
  { key: "all", label: "الكل" },
  { key: "order", label: "الأوردرات" },
  { key: "stock", label: "المخزون" },
  { key: "payment", label: "المدفوعات" },
  { key: "system", label: "النظام" },
  { key: "user", label: "المستخدمين" },
];

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "الآن";
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} يوم`;
  return new Date(dateStr).toLocaleDateString("ar-EG");
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filtered = notifications.filter((n) => {
    if (showUnreadOnly && n.read) return false;
    if (filter !== "all" && n.category !== filter) return false;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleClearAll = async () => {
    if (!confirm("هل أنت متأكد من حذف كل الإشعارات؟")) return;
    await clearAll();
    setNotifications([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإشعارات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : "كل الإشعارات مقروءة"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
              <CheckCheck className="w-4 h-4" />
              قراءة الكل
            </button>
          )}
          <button onClick={handleClearAll} className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-500/20 transition-colors">
            <Trash2 className="w-4 h-4" />
            حذف الكل
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setFilter(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === cat.key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {cat.label}
          </button>
        ))}
        <div className="mr-auto">
          <button
            onClick={() => setShowUnreadOnly(!showUnreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${showUnreadOnly ? "bg-amber-500/20 text-amber-400" : "bg-muted text-muted-foreground hover:text-foreground"}`}
          >
            {showUnreadOnly ? "إظهار الكل" : "غير مقروء فقط"}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              {notifications.length === 0 ? "لا توجد إشعارات" : "لا توجد إشعارات تطابق الفلتر"}
            </p>
          </div>
        ) : (
          filtered.map((notif) => {
            const config = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = config.icon;
            return (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-md ${
                  !notif.read
                    ? "bg-primary/5 border-primary/20 hover:border-primary/40"
                    : "bg-card border-border hover:border-border/80"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-sm ${!notif.read ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {timeAgo(notif.created_at)}
                    </span>
                    {notif.entity_type && (
                      <span className="text-xs text-muted-foreground">
                        {notif.entity_type === "order" ? "أوردر" : notif.entity_type === "product" ? "منتج" : notif.entity_type === "invoice" ? "فاتورة" : notif.entity_type}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {notif.action_url && (
                    <Link
                      href={notif.action_url}
                      onClick={() => !notif.read && handleMarkRead(notif.id)}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="عرض"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Link>
                  )}
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-2 rounded-lg hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors"
                      title="تحديد كمقروء"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
