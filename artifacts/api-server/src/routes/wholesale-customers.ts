import { Router } from "express";
import { db, wholesaleCustomersTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { RegisterWholesaleCustomerBody } from "@workspace/api-zod";

const router = Router();

function pad(n: number, len = 6): string {
  return n.toString().padStart(len, "0");
}

// GET /wholesale-customers
router.get("/", async (req, res) => {
  const rows = await db.select().from(wholesaleCustomersTable).orderBy(wholesaleCustomersTable.createdAt);
  res.json(rows.map(r => ({
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email,
    province: r.province,
    companyType: r.companyType,
    companyName: r.companyName,
    clientCode: r.clientCode,
    clientNumber: r.clientNumber,
    createdAt: r.createdAt.toISOString(),
  })));
});

// POST /wholesale-customers
router.post("/", async (req, res) => {
  const parsed = RegisterWholesaleCustomerBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, phone, email, province, companyType, companyName, onatDocument, onatPhotoPath } = parsed.data;

  // Determine next sequential number
  const [{ value: total }] = await db.select({ value: count() }).from(wholesaleCustomersTable);
  const clientNumber = Number(total) + 1;
  const clientCode = `GTR-MAY-${pad(clientNumber)}`;

  const [inserted] = await db.insert(wholesaleCustomersTable).values({
    name,
    phone,
    email,
    province,
    companyType,
    companyName,
    onatDocument,
    onatPhotoPath: onatPhotoPath ?? null,
    clientCode,
    clientNumber,
  }).returning();

  res.status(201).json({
    id: inserted.id,
    name: inserted.name,
    phone: inserted.phone,
    email: inserted.email,
    province: inserted.province,
    companyType: inserted.companyType,
    companyName: inserted.companyName,
    onatDocument: inserted.onatDocument,
    onatPhotoPath: inserted.onatPhotoPath,
    clientCode: inserted.clientCode,
    clientNumber: inserted.clientNumber,
    createdAt: inserted.createdAt.toISOString(),
  });
});

// DELETE /wholesale-customers/:id
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  await db.delete(wholesaleCustomersTable).where(eq(wholesaleCustomersTable.id, id));
  res.status(204).send();
});

export default router;
