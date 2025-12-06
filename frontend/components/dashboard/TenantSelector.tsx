"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { tenantApi } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";

interface TenantSelectorProps {
  tenants: any[];
  selectedTenant: string | null;
  onSelectTenant: (tenantId: string) => void;
  onRefresh: () => void;
}

export function TenantSelector({
  tenants,
  selectedTenant,
  onSelectTenant,
  onRefresh,
}: TenantSelectorProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const toast = useToast();

  const handleSync = async () => {
    if (!selectedTenant) return;
    
    setSyncing(true);
    try {
      await tenantApi.sync(selectedTenant);
      toast.success("Sync completed successfully!");
      onRefresh();
    } catch (error: any) {
      toast.error(`Sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  };

  const selectedTenantData = tenants.find((t) => t.id === selectedTenant);

  return (
    <div className="glass-effect rounded-2xl shadow-2xl border border-teal-500/50 p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-transparent to-gray-400/5"></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 flex-1">
          <div className="flex-1 min-w-[250px]">
            <label className="text-sm text-teal-300 font-semibold block mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Selected Store
            </label>
            <select
              value={selectedTenant || ""}
              onChange={(e) => onSelectTenant(e.target.value)}
              className="w-full border-2 border-teal-500/50 rounded-xl px-5 py-3 text-lg font-bold bg-black/50 text-teal-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/50 transition-all backdrop-blur-sm hover:border-teal-400/70 cursor-pointer"
            >
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id} className="bg-black text-teal-300">
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>
          
          {selectedTenantData?.lastSyncAt && (
            <div className="flex items-center gap-3 text-sm text-gray-300 bg-teal-500/10 px-5 py-3 rounded-xl border border-teal-500/30 backdrop-blur-sm">
              <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Last synced</div>
                <div className="font-semibold text-teal-300">{new Date(selectedTenantData.lastSyncAt).toLocaleString()}</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            className="border-teal-400/50 text-teal-300 hover:bg-teal-500/20 hover:border-teal-300 bg-black/30 backdrop-blur-sm shadow-lg shadow-teal-500/20 px-6 py-3"
          >
            <svg className={`w-5 h-5 mr-2 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? "Syncing..." : "Sync Now"}
          </Button>
          <Button 
            onClick={() => router.push("/tenants/new")}
            className="bg-gradient-to-r from-teal-400 via-teal-500 to-gray-400 hover:from-teal-500 hover:via-teal-400 hover:to-gray-300 text-black font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-400/50 transition-all px-6 py-3"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Store
          </Button>
        </div>
      </div>
    </div>
  );
}
