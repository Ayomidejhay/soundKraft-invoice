"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, Package, Users, Home } from "lucide-react"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
  { id: "invoices", label: "Invoices", icon: FileText, href: "/invoices" },
  { id: "customers", label: "Customers", icon: Users, href: "/customers" },
  { id: "items", label: "Inventory", icon: Package, href: "/inventory" },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            {/* <FileText className="h-8 w-8 text-blue-600" /> */}
            <h1 className="text-xl font-bold text-gray-900">SoundKraft Invoice</h1>
          </div>

          {/* Nav Items */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
