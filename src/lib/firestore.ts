import { getAdminFirestore } from "./firebase-admin";

let _firestore: ReturnType<typeof getAdminFirestore> | null = null;

function firestore() {
  if (!_firestore) {
    _firestore = getAdminFirestore();
  }
  return _firestore;
}

function col(name: string) {
  return firestore().collection(name);
}

export const collections = {
  get stores() { return col("stores"); },
  get users() { return col("users"); },
  get products() { return col("products"); },
  get orders() { return col("orders"); },
  get shipments() { return col("shipments"); },
  get teamMembers() { return col("teamMembers"); },
  get purchaseOrders() { return col("purchaseOrders"); },
  get notifications() { return col("notifications"); },
  get warehouses() { return col("warehouses"); },
  get suppliers() { return col("suppliers"); },
  get stockMovements() { return col("stockMovements"); },
  get activityLogs() { return col("activityLogs"); },
  get returns() { return col("returns"); },
  get expenses() { return col("expenses"); },
  get accounts() { return col("accounts"); },
  get journalEntries() { return col("journalEntries"); },
  get employees() { return col("employees"); },
  get invoices() { return col("invoices"); },
  get customers() { return col("customers"); },
  get installments() { return col("installments"); },
};

export function generateId(collection: string): string {
  return firestore().collection(collection).doc().id;
}

export async function getDocById(collection: string, id: string) {
  const doc = await firestore().collection(collection).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function getDocsByField(
  collectionName: string,
  field: string,
  value: string
) {
  const snapshot = await firestore()
    .collection(collectionName)
    .where(field, "==", value)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addDoc(collectionName: string, data: any) {
  const id = generateId(collectionName);
  await firestore().collection(collectionName).doc(id).set({ ...data, id });
  return id;
}

export async function updateDoc(
  collectionName: string,
  id: string,
  data: any
) {
  await firestore().collection(collectionName).doc(id).update(data);
}

export async function deleteDoc(collectionName: string, id: string) {
  await firestore().collection(collectionName).doc(id).delete();
}

export async function getAllDocs(collectionName: string) {
  const snapshot = await firestore().collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function queryDocs(
  collectionName: string,
  field: string,
  op: FirebaseFirestore.WhereFilterOp,
  value: any
) {
  const snapshot = await firestore()
    .collection(collectionName)
    .where(field, op, value)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
