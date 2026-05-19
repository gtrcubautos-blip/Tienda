import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { ShoppingCart, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckoutDialog } from "@/components/CheckoutDialog";

export default function Carros() {
  const { data: allProducts, isLoading } = useListProducts();
  const products = allProducts?.filter(p => !p.category.startsWith("Motos"));
  const [checkoutProduct, setCheckoutProduct] = useState<{ id: number; name: string; price: number; stock: number } | null>(null);

  return (
    <PublicLayout>
      {/* HERO */}
      <div className="relative h-72 md:h-96 overflow-hidden flex items-end">
        <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=85&fit=crop" alt="Carros" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.90) 40%, rgba(0,0,0,0.5) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(29,78,216,0.35) 0%, transparent 60%)" }} />
        <div className="relative z-10 container mx-auto px-6 pb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#1d4ed8" }}>
              <Car className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold tracking-widest uppercase text-sm" style={{ color: "#60a5fa" }}>Categoría</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">CARROS</h1>
          <p className="text-white/60 text-lg mt-2">Repuestos de calidad para todo tipo de automóviles</p>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="min-h-screen py-12" style={{ background: "#05050d" }}>
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 rounded-2xl animate-pulse" style={{ background: "#111827" }} />)}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 text-lg">No hay productos de carros disponibles.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map(product => (
                <div key={product.id} data-testid={`card-carro-${product.id}`}
                  className="group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
                  style={{ background: "#0d1117", borderColor: "#1f2937" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#1d4ed8")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#1f2937")}
                >
                  <div className="relative h-52 overflow-hidden" style={{ background: "#111827" }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/500x400/020617/3b82f6?text=${encodeURIComponent(product.name.slice(0,12))}`; }} />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,17,23,0.8) 0%, transparent 60%)" }} />
                    {product.stock < 5 && product.stock > 0 && <Badge className="absolute top-3 right-3 bg-red-600 text-white border-0">Últimas unidades</Badge>}
                    {product.stock === 0 && <Badge className="absolute top-3 right-3 border-0" style={{ background: "#374151", color: "#9ca3af" }}>Agotado</Badge>}
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#60a5fa" }}>{product.category}</div>
                    <h3 className="text-white font-bold text-base leading-tight mb-3 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black" style={{ color: "#3b82f6" }}>${product.price.toFixed(2)}</div>
                        <div className="text-xs" style={{ color: "#4b5563" }}>Stock: {product.stock}</div>
                      </div>
                      <Button size="sm" disabled={!product.stock} onClick={() => setCheckoutProduct(product)}
                        className="rounded-full px-4 text-white border-0" style={{ background: "#1d4ed8" }}>
                        <ShoppingCart className="h-4 w-4 mr-1" /> Comprar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CheckoutDialog
        product={checkoutProduct}
        onClose={() => setCheckoutProduct(null)}
        accentColor="#1d4ed8"
        accentColorLight="#1d4ed822"
      />
    </PublicLayout>
  );
}
