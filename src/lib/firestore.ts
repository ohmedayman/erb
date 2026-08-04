import { getAdminFirestore } from "./firebase-admin";

const firestore = getAdminFirestore();

export const collections = {
  stores: firestore.collection("stores"),
  users: firestore.collection("users"),
  products: firestore.collection("products"),
  orders: firestore.collection("orders"),
  shipments: firestore.collection("shipments"),
  teamMembers: firestore.collection("teamMembers"),
  purchaseOrders: firestore.collection("purchaseOrders"),
  notifications: firestore.collection("notifications"),
  warehouses: firestore.collection("warehouses"),
  suppliers: firestore.collection("suppliers"),
  stockMovements: firestore.collection("stockMovements"),
  activityLogs: firestore.collection("activityLogs"),
  returns: firestore.collection("returns"),
  expenses: firestore.collection("expenses"),
  accounts: firestore.collection("accounts"),
  journalEntries: firestore.collection("journalEntries"),
  employees: firestore.collection("employees"),
  invoices: firestore.collection("invoices"),
  customers: firestore.collection("customers"),
};

export function generateId(collection: string): string {
  return firestore.collection(collection).doc().id;
}

export async function getDocById(collection: string, id: string) {
  const doc = await firestore.collection(collection).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function getDocsByField(
  collectionName: string,
  field: string,
  value: string
) {
  const snapshot = await firestore
    .collection(collectionName)
    .where(field, "==", value)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addDoc(collectionName: string, data: any) {
  const id = generateId(collectionName);
  await firestore.collection(collectionName).doc(id).set({ ...data, id });
  return id;
}

export async function updateDoc(
  collectionName: string,
  id: string,
  data: any
) {
  await firestore.collection(collectionName).doc(id).update(data);
}

export async function deleteDoc(collectionName: string, id: string) {
  await firestore.collection(collectionName).doc(id).delete();
}

export async function getAllDocs(collectionName: string) {
  const snapshot = await firestore.collection(collectionName).get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function queryDocs(
  collectionName: string,
  field: string,
  op: FirebaseFirestore.WhereFilterOp,
  value: any
) {
  const snapshot = await firestore
    .collection(collectionName)
    .where(field, op, value)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
