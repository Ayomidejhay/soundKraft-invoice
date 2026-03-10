// import { supabase } from "@/lib/supabase";
// import { Item } from "@/types/item";

// // Create
// export async function createItem(item: Omit<Item, "id" | "created_at">) {
//   const { error } = await supabase.from("items").insert([item]);
//   if (error) throw error;
// }

// // Update
// export async function updateItem(id: string, item: Partial<Item>) {
//   const { error } = await supabase
//     .from("items")
//     .update(item)
//     .eq("id", id);

//   if (error) throw error;
// }

// // Delete
// export async function deleteItem(id: string) {
//   const { error } = await supabase
//     .from("items")
//     .delete()
//     .eq("id", id);

//   if (error) throw error;
// }

// // Listen / Fetch Items
// export function listenToItems(
//   setItems: React.Dispatch<React.SetStateAction<Item[]>>,
//   search: string
// ) {
//   fetchItems(setItems, search);
//   return () => {}; // cleanup placeholder
// }

// // Internal fetch function
// async function fetchItems(
//   setItems: React.Dispatch<React.SetStateAction<Item[]>>,
//   search: string
// ) {
//   let query = supabase
//     .from("items")
//     .select("*")
//     .order("created_at", { ascending: false });

//   if (search) {
//     query = query.ilike("name", `%${search}%`);
//   }

//   const { data, error } = await query;

//   if (error) {
//     console.error(error);
//     return;
//   }

//   setItems(data as Item[]);
// }

import { supabase } from "@/lib/supabase";
import { Item } from "@/types/item";

// CREATE
export async function createItem(
  item: Omit<Item, "id" | "created_at">
) {
  const { error } = await supabase
    .from("items")
    .insert([item]);

  if (error) throw error;
}

// UPDATE
export async function updateItem(
  id: string,
  item: Partial<Omit<Item, "id" | "created_at">>
) {
  const { error } = await supabase
    .from("items")
    .update(item)
    .eq("id", id);

  if (error) throw error;
}

// DELETE
export async function deleteItem(id: string) {
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (error) throw error;
}



// FETCH ITEMS
export async function fetchItems(search?: string) {
  let query = supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data as Item[];
}



export async function fetchItemsWithPagination(
  search: string,
  page: number,
  pageSize: number
): Promise<Item[]> {
  let query = supabase
    .from("items")
    .select("*")
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) throw error;
  return data as Item[];
}