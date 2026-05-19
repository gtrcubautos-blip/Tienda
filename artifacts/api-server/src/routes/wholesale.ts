import { Router } from "express";
import { db, productsTable } from "@workspace/db";

const router = Router();

function buildTiers(basePrice: number, wholesalePrice: number, minWholesaleQty: number) {
  return [
    { minQty: 1, price: basePrice, label: `1-${minWholesaleQty - 1} unidades` },
    { minQty: minWholesaleQty, price: wholesalePrice, label: `${minWholesaleQty}-${minWholesaleQty * 4} unidades` },
    {
      minQty: minWholesaleQty * 4,
      price: Math.round(wholesalePrice * 0.92 * 100) / 100,
      label: `${minWholesaleQty * 4}+ unidades`,
    },
  ];
}

router.get("/wholesale/products", async (req, res) => {
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.id);
    const wholesaleProducts = products.map((p) => {
      const price = parseFloat(p.price);
      const wholesalePrice = parseFloat(p.wholesalePrice);
      return {
        ...p,
        price,
        wholesalePrice,
        tiers: buildTiers(price, wholesalePrice, p.minWholesaleQty),
      };
    });
    res.json(wholesaleProducts);
  } catch (err) {
    req.log.error({ err }, "Failed to list wholesale products");
    res.status(500).json({ error: "Failed to list wholesale products" });
  }
});

export default router;
