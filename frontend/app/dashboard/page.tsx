import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { TopCustomers } from "@/components/charts/TopCustomers";

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <RevenueChart />
          <TopCustomers />
        </div>
      </main>
    </div>
  );
}
