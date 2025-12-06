"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { isAuthenticated } from "@/lib/auth";
import { tenantApi } from "@/lib/api";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: number;
  paymentMethod: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("30");

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
      loadOrders();
    }
  }, [selectedTenant]);

  const loadOrders = async () => {
    if (!selectedTenant) return;
    try {
      const { ordersApi } = await import("@/lib/api");
      const data = await ordersApi.getAll(selectedTenant, { 
        status: filterStatus !== "all" ? filterStatus : undefined 
      });
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setOrders([]);
    }
  };

  const filteredOrders = orders.filter(o => 
    (filterStatus === "all" || o.status === filterStatus) &&
    (o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
     o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0)
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "processing": return "bg-blue-500/20 text-blue-300 border-blue-500/50";
      case "shipped": return "bg-purple-500/20 text-purple-300 border-purple-500/50";
      case "delivered": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "cancelled": return "bg-red-500/20 text-red-300 border-red-500/50";
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
              <h1 className="text-4xl font-bold text-silver-gradient mb-2">Orders</h1>
              <p className="text-gray-400">Track and manage all your orders</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-effect rounded-2xl p-4 border border-teal-500/30">
              <div className="text-sm text-gray-400 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-teal-300">{stats.total}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-yellow-500/30">
              <div className="text-sm text-gray-400 mb-1">Pending</div>
              <div className="text-2xl font-bold text-yellow-300">{stats.pending}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-blue-500/30">
              <div className="text-sm text-gray-400 mb-1">Processing</div>
              <div className="text-2xl font-bold text-blue-300">{stats.processing}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-purple-500/30">
              <div className="text-sm text-gray-400 mb-1">Shipped</div>
              <div className="text-2xl font-bold text-purple-300">{stats.shipped}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-green-500/30">
              <div className="text-sm text-gray-400 mb-1">Delivered</div>
              <div className="text-2xl font-bold text-green-300">{stats.delivered}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-teal-500/30">
              <div className="text-sm text-gray-400 mb-1">Revenue</div>
              <div className="text-2xl font-bold text-teal-300">${stats.totalRevenue.toFixed(0)}</div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-effect rounded-2xl p-6 border border-teal-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Search</label>
                <input
                  type="text"
                  placeholder="Search orders..."
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
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Date Range</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="glass-effect rounded-2xl border border-teal-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-teal-500/10 border-b border-teal-500/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Order #</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Customer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Items</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-teal-500/10">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-teal-500/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-teal-300">{order.orderNumber}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-white">{order.customerName}</div>
                          <div className="text-sm text-gray-400">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {new Date(order.date).toLocaleDateString()}<br/>
                        <span className="text-sm text-gray-500">{new Date(order.date).toLocaleTimeString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-white">{order.items}</td>
                      <td className="px-6 py-4 text-right font-bold text-teal-300">${order.total.toFixed(2)}</td>
                      <td className="px-6 py-4 text-gray-300">{order.paymentMethod}</td>
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
