"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { isAuthenticated } from "@/lib/auth";
import { tenantApi } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  revenue: number;
  status: "in-stock" | "low-stock" | "out-of-stock";
  trend: "up" | "down" | "stable";
  image?: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
      loadProducts();
    }
  }, [selectedTenant]);

  const loadProducts = async () => {
    if (!selectedTenant) return;
    try {
      const { productsApi } = await import("@/lib/api");
      const data = await productsApi.getAll(selectedTenant, {
        category: filterCategory !== "all" ? filterCategory : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined
      });
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]);
    }
  };

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => 
    (filterCategory === "all" || p.category === filterCategory) &&
    (filterStatus === "all" || p.status === filterStatus) &&
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: products.length,
    inStock: products.filter(p => p.status === "in-stock").length,
    lowStock: products.filter(p => p.status === "low-stock").length,
    outOfStock: products.filter(p => p.status === "out-of-stock").length,
    totalRevenue: products.reduce((sum, p) => sum + p.revenue, 0),
    totalSold: products.reduce((sum, p) => sum + p.sold, 0)
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "in-stock": return "bg-green-500/20 text-green-300 border-green-500/50";
      case "low-stock": return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "out-of-stock": return "bg-red-500/20 text-red-300 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-300 border-gray-500/50";
    }
  };

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return "↗";
    if (trend === "down") return "↘";
    return "→";
  };

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-400";
    if (trend === "down") return "text-red-400";
    return "text-gray-400";
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
              <h1 className="text-4xl font-bold text-silver-gradient mb-2">Products</h1>
              <p className="text-gray-400">Manage your product inventory and performance</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-teal-500/20 text-teal-300" : "text-gray-400 hover:text-teal-300"}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-teal-500/20 text-teal-300" : "text-gray-400 hover:text-teal-300"}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="glass-effect rounded-2xl p-4 border border-teal-500/30">
              <div className="text-sm text-gray-400 mb-1">Total Products</div>
              <div className="text-2xl font-bold text-teal-300">{stats.total}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-green-500/30">
              <div className="text-sm text-gray-400 mb-1">In Stock</div>
              <div className="text-2xl font-bold text-green-300">{stats.inStock}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-yellow-500/30">
              <div className="text-sm text-gray-400 mb-1">Low Stock</div>
              <div className="text-2xl font-bold text-yellow-300">{stats.lowStock}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-red-500/30">
              <div className="text-sm text-gray-400 mb-1">Out of Stock</div>
              <div className="text-2xl font-bold text-red-300">{stats.outOfStock}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-purple-500/30">
              <div className="text-sm text-gray-400 mb-1">Total Sold</div>
              <div className="text-2xl font-bold text-purple-300">{stats.totalSold}</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 border border-teal-500/30">
              <div className="text-sm text-gray-400 mb-1">Revenue</div>
              <div className="text-2xl font-bold text-teal-300">${(stats.totalRevenue / 1000).toFixed(0)}k</div>
            </div>
          </div>

          {/* Filters */}
          <div className="glass-effect rounded-2xl p-6 border border-teal-500/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Search</label>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 focus:border-teal-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white focus:border-teal-400 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat === "all" ? "All Categories" : cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Stock Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white focus:border-teal-400 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Display */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="glass-effect rounded-2xl border border-teal-500/30 overflow-hidden hover:border-teal-400/50 transition-all hover:shadow-lg hover:shadow-teal-500/20">
                  <div className="h-48 bg-gradient-to-br from-teal-500/20 to-gray-500/20 flex items-center justify-center">
                    <svg className="w-20 h-20 text-teal-300/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-white text-lg">{product.name}</h3>
                      <span className={`text-2xl ${getTrendColor(product.trend)}`}>
                        {getTrendIcon(product.trend)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">SKU: {product.sku}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">{product.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                        {product.status.replace("-", " ").toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Price:</span>
                        <span className="font-bold text-teal-300">${product.price}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Stock:</span>
                        <span className="text-white">{product.stock} units</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Sold:</span>
                        <span className="text-white">{product.sold} units</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Revenue:</span>
                        <span className="font-bold text-purple-300">${product.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-effect rounded-2xl border border-teal-500/30 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-teal-500/10 border-b border-teal-500/30">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Product</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Category</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Price</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Stock</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Sold</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-teal-300">Revenue</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-teal-300">Status</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-teal-300">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-teal-500/10">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-teal-500/5 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">{product.name}</div>
                            <div className="text-sm text-gray-400">{product.sku}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{product.category}</td>
                        <td className="px-6 py-4 text-right font-medium text-teal-300">${product.price}</td>
                        <td className="px-6 py-4 text-right text-white">{product.stock}</td>
                        <td className="px-6 py-4 text-right text-white">{product.sold}</td>
                        <td className="px-6 py-4 text-right font-bold text-purple-300">${product.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.status)}`}>
                            {product.status.replace("-", " ").toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`text-2xl ${getTrendColor(product.trend)}`}>
                            {getTrendIcon(product.trend)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
