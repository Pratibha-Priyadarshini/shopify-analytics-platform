"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Customers", href: "/customers" },
  { name: "Orders", href: "/orders" },
  { name: "Products", href: "/products" },
  { name: "Insights", href: "/insights" }
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-white shadow-md p-4 h-screen sticky top-0">
      <h2 className="text-xl font-bold mb-6">MyApp</h2>
      <nav className="flex flex-col space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "p-2 rounded-md hover:bg-gray-100",
              pathname === link.href && "bg-gray-200 font-medium"
            )}
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
