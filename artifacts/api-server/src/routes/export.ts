import { Router } from "express";
import * as XLSX from "xlsx";
import { db, ordersTable, productsTable } from "@workspace/db";

const router = Router();

router.get("/orders/export", async (req, res): Promise<void> => {
  try {
    const [orders, products] = await Promise.all([
      db.select().from(ordersTable).orderBy(ordersTable.createdAt),
      db.select().from(productsTable),
    ]);

    const productMap = new Map(products.map((p) => [p.id, p.name]));

    const rows = orders.map((o) => {
      const items = (o.items as Array<{ productId: number; productName: string; qty: number; unitPrice: number }>);
      const itemsStr = items.map((i) => `${i.productName} x${i.qty} @$${i.unitPrice}`).join("; ");
      return {
        "ID Orden": o.id,
        "Fecha": o.createdAt.toLocaleString("es-CU", { timeZone: "America/Havana" }),
        "Cliente": o.clientName,
        "Tipo": o.type === "wholesale" ? "Mayorista" : "Retail",
        "Estado": o.status === "completed" ? "Completado" : o.status === "pending" ? "Pendiente" : "Cancelado",
        "Artículos": itemsStr,
        "Descuento ($)": o.discountApplied ? parseFloat(o.discountApplied) : 0,
        "Total ($)": parseFloat(o.total),
      };
    });

    const summaryTotal = orders.reduce((s, o) => s + parseFloat(o.total), 0);
    const retailTotal = orders.filter((o) => o.type === "retail").reduce((s, o) => s + parseFloat(o.total), 0);
    const wholesaleTotal = orders.filter((o) => o.type === "wholesale").reduce((s, o) => s + parseFloat(o.total), 0);

    const wb = XLSX.utils.book_new();

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = [
      { wch: 10 }, { wch: 22 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 60 }, { wch: 14 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");

    const summaryRows = [
      { "Resumen": "Total de Órdenes", "Valor": orders.length },
      { "Resumen": "Total Ingresos ($)", "Valor": summaryTotal.toFixed(2) },
      { "Resumen": "Ingresos Retail ($)", "Valor": retailTotal.toFixed(2) },
      { "Resumen": "Ingresos Mayorista ($)", "Valor": wholesaleTotal.toFixed(2) },
      { "Resumen": "Generado", "Valor": new Date().toLocaleString("es-CU", { timeZone: "America/Havana" }) },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary["!cols"] = [{ wch: 26 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen");

    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const filename = `GTR_CUBAUTO_Ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buf);
  } catch (err) {
    req.log.error({ err }, "Failed to export orders");
    res.status(500).json({ error: "Failed to export orders" });
  }
});

export default router;
