// types/payment.ts
export interface Payment {
  id: string;
  amount: number;
  method: "cash" | "bank_transfer" | "pos" | "crypto" | "cheque";
  reference?: string;
  note?: string;
  paid_at: string;
}