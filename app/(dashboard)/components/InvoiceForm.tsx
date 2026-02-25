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

interface Customer {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  price_sale: number;
  price_rental_per_day: number;
  image?: string;
}

interface InvoiceItem {
  item_id: string;
  item_name: string;
  item_image?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceFormData {
  customer_id: string;
  invoice_date: string;
  due_date: string;
  type: "sale" | "rental";
  rental_start_date: string;
  rental_end_date: string;
  status: string;
  notes: string;
}

interface InvoiceFormProps {
  invoiceId?: string | null;
  onClose: () => void;
  onSave: () => void;
}

/* ================= COMPONENT ================= */

export default function InvoiceForm({
  invoiceId,
  onClose,
  onSave,
}: InvoiceFormProps) {
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
      setCustomers(
        snap.docs.map((d) => ({ id: d.id, name: String(d.data().name) })),
      );
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

      console.log("Inventory Loaded:", clean);
      setItems(clean);
    });

    return () => unsub();
  }, []);

  /* ================= LOAD INVOICE EDIT ================= */

  useEffect(() => {
    if (!invoiceId) return;

    async function loadInvoice() {
      const invSnap = await getDocs(
        query(collection(db, "invoices"), where("__name__", "==", invoiceId)),
      );

      if (!invSnap.empty) {
        const inv = invSnap.docs[0].data();

        setFormData(inv as InvoiceFormData);

        const itemsSnap = await getDocs(
          query(
            collection(db, "invoice_items"),
            where("invoice_id", "==", invoiceId),
          ),
        );

        setInvoiceItems(itemsSnap.docs.map((d) => d.data() as InvoiceItem));
      }
    }

    loadInvoice();
  }, [invoiceId]);

  /* ================= LINE ITEMS ================= */

  function addInvoiceItem() {
    setInvoiceItems((prev) => [
      ...prev,
      { item_id: "", item_name: "", quantity: 1, unit_price: 0, total: 0 },
    ]);
  }

  function removeInvoiceItem(index: number) {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  }

  //   function updateInvoiceItem(index: number, field: keyof InvoiceItem, value: string | number) {
  //   setInvoiceItems(prev => {
  //     const updated = [...prev];
  //     const row = updated[index];

  //     if (field === "item_id") {
  //       const selected = items.find(i => i.id === value);
  //       if (selected) {
  //         row.item_id = selected.id;
  //         row.item_name = selected.name;
  //         row.item_image = selected.image;

  //         // ✅ Only set unit_price if it's empty (allow manual edits afterward)
  //         if (!row.unit_price || row.unit_price === 0) {
  //           row.unit_price = formData.type === "sale"
  //             ? selected.price_sale
  //             : selected.price_rental_per_day;
  //         }
  //       }
  //     }
  //     else if (field === "quantity" || field === "unit_price") {
  //       row[field] = Number(value);
  //     }
  //     else {
  //       row[field] = String(value) as never;
  //     }

  //     // Always recalc total
  //     row.total = row.unit_price * row.quantity;
  //     return updated;
  //   });
  // }
  function updateInvoiceItem(
    index: number,
    field: keyof InvoiceItem,
    value: string | number,
  ) {
    setInvoiceItems((prev) => {
      const updated = [...prev];
      const row = updated[index];

      if (field === "item_id") {
        const selected = items.find((i) => i.id === value);
        if (selected) {
          row.item_id = selected.id;
          row.item_name = selected.name;
          row.item_image = selected.image;

          // Only set unit_price if it's empty or zero
          if (!row.unit_price || row.unit_price === 0) {
            row.unit_price =
              formData.type === "sale"
                ? selected.price_sale
                : selected.price_rental_per_day;
          }

          // Only set total if it's zero
          if (!row.total || row.total === 0) {
            row.total = row.unit_price * row.quantity;
          }
        }
      } else if (field === "quantity") {
        row.quantity = Number(value);
        // Recalculate total automatically
        row.total = row.unit_price * row.quantity;
      } else if (field === "unit_price") {
        row.unit_price = Number(value);
        // Recalculate total automatically
        row.total = row.unit_price * row.quantity;
      } else if (field === "total") {
        // ✅ Allow manual total override
        row.total = Number(value);
      } else {
        row[field] = String(value) as never;
      }

      return updated;
    });
  }

  const calculateTotal = () =>
    invoiceItems.reduce((sum, i) => sum + i.total, 0);

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.customer_id) return alert("Select customer");
    if (!invoiceItems.length) return alert("Add items");

    setLoading(true);

    try {
      let invoiceRef;
      let invoiceNumber = "";

      if (invoiceId) {
        // ================= EDIT EXISTING INVOICE =================
        invoiceRef = doc(db, "invoices", invoiceId);

        await updateDoc(invoiceRef, {
          ...formData,
          subtotal: calculateTotal(),
          tax: 0,
          total: calculateTotal(),
        });

        // Delete old invoice items
        const oldItemsSnap = await getDocs(
          query(
            collection(db, "invoice_items"),
            where("invoice_id", "==", invoiceId),
          ),
        );
        for (const d of oldItemsSnap.docs) {
          await deleteDoc(doc(db, "invoice_items", d.id));
        }
      } else {
        // ================= CREATE NEW INVOICE =================
        const counterRef = doc(db, "counters", "invoices");

        // Read the last number
        const counterSnap = await getDoc(counterRef);
        const lastNumber = counterSnap.exists()
          ? counterSnap.data().last_number
          : 1000;

        // Generate next invoice number
        invoiceNumber = `INV-${lastNumber + 1}`;

        // Atomically increment the counter in Firestore
        await updateDoc(counterRef, { last_number: increment(1) });

        // Add new invoice
        invoiceRef = await addDoc(collection(db, "invoices"), {
          ...formData,
          invoice_number: invoiceNumber,
          subtotal: calculateTotal(),
          tax: 0,
          total: calculateTotal(),
        });
      }

      // ================= ADD INVOICE ITEMS =================
      for (const it of invoiceItems) {
        await addDoc(collection(db, "invoice_items"), {
          invoice_id: invoiceRef.id,
          ...it,
        });
      }

      onSave();
    } catch (err) {
      console.error(err);
      alert("Failed to save invoice");
    } finally {
      setLoading(false);
    }
  }

  /* ================= UI ================= */

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-6xl rounded-lg max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {invoiceId ? "Edit Invoice" : "Create Invoice"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* CUSTOMER + DATES */}
          <div className="grid md:grid-cols-2 gap-4">
            <select
              value={formData.customer_id}
              onChange={(e) =>
                setFormData({ ...formData, customer_id: e.target.value })
              }
              className="border p-2 rounded"
            >
              <option value="">Select Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "sale" | "rental",
                })
              }
              className="border p-2 rounded"
            >
              <option value="sale">Sale</option>
              <option value="rental">Rental</option>
            </select>

            <input
              type="date"
              value={formData.invoice_date}
              onChange={(e) =>
                setFormData({ ...formData, invoice_date: e.target.value })
              }
              className="border p-2 rounded"
            />

            <input
              type="date"
              value={formData.due_date}
              onChange={(e) =>
                setFormData({ ...formData, due_date: e.target.value })
              }
              className="border p-2 rounded"
            />
          </div>

          {/* ITEMS */}
          <div>
            <h3 className="font-semibold mb-2">Invoice Items</h3>

            <div className="grid grid-cols-12 gap-2 mb-1 text-sm font-semibold text-gray-700">
              <div className="col-span-4 text-center">Item</div>
              <div className="col-span-1">Image</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-center">Unit Price</div>
              <div className="col-span-2 text-center">Total</div>
              <div className="col-span-1"></div> {/* for delete button */}
            </div>

            {invoiceItems.map((it, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 gap-2 mb-2 items-center bg-gray-50 p-2 rounded"
              >
                {/* ITEM SELECT */}
                <select
                  className="col-span-4 border p-2 rounded"
                  value={it.item_id}
                  onChange={(e) =>
                    updateInvoiceItem(idx, "item_id", e.target.value)
                  }
                >
                  <option value="">Select Item</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name}
                    </option>
                  ))}
                </select>

                {/* IMAGE */}
                <div className="col-span-1">
                  {it.item_image && (
                    <Image
                      src={it.item_image}
                      alt={it.item_name}
                      width={80}
                      height={80}
                      className="rounded border"
                    />
                  )}
                </div>

                {/* QUANTITY */}
                <input
                  type="number"
                  className="col-span-2 border p-2"
                  value={it.quantity}
                  onChange={(e) =>
                    updateInvoiceItem(idx, "quantity", e.target.value)
                  }
                />

                {/* UNIT PRICE */}
                <div className="col-span-2 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                  <input
                    type="number"
                    className="w-full pl-6 border p-2 text-right"
                    value={it.unit_price}
                    onChange={(e) =>
                      updateInvoiceItem(idx, "unit_price", e.target.value)
                    }
                  />
                </div>

                {/* TOTAL (now editable) */}
                <div className="col-span-2 relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                  <input
                    type="number"
                    className="w-full pl-6 border p-2 text-right"
                    value={it.total}
                    onChange={(e) =>
                      updateInvoiceItem(idx, "total", e.target.value)
                    }
                  />
                </div>

                {/* DELETE BUTTON */}
                <button
                  type="button"
                  className="col-span-1 text-red-600 flex justify-end"
                  onClick={() => removeInvoiceItem(idx)}
                >
                  <Trash2 />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addInvoiceItem}
              className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {/* TOTAL */}
          <div className="text-right font-bold text-lg">
            Total: ₦{calculateTotal().toLocaleString()}
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading ? "Saving..." : invoiceId ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
