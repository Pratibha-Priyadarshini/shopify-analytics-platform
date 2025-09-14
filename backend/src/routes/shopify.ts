import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();
const router = Router();

router.post("/:tenantId/customers", async (req, res) => {
  const { tenantId } = req.params;
  const { email, name, totalSpend } = req.body;
  const customer = await prisma.customer.create({
    data: { tenantId, email, name, totalSpend },
  });
  res.json(customer);
});

export default router;
