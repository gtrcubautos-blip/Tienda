import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { useListProducts, useCreateOrder, getListProductsQueryKey } from "@workspace/api-client-react";
import { ShoppingCart, Wrench, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Piezas() {
  const { data: allProducts, isLoading } = useListProducts();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [checkoutProduct, setCheckoutProduct] = useState<typeof allProducts extends (infer T)[] | undefined ? T : never | null>(null);
  const [clientName, setClientName] = useState("");
  const [qty, setQty] = useState(1);
  const [search, setSearch] = useState("");

  const products = allProducts?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;
    createOrder.mutate(
      { data: { clientName: clientName || "Cliente Web", type: "retail", items: [{ productId: checkoutProduct.id, productName: checkoutProduct.name, qty, unitPrice: checkoutProduct.price }] } },
      {
        onSuccess: () => {
          toast({ title: "Orden confirmada", description: "Tu compra se registró automáticamente." });
          setCheckoutProduct(null); setClientName(""); setQty(1);
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        },
        onError: () => toast({ title: "Error", description: "No se pudo procesar la orden.", variant: "destructive" }),
      }
    );
  };

  const categories = [...new Set(allProducts?.map(p => p.category) ?? [])];

  return (
    <PublicLayout>
      {/* HERO */}
      <div className="relative h-72 md:h-96 overflow-hidden flex items-end">
        <img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&q=85&fit=crop" alt="Piezas" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.5) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(220,38,38,0.30) 0%, transparent 60%)" }} />
        <div className="relative z-10 container mx-auto px-6 pb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <span className="text-red-400 font-bold tracking-widest uppercase text-sm">Catálogo Completo</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">PIEZAS</h1>
          <p className="text-white/60 text-lg mt-2">Repuestos universales para autos y motos en un solo catálogo</p>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-zinc-900 border-b border-zinc-800 py-4 sticky top-16 z-30">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar pieza o categoría..."
              className="pl-9 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 w-full"
              data-testid="input-search-piezas"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 shrink-0">
            <span className="font-bold text-white">{products?.length ?? 0}</span> productos
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="bg-zinc-950 min-h-screen py-10">
        <div className="container mx-auto px-4">
          {/* Category pills */}
          {!search && (
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSearch(cat)}
                  className="px-3 py-1 rounded-full text-xs font-bold border border-zinc-700 text-zinc-300 hover:border-red-500 hover:text-red-400 transition-colors">
                  {cat}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-80 rounded-2xl bg-zinc-800 animate-pulse" />)}
            </div>
          ) : products?.length === 0 ? (
            <div className="text-center py-20 text-zinc-400 text-lg">No se encontraron productos.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products?.map(product => (
                <div key={product.id} data-testid={`card-pieza-${product.id}`}
                  className="group rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-red-500/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-red-500/10 flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden bg-zinc-800">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/500x400/1a0000/dc2626?text=${encodeURIComponent(product.name.slice(0,12))}`; }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/70 to-transparent" />
                    {product.stock < 5 && product.stock > 0 && (
                      <Badge className="absolute top-2 right-2 bg-red-600 text-white border-0 text-xs">Pocas unidades</Badge>
                    )}
                    {product.stock === 0 && (
                      <Badge className="absolute top-2 right-2 bg-zinc-700 text-zinc-300 border-0 text-xs">Agotado</Badge>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs text-red-500 font-bold uppercase tracking-widest mb-1">{product.category}</div>
                    <h3 className="text-white font-bold text-sm leading-snug mb-3 line-clamp-2 flex-1">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <div className="text-xl font-black text-red-500">${product.price.toFixed(2)}</div>
                        <div className="text-xs text-zinc-500">Stock: {product.stock}</div>
                      </div>
                      <Button size="sm" disabled={!product.stock} onClick={() => setCheckoutProduct(product as any)}
                        className="rounded-full px-3 bg-red-600 hover:bg-red-700 text-white border-0 text-xs">
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

      <Dialog open={!!checkoutProduct} onOpenChange={(open) => !open && setCheckoutProduct(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Confirmar Compra</DialogTitle>
            <DialogDescription className="text-zinc-400">Completa los datos para procesar tu orden de <strong className="text-white">{checkoutProduct?.name}</strong>.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-zinc-300">Nombre y Apellido</Label>
              <Input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Juan Pérez" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Cantidad</Label>
              <Input type="number" required min="1" max={checkoutProduct?.stock} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="flex justify-between items-center py-3 border-t border-zinc-800">
              <span className="text-zinc-300 font-semibold">Total:</span>
              <span className="text-2xl font-black text-red-500">${((checkoutProduct?.price ?? 0) * qty).toFixed(2)}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCheckoutProduct(null)} className="border-zinc-700 text-zinc-300">Cancelar</Button>
              <Button type="submit" disabled={createOrder.isPending} className="bg-red-600 hover:bg-red-700 text-white border-0">
                {createOrder.isPending ? "Procesando..." : "Confirmar Pago"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
