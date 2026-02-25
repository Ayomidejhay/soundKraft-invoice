import "../globals.css";
// import QueryProvider from "../providers/QueryProvider";

export const metadata= {
  title: "Runnars",
  description: "Runnars Admin Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* <QueryProvider>{children}</QueryProvider> */}
        {children}
      </body>
    </html>
  )
}