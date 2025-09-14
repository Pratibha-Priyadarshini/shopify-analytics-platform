import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function InsightsPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Customers</h2>
          <p>Customer list will go here.</p>
        </div>
      </main>
    </div>
  );
}
