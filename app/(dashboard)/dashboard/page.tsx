'use client'

import { useEffect, useState } from "react";
import { FileText, DollarSign, Users, Package } from "lucide-react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* ================== STAT CARD ================== */
function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  );
}

/* ================== QUICK ACTION ================== */
function QuickAction({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-5 hover:bg-gray-50 cursor-pointer transition">
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
}

/* ================== DASHBOARD PAGE ================== */
export default function DashboardPage() {
  const [totalInvoices, setTotalInvoices] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalCustomers, setTotalCustomers] = useState<number>(0);
  const [totalInventory, setTotalInventory] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // ================== Invoices ==================
        const invoicesSnap = await getDocs(collection(db, "invoices"));
        let revenue = 0;
        invoicesSnap.forEach(doc => {
          const data = doc.data();
          revenue += Number(data.total || 0);
        });
        setTotalInvoices(invoicesSnap.size);
        setTotalRevenue(revenue);

        // ================== Customers ==================
        const customersSnap = await getDocs(collection(db, "customers"));
        setTotalCustomers(customersSnap.size);

        // ================== Inventory ==================
        const inventorySnap = await getDocs(collection(db, "inventory"));
        setTotalInventory(inventorySnap.size);

      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="p-10">Loading dashboard...</div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* ================== HEADER ================== */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* ================== STATS ================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Invoices"
          value={totalInvoices}
          icon={FileText}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Revenue"
          value={`₦${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Customers"
          value={totalCustomers}
          icon={Users}
          color="bg-orange-500"
        />
        <StatCard
          title="Inventory Items"
          value={totalInventory}
          icon={Package}
          color="bg-purple-500"
        />
      </div>

      {/* ================== QUICK ACTIONS ================== */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickAction
            title="Create Invoice"
            description="Generate a new sale or rental invoice"
          />
          <QuickAction
            title="Add Customer"
            description="Register a new customer"
          />
          <QuickAction
            title="Add Item"
            description="Add equipment to inventory"
          />
        </div>
      </div>
    </div>
  );
}