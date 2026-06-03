import { Router } from "express";
import { db, discountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateDiscountBody, UpdateDiscountBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

function formatDiscount(d: typeof discountsTable.$inferSelect) {
  return {
    ...d,
    value: parseFloat(d.value),
    minAmount: parseFloat(d.minAmount),
    expiresAt: d.expiresAt ? d.expiresAt.toISOString() : null,
  };
}

router.get("/discounts", async (req, res): Promise<void> => {
  try {
    const discounts = await db.select().from(discountsTable).orderBy(discountsTable.id);
    res.json(discounts.map(formatDiscount));
  } catch (err) {
    req.log.error({ err }, "Failed to list discounts");
    res.status(500).json({ error: "Failed to list discounts" });
  }
});

router.post("/discounts", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const data = parsed.data;
    const [discount] = await db
      .insert(discountsTable)
      .values({
        ...data,
        value: String(data.value),
        minAmount: String(data.minAmount ?? 0),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      })
      .returning();
    res.status(201).json(formatDiscount(discount));
  } catch (err) {
    req.log.error({ err }, "Failed to create discount");
    res.status(500).json({ error: "Failed to create discount" });
  }
});

router.patch<{ id: string }>("/discounts/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateDiscountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const data = parsed.data;
    const updates: Record<string, unknown> = { ...data };
    if (data.value !== undefined) updates.value = String(data.value);
    if (data.minAmount !== undefined) updates.minAmount = String(data.minAmount);
    if (data.expiresAt !== undefined) updates.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    const [discount] = await db
      .update(discountsTable)
      .set(updates)
      .where(eq(discountsTable.id, id))
      .returning();
    if (!discount) {
      res.status(404).json({ error: "Discount not found" });
      return;
    }
    res.json(formatDiscount(discount));
  } catch (err) {
    req.log.error({ err }, "Failed to update discount");
    res.status(500).json({ error: "Failed to update discount" });
  }
});

router.delete<{ id: string }>("/discounts/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(discountsTable).where(eq(discountsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete discount");
    res.status(500).json({ error: "Failed to delete discount" });
  }
});

export default router;
