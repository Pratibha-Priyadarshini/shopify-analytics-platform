"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { tenantApi } from "@/lib/api";
import { useToast } from "@/components/providers/ToastProvider";

export default function NewTenantPage() {
  const router = useRouter();
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: "",
    shopifyDomain: "",
    accessToken: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to connect a store");
        router.push("/");
        return;
      }

      await tenantApi.create(formData);
      toast.success("Store connected successfully!");
      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err: any) {
      console.error("Error connecting store:", err);
      setError(err.message || "Failed to connect store");
      toast.error(err.message || "Failed to connect store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark-bg p-6">
      <div className="max-w-3xl mx-auto">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="mb-6 border-teal-400/50 text-teal-300 hover:bg-teal-500/20 bg-black/30 backdrop-blur-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </Button>

        <Card className="glass-effect border border-teal-500/30 shadow-2xl shadow-teal-500/30">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 via-teal-500 to-gray-400 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/50">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <CardTitle className="text-3xl text-silver-gradient">
                  Connect Shopify Store
                </CardTitle>
                <p className="text-gray-300 mt-2">
                  Enter your Shopify store details to start syncing data
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-xl text-sm flex items-center gap-3 backdrop-blur-sm">
                  <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-teal-300 mb-2">
                  Store Name
                </label>
                <Input
                  type="text"
                  placeholder="My Awesome Store"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-black/50 border-teal-500/30 text-white placeholder:text-gray-500 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  A friendly name for your store
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-teal-300 mb-2">
                  Shopify Domain
                </label>
                <Input
                  type="text"
                  placeholder="your-store.myshopify.com"
                  value={formData.shopifyDomain}
                  onChange={(e) =>
                    setFormData({ ...formData, shopifyDomain: e.target.value })
                  }
                  required
                  className="bg-black/50 border-teal-500/30 text-white placeholder:text-gray-500 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm"
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Your Shopify store domain (e.g., mystore.myshopify.com)
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-teal-300 mb-2">
                  Admin API Access Token
                </label>
                <Input
                  type="password"
                  placeholder="shpat_xxxxxxxxxxxxx"
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  required
                  className="bg-black/50 border-teal-500/30 text-white placeholder:text-gray-500 focus:border-teal-400 focus:ring-teal-400/50 backdrop-blur-sm font-mono"
                />
                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Your Shopify Admin API access token
                </p>
              </div>

              <div className="bg-teal-500/10 border border-teal-500/30 p-5 rounded-xl backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-400 via-teal-500 to-gray-400 rounded-lg flex-shrink-0 shadow-lg shadow-teal-500/50">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-teal-300 mb-3">
                      How to get your Shopify credentials:
                    </h4>
                    <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                      <li>Go to your Shopify Admin dashboard</li>
                      <li>Navigate to <strong className="text-teal-300">Settings → Apps and sales channels</strong></li>
                      <li>Click <strong className="text-teal-300">"Develop apps"</strong> → <strong className="text-teal-300">"Create an app"</strong></li>
                      <li>Configure Admin API scopes: <code className="bg-black/50 px-2 py-0.5 rounded text-xs text-teal-300 border border-teal-500/30">read_customers</code>, <code className="bg-black/50 px-2 py-0.5 rounded text-xs text-teal-300 border border-teal-500/30">read_orders</code>, <code className="bg-black/50 px-2 py-0.5 rounded text-xs text-teal-300 border border-teal-500/30">read_products</code></li>
                      <li>Install the app and copy the <strong className="text-teal-300">Admin API access token</strong></li>
                    </ol>
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-teal-400 via-teal-500 to-gray-400 hover:from-teal-500 hover:via-teal-400 hover:to-gray-300 text-black font-bold py-6 rounded-xl shadow-lg shadow-teal-500/50 hover:shadow-teal-400/60 transition-all duration-300 hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Connect Store
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
