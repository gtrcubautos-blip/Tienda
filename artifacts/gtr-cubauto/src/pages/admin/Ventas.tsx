import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet, RefreshCw, TrendingUp, ShoppingCart,
  CheckCircle2, Clock, MapPin, Package, List, ArrowUpDown,
  BarChart2, TrendingDown, AlertTriangle,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Area, AreaChart, PieChart, Pie, Cell,
  ResponsiveContainer, Legend,
} from "recharts";
import { useListProducts } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const NEON = "#00ff41";
const CHART_COLORS = ["#00ff41","#00cc33","#009922","#fbbf24","#ef4444","#3b82f6","#a855f7","#f97316","#06b6d4","#ec4899"];

const PAYMENT_KEYWORDS = ["Zelle", "Tarjeta", "Contra"];
function parseRegion(clientName: string): string {
  const matches = [...clientName.matchAll(/\[([^\]]+)\]/g)];
  for (let i = matches.length - 1; i >= 0; i--) {
    const content = matches[i][1].trim();
    if (!PAYMENT_KEYWORDS.some(kw => content.startsWith(kw))) return content;
  }
  return "No especificada";
}
function parseClientDisplay(clientName: string): string {
  return clientName.replace(/\s*\[[^\]]*\]/g, "").trim() || clientName;
}
function parsePaymentMethod(clientName: string): string {
  const match = clientName.match(/\[([^\]]+)\]/);
  return match ? match[1].split(" ")[0] : "—";
}

