'use client';

interface InvoiceItem {
  item_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  image_url?: string;
}

interface InvoiceData {
  invoice_number: string;
  customer_name: string;
  company_name: string;
  company_email: string;
  invoice_date: string;
  due_date: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status?: 'draft' | 'paid' | 'sent' | 'overdue';
}

export default function InvoicePrint({ data }: { data: InvoiceData }) {
  return (
    <div
      id="invoice-print"
      className="relative bg-white p-10 text-black text-sm w-[800px] mx-auto"
    >
      {/* ================= WATERMARK ================= */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img src="/logo.jpeg" className="w-96" />
      </div>

      {/* ================= STATUS STAMP ================= */}
      {data.status && data.status !== 'draft' && (
        <div className="absolute top-32 right-10 text-red-500 text-5xl font-bold border-4 border-red-500 px-6 py-2 rotate-[-20deg] opacity-40 uppercase">
          {data.status}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between border-b pb-4 relative z-10">
        <div className="flex gap-4 items-center">
          <img src="/logo.jpeg" className="w-20 h-20 object-contain" />
          <div>
            <h1 className="text-2xl font-bold">{data.company_name}</h1>
            <p className="text-gray-600">{data.company_email}</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-2xl font-semibold text-blue-600">INVOICE</h2>
          <p className="font-semibold">#{data.invoice_number}</p>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className="mt-6 flex justify-between relative z-10">
        <div>
          <h3 className="font-semibold">Bill To:</h3>
          <p className="font-medium">{data.customer_name}</p>
        </div>

        <div className="text-right text-sm">
          <p><b>Invoice Date:</b> {data.invoice_date}</p>
          <p><b>Due Date:</b> {data.due_date}</p>
        </div>
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <table className="w-full mt-6 border border-collapse text-sm relative z-10">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Image</th>
            <th className="p-2 border text-left">Item</th>
            <th className="p-2 border text-center">Qty</th>
            <th className="p-2 border text-right">Unit Price</th>
            <th className="p-2 border text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {data.items.map((it, i) => (
            <tr key={i} className="page-break-avoid">
              <td className="border p-2">
                {it.image_url ? (
                  <img
                    src={it.image_url}
                    className="w-12 h-12 object-cover rounded border"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 text-xs flex items-center justify-center">
                    No Image
                  </div>
                )}
              </td>

              <td className="border p-2">{it.item_name}</td>
              <td className="border p-2 text-center">{it.quantity}</td>
              <td className="border p-2 text-right">
                ₦{it.unit_price.toLocaleString()}
              </td>
              <td className="border p-2 text-right font-semibold">
                ₦{it.total.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= TOTALS ================= */}
      <div className="mt-6 flex justify-end relative z-10">
        <div className="w-72 border p-4 bg-gray-50 rounded">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>₦{data.subtotal.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <span>Tax:</span>
            <span>₦{data.tax.toLocaleString()}</span>
          </div>

          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>₦{data.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ================= BANK DETAILS ================= */}
      <div className="mt-6 p-4 bg-gray-50 rounded text-sm relative z-10">
        <h4 className="font-semibold mb-1">Bank Details</h4>
        <p>Bank: GTBank</p>
        <p>Account Name: {data.company_name}</p>
        <p>Account Number: 1234567890</p>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-10 text-center text-xs text-gray-500 border-t pt-3 relative z-10">
        Thank you for your business. Payment is due within 30 days.
      </div>
    </div>
  );
}