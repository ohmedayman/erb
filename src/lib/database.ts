import { supabase } from "./supabase";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export async function getDocs(collectionName: string, filters?: { field: string; op: string; value: any }[]): Promise<any[]> {
  try {
    let query = supabase.from(collectionName).select("*");
    if (filters) {
      for (const f of filters) {
        if (f.op === "==") query = query.eq(f.field, f.value);
        else if (f.op === "!=") query = query.neq(f.field, f.value);
        else if (f.op === ">") query = query.gt(f.field, f.value);
        else if (f.op === "<") query = query.lt(f.field, f.value);
        else if (f.op === ">=") query = query.gte(f.field, f.value);
        else if (f.op === "<=") query = query.lte(f.field, f.value);
      }
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) { console.error(`Supabase error on ${collectionName}:`, error); return []; }
    return data || [];
  } catch (err) {
    console.error(`Supabase error on ${collectionName}:`, err);
    return [];
  }
}

export async function getDoc(collectionName: string, id: string): Promise<any | null> {
  try {
    const { data, error } = await supabase.from(collectionName).select("*").eq("id", id).single();
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function addDoc(collectionName: string, data: any): Promise<any> {
  const doc = { id: data.id || generateId(), ...data, created_at: new Date().toISOString() };
  const { data: inserted, error } = await supabase.from(collectionName).insert(doc).select().single();
  if (error) throw error;
  return inserted;
}

export async function updateDoc(collectionName: string, id: string, data: any): Promise<void> {
  const updateData = { ...data, updated_at: new Date().toISOString() };
  const { error } = await supabase.from(collectionName).update(updateData).eq("id", id);
  if (error) throw error;
}

export async function deleteDoc(collectionName: string, id: string): Promise<void> {
  const { error } = await supabase.from(collectionName).delete().eq("id", id);
  if (error) throw error;
}
