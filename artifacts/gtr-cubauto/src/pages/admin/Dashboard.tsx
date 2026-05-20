import { AdminLayout } from "@/components/layout/AdminLayout";
import { useGetDashboardSummary, useListOrders, useListProducts } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, Percent, Users, TrendingUp, AlertTriangle, BarChart3, Flame, TrendingDown, Minus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const NEON = "#00ff41";
const CHART_COLORS = ["#00ff41", "#00cc33", "#009922", "#fbbf24", "#ef4444", "#3b82f6", "#a855f7", "#f97316", "#06b6d4", "#ec4899"];

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

function DonutCard({ title, data, total, subtitle }: { title: string; data: { name: string; value: number }[]; total: number | string; subtitle?: string }) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{title}</CardTitle>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <div className="relative h-52">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={3} dataKey="value" strokeWidth={0}>
                {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#111", border: "1px solid #00ff4130", borderRadius: 8, color: "#fff", fontSize: 12 }}
                formatter={(val: number) => [val, ""]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-2xl font-black" style={{ color: NEON }}>{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 justify-center">
          {data.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-muted-foreground">{item.name}</span>
              <span className="font-bold text-foreground">{item.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: orders } = useListOrders();
  const { data: products } = useListProducts();

  // Compute chart data
  const salesByType = [
    { name: "Retail", value: orders?.filter(o => o.type === "retail").length ?? 0 },
    { name: "Mayorista", value: orders?.filter(o => o.type === "wholesale").length ?? 0 },
  ].filter(d => d.value > 0);

  const salesByStatus = [
    { name: "Completado", value: orders?.filter(o => o.status === "completed").length ?? 0 },
    { name: "Pendiente", value: orders?.filter(o => o.status === "pending").length ?? 0 },
    { name: "Cancelado", value: orders?.filter(o => o.status === "cancelled").length ?? 0 },
  ].filter(d => d.value > 0);

  // Products by category
  const categoryMap: Record<string, number> = {};
  products?.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1; });
  const productsByCategory = Object.entries(categoryMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Revenue by region
  const regionMap: Record<string, { count: number; revenue: number }> = {};
  orders?.forEach(o => {
    const r = parseRegion(o.clientName);
    if (!regionMap[r]) regionMap[r] = { count: 0, revenue: 0 };
    regionMap[r].count++;
    regionMap[r].revenue += o.total;
  });
  const regionData = Object.entries(regionMap)
    .map(([region, { count, revenue }]) => ({ region, count, revenue: Math.round(revenue * 100) / 100 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ── Demand tier classification ──
  type DemandTier = "alta" | "media" | "baja" | "nula";
  const soldUnitsMap: Record<number, number> = {};
  orders?.filter(o => o.status !== "cancelled").forEach(order => {
    const items = Array.isArray(order.items) ? order.items : [];
    items.forEach((item: { productId: number; qty: number }) => {
      soldUnitsMap[item.productId] = (soldUnitsMap[item.productId] ?? 0) + item.qty;
    });
  });

  const withSalesD = (products ?? [])
    .filter(p => soldUnitsMap[p.id] > 0)
    .map(p => ({ id: p.id, name: p.name, units: soldUnitsMap[p.id], tier: "alta" as DemandTier }))
    .sort((a, b) => b.units - a.units);
  const noSalesD = (products ?? [])
    .filter(p => !soldUnitsMap[p.id] && p.stock > 0)
    .map(p => ({ id: p.id, name: p.name, units: 0, tier: "nula" as DemandTier }));

  const nd = withSalesD.length;
  const altaCutD  = Math.ceil(nd * 0.33);
  const mediaCutD = Math.ceil(nd * 0.66);
  withSalesD.forEach((p, i) => {
    p.tier = i < altaCutD ? "alta" : i < mediaCutD ? "media" : "baja";
  });

  const demandTiers = {
    alta:  withSalesD.filter(p => p.tier === "alta"),
    media: withSalesD.filter(p => p.tier === "media"),
    baja:  withSalesD.filter(p => p.tier === "baja"),
    nula:  noSalesD,
  };

  const TCOL_D: Record<DemandTier, string> = { alta: "#00ff41", media: "#fbbf24", baja: "#f97316", nula: "#ef4444" };
  const TLAB_D: Record<DemandTier, string> = { alta: "Alta Demanda", media: "Demanda Media", baja: "Baja Demanda", nula: "Sin Movimiento" };

  // Side-by-side bar chart: top 6 high + bottom 6 low/nula
  const demandCompare = [
    ...demandTiers.alta.slice(0, 6).map(p => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name,
      units: p.units, tier: "alta",
    })),
    ...([...demandTiers.baja, ...demandTiers.nula]).slice(0, 6).map(p => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + "…" : p.name,
      units: p.units, tier: p.tier,
    })),
  ];

  const metrics = [
    { title: "Ingresos Totales", value: summary ? `$${summary.totalRevenue.toFixed(2)}` : "", icon: DollarSign, color: "text-primary" },
    { title: "Ventas Hoy", value: summary ? `$${summary.revenueToday.toFixed(2)}` : "", icon: TrendingUp, color: "text-primary" },
    { title: "Órdenes Totales", value: summary?.totalOrders.toString(), icon: ShoppingBag, color: "text-primary" },
    { title: "Retail", value: summary?.totalRetailOrders.toString(), icon: Users, color: "text-primary" },
    { title: "Mayorista", value: summary?.totalWholesaleOrders.toString(), icon: Package, color: "text-primary" },
    { title: "Stock Total", value: summary?.totalStock.toString(), icon: Package, color: "text-primary" },
    { title: "Bajo Stock", value: summary?.lowStockCount.toString(), icon: AlertTriangle, color: "text-destructive" },
    { title: "Descuentos Activos", value: summary?.activeDiscounts.toString(), icon: Percent, color: "text-amber-400" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Métricas y estadísticas de la tienda en tiempo real.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {isLoading ? Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4"><Skeleton className="h-6 w-12 mb-1" /><Skeleton className="h-4 w-16" /></CardContent>
            </Card>
          )) : metrics.map((m) => (
            <Card key={m.title} className="bg-card border-border">
              <CardContent className="p-3">
                <m.icon className={`h-3.5 w-3.5 mb-1 ${m.color}`} />
                <div className={`text-xl font-black ${m.color}`}>{m.value ?? "—"}</div>
                <div className="text-xs text-muted-foreground leading-tight mt-0.5">{m.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Row 2: Donut Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salesByType.length > 0 ? (
            <DonutCard
              title="Ventas por Tipo"
              subtitle="Retail vs Mayorista"
              data={salesByType}
              total={orders?.length ?? 0}
            />
          ) : (
            <Card className="bg-card border-border flex items-center justify-center min-h-60">
              <p className="text-muted-foreground text-sm">Sin datos de ventas</p>
            </Card>
          )}

          {salesByStatus.length > 0 ? (
            <DonutCard
              title="Estado de Órdenes"
              subtitle="Completadas, pendientes, canceladas"
              data={salesByStatus}
              total={orders?.length ?? 0}
            />
          ) : (
            <Card className="bg-card border-border flex items-center justify-center min-h-60">
              <p className="text-muted-foreground text-sm">Sin datos de estado</p>
            </Card>
          )}

          {productsByCategory.length > 0 ? (
            <DonutCard
              title="Productos por Categoría"
              subtitle="Distribución del catálogo"
              data={productsByCategory}
              total={products?.length ?? 0}
            />
          ) : (
            <Card className="bg-card border-border flex items-center justify-center min-h-60">
              <p className="text-muted-foreground text-sm">Sin datos de productos</p>
            </Card>
          )}
        </div>

        {/* Row 3: Region Revenue Bar Chart */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Ventas por Región</CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">Ingresos generados por provincia cubana</p>
          </CardHeader>
          <CardContent>
            {regionData.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                Las próximas compras mostrarán datos por región aquí.
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#666" }} axisLine={false} tickLine={false}
                      tickFormatter={v => `$${v}`} />
                    <YAxis type="category" dataKey="region" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} width={120} />
                    <Tooltip
                      contentStyle={{ background: "#111", border: "1px solid #00ff4130", borderRadius: 8, color: "#fff", fontSize: 12 }}
                      formatter={(val: number) => [`$${val.toFixed(2)}`, "Ingresos"]}
                    />
                    <Bar dataKey="revenue" radius={[0, 4, 4, 0]} fill={NEON}>
                      {regionData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Row 4: Demand Classification */}
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-black flex items-center gap-2" style={{ color: NEON }}>
              <BarChart3 className="h-4 w-4" /> Clasificación de Demanda — Productos
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clasificación automática basada en unidades vendidas · Solo visible con contraseña de administrador
            </p>
          </div>

          {/* Tier KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {([
              { tier: "alta" as DemandTier, icon: Flame },
              { tier: "media" as DemandTier, icon: Minus },
              { tier: "baja" as DemandTier, icon: TrendingDown },
              { tier: "nula" as DemandTier, icon: AlertTriangle },
            ]).map(({ tier, icon: Icon }) => (
              <Card key={tier} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: TCOL_D[tier] }} />
                    <span className="text-xs font-bold uppercase tracking-wide" style={{ color: TCOL_D[tier] }}>{TLAB_D[tier]}</span>
                  </div>
                  <div className="text-2xl font-black" style={{ color: TCOL_D[tier] }}>{demandTiers[tier].length}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {tier === "nula" ? "stock sin ventas" : tier === "alta" ? "top 33% del catálogo" : tier === "media" ? "demanda moderada" : "revisar precio/visib."}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison chart: top sellers vs low demand */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Top demand */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4" style={{ color: NEON }} />
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Alta Demanda — Top Productos</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {demandTiers.alta.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Sin ventas registradas aún.</div>
                ) : (
                  <div className="space-y-2">
                    {demandTiers.alta.slice(0, 8).map((p, i) => {
                      const maxU = demandTiers.alta[0]?.units ?? 1;
                      const pct = (p.units / maxU) * 100;
                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">#{i + 1}</span>
                          <span className="text-xs w-36 truncate shrink-0 text-white">{p.name.length > 22 ? p.name.slice(0, 22) + "…" : p.name}</span>
                          <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "#0d0d0d" }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: NEON }} />
                          </div>
                          <span className="text-xs font-black shrink-0 w-14 text-right" style={{ color: NEON }}>{p.units} uds.</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low / no demand */}
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Baja Demanda / Sin Movimiento</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {demandTiers.baja.length === 0 && demandTiers.nula.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">¡Todos los productos tienen demanda!</div>
                ) : (
                  <div className="space-y-2">
                    {[...demandTiers.baja, ...demandTiers.nula].slice(0, 8).map((p, i) => {
                      const color = TCOL_D[p.tier];
                      const label = p.tier === "nula" ? "Sin ventas" : `${p.units} uds.`;
                      return (
                        <div key={p.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                          style={{ background: p.tier === "nula" ? "#ef444408" : "#f9731608", border: `1px solid ${color}22` }}>
                          <span className="text-xs text-muted-foreground w-5 text-right shrink-0">#{i + 1}</span>
                          <span className="text-xs flex-1 truncate" style={{ color: "#ccc" }}>{p.name.length > 26 ? p.name.slice(0, 26) + "…" : p.name}</span>
                          <span className="text-xs font-black shrink-0" style={{ color }}>{label}</span>
                          <span className="text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0"
                            style={{ background: `${color}18`, color, border: `1px solid ${color}33` }}>
                            {p.tier === "nula" ? "Sin Movimiento" : "Baja Demanda"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Full demand bar chart */}
          {demandCompare.length > 0 && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                    Alta Demanda vs Baja Demanda — Comparativa
                  </CardTitle>
                </div>
                <div className="flex flex-wrap gap-3 mt-1">
                  {(["alta","baja","nula"] as DemandTier[]).map(t => (
                    <div key={t} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: TCOL_D[t] }} />
                      <span className="text-muted-foreground">{TLAB_D[t]}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={Math.max(demandCompare.length * 38 + 16, 120)}>
                  <BarChart data={demandCompare} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#666", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#888", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: "#111", border: "1px solid #333", borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: "#fff", fontWeight: 700 }}
                      formatter={(v: number) => [`${v} uds.`, "Unidades vendidas"]}
                    />
                    <Bar dataKey="units" radius={[0, 4, 4, 0]}>
                      {demandCompare.map((d, i) => (
                        <Cell key={i} fill={TCOL_D[d.tier as DemandTier]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Row 5: Region Stats Table */}
        {regionData.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Tabla de Ventas por Región</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Región / Provincia</th>
                      <th className="text-center py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Órdenes</th>
                      <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">Total Ingresos</th>
                      <th className="text-right py-3 px-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">% del Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {regionData.map((row, i) => {
                      const totalRev = regionData.reduce((s, r) => s + r.revenue, 0);
                      const pct = totalRev > 0 ? ((row.revenue / totalRev) * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={row.region} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                              {row.region}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-muted-foreground">{row.count}</td>
                          <td className="py-3 px-4 text-right font-black" style={{ color: NEON }}>${row.revenue.toFixed(2)}</td>
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
