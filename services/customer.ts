import {
   addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* =========================
   TYPES
========================= */

export interface CustomerForm {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

/* =========================
   CRUD FUNCTIONS
========================= */

// Create customer
export async function createCustomer(data: CustomerForm) {
  return await addDoc(collection(db, "customers"), data as DocumentData);
}

// Fetch all customers
export async function getCustomers() {
  const snapshot = await getDocs(collection(db, "customers"));
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

// Update customer
export async function updateCustomer(id: string, data: CustomerForm) {
  return await updateDoc(doc(db, "customers", id), data as DocumentData);
}

// Delete customer
export async function deleteCustomer(id: string) {
  return await deleteDoc(doc(db, "customers", id));
}