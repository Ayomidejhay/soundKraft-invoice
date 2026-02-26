"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AddPaymentModal({
  invoiceId,
  onClose,
  onSaved,
}: {
  invoiceId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!amount) return alert("Enter amount");

    setLoading(true);
    await addDoc(collection(db, "invoices", invoiceId, "payments"), {
      amount: Number(amount),
      method,
      reference,
      note,
      paid_at: new Date().toISOString(),
    });

    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Record Payment</h2>

        <input
          type="number"
          placeholder="Amount paid"
          className="w-full border p-2 mb-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select className="w-full border p-2 mb-2" value={method} onChange={e => setMethod(e.target.value)}>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="pos">POS</option>
          <option value="crypto">Crypto</option>
          <option value="cheque">Cheque</option>
        </select>

        <input
          placeholder="Reference (optional)"
          className="w-full border p-2 mb-2"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
        />

        <textarea
          placeholder="Note"
          className="w-full border p-2 mb-2"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="border px-3 py-2 rounded">Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}