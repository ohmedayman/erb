import { supabase } from "./supabase";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export async function getDocsFromCollection(
  collectionName: string,
  filters?: { field: string; op: string; value: any }[]
): Promise<any[]> {
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
    if (error) {
      console.error(`Error fetching ${collectionName}:`, error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error(`Error fetching ${collectionName}:`, err);
    return [];
  }
}

export async function getDocFromCollection(
  collectionName: string,
  id: string
): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from(collectionName)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error(`Error fetching doc from ${collectionName}:`, error);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`Error fetching doc from ${collectionName}:`, err);
    return null;
  }
}

export async function addDocToCollection(
  collectionName: string,
  data: any
): Promise<any> {
  try {
    const doc = {
      id: data.id || generateId(),
      ...data,
      created_at: new Date().toISOString(),
    };

    const { data: inserted, error } = await supabase
      .from(collectionName)
      .insert(doc)
      .select()
      .single();

    if (error) {
      console.error(`Error adding to ${collectionName}:`, error);
      throw error;
    }
    return inserted;
  } catch (err) {
    console.error(`Error adding to ${collectionName}:`, err);
    throw err;
  }
}

export async function updateDocInCollection(
  collectionName: string,
  id: string,
  data: any
): Promise<void> {
  try {
    const { error } = await supabase
      .from(collectionName)
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error(`Error updating ${collectionName}:`, error);
      throw error;
    }
  } catch (err) {
    console.error(`Error updating ${collectionName}:`, err);
    throw err;
  }
}

export async function deleteDocFromCollection(
  collectionName: string,
  id: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from(collectionName)
      .delete()
      .eq("id", id);

    if (error) {
      console.error(`Error deleting from ${collectionName}:`, error);
      throw error;
    }
  } catch (err) {
    console.error(`Error deleting from ${collectionName}:`, err);
    throw err;
  }
}

// Legacy functions for backward compatibility
export function getDB(): any {
  return null;
}

export function saveDB(db: any): void {}

export function getCollection(name: string): any[] {
  return [];
}

export function setCollection(name: string, data: any[]): void {}

export function addUser(user: any): void {}

export function findUserByUsername(username: string): any | null {
  return null;
}
