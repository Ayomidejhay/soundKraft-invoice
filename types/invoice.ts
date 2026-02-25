export type InvoiceType = "sale" | "rentage" | "service";

export interface InventoryItem {
  id: string;
  name: string;
  salePrice: number;
  rentPricePerDay: number;
}

export interface InvoiceItem {
  id: string;
  inventoryId: string;
  name: string;
  quantity: number;
  days: number; // rentage only
  inventoryPrice: number;
  customPrice?: number;
  unitPrice: number;
  total: number;
}

// types/invoiceItem.ts
export interface InvoiceItems {
  item_id: string;
  item_name: string;
  item_image?: string; // 👈 required for table
  quantity: number;
  unit_price: number;
  total: number;
}

// types/invoice.ts


export interface Invoices {
  id?: string;

  invoice_number: string;
  customer_id: string;
  customer_name: string;

  invoice_date: string;
  due_date: string;

  type: "sale" | "rental";

  rental_start_date?: string;
  rental_end_date?: string;

  status: "draft" | "sent" | "paid" | "overdue";

  notes?: string;

  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;

  items: InvoiceItems[]; // ✅ embedded items
  createdAt?: Date;
}


export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  type: string;
  status: string;
  total: number; // will calculate dynamically
}