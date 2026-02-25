'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react';
import { createCustomer, getCustomers, updateCustomer, deleteCustomer } from '@/services/customer';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface CustomerForm {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [formData, setFormData] = useState<CustomerForm>({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
   /* Pagination */
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

   /* Search */
  const [search, setSearch] = useState('');

  //load customers
  //   useEffect(() => {
  //   async function loadCustomers() {
  //     const data = await getCustomers();
  //     setCustomers(data as Customer[]);
  //     setLoading(false);
  //   }
  //   loadCustomers();
  // }, []);
    useEffect(() => {
    const q = query(collection(db, 'customers'), orderBy('name'), limit(10));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Customer[];

      setCustomers(data);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setLoading(false)
    });

    return () => unsubscribe();
  }, []);

  //load more
    const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);

    const q = query(
      collection(db, 'customers'),
      orderBy('name'),
      startAfter(lastDoc),
      limit(10)
    );

    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Customer[];

    setCustomers((prev) => [...prev, ...data]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
    setLoadingMore(false);
  };

  // Create or Update Customer
  //   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (editingId) {
  //     await updateCustomer(editingId, formData);

  //     setCustomers((prev) =>
  //       prev.map((c) => (c.id === editingId ? { ...c, ...formData } : c))
  //     );
  //   } else {
  //     const docRef = await createCustomer(formData);

  //     const newCustomer: Customer = {
  //       id: docRef.id,
  //       ...formData,
  //     };

  //     setCustomers((prev) => [newCustomer, ...prev]);
  //   }

  //   resetForm();
  // };
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      await updateCustomer(editingId, formData);
    } else {
      await createCustomer(formData);
    }

    resetForm();
  };

   const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
    });
    setEditingId(customer.id);
    setShowForm(true);
  };


  //delete
   const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    await deleteCustomer(id);
    // setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  //resetform
 const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  //search filter
    const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-500" />
        <input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg w-full max-w-md"
        />
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingId ? 'Edit Customer' : 'Add Customer'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
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
                type="email"
                value={formData.email}
                onChange={(v) => setFormData({ ...formData, email: v })}
              />

              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(v) => setFormData({ ...formData, phone: v })}
              />

              <Textarea
                label="Address"
                value={formData.address}
                onChange={(v) => setFormData({ ...formData, address: v })}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Phone</th>
              <th className="px-6 py-3 text-left">Address</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{c.name}</td>
                <td className="px-6 py-4">{c.email || '-'}</td>
                <td className="px-6 py-4">{c.phone || '-'}</td>
                <td className="px-6 py-4">{c.address || '-'}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 mr-4">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        

        {/* {customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No customers found. Add your first customer!
          </div>
        )} */}
        {loading && (
          <div className="text-center py-8 text-gray-500">Loading customers...</div>
        )}

        {!loading && customers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No customers found. Add your first customer!
          </div>
        )}
      </div>
    </div>
  );
}

/* =======================
   Reusable Inputs
======================= */

interface InputProps {
  label: string;
  value: string;
  required?: boolean;
  type?: string;
  onChange: (value: string) => void;
}

function Input({ label, value, required, type = 'text', onChange }: InputProps) {
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
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

interface TextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function Textarea({ label, value, onChange }: TextareaProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
