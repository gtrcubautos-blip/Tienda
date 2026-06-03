import { Router } from "express";
import { db, quoteWhatsappsTable } from "@workspace/db";
import { asc } from "drizzle-orm";
import { ReplaceQuoteWhatsappsBody } from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

router.get("/quote-whatsapps", async (req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(quoteWhatsappsTable)
      .orderBy(asc(quoteWhatsappsTable.position), asc(quoteWhatsappsTable.id));
    res.json(rows.map(r => ({ id: r.id, label: r.label, number: r.number })));
  } catch (err) {
    req.log.error({ err }, "Failed to list quote whatsapps");
    res.status(500).json({ error: "Failed to list quote whatsapps" });
  }
});

router.put("/quote-whatsapps", requireAdmin, async (req, res): Promise<void> => {
  const parsed = ReplaceQuoteWhatsappsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const items = parsed.data.items
      .map(i => ({ label: (i.label ?? "").trim(), number: i.number.trim() }))
      .filter(i => i.number.length > 0);
    const saved = await db.transaction(async (tx) => {
      await tx.delete(quoteWhatsappsTable);
      if (items.length === 0) return [];
      return tx
        .insert(quoteWhatsappsTable)
        .values(items.map((i, idx) => ({ label: i.label, number: i.number, position: idx })))
        .returning();
    });
    res.json(saved.map(r => ({ id: r.id, label: r.label, number: r.number })));
  } catch (err) {
    req.log.error({ err }, "Failed to replace quote whatsapps");
    res.status(500).json({ error: "Failed to replace quote whatsapps" });
  }
});

export default router;
