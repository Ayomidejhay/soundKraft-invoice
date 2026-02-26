"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Item } from "@/types/item";
import {
  createItem,
  updateItem,
  deleteItem,
  listenToItems,
} from "@/services/inventoryService";
import { uploadItemImage } from "@/services/uploadService";

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  const [formData, setFormData] = useState<Omit<Item, "id" | "createdAt">>({
    name: "",
    category: "sound_gadgets",
    description: "",
    price_sale: 0,
    price_rental_per_day: 0,
    stock_quantity: 0,
    image: "",
  });

  // ================= CATEGORIES =================
  const categories = [
    { value: "sound_gadgets", label: "Sound Gadgets" },
    { value: "stage", label: "Stage Equipment" },
    { value: "screen", label: "Screens" },
    { value: "musical_instruments", label: "Musical Instruments" },
  ];

  const getCategoryLabel = (category: string) =>
    categories.find((c) => c.value === category)?.label ?? category;

  // ================= REAL-TIME LISTENER =================
  useEffect(() => {
    const unsubscribe = listenToItems(setItems, search);
    return () => unsubscribe();
  }, [search]);

  // ================= IMAGE UPLOAD PREVIEW =================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let imageUrl = formData.image;

    if (imageFile) {
      imageUrl = await uploadItemImage(imageFile);
    }

    const payload = { ...formData, image: imageUrl };

    if (editingId) {
      await updateItem(editingId, payload);
    } else {
      await createItem(payload);
    }

    resetForm();
  };

  // ================= DELETE =================
  const handleDelete = async (item: Item) => {
    if (!item.id) return;
    if (!confirm("Delete this item?")) return;
    await deleteItem(item.id);
  };

  // ================= EDIT =================
  const handleEdit = (item: Item) => {
    setEditingId(item.id || null);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description,
      price_sale: item.price_sale,
      price_rental_per_day: item.price_rental_per_day,
      stock_quantity: item.stock_quantity,
      image: item.image || "",
    });

    setPreview(item.image || "");
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImageFile(null);
    setPreview("");
    setFormData({
      name: "",
      category: "sound_gadgets",
      description: "",
      price_sale: 0,
      price_rental_per_day: 0,
      stock_quantity: 0,
      image: "",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold">Inventory</h2>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border rounded-lg w-full sm:w-auto"
          />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </button>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg overflow-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Item" : "Add Item"}
              </h3>
              <button onClick={resetForm}>
                <X />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Image */}
              <div>
                <label className="block text-sm font-medium mb-1">Item Image</label>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex gap-2 px-3 py-2 border rounded cursor-pointer hover:bg-gray-100 transition">
                    <ImageIcon />
                    Upload
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>

                  {preview && (
                    <Image
                      src={preview}
                      alt="Preview"
                      width={64}
                      height={64}
                      className="rounded border"
                    />
                  )}
                </div>
              </div>

              {/* Name & Category */}
              <input
                required
                placeholder="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              >
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              {/* Description */}
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border px-3 py-2 rounded"
              />

              {/* Prices & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="number"
                  placeholder="Sale Price"
                  value={formData.price_sale}
                  onChange={(e) =>
                    setFormData({ ...formData, price_sale: Number(e.target.value) })
                  }
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Rental / Day"
                  value={formData.price_rental_per_day}
                  onChange={(e) =>
                    setFormData({ ...formData, price_rental_per_day: Number(e.target.value) })
                  }
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock_quantity}
                  onChange={(e) =>
                    setFormData({ ...formData, stock_quantity: Number(e.target.value) })
                  }
                  className="border px-3 py-2 rounded"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-10">
            No inventory items
          </div>
        )}

        {items.map((item) => (
          <div key={item.id} className="bg-white shadow rounded-lg overflow-hidden flex flex-col">
            <div className="relative h-40 w-full">
              {item.image && (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <div className="p-4 flex flex-col gap-2 flex-1">
              <h4 className="font-semibold text-lg">{item.name}</h4>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="text-sm font-medium">{getCategoryLabel(item.category)}</p>
              <div className="flex justify-between mt-auto text-sm">
                <span>₦{item.price_sale.toLocaleString()}</span>
                <span>₦{item.price_rental_per_day.toLocaleString()}/day</span>
                <span>Stock: {item.stock_quantity}</span>
              </div>

              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800 transition">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item)} className="text-red-600 hover:text-red-800 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}