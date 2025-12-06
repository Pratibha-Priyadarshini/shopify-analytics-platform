"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insightsApi } from "@/lib/api";

type ChartType = 'bar' | 'line' | 'area';

interface CustomerGrowthProps {
  tenantId: string;
  dateRange?: number;
}

export function CustomerGrowth({ tenantId, dateRange = 30 }: CustomerGrowthProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalNew, setTotalNew] = useState(0);
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [interpretation, setInterpretation] = useState("");

  useEffect(() => {
    loadData();
  }, [tenantId, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const growth = await insightsApi.getCustomerGrowth(tenantId, dateRange);
      const chartData = growth.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        customers: item.newCustomers,
      }));
      setData(chartData);
      const total = chartData.reduce((sum: number, item: any) => sum + item.customers, 0);
      setTotalNew(total);
      
      // Generate interpretation
      generateInterpretation(chartData, total);
    } catch (error) {
      console.error("Failed to load customer growth:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInterpretation = (chartData: any[], total: number) => {
    const customers = chartData.map((d: any) => d.customers);
    const avg = total / chartData.length;
    const max = Math.max(...customers);
    const min = Math.min(...customers);
    
    // Calculate trend
    const firstHalf = customers.slice(0, Math.floor(customers.length / 2));
    const secondHalf = customers.slice(Math.floor(customers.length / 2));
    const firstAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length || 0;
    const secondAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length || 0;
    const trend = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
    
    let interpretation = "";
    
    if (avg >= 10) {
      interpretation = `🔥 Strong acquisition! Averaging ${avg.toFixed(1)} new customers daily. Your marketing efforts are paying off with ${total} new customers in this period.`;
    } else if (avg >= 5) {
      interpretation = `📊 Solid growth with ${avg.toFixed(1)} customers per day. Consistent acquisition rate indicates healthy market presence.`;
    } else if (avg >= 2) {
      interpretation = `🌱 Steady acquisition of ${avg.toFixed(1)} customers daily. Consider scaling marketing to accelerate growth.`;
    } else {
      interpretation = `💡 ${total} new customers acquired. Focus on customer acquisition strategies to boost growth rate.`;
    }
    
    if (trend > 20) {
      interpretation += ` Acceleration detected - growth rate increased ${trend.toFixed(0)}% period-over-period!`;
    } else if (trend < -20) {
      interpretation += ` Slowdown observed - acquisition rate decreased ${Math.abs(trend).toFixed(0)}%.`;
    }
    
    if (max > avg * 2) {
      interpretation += ` Peak day brought ${max} customers - identify what drove this success.`;
    }
    
    setInterpretation(interpretation);
  };

  return (
    <Card className="glass-effect border border-teal-500/30 shadow-2xl shadow-teal-500/20 hover:border-teal-400/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-silver-gradient">
            <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg shadow-lg shadow-emerald-500/30">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            Customer Growth
          </CardTitle>
          <div className="flex items-center gap-2">
            {!loading && data.length > 0 && (
              <>
                <div className="flex gap-1 bg-black/50 p-1 rounded-lg border border-emerald-500/30">
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-1.5 rounded transition-all ${chartType === 'bar' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-emerald-300'}`}
                    title="Bar Chart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-1.5 rounded transition-all ${chartType === 'line' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-emerald-300'}`}
                    title="Line Chart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`p-1.5 rounded transition-all ${chartType === 'area' ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:text-emerald-300'}`}
                    title="Area Chart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M3 21h18M3 10l4-4 4 4 5-5 5 5v11H3V10z" />
                    </svg>
                  </button>
                </div>
                <div className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-sm font-semibold">
                  +{totalNew} new
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-emerald-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-gray-400">Loading data...</span>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 text-teal-500/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div className="text-gray-400 mb-2">No customer data available</div>
              <div className="text-sm text-gray-500">New customer signups will appear here</div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 mb-4">
              <div className="text-xs text-gray-400 mb-1">Average per day</div>
              <div className="text-lg font-bold text-emerald-300">{(totalNew / data.length).toFixed(1)} customers</div>
            </div>
            
            {interpretation && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-emerald-300 mb-1">AI Insights</div>
                    <div className="text-sm text-gray-300 leading-relaxed">{interpretation}</div>
                  </div>
                </div>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'bar' ? (
                <BarChart data={data}>
                  <defs>
                    <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#14b8a6" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid #10b981',
                      borderRadius: '12px',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="customers" fill="url(#colorCustomers)" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={data}>
                  <defs>
                    <linearGradient id="colorCustomersLine" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#14b8a6" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid #10b981',
                      borderRadius: '12px',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                      color: '#ffffff'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="url(#colorCustomersLine)" 
                    strokeWidth={3}
                    dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, fill: "#14b8a6", stroke: "#10b981", strokeWidth: 2 }}
                  />
                </LineChart>
              ) : (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorCustomersArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#14b8a6" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid #10b981',
                      borderRadius: '12px',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.5)',
                      color: '#ffffff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="customers" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fill="url(#colorCustomersArea)" 
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </>
        )}
      </CardContent>
    </Card>
  );
}
