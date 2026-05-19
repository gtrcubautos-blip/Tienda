import { useState } from "react";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useListProducts, useCreateOrder, getListProductsQueryKey } from "@workspace/api-client-react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const { data: products, isLoading } = useListProducts();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [checkoutProduct, setCheckoutProduct] = useState<any>(null);
  const [clientName, setClientName] = useState("");
  const [qty, setQty] = useState(1);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutProduct) return;

    createOrder.mutate(
      {
        data: {
          clientName: clientName || "Cliente Retail",
          type: "retail",
          items: [{
            productId: checkoutProduct.id,
            productName: checkoutProduct.name,
            qty: qty,
            unitPrice: checkoutProduct.price
          }]
        }
      },
      {
        onSuccess: () => {
          toast({ title: "Orden confirmada", description: "Tu compra se ha procesado exitosamente." });
          setCheckoutProduct(null);
          setClientName("");
          setQty(1);
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
        },
        onError: () => {
          toast({ title: "Error", description: "No se pudo procesar la orden.", variant: "destructive" });
        }
      }
    );
  };

  return (
    <PublicLayout>
      <div className="relative bg-zinc-950 text-white overflow-hidden">
        <div className="absolute inset-0 bg-primary/10" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
              Piezas de Auto Profesionales <span className="text-primary">Al Instante</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-lg">
              La tienda de repuestos automotrices más confiable de la República Dominicana. Inventario masivo, entregas rápidas y precios competitivos para tu taller.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8" onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>
                Ver Ofertas
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div id="catalog" className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h2>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <Card key={i} className="animate-pulse border-border">
                <div className="aspect-square bg-muted rounded-t-xl" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products?.map(product => (
              <Card key={product.id} className="overflow-hidden group flex flex-col h-full border-border">
                <div className="aspect-square relative bg-white flex items-center justify-center p-4">
                  <img 
                    src={product.image || "https://via.placeholder.com/300"} 
                    alt={product.name}
                    className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                  />
                  {!product.stock && (
                     <Badge variant="destructive" className="absolute top-2 right-2">Agotado</Badge>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="text-sm text-muted-foreground mb-1">{product.category}</div>
                  <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                  <div className="mt-auto">
                    <div className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button 
                    className="w-full" 
                    disabled={!product.stock} 
                    variant={product.stock ? "default" : "secondary"}
                    onClick={() => setCheckoutProduct(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {product.stock ? "Comprar Ahora" : "Sin Stock"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
            {products?.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                No hay productos disponibles en este momento.
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!checkoutProduct} onOpenChange={(open) => !open && setCheckoutProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Compra</DialogTitle>
            <DialogDescription>
              Completa los detalles para procesar tu orden de <strong>{checkoutProduct?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nombre y Apellido</Label>
              <Input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <Input type="number" required min="1" max={checkoutProduct?.stock} value={qty} onChange={e => setQty(parseInt(e.target.value) || 1)} />
              <p className="text-xs text-muted-foreground">Stock disponible: {checkoutProduct?.stock}</p>
            </div>
            <div className="flex justify-between items-center py-2 border-t mt-4">
              <span className="font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">${(checkoutProduct?.price * qty).toFixed(2)}</span>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCheckoutProduct(null)}>Cancelar</Button>
              <Button type="submit" disabled={createOrder.isPending}>Confirmar Pago</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
