'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, collection, getDocs, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import InvoicePreview from "../../components/InvoicePreview"
import { Printer } from "lucide-react"

/* ================= TYPES ================= */

type InvoiceStatus = "draft" | "paid" | "sent" | "overdue" | "cancelled"

interface InvoiceItem {
  item_id: string
  item_name: string
  quantity: number
  unit_price: number
  total: number
  image?: string
}

interface Invoice {
  invoice_number: string
  invoice_date: string
  due_date: string
  customer: {
    name: string
    email?: string
    phone?: string
  }
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  status: InvoiceStatus
}

/* ================= COMPONENT ================= */

export default function InvoicePage() {
  const { id } = useParams()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  /* ================= FETCH INVOICE ================= */
  useEffect(() => {
    if (!id || Array.isArray(id)) return

    const fetchInvoice = async () => {
      setLoading(true)
      try {
        const docRef = doc(db, "invoices", id)
        const docSnap = await getDoc(docRef)
        if (!docSnap.exists()) return

        const data = docSnap.data()

        const customerRef = doc(db, "customers", data.customer_id)
        const customerSnap = await getDoc(customerRef)
        const customerData = customerSnap.exists() ? customerSnap.data() : { name: "Unknown" }

        const itemsSnap = await getDocs(collection(db, "invoice_items"))
        const inventorySnap = await getDocs(collection(db, "inventory"))
        const inventoryMap = new Map(inventorySnap.docs.map(d => [d.id, d.data().image as string]))

        const items: InvoiceItem[] = itemsSnap.docs
          .filter(d => d.data().invoice_id === id)
          .map(d => {
            const x = d.data()
            return {
              item_id: String(x.item_id),
              item_name: String(x.item_name),
              quantity: Number(x.quantity),
              unit_price: Number(x.unit_price),
              total: Number(x.total),
              image: inventoryMap.get(x.item_id),
            }
          })

        const subtotal = items.reduce((sum, i) => sum + i.total, 0)
        const tax = 0
        const total = subtotal + tax

        setInvoice({
          invoice_number: String(data.invoice_number),
          invoice_date: String(data.invoice_date),
          due_date: String(data.due_date),
          customer: {
            name: String(customerData.name),
            email: String(customerData.email || ""),
            phone: String(customerData.phone || ""),
          },
          items,
          subtotal,
          tax,
          total,
          notes: String(data.notes || ""),
          status: (data.status as InvoiceStatus) || "draft",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [id])

  /* ================= PRINT (SAVE AS PDF) ================= */
  const handlePrint = () => {
    if (!invoice) return

    const originalTitle = document.title
    document.title = `${invoice.customer.name.replace(/\s+/g, "_")}-Invoice-${invoice.invoice_number}`

    window.print()

    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (status: InvoiceStatus) => {
    if (!id || Array.isArray(id)) return
    if (!invoice) return

    try {
      setUpdatingStatus(true)
      const docRef = doc(db, "invoices", id)
      await updateDoc(docRef, { status })

      // Update UI instantly
      setInvoice(prev => prev ? { ...prev, status } : prev)
    } catch (err) {
      console.error("Status update failed", err)
      alert("Failed to update invoice status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  /* ================= UI ================= */
  if (loading) return <div className="p-10">Loading invoice...</div>
  if (!invoice) return <div className="p-10">Invoice not found</div>

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ACTION BAR */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">

        {/* PRINT BUTTON */}
        <button
          onClick={handlePrint}
          className="px-3 py-2 border rounded flex items-center gap-2"
        >
          <Printer size={16} /> Download / Print Invoice
        </button>

        {/* STATUS CONTROL */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Status:</span>

          <select
            value={invoice.status}
            onChange={(e) => updateStatus(e.target.value as InvoiceStatus)}
            disabled={updatingStatus}
            className="border px-2 py-1 rounded bg-white"
          >
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {updatingStatus && <span className="text-xs text-gray-500">Updating...</span>}
        </div>
      </div>

      {/* INVOICE PREVIEW */}
      <div id="invoice-preview">
        <InvoicePreview invoice={invoice} />
      </div>
    </div>
  )
}