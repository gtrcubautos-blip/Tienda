import { Router } from "express";
import { db, customersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCustomerBody, SendCampaignBody } from "@workspace/api-zod";

const router = Router();

function formatCustomer(c: typeof customersTable.$inferSelect) {
  return {
    ...c,
    createdAt: c.createdAt.toISOString(),
  };
}

// GET /customers
router.get("/", async (req, res) => {
  const customers = await db.select().from(customersTable).orderBy(customersTable.createdAt);
  res.json(customers.map(formatCustomer));
});

// POST /customers
router.post("/", async (req, res) => {
  const parsed = CreateCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [created] = await db.insert(customersTable).values(parsed.data).returning();
  res.status(201).json(formatCustomer(created));
});

// DELETE /customers/:id
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(customersTable).where(eq(customersTable.id, id));
  res.status(204).end();
});

// POST /customers/campaign  — logs campaign, returns recipients list
router.post("/campaign", async (req, res) => {
  const parsed = SendCampaignBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { provinces } = parsed.data;

  let customers;
  if (provinces.length === 0) {
    customers = await db.select().from(customersTable);
  } else {
    const all = await db.select().from(customersTable);
    customers = all.filter(c => provinces.includes(c.province));
  }

  const recipients = customers.map(c => c.email);
  req.log.info({ campaign: true, total: recipients.length, provinces }, "Campaign logged");

  res.json({ sent: recipients.length, recipients });
});

export default router;
