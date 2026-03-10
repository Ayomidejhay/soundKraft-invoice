// 'use client';

// import { useState, useEffect } from 'react';
// import { Plus, Edit2, Trash2, X,  } from 'lucide-react';
// import { createCustomer, getCustomers, updateCustomer, deleteCustomer } from '@/services/customer';
// import {
//   collection,
//   onSnapshot,
//   query,
//   orderBy,
//   limit,
//   startAfter,
//   getDocs,
//   DocumentData,
// } from 'firebase/firestore';
// import { db } from '@/lib/firebase';

// interface Customer {
//   id: string;
//   name: string;
//   email?: string;
//   phone?: string;
//   address?: string;
// }

// interface CustomerForm {
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
// }

// export default function Customers() {
//   const [customers, setCustomers] = useState<Customer[]>([]);
//   const [showForm, setShowForm] = useState<boolean>(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   const [formData, setFormData] = useState<CustomerForm>({
//     name: '',
//     email: '',
//     phone: '',
//     address: '',
//   });

//   /* Pagination */
//   const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
//   const [loadingMore, setLoadingMore] = useState(false);

//   /* Search */
//   const [search, setSearch] = useState('');

//   // Load customers with real-time listener
//   useEffect(() => {
//     const q = query(collection(db, 'customers'), orderBy('name'), limit(10));
//     const unsubscribe = onSnapshot(q, (snapshot) => {
//       const data = snapshot.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       })) as Customer[];
//       setCustomers(data);
//       setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   // Load more for pagination
//   const loadMore = async () => {
//     if (!lastDoc) return;
//     setLoadingMore(true);
//     const q = query(collection(db, 'customers'), orderBy('name'), startAfter(lastDoc), limit(10));
//     const snapshot = await getDocs(q);
//     const data = snapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     })) as Customer[];
//     setCustomers((prev) => [...prev, ...data]);
//     setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
//     setLoadingMore(false);
//   };

