const DB_KEY = "stockflow_db";

interface DB {
  users: any[];
  stores: any[];
  products: any[];
  orders: any[];
  customers: any[];
  invoices: any[];
  expenses: any[];
  employees: any[];
  suppliers: any[];
  accounts: any[];
  journalEntries: any[];
  purchaseOrders: any[];
  stockMovements: any[];
  shipments: any[];
  returns: any[];
  installments: any[];
  notifications: any[];
  activityLogs: any[];
  warehouses: any[];
  teamMembers: any[];
}

function getDefaultDB(): DB {
  return {
    users: [
      {
        id: "admin-001",
        username: "admin",
        password: "admin123",
        fullName: "مدير النظام",
        email: "admin@stockflow.com",
        role: "admin",
        storeId: "store-001",
        createdAt: new Date().toISOString(),
      },
    ],
    stores: [
      {
        id: "store-001",
        name: "المتجر الرئيسي",
        ownerName: "مدير النظام",
        ownerEmail: "admin@stockflow.com",
        createdAt: new Date().toISOString(),
      },
    ],
    products: [],
    orders: [],
    customers: [],
    invoices: [],
    expenses: [],
    employees: [],
    suppliers: [],
    accounts: [],
    journalEntries: [],
    purchaseOrders: [],
    stockMovements: [],
    shipments: [],
    returns: [],
    installments: [],
    notifications: [],
    activityLogs: [],
    warehouses: [],
    teamMembers: [],
  };
}

export function getDB(): DB {
  if (typeof window === "undefined") return getDefaultDB();
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      const db = getDefaultDB();
      localStorage.setItem(DB_KEY, JSON.stringify(db));
      return db;
    }
    return JSON.parse(raw);
  } catch {
    const db = getDefaultDB();
    localStorage.setItem(DB_KEY, JSON.stringify(db));
    return db;
  }
}

export function saveDB(db: DB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

export function getCollection(name: string): any[] {
  const db = getDB();
  return (db as any)[name] || [];
}

export function setCollection(name: string, data: any[]) {
  const db = getDB();
  (db as any)[name] = data;
  saveDB(db);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function addUser(user: any) {
  const db = getDB();
  db.users.push(user);
  saveDB(db);
}

export function findUserByUsername(username: string): any | null {
  const db = getDB();
  return db.users.find((u) => u.username === username) || null;
}

export function addDocToCollection(collectionName: string, data: any): any {
  const id = generateId();
  const doc = { id, ...data, createdAt: new Date().toISOString() };
  const db = getDB();
  const col = (db as any)[collectionName] || [];
  col.push(doc);
  (db as any)[collectionName] = col;
  saveDB(db);
  return doc;
}

export function getDocsFromCollection(
  collectionName: string,
  filters?: { field: string; op: string; value: any }[]
): any[] {
  let docs = getCollection(collectionName);
  if (filters) {
    for (const f of filters) {
      docs = docs.filter((d: any) => {
        if (f.op === "==") return d[f.field] === f.value;
        if (f.op === "!=") return d[f.field] !== f.value;
        if (f.op === ">") return d[f.field] > f.value;
        if (f.op === "<") return d[f.field] < f.value;
        return true;
      });
    }
  }
  return docs;
}

export function getDocFromCollection(
  collectionName: string,
  id: string
): any | null {
  const docs = getCollection(collectionName);
  return docs.find((d: any) => d.id === id) || null;
}

export function updateDocInCollection(
  collectionName: string,
  id: string,
  data: any
) {
  const db = getDB();
  const col = (db as any)[collectionName] || [];
  const idx = col.findIndex((d: any) => d.id === id);
  if (idx !== -1) {
    col[idx] = { ...col[idx], ...data, updatedAt: new Date().toISOString() };
    (db as any)[collectionName] = col;
    saveDB(db);
  }
}

export function deleteDocFromCollection(collectionName: string, id: string) {
  const db = getDB();
  const col = (db as any)[collectionName] || [];
  (db as any)[collectionName] = col.filter((d: any) => d.id !== id);
  saveDB(db);
}
