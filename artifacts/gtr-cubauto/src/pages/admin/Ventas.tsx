import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw, TrendingUp, ShoppingCart, CheckCircle2, Clock } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

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

export default function Ventas() {
  const { data: orders, isLoading } = useListOrders();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-primary/15 text-primary border-primary/20";
      case "pending": return "bg-amber-500/15 text-amber-400 border-amber-500/20";
      case "cancelled": return "bg-destructive/15 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const filteredOrders = orders?.filter(order => {
    if (typeFilter !== "all" && order.type !== typeFilter) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    return true;
  });

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
      const response = await fetch("/api/orders/export");
      if (!response.ok) throw new Error("Error al exportar");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `GTR_CUBAUTO_Ventas_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Excel exportado", description: "El archivo de ventas se descargó." });
    } catch {
      toast({ title: "Error", description: "No se pudo exportar el archivo Excel.", variant: "destructive" });
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
            <p className="text-muted-foreground mt-1">Administra órdenes, cambia estados y exporta reportes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() })} data-testid="button-refresh-orders">
              <RefreshCw className="h-4 w-4 mr-2" /> Actualizar
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleExportExcel} disabled={exporting} data-testid="button-export-excel">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting ? "Exportando..." : "Exportar Excel"}
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
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1 w-full md:w-48">
              <label className="text-xs font-medium text-muted-foreground">Tipo de venta</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type-filter"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-full md:w-48">
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
            <div className="ml-auto text-right">
              <div className="text-xs font-medium text-muted-foreground">Subtotal filtrado</div>
              <div className="text-2xl font-black text-primary">${totalFiltered.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <div className="border rounded-xl overflow-x-auto border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">ID</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-36">Cambiar Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Cargando ventas...</TableCell></TableRow>
              ) : filteredOrders?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No hay ventas con estos filtros.</TableCell></TableRow>
              ) : (
                filteredOrders?.map(order => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-mono text-xs text-muted-foreground">#{order.id.toString().padStart(6,"0")}</TableCell>
                    <TableCell className="text-sm">{format(new Date(order.createdAt), "dd/MM/yy HH:mm")}</TableCell>
                    <TableCell className="font-medium text-sm max-w-[180px] truncate">{order.clientName}</TableCell>
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
                    <TableCell className="text-amber-400 text-sm">
                      {order.discountApplied ? `-$${order.discountApplied.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-black text-primary">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={val => handleStatusChange(order.id, val)}
                        disabled={updatingId === order.id}
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Usa "Exportar Excel" para descargar el historial completo. Los estados se guardan automáticamente en la base de datos.
        </p>
      </div>
    </AdminLayout>
  );
}
