import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders, getListOrdersQueryKey } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function Ventas() {
  const { data: orders, isLoading } = useListOrders();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [exporting, setExporting] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/15 text-emerald-500 border-emerald-500/20";
      case "pending": return "bg-amber-500/15 text-amber-500 border-amber-500/20";
      case "cancelled": return "bg-destructive/15 text-destructive border-destructive/20";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed": return "Completado";
      case "pending": return "Pendiente";
      case "cancelled": return "Cancelado";
      default: return status;
    }
  };

  const filteredOrders = orders?.filter(order => {
    if (typeFilter !== "all" && order.type !== typeFilter) return false;
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    return true;
  });

  const totalFilteredValue = filteredOrders?.reduce((acc, order) => acc + order.total, 0) || 0;

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
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({ title: "Excel exportado", description: "El archivo de ventas se descargó correctamente." });
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
            <h1 className="text-3xl font-bold tracking-tight">Registro de Ventas</h1>
            <p className="text-muted-foreground mt-1">Historial de órdenes retail y mayoristas. Todas las compras se registran automáticamente.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() })}
              data-testid="button-refresh-orders"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleExportExcel}
              disabled={exporting}
              data-testid="button-export-excel"
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting ? "Exportando..." : "Exportar a Excel"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Órdenes</div>
              <div className="text-2xl font-bold">{orders?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Retail</div>
              <div className="text-2xl font-bold">{orders?.filter(o => o.type === "retail").length ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Mayorista</div>
              <div className="text-2xl font-bold">{orders?.filter(o => o.type === "wholesale").length ?? 0}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Ingresos</div>
              <div className="text-2xl font-bold text-emerald-500">${(orders?.reduce((s, o) => s + o.total, 0) ?? 0).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1 w-full md:w-48">
              <label className="text-xs font-medium text-muted-foreground">Filtrar por Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-type-filter">
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Mayorista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1 w-full md:w-48">
              <label className="text-xs font-medium text-muted-foreground">Filtrar por Estado</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status-filter">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-right">
              <div className="text-xs font-medium text-muted-foreground">Total Filtrado</div>
              <div className="text-2xl font-bold text-emerald-500">${totalFilteredValue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        <div className="border rounded-md overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Orden</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Cargando ventas...</TableCell>
                </TableRow>
              ) : filteredOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay ventas registradas con estos filtros.</TableCell>
                </TableRow>
              ) : (
                filteredOrders?.map(order => (
                  <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                    <TableCell className="font-medium font-mono text-xs text-muted-foreground">#{order.id.toString().padStart(6, '0')}</TableCell>
                    <TableCell>{format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell className="font-medium">{order.clientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={order.type === 'wholesale' ? "border-primary text-primary" : ""}>
                        {order.type === 'wholesale' ? 'Mayorista' : 'Retail'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-amber-500">
                      {order.discountApplied ? `-$${order.discountApplied.toFixed(2)}` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-500">
                      ${order.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Todas las compras se registran automáticamente. Usa "Exportar a Excel" para descargar el historial completo en formato .xlsx
        </p>
      </div>
    </AdminLayout>
  );
}
