import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useListWholesaleProducts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Mayorista() {
  const { data: products, isLoading } = useListWholesaleProducts();

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white border-b-4 border-primary">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl flex flex-col gap-4">
            <Badge className="w-fit bg-primary/20 text-primary hover:bg-primary/20 border-primary/50 text-sm px-3 py-1">Para Distribuidores y Talleres</Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Mercado Mayorista
            </h1>
            <p className="text-lg text-slate-300">
              Compra en volumen y maximiza tus ganancias. Nuestro programa mayorista ofrece escalas de precios diseñadas para talleres mecánicos, revendedores y flotillas.
            </p>
            <div className="mt-4">
              <Button size="lg" className="text-lg gap-2">
                <Phone className="w-5 h-5" />
                Contactar para Afiliación
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="w-8 h-8 text-primary" />
          <h2 className="text-2xl font-bold">Listado de Precios por Volumen</h2>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="h-16 bg-muted/50 rounded-t-xl" />
                <CardContent className="p-6">
                  <div className="h-24 bg-muted/30 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
             {products?.map(product => (
               <Card key={product.id} className="overflow-hidden">
                 <CardHeader className="bg-muted/30 border-b border-border py-4">
                   <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-md border flex items-center justify-center p-1 overflow-hidden shrink-0">
                          <img src={product.image} alt={product.name} className="object-contain w-full h-full" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">{product.name}</CardTitle>
                          <div className="text-sm text-muted-foreground">{product.category} | Stock: {product.stock}</div>
                        </div>
                     </div>
                     <div className="text-right">
                       <div className="text-sm text-muted-foreground">Precio Público</div>
                       <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent className="p-0">
                    <Table>
                      <TableHeader className="bg-muted/10">
                        <TableRow>
                          <TableHead>Volumen</TableHead>
                          <TableHead className="text-right">Precio Unitario</TableHead>
                          <TableHead className="text-right">Ahorro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.tiers.map((tier, idx) => {
                          const savings = ((product.price - tier.price) / product.price) * 100;
                          return (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{tier.label}</TableCell>
                              <TableCell className="text-right font-bold text-primary">${tier.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                  -{savings.toFixed(0)}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                 </CardContent>
               </Card>
             ))}
             {products?.length === 0 && (
               <div className="text-center py-12 text-muted-foreground">
                 No hay productos disponibles.
               </div>
             )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
