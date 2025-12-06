"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insightsApi } from "@/lib/api";

type ChartType = 'line' | 'bar' | 'area';

interface RevenueChartProps {
  tenantId: string;
  dateRange?: number;
}

export function RevenueChart({ tenantId, dateRange = 30 }: RevenueChartProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, avg: 0, peak: 0, growth: 0 });
  const [chartType, setChartType] = useState<ChartType>('line');
  const [interpretation, setInterpretation] = useState("");

  useEffect(() => {
    loadData();
  }, [tenantId, dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const trend = await insightsApi.getRevenueTrend(tenantId, dateRange);
      const chartData = trend.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: item.revenue,
        orders: item.orders,
      }));
      setData(chartData);
      
      // Calculate stats
      const revenues = chartData.map((d: any) => d.revenue);
      const total = revenues.reduce((sum: number, val: number) => sum + val, 0);
      const avg = total / revenues.length || 0;
      const peak = Math.max(...revenues, 0);
      const firstHalf = revenues.slice(0, Math.floor(revenues.length / 2));
      const secondHalf = revenues.slice(Math.floor(revenues.length / 2));
      const firstAvg = firstHalf.reduce((sum: number, val: number) => sum + val, 0) / firstHalf.length || 0;
      const secondAvg = secondHalf.reduce((sum: number, val: number) => sum + val, 0) / secondHalf.length || 0;
      const growth = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;
      
      setStats({ total, avg, peak, growth });
      
      // Generate AI-like interpretation
      generateInterpretation(chartData, { total, avg, peak, growth });
    } catch (error) {
      console.error("Failed to load revenue trend:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateInterpretation = (chartData: any[], stats: any) => {
    const { growth, avg, peak, total } = stats;
    const revenues = chartData.map((d: any) => d.revenue);
    const volatility = calculateVolatility(revenues);
    
    let interpretation = "";
    
    if (growth > 20) {
      interpretation = `🚀 Exceptional growth! Revenue increased by ${Math.abs(growth).toFixed(1)}% period-over-period. Your business is experiencing strong momentum with an average daily revenue of $${avg.toFixed(2)}.`;
    } else if (growth > 10) {
      interpretation = `📈 Healthy growth trajectory with ${Math.abs(growth).toFixed(1)}% increase. Revenue is trending upward consistently, indicating positive market response.`;
    } else if (growth > 0) {
      interpretation = `✅ Steady performance with ${Math.abs(growth).toFixed(1)}% growth. Revenue remains stable with room for optimization to accelerate growth.`;
    } else if (growth > -10) {
      interpretation = `⚠️ Slight decline of ${Math.abs(growth).toFixed(1)}%. Consider reviewing recent changes or market conditions. Daily average is $${avg.toFixed(2)}.`;
    } else {
      interpretation = `🔍 Revenue decreased by ${Math.abs(growth).toFixed(1)}%. Immediate attention needed to identify and address underlying issues.`;
    }
    
    if (volatility > 0.5) {
      interpretation += ` High volatility detected - revenue fluctuates significantly day-to-day.`;
    } else if (volatility < 0.2) {
      interpretation += ` Revenue shows consistent patterns with low volatility.`;
    }
    
    setInterpretation(interpretation);
  };

  const calculateVolatility = (values: number[]) => {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance) / mean;
  };

  return (
    <Card className="glass-effect border border-teal-500/30 shadow-2xl shadow-teal-500/20 hover:border-teal-400/50 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="flex items-center gap-2 text-silver-gradient">
            <div className="p-2 bg-gradient-to-br from-teal-400 to-gray-400 rounded-lg shadow-lg shadow-teal-500/30">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            Revenue Trend
          </CardTitle>
          <div className="flex items-center gap-2">
            {!loading && data.length > 0 && (
              <>
                <div className="flex gap-1 bg-black/50 p-1 rounded-lg border border-teal-500/30">
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-1.5 rounded transition-all ${chartType === 'line' ? 'bg-teal-500 text-black' : 'text-gray-400 hover:text-teal-300'}`}
                    title="Line Chart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-1.5 rounded transition-all ${chartType === 'bar' ? 'bg-teal-500 text-black' : 'text-gray-400 hover:text-teal-300'}`}
                    title="Bar Chart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`p-1.5 rounded transition-all ${chartType === 'area' ? 'bg-teal-500 text-black' : 'text-gray-400 hover:text-teal-300'}`}
                    title="Area Chart"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M3 21h18M3 10l4-4 4 4 5-5 5 5v11H3V10z" />
                    </svg>
                  </button>
                </div>
                <div className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-semibold ${
                  stats.growth >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}>
                  <svg className={`w-4 h-4 ${stats.growth >= 0 ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  {Math.abs(stats.growth).toFixed(1)}%
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
              <svg className="animate-spin h-8 w-8 text-teal-400" viewBox="0 0 24 24">
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <div className="text-gray-400 mb-2">No revenue data available</div>
              <div className="text-sm text-gray-500">Start making sales to see trends</div>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Total Revenue</div>
                <div className="text-lg font-bold text-teal-300">${stats.total.toFixed(2)}</div>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Daily Average</div>
                <div className="text-lg font-bold text-teal-300">${stats.avg.toFixed(2)}</div>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Peak Day</div>
                <div className="text-lg font-bold text-teal-300">${stats.peak.toFixed(2)}</div>
              </div>
            </div>
            
            {interpretation && (
              <div className="bg-gradient-to-r from-teal-500/10 to-gray-500/10 border border-teal-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-teal-500/20 rounded-lg flex-shrink-0">
                    <svg className="w-5 h-5 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-teal-300 mb-1">AI Insights</div>
                    <div className="text-sm text-gray-300 leading-relaxed">{interpretation}</div>
                  </div>
                </div>
              </div>
            )}
            
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' ? (
                <LineChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.9}/>
                  <stop offset="95%" stopColor="#c0c0c0" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#14b8a6" opacity={0.2} />
              <XAxis dataKey="date" stroke="#c0c0c0" style={{ fontSize: '12px' }} />
              <YAxis stroke="#c0c0c0" style={{ fontSize: '12px' }} />
              <Tooltip 
                formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]}
                contentStyle={{ 
                  backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                  border: '1px solid #14b8a6',
                  borderRadius: '12px',
                  boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
                  color: '#ffffff'
                }}
              />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="url(#colorRevenue)" 
                    strokeWidth={3}
                    dot={{ fill: "#14b8a6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 8, fill: "#c0c0c0", stroke: "#14b8a6", strokeWidth: 2 }}
                  />
                </LineChart>
              ) : chartType === 'bar' ? (
                <BarChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenueBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#c0c0c0" stopOpacity={0.7}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#14b8a6" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid #14b8a6',
                      borderRadius: '12px',
                      boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
                      color: '#ffffff'
                    }}
                  />
                  <Bar dataKey="revenue" fill="url(#colorRevenueBar)" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenueArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#14b8a6" opacity={0.2} />
                  <XAxis dataKey="date" stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#c0c0c0" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toFixed(2)}`, "Revenue"]}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '1px solid #14b8a6',
                      borderRadius: '12px',
                      boxShadow: '0 0 20px rgba(20, 184, 166, 0.5)',
                      color: '#ffffff'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#14b8a6" 
                    strokeWidth={2}
                    fill="url(#colorRevenueArea)" 
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
