"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insightsApi } from "@/lib/api";

interface ProductPerformanceProps {
  tenantId: string;
  dateRange?: number;
}

export function ProductPerformance({ tenantId, dateRange = 30 }: ProductPerformanceProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tenantId, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await insightsApi.getProductPerformance(tenantId);
      setProducts(data);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalInventory = products.reduce((sum, p) => sum + p.inventory, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.inventory * p.price), 0);

  return (
    <Card className="glass-effect border border-teal-500/30 shadow-2xl shadow-teal-500/20 hover:border-teal-400/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-silver-gradient">
            <div className="p-2 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-lg shadow-lg shadow-cyan-500/30">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            Top Products
          </CardTitle>
          {!loading && products.length > 0 && (
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-cyan-300">{totalInventory}</span> units
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex justify-between p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                <div className="h-4 bg-teal-500/30 rounded w-32"></div>
                <div className="h-4 bg-teal-500/30 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-teal-500/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <div className="text-gray-400 mb-2">No products yet</div>
            <div className="text-sm text-gray-500">Your product inventory will appear here</div>
          </div>
        ) : (
          <>
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">Total Inventory Value</div>
              <div className="text-lg font-bold text-cyan-300">${totalValue.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex justify-between items-center p-4 rounded-xl hover:bg-teal-500/10 transition-all duration-200 group border border-transparent hover:border-teal-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-400 rounded-xl flex items-center justify-center text-black font-bold shadow-lg">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-200 group-hover:text-teal-300 transition-colors">
                      {product.title}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      ${product.price.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-silver-gradient">{product.inventory} <span className="text-sm font-normal text-gray-400">units</span></div>
                  <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    product.status === 'active' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {product.status}
                  </div>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
