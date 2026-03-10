// "use client";

// import { useEffect, useState } from "react";
// import { X, Plus, Trash2 } from "lucide-react";
// import Image from "next/image";
// import { supabase } from "@/lib/supabase";

// /* ================= TYPES ================= */

// interface Customer {
//   id: string;
//   name: string;
// }

// interface Item {
//   id: string;
//   name: string;
//   image?: string;
//   price_sale: number;
//   price_rental_per_day: number;
//   stock_quantity: number;
// }

// interface InvoiceItem {
//   id?: string;
//   item_id: string;
//   item_name: string;
//   item_image?: string;
//   quantity: number;
//   unit_price: number;
//   total: number;
// }

// interface InvoiceFormData {
//   customer_id: string;
//   customer_name: string;
//   invoice_date: string;
//   due_date: string;
//   type: "sale" | "rental";
//   rental_start_date?: string | null;
//   rental_end_date?: string | null;
//   status: "draft" | "sent" | "paid" | "overdue";
//   notes?: string | null;
// }

// interface InvoiceFormProps {
//   invoiceId?: string | null;
//   onClose: () => void;
//   onSave: () => void;
// }

// /* ================= COMPONENT ================= */

// export default function InvoiceForm({
//   invoiceId,
//   onClose,
//   onSave,
// }: InvoiceFormProps) {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [items, setItems] = useState<Item[]>([]);
//   const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState<InvoiceFormData>({
//     customer_id: "",
//     customer_name: "",
//     invoice_date: new Date().toISOString().split("T")[0],
//     due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
//     type: "sale",
//     rental_start_date: null,
//     rental_end_date: null,
//     status: "draft",
//     notes: "",
//   });

//   /* ================= LOAD DATA ================= */

//   useEffect(() => {
//     loadCustomers();
//     loadItems();
//   }, []);

//   async function loadCustomers() {
//     const { data } = await supabase
//       .from("customers")
//       .select("id, name")
//       .order("name");

//     if (data) setCustomers(data);
//   }

//   async function loadItems() {
//     const { data } = await supabase
//       .from("items")
//       .select("id,name,image,price_sale,price_rental_per_day,stock_quantity")
//       .order("name");

//     if (data) setItems(data);
//   }

//   /* ================= LOAD INVOICE ================= */

//   useEffect(() => {
//     if (!invoiceId) return;

//     async function loadInvoice() {
//       const { data } = await supabase
//         .from("invoices")
//         .select(`*, invoice_items (*)`)
//         .eq("id", invoiceId)
//         .single();

//       if (!data) return;

//       setFormData({
//         customer_id: data.customer_id,
//         customer_name: data.customer_name,
//         invoice_date: data.invoice_date,
//         due_date: data.due_date,
//         type: data.type,
//         rental_start_date: data.rental_start_date,
//         rental_end_date: data.rental_end_date,
//         status: data.status,
//         notes: data.notes,
//       });

//       setInvoiceItems(data.invoice_items || []);
//     }

//     loadInvoice();
//   }, [invoiceId]);

//   /* ================= RENTAL DAYS ================= */

//   function getRentalDays() {
//     if (!formData.rental_start_date || !formData.rental_end_date) return 1;

//     const start = new Date(formData.rental_start_date);
//     const end = new Date(formData.rental_end_date);

//     const diff = Math.ceil(
//       (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
//     );

//     return diff > 0 ? diff : 1;
//   }

//   const rentalDays = getRentalDays();

//   /* ================= ITEM LOGIC ================= */

//   function addInvoiceItem() {
//     setInvoiceItems((prev) => [
//       ...prev,
//       {
//         item_id: "",
//         item_name: "",
//         quantity: 1,
//         unit_price: 0,
//         total: 0,
//       },
//     ]);
//   }

//   function removeInvoiceItem(index: number) {
//     setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
//   }

