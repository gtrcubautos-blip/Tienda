import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useListProducts } from "@workspace/api-client-react";
import { ShoppingCart, Bike } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckoutDialog } from "@/components/CheckoutDialog";

const MOTO_PREFIX = "Motos";

export default function Motos() {
  const { data: allProducts, isLoading } = useListProducts();
  const products = allProducts?.filter(p => p.category.startsWith(MOTO_PREFIX));
  const [checkoutProduct, setCheckoutProduct] = useState<{ id: number; name: string; price: number; stock: number } | null>(null);

  return (
    <PublicLayout>
      {/* HERO */}
      <div className="relative h-72 md:h-96 overflow-hidden flex items-end">
        <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1400&q=85&fit=crop" alt="Motos" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.5) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(230,92,30,0.35) 0%, transparent 60%)" }} />
        <div className="relative z-10 container mx-auto px-6 pb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <span className="text-orange-400 font-bold tracking-widest uppercase text-sm">Categoría</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">MOTOS</h1>
          <p className="text-white/60 text-lg mt-2">Repuestos y accesorios especializados para motocicletas</p>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="bg-zinc-950 min-h-screen py-12">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-80 rounded-2xl bg-zinc-800 animate-pulse" />)}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 text-lg">No hay productos de motos disponibles.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products?.map(product => (
                <div key={product.id} data-testid={`card-moto-${product.id}`} className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-orange-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10">
                  <div className="relative h-52 overflow-hidden bg-zinc-800">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/500x400/1a0a00/e65c1e?text=${encodeURIComponent(product.name.slice(0,12))}`; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                    {product.stock < 5 && product.stock > 0 && <Badge className="absolute top-3 right-3 bg-red-600 text-white border-0">Últimas unidades</Badge>}
                    {product.stock === 0 && <Badge className="absolute top-3 right-3 bg-zinc-700 text-zinc-300 border-0">Agotado</Badge>}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-orange-500 font-bold uppercase tracking-widest mb-1">{product.category.replace("Motos - ", "")}</div>
                    <h3 className="text-white font-bold text-base leading-tight mb-3 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black text-orange-500">${product.price.toFixed(2)}</div>
                        <div className="text-xs text-zinc-500">Stock: {product.stock}</div>
                      </div>
                      <Button size="sm" disabled={!product.stock} onClick={() => setCheckoutProduct(product)}
                        className="rounded-full px-4 bg-orange-500 hover:bg-orange-600 text-white border-0">
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
        accentColor="#e65c1e"
        accentColorLight="#e65c1e22"
      />
    </PublicLayout>
  );
}
