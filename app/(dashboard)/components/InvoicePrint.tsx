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
      className="relative bg-white p-6 md:p-10 text-black text-sm w-full max-w-2xl mx-auto"
    >
      {/* ================= WATERMARK ================= */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
        <img src="/logo.jpeg" className="w-40 md:w-96" alt="watermark" />
      </div>

      {/* ================= STATUS STAMP ================= */}
      {data.status && data.status !== 'draft' && (
        <div className="absolute top-20 right-4 md:right-10 text-red-500 text-4xl md:text-5xl font-bold border-4 border-red-500 px-4 md:px-6 py-2 rotate-[-20deg] opacity-40 uppercase">
          {data.status}
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col md:flex-row justify-between border-b pb-4 relative z-10 gap-4">
        <div className="flex gap-4 items-center">
          <img src="/logo.jpeg" className="w-16 h-16 md:w-20 md:h-20 object-contain" alt="Logo" />
          <div>
            <h1 className="text-lg md:text-2xl font-bold">{data.company_name}</h1>
            <p className="text-gray-600 text-xs md:text-sm">{data.company_email}</p>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-xl md:text-2xl font-semibold text-blue-600">INVOICE</h2>
          <p className="font-semibold text-sm md:text-base">#{data.invoice_number}</p>
        </div>
      </div>

      {/* ================= CUSTOMER ================= */}
      <div className="mt-4 flex flex-col md:flex-row justify-between relative z-10 gap-4">
        <div>
          <h3 className="font-semibold">Bill To:</h3>
          <p className="font-medium">{data.customer_name}</p>
        </div>

        <div className="text-right text-xs md:text-sm">
          <p><b>Invoice Date:</b> {data.invoice_date}</p>
          <p><b>Due Date:</b> {data.due_date}</p>
        </div>
      </div>

      {/* ================= ITEMS TABLE ================= */}
      <div className="overflow-x-auto mt-4 relative z-10">
        <table className="w-full border border-collapse text-xs md:text-sm">
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
                      className="w-10 h-10 md:w-12 md:h-12 object-cover rounded border"
                      alt={it.item_name}
                    />
                  ) : (
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-200 text-xs flex items-center justify-center">
                      No Image
                    </div>
                  )}
                </td>

                <td className="border p-2">{it.item_name}</td>
                <td className="border p-2 text-center">{it.quantity}</td>
                <td className="border p-2 text-right">₦{it.unit_price.toLocaleString()}</td>
                <td className="border p-2 text-right font-semibold">₦{it.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= TOTALS ================= */}
      <div className="mt-4 flex justify-end relative z-10">
        <div className="w-full md:w-72 border p-4 bg-gray-50 rounded text-xs md:text-sm">
          <div className="flex justify-between"><span>Subtotal:</span><span>₦{data.subtotal.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Tax:</span><span>₦{data.tax.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-base md:text-lg border-t pt-2"><span>Total:</span><span>₦{data.total.toLocaleString()}</span></div>
        </div>
      </div>

      {/* ================= BANK DETAILS ================= */}
      <div className="mt-4 p-4 bg-gray-50 rounded text-xs md:text-sm relative z-10">
        <h4 className="font-semibold mb-1">Bank Details</h4>
        <p>Bank: GTBank</p>
        <p>Account Name: {data.company_name}</p>
        <p>Account Number: 1234567890</p>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="mt-6 text-center text-xs md:text-sm text-gray-500 border-t pt-2 relative z-10">
        Thank you for your business. Payment is due within 30 days.
      </div>
    </div>
  );
}