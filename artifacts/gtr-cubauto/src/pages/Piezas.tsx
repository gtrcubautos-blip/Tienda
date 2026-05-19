import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { ShoppingCart, Wrench, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { useSiteConfig } from "@/hooks/use-site-config";

const NEON = "#00ff41";

export default function Piezas() {
  const { data: allProducts, isLoading } = useListProducts();
  const config = useSiteConfig();
  const [checkoutProduct, setCheckoutProduct] = useState<{ id: number; name: string; price: number; stock: number } | null>(null);
  const [search, setSearch] = useState("");

  const products = allProducts?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );
  const categories = [...new Set(allProducts?.map(p => p.category) ?? [])];

  return (
    <PublicLayout>
      <div className="relative h-72 md:h-96 overflow-hidden flex items-end" style={{ background: "#000" }}>
        <img src={config.piezasImage} alt="Piezas" className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={e => { (e.target as HTMLImageElement).style.opacity = "0.05"; }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.97) 40%, rgba(0,0,0,0.6) 100%)" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${NEON}22 0%, transparent 60%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${NEON}, transparent)` }} />
        <div className="relative z-10 container mx-auto px-6 pb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center neon-glow" style={{ background: NEON }}>
              <Wrench className="h-5 w-5 text-black" />
            </div>
            <span className="font-black tracking-widest uppercase text-sm" style={{ color: NEON }}>Catálogo Completo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight" style={{ textShadow: `0 0 40px ${NEON}33` }}>PIEZAS</h1>
          <p className="text-lg mt-2" style={{ color: "#555" }}>Repuestos universales para autos y motos en un solo catálogo</p>
        </div>
      </div>

      {/* Search bar */}
      <div className="sticky top-16 z-30 py-3" style={{ background: "rgba(0,0,0,0.95)", borderBottom: `1px solid #00ff4120` }}>
        <div className="container mx-auto px-4 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "#444" }} />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar pieza o categoría..."
              className="pl-9 text-white placeholder:text-zinc-600 border-0 focus-visible:ring-1"
              style={{ background: "#111", borderColor: "#222" }}
              data-testid="input-search-piezas" />
          </div>
          <div className="text-sm shrink-0" style={{ color: "#444" }}>
            <span className="font-bold text-white">{products?.length ?? 0}</span> piezas
          </div>
        </div>
      </div>

      <div className="min-h-screen py-10" style={{ background: "#050505" }}>
        <div className="container mx-auto px-4">
          {!search && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSearch(cat)}
                  className="px-3 py-1 rounded-full text-xs font-bold border transition-colors"
                  style={{ borderColor: "#222", color: "#666", background: "transparent" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = NEON; e.currentTarget.style.color = NEON; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#666"; }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: "#111" }} />)}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 text-lg" style={{ color: "#555" }}>No se encontraron productos.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products?.map(product => (
                <div key={product.id} data-testid={`card-pieza-${product.id}`}
                  className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col"
                  style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${NEON}44`; e.currentTarget.style.boxShadow = `0 0 20px ${NEON}11`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div className="relative h-48 overflow-hidden" style={{ background: "#111" }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/500x400/000/00ff41?text=${encodeURIComponent(product.name.slice(0,10))}`; }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)" }} />
                    {product.stock < 5 && product.stock > 0 && <Badge className="absolute top-2 right-2 bg-red-600 text-white border-0 text-xs">Pocas unidades</Badge>}
                    {product.stock === 0 && <Badge className="absolute top-2 right-2 border-0 text-xs" style={{ background: "#222", color: "#666" }}>Agotado</Badge>}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "#444" }}>{product.category}</div>
                    <h3 className="text-white font-bold text-sm leading-snug mb-3 line-clamp-2 flex-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <div className="text-xl font-black neon-text" style={{ color: NEON }}>${product.price.toFixed(2)}</div>
                        <div className="text-xs" style={{ color: "#444" }}>Stock: {product.stock}</div>
                      </div>
                      <Button size="sm" disabled={!product.stock} onClick={() => setCheckoutProduct(product)}
                        className="rounded-full px-3 font-bold text-black border-0 text-xs"
                        style={{ background: product.stock ? NEON : "#222", color: product.stock ? "#000" : "#555" }}>
                        <ShoppingCart className="h-3 w-3 mr-1" /> Comprar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CheckoutDialog product={checkoutProduct} onClose={() => setCheckoutProduct(null)} />
    </PublicLayout>
  );
}
