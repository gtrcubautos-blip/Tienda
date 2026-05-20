import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListWholesaleProducts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Building2, UserPlus, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { WholesaleRegisterModal, isWholesaleRegistered } from "@/components/WholesaleRegisterModal";

const NEON = "#00ff41";
const NEON_DIM = "#00ff4115";
const NEON_BORDER = "#00ff4130";

export default function Mayorista() {
  const { data: products, isLoading } = useListWholesaleProducts();
  const [registerOpen, setRegisterOpen] = useState(false);

  const alreadyRegistered = isWholesaleRegistered();
  const wholesaleData = (() => {
    try { return JSON.parse(localStorage.getItem("gtr_wholesale_registered") ?? "{}"); }
    catch { return {}; }
  })();

  return (
    <PublicLayout>
      {/* Hero */}
      <div className="relative overflow-hidden" style={{ background: "#000" }}>
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${NEON}08 0%, transparent 60%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${NEON}60, transparent)` }} />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="max-w-3xl flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center neon-glow" style={{ background: NEON }}>
                <Building2 className="h-6 w-6 text-black" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest"
                style={{ borderColor: NEON_BORDER, background: NEON_DIM, color: NEON }}>
                Para Distribuidores y Talleres
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight break-words" style={{ textShadow: `0 0 40px ${NEON}22` }}>
              MERCADO<br /><span style={{ color: NEON }}>MAYORISTA</span>
            </h1>
            <p className="text-base sm:text-lg" style={{ color: "#666" }}>
              Compra en volumen y maximiza tus ganancias. Precios escalonados diseñados para talleres mecánicos, revendedores y flotillas en toda Cuba.
            </p>

            {alreadyRegistered ? (
              <div className="flex items-center gap-3 rounded-2xl border px-5 py-4 max-w-sm"
                style={{ borderColor: NEON_BORDER, background: NEON_DIM }}>
                <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: NEON }} />
                <div>
                  <p className="font-black text-white text-sm">Ya estás registrado como mayorista</p>
                  <p className="text-xs mt-0.5 font-mono" style={{ color: NEON }}>
                    Código: {wholesaleData.clientCode} · {wholesaleData.companyType}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3 mt-2">
                <Button
                  size="lg"
                  className="rounded-full px-8 font-black text-black border-0 neon-glow"
                  style={{ background: NEON }}
                  onClick={() => setRegisterOpen(true)}
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Registrarme como Mayorista
                </Button>
                <p className="self-center text-sm" style={{ color: "#555" }}>
                  Obtén tu código de cliente y accede a precios especiales.
                </p>
              </div>
            )}
          </div>

          {/* Benefits row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {[
              { icon: "📦", title: "Precios por Volumen", desc: "Escalas de descuento desde 5 unidades" },
              { icon: "🏢", title: "TCP y MiPyme", desc: "Registro especial para empresas registradas" },
              { icon: "🔑", title: "Código de Cliente", desc: "Número único para rastrear todos tus pedidos" },
            ].map(b => (
              <div key={b.title} className="rounded-2xl border p-5" style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}>
                <div className="text-2xl mb-2">{b.icon}</div>
                <p className="font-black text-white text-sm">{b.title}</p>
                <p className="text-xs mt-1" style={{ color: "#555" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Price list */}
      <div className="py-12" style={{ background: "#050505" }}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="w-6 h-6" style={{ color: NEON }} />
            <h2 className="text-2xl font-black text-white">Listado de Precios por Volumen</h2>
          </div>

          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 rounded-2xl animate-pulse" style={{ background: "#111" }} />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {products?.map(product => (
                <div key={product.id} className="rounded-2xl overflow-hidden border"
                  style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4 border-b"
                    style={{ borderColor: "#1a1a1a" }}>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: "#111" }}>
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-white font-black">{product.name}</CardTitle>
                        <div className="text-xs mt-0.5" style={{ color: "#555" }}>{product.category} · Stock: {product.stock}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs" style={{ color: "#555" }}>Precio Público</div>
                      <div className="text-lg font-black text-white">${product.price.toFixed(2)}</div>
                    </div>
                  </div>
                  {/* Mobile: card list */}
                  <div className="sm:hidden divide-y divide-[#1a1a1a]">
                    {product.tiers.map((tier, idx) => {
                      const savings = ((product.price - tier.price) / product.price) * 100;
                      return (
                        <div key={idx} className="flex items-center justify-between px-4 py-3 gap-3" style={{ borderColor: "#1a1a1a" }}>
                          <div className="min-w-0">
                            <div className="text-xs uppercase tracking-wide mb-0.5" style={{ color: "#555" }}>Volumen</div>
                            <div className="font-bold text-white text-sm truncate">{tier.label}</div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="font-black text-base leading-none" style={{ color: NEON }}>${tier.price.toFixed(2)}</div>
                            <span className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                              style={{ background: `${NEON}18`, color: NEON, border: `1px solid ${NEON}33` }}>
                              -{savings.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop: table */}
                  <div className="hidden sm:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow style={{ borderColor: "#1a1a1a" }}>
                          <TableHead style={{ color: "#555" }}>Volumen</TableHead>
                          <TableHead className="text-right" style={{ color: "#555" }}>Precio Unitario</TableHead>
                          <TableHead className="text-right" style={{ color: "#555" }}>Ahorro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.tiers.map((tier, idx) => {
                          const savings = ((product.price - tier.price) / product.price) * 100;
                          return (
                            <TableRow key={idx} style={{ borderColor: "#1a1a1a" }}>
                              <TableCell className="font-bold text-white">{tier.label}</TableCell>
                              <TableCell className="text-right font-black text-lg" style={{ color: NEON }}>${tier.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
                                  style={{ background: `${NEON}18`, color: NEON, border: `1px solid ${NEON}33` }}>
                                  -{savings.toFixed(0)}%
                                </span>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
              {products?.length === 0 && (
                <div className="text-center py-12" style={{ color: "#555" }}>
                  No hay productos disponibles.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <WholesaleRegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </PublicLayout>
  );
}
