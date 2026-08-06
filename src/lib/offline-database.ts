"use client";

import { supabase } from "@/lib/supabase";
import {
  getAllFromIDB,
  getFromIDB,
  putToIDB,
  deleteFromIDB,
  addToSyncQueue,
} from "@/lib/offline-db";
import { isOnline } from "@/lib/sync-manager";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Convert camelCase keys to snake_case for Supabase columns
export function toSnakeCase(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

// Convert snake_case keys to camelCase for UI display
export function toCamelCase(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);

  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

// Convert camelCase collection name to snake_case table name
function toTableName(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export async function getDocs(
  collectionName: string,
  filters?: { field: string; op: string; value: any }[],
  storeId?: string
): Promise<any[]> {
  const tableName = toTableName(collectionName);

  if (isOnline()) {
    try {
      let query = supabase.from(tableName).select("*");

      if (storeId) {
        query = query.eq("store_id", storeId);
      }

      if (filters) {
        for (const f of filters) {
          // Convert camelCase filter field to snake_case for Supabase
          const snakeField = f.field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
          switch (f.op) {
            case "==": query = query.eq(snakeField, f.value); break;
            case "!=": query = query.neq(snakeField, f.value); break;
            case ">": query = query.gt(snakeField, f.value); break;
            case "<": query = query.lt(snakeField, f.value); break;
            case ">=": query = query.gte(snakeField, f.value); break;
            case "<=": query = query.lte(snakeField, f.value); break;
          }
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      // Convert snake_case columns to camelCase for UI
      const converted = (data || []).map(toCamelCase);

      if (converted && converted.length > 0) {
        const { putManyToIDB } = await import("@/lib/offline-db");
        await putManyToIDB(collectionName as any, converted);
      }

      return converted;
    } catch {
      return await getAllFromIDB(collectionName as any);
    }
  }

  let data = await getAllFromIDB(collectionName as any);

  if (storeId) {
    data = data.filter((item) => (item.storeId || item.store_id) === storeId);
  }

  if (filters) {
    for (const f of filters) {
      data = data.filter((item) => {
        const val = item[f.field];
        switch (f.op) {
          case "==": return val === f.value;
          case "!=": return val !== f.value;
          case ">": return val > f.value;
          case "<": return val < f.value;
          case ">=": return val >= f.value;
          case "<=": return val <= f.value;
          default: return true;
        }
      });
    }
  }

  data.sort((a, b) => {
    const da = a.created_at || "";
    const db = b.created_at || "";
    return db.localeCompare(da);
  });

  return data;
}

export async function getDoc(collectionName: string, id: string): Promise<any | null> {
  const tableName = toTableName(collectionName);

  if (isOnline()) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        const converted = toCamelCase(data);
        await putToIDB(collectionName as any, converted);
        return converted;
      }

      return data;
    } catch {
      return await getFromIDB(collectionName as any, id);
    }
  }

  return await getFromIDB(collectionName as any, id);
}

export async function addDoc(collectionName: string, data: any): Promise<any> {
  const tableName = toTableName(collectionName);
  const id = data.id || generateId();
  const now = new Date().toISOString();
  const doc = {
    ...data,
    id,
    created_at: data.created_at || now,
    updated_at: now,
  };

  await putToIDB(collectionName as any, doc);

  if (isOnline()) {
    try {
      // Convert camelCase to snake_case for Supabase columns
      const supabaseDoc = toSnakeCase(doc);
      const { error } = await supabase.from(tableName).insert(supabaseDoc);
      if (error) throw error;
      return doc;
    } catch {
      await addToSyncQueue({
        id: generateId(),
        collection: collectionName,
        action: "create",
        data: doc,
      });
      return doc;
    }
  }

  await addToSyncQueue({
    id: generateId(),
    collection: collectionName,
    action: "create",
    data: doc,
  });

  return doc;
}

export async function updateDoc(
  collectionName: string,
  id: string,
  data: any
): Promise<void> {
  const tableName = toTableName(collectionName);
  const now = new Date().toISOString();
  const updateData = { ...data, updated_at: now };

  const existing = await getFromIDB(collectionName as any, id);
  if (existing) {
    await putToIDB(collectionName as any, { ...existing, ...updateData });
  }

  if (isOnline()) {
    try {
      // Convert camelCase to snake_case for Supabase columns
      const supabaseData = toSnakeCase(updateData);
      const { error } = await supabase
        .from(tableName)
        .update(supabaseData)
        .eq("id", id);
      if (error) throw error;
      return;
    } catch {
      await addToSyncQueue({
        id: generateId(),
        collection: collectionName,
        action: "update",
        documentId: id,
        data: updateData,
      });
      return;
    }
  }

  await addToSyncQueue({
    id: generateId(),
    collection: collectionName,
    action: "update",
    documentId: id,
    data: updateData,
  });
}

export async function deleteDoc(collectionName: string, id: string): Promise<void> {
  const tableName = toTableName(collectionName);
  await deleteFromIDB(collectionName as any, id);

  if (isOnline()) {
    try {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", id);
      if (error) throw error;
      return;
    } catch {
      await addToSyncQueue({
        id: generateId(),
        collection: collectionName,
        action: "delete",
        documentId: id,
      });
      return;
    }
  }

  await addToSyncQueue({
    id: generateId(),
    collection: collectionName,
    action: "delete",
    documentId: id,
  });
}
