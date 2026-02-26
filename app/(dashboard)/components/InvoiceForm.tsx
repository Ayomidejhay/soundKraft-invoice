"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { listenToItems } from "@/services/inventoryService";
import { db } from "@/lib/firebase";
import {
  doc,
  addDoc,
  updateDoc,
  getDoc,
  increment,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

/* ================= TYPES ================= */

interface Customer { id: string; name: string; }
interface Item { id: string; name: string; price_sale: number; price_rental_per_day: number; image?: string; }
interface InvoiceItem { item_id: string; item_name: string; item_image?: string; quantity: number; unit_price: number; total: number; }
interface InvoiceFormData { customer_id: string; invoice_date: string; due_date: string; type: "sale" | "rental"; rental_start_date: string; rental_end_date: string; status: string; notes: string; }
interface InvoiceFormProps { invoiceId?: string | null; onClose: () => void; onSave: () => void; }

/* ================= COMPONENT ================= */

export default function InvoiceForm({ invoiceId, onClose, onSave }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<InvoiceFormData>({
    customer_id: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    type: "sale",
    rental_start_date: "",
    rental_end_date: "",
    status: "draft",
    notes: "",
  });

  /* ================= LOAD CUSTOMERS ================= */
  useEffect(() => {
    async function loadCustomers() {
      const snap = await getDocs(collection(db, "customers"));
      setCustomers(snap.docs.map((d) => ({ id: d.id, name: String(d.data().name) })));
    }
    loadCustomers();
  }, []);

  /* ================= REAL-TIME ITEMS ================= */
  useEffect(() => {
    const unsub = listenToItems((dbItems) => {
      const clean: Item[] = dbItems
        .filter((i) => i.id)
        .map((i) => ({
          id: i.id!,
          name: i.name,
          price_sale: Number(i.price_sale),
          price_rental_per_day: Number(i.price_rental_per_day),
          image: i.image,
        }));
      setItems(clean);
    });
    return () => unsub();
  }, []);

  /* ================= LOAD INVOICE EDIT ================= */
  useEffect(() => {
    if (!invoiceId) return;
    async function loadInvoice() {
      const invSnap = await getDocs(query(collection(db, "invoices"), where("__name__", "==", invoiceId)));
      if (!invSnap.empty) {
        const inv = invSnap.docs[0].data();
        setFormData(inv as InvoiceFormData);
        const itemsSnap = await getDocs(query(collection(db, "invoice_items"), where("invoice_id", "==", invoiceId)));
        setInvoiceItems(itemsSnap.docs.map((d) => d.data() as InvoiceItem));
      }
    }
    loadInvoice();
  }, [invoiceId]);

  /* ================= LINE ITEMS ================= */
  function addInvoiceItem() { setInvoiceItems((prev) => [...prev, { item_id: "", item_name: "", quantity: 1, unit_price: 0, total: 0 }]); }
  function removeInvoiceItem(index: number) { setInvoiceItems((prev) => prev.filter((_, i) => i !== index)); }

  function updateInvoiceItem(index: number, field: keyof InvoiceItem, value: string | number) {
    setInvoiceItems((prev) => {
      const updated = [...prev];
      const row = updated[index];

      if (field === "item_id") {
        const selected = items.find((i) => i.id === value);
        if (selected) {
          row.item_id = selected.id;
          row.item_name = selected.name;
          row.item_image = selected.image;
          if (!row.unit_price || row.unit_price === 0) row.unit_price = formData.type === "sale" ? selected.price_sale : selected.price_rental_per_day;
          if (!row.total || row.total === 0) row.total = row.unit_price * row.quantity;
        }
      } else if (field === "quantity") {
        row.quantity = Math.max(1, Number(value)); // quantity ≥ 1
        row.total = row.unit_price * row.quantity;
      } else if (field === "unit_price") {
        row.unit_price = Math.max(0, Number(value)); // price ≥ 0
        row.total = row.unit_price * row.quantity;
      } else if (field === "total") {
        row.total = Math.max(0, Number(value)); // total ≥ 0
      } else { row[field] = String(value) as never; }

      return updated;
    });
  }

  const calculateTotal = () => invoiceItems.reduce((sum, i) => sum + i.total, 0);

  /* ================= VALIDATION ================= */
  function validateForm() {
    if (!formData.customer_id) return "Select a customer.";
    if (invoiceItems.length === 0) return "Add at least one item.";

    if (formData.type === "rental") {
      if (!formData.rental_start_date || !formData.rental_end_date) return "Enter rental start and end dates.";
      if (formData.rental_end_date < formData.rental_start_date) return "Rental end date cannot be before start date.";
    }

    for (const item of invoiceItems) {
      if (!item.item_id) return "All items must be selected.";
      if (item.quantity < 1) return `Quantity for ${item.item_name} must be at least 1.`;
      if (item.unit_price < 0) return `Unit price for ${item.item_name} cannot be negative.`;
      if (item.total < 0) return `Total for ${item.item_name} cannot be negative.`;
    }

    return null;
  }

  /* ================= SUBMIT ================= */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const error = validateForm();
    if (error) return alert(error);

    setLoading(true);

    try {
      let invoiceRef;
      let invoiceNumber = "";

      if (invoiceId) {
        invoiceRef = doc(db, "invoices", invoiceId);
        await updateDoc(invoiceRef, { ...formData, subtotal: calculateTotal(), tax: 0, total: calculateTotal() });

        const oldItemsSnap = await getDocs(query(collection(db, "invoice_items"), where("invoice_id", "==", invoiceId)));
        for (const d of oldItemsSnap.docs) await deleteDoc(doc(db, "invoice_items", d.id));
      } else {
        const counterRef = doc(db, "counters", "invoices");
        const counterSnap = await getDoc(counterRef);
        const lastNumber = counterSnap.exists() ? counterSnap.data().last_number : 1000;
        invoiceNumber = `INV-${lastNumber + 1}`;
        await updateDoc(counterRef, { last_number: increment(1) });

        invoiceRef = await addDoc(collection(db, "invoices"), { ...formData, invoice_number: invoiceNumber, subtotal: calculateTotal(), tax: 0, total: calculateTotal() });
      }

      for (const it of invoiceItems) await addDoc(collection(db, "invoice_items"), { invoice_id: invoiceRef.id, ...it });

      onSave();
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice");
    } finally { setLoading(false); }
  }

  /* ================= UI ================= */
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between p-4 border-b">
          <h2 className="text-xl font-bold">{invoiceId ? "Edit Invoice" : "Create Invoice"}</h2>
          <button onClick={onClose}><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* CUSTOMER + DATES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Customer</label>
              <select value={formData.customer_id} onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })} className="border p-2 rounded">
                <option value="">Select Customer</option>
                {customers.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Invoice Type</label>
              <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "sale" | "rental" })} className="border p-2 rounded">
                <option value="sale">Sale</option>
                <option value="rental">Rental</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Invoice Date</label>
              <input type="date" value={formData.invoice_date} onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })} className="border p-2 rounded" />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-medium text-gray-700">Due Date</label>
              <input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} className="border p-2 rounded" />
            </div>
          </div>

          {/* RENTAL FIELDS */}
          {formData.type === "rental" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Rental Start Date</label>
                <input type="date" value={formData.rental_start_date} onChange={(e) => setFormData({ ...formData, rental_start_date: e.target.value })} className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Rental End Date</label>
                <input type="date" value={formData.rental_end_date} onChange={(e) => setFormData({ ...formData, rental_end_date: e.target.value })} className="border p-2 rounded" />
              </div>
              <div className="flex flex-col">
                <label className="mb-1 font-medium text-gray-700">Notes</label>
                <input type="text" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} className="border p-2 rounded" placeholder="Optional notes for rental" />
              </div>
            </div>
          )}

          {/* INVOICE ITEMS */}
          <div>
            <h3 className="font-semibold mb-2">Invoice Items</h3>
            <div className="grid grid-cols-12 gap-2 mb-1 text-sm font-semibold text-gray-700">
              <div className="col-span-4 text-center">Item</div>
              <div className="col-span-1">Image</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-1"></div>
            </div>

            {invoiceItems.map((it, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded">
                <select className="col-span-4 border p-2 rounded" value={it.item_id} onChange={(e) => updateInvoiceItem(idx, "item_id", e.target.value)}>
                  <option value="">Select Item</option>
                  {items.map((i) => (<option key={i.id} value={i.id}>{i.name}</option>))}
                </select>

                <div className="col-span-1">{it.item_image && <Image src={it.item_image} alt={it.item_name} width={80} height={80} className="rounded border" />}</div>

                <input type="number" className="col-span-2 border p-2" value={it.quantity} onChange={(e) => updateInvoiceItem(idx, "quantity", e.target.value)} min={1} />

                <div className="col-span-2 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input type="number" className="w-full pl-6 border p-2 text-right" value={it.unit_price} onChange={(e) => updateInvoiceItem(idx, "unit_price", e.target.value)} min={0} />
                </div>

                <div className="col-span-2 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                  <input type="number" className="w-full pl-6 border p-2 text-right" value={it.total} onChange={(e) => updateInvoiceItem(idx, "total", e.target.value)} min={0} />
                </div>

                <button type="button" className="col-span-1 text-red-600 flex justify-end" onClick={() => removeInvoiceItem(idx)}>
                  <Trash2 />
                </button>
              </div>
            ))}

            <button type="button" onClick={addInvoiceItem} className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1">
              <Plus size={16} /> Add Item
            </button>
          </div>

          {/* TOTAL */}
          <div className="text-right font-bold text-lg">Total: ₦{calculateTotal().toLocaleString()}</div>

          {/* ACTIONS */}
          <div className="flex flex-col md:flex-row justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded w-full md:w-auto">Cancel</button>
            <button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto">{loading ? "Saving..." : invoiceId ? "Update" : "Create"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}