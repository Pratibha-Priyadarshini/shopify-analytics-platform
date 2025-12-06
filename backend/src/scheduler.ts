import { PrismaClient } from "@prisma/client";
import { ShopifyService } from "./services/shopifyService";
import { IngestionService } from "./services/ingestionService";

const prisma = new PrismaClient();

export async function syncAllTenants() {
  console.log("🔄 Starting scheduled sync for all tenants...");
  
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      shopifyDomain: true,
      accessToken: true,
    },
  });

  console.log(`Found ${tenants.length} tenants to sync`);

  for (const tenant of tenants) {
    try {
      console.log(`Syncing tenant: ${tenant.name} (${tenant.id})`);
      
      const shopifyService = new ShopifyService({
        shopifyDomain: tenant.shopifyDomain,
        accessToken: tenant.accessToken,
      });

      const ingestionService = new IngestionService(shopifyService, tenant.id);
      const results = await ingestionService.syncAll();

      console.log(`✅ Synced ${tenant.name}:`, results);
    } catch (error: any) {
      console.error(`❌ Error syncing tenant ${tenant.name}:`, error.message);
    }
  }

  console.log("✅ Scheduled sync completed");
}

// Run sync every 6 hours
export function startScheduler() {
  const SYNC_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  
  console.log("📅 Scheduler started - syncing every 6 hours");
  
  // Run immediately on start
  syncAllTenants().catch(console.error);
  
  // Then run periodically
  setInterval(() => {
    syncAllTenants().catch(console.error);
  }, SYNC_INTERVAL);
}
