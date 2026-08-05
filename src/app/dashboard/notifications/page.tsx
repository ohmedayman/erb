"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { getDocsFromCollection, updateDocInCollection } from "@/lib/localdb";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const data = getDocsFromCollection("notifications", user.storeId ? [{ field: "storeId", op: "==", value: user.storeId }] : []);
      setNotifications(data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    unreadIds.forEach((id) => updateDocInCollection("notifications", id, { read: true }));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const typeConfig: Record<
    string,
    { label: string; icon: typeof Info; color: string; dotColor: string }
  > = {
    info: {
      label: "معلومات",
      icon: Info,
      color: "bg-blue-50 text-blue-600",
      dotColor: "bg-blue-500",
    },
    warning: {
      label: "تحذير",
      icon: AlertTriangle,
      color: "bg-yellow-50 text-yellow-600",
      dotColor: "bg-yellow-500",
    },
    success: {
      label: "نجاح",
      icon: CheckCircle,
      color: "bg-green-50 text-green-600",
      dotColor: "bg-green-500",
    },
    order: {
      label: "طلب",
      icon: ShoppingCart,
      color: "bg-purple-50 text-purple-600",
      dotColor: "bg-purple-500",
    },
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now.getTime() - created.getTime()) / 1000);
    if (diff < 60) return "الآن";
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    if (diff < 604800) return `منذ ${Math.floor(diff / 86400)} أيام`;
    return created.toLocaleDateString("ar-SA");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">الإشعارات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            عرض و إدارة الإشعارات
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={notifications.every((n) => n.read)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-4 h-4" /> عمل الكل مقروء
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
            بيتحمّل...
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground text-sm">مفيش إشعارات</p>
          </div>
        ) : (
          notifications.map((notification) => {
            const config =
              typeConfig[notification.type] || typeConfig["info"];
            const IconComponent = config.icon;

            return (
              <div
                key={notification.id}
                className={`bg-card rounded-xl border border-border p-4 flex items-start gap-4 transition-colors ${
                  !notification.read
                    ? `border-r-4 ${config.color.split(" ")[0]}`
                    : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}
                >
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={`text-sm font-semibold ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {notification.title}
                    </h3>
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}
                    >
                      {config.label}
                    </span>
                    {!notification.read && (
                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dotColor}`}
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {notification.message}
                  </p>
                  <span className="text-xs text-muted-foreground/70">
                    {timeAgo(notification.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
