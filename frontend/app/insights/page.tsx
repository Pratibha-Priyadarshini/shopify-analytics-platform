"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { isAuthenticated } from "@/lib/auth";
import { tenantApi } from "@/lib/api";

export default function InsightsPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("30");
  const [insights, setInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<number>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);
  const [applyingRecommendation, setApplyingRecommendation] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingRecommendation, setPendingRecommendation] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/");
      return;
    }
    loadTenants();
  }, [router]);

  useEffect(() => {
    if (selectedTenant) {
      loadInsights();
      loadTasks();
    }
  }, [selectedTenant, timeframe]);

  const loadTasks = async () => {
    if (!selectedTenant) return;
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/recommendations/${selectedTenant}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
    }
  };

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

  const loadInsights = async () => {
    if (!selectedTenant) return;
    setLoadingInsights(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/ai-insights/${selectedTenant}?days=${timeframe}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      if (!response.ok) throw new Error("Failed to load insights");
      
      const data = await response.json();
      
      // Check if Gemini is not configured
      if (data.error === "GEMINI_NOT_CONFIGURED") {
        setInsights({ notConfigured: true });
      } else {
        setInsights(data);
      }
    } catch (error) {
      console.error("Failed to load AI insights:", error);
      setInsights(null);
    } finally {
      setLoadingInsights(false);
    }
  };

  const getImpactColor = (impact: string) => {
    switch(impact) {
      case "critical": return "border-red-500/50 bg-red-500/10";
      case "high": return "border-orange-500/50 bg-orange-500/10";
      case "medium": return "border-yellow-500/50 bg-yellow-500/10";
      default: return "border-teal-500/30 bg-teal-500/5";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch(priority) {
      case "critical": return "text-red-300 bg-red-500/20 border-red-500/50";
      case "high": return "text-orange-300 bg-orange-500/20 border-orange-500/50";
      case "medium": return "text-yellow-300 bg-yellow-500/20 border-yellow-500/50";
      default: return "text-teal-300 bg-teal-500/20 border-teal-500/50";
    }
  };

  const getRecommendationActions = (title: string) => {
    if (title.toLowerCase().includes('flash') || title.toLowerCase().includes('sale')) {
      return [
        'Create discount code in Shopify',
        'Set up price rules (15-20% off)',
        'Schedule automatic expiration (7 days)',
        'Track usage and performance'
      ];
    } else if (title.toLowerCase().includes('restock')) {
      return [
        'Identify low-stock products',
        'Generate restock recommendations',
        'Send alert notifications',
        'Create task for inventory team'
      ];
    } else if (title.toLowerCase().includes('email') || title.toLowerCase().includes('campaign')) {
      return [
        'Segment inactive VIP customers',
        'Create email campaign draft',
        'Set up personalized offers',
        'Schedule for review before sending'
      ];
    } else if (title.toLowerCase().includes('bundle')) {
      return [
        'Analyze product combinations',
        'Create bundle suggestions',
        'Calculate bundle pricing',
        'Prepare for Shopify product creation'
      ];
    }
    return ['Apply recommendation', 'Track results', 'Monitor performance'];
  };

  const getRecommendationType = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('flash') || lower.includes('sale') || lower.includes('discount') || lower.includes('promotion')) return 'flash_sale';
    if (lower.includes('restock') || lower.includes('inventory') || lower.includes('stock')) return 'restock_alert';
    if (lower.includes('email') || lower.includes('campaign') || lower.includes('customer') || lower.includes('inactive')) return 'email_campaign';
    if (lower.includes('bundle') || lower.includes('package') || lower.includes('combo')) return 'product_bundle';
    return 'general';
  };

  const handleApplyRecommendation = async () => {
    if (!pendingRecommendation || !selectedTenant) return;
    
    setApplyingRecommendation(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"}/recommendations/${selectedTenant}/apply`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            recommendationType: getRecommendationType(pendingRecommendation.title),
            recommendationData: {
              title: pendingRecommendation.title,
              description: pendingRecommendation.description,
              priority: pendingRecommendation.priority,
              estimatedImpact: pendingRecommendation.estimatedImpact,
              discountPercentage: 15,
            },
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to apply recommendation');

      const result = await response.json();
      
      setAppliedRecommendations(prev => new Set(prev).add(pendingRecommendation.index));
      setSelectedRecommendation({ ...pendingRecommendation, result });
      setShowConfirmModal(false);
      setShowModal(true);
      loadTasks(); // Reload tasks after applying
    } catch (error) {
      console.error('Error applying recommendation:', error);
      alert('Failed to apply recommendation. Please try again.');
    } finally {
      setApplyingRecommendation(false);
      setPendingRecommendation(null);
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
      <main className="flex-1 min-w-0">
        <Navbar />
        <div className="p-4 md:p-8 space-y-6 max-w-full">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-silver-gradient mb-2">AI Insights</h1>
              <p className="text-gray-400">Intelligent predictions and recommendations powered by Gemini AI</p>
            </div>
            <div className="flex items-center gap-3">
              {loadingInsights && (
                <div className="flex items-center gap-2 text-teal-300">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="bg-black/50 border border-teal-500/30 rounded-xl px-4 py-2 text-white focus:border-teal-400 focus:outline-none"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>
          </div>

          {!insights && !loadingInsights ? (
            <div className="glass-effect rounded-2xl p-12 text-center border border-teal-500/30">
              <svg className="w-16 h-16 text-teal-500/30 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">No Insights Available</h3>
              <p className="text-gray-400">Connect your Shopify store and sync data to generate AI insights</p>
            </div>
          ) : insights?.notConfigured ? (
            <div className="glass-effect rounded-2xl p-12 text-center border border-yellow-500/30">
              <svg className="w-20 h-20 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-2xl font-bold text-yellow-300 mb-3">🤖 AI Insights Not Configured</h3>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                To enable AI-powered insights, you need to configure a valid Gemini API key.
              </p>
              <div className="bg-black/50 rounded-xl p-6 max-w-3xl mx-auto text-left border border-yellow-500/30">
                <h4 className="text-lg font-bold text-yellow-300 mb-3">Setup Instructions:</h4>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 font-bold">1.</span>
                    <span>Visit <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:text-teal-300 underline">Google AI Studio</a> and create a new API key</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 font-bold">2.</span>
                    <span>Open <code className="bg-black/50 px-2 py-1 rounded text-teal-300">backend/.env</code> file</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 font-bold">3.</span>
                    <span>Update: <code className="bg-black/50 px-2 py-1 rounded text-teal-300">GEMINI_API_KEY="your-api-key"</code></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 font-bold">4.</span>
                    <span>Restart the backend server</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 font-bold">5.</span>
                    <span>Refresh this page to see AI-powered insights!</span>
                  </li>
                </ol>
              </div>
              <div className="mt-6 text-sm text-gray-400">
                <p>📖 For detailed instructions, see <code className="text-teal-300">GEMINI_SETUP.md</code></p>
              </div>
            </div>
          ) : insights && (
            <>
              {/* AI Predictions */}
              <div>
                <h2 className="text-2xl font-bold text-teal-300 mb-4 flex items-center gap-2">
                  <span>🤖</span> AI Predictions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {insights.predictions?.map((prediction: any, idx: number) => (
                <div key={idx} className={`glass-effect rounded-2xl p-6 border ${getImpactColor(prediction.impact)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{prediction.icon}</span>
                      <h3 className="font-bold text-white text-lg">{prediction.title}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Confidence</div>
                      <div className="text-lg font-bold text-teal-300">{prediction.confidence}%</div>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-3">{prediction.description}</p>
                  <div className="w-full bg-black/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-teal-400 to-purple-400 h-2 rounded-full transition-all"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

              {/* Key Trends */}
              <div>
                <h2 className="text-2xl font-bold text-teal-300 mb-4 flex items-center gap-2">
                  <span>📊</span> Key Trends
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {insights.trends?.map((trend: any, idx: number) => (
                    <div key={idx} className="glass-effect rounded-2xl p-5 border border-teal-500/30 flex flex-col">
                      <div className="text-xs text-gray-400 mb-2 font-medium">{trend.metric}</div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-2xl font-bold text-white">{trend.current}</div>
                        <div className={`text-sm font-bold px-2 py-0.5 rounded ${trend.trend === "up" ? "text-green-400 bg-green-500/10" : "text-red-400 bg-red-500/10"}`}>
                          {trend.change}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{trend.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <h2 className="text-2xl font-bold text-teal-300 mb-4 flex items-center gap-2">
                  <span>💡</span> Smart Recommendations
                </h2>
                <div className="space-y-4">
                  {insights.recommendations?.map((rec: any, idx: number) => (
                <div key={idx} className="glass-effect rounded-2xl p-6 border border-teal-500/30 hover:border-teal-400/50 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-white text-lg">{rec.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec.priority)}`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{rec.description}</p>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-green-300 font-medium">{rec.estimatedImpact}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setPendingRecommendation({ ...rec, index: idx });
                        setShowConfirmModal(true);
                      }}
                      disabled={appliedRecommendations.has(idx) || applyingRecommendation}
                      className={`ml-4 px-6 py-2 font-bold rounded-xl transition-all ${
                        appliedRecommendations.has(idx)
                          ? 'bg-green-500/20 text-green-300 border border-green-500/50 cursor-not-allowed'
                          : applyingRecommendation
                          ? 'bg-gray-500/20 text-gray-400 border border-gray-500/50 cursor-wait'
                          : 'bg-gradient-to-r from-teal-400 to-purple-400 text-black hover:shadow-lg hover:shadow-teal-500/50 hover:scale-105'
                      }`}
                    >
                      {appliedRecommendations.has(idx) ? (
                        <span className="flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Applied
                        </span>
                      ) : applyingRecommendation ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Applying...
                        </span>
                      ) : (
                        'Apply'
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

              {/* Performance Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performers */}
                <div className="glass-effect rounded-2xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center gap-2">
                    <span>🏆</span> Top Performers
                  </h3>
                  <div className="space-y-4">
                    {insights.performance?.topPerformers?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-green-500/10 rounded-xl border border-green-500/30">
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-sm text-gray-400">{item.label}</div>
                    </div>
                    <div className="text-2xl font-bold text-green-300">{item.metric}</div>
                  </div>
                ))}
              </div>
            </div>

                {/* Needs Attention */}
                <div className="glass-effect rounded-2xl p-6 border border-orange-500/30">
                  <h3 className="text-xl font-bold text-orange-300 mb-4 flex items-center gap-2">
                    <span>⚡</span> Needs Attention
                  </h3>
                  <div className="space-y-4">
                    {insights.performance?.underperformers?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-orange-500/10 rounded-xl border border-orange-500/30">
                    <div>
                      <div className="font-medium text-white">{item.name}</div>
                      <div className="text-sm text-gray-400">{item.label}</div>
                    </div>
                    <div className="text-2xl font-bold text-orange-300">{item.metric}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

              {/* Applied Recommendations / Tasks */}
              {tasks.length > 0 && (
                <div className="w-full">
                  <h2 className="text-2xl font-bold text-teal-300 mb-4 flex items-center gap-2">
                    <span>📋</span> 
                    <span>Applied Recommendations</span>
                  </h2>
                  <div className="space-y-3 w-full">
                    {tasks.map((task: any, idx: number) => {
                      const metadata = task.metadata;
                      const taskType = metadata?.type || 'general';
                      const result = metadata?.result;
                      
                      return (
                        <div key={task.id} className="glass-effect rounded-2xl p-5 border border-teal-500/30 hover:border-teal-400/50 transition-all w-full">
                          <div className="flex flex-col xl:flex-row xl:items-start gap-4 w-full">
                            <div className="flex-1 min-w-0 w-full">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-white text-sm md:text-base break-words">{metadata?.data?.title || 'Recommendation Applied'}</h3>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(task.createdAt).toLocaleDateString()} at {new Date(task.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-300 mb-3 leading-relaxed">{metadata?.data?.description}</p>
                              
                              {result && (
                                <div className="bg-black/30 rounded-lg p-3 space-y-2">
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-400">Type:</span>
                                    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded capitalize">
                                      {taskType.replace('_', ' ')}
                                    </span>
                                  </div>
                                  
                                  {result.type === 'flash_sale' && result.discountCode && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-400">Discount Code:</span>
                                      <code className="px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded font-mono">
                                        {result.discountCode}
                                      </code>
                                      <span className="text-green-400">{result.discount}</span>
                                    </div>
                                  )}
                                  
                                  {result.type === 'restock_alert' && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-400">Products Needing Restock:</span>
                                      <span className="text-yellow-300">{result.productsNeedingRestock}</span>
                                    </div>
                                  )}
                                  
                                  {result.type === 'email_campaign' && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-400">Target Customers:</span>
                                      <span className="text-teal-300">{result.targetCustomers}</span>
                                    </div>
                                  )}
                                  
                                  {result.status && (
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-gray-400">Status:</span>
                                      <span className="text-green-300 capitalize">{result.status.replace('_', ' ')}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex lg:flex-col items-start lg:items-end gap-2 flex-shrink-0 flex-wrap">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                                metadata?.data?.priority === 'critical' ? 'text-red-300 bg-red-500/20 border-red-500/50' :
                                metadata?.data?.priority === 'high' ? 'text-orange-300 bg-orange-500/20 border-orange-500/50' :
                                'text-yellow-300 bg-yellow-500/20 border-yellow-500/50'
                              }`}>
                                {metadata?.data?.priority?.toUpperCase() || 'MEDIUM'}
                              </span>
                              {metadata?.data?.estimatedImpact && (
                                <span className="text-xs text-green-400 flex items-center gap-1 whitespace-nowrap">
                                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  <span className="break-words">{metadata.data.estimatedImpact}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Market Intelligence */}
              {insights.market && (
                <div className="glass-effect rounded-2xl p-6 border border-purple-500/30">
                  <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-2">
                    <span>🌐</span> Market Intelligence
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <div className="text-sm text-gray-400 mb-2">Industry Growth</div>
                      <div className="text-2xl font-bold text-purple-300 mb-1">{insights.market.industryGrowth}</div>
                      <p className="text-sm text-gray-300">Your category is trending</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <div className="text-sm text-gray-400 mb-2">Competitive Position</div>
                      <div className="text-2xl font-bold text-purple-300 mb-1">{insights.market.competitivePosition}</div>
                      <p className="text-sm text-gray-300">Market standing</p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <div className="text-sm text-gray-400 mb-2">Market Opportunity</div>
                      <div className="text-2xl font-bold text-purple-300 mb-1">{insights.market.marketOpportunity}</div>
                      <p className="text-sm text-gray-300">Untapped potential</p>
                    </div>
                  </div>
                  {insights.market.insights && (
                    <div className="mt-4 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
                      <p className="text-sm text-gray-300">{insights.market.insights}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Confirmation Modal */}
          {showConfirmModal && pendingRecommendation && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="glass-effect rounded-3xl border border-yellow-500/30 max-w-2xl w-full p-6 md:p-8 shadow-2xl shadow-yellow-500/20 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg md:text-2xl font-bold text-yellow-300 mb-2">Confirm Action</h3>
                    <p className="text-white font-semibold mb-2 text-sm md:text-base">{pendingRecommendation.title}</p>
                    <p className="text-gray-300 text-xs md:text-sm">{pendingRecommendation.description}</p>
                  </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 md:p-4 mb-4 md:mb-6">
                  <h4 className="text-yellow-300 font-semibold mb-2">⚡ This will perform real actions:</h4>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    {getRecommendationActions(pendingRecommendation.title).map((action, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-yellow-400">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 md:gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setPendingRecommendation(null);
                    }}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gray-500/20 text-gray-300 font-bold rounded-xl border border-gray-500/50 hover:bg-gray-500/30 transition-all text-sm md:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyRecommendation}
                    disabled={applyingRecommendation}
                    className="flex-1 px-4 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-black font-bold rounded-xl hover:shadow-lg hover:shadow-yellow-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                  >
                    {applyingRecommendation ? 'Applying...' : 'Confirm & Apply'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Modal for Recommendations */}
          {showModal && selectedRecommendation && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="glass-effect rounded-3xl border border-teal-500/30 max-w-2xl w-full p-6 md:p-8 shadow-2xl shadow-teal-500/20 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between mb-4 md:mb-6">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-400 to-teal-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 md:w-6 md:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg md:text-2xl font-bold text-teal-300">Recommendation Applied!</h3>
                      <p className="text-gray-400 text-xs md:text-sm truncate">"{selectedRecommendation.title}"</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  <div className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-4">
                    <p className="text-gray-300 mb-3">{selectedRecommendation.description}</p>
                    <div className="flex items-center gap-2 text-green-300 font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      <span>Estimated Impact: {selectedRecommendation.estimatedImpact}</span>
                    </div>
                  </div>

                  {selectedRecommendation.result && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                      <h4 className="text-green-300 font-semibold mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Actions Completed
                      </h4>
                      <div className="space-y-2 text-sm">
                        {selectedRecommendation.result.result?.type === 'flash_sale' && (
                          <>
                            <div className="flex justify-between text-gray-300">
                              <span>Discount Code:</span>
                              <span className="font-mono text-teal-300">{selectedRecommendation.result.result.discountCode}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Discount:</span>
                              <span className="text-green-300">{selectedRecommendation.result.result.discount}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Status:</span>
                              <span className="text-green-300 capitalize">{selectedRecommendation.result.result.status}</span>
                            </div>
                          </>
                        )}
                        {selectedRecommendation.result.result?.type === 'restock_alert' && (
                          <>
                            <div className="flex justify-between text-gray-300">
                              <span>Products Needing Restock:</span>
                              <span className="text-yellow-300">{selectedRecommendation.result.result.productsNeedingRestock}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Alert Sent:</span>
                              <span className="text-green-300">✓ Yes</span>
                            </div>
                          </>
                        )}
                        {selectedRecommendation.result.result?.type === 'email_campaign' && (
                          <>
                            <div className="flex justify-between text-gray-300">
                              <span>Target Customers:</span>
                              <span className="text-teal-300">{selectedRecommendation.result.result.targetCustomers}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Campaign Status:</span>
                              <span className="text-yellow-300 capitalize">{selectedRecommendation.result.result.status}</span>
                            </div>
                          </>
                        )}
                        {selectedRecommendation.result.result?.type === 'product_bundle' && (
                          <>
                            <div className="flex justify-between text-gray-300">
                              <span>Bundles Created:</span>
                              <span className="text-teal-300">{selectedRecommendation.result.result.suggestedBundles?.length || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Status:</span>
                              <span className="text-yellow-300 capitalize">{selectedRecommendation.result.result.status}</span>
                            </div>
                          </>
                        )}
                        {selectedRecommendation.result.result?.type === 'general' && (
                          <>
                            <div className="flex justify-between text-gray-300">
                              <span>Task Created:</span>
                              <span className="text-green-300">✓ Yes</span>
                            </div>
                            <div className="flex justify-between text-gray-300">
                              <span>Status:</span>
                              <span className="text-teal-300 capitalize">{selectedRecommendation.result.result.status?.replace('_', ' ')}</span>
                            </div>
                            <p className="text-gray-400 text-xs mt-2">{selectedRecommendation.result.result.message}</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-black/50 rounded-xl p-4 border border-gray-500/30">
                    <h4 className="text-white font-semibold mb-3">📋 Task Created</h4>
                    <p className="text-gray-400 text-sm mb-3">A task has been created to track this recommendation:</p>
                    <ul className="space-y-2 text-gray-300 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400">✓</span>
                        <span>Logged in system for tracking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400">✓</span>
                        <span>Performance metrics will be monitored</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-teal-400">✓</span>
                        <span>Results will be analyzed in future insights</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full bg-gradient-to-r from-teal-400 to-purple-400 text-black font-bold py-2.5 md:py-3 rounded-xl hover:shadow-lg hover:shadow-teal-500/50 transition-all text-sm md:text-base"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