//   // Create or update customer
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (editingId) {
//       await updateCustomer(editingId, formData);
//     } else {
//       await createCustomer(formData);
//     }
//     resetForm();
//   };

//   // Edit customer
//   const handleEdit = (customer: Customer) => {
//     setFormData({
//       name: customer.name,
//       email: customer.email || '',
//       phone: customer.phone || '',
//       address: customer.address || '',
//     });
//     setEditingId(customer.id);
//     setShowForm(true);
//   };

//   // Delete customer
//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this customer?')) return;
//     await deleteCustomer(id);
//   };

//   const resetForm = () => {
//     setShowForm(false);
//     setEditingId(null);
//     setFormData({ name: '', email: '', phone: '', address: '' });
//   };

//   // Filtered search results
//   const filteredCustomers = customers.filter((c) =>
//     c.name.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
//         <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
//         <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
//           <div className="flex items-center gap-2 w-full sm:w-auto">

//             <input
//               placeholder="Search customers..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="border px-3 py-2 rounded-lg w-full sm:w-auto flex-1"
//             />
//           </div>
//           <button
//             onClick={() => { resetForm(); setShowForm(true); }}
//             className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             <Plus className="h-4 w-4 mr-2" />
//             Add Customer
//           </button>
//         </div>
//       </div>

//       {/* Modal Form */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md overflow-auto max-h-[90vh]">
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-lg font-semibold">{editingId ? 'Edit Customer' : 'Add Customer'}</h3>
//               <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-4">
//               <Input label="Name *" required value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
//               <Input label="Email" type="email" value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
//               <Input label="Phone" type="tel" value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
//               <Textarea label="Address" value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} />

//               <div className="flex justify-end space-x-3 pt-4">
//                 <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition">Cancel</button>
//                 <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
//                   {editingId ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Mobile Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//         {loading && (
//           <div className="text-center py-8 text-gray-500 col-span-full">Loading customers...</div>
//         )}

//         {!loading && filteredCustomers.length === 0 && (
//           <div className="text-center py-12 text-gray-500 col-span-full">
//             No customers found. Add your first customer!
//           </div>
//         )}

//         {filteredCustomers.map((c) => (
//           <div key={c.id} className="bg-white shadow rounded-lg p-4 flex flex-col justify-between">
//             <div className="flex flex-col gap-1">
//               <p className="font-medium text-gray-900">{c.name}</p>
//               {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
//               {c.phone && <p className="text-sm text-gray-500">{c.phone}</p>}
//               {c.address && <p className="text-sm text-gray-500">{c.address}</p>}
//             </div>
//             <div className="flex justify-end gap-2 mt-3">
//               <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800 transition">
//                 <Edit2 size={16} />
//               </button>
//               <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800 transition">
//                 <Trash2 size={16} />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Load More Button */}
//       {lastDoc && (
//         <div className="flex justify-center mt-6">
//           <button
//             onClick={loadMore}
//             disabled={loadingMore}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             {loadingMore ? 'Loading...' : 'Load More'}
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// /* =======================
//    Reusable Inputs
// ======================= */

// interface InputProps {
//   label: string;
//   value: string;
//   required?: boolean;
//   type?: string;
//   onChange: (value: string) => void;
// }

// function Input({ label, value, required, type = 'text', onChange }: InputProps) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <input
//         type={type}
//         required={required}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//       />
//     </div>
//   );
// }

// interface TextareaProps {
//   label: string;
//   value: string;
//   onChange: (value: string) => void;
// }

// function Textarea({ label, value, onChange }: TextareaProps) {
//   return (
//     <div>
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <textarea
//         rows={3}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//       />
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  deleteCustomer,
  Customer,
  CustomerForm,
} from "@/services/customer";

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState<CustomerForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Load customers
  const loadCustomers = async () => {
    setLoading(true);
    const data = await getCustomers(search, page, pageSize);
    setCustomers((prev) => (page === 0 ? data : [...prev, ...data]));
    setLoading(false);
  };

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getCustomers(search, page, pageSize);
      setCustomers((prev) => (page === 0 ? data : [...prev, ...data]));
      setLoading(false);
    };

    fetch();
  }, [page, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateCustomer(editingId, formData);
    } else {
      await createCustomer(formData);
    }

    resetForm();
    setPage(0);
    loadCustomers();
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email ?? "",
      phone: customer.phone ?? "",
      address: customer.address ?? "",
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer?")) return;
    await deleteCustomer(id);
    setPage(0);
    loadCustomers();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: "", email: "", phone: "", address: "" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="border px-3 py-2 rounded-lg w-full sm:w-auto"
          />

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && (
          <div className="text-center py-8 text-gray-500 col-span-full">
            Loading customers...
          </div>
        )}

        {!loading && customers.length === 0 && (
          <div className="text-center py-12 text-gray-500 col-span-full">
            No customers found.
          </div>
        )}

        {customers.map((c) => (
          <div
            key={c.id}
            className="bg-white shadow rounded-lg p-4 flex flex-col justify-between"
          >
            <div className="flex flex-col gap-1">
              <p className="font-medium text-gray-900">{c.name}</p>
              {c.email && <p className="text-sm text-gray-500">{c.email}</p>}
              {c.phone && <p className="text-sm text-gray-500">{c.phone}</p>}
              {c.address && (
                <p className="text-sm text-gray-500">{c.address}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => handleEdit(c)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <Edit2 size={16} />
              </button>

              <button
                onClick={() => handleDelete(c.id)}
                className="text-red-600 hover:text-red-800 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {customers.length >= pageSize && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setPage((prev) => prev + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Load More
          </button>
        </div>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Customer" : "Add Customer"}
              </h3>
              <button onClick={resetForm}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name *"
                required
                value={formData.name}
                onChange={(v) => setFormData({ ...formData, name: v })}
              />
              <Input
                label="Email"
                value={formData.email ?? ""}
                onChange={(v) => setFormData({ ...formData, email: v })}
              />
              <Input
                label="Phone"
                value={formData.phone ?? ""}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />
              <Textarea
                label="Address"
                value={formData.address ?? ""}
                onChange={(v) => setFormData({ ...formData, address: v })}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* Reusable Inputs */

function Input({
  label,
  value,
  required,
  type = "text",
  onChange,
}: {
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
      />
    </div>
  );
}