//   function updateInvoiceItem(
//     index: number,
//     field: keyof InvoiceItem,
//     value: string | number,
//   ) {
//     setInvoiceItems((prev) => {
//       const updated = [...prev];
//       const row = updated[index];

//       if (field === "item_id") {
//         const selected = items.find((i) => i.id === value);

//         if (selected) {
//           const basePrice =
//             formData.type === "sale"
//               ? selected.price_sale
//               : selected.price_rental_per_day;

//           row.item_id = selected.id;
//           row.item_name = selected.name;
//           row.item_image = selected.image;
//           row.unit_price = basePrice;

//           const multiplier = formData.type === "rental" ? rentalDays : 1;

//           row.total = basePrice * row.quantity * multiplier;
//         }
//       }

//       if (field === "quantity") {
//         const qty = Math.max(1, Number(value));

//         const selected = items.find((i) => i.id === row.item_id);

//         if (selected && qty > selected.stock_quantity) {
//           alert(`Only ${selected.stock_quantity} items available in stock`);
//           return prev;
//         }

//         row.quantity = qty;

//         const multiplier = formData.type === "rental" ? rentalDays : 1;

//         row.total = row.unit_price * qty * multiplier;
//       }

//       if (field === "unit_price") {
//         row.unit_price = Math.max(0, Number(value));

//         const multiplier = formData.type === "rental" ? rentalDays : 1;

//         row.total = row.unit_price * row.quantity * multiplier;
//       }

//       return updated;
//     });
//   }

//   /* ================= LIVE SUBTOTAL ================= */

//   const subtotal = invoiceItems.reduce((sum, i) => sum + i.total, 0);

//   /* ================= SUBMIT ================= */

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       let invoice_id = invoiceId;

//       if (!invoiceId) {
//         const invoiceNumber = `INV-${Date.now()}`;

//         const { data, error } = await supabase
//           .from("invoices")
//           .insert([
//             {
//               ...formData,
//               invoice_number: invoiceNumber,
//               subtotal,
//               tax: 0,
//               discount: 0,
//               total: subtotal,
//             },
//           ])
//           .select()
//           .single();

//         if (error) throw error;

//         invoice_id = data.id;
//       }

//       if (invoiceId) {
//         await supabase
//           .from("invoices")
//           .update({
//             ...formData,
//             subtotal,
//             total: subtotal,
//           })
//           .eq("id", invoiceId);

//         await supabase
//           .from("invoice_items")
//           .delete()
//           .eq("invoice_id", invoiceId);
//       }

//       if (invoiceItems.length && invoice_id) {
//         const payload = invoiceItems.map((item) => ({
//           invoice_id,
//           ...item,
//         }));

//         const { error } = await supabase.from("invoice_items").insert(payload);

//         if (error) throw error;
//       }

//       onSave();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save invoice");
//     } finally {
//       setLoading(false);
//     }
//   }

//   /* ================= UI ================= */

//   return (
//     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white w-full max-w-6xl rounded-lg max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between p-4 border-b">
//           <h2 className="text-xl font-bold">
//             {invoiceId ? "Edit Invoice" : "Create Invoice"}
//           </h2>

//           <button onClick={onClose}>
//             <X />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           {/* CUSTOMER */}

//           <div>
//             <label className="block text-sm font-semibold mb-1">Customer</label>

//             <select
//               value={formData.customer_id}
//               onChange={(e) => {
//                 const selected = customers.find((c) => c.id === e.target.value);

//                 setFormData({
//                   ...formData,
//                   customer_id: e.target.value,
//                   customer_name: selected?.name || "",
//                 });
//               }}
//               className="border p-2 rounded w-full"
//             >
//               <option value="">Select Customer</option>

//               {customers.map((c) => (
//                 <option key={c.id} value={c.id}>
//                   {c.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           {/* TYPE */}

//           <div>
//             <label className="block text-sm font-semibold mb-1">
//               Invoice Type
//             </label>

