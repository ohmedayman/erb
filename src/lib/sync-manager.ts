"use client";

import { supabase } from "@/lib/supabase";
import {
  getSyncQueue,
  removeSyncEntry,
  putManyToIDB,
  getAllFromIDB,
  clearIDB,
} from "@/lib/offline-db";
import { toCamelCase } from "@/lib/offline-database";

let isSyncing = false;
let syncInterval: ReturnType<typeof setInterval> | null = null;
let visibilityHandler: (() => void) | null = null;
let onlineHandler: (() => void) | null = null;

const COLLECTIONS_TO_SYNC = [
  "products",
  "customers",
  "orders",
  "invoices",
  "expenses",
  "employees",
  "suppliers",
  "stores",
  "activity_log",
  "notifications",
];

export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}

export async function syncToServer(): Promise<{ synced: number; failed: number }> {
  if (isSyncing || !isOnline()) return { synced: 0, failed: 0 };
  isSyncing = true;

  let synced = 0;
  let failed = 0;

  try {
    const queue = await getSyncQueue();
    const pending = queue
      .filter((e) => e.status === "pending" && e.retries < 3)
      .sort((a, b) => a.timestamp - b.timestamp);

    for (const entry of pending) {
      try {
        let result;

        switch (entry.action) {
          case "create":
            result = await supabase
              .from(entry.collection)
              .upsert(entry.data, { onConflict: "id" });
            break;
          case "update":
            result = await supabase
              .from(entry.collection)
              .update(entry.data)
              .eq("id", entry.documentId);
            break;
          case "delete":
            result = await supabase
              .from(entry.collection)
              .delete()
              .eq("id", entry.documentId);
            break;
        }

        if (result?.error) throw result.error;
        await removeSyncEntry(entry.id);
        synced++;
      } catch {
        failed++;
      }
    }
  } catch {
    failed++;
  } finally {
    isSyncing = false;
  }

  return { synced, failed };
}

export async function pullFromServer(): Promise<void> {
  if (!isOnline()) return;

  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const storeId = user.storeId;
    const isAdmin = user.role === "admin" || (user.email && user.email.includes("admin"));

    for (const collection of COLLECTIONS_TO_SYNC) {
      try {
        let query = supabase.from(collection).select("*");

        if (!isAdmin && storeId && collection !== "stores" && collection !== "registered_users") {
          query = query.eq("store_id", storeId);
        }

        const { data, error } = await query.order("created_at", { ascending: false }).limit(500);
        if (!error && data) {
          await putManyToIDB(collection as any, data.map(toCamelCase));
        }
      } catch {
        // skip failed collections
      }
    }
  } catch {
    // silent fail
  }
}

export async function fullSync(): Promise<{ pulled: boolean; synced: { synced: number; failed: number } }> {
  const pullPromise = pullFromServer();
  const syncPromise = syncToServer();

  const [, synced] = await Promise.all([pullPromise, syncPromise]);

  return { pulled: true, synced };
}

export function startAutoSync(intervalMs = 30000): void {
  if (syncInterval) clearInterval(syncInterval);

  // Periodic sync
  syncInterval = setInterval(async () => {
    if (isOnline()) {
      await syncToServer();
    }
  }, intervalMs);

  // Sync when page becomes visible (tab switch)
  if (typeof document !== "undefined") {
    // Remove previous listeners to avoid memory leak
    if (visibilityHandler) document.removeEventListener("visibilitychange", visibilityHandler);
    if (onlineHandler) window.removeEventListener("online", onlineHandler);

    visibilityHandler = async () => {
      if (document.visibilityState === "visible" && isOnline()) {
        await fullSync();
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    onlineHandler = async () => {
      await fullSync();
    };
    window.addEventListener("online", onlineHandler);
  }
}

export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  if (visibilityHandler && typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", visibilityHandler);
    visibilityHandler = null;
  }
  if (onlineHandler && typeof window !== "undefined") {
    window.removeEventListener("online", onlineHandler);
    onlineHandler = null;
  }
}

export function getOnlineStatus(): boolean {
  return isOnline();
}
