import { Payment } from "@/types/payment";

export default function PaymentsTable({ payments }: { payments: Payment[] }) {
  return (
    <div className="mt-6">
      <h3 className="font-bold mb-2">Payments</h3>

      <table className="w-full border text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Method</th>
            <th className="p-2 border">Reference</th>
            <th className="p-2 border">Note</th>
          </tr>
        </thead>

        <tbody>
          {payments.map(p => (
            <tr key={p.id}>
              <td className="p-2 border">{new Date(p.paid_at).toLocaleDateString()}</td>
              <td className="p-2 border font-semibold">₦{p.amount.toLocaleString()}</td>
              <td className="p-2 border capitalize">{p.method.replace("_", " ")}</td>
              <td className="p-2 border">{p.reference || "-"}</td>
              <td className="p-2 border">{p.note || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}