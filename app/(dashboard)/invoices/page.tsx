// "use client";

// import { useEffect, useState } from "react";
// import { Plus, Edit2, Trash2, Printer } from "lucide-react";
// import { db } from "@/lib/firebase";
// import { collection, getDocs, doc, deleteDoc, query, where, updateDoc } from "firebase/firestore";

// import InvoiceForm from "../components/InvoiceForm";
// import InvoicePreview from "../components/InvoicePreview";
// import Link from "next/link";

// /* ================= TYPES ================= */
// interface InvoiceListItem {
//   id: string;
//   invoice_number: string;
//   customer_id: string;
//   customer_name: string;
//   invoice_date: string;
//   due_date: string;
//   type: "sale" | "rental";
//   status: "draft" | "paid" | "sent" | "overdue" | "cancelled";
//   subtotal: number;
//   tax: number;
//   total: number;
// }

// interface InvoiceItem {
//   item_id: string;
//   item_name: string;
//   quantity: number;
//   unit_price: number;
//   total: number;
//   image?: string;
// }

// interface InvoicePreviewData {
//   invoice_number: string;
//   invoice_date: string;
//   due_date: string;
//   customer: { name: string; email?: string; phone?: string };
//   items: InvoiceItem[];
//   subtotal: number;
//   tax: number;
//   total: number;
//   notes?: string;
//   status: "draft" | "paid" | "sent" | "overdue" | "cancelled";
// }

// /* ================= COMPONENT ================= */
// export default function Invoices() {
//   const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [filter, setFilter] = useState("all");
//   const [showForm, setShowForm] = useState(false);
//   const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
//   const [previewInvoice, setPreviewInvoice] = useState<InvoicePreviewData | null>(null);

//   /* ================= FETCH + AUTO OVERDUE ================= */
//   const fetchInvoices = async () => {
//     setLoading(true);
//     try {
//       const customersSnap = await getDocs(collection(db, "customers"));
//       const customersMap = new Map(customersSnap.docs.map(d => [d.id, d.data().name as string]));

//       const invoicesSnap = await getDocs(collection(db, "invoices"));
//       const invoicesData: InvoiceListItem[] = [];
//       const today = new Date();

//       for (const docSnap of invoicesSnap.docs) {
//         const data = docSnap.data();
//         const dueDate = new Date(data.due_date);
//         let status = data.status as InvoiceListItem["status"];

//         if (status !== "paid" && status !== "cancelled" && dueDate < today) {
//           status = "overdue";
//           await updateDoc(doc(db, "invoices", docSnap.id), { status: "overdue" });
//         }

//         invoicesData.push({
//           id: docSnap.id,
//           invoice_number: String(data.invoice_number),
//           customer_id: String(data.customer_id),
//           customer_name: customersMap.get(data.customer_id) || "Unknown",
//           invoice_date: String(data.invoice_date),
//           due_date: String(data.due_date),
//           type: data.type === "rental" ? "rental" : "sale",
//           status,
//           subtotal: Number(data.subtotal || 0),
//           tax: Number(data.tax || 0),
//           total: Number(data.total || 0),
//         });
//       }

//       setInvoices(invoicesData);
//     } catch (err) {
//       console.error("Error fetching invoices:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchInvoices(); }, []);

//   const loadInvoicePreview = async (invoiceId: string) => {
//     try {
//       const invoiceSnap = await getDocs(query(collection(db, "invoices"), where("__name__", "==", invoiceId)));
//       if (invoiceSnap.empty) return;

//       const inv = invoiceSnap.docs[0].data();
//       const customerSnap = await getDocs(query(collection(db, "customers"), where("__name__", "==", inv.customer_id)));
//       const customer = customerSnap.docs[0]?.data();
//       const itemsSnap = await getDocs(query(collection(db, "invoice_items"), where("invoice_id", "==", invoiceId)));
//       const inventorySnap = await getDocs(collection(db, "inventory"));
//       const inventoryMap = new Map(inventorySnap.docs.map(d => [d.id, d.data().image as string]));

//       const items: InvoiceItem[] = itemsSnap.docs.map(d => {
//         const x = d.data();
//         return {
//           item_id: String(x.item_id),
//           item_name: String(x.item_name),
//           quantity: Number(x.quantity || 0),
//           unit_price: Number(x.unit_price || 0),
//           total: Number(x.total || 0),
//           image: inventoryMap.get(x.item_id),
//         };
//       });

//       const subtotal = items.reduce((sum, i) => sum + i.total, 0);
//       const tax = Number(inv.tax || 0);
//       const total = subtotal + tax;

