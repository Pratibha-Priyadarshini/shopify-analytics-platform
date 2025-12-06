"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

interface Event {
  id: string;
  eventType: string;
  customerId: string | null;
  metadata: any;
  createdAt: string;
}

interface EventStats {
  eventCounts: Array<{ type: string; count: number }>;
  cartAbandonment: {
    total: number;
    totalValue: string;
    averageValue: string;
  };
  checkoutFunnel: {
    checkoutsStarted: number;
    ordersCreated: number;
    conversionRate: string;
    abandonmentRate: string;
  };
  recentAbandonedCarts: Array<{
    id: string;
    createdAt: string;
    email: string;
    cartValue: number;
    itemCount: number;
    abandonedCheckoutUrl: string;
  }>;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<string>("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }
    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      fetchEvents();
      fetchStats();
    }
  }, [selectedTenant, eventFilter]);

  const fetchTenants = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tenants`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setTenants(data);
      if (data.length > 0) {
        setSelectedTenant(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const url = eventFilter === "all"
        ? `${process.env.NEXT_PUBLIC_API_URL}/events/${selectedTenant}`
        : `${process.env.NEXT_PUBLIC_API_URL}/events/${selectedTenant}?eventType=${eventFilter}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = getToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events/${selectedTenant}/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "CART_ABANDONED":
        return "🛒";
      case "CHECKOUT_STARTED":
        return "💳";
      case "CHECKOUT_UPDATED":
        return "🔄";
      case "ORDER_CREATED":
        return "✅";
      case "CUSTOMER_CREATED":
        return "👤";
      case "PRODUCT_CREATED":
        return "📦";
      default:
        return "📊";
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div className="flex min-h-screen dark-bg">
      <Sidebar />
      <main className="flex-1">
        <Navbar />
        <div className="p-8">
          <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-silver-gradient mb-2">
              Custom Events
            </h1>
            <p className="text-gray-400">
              Track cart abandonments, checkouts, and customer behavior
            </p>
          </div>

          <select
            value={selectedTenant}
            onChange={(e) => setSelectedTenant(e.target.value)}
            className="glass-effect px-4 py-2 rounded-xl border border-teal-500/30 text-white"
          >
            {tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id} className="bg-gray-900">
                {tenant.name}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cart Abandonment */}
            <div className="glass-effect p-6 rounded-2xl border border-teal-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🛒</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Cart Abandonment
                  </h3>
                  <p className="text-sm text-gray-400">Last 30 days</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Carts:</span>
                  <span className="text-white font-semibold">
                    {stats.cartAbandonment.total}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Value:</span>
                  <span className="text-teal-400 font-semibold">
                    ${stats.cartAbandonment.totalValue}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Avg Value:</span>
                  <span className="text-white font-semibold">
                    ${stats.cartAbandonment.averageValue}
                  </span>
                </div>
              </div>
            </div>

            {/* Checkout Funnel */}
            <div className="glass-effect p-6 rounded-2xl border border-teal-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">💳</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Checkout Funnel
                  </h3>
                  <p className="text-sm text-gray-400">Conversion metrics</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white font-semibold">
                    {stats.checkoutFunnel.checkoutsStarted}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed:</span>
                  <span className="text-green-400 font-semibold">
                    {stats.checkoutFunnel.ordersCreated}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversion:</span>
                  <span className="text-teal-400 font-semibold">
                    {stats.checkoutFunnel.conversionRate}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Types */}
            <div className="glass-effect p-6 rounded-2xl border border-teal-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">📊</div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Event Summary
                  </h3>
                  <p className="text-sm text-gray-400">All event types</p>
                </div>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {stats.eventCounts.map((ec) => (
                  <div key={ec.type} className="flex justify-between text-sm">
                    <span className="text-gray-400">{formatEventType(ec.type)}:</span>
                    <span className="text-white font-semibold">{ec.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Abandoned Carts */}
        {stats && stats.recentAbandonedCarts.length > 0 && (
          <div className="glass-effect p-6 rounded-2xl border border-teal-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">
              Recent Abandoned Carts
            </h3>
            <div className="space-y-3">
              {stats.recentAbandonedCarts.map((cart) => (
                <div
                  key={cart.id}
                  className="bg-black/30 p-4 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{cart.email}</p>
                      <p className="text-sm text-gray-400">
                        {cart.itemCount} items • ${cart.cartValue?.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(cart.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {cart.abandonedCheckoutUrl && (
                      <a
                        href={cart.abandonedCheckoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 hover:text-teal-300 text-sm"
                      >
                        View Cart →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Event Filter */}
        <div className="flex gap-2 flex-wrap">
          {["all", "CART_ABANDONED", "CHECKOUT_STARTED", "ORDER_CREATED", "CUSTOMER_CREATED"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => setEventFilter(filter)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  eventFilter === filter
                    ? "bg-gradient-to-r from-teal-400 to-gray-400 text-black font-semibold"
                    : "glass-effect border border-teal-500/30 text-gray-300 hover:border-teal-500/50"
                }`}
              >
                {filter === "all" ? "All Events" : formatEventType(filter)}
              </button>
            )
          )}
        </div>

        {/* Events List */}
        <div className="glass-effect p-6 rounded-2xl border border-teal-500/30">
          <h3 className="text-xl font-semibold text-white mb-4">Event Log</h3>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No events found. Webhooks will populate this data automatically.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-black/30 p-4 rounded-xl border border-teal-500/20 hover:border-teal-500/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{getEventIcon(event.eventType)}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-white font-medium">
                            {formatEventType(event.eventType)}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {event.metadata?.email && (
                          <span className="text-sm text-teal-400">
                            {event.metadata.email}
                          </span>
                        )}
                      </div>
                      {event.metadata && (
                        <div className="mt-2 text-xs text-gray-500">
                          {event.metadata.cartValue && (
                            <span>Value: ${event.metadata.cartValue} • </span>
                          )}
                          {event.metadata.totalPrice && (
                            <span>Total: ${event.metadata.totalPrice} • </span>
                          )}
                          {event.metadata.itemCount && (
                            <span>{event.metadata.itemCount} items</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        </div>
      </main>
    </div>
  );
}
