// services/inventoryService.ts
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  where,
  onSnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  Query,
} from "firebase/firestore";
import { Item } from "@/types/item";

const inventoryCollection = collection(db, "inventory");

/* ================= CREATE ITEM ================= */
export async function createItem(data: Omit<Item, "id" | "createdAt">) {
  return await addDoc(inventoryCollection, {
    ...data,
    createdAt: new Date(),
    name_lower: data.name.toLowerCase(), // needed for search
  });
}

/* ================= UPDATE ITEM ================= */
export async function updateItem(id: string, data: Partial<Item>) {
  return await updateDoc(doc(db, "inventory", id), data);
}

/* ================= DELETE ITEM ================= */
export async function deleteItem(id: string) {
  return await deleteDoc(doc(db, "inventory", id));
}

/* ================= PAGINATION + SEARCH ================= */
export async function getItemsPaginated(
  pageSize: number,
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null,
  search?: string
) {
  let q: Query<DocumentData>;

  if (search && search.trim() !== "") {
    const term = search.toLowerCase();

    q = query(
      inventoryCollection,
      where("name_lower", ">=", term),
      where("name_lower", "<=", term + "\uf8ff"),
      orderBy("name_lower"),
      limit(pageSize)
    );
  } else {
    q = query(
      inventoryCollection,
      orderBy("createdAt", "desc"),
      limit(pageSize)
    );
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }

  const snapshot = await getDocs(q);

  const items: Item[] = snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Item, "id">),
  }));

  return {
    items,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] ?? null,
  };
}

/* ================= REAL-TIME LISTENER ================= */
export function listenToItems(
  callback: (items: Item[]) => void,
  search?: string
) {
  let q: Query<DocumentData>;

  if (search && search.trim() !== "") {
    const term = search.toLowerCase();
    q = query(
      inventoryCollection,
      where("name_lower", ">=", term),
      where("name_lower", "<=", term + "\uf8ff"),
      orderBy("name_lower")
    );
  } else {
    q = query(inventoryCollection, orderBy("createdAt", "desc"));
  }

  return onSnapshot(q, (snapshot) => {
    const items: Item[] = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Item, "id">),
    }));

    callback(items);
  });
}