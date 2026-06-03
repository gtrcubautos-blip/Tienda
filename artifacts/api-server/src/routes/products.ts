import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  CreateProductBody,
  UpdateProductBody,
  UpdateProductPriceBody,
} from "@workspace/api-zod";
import { requireAdmin } from "../lib/adminAuth";

const router = Router();

router.get("/products", async (req, res): Promise<void> => {
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.id);
    res.json(
      products.map((p) => ({
        ...p,
        price: parseFloat(p.price),
        wholesalePrice: parseFloat(p.wholesalePrice),
      }))
    );
  } catch (err) {
    req.log.error({ err }, "Failed to list products");
    res.status(500).json({ error: "Failed to list products" });
  }
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const [product] = await db
      .insert(productsTable)
      .values({
        ...parsed.data,
        price: String(parsed.data.price),
        wholesalePrice: String(parsed.data.wholesalePrice),
      })
      .returning();
    res.status(201).json({
      ...product,
      price: parseFloat(product.price),
      wholesalePrice: parseFloat(product.wholesalePrice),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to create product");
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch<{ id: string }>("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.price !== undefined) updates.price = String(parsed.data.price);
    if (parsed.data.wholesalePrice !== undefined) updates.wholesalePrice = String(parsed.data.wholesalePrice);
    const [product] = await db
      .update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, id))
      .returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({
      ...product,
      price: parseFloat(product.price),
      wholesalePrice: parseFloat(product.wholesalePrice),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update product");
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete<{ id: string }>("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  try {
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to delete product");
    res.status(500).json({ error: "Failed to delete product" });
  }
});

router.patch<{ id: string }>("/products/:id/price", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateProductPriceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  try {
    const updates: Record<string, unknown> = {};
    if (parsed.data.price !== undefined) updates.price = String(parsed.data.price);
    if (parsed.data.wholesalePrice !== undefined) updates.wholesalePrice = String(parsed.data.wholesalePrice);
    if (parsed.data.minWholesaleQty !== undefined) updates.minWholesaleQty = parsed.data.minWholesaleQty;
    const [product] = await db
      .update(productsTable)
      .set(updates)
      .where(eq(productsTable.id, id))
      .returning();
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({
      ...product,
      price: parseFloat(product.price),
      wholesalePrice: parseFloat(product.wholesalePrice),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update price");
    res.status(500).json({ error: "Failed to update price" });
  }
});

export default router;
