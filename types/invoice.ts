// export type InvoiceType = "sale" | "rentage" | "service";

// export interface InventoryItem {
//   id: string;
//   name: string;
//   salePrice: number;
//   rentPricePerDay: number;
// }

// export interface InvoiceItem {
//   id: string;
//   inventoryId: string;
//   name: string;
//   quantity: number;
//   days: number; // rentage only
//   inventoryPrice: number;
//   customPrice?: number;
//   unitPrice: number;
//   total: number;
// }

// // types/invoiceItem.ts
// export interface InvoiceItems {
//   item_id: string;
//   item_name: string;
//   item_image?: string; // 👈 required for table
//   quantity: number;
//   unit_price: number;
//   total: number;
// }

// // types/invoice.ts


// export interface Invoices {
//   id?: string;

//   invoice_number: string;
//   customer_id: string;
//   customer_name: string;

//   invoice_date: string;
//   due_date: string;

//   type: "sale" | "rental";

//   rental_start_date?: string;
//   rental_end_date?: string;

//   status: "draft" | "sent" | "paid" | "overdue";

//   notes?: string;

//   subtotal: number;
//   tax?: number;
//   discount?: number;
//   total: number;

//   items: InvoiceItems[]; // ✅ embedded items
//   createdAt?: Date;
// }


// export interface Invoice {
//   id: string;
//   invoice_number: string;
//   customer_name: string;
//   invoice_date: string;
//   due_date: string;
//   type: string;
//   status: string;
//   total: number; // will calculate dynamically
// }

/* ============================= */
/* Invoice Core Types */
/* ============================= */

export type InvoiceType = "sale" | "rental" | "service";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue";

/* ============================= */
/* Inventory */
/* ============================= */

export interface InventoryItem {
  id: string;
  name: string;
  image?: string;

  stock: number;

  price_sale: number;
  price_rental_per_day: number;
}

/* ============================= */
/* Invoice Item (DB Structure) */
/* ============================= */

export interface InvoiceItem {
  id?: string;

  invoice_id?: string; // relational

  item_id: string;
  item_name: string;
  item_image?: string;

  quantity: number;

  // rental only (optional for sale/service)
  rental_days?: number;

  unit_price: number;

  total: number;
}

/* ============================= */
/* Invoice (DB Row) */
/* ============================= */

export interface Invoice {
  id?: string;

  invoice_number: string;

  customer_id: string;
  customer_name: string;

  invoice_date: string;
  due_date: string;

  type: InvoiceType;

  rental_start_date?: string | null;
  rental_end_date?: string | null;
  rental_days?: number | null;

  status: InvoiceStatus;

  notes?: string | null;

  subtotal: number;
  tax?: number;
  discount?: number;

  total: number;

  created_at?: string;
}

/* ============================= */
/* Invoice With Items (Expanded) */
/* ============================= */

export interface InvoiceWithItems extends Invoice {
  items: InvoiceItem[];
}

/* ============================= */
/* Invoice List View (Lightweight) */
/* ============================= */

export interface InvoiceListItem {
  id: string;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  type: InvoiceType;
  status: InvoiceStatus;
  total: number;
}