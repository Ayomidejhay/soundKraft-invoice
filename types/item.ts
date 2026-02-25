// types/item.ts
export interface Item {
  id?: string; // optional for new items
  name: string;
  category: string;
  description: string;
  price_sale: number;
  price_rental_per_day: number;
  stock_quantity: number;
  image?: string;
  createdAt?: Date;
  name_lower?: string;
}