"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { TopCustomers } from "@/components/charts/TopCustomers";
import { CustomerGrowth } from "@/components/charts/CustomerGrowth";
import { ProductPerformance } from "@/components/charts/ProductPerformance";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TenantSelector } from "@/components/dashboard/TenantSelector";
import { DateRangeFilter } from "@/components/dashboard/DateRangeFilter";
import { isAuthenticated } from "@/lib/auth";
import { tenantApi } from "@/lib/api";

export default function DashboardPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }

    loadTenants();
  }, [router]);

  const loadTenants = async () => {
    try {
      const data = await tenantApi.getAll();
      setTenants(data);
      if (data.length > 0 && !selectedTenant) {
        setSelectedTenant(data[0].id);
      }
    } catch (error) {
      console.error("Failed to load tenants:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (tenants.length === 0) {
    return (
      <div className="flex min-h-screen dark-bg">
        <Sidebar />
        <main className="flex-1">
          <Navbar />
          <div className="p-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
            <div className="glass-effect rounded-3xl shadow-2xl p-12 text-center max-w-2xl border border-teal-500/30 animate-float">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-teal-400 via-teal-500 to-gray-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-teal-500/50">
                <svg className="w-12 h-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold mb-4 text-silver-gradient">
                No Stores Connected
              </h2>
              <p className="text-gray-300 mb-8 text-lg">
                Connect your Shopify store to unlock powerful analytics and insights
              </p>
              <button
                onClick={() => router.push("/tenants/new")}
                className="bg-gradient-to-r from-teal-400 via-teal-500 to-gray-400 hover:from-teal-500 hover:via-teal-400 hover:to-gray-300 text-black px-8 py-4 rounded-xl font-bold shadow-lg shadow-teal-500/50 hover:shadow-teal-400/60 transition-all duration-300 inline-flex items-center gap-2 hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Connect Your First Store
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen dark-bg">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-8 space-y-6">
          <TenantSelector
            tenants={tenants}
            selectedTenant={selectedTenant}
            onSelectTenant={setSelectedTenant}
            onRefresh={loadTenants}
          />

          {selectedTenant && (
            <>
              <DateRangeFilter currentRange={dateRange} onRangeChange={setDateRange} />
              
              <StatsCards tenantId={selectedTenant} dateRange={dateRange} />
              
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <RevenueChart tenantId={selectedTenant} dateRange={dateRange} />
                <TopCustomers tenantId={selectedTenant} dateRange={dateRange} />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <CustomerGrowth tenantId={selectedTenant} dateRange={dateRange} />
                <ProductPerformance tenantId={selectedTenant} dateRange={dateRange} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
