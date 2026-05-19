import { Router } from "express";
import { db, ordersTable, productsTable, discountsTable } from "@workspace/db";

const router = Router();

router.get("/dashboard/summary", async (req, res): Promise<void> => {
  try {
    const [orders, products, discounts] = await Promise.all([
      db.select().from(ordersTable),
      db.select().from(productsTable),
      db.select().from(discountsTable),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total), 0);
    const totalOrders = orders.length;
    const totalRetailOrders = orders.filter((o) => o.type === "retail").length;
    const totalWholesaleOrders = orders.filter((o) => o.type === "wholesale").length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock < 5).length;
    const activeDiscounts = discounts.filter((d) => d.active).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const revenueToday = orders
      .filter((o) => o.createdAt >= today)
      .reduce((sum, o) => sum + parseFloat(o.total), 0);

    res.json({
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      totalRetailOrders,
      totalWholesaleOrders,
      totalStock,
      lowStockCount,
      activeDiscounts,
      revenueToday: Math.round(revenueToday * 100) / 100,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard summary");
    res.status(500).json({ error: "Failed to get dashboard summary" });
  }
});

export default router;
