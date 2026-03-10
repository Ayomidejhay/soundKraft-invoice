

// import { supabase } from "@/lib/supabase";

// export async function uploadItemImage(file: File) {
//   const fileName = `${Date.now()}-${file.name}`;

//   const { data, error } = await supabase.storage
//     .from("inventory")
//     .upload(fileName, file);

//   if (error) {
//     console.error(error);
//     throw new Error("Upload failed");
//   }

//   const { data: urlData } = supabase.storage
//     .from("inventory")
//     .getPublicUrl(fileName);

//   return urlData.publicUrl;
// }

import { supabase } from "@/lib/supabase";

export async function uploadItemImage(file: File) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("inventory")
    .upload(fileName, file);

  if (error) {
    console.error(error);
    throw new Error("Image upload failed");
  }

  const { data } = supabase.storage
    .from("inventory")
    .getPublicUrl(fileName);

  return data.publicUrl;
}

//DELETE IMAGE
export async function deleteItemImage(url: string) {
  try {
    const segments = url.split("/");
    const fileName = segments[segments.length - 1].split("?")[0]; // get file name from public URL
    const { error } = await supabase.storage.from("inventory").remove([fileName]);
    if (error) throw error;
  } catch (error) {
    console.error("Failed to delete image:", error);
  }
}