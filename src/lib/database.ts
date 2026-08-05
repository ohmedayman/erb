import { supabase } from "./supabase";

const isServer = typeof window === "undefined";
const isDev = process.env.NODE_ENV === "development";

let sqliteDb: any = null;

async function getSqliteDb() {
  if (sqliteDb) return sqliteDb;
  if (!isServer) return null;

  try {
    const Database = (await import("better-sqlite3")).default;
    const path = await import("path");
    const fs = await import("fs");

    const dbDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, "stockflow.db");
    sqliteDb = new Database(dbPath);

    initSqliteTables(sqliteDb);
    return sqliteDb;
  } catch (err) {
    console.error("SQLite not available, falling back to Supabase:", err);
    return null;
  }
}

function initSqliteTables(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stores (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_name TEXT,
      owner_email TEXT,
      phone TEXT,
      address TEXT,
      currency TEXT DEFAULT 'EGP',
      tax_rate REAL DEFAULT 15.00,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      sku TEXT,
      barcode TEXT,
      category TEXT,
      description TEXT,
      price REAL DEFAULT 0,
      cost_price REAL DEFAULT 0,
      stock INTEGER DEFAULT 0,
      min_stock INTEGER DEFAULT 10,
      status TEXT DEFAULT 'Active',
      store_id TEXT,
      image_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      type TEXT DEFAULT 'regular',
      balance REAL DEFAULT 0,
      notes TEXT,
      store_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT,
      customer_id TEXT,
      customer_name TEXT,
      items TEXT,
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      payment_status TEXT DEFAULT 'unpaid',
      payment_method TEXT,
      notes TEXT,
      store_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT,
      customer_id TEXT,
      customer_name TEXT,
      items TEXT,
      subtotal REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      status TEXT DEFAULT 'draft',
      payment_method TEXT,
      due_date TEXT,
      notes TEXT,
      store_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount REAL DEFAULT 0,
      category TEXT,
      payment_method TEXT,
      receipt_number TEXT,
      date TEXT,
      notes TEXT,
      store_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS employees (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      position TEXT,
      department TEXT,
      salary REAL DEFAULT 0,
      hire_date TEXT,
      status TEXT DEFAULT 'active',
      store_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      address TEXT,
      balance REAL DEFAULT 0,
      notes TEXT,
      store_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscription_orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      user_phone TEXT,
      plan_name TEXT DEFAULT 'StockFlow Pro',
      plan_price REAL DEFAULT 3000.00,
      plan_duration TEXT DEFAULT 'سنوياً',
      payment_method TEXT NOT NULL,
      payment_details TEXT,
      transaction_id TEXT,
      screenshot_url TEXT,
      status TEXT DEFAULT 'pending',
      admin_note TEXT,
      approved_at TEXT,
      expires_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

function shouldUseSqlite(): boolean {
  if (!isServer) return false;
  return isDev;
}

export async function getDocs(collectionName: string, filters?: { field: string; op: string; value: any }[]): Promise<any[]> {
  if (shouldUseSqlite()) {
    const db = await getSqliteDb();
    if (db) {
      try {
        let sql = `SELECT * FROM ${collectionName}`;
        const params: any[] = [];

        if (filters && filters.length > 0) {
          const conditions = filters.map((f) => {
            if (f.op === "==") { params.push(f.value); return `${f.field} = ?`; }
            if (f.op === "!=") { params.push(f.value); return `${f.field} != ?`; }
            if (f.op === ">") { params.push(f.value); return `${f.field} > ?`; }
            if (f.op === "<") { params.push(f.value); return `${f.field} < ?`; }
            if (f.op === ">=") { params.push(f.value); return `${f.field} >= ?`; }
            if (f.op === "<=") { params.push(f.value); return `${f.field} <= ?`; }
            return "1=1";
          });
          sql += ` WHERE ${conditions.join(" AND ")}`;
        }

        sql += ` ORDER BY created_at DESC`;
        const rows = db.prepare(sql).all(...params);
        return rows.map((row) => ({
          ...row,
          items: row.items ? safeParse(row.items) : row.items,
        }));
      } catch (err) {
        console.error(`SQLite error on ${collectionName}:`, err);
        return [];
      }
    }
  }

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
  if (shouldUseSqlite()) {
    const db = await getSqliteDb();
    if (db) {
      try {
        const row = db.prepare(`SELECT * FROM ${collectionName} WHERE id = ?`).get(id);
        if (row && row.items) row.items = safeParse(row.items);
        return row || null;
      } catch (err) { return null; }
    }
  }

  try {
    const { data, error } = await supabase.from(collectionName).select("*").eq("id", id).single();
    if (error) return null;
    return data;
  } catch { return null; }
}

export async function addDoc(collectionName: string, data: any): Promise<any> {
  const doc = { id: data.id || generateId(), ...data, created_at: new Date().toISOString() };

  if (shouldUseSqlite()) {
    const db = await getSqliteDb();
    if (db) {
      try {
        const keys = Object.keys(doc);
        const values = keys.map((k) => {
          const v = doc[k];
          return typeof v === "object" ? JSON.stringify(v) : v;
        });
        const placeholders = keys.map(() => "?").join(", ");
        db.prepare(`INSERT INTO ${collectionName} (${keys.join(", ")}) VALUES (${placeholders})`).run(...values);
        return doc;
      } catch (err) { console.error(`SQLite insert error on ${collectionName}:`, err); throw err; }
    }
  }

  const { data: inserted, error } = await supabase.from(collectionName).insert(doc).select().single();
  if (error) throw error;
  return inserted;
}

export async function updateDoc(collectionName: string, id: string, data: any): Promise<void> {
  const updateData = { ...data, updated_at: new Date().toISOString() };

  if (shouldUseSqlite()) {
    const db = await getSqliteDb();
    if (db) {
      try {
        const keys = Object.keys(updateData);
        const values = keys.map((k) => {
          const v = updateData[k];
          return typeof v === "object" ? JSON.stringify(v) : v;
        });
        const setClause = keys.map((k) => `${k} = ?`).join(", ");
        db.prepare(`UPDATE ${collectionName} SET ${setClause} WHERE id = ?`).run(...values, id);
        return;
      } catch (err) { console.error(`SQLite update error on ${collectionName}:`, err); throw err; }
    }
  }

  const { error } = await supabase.from(collectionName).update(updateData).eq("id", id);
  if (error) throw error;
}

export async function deleteDoc(collectionName: string, id: string): Promise<void> {
  if (shouldUseSqlite()) {
    const db = await getSqliteDb();
    if (db) {
      try {
        db.prepare(`DELETE FROM ${collectionName} WHERE id = ?`).run(id);
        return;
      } catch (err) { console.error(`SQLite delete error on ${collectionName}:`, err); throw err; }
    }
  }

  const { error } = await supabase.from(collectionName).delete().eq("id", id);
  if (error) throw error;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function safeParse(str: string): any {
  try { return JSON.parse(str); } catch { return str; }
}
