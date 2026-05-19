import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, Percent, Users, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();

  const metrics = [
    {
      title: "Ingresos Totales",
      value: summary ? `$${summary.totalRevenue.toFixed(2)}` : "",
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      title: "Ventas Hoy",
      value: summary ? `$${summary.revenueToday.toFixed(2)}` : "",
      icon: TrendingUp,
      color: "text-blue-500",
    },
    {
      title: "Órdenes Totales",
      value: summary?.totalOrders.toString(),
      icon: ShoppingBag,
      color: "text-primary",
    },
    {
      title: "Órdenes Retail",
      value: summary?.totalRetailOrders.toString(),
      icon: Users,
      color: "text-orange-400",
    },
    {
      title: "Órdenes Mayoristas",
      value: summary?.totalWholesaleOrders.toString(),
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Stock Total",
      value: summary?.totalStock.toString(),
      icon: Package,
      color: "text-cyan-500",
    },
    {
      title: "Productos con Bajo Stock",
      value: summary?.lowStockCount.toString(),
      icon: TrendingUp, // fallback
      color: "text-destructive",
    },
    {
      title: "Descuentos Activos",
      value: summary?.activeDiscounts.toString(),
      icon: Percent,
      color: "text-pink-500",
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Resumen del rendimiento de la tienda.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/3 mb-1" />
                </CardContent>
              </Card>
            ))
          ) : (
            metrics.map((metric, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {metric.title}
                  </CardTitle>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
