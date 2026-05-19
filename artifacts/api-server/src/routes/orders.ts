import { Router } from "express";
import { db, ordersTable, productsTable, discountsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateOrderBody } from "@workspace/api-zod";

const router = Router();

function formatOrder(o: typeof ordersTable.$inferSelect) {
  return {
    ...o,
    total: parseFloat(o.total),
    discountApplied: o.discountApplied ? parseFloat(o.discountApplied) : null,
    createdAt: o.createdAt.toISOString(),
  };
}

router.get("/orders", async (req, res): Promise<void> => {
  try {
    const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
    res.json(orders.map(formatOrder).reverse());
  } catch (err) {
    req.log.error({ err }, "Failed to list orders");
    res.status(500).json({ error: "Failed to list orders" });
  }
});

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const { clientName, items, type, discountCode } = parsed.data;
    let total = items.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
    let discountApplied: number | null = null;

    if (discountCode) {
      const discountRows = await db
        .select()
        .from(discountsTable)
        .where(eq(discountsTable.code, discountCode));
      const discount = discountRows[0];
      if (discount && discount.active && total >= parseFloat(discount.minAmount)) {
        if (discount.type === "percentage") {
          discountApplied = Math.round((total * parseFloat(discount.value)) / 100 * 100) / 100;
          total = Math.round((total - discountApplied) * 100) / 100;
        } else if (discount.type === "fixed") {
          discountApplied = Math.min(parseFloat(discount.value), total);
          total = Math.round((total - discountApplied) * 100) / 100;
        }
      }
    }

    for (const item of items) {
      const productRows = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
      const product = productRows[0];
      if (product && product.stock >= item.qty) {
        await db
          .update(productsTable)
          .set({ stock: product.stock - item.qty })
          .where(eq(productsTable.id, item.productId));
      }
    }

    const [order] = await db
      .insert(ordersTable)
      .values({
        clientName,
        items,
        total: String(total),
        type,
        status: "completed",
        discountApplied: discountApplied !== null ? String(discountApplied) : null,
      })
      .returning();
    res.status(201).json(formatOrder(order));
  } catch (err) {
    req.log.error({ err }, "Failed to create order");
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.patch("/orders/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  const { status } = req.body as { status: string };
  if (!["completed", "pending", "cancelled"].includes(status)) {
    res.status(400).json({ error: "Invalid status" });
    return;
  }
  try {
    const [updated] = await db
      .update(ordersTable)
      .set({ status })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!updated) { res.status(404).json({ error: "Order not found" }); return; }
    res.json(formatOrder(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update order");
    res.status(500).json({ error: "Failed to update order" });
  }
});

export default router;
