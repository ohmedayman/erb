import { getDocs, getDoc, addDoc, updateDoc, deleteDoc, generateId } from "./database";

export { generateId };

export async function getDocsFromCollection(
  collectionName: string,
  filters?: { field: string; op: string; value: any }[]
): Promise<any[]> {
  return getDocs(collectionName, filters);
}

export async function getDocFromCollection(
  collectionName: string,
  id: string
): Promise<any | null> {
  return getDoc(collectionName, id);
}

export async function addDocToCollection(
  collectionName: string,
  data: any
): Promise<any> {
  return addDoc(collectionName, data);
}

export async function updateDocInCollection(
  collectionName: string,
  id: string,
  data: any
): Promise<void> {
  return updateDoc(collectionName, id, data);
}

export async function deleteDocFromCollection(
  collectionName: string,
  id: string
): Promise<void> {
  return deleteDoc(collectionName, id);
}
