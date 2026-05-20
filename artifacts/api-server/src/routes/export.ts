import { Router } from "express";
import ExcelJS from "exceljs";
import { db, ordersTable, productsTable } from "@workspace/db";

const router = Router();

router.get("/orders/export", async (req, res): Promise<void> => {
  try {
    const [orders, products] = await Promise.all([
      db.select().from(ordersTable).orderBy(ordersTable.createdAt),
      db.select().from(productsTable),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const wb = new ExcelJS.Workbook();

    const ws = wb.addWorksheet("Ventas");
    ws.columns = [
      { key: "ID Orden", width: 10 },
      { key: "Fecha", width: 22 },
      { key: "Cliente", width: 22 },
      { key: "Tipo", width: 12 },
      { key: "Estado", width: 12 },
      { key: "Artículos", width: 60 },
      { key: "Descuento ($)", width: 14 },
      { key: "Total ($)", width: 12 },
    ];
    ws.addRow(ws.columns.map((c) => c.key));

    for (const o of orders) {
      const items = (o.items as Array<{ productId: number; productName: string; qty: number; unitPrice: number }>);
      const itemsStr = items.map((i) => `${i.productName} x${i.qty} @$${i.unitPrice}`).join("; ");
      ws.addRow([
        o.id,
        o.createdAt.toLocaleString("es-CU", { timeZone: "America/Havana" }),
        o.clientName,
        o.type === "wholesale" ? "Mayorista" : "Retail",
        o.status === "completed" ? "Completado" : o.status === "pending" ? "Pendiente" : "Cancelado",
        itemsStr,
        o.discountApplied ? parseFloat(o.discountApplied) : 0,
        parseFloat(o.total),
      ]);
    }

    const summaryTotal = orders.reduce((s, o) => s + parseFloat(o.total), 0);
    const retailTotal = orders.filter((o) => o.type === "retail").reduce((s, o) => s + parseFloat(o.total), 0);
    const wholesaleTotal = orders.filter((o) => o.type === "wholesale").reduce((s, o) => s + parseFloat(o.total), 0);

    const wsSummary = wb.addWorksheet("Resumen");
    wsSummary.columns = [
      { key: "Resumen", width: 26 },
      { key: "Valor", width: 20 },
    ];
    wsSummary.addRow(["Resumen", "Valor"]);
    wsSummary.addRow(["Total de Órdenes", orders.length]);
    wsSummary.addRow(["Total Ingresos ($)", summaryTotal.toFixed(2)]);
    wsSummary.addRow(["Ingresos Retail ($)", retailTotal.toFixed(2)]);
    wsSummary.addRow(["Ingresos Mayorista ($)", wholesaleTotal.toFixed(2)]);
    wsSummary.addRow(["Generado", new Date().toLocaleString("es-CU", { timeZone: "America/Havana" })]);

    const filename = `GTR_CUBAUTO_Ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    const buf = await wb.xlsx.writeBuffer();
    res.send(buf);
  } catch (err) {
    req.log.error({ err }, "Failed to export orders");
    res.status(500).json({ error: "Failed to export orders" });
  }
});

export default router;
