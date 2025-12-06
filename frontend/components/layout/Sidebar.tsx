"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/providers/SidebarProvider";

// Icon Components
const DashboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const CustomersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const OrdersIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const ProductsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);

const InsightsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const EventsIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const links = [
  { 
    name: "Dashboard", 
    href: "/dashboard",
    Icon: DashboardIcon
  },
  { 
    name: "Customers", 
    href: "/customers",
    Icon: CustomersIcon
  },
  { 
    name: "Orders", 
    href: "/orders",
    Icon: OrdersIcon
  },
  { 
    name: "Products", 
    href: "/products",
    Icon: ProductsIcon
  },
  { 
    name: "Insights", 
    href: "/insights",
    Icon: InsightsIcon
  },
  { 
    name: "Events", 
    href: "/events",
    Icon: EventsIcon
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  
  return (
    <aside className={cn(
      "bg-gradient-to-b from-black via-gray-900 to-black border-r border-teal-500/30 h-screen sticky top-0 dark-bg transition-all duration-300 flex-shrink-0",
      isCollapsed ? "w-20" : "w-72"
    )}>
      <div className={cn("h-full flex flex-col overflow-y-auto overflow-x-hidden", isCollapsed ? "p-3" : "p-6")}>
        <div className={cn(isCollapsed ? "mb-6" : "mb-8")}>
          <div className={cn("flex items-center mb-2", isCollapsed ? "justify-center" : "gap-3")}>
            <div className={cn(
              "bg-gradient-to-br from-teal-400 to-gray-400 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30 flex-shrink-0",
              isCollapsed ? "w-10 h-10" : "w-12 h-12"
            )}>
              <svg className={cn(isCollapsed ? "w-5 h-5" : "w-7 h-7", "text-black")} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            {!isCollapsed && (
              <h2 className="text-2xl font-bold text-silver-gradient">Nexus</h2>
            )}
          </div>
          {!isCollapsed && (
            <p className="text-sm text-gray-400 ml-15">Analytics Dashboard</p>
          )}
        </div>
        
        <nav className="flex flex-col space-y-2 flex-1">
          {links.map((link) => {
            const { Icon } = link;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200",
                  isCollapsed ? "justify-center p-3" : "gap-3 px-4 py-3",
                  pathname === link.href 
                    ? "bg-gradient-to-r from-teal-500 via-teal-400 to-gray-400 text-black shadow-lg shadow-teal-500/30 font-bold" 
                    : "text-gray-300 hover:bg-teal-500/10 hover:text-teal-300 border border-transparent hover:border-teal-500/30"
                )}
                title={isCollapsed ? link.name : undefined}
              >
                <Icon className={cn(isCollapsed ? "w-5 h-5 flex-shrink-0" : "w-5 h-5 flex-shrink-0")} />
                {!isCollapsed && <span className="font-medium">{link.name}</span>}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleSidebar}
          className={cn(
            "mt-4 flex items-center rounded-xl text-gray-300 hover:bg-teal-500/10 hover:text-teal-300 border border-teal-500/30 hover:border-teal-400/50 transition-all duration-200",
            isCollapsed ? "justify-center p-3" : "justify-center gap-2 px-4 py-3"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg 
            className={cn("transition-transform duration-300 flex-shrink-0", isCollapsed ? "w-5 h-5 rotate-180" : "w-5 h-5")} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
