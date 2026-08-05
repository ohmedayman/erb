import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "stockflow-offline";
const DB_VERSION = 1;

const STORES = [
  "products",
  "customers",
  "orders",
  "invoices",
  "expenses",
  "employees",
  "suppliers",
  "accounts",
  "journal_entries",
  "purchase_orders",
  "stock_movements",
  "shipments",
  "returns",
  "installments",
  "notifications",
  "warehouses",
  "team_members",
  "activity_log",
  "stores",
  "registered_users",
  "subscription_orders",
  "subscription_plans",
  "sync_queue",
] as const;

type CollectionName = (typeof STORES)[number];

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        for (const store of STORES) {
          if (!db.objectStoreNames.contains(store)) {
            const s = db.createObjectStore(store, { keyPath: "id" });
            if (store !== "sync_queue") {
              s.createIndex("store_id", "store_id", { unique: false });
            }
            if (store === "sync_queue") {
              s.createIndex("timestamp", "timestamp", { unique: false });
              s.createIndex("status", "status", { unique: false });
            }
          }
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllFromIDB(collection: CollectionName): Promise<any[]> {
  try {
    const db = await getDB();
    return await db.getAll(collection);
  } catch {
    return [];
  }
}

export async function getFromIDB(collection: CollectionName, id: string): Promise<any | null> {
  try {
    const db = await getDB();
    return await db.get(collection, id) || null;
  } catch {
    return null;
  }
}

export async function putToIDB(collection: CollectionName, data: any): Promise<void> {
  const db = await getDB();
  await db.put(collection, data);
}

export async function putManyToIDB(collection: CollectionName, items: any[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(collection, "readwrite");
  for (const item of items) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function deleteFromIDB(collection: CollectionName, id: string): Promise<void> {
  const db = await getDB();
  await db.delete(collection, id);
}

export async function clearIDB(collection: CollectionName): Promise<void> {
  const db = await getDB();
  await db.clear(collection);
}

export async function addToSyncQueue(entry: {
  id: string;
  collection: string;
  action: "create" | "update" | "delete";
  data?: any;
  documentId?: string;
}): Promise<void> {
  const db = await getDB();
  await db.put("sync_queue", {
    ...entry,
    timestamp: Date.now(),
    status: "pending",
    retries: 0,
  });
}

export async function getSyncQueue(): Promise<any[]> {
  const db = await getDB();
  return await db.getAll("sync_queue");
}

export async function removeSyncEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("sync_queue", id);
}

export async function clearSyncQueue(): Promise<void> {
  const db = await getDB();
  await db.clear("sync_queue");
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB();
  return await db.count("sync_queue");
}