//             <select
//               value={formData.type}
//               onChange={(e) =>
//                 setFormData({
//                   ...formData,
//                   type: e.target.value as "sale" | "rental",
//                 })
//               }
//               className="border p-2 rounded w-full"
//             >
//               <option value="sale">Sale</option>
//               <option value="rental">Rental</option>
//             </select>
//           </div>

//           {/* RENTAL DATES */}

//           {formData.type === "rental" && (
//             <div className="grid md:grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold mb-1">
//                   Rental Start Date
//                 </label>

//                 <input
//                   type="date"
//                   value={formData.rental_start_date || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       rental_start_date: e.target.value,
//                     })
//                   }
//                   className="border p-2 rounded w-full"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-semibold mb-1">
//                   Rental End Date
//                 </label>

//                 <input
//                   type="date"
//                   value={formData.rental_end_date || ""}
//                   onChange={(e) =>
//                     setFormData({
//                       ...formData,
//                       rental_end_date: e.target.value,
//                     })
//                   }
//                   className="border p-2 rounded w-full"
//                 />
//               </div>
//             </div>
//           )}

//           {/* ITEMS */}

//           {invoiceItems.map((it, idx) => (
//             <div
//               key={idx}
//               className="grid grid-cols-12 gap-2 items-center border p-3 rounded"
//             >
//               <select
//                 className="col-span-4 border p-2"
//                 value={it.item_id}
//                 onChange={(e) =>
//                   updateInvoiceItem(idx, "item_id", e.target.value)
//                 }
//               >
//                 <option value="">Select Item</option>

//                 {items.map((i) => (
//                   <option key={i.id} value={i.id}>
//                     {i.name}
//                   </option>
//                 ))}
//               </select>

//               <div className="col-span-2">
//                 {it.item_image && (
//                   <Image
//                     src={it.item_image}
//                     alt={it.item_name}
//                     width={60}
//                     height={60}
//                     className="rounded"
//                   />
//                 )}
//               </div>

//               <input
//                 type="number"
//                 className="col-span-2 border p-2"
//                 value={it.quantity}
//                 min={1}
//                 onChange={(e) =>
//                   updateInvoiceItem(idx, "quantity", e.target.value)
//                 }
//               />

//               <input
//                 type="number"
//                 className="col-span-2 border p-2"
//                 value={it.unit_price}
//                 onChange={(e) =>
//                   updateInvoiceItem(idx, "unit_price", e.target.value)
//                 }
//               />

//               <div className="col-span-1 font-semibold">
//                 ₦{it.total.toLocaleString()}
//               </div>

//               <button
//                 type="button"
//                 className="col-span-1 text-red-600"
//                 onClick={() => removeInvoiceItem(idx)}
//               >
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           ))}

//           <button
//             type="button"
//             onClick={addInvoiceItem}
//             className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1"
//           >
//             <Plus size={16} /> Add Item
//           </button>

//           {/* TOTAL */}

//           <div className="text-right font-bold text-xl">
//             Subtotal: ₦{subtotal.toLocaleString()}
//           </div>

//           {/* ACTIONS */}

//           <div className="flex justify-end gap-3">
//             <button
//               type="button"
//               onClick={onClose}
//               className="border px-4 py-2 rounded"
//             >
//               Cancel
//             </button>

//             <button
//               disabled={loading}
//               className="bg-blue-600 text-white px-4 py-2 rounded"
//             >
//               {loading
//                 ? "Saving..."
//                 : invoiceId
//                   ? "Update Invoice"
//                   : "Create Invoice"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

/* ================= TYPES ================= */

interface Customer {
  id: string;
  name: string;
}

interface Item {
  id: string;
  name: string;
  image?: string;
  price_sale: number;
  price_rental_per_day: number;
  stock_quantity: number;
}

