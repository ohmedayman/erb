let _firestore: any = null;

async function getDb() {
  if (!_firestore) {
    const { getAdminFirestore } = await import("./firebase-admin");
    _firestore = await getAdminFirestore();
  }
  return _firestore;
}

export async function col(name: string) {
  const db = await getDb();
  return db.collection(name);
}

export const collections = new Proxy({} as Record<string, any>, {
  get(_target, prop: string) {
    return getDb().then((db: any) => db.collection(prop));
  },
});

export function generateId(collection: string): Promise<string> {
  return getDb().then((db: any) => db.collection(collection).doc().id);
}

export async function getDocById(collection: string, id: string) {
  const db = await getDb();
  const doc = await db.collection(collection).doc(id).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function getDocsByField(
  collectionName: string,
  field: string,
  value: string
) {
  const db = await getDb();
  const snapshot = await db
    .collection(collectionName)
    .where(field, "==", value)
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function addDoc(collectionName: string, data: any) {
  const id = await generateId(collectionName);
  const db = await getDb();
  await db.collection(collectionName).doc(id).set({ ...data, id });
  return id;
}

export async function updateDoc(
  collectionName: string,
  id: string,
  data: any
) {
  const db = await getDb();
  await db.collection(collectionName).doc(id).update(data);
}

export async function deleteDoc(collectionName: string, id: string) {
  const db = await getDb();
  await db.collection(collectionName).doc(id).delete();
}

export async function getAllDocs(collectionName: string) {
  const db = await getDb();
  const snapshot = await db.collection(collectionName).get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}

export async function queryDocs(
  collectionName: string,
  field: string,
  op: string,
  value: any
) {
  const db = await getDb();
  const snapshot = await db
    .collection(collectionName)
    .where(field, op, value)
    .get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
}
