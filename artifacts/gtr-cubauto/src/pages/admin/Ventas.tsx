import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, TrendingUp, ShoppingCart, CheckCircle2, Clock, MapPin } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const NEON = "#00ff41";
const CHART_COLORS = ["#00ff41","#00cc33","#009922","#fbbf24","#ef4444","#3b82f6","#a855f7","#f97316","#06b6d4","#ec4899"];

const PAYMENT_KEYWORDS = ["Zelle", "Tarjeta", "Contra"];
function parseRegion(clientName: string): string {
  const matches = [...clientName.matchAll(/\[([^\]]+)\]/g)];
  for (let i = matches.length - 1; i >= 0; i--) {
    const content = matches[i][1].trim();
    const isPayment = PAYMENT_KEYWORDS.some(kw => content.startsWith(kw));
    if (!isPayment) return content;
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
  if (!res.ok) throw new Error("Failed to update order");
  return res.json();
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "completed", label: "Completado" },
  { value: "cancelled", label: "Cancelado" },
];

const CUBA_PROVINCES = [
  "Pinar del Río","Artemisa","La Habana","Mayabeque","Matanzas",
  "Villa Clara","Cienfuegos","Sancti Spíritus","Ciego de Ávila",
  "Camagüey","Las Tunas","Holguín","Granma","Santiago de Cuba",
  "Guantánamo","Isla de la Juventud","No especificada",
];

export default function Ventas() {
  const { data: orders, isLoading } = useListOrders();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getStatusColor = (s: string) => s === "completed" ? "bg-primary/15 text-primary border-primary/20" : s === "pending" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-destructive/15 text-destructive border-destructive/20";

  const filteredOrders = orders?.filter(order => {
    if (typeFilter !== "all" && order.type !== typeFilter) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (regionFilter !== "all" && parseRegion(order.clientName) !== regionFilter) return false;
    return true;
  });

  // Region stats
  const regionMap: Record<string, { count: number; total: number }> = {};
  (filteredOrders ?? []).forEach(o => {
    const r = parseRegion(o.clientName);
    if (!regionMap[r]) regionMap[r] = { count: 0, total: 0 };
    regionMap[r].count++;
    regionMap[r].total += o.total;
  });
  const regionStats = Object.entries(regionMap)
    .map(([region, { count, total }]) => ({ region, count, total }))
    .sort((a, b) => b.total - a.total);

  const totalRevenue = orders?.filter(o => o.status !== "cancelled").reduce((s, o) => s + o.total, 0) ?? 0;
  const totalFiltered = filteredOrders?.reduce((s, o) => s + o.total, 0) ?? 0;
  const pending = orders?.filter(o => o.status === "pending").length ?? 0;
  const completed = orders?.filter(o => o.status === "completed").length ?? 0;

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await patchOrderStatus(orderId, newStatus);
      queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
      toast({ title: "Estado actualizado", description: `Orden #${orderId.toString().padStart(6,"0")} → ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}` });
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar el estado.", variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/orders/export");
      if (!res.ok) throw new Error();
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `GTR_CUBAUTO_Ventas_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Excel exportado" });
    } catch {
      toast({ title: "Error", description: "No se pudo exportar.", variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Gestión de Ventas</h1>
            <p className="text-muted-foreground mt-1">Administra órdenes, regiones, estados y exporta reportes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() })} data-testid="button-refresh-orders">
              <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleExportExcel} disabled={exporting} data-testid="button-export-excel">
              <FileSpreadsheet className="h-4 w-4 mr-2" />{exporting ? "Exportando..." : "Exportar Excel"}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: ShoppingCart, label: "Total Órdenes", value: orders?.length ?? 0, color: "text-foreground" },
            { icon: Clock, label: "Pendientes", value: pending, color: "text-amber-400" },
            { icon: CheckCircle2, label: "Completadas", value: completed, color: "text-primary" },
            { icon: TrendingUp, label: "Total Ingresos", value: `$${totalRevenue.toFixed(2)}`, color: "text-primary" },
          ].map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-1"><Icon className={`h-3.5 w-3.5 ${color}`} /><div className="text-xs text-muted-foreground">{label}</div></div>
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
                <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="retail">Retail</SelectItem><SelectItem value="wholesale">Mayorista</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full md:w-40">
              <label className="text-xs font-medium text-muted-foreground">Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todos</SelectItem><SelectItem value="completed">Completado</SelectItem><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full md:w-52">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />Región</label>
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

        {/* Orders Table */}
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
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Cargando ventas...</TableCell></TableRow>
              ) : filteredOrders?.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No hay ventas con estos filtros.</TableCell></TableRow>
              ) : (
                filteredOrders?.map(order => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{order.id.toString().padStart(6,"0")}</TableCell>
                    <TableCell className="text-sm">{format(new Date(order.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[140px] truncate">{parseClientDisplay(order.clientName)}</TableCell>
                    <TableCell><Badge variant="outline" className="text-xs border-zinc-700 text-zinc-400">{parsePaymentMethod(order.clientName)}</Badge></TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Region Stats Table */}
        {regionStats.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Ventas por Región</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Desglose de órdenes y facturación por provincia cubana</p>
            </CardHeader>
            <CardContent className="p-0">
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
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              {row.region}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-muted-foreground font-bold">{row.count}</td>
                          <td className="py-3 px-4 text-right font-black" style={{ color: NEON }}>${row.total.toFixed(2)}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              </div>
                              <span className="text-muted-foreground text-xs w-10 text-right">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="font-bold" style={{ background: "#0a0a0a" }}>
                      <td className="py-3 px-4 text-muted-foreground">TOTAL</td>
                      <td className="py-3 px-4 text-center text-muted-foreground">{regionStats.reduce((s, r) => s + r.count, 0)}</td>
                      <td className="py-3 px-4 text-right font-black text-lg" style={{ color: NEON }}>${regionStats.reduce((s, r) => s + r.total, 0).toFixed(2)}</td>
                      <td className="py-3 px-4 text-right text-muted-foreground text-xs">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
