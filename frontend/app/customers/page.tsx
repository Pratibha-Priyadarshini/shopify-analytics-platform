"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { isAuthenticated } from "@/lib/auth";
import { tenantApi } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
  status: "active" | "inactive" | "vip";
  lifetimeValue: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("totalSpent");

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

  useEffect(() => {
    if (selectedTenant) {
      loadCustomers();
    }
  }, [selectedTenant]);

  const loadCustomers = async () => {
    if (!selectedTenant) return;
    try {
      const { customersApi } = await import("@/lib/api");
      const data = await customersApi.getAll(selectedTenant);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load customers:", error);
      setCustomers([]);
    }
  };

  const filteredCustomers = customers
    .filter(c => 
      (filterStatus === "all" || c.status === filterStatus) &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       c.email.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === "totalSpent") return b.totalSpent - a.totalSpent;
      if (sortBy === "totalOrders") return b.totalOrders - a.totalOrders;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === "active").length,
    vip: customers.filter(c => c.status === "vip").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0)
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "vip": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "active": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "inactive": return "bg-gray-500/20 text-gray-300 border-gray-500/50";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center dark-bg">
        <div className="text-lg text-teal-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen dark-bg">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-silver-gradient mb-2">Customers</h1>
              <p className="text-gray-400">Manage and analyze your customer base</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-effect rounded-2xl p-6 border border-teal-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Customers</span>
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-teal-300">{stats.total}</div>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Active Customers</span>
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-green-300">{stats.active}</div>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-yellow-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">VIP Customers</span>
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-yellow-300">{stats.vip}</div>
            </div>

            <div className="glass-effect rounded-2xl p-6 border border-purple-500/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Revenue</span>
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-purple-300">${stats.totalRevenue.toLocaleString()}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-effect rounded-2xl p-6 border border-teal-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Search</label>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="vip">VIP</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="totalSpent">Total Spent</option>
                  <option value="totalOrders">Total Orders</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div className="glass-effect rounded-2xl border border-teal-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-500/10 border-b border-teal-500/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Orders</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Total Spent</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Avg Order</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">LTV</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-500/10">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-teal-500/5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{customer.name}</div>
                          <div className="text-sm text-gray-400">{customer.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(customer.status)}`}>
                          {customer.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-white">{customer.totalOrders}</td>
                      <td className="px-6 py-4 text-right font-medium text-teal-300">${customer.totalSpent.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right text-gray-300">${customer.averageOrderValue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right font-medium text-purple-300">${customer.lifetimeValue.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-300">{new Date(customer.lastOrderDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
