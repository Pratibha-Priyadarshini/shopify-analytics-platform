import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

router.post("/register", async (req, res) => {
  const { name, apiKey, apiSecret } = req.body;
  const tenant = await prisma.tenant.create({
    data: { name, apiKey, apiSecret },
  });
  res.json(tenant);
});

export default router;
