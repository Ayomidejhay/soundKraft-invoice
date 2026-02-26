// import { AuthProvider } from "./context/AuthContext"
// import type { Metadata } from "next";

// export const metadata: Metadata = {
//   title: "SoundKraft Invoice",
//   description: "SoundKraft invoice generation app",
// };
// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body>
//         <AuthProvider>{children}</AuthProvider>
//       </body>
//     </html>
//   )
// }

import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "./context/AuthContext"
import type { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "SoundKraft Invoice",
  description: "SoundKraft invoice generation app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}