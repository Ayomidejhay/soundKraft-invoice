'use client'

import Image from 'next/image'
import React, { forwardRef } from 'react'

interface InvoiceItem {
  item_id: string
  item_name: string
  quantity: number
  unit_price: number
  total: number
  image?: string
}

interface Customer {
  name: string
  email?: string
  phone?: string
}

interface Invoice {
  invoice_number: string
  invoice_date: string
  due_date: string
  customer: Customer
  items: InvoiceItem[]
  notes?: string
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'paid' | 'sent' | 'overdue' | 'cancelled'
}

interface Props {
  invoice: Invoice
}

const InvoicePreview = forwardRef<HTMLDivElement, Props>(({ invoice }, ref) => {
  return (
    <div
      ref={ref}
      id="invoice-preview"
      className="bg-white text-black p-4 md:p-10 font-sans relative w-full max-w-2xl mx-auto"
    >
      {/* WATERMARK */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img src="/logo.jpeg" alt="watermark" className="w-40 h-40 md:w-96 md:h-96" />
      </div>

      {/* STATUS STAMP */}
      {invoice.status !== 'draft' && (
        <div className="absolute top-20 right-4 md:right-20 text-red-600 text-4xl md:text-6xl font-bold border-4 border-red-600 px-4 py-2 rotate-[-20deg] opacity-40 uppercase">
          {invoice.status}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between border-b pb-4 relative z-10 gap-4">
        <div className="flex items-center gap-4">
          <img src="/logo.jpeg" alt="Logo" className="w-16 h-16 md:w-20 md:h-20" />
          <div className="text-sm md:text-base">
            <h1 className="text-lg md:text-2xl font-bold">SoundKraft Limited</h1>
            <p>123 Studio Avenue, Lagos, Nigeria</p>
            <p>+234 810 3912 154</p>
            <p>Soundkraft001@gmail.com</p>
          </div>
        </div>
        <div className="text-sm md:text-base text-right">
          <h2 className="text-xl md:text-2xl font-bold text-blue-600">INVOICE</h2>
          <p><b>Invoice #:</b> {invoice.invoice_number}</p>
          <p><b>Date:</b> {invoice.invoice_date}</p>
          <p><b>Due:</b> {invoice.due_date}</p>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="mt-4 relative z-10 text-sm md:text-base">
        <h3 className="font-semibold">Bill To:</h3>
        <p className="font-medium">{invoice.customer.name}</p>
        {invoice.customer.email && <p>{invoice.customer.email}</p>}
        {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
      </div>

      {/* ITEMS TABLE */}
      <div className="overflow-x-auto mt-4 relative z-10">
        <table className="w-full border-collapse text-sm md:text-base">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1 text-left">Image</th>
              <th className="border px-2 py-1 text-left">Item</th>
              <th className="border px-2 py-1 text-right">Qty</th>
              <th className="border px-2 py-1 text-right">Unit Price</th>
              <th className="border px-2 py-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.item_id}>
                <td className="border px-2 py-1">
                  {it.image ? (
                    <Image
                      src={it.image}
                      alt={it.item_name}
                      width={80}
                      height={80}
                      className="rounded border"
                    />
                  ) : (
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 flex items-center justify-center text-xs">
                      No Image
                    </div>
                  )}
                </td>
                <td className="border px-2 py-1">{it.item_name}</td>
                <td className="border px-2 py-1 text-right">{it.quantity}</td>
                <td className="border px-2 py-1 text-right">₦{it.unit_price.toLocaleString()}</td>
                <td className="border px-2 py-1 text-right font-semibold">₦{it.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTALS */}
      <div className="mt-4 flex justify-end relative z-10">
        <div className="w-full md:w-72 border p-4 bg-gray-50 rounded-md text-sm md:text-base">
          <div className="flex justify-between"><span>Subtotal:</span><span>₦{invoice.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Tax:</span><span>₦{invoice.tax.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold text-base border-t border-gray-300 pt-2"><span>Total:</span><span>₦{invoice.total.toLocaleString()}</span></div>
        </div>
      </div>

      {/* NOTES */}
      {invoice.notes && (
        <div className="mt-4 text-sm md:text-base relative z-10">
          <h4 className="font-semibold">Notes</h4>
          <p>{invoice.notes}</p>
        </div>
      )}

      {/* BANK DETAILS */}
      <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm md:text-base relative z-10">
        <h4 className="font-semibold">Bank Details</h4>
        <p>Bank: GTBank</p>
        <p>Account Name: SoundKraft Limited</p>
        <p>Account Number: 1234567890</p>
      </div>

      {/* FOOTER */}
      <div className="mt-6 text-center text-xs md:text-sm border-t border-gray-300 pt-2 text-gray-500 relative z-10">
        Thank you for your business. Payment due within 30 days.
      </div>
    </div>
  )
})

InvoicePreview.displayName = 'InvoicePreview'
export default InvoicePreview