async function patchOrderStatus(id: number, status: string) {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

const STATUS_OPTIONS = [
  { value: "pending",   label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];
const CUBA_PROVINCES = [
  "Pinar del Río","Artemisa","La Habana","Mayabeque","Matanzas",
  "Villa Clara","Cienfuegos","Sancti Spíritus","Ciego de Ávila",
  "Camagüey","Las Tunas","Holguín","Granma","Santiago de Cuba",
  "Guantánamo","Isla de la Juventud","No especificada",
];

type ProductStat = {
  productId: number;
  productName: string;
  units: number;
  orders: number;
  revenue: number;
};

type RegionStat = { region: string; count: number; total: number };

type SortKey = "revenue" | "units" | "orders";

const TABS = [
  { id: "ordenes",   label: "Órdenes",       icon: List },
  { id: "productos", label: "Por Producto",   icon: Package },
  { id: "regiones",  label: "Por Región",     icon: MapPin },
  { id: "metricas",  label: "Métricas",       icon: BarChart2 },
] as const;
type TabId = typeof TABS[number]["id"];

export default function Ventas() {
  const { data: orders, isLoading } = useListOrders();
  const { data: allProducts } = useListProducts();
  const [activeTab, setActiveTab]   = useState<TabId>("ordenes");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [productSort, setProductSort]   = useState<SortKey>("revenue");
  const [exporting, setExporting]       = useState(false);
  const [updatingId, setUpdatingId]     = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast }   = useToast();

  const getStatusColor = (s: string) =>
    s === "completed" ? "bg-primary/15 text-primary border-primary/20"
    : s === "pending" ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
    : "bg-destructive/15 text-destructive border-destructive/20";

  /* ── Filtered orders ── */
  const filteredOrders = orders?.filter(o => {
    if (typeFilter   !== "all" && o.type   !== typeFilter)                    return false;
    if (statusFilter !== "all" && o.status !== statusFilter)                  return false;
    if (regionFilter !== "all" && parseRegion(o.clientName) !== regionFilter) return false;
    return true;
  });

  /* ── Product stats (from orders items JSON) ── */
  const productMap: Record<number, ProductStat> = {};
  (filteredOrders ?? []).forEach(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item: { productId: number; productName: string; qty: number; unitPrice: number }) => {
      if (!productMap[item.productId]) {
        productMap[item.productId] = {
          productId:   item.productId,
          productName: item.productName,
          units:   0,
          orders:  0,
          revenue: 0,
        };
      }
      productMap[item.productId].units   += item.qty;
      productMap[item.productId].orders  += 1;
      productMap[item.productId].revenue += item.qty * item.unitPrice;
    });
  });
  const productStats: ProductStat[] = Object.values(productMap).sort((a, b) => b[productSort] - a[productSort]);

  /* ── Metrics: stats from ALL orders (no filters) for demand/stuck analysis ── */
  const allProductMap: Record<number, ProductStat> = {};
  (orders ?? []).filter(o => o.status !== "cancelled").forEach(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item: { productId: number; productName: string; qty: number; unitPrice: number }) => {
      if (!allProductMap[item.productId]) {
        allProductMap[item.productId] = { productId: item.productId, productName: item.productName, units: 0, orders: 0, revenue: 0 };
      }
      allProductMap[item.productId].units   += item.qty;
      allProductMap[item.productId].orders  += 1;
      allProductMap[item.productId].revenue += item.qty * item.unitPrice;
    });
  });
  const allProductStats: ProductStat[] = Object.values(allProductMap);
  const soldProductIds = new Set(allProductStats.map(p => p.productId));

  // Top 8 most sold by units
  const topSellers = [...allProductStats].sort((a, b) => b.units - a.units).slice(0, 8)
    .map(p => ({ name: p.productName.length > 22 ? p.productName.slice(0, 22) + "…" : p.productName, units: p.units, revenue: Math.round(p.revenue * 100) / 100 }));

  // Bottom 6 least sold (only products with at least 1 sale)
  const bottomSellers = [...allProductStats].sort((a, b) => a.units - b.units).slice(0, 6)
    .map(p => ({ name: p.productName.length > 22 ? p.productName.slice(0, 22) + "…" : p.productName, units: p.units, revenue: Math.round(p.revenue * 100) / 100 }));

  // Products with stock but zero sales (stuck in stock)
  const stuckProducts = (allProducts ?? []).filter(p => p.stock > 0 && !soldProductIds.has(p.id));

  // Revenue distribution for top 5 pie chart
  const top5Revenue = [...allProductStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((p, i) => ({
    name: p.productName.length > 18 ? p.productName.slice(0, 18) + "…" : p.productName,
    value: Math.round(p.revenue * 100) / 100,
    fill: CHART_COLORS[i],
  }));
  const otherRevenue = allProductStats.slice(5).reduce((s, p) => s + p.revenue, 0);
  if (otherRevenue > 0) top5Revenue.push({ name: "Otros", value: Math.round(otherRevenue * 100) / 100, fill: "#555" });

  // Demand trend: orders grouped by day (last 20 days with activity)
  const demandMap: Record<string, { revenue: number; orders: number }> = {};
  (orders ?? []).filter(o => o.status !== "cancelled").forEach(o => {
    const date = format(new Date(o.createdAt), "dd/MM");
    if (!demandMap[date]) demandMap[date] = { revenue: 0, orders: 0 };
    demandMap[date].revenue += o.total;
    demandMap[date].orders  += 1;
  });
  const demandData = Object.entries(demandMap)
    .map(([date, d]) => ({ date, revenue: Math.round(d.revenue * 100) / 100, orders: d.orders }));

  /* ── Region stats ── */
  const regionMap: Record<string, { count: number; total: number }> = {};
  (filteredOrders ?? []).forEach(o => {
    const r = parseRegion(o.clientName);
    if (!regionMap[r]) regionMap[r] = { count: 0, total: 0 };
    regionMap[r].count++;
    regionMap[r].total += o.total;
  });
  const regionStats: RegionStat[] = Object.entries(regionMap)
    .map(([region, { count, total }]) => ({ region, count, total }))
    .sort((a, b) => b.total - a.total);

  /* ── KPIs ── */
  const totalRevenue  = orders?.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0) ?? 0;
  const totalFiltered = filteredOrders?.reduce((s, o) => s + o.total, 0) ?? 0;
  const pending       = orders?.filter(o => o.status === "pending").length   ?? 0;
  const completed     = orders?.filter(o => o.status === "completed").length ?? 0;

  /* ── Handlers ── */
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await patchOrderStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: "Estado actualizado", description: `Orden #${orderId.toString().padStart(6,"0")} → ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}` });
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } finally { setUpdatingId(null); }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/orders/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `GTR_CUBAUTO_Ventas_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Excel exportado" });
    } catch {
      toast({ title: "Error", description: "No se pudo exportar.", variant: "destructive" });
    } finally { setExporting(false); }
  };

  /* ──────────────────────────────────────────── */
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Gestión de Ventas</h1>
            <p className="text-muted-foreground mt-1">Órdenes, productos vendidos, regiones y reportes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() })}
              data-testid="button-refresh-orders">
              <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground"
              onClick={handleExportExcel} disabled={exporting}
              data-testid="button-export-excel">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting ? "Exportando..." : "Exportar Excel"}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ShoppingCart, label: "Total Órdenes",  value: orders?.length ?? 0,          color: "text-foreground" },
            { icon: Clock,        label: "Pendientes",      value: pending,                       color: "text-amber-400" },
            { icon: CheckCircle2, label: "Completadas",     value: completed,                     color: "text-primary"   },
            { icon: TrendingUp,   label: "Total Ingresos",  value: `$${totalRevenue.toFixed(2)}`, color: "text-primary"   },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-end flex-wrap">
            <div className="space-y-1 w-full md:w-40">
              <label className="text-xs font-medium text-muted-foreground">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type-filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full md:w-40">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full md:w-52">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Región
              </label>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger><SelectValue placeholder="Todas las regiones" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las regiones</SelectItem>
                  {CUBA_PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="ml-auto text-right">
              <div className="text-xs font-medium text-muted-foreground">Subtotal filtrado</div>
              <div className="text-2xl font-black text-primary">${totalFiltered.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        {/* ── TABS ── */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === id
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        {/* ══════ TAB: ÓRDENES ══════ */}
        {activeTab === "ordenes" && (
          <div className="border rounded-xl overflow-x-auto border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Región</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-36">Cambiar Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">Cargando ventas...</TableCell></TableRow>
                ) : filteredOrders?.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-10 text-muted-foreground">No hay ventas con estos filtros.</TableCell></TableRow>
                ) : filteredOrders?.map(order => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{order.id.toString().padStart(6,"0")}</TableCell>
                    <TableCell className="text-sm">{format(new Date(order.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[140px] truncate">{parseClientDisplay(order.clientName)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">
                        {parsePaymentMethod(order.clientName)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="truncate max-w-[100px]">{parseRegion(order.clientName)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={order.type === "wholesale" ? "border-primary text-primary" : ""}>
                        {order.type === "wholesale" ? "Mayorista" : "Retail"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {STATUS_OPTIONS.find(s => s.value === order.status)?.label ?? order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={val => handleStatusChange(order.id, val)} disabled={updatingId === order.id}>
                        <SelectTrigger className="h-7 text-xs w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ══════ TAB: POR PRODUCTO ══════ */}
        {activeTab === "productos" && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Ventas por Producto</CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {productStats.length} productos · {productStats.reduce((s,p) => s + p.units, 0)} unidades vendidas en total
                  </p>
                </div>
                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-xs text-muted-foreground shrink-0">Ordenar por:</span>
                  <Select value={productSort} onValueChange={v => setProductSort(v as SortKey)}>
                    <SelectTrigger className="h-8 text-xs w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Ingresos</SelectItem>
                      <SelectItem value="units">Unidades</SelectItem>
                      <SelectItem value="orders">Órdenes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {productStats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No hay datos de productos con los filtros actuales.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground w-8">#</th>
                        <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Producto</th>
                        <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Órdenes</th>
                        <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Unidades</th>
                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Ingresos</th>
                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">% Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const grandRev = productStats.reduce((s, p) => s + p.revenue, 0);
                        return productStats.map((p, i) => {
                          const pct = grandRev > 0 ? ((p.revenue / grandRev) * 100).toFixed(1) : "0.0";
                          return (
                            <tr key={p.productId} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                              <td className="py-3 px-4 text-muted-foreground font-mono text-xs">{i + 1}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: `${CHART_COLORS[i % CHART_COLORS.length]}18`, border: `1px solid ${CHART_COLORS[i % CHART_COLORS.length]}33` }}>
                                    <Package className="h-3.5 w-3.5" style={{ color: CHART_COLORS[i % CHART_COLORS.length] }} />
                                  </div>
                                  <span className="font-semibold">{p.productName}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <Badge variant="outline" className="text-xs">{p.orders}</Badge>
                              </td>
                              <td className="py-3 px-4 text-center font-bold">{p.units} ud.</td>
                              <td className="py-3 px-4 text-right font-black" style={{ color: NEON }}>
                                ${p.revenue.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div className="h-full rounded-full"
                                      style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                  </div>
                                  <span className="text-muted-foreground text-xs w-10 text-right">{pct}%</span>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#0a0a0a" }}>
                        <td colSpan={2} className="py-3 px-4 font-bold text-muted-foreground">TOTAL</td>
                        <td className="py-3 px-4 text-center font-bold text-muted-foreground">
                          {filteredOrders?.length ?? 0} órd.
                        </td>
                        <td className="py-3 px-4 text-center font-bold text-muted-foreground">
                          {productStats.reduce((s,p) => s + p.units, 0)} ud.
                        </td>
                        <td className="py-3 px-4 text-right font-black text-lg" style={{ color: NEON }}>
                          ${productStats.reduce((s,p) => s + p.revenue, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground text-xs">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ══════ TAB: POR REGIÓN ══════ */}
        {activeTab === "regiones" && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Ventas por Región</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Facturación desglosada por provincia cubana</p>
            </CardHeader>
            <CardContent className="p-0">
              {regionStats.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground text-sm">No hay datos de región con los filtros actuales.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Provincia</th>
                        <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Órdenes</th>
                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Total</th>
                        <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">% del Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {regionStats.map((row, i) => {
                        const grandTotal = regionStats.reduce((s, r) => s + r.total, 0);
                        const pct = grandTotal > 0 ? ((row.total / grandTotal) * 100).toFixed(1) : "0.0";
                        return (
                          <tr key={row.region} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-medium">
                              <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                {row.region}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-muted-foreground font-bold">{row.count}</td>
                            <td className="py-3 px-4 text-right font-black" style={{ color: NEON }}>${row.total.toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                  <div className="h-full rounded-full"
                                    style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                                </div>
                                <span className="text-muted-foreground text-xs w-10 text-right">{pct}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: "#0a0a0a" }}>
                        <td className="py-3 px-4 font-bold text-muted-foreground">TOTAL</td>
                        <td className="py-3 px-4 text-center font-bold text-muted-foreground">{regionStats.reduce((s, r) => s + r.count, 0)}</td>
                        <td className="py-3 px-4 text-right font-black text-lg" style={{ color: NEON }}>
                          ${regionStats.reduce((s, r) => s + r.total, 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right text-muted-foreground text-xs">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ══════ TAB: MÉTRICAS ══════ */}
        {activeTab === "metricas" && (
          <div className="flex flex-col gap-6">

            {/* ── KPI summary row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  icon: TrendingUp, label: "Producto Estrella",
                  value: allProductStats.length > 0
                    ? [...allProductStats].sort((a, b) => b.units - a.units)[0]?.productName.split(" ").slice(0, 3).join(" ")
                    : "—",
                  color: "text-primary", sub: "más unidades vendidas",
                },
                {
                  icon: TrendingDown, label: "Menor Demanda",
                  value: allProductStats.length > 0
                    ? [...allProductStats].sort((a, b) => a.units - b.units)[0]?.productName.split(" ").slice(0, 3).join(" ")
                    : "—",
                  color: "text-amber-400", sub: "menos unidades vendidas",
                },
                {
                  icon: AlertTriangle, label: "Sin Ventas (Stock)",
                  value: stuckProducts.length,
                  color: stuckProducts.length > 0 ? "text-red-400" : "text-primary",
                  sub: "productos estancados",
                },
                {
                  icon: Package, label: "Productos Activos",
                  value: allProductStats.length,
                  color: "text-foreground", sub: "con al menos 1 venta",
                },
              ].map(({ icon: Icon, label, value, color, sub }) => (
                <Card key={label} className="bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                    <div className={`text-xl font-black leading-tight ${color}`}>{value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Row 2: Top Sellers bar + Pie chart ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

              {/* Top 8 más vendidos — horizontal bar */}
              <Card className="bg-card border-border lg:col-span-3">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Top Más Vendidos — Unidades
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  {topSellers.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin datos de ventas aún.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={topSellers.length * 44 + 20}>
                      <BarChart data={topSellers} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#aaa", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                          labelStyle={{ color: "#fff", fontWeight: 700 }}
                          itemStyle={{ color: NEON }}
                          formatter={(v: number) => [`${v} uds.`, "Unidades"]}
                        />
                        <Bar dataKey="units" radius={[0, 4, 4, 0]}>
                          {topSellers.map((_, i) => (
                            <Cell key={i} fill={i === 0 ? NEON : i === 1 ? "#00cc33" : i === 2 ? "#009922" : "#1a4a1a"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Revenue distribution pie */}
              <Card className="bg-card border-border lg:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Distribución de Ingresos
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {top5Revenue.length === 0 ? (
                    <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">Sin datos.</div>
                  ) : (
                    <div>
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie data={top5Revenue} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                            {top5Revenue.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                          </Pie>
                          <Tooltip
                            contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                            formatter={(v: number) => [`$${v.toFixed(2)}`, "Ingresos"]}
                            labelStyle={{ color: "#fff" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-1.5 mt-1">
                        {top5Revenue.map((entry, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                            <span className="text-muted-foreground flex-1 truncate">{entry.name}</span>
                            <span className="font-bold" style={{ color: entry.fill }}>${entry.value.toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Row 3: Demand trend area chart ── */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Tendencia de Demanda — Ingresos por Día
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {demandData.length === 0 ? (
                  <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">Sin datos de demanda aún.</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={demandData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="demandGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={NEON} stopOpacity={0.25} />
                          <stop offset="95%" stopColor={NEON} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="rev" orientation="left" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={(v: number) => `$${v}`} />
                      <YAxis yAxisId="ord" orientation="right" tick={{ fill: "#555", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "#aaa" }}
                        formatter={(v: number, name: string) => name === "revenue" ? [`$${v.toFixed(2)}`, "Ingresos"] : [v, "Órdenes"]}
                      />
                      <Legend formatter={(v: string) => v === "revenue" ? "Ingresos ($)" : "Órdenes"} wrapperStyle={{ fontSize: 11, color: "#666" }} />
                      <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke={NEON} strokeWidth={2} fill="url(#demandGrad)" dot={false} />
                      <Area yAxisId="ord" type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={1.5} fill="url(#ordersGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* ── Row 4: Two columns — least sold + stuck in stock ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Least sold */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-amber-400" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Menor Demanda
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">Productos con pocas ventas — revisar precio o visibilidad</p>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  {bottomSellers.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">Sin datos.</div>
                  ) : (
                    <div className="space-y-2">
                      {bottomSellers.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/15">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-amber-500/10 border border-amber-500/20">
                            <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground">${p.revenue.toFixed(2)} ingresos</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-amber-400">{p.units} uds.</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stuck in stock */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                      Estancados en Stock
                    </CardTitle>
                  </div>
                  <p className="text-xs text-muted-foreground">Tienen inventario pero <strong className="text-red-400">cero ventas</strong> registradas</p>
                </CardHeader>
                <CardContent className="pt-0 pb-4">
                  {stuckProducts.length === 0 ? (
                    <div className="text-center py-6 text-primary text-sm font-semibold">
                      ¡Todos los productos con stock han tenido al menos una venta!
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {stuckProducts.map((p) => (
                        <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/15">
                          <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-red-500/10 border border-red-500/20">
                            <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">{p.name}</div>
                            <div className="text-xs text-muted-foreground capitalize">{p.category} · ${parseFloat(String(p.price)).toFixed(2)}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-sm font-black text-red-400">{p.stock} uds.</div>
                            <div className="text-xs text-muted-foreground">en stock</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
