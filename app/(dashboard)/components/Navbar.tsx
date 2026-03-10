// "use client"

// import Link from "next/link"
// import { usePathname, useRouter } from "next/navigation"
// import { useState } from "react"
// import { signOut } from "firebase/auth"
// import { auth } from "@/lib/firebase"
// import {
//   FileText,
//   Package,
//   Users,
//   Home,
//   Menu,
//   X,
//   LogOut,
// } from "lucide-react"

// const navItems = [
//   { label: "Dashboard", icon: Home, href: "/dashboard" },
//   { label: "Invoices", icon: FileText, href: "/invoices" },
//   { label: "Customers", icon: Users, href: "/customers" },
//   { label: "Inventory", icon: Package, href: "/inventory" },
// ]

// export default function Navbar() {
//   const pathname = usePathname()
//   const router = useRouter()
//   const [isOpen, setIsOpen] = useState(false)

//   const handleLogout = async () => {
//     await signOut(auth)
//     router.push("/login")
//   }

//   return (
//     <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

//         {/* Top Bar */}
//         <div className="flex justify-between items-center h-16">

//           {/* Logo */}
//           <div className="text-xl font-semibold tracking-tight">
//             SoundKraft
//           </div>

//           {/* Desktop Nav */}
//           <nav className="hidden md:flex items-center space-x-2">
//             {navItems.map((item) => {
//               const Icon = item.icon
//               const active = pathname.startsWith(item.href)

//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
//                     active
//                       ? "text-blue-600"
//                       : "text-gray-600 hover:text-gray-900"
//                   }`}
//                 >
//                   <Icon className="h-4 w-4 mr-2" />
//                   {item.label}

//                   {/* Animated active underline */}
//                   {active && (
//                     <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
//                   )}
//                 </Link>
//               )
//             })}

//             <button
//               onClick={handleLogout}
//               className="ml-4 flex items-center px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
//             >
//               <LogOut className="h-4 w-4 mr-2" />
//               Logout
//             </button>
//           </nav>

//           {/* Mobile Button */}
//           <button
//             onClick={() => setIsOpen(!isOpen)}
//             className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
//           >
//             {isOpen ? (
//               <X className="h-6 w-6" />
//             ) : (
//               <Menu className="h-6 w-6" />
//             )}
//           </button>
//         </div>
//       </div>

//       {/* Animated Mobile Menu */}
//       <div
//         className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
//           isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
//         }`}
//       >
//         <div className="px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-200">
//           {navItems.map((item) => {
//             const Icon = item.icon
//             const active = pathname.startsWith(item.href)

//             return (
//               <Link
//                 key={item.href}
//                 href={item.href}
//                 onClick={() => setIsOpen(false)}
//                 className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
//                   active
//                     ? "bg-blue-50 text-blue-600"
//                     : "text-gray-700 hover:bg-gray-100"
//                 }`}
//               >
//                 <Icon className="h-4 w-4 mr-3" />
//                 {item.label}
//               </Link>
//             )
//           })}

//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
//           >
//             <LogOut className="h-4 w-4 mr-3" />
//             Logout
//           </button>
//         </div>
//       </div>
//     </header>
//   )
// }

'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  FileText,
  Package,
  Users,
  Home,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: Home, href: '/dashboard' },
  { label: 'Invoices', icon: FileText, href: '/invoices' },
  { label: 'Customers', icon: Users, href: '/customers' },
  { label: 'Inventory', icon: Package, href: '/inventory' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Bar */}
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="text-xl font-semibold tracking-tight">
            SoundKraft
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    active
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}

                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </Link>
              )
            })}

            <button
              onClick={handleLogout}
              className="ml-4 flex items-center px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </nav>

          {/* Mobile Toggle Button */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-2 bg-white border-t border-gray-200">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Link>
            )
          })}

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}