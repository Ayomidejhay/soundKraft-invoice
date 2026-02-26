export function PaymentProgress({ total, paid }: { total: number; paid: number }) {
  const percent = Math.min((paid / total) * 100, 100);

  return (
    <div className="my-4">
      <div className="flex justify-between text-sm mb-1">
        <span>Paid: ₦{paid.toLocaleString()}</span>
        <span>Balance: ₦{(total - paid).toLocaleString()}</span>
      </div>

      <div className="w-full bg-gray-200 h-3 rounded">
        <div
          className="bg-green-600 h-3 rounded"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}