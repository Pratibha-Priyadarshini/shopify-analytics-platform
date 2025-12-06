"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insightsApi } from "@/lib/api";

interface TopCustomersProps {
  tenantId: string;
  dateRange?: number;
}

export function TopCustomers({ tenantId, dateRange = 30 }: TopCustomersProps) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [tenantId, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await insightsApi.getTopCustomers(tenantId, 5);
      setCustomers(data);
    } catch (error) {
      console.error("Failed to load top customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalSpend = customers.reduce((sum, c) => sum + c.totalSpend, 0);

  return (
    <Card className="glass-effect border border-teal-500/30 shadow-2xl shadow-teal-500/20 hover:border-teal-400/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-silver-gradient">
            <div className="p-2 bg-gradient-to-br from-gray-400 to-teal-400 rounded-lg shadow-lg shadow-gray-400/30">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            Top Customers
          </CardTitle>
          {!loading && customers.length > 0 && (
            <div className="text-sm text-gray-400">
              <span className="font-semibold text-teal-300">${totalSpend.toFixed(2)}</span> total
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
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-teal-500/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <div className="text-gray-400 mb-2">No customers yet</div>
            <div className="text-sm text-gray-500">Your top customers will appear here</div>
          </div>
        ) : (
          <>
            <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">Top 5 represent</div>
              <div className="text-lg font-bold text-teal-300">
                {customers.length > 0 ? ((totalSpend / totalSpend) * 100).toFixed(0) : 0}% of shown revenue
              </div>
            </div>
            <ul className="space-y-2">
            {customers.map((customer, index) => (
              <li
                key={customer.id}
                className="flex justify-between items-center p-4 rounded-xl hover:bg-teal-500/10 transition-all duration-200 group border border-transparent hover:border-teal-500/30"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-black shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-red-500' :
                    'bg-gradient-to-br from-teal-400 to-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-200 group-hover:text-teal-300 transition-colors">
                      {customer.firstName} {customer.lastName}
                    </div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      {customer.ordersCount} orders
                    </div>
                  </div>
                </div>
                <div className="font-bold text-xl text-silver-gradient">
                  ${customer.totalSpend.toFixed(2)}
                </div>
              </li>
            ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
