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
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        width: '794px',
        minHeight: '1123px',
        padding: '40px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* ================= WATERMARK ================= */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.05,
          pointerEvents: 'none',
        }}
      >
        <img src="/logo.jpeg" alt="watermark" width={400} height={400} />
      </div>

      {/* ================= STATUS STAMP ================= */}
      {invoice.status !== 'draft' && (
        <div
          style={{
            position: 'absolute',
            top: '160px',
            right: '80px',
            color: '#dc2626',
            fontSize: '64px',
            fontWeight: 'bold',
            border: '4px solid #dc2626',
            padding: '16px 24px',
            transform: 'rotate(-20deg)',
            opacity: 0.4,
            textTransform: 'uppercase',
          }}
        >
          {invoice.status}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '1px solid #d1d5db',
          paddingBottom: '16px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <img src="/logo.jpeg" alt="Logo" width={80} height={80} />

          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>
              SoundKraft Limited
            </h1>
            <p style={{ fontSize: '12px' }}>123 Studio Avenue, Lagos, Nigeria</p>
            <p style={{ fontSize: '12px' }}>+234 810 3912 154</p>
            <p style={{ fontSize: '12px' }}>Soundkraft001@gmail.com</p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>
            INVOICE
          </h2>
          <p><b>Invoice #:</b> {invoice.invoice_number}</p>
          <p><b>Date:</b> {invoice.invoice_date}</p>
          <p><b>Due:</b> {invoice.due_date}</p>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div style={{ marginTop: '24px', position: 'relative', zIndex: 10 }}>
        <h3 style={{ fontWeight: 600 }}>Bill To:</h3>
        <p style={{ fontWeight: 500 }}>{invoice.customer.name}</p>
        {invoice.customer.email && <p>{invoice.customer.email}</p>}
        {invoice.customer.phone && <p>{invoice.customer.phone}</p>}
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table
        style={{
          marginTop: '24px',
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        <thead style={{ backgroundColor: '#f3f4f6' }}>
          <tr>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>
              Image
            </th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'left' }}>
              Item
            </th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>
              Qty
            </th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>
              Unit Price
            </th>
            <th style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>
              Total
            </th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((it) => (
            <tr key={it.item_id}>
              <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>
                {it.image ? (
                  <Image
                    src={it.image}
                    alt={it.item_name}
                    width={80}
                    height={80}
                    style={{ borderRadius: '4px', border: '1px solid #d1d5db' }}
                  />
                ) : (
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      backgroundColor: '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                    }}
                  >
                    No Image
                  </div>
                )}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px' }}>{it.item_name}</td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>
                {it.quantity}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right' }}>
                ₦{it.unit_price.toLocaleString()}
              </td>
              <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'right', fontWeight: 600 }}>
                ₦{it.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= TOTALS ================= */}
      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', position: 'relative', zIndex: 10 }}>
        <div style={{ width: '288px', border: '1px solid #d1d5db', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>₦{invoice.subtotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Tax:</span>
            <span>₦{invoice.tax.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, fontSize: '16px', borderTop: '1px solid #d1d5db', paddingTop: '8px' }}>
            <span>Total:</span>
            <span>₦{invoice.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ================= NOTES ================= */}
      {invoice.notes && (
        <div style={{ marginTop: '24px', fontSize: '12px', position: 'relative', zIndex: 10 }}>
          <h4 style={{ fontWeight: 600 }}>Notes</h4>
          <p>{invoice.notes}</p>
        </div>
      )}

      {/* ================= BANK DETAILS ================= */}
      <div style={{ marginTop: '24px', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', fontSize: '12px', position: 'relative', zIndex: 10 }}>
        <h4 style={{ fontWeight: 600 }}>Bank Details</h4>
        <p>Bank: GTBank</p>
        <p>Account Name: SoundKraft Limited</p>
        <p>Account Number: 1234567890</p>
      </div>

      {/* ================= FOOTER ================= */}
      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '10px', borderTop: '1px solid #d1d5db', paddingTop: '8px', color: '#6b7280', position: 'relative', zIndex: 10 }}>
        Thank you for your business. Payment due within 30 days.
      </div>
    </div>
  )
})

InvoicePreview.displayName = 'InvoicePreview'
export default InvoicePreview