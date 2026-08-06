import { supabase } from "./supabase";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_name: string;
  user_email: string;
  metadata: Record<string, any>;
  read: boolean;
  created_at: string;
}

export async function createAdminNotification(data: {
  type: string;
  title: string;
  message?: string;
  user_name?: string;
  user_email?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await supabase.from("admin_notifications").insert({
      type: data.type,
      title: data.title,
      message: data.message || "",
      user_name: data.user_name || "",
      user_email: data.user_email || "",
      metadata: data.metadata || {},
      read: false,
    });
  } catch (err) {
    console.error("Failed to create admin notification:", err);
  }
}

export async function getAdminNotifications(limit = 50): Promise<AdminNotification[]> {
  const { data } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function markNotificationRead(id: string) {
  await supabase.from("admin_notifications").update({ read: true }).eq("id", id);
}

export async function markAllNotificationsRead() {
  await supabase.from("admin_notifications").update({ read: true }).eq("read", false);
}

export async function getUnreadCount(): Promise<number> {
  const { count } = await supabase
    .from("admin_notifications")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  return count || 0;
}

export function getNotificationIcon(type: string): string {
  switch (type) {
    case "signup": return "👤";
    case "subscription": return "💳";
    case "payment": return "💰";
    case "approved": return "✅";
    case "rejected": return "❌";
    case "login": return "🔑";
    case "order": return "📦";
    case "product": return "📋";
    case "invoice": return "🧾";
    case "expense": return "💸";
    case "employee": return "👨‍💼";
    case "customer": return "🤝";
    default: return "🔔";
  }
}

export function formatNotificationTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "الآن";
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  return date.toLocaleDateString("ar-EG");
}
