import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.get("/:tenantId/summary", async (req, res) => {
  const { tenantId } = req.params;
  const customers = await prisma.customer.count({ where: { tenantId } });
  const orders = await prisma.order.findMany({ where: { tenantId } });
  const revenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

  res.json({
    totalCustomers: customers,
    totalOrders: orders.length,
    totalRevenue: revenue,
  });
});

export default router;