interface InvoiceItem {
  id?: string;
  item_id: string;
  item_name: string;
  item_image?: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceFormData {
  customer_id: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  type: "sale" | "rental";
  rental_start_date?: string | null;
  rental_end_date?: string | null;
  status: "draft" | "sent" | "paid" | "overdue";
  notes?: string | null;
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
    customer_name: "",
    invoice_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    type: "sale",
    rental_start_date: null,
    rental_end_date: null,
    status: "draft",
    notes: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadCustomers();
    loadItems();
  }, []);

  async function loadCustomers() {
    const { data } = await supabase
      .from("customers")
      .select("id,name")
      .order("name");

    if (data) setCustomers(data);
  }

  async function loadItems() {
    const { data } = await supabase
      .from("items")
      .select("id,name,image,price_sale,price_rental_per_day,stock_quantity")
      .order("name");

    if (data) setItems(data);
  }

  /* ================= LOAD INVOICE ================= */

  useEffect(() => {
    if (!invoiceId) return;

    async function loadInvoice() {
      const { data } = await supabase
        .from("invoices")
        .select(`*,invoice_items(*)`)
        .eq("id", invoiceId)
        .single();

      if (!data) return;

      setFormData({
        customer_id: data.customer_id,
        customer_name: data.customer_name,
        invoice_date: data.invoice_date,
        due_date: data.due_date,
        type: data.type,
        rental_start_date: data.rental_start_date,
        rental_end_date: data.rental_end_date,
        status: data.status,
        notes: data.notes,
      });

      setInvoiceItems(data.invoice_items || []);
    }

    loadInvoice();
  }, [invoiceId]);

  /* ================= RENTAL DAYS ================= */

  function getRentalDays() {
    if (!formData.rental_start_date || !formData.rental_end_date) return 1;

    const start = new Date(formData.rental_start_date);
    const end = new Date(formData.rental_end_date);

    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );

    return diff > 0 ? diff : 1;
  }

  const rentalDays = getRentalDays();

  /* ================= RECALCULATE WHEN DAYS CHANGE ================= */

  useEffect(() => {
    setInvoiceItems((prev) =>
      prev.map((row) => {
        const multiplier = formData.type === "rental" ? rentalDays : 1;

        return {
          ...row,
          total: row.unit_price * row.quantity * multiplier,
        };
      })
    );
  }, [rentalDays, formData.type]);

  /* ================= ITEM LOGIC ================= */

  function addInvoiceItem() {
    setInvoiceItems((prev) => [
      ...prev,
      {
        item_id: "",
        item_name: "",
        quantity: 1,
        unit_price: 0,
        total: 0,
      },
    ]);
  }

  function removeInvoiceItem(index: number) {
    setInvoiceItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateInvoiceItem(
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) {
    setInvoiceItems((prev) => {
      const updated = [...prev];
      const row = updated[index];

      if (field === "item_id") {
        const selected = items.find((i) => i.id === value);

        if (selected) {
          const price =
            formData.type === "sale"
              ? selected.price_sale
              : selected.price_rental_per_day;

          row.item_id = selected.id;
          row.item_name = selected.name;
          row.item_image = selected.image;
          row.unit_price = price;

          const multiplier = formData.type === "rental" ? rentalDays : 1;

          row.total = price * row.quantity * multiplier;
        }
      }

      if (field === "quantity") {
        const qty = Math.max(1, Number(value));

        const selected = items.find((i) => i.id === row.item_id);

        if (selected && qty > selected.stock_quantity) {
          alert(`Only ${selected.stock_quantity} items available`);
          return prev;
        }

        row.quantity = qty;

        const multiplier = formData.type === "rental" ? rentalDays : 1;

        row.total = row.unit_price * qty * multiplier;
      }

      if (field === "unit_price") {
        row.unit_price = Math.max(0, Number(value));

        const multiplier = formData.type === "rental" ? rentalDays : 1;

        row.total = row.unit_price * row.quantity * multiplier;
      }

      return updated;
    });
  }

  /* ================= SUBTOTAL ================= */

  const subtotal = invoiceItems.reduce((sum, i) => sum + i.total, 0);

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      let invoice_id = invoiceId;

      if (!invoiceId) {
        const invoiceNumber = `INV-${Date.now()}`;

        const { data, error } = await supabase
          .from("invoices")
          .insert([
            {
              ...formData,
              invoice_number: invoiceNumber,
              subtotal,
              tax: 0,
              discount: 0,
              total: subtotal,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        invoice_id = data.id;
      }

      if (invoiceId) {
        await supabase
          .from("invoices")
          .update({
            ...formData,
            subtotal,
            total: subtotal,
          })
          .eq("id", invoiceId);

        await supabase
          .from("invoice_items")
          .delete()
          .eq("invoice_id", invoiceId);
      }

      if (invoiceItems.length && invoice_id) {
        const payload = invoiceItems.map((item) => ({
          invoice_id,
          ...item,
        }));

        const { error } = await supabase.from("invoice_items").insert(payload);

        if (error) throw error;
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
        <div className="flex justify-between p-4 border-b">
          <h2 className="text-xl font-bold">
            {invoiceId ? "Edit Invoice" : "Create Invoice"}
          </h2>

          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* CUSTOMER */}

          <div>
            <label className="block text-sm font-semibold mb-1">Customer</label>

            <select
              value={formData.customer_id}
              onChange={(e) => {
                const selected = customers.find((c) => c.id === e.target.value);

                setFormData({
                  ...formData,
                  customer_id: e.target.value,
                  customer_name: selected?.name || "",
                });
              }}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Customer</option>

              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* TYPE */}

          <div>
            <label className="block text-sm font-semibold mb-1">
              Invoice Type
            </label>

            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "sale" | "rental",
                })
              }
              className="border p-2 rounded w-full"
            >
              <option value="sale">Sale</option>
              <option value="rental">Rental</option>
            </select>
          </div>

          {/* RENTAL DATES */}

          {formData.type === "rental" && (
            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Rental Start Date
                </label>

                <input
                  type="date"
                  value={formData.rental_start_date || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rental_start_date: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1">
                  Rental End Date
                </label>

                <input
                  type="date"
                  value={formData.rental_end_date || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      rental_end_date: e.target.value,
                    })
                  }
                  className="border p-2 rounded w-full"
                />
              </div>

            </div>
          )}

          {formData.type === "rental" && (
            <div className="text-sm text-gray-600">
              Rental Duration: <strong>{rentalDays} day(s)</strong>
            </div>
          )}

          {/* ITEMS */}

          {invoiceItems.map((it, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 gap-2 items-center border p-3 rounded"
            >

              <select
                className="col-span-4 border p-2"
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

              <div className="col-span-2">
                {it.item_image && (
                  <Image
                    src={it.item_image}
                    alt={it.item_name}
                    width={60}
                    height={60}
                    className="rounded"
                  />
                )}
              </div>

              <input
                type="number"
                className="col-span-2 border p-2"
                value={it.quantity}
                min={1}
                onChange={(e) =>
                  updateInvoiceItem(idx, "quantity", e.target.value)
                }
              />

              <input
                type="number"
                className="col-span-2 border p-2"
                value={it.unit_price}
                onChange={(e) =>
                  updateInvoiceItem(idx, "unit_price", e.target.value)
                }
              />

              <div className="col-span-1 font-semibold">
                ₦{it.total.toLocaleString()}
              </div>

              <button
                type="button"
                className="col-span-1 text-red-600"
                onClick={() => removeInvoiceItem(idx)}
              >
                <Trash2 size={16} />
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

          {/* TOTAL */}

          <div className="text-right font-bold text-xl">
            Subtotal: ₦{subtotal.toLocaleString()}
          </div>

          {/* ACTIONS */}

          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="border px-4 py-2 rounded"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              {loading
                ? "Saving..."
                : invoiceId
                ? "Update Invoice"
                : "Create Invoice"}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}