//       setPreviewInvoice({
//         invoice_number: String(inv.invoice_number),
//         invoice_date: String(inv.invoice_date),
//         due_date: String(inv.due_date),
//         customer: { name: String(customer?.name || "Unknown"), email: String(customer?.email || ""), phone: String(customer?.phone || "") },
//         items,
//         subtotal,
//         tax,
//         total,
//         notes: String(inv.notes || ""),
//         status: ["draft", "paid", "sent", "overdue", "cancelled"].includes(inv.status) ? inv.status : "draft",
//       });
//     } catch (err) {
//       console.error("Error loading invoice preview:", err);
//     }
//   };

//   const handlePrint = () => {
//     if (!previewInvoice) return;
//     document.title = `${previewInvoice.customer.name.replace(/\s+/g, "_")}-Invoice-${previewInvoice.invoice_number}`;
//     window.print();
//     setTimeout(() => { document.title = "Invoices Page"; }, 1000);
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm("Delete invoice?")) return;
//     await deleteDoc(doc(db, "invoices", id));
//     setInvoices(prev => prev.filter(i => i.id !== id));
//   };

//   const filteredInvoices = invoices.filter(inv => filter === "all" ? true : inv.status === filter);

//   const statusColor = (s: string) =>
//     ({ paid: "bg-green-100 text-green-800", sent: "bg-blue-100 text-blue-800", overdue: "bg-red-100 text-red-800", draft: "bg-gray-100 text-gray-800", cancelled: "bg-red-100 text-red-800" }[s] || "bg-gray-100 text-gray-800");

//   if (loading) return <div className="p-10">Loading invoices...</div>;

//   return (
//     <div className="max-w-7xl mx-auto px-4 py-6">

//       {/* ================= PREVIEW MODAL ================= */}
//       {previewInvoice && (
//         <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-2">
//           <div className="bg-white w-full max-w-3xl rounded-lg p-4 overflow-y-auto max-h-[95vh]">
//             <div className="flex flex-col sm:flex-row justify-end gap-2 mb-2">
//               <button onClick={handlePrint} className="px-3 py-2 border rounded flex items-center gap-2">
//                 <Printer size={16} /> Print / Save PDF
//               </button>
//               <button onClick={() => setPreviewInvoice(null)} className="px-3 py-2 border rounded">
//                 Close
//               </button>
//             </div>
//             <InvoicePreview invoice={previewInvoice} />
//           </div>
//         </div>
//       )}

//       {/* ================= FORM MODAL ================= */}
//       {showForm && (
//         <InvoiceForm
//           invoiceId={editingInvoiceId}
//           onClose={() => { setShowForm(false); setEditingInvoiceId(null); }}
//           onSave={() => { setShowForm(false); setEditingInvoiceId(null); fetchInvoices(); }}
//         />
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-2 sm:gap-0">
//         <h2 className="text-2xl font-bold">Invoices</h2>
//         <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded flex gap-2 items-center shrink-0">
//           <Plus size={16} /> Create Invoice
//         </button>
//       </div>

//       {/* ================= FILTERS ================= */}
//       <div className="mb-4 flex flex-wrap gap-2">
//         {["all","draft","sent","paid","overdue","cancelled"].map(s => (
//           <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded text-sm ${filter===s?"bg-blue-600 text-white":"border"}`}>{s.toUpperCase()}</button>
//         ))}
//       </div>

//       {/* ================= TABLE ================= */}
//       <div className="bg-white shadow rounded overflow-x-auto">
//         <table className="w-full text-sm min-w-[800px]">
//           <thead className="bg-gray-50">
//             <tr>
//               {["Invoice #","Customer","Date","Type","Subtotal","Tax","Amount","Status","Actions"].map(h => (
//                 <th key={h} className="p-3 text-left text-xs font-medium uppercase">{h}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredInvoices.map(inv => (
//               <tr key={inv.id} className="border-t hover:bg-gray-50">
//                 <td className="p-3 font-medium"><Link href={`/invoices/${inv.id}`} className="text-blue-600 hover:underline">{inv.invoice_number}</Link></td>
//                 <td className="p-3">{inv.customer_name}</td>
//                 <td className="p-3">{new Date(inv.invoice_date).toLocaleDateString()}</td>
//                 <td className="p-3 capitalize">{inv.type}</td>
//                 <td className="p-3 font-semibold">₦{inv.subtotal.toLocaleString()}</td>
//                 <td className="p-3 font-semibold">₦{inv.tax.toLocaleString()}</td>
//                 <td className="p-3 font-semibold">₦{inv.total.toLocaleString()}</td>
//                 <td className="p-3"><span className={`px-2 py-1 text-xs rounded ${statusColor(inv.status)}`}>{inv.status}</span></td>
//                 <td className="p-3 flex gap-2 flex-wrap">
//                   <button onClick={() => loadInvoicePreview(inv.id)} className="text-blue-600" title="Preview"><Printer size={16} /></button>
//                   <button onClick={() => { if(inv.status!=="paid"){setEditingInvoiceId(inv.id);setShowForm(true);} }} disabled={inv.status==="paid"} className={inv.status==="paid"?"opacity-40 cursor-not-allowed":""}><Edit2 size={16} className="text-blue-600" /></button>
//                   <button onClick={() => handleDelete(inv.id)}><Trash2 size={16} className="text-red-600" /></button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {filteredInvoices.length===0 && <div className="p-6 text-center text-gray-500">No invoices found.</div>}
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Printer } from "lucide-react";
import { supabase } from "@/lib/supabase";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";
import Link from "next/link";

