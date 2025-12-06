import "../styles/globals.css";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { SidebarProvider } from "@/components/providers/SidebarProvider";

export const metadata = {
  title: 'Nexus Analytics - Shopify Insights Dashboard',
  description: 'Multi-tenant Shopify data ingestion and analytics platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SidebarProvider>
      </body>
    </html>
  )
}
