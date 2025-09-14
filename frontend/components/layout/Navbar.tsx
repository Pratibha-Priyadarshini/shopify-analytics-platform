"use client";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="flex justify-between items-center p-4 border-b bg-white">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <Button variant="outline">Logout</Button>
    </header>
  );
}
