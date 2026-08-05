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

export async function getDocs(
  collectionName: string,
  filters?: { field: string; op: string; value: any }[],
  storeId?: string
): Promise<any[]> {
  if (isOnline()) {
    try {
      let query = supabase.from(collectionName).select("*");

      if (storeId) {
        query = query.eq("store_id", storeId);
      }

      if (filters) {
        for (const f of filters) {
          switch (f.op) {
            case "==": query = query.eq(f.field, f.value); break;
            case "!=": query = query.neq(f.field, f.value); break;
            case ">": query = query.gt(f.field, f.value); break;
            case "<": query = query.lt(f.field, f.value); break;
            case ">=": query = query.gte(f.field, f.value); break;
            case "<=": query = query.lte(f.field, f.value); break;
          }
        }
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;

      if (data && data.length > 0) {
        const { putManyToIDB } = await import("@/lib/offline-db");
        await putManyToIDB(collectionName as any, data);
      }

      return data || [];
    } catch {
      return await getAllFromIDB(collectionName as any);
    }
  }

  let data = await getAllFromIDB(collectionName as any);

  if (storeId) {
    data = data.filter((item) => item.store_id === storeId);
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
  if (isOnline()) {
    try {
      const { data, error } = await supabase
        .from(collectionName)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        await putToIDB(collectionName as any, data);
      }

      return data;
    } catch {
      return await getFromIDB(collectionName as any, id);
    }
  }

  return await getFromIDB(collectionName as any, id);
}

export async function addDoc(collectionName: string, data: any): Promise<any> {
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
      const { error } = await supabase.from(collectionName).insert(doc);
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
  const now = new Date().toISOString();
  const updateData = { ...data, updated_at: now };

  const existing = await getFromIDB(collectionName as any, id);
  if (existing) {
    await putToIDB(collectionName as any, { ...existing, ...updateData });
  }

  if (isOnline()) {
    try {
      const { error } = await supabase
        .from(collectionName)
        .update(updateData)
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
  await deleteFromIDB(collectionName as any, id);

  if (isOnline()) {
    try {
      const { error } = await supabase
        .from(collectionName)
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
