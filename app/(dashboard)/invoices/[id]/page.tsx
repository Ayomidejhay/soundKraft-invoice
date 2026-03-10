'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import InvoicePreview from "../../components/InvoicePreview"
import { Printer } from "lucide-react"
import { Payment } from "@/types/payment"

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

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
}

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  customer: Customer
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  notes?: string
  status: InvoiceStatus
}

interface SupabaseInvoiceItemRow {
  id: string
  invoice_id: string
  item_id: string
  item_name: string
  item_image?: string | null
  quantity: number
  unit_price: number
  total: number
}

interface SupabaseCustomerRow {
  id: string
  name: string
  email?: string | null
  phone?: string | null
}

interface SupabaseInvoiceRow {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string
  customer_id: string
  notes?: string | null
  status: InvoiceStatus
  tax?: number | null
  invoice_items?: SupabaseInvoiceItemRow[]
  customers?: SupabaseCustomerRow
}

/* ================= COMPONENT ================= */

export default function InvoicePage() {
  const params = useParams()
const id = params.id as string
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  /* ================= FETCH INVOICE ================= */
  useEffect(() => {
    if (!id || Array.isArray(id)) return

    const fetchInvoice = async () => {
      setLoading(true)
      try {
        // Fetch invoice
        const { data: invoiceData, error: invoiceError } = await supabase
          .from("invoices")
          .select(`*, invoice_items (*), customers (*)`)
          .eq("id", id)
          .single()

        if (invoiceError || !invoiceData) {
          console.error("Invoice fetch error:", invoiceError)
          setInvoice(null)
          return
        }

        // Map customer
        const customerData = invoiceData.customers
          ? {
              id: invoiceData.customers.id,
              name: invoiceData.customers.name,
              email: invoiceData.customers.email || "",
              phone: invoiceData.customers.phone || "",
            }
          : { id: "", name: "Unknown" }

        // Map invoice items
        const items: InvoiceItem[] = (invoiceData.invoice_items || []).map(
  (i: SupabaseInvoiceItemRow) => ({
    item_id: i.item_id,
    item_name: i.item_name,
    quantity: i.quantity,
    unit_price: i.unit_price,
    total: i.total,
    image: i.item_image ?? undefined,
  })
)

        const subtotal = items.reduce((sum, i) => sum + i.total, 0)
        const tax = invoiceData.tax ?? 0
        const total = subtotal + tax

        setInvoice({
          id: invoiceData.id,
          invoice_number: invoiceData.invoice_number,
          invoice_date: invoiceData.invoice_date,
          due_date: invoiceData.due_date,
          customer: customerData,
          items,
          subtotal,
          tax,
          total,
          notes: invoiceData.notes || "",
          status: invoiceData.status as InvoiceStatus || "draft",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInvoice()
  }, [id])

  /* ================= PRINT ================= */
  const handlePrint = () => {
    if (!invoice) return
    const originalTitle = document.title
    document.title = `${invoice.customer.name.replace(/\s+/g, "_")}-Invoice-${invoice.invoice_number}`
    window.print()
    setTimeout(() => { document.title = originalTitle }, 1000)
  }

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (status: InvoiceStatus) => {
    if (!id || Array.isArray(id) || !invoice) return

    try {
      setUpdatingStatus(true)
      const { error } = await supabase
        .from("invoices")
        .update({ status })
        .eq("id", id)
      if (error) throw error

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