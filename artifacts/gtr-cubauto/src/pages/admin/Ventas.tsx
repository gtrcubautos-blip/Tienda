import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListOrders } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

export default function Ventas() {
  const { data: orders, isLoading } = useListOrders();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Registro de Ventas</h1>
            <p className="text-muted-foreground mt-1">Historial de órdenes retail y mayoristas.</p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-1 w-full md:w-48">
              <label className="text-xs font-medium text-muted-foreground">Filtrar por Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
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
                <SelectTrigger>
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
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Orden</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Cargando ventas...</TableCell>
                </TableRow>
              ) : filteredOrders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No hay ventas registradas con estos filtros.</TableCell>
                </TableRow>
              ) : (
                filteredOrders?.map(order => (
                  <TableRow key={order.id}>
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
                    <TableCell className="text-right font-bold text-emerald-500">
                      ${order.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