/* ================= TYPES ================= */

interface InvoiceListItem {
  id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  type: "sale" | "rental";
  status: "draft" | "paid" | "sent" | "overdue" | "cancelled";
  subtotal: number;
  tax: number;
  total: number;
}

interface InvoicePreviewData {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  customer: { name: string; email?: string; phone?: string };
  items: [];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  status: "draft" | "paid" | "sent" | "overdue" | "cancelled";
}

/* ================= COMPONENT ================= */

export default function Invoices() {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingInvoiceId, setEditingInvoiceId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<InvoicePreviewData | null>(null);

  /* ================= FETCH ================= */

  const fetchInvoices = async () => {
    setLoading(true);

    const { data: customers } = await supabase.from("customers").select("*");
    const customersMap = new Map(
      customers?.map((c) => [c.id, c.name])
    );

    const { data: invoicesData } = await supabase
      .from("invoices")
      .select("*")
      .order("created_at", { ascending: false });

    if (!invoicesData) {
      setLoading(false);
      return;
    }

    const today = new Date();

    const updatedInvoices = await Promise.all(
      invoicesData.map(async (inv) => {
        let status = inv.status;

        if (
          status !== "paid" &&
          status !== "cancelled" &&
          new Date(inv.due_date) < today
        ) {
          status = "overdue";
          await supabase
            .from("invoices")
            .update({ status: "overdue" })
            .eq("id", inv.id);
        }

        return {
          ...inv,
          customer_name: customersMap.get(inv.customer_id) || "Unknown",
          status,
        };
      })
    );

    setInvoices(updatedInvoices);
    setLoading(false);
  };

useEffect(() => {
  (async () => {
    await fetchInvoices();
  })();
}, []);

  /* ================= DELETE ================= */

  const handleDelete = async (id: string) => {
    if (!confirm("Delete invoice?")) return;

    await supabase.from("invoice_items").delete().eq("invoice_id", id);
    await supabase.from("invoices").delete().eq("id", id);

    fetchInvoices();
  };

  /* ================= FILTER ================= */

  const filteredInvoices =
    filter === "all"
      ? invoices
      : invoices.filter((i) => i.status === filter);

  const statusColor = (s: string) =>
    ({
      paid: "bg-green-100 text-green-800",
      sent: "bg-blue-100 text-blue-800",
      overdue: "bg-red-100 text-red-800",
      draft: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    }[s] || "bg-gray-100 text-gray-800");

  if (loading) return <div className="p-10">Loading invoices...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {showForm && (
        <InvoiceForm
          invoiceId={editingInvoiceId}
          onClose={() => {
            setShowForm(false);
            setEditingInvoiceId(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingInvoiceId(null);
            fetchInvoices();
          }}
        />
      )}

      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded flex gap-2 items-center"
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Invoice #",
                "Customer",
                "Date",
                "Type",
                "Subtotal",
                "Tax",
                "Amount",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} className="p-3 text-left text-xs font-medium uppercase">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map((inv) => (
              <tr key={inv.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">
                  <Link
                    href={`/invoices/${inv.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {inv.invoice_number}
                  </Link>
                </td>
                <td className="p-3">{inv.customer_name}</td>
                <td className="p-3">
                  {new Date(inv.invoice_date).toLocaleDateString()}
                </td>
                <td className="p-3 capitalize">{inv.type}</td>
                <td className="p-3 font-semibold">
                  ₦{inv.subtotal.toLocaleString()}
                </td>
                <td className="p-3 font-semibold">
                  ₦{inv.tax.toLocaleString()}
                </td>
                <td className="p-3 font-semibold">
                  ₦{inv.total.toLocaleString()}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${statusColor(
                      inv.status
                    )}`}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => {
                      setEditingInvoiceId(inv.id);
                      setShowForm(true);
                    }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(inv.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredInvoices.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No invoices found.
          </div>
        )}
      </div>
    </div>
  );
}