"use client";

import { supabase } from "@/lib/supabase";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "order" | "stock" | "payment" | "system";
  category: "order" | "inventory" | "payment" | "system" | "user" | "stock";
  priority: "low" | "normal" | "high" | "urgent";
  read: boolean;
  user_id: string;
  store_id: string;
  entity_type: string;
  entity_id: string;
  action_url: string;
  metadata: any;
  created_at: string;
}

export async function createNotification(data: {
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  store_id?: string;
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  metadata?: any;
}): Promise<any> {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const storeId = data.store_id || user.storeId;

  const notification = {
    title: data.title,
    message: data.message,
    type: data.type || "info",
    category: data.category || "system",
    priority: data.priority || "normal",
    read: false,
    user_id: data.user_id || user.id,
    store_id: storeId,
    entity_type: data.entity_type || null,
    entity_id: data.entity_id || null,
    action_url: data.action_url || null,
    metadata: data.metadata || null,
  };

  const { data: result, error } = await supabase
    .from("notifications")
    .insert(notification)
    .select()
    .single();

  if (error) throw error;

  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new window.Notification(data.title, {
        body: data.message,
        icon: "/favicon.svg",
        badge: "/favicon.svg",
        tag: result.id,
        data: data.action_url || "/dashboard",
      });
    } catch {}
  }

  return result;
}

export async function getUnreadCount(storeId?: string): Promise<number> {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const sid = storeId || user.storeId;

  let query = supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("read", false);

  if (sid) {
    query = query.eq("store_id", sid);
  }

  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}

export async function getNotifications(storeId?: string, limit = 50): Promise<Notification[]> {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const sid = storeId || user.storeId;

  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (sid) {
    query = query.eq("store_id", sid);
  }

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function markAsRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("id", notificationId);
  if (error) throw error;
}

export async function markAllAsRead(storeId?: string): Promise<void> {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const sid = storeId || user.storeId;

  let query = supabase
    .from("notifications")
    .update({ read: true, updated_at: new Date().toISOString() })
    .eq("read", false);

  if (sid) {
    query = query.eq("store_id", sid);
  }

  const { error } = await query;
  if (error) throw error;
}

export async function deleteNotification(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId);
  if (error) throw error;
}

export async function clearAll(storeId?: string): Promise<void> {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const sid = storeId || user.storeId;

  let query = supabase.from("notifications").delete();

  if (sid) {
    query = query.eq("store_id", sid);
  }

  const { error } = await query;
  if (error) throw error;
}

export function subscribeToNotifications(
  storeId: string,
  callback: (notification: Notification) => void
): () => void {
  const channel = supabase
    .channel("notifications-realtime")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `store_id=eq.${storeId}`,
      },
      (payload) => {
        callback(payload.new as Notification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: undefined,
    });
    return subscription;
  } catch {
    return null;
  }
}

// Smart notification triggers
export async function checkLowStock(storeId: string): Promise<void> {
  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock, min_stock")
    .eq("store_id", storeId);

  if (!products) return;

  for (const product of products) {
    if ((product.stock || 0) <= (product.min_stock || 10) && product.stock > 0) {
      await createNotification({
        title: "مخزون منخفض",
        message: `المنتج "${product.name}" وصل لـ ${product.stock} قطعة فقط`,
        type: "warning",
        category: "stock",
        priority: "normal",
        store_id: storeId,
        entity_type: "product",
        entity_id: product.id,
        action_url: "/dashboard/products",
      });
    } else if ((product.stock || 0) === 0) {
      await createNotification({
        title: "نفد المخزون!",
        message: `المنتج "${product.name}" نفد من المخزون`,
        type: "error",
        category: "stock",
        priority: "high",
        store_id: storeId,
        entity_type: "product",
        entity_id: product.id,
        action_url: "/dashboard/products",
      });
    }
  }
}

export async function notifyNewOrder(order: any, storeId: string): Promise<void> {
  await createNotification({
    title: "أوردر جديد",
    message: `أوردر جديد #${order.order_number} من ${order.customer_name} بقيمة ${order.total?.toLocaleString()} ج.م`,
    type: "order",
    category: "order",
    priority: "normal",
    store_id: storeId,
    entity_type: "order",
    entity_id: order.id,
    action_url: "/dashboard/orders",
    metadata: { order_number: order.order_number, total: order.total },
  });
}

export async function notifyPayment(invoice: any, storeId: string): Promise<void> {
  await createNotification({
    title: invoice.payment_status === "paid" ? "تم استلام الدفع" : "فاتورة مستحقة",
    message: `الفاتورة #${invoice.invoice_number} ${invoice.payment_status === "paid" ? "مدفوعة" : `بقيمة ${invoice.total?.toLocaleString()} ج.م`}`,
    type: invoice.payment_status === "paid" ? "success" : "warning",
    category: "payment",
    priority: invoice.payment_status === "paid" ? "normal" : "high",
    store_id: storeId,
    entity_type: "invoice",
    entity_id: invoice.id,
    action_url: "/dashboard/invoices",
  });
}

export async function notifyNewUser(user: any, storeId: string): Promise<void> {
  await createNotification({
    title: "مستخدم جديد",
    message: `${user.full_name} (${user.email}) انضم للمنصة`,
    type: "info",
    category: "user",
    priority: "low",
    store_id: storeId,
    entity_type: "user",
    entity_id: user.id,
  });
}
