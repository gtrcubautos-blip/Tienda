import { Router } from "express";
import { db, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCustomerBody, SendCampaignBody } from "@workspace/api-zod";
import { encrypt, safeDecrypt } from "../lib/crypto";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

function encryptCustomer(data: { name: string; phone: string; email: string; province: string }) {
  return {
    name: encrypt(data.name),
    phone: encrypt(data.phone),
    email: encrypt(data.email),
    province: data.province, // province not sensitive — needed for segmentation queries
  };
}

function formatCustomer(c: typeof customersTable.$inferSelect) {
  return {
    id: c.id,
    name: safeDecrypt(c.name),
    phone: safeDecrypt(c.phone),
    email: safeDecrypt(c.email),
    province: c.province,
    createdAt: c.createdAt.toISOString(),
  };
}

// GET /customers
router.get("/", async (req, res) => {
  const rows = await db.select().from(customersTable).orderBy(customersTable.createdAt);
  res.json(rows.map(formatCustomer));
});

// POST /customers
router.post("/", async (req, res) => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db
    .insert(customersTable)
    .values(encryptCustomer(parsed.data))
    .returning();
  res.status(201).json(formatCustomer(created));
});

// DELETE /customers/:id
router.delete<{ id: string }>("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(customersTable).where(eq(customersTable.id, id));
  res.status(204).end();
});

// POST /customers/campaign — segments by province, returns recipient list (decrypted emails)
router.post("/campaign", requireAdmin, async (req, res) => {
  const parsed = SendCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { provinces, message } = parsed.data;

  const all = await db.select().from(customersTable);
  const segment = provinces.length === 0
    ? all
    : all.filter(c => provinces.includes(c.province));

  const recipients = segment.map(c => safeDecrypt(c.email));

  req.log.info(
    { campaign: true, total: recipients.length, provinces },
    `Campaign logged: "${message.slice(0, 60)}..."`
  );

  res.json({ sent: recipients.length, recipients });
});

export default router;
