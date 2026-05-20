import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { ShoppingCart, Car, Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckoutDialog } from "@/components/CheckoutDialog";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useCart } from "@/contexts/CartContext";

const NEON = "#00ff41";

export default function Carros() {
  const { data: allProducts, isLoading } = useListProducts();
  const config = useSiteConfig();
  const products = allProducts?.filter(p => !p.category.startsWith("Motos"));
  const [checkoutProduct, setCheckoutProduct] = useState<{ id: number; name: string; price: number; stock: number } | null>(null);
  const { addItem, isInCart } = useCart();

  return (
    <PublicLayout>
      <div className="relative h-72 md:h-96 overflow-hidden flex items-end" style={{ background: "#000" }}>
        <img src={config.carrosImage} alt="Carros" className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={e => { (e.target as HTMLImageElement).style.opacity = "0.05"; }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.97) 40%, rgba(0,0,0,0.6) 100%)" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${NEON}22 0%, transparent 60%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${NEON}, transparent)` }} />
        <div className="relative z-10 container mx-auto px-6 pb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center neon-glow" style={{ background: NEON }}>
              <Car className="h-5 w-5 text-black" />
            </div>
            <span className="font-black tracking-widest uppercase text-sm" style={{ color: NEON }}>Categoría · Carros</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white tracking-tight" style={{ textShadow: `0 0 40px ${NEON}33` }}>CARROS</h1>
          <p className="text-lg mt-2" style={{ color: "#555" }}>Repuestos de calidad para todo tipo de automóviles</p>
        </div>
      </div>

      <div className="min-h-screen py-12" style={{ background: "#050505" }}>
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: "#111" }} />)}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 text-lg" style={{ color: "#555" }}>No hay productos de carros disponibles.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {products?.map(product => (
                <div key={product.id} data-testid={`card-carro-${product.id}`}
                  className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = `${NEON}44`; e.currentTarget.style.boxShadow = `0 0 20px ${NEON}11`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#1a1a1a"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div className="relative h-40 sm:h-52 overflow-hidden" style={{ background: "#111" }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/500x400/000/00ff41?text=${encodeURIComponent(product.name.slice(0,10))}`; }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" }} />
                    {product.stock < 5 && product.stock > 0 && <Badge className="absolute top-3 right-3 bg-red-600 text-white border-0">Pocas unidades</Badge>}
                    {product.stock === 0 && <Badge className="absolute top-3 right-3 border-0" style={{ background: "#222", color: "#666" }}>Agotado</Badge>}
                  </div>
                  <div className="p-3 sm:p-5">
                    <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 truncate" style={{ color: "#444" }}>{product.category}</div>
                    <h3 className="text-white font-bold text-sm sm:text-base leading-tight mb-2 sm:mb-3 line-clamp-2">{product.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <div className="text-lg sm:text-2xl font-black neon-text truncate" style={{ color: NEON }}>${product.price.toFixed(2)}</div>
                        <div className="text-[10px] sm:text-xs" style={{ color: "#444" }}>Stock: {product.stock}</div>
                      </div>
                      <Button size="sm" disabled={!product.stock} onClick={() => setCheckoutProduct(product)}
                        className="w-full sm:w-auto rounded-full px-3 sm:px-4 font-bold text-black border-0 neon-glow text-xs sm:text-sm"
                        style={{ background: product.stock ? NEON : "#222", color: product.stock ? "#000" : "#555" }}>
                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" /> Comprar
                      </Button>
                    </div>
                    {product.stock > 0 && (
                      <button
                        type="button"
                        onClick={() => addItem({ id: product.id, name: product.name, price: product.price, stock: product.stock, image: product.image, category: product.category })}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border text-xs font-bold transition-all"
                        style={{
                          borderColor: isInCart(product.id) ? `${NEON}66` : "#222",
                          background: isInCart(product.id) ? `${NEON}10` : "transparent",
                          color: isInCart(product.id) ? NEON : "#555",
                        }}
                      >
                        {isInCart(product.id) ? <><Check className="h-3.5 w-3.5" /> En el carrito</> : <><Plus className="h-3.5 w-3.5" /> Agregar al carrito</>}
                      </button>
                    )}
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
