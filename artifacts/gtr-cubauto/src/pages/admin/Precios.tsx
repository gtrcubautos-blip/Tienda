import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListProducts, useUpdateProductPrice, getListProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Check, X } from "lucide-react";

export default function Precios() {
  const { data: products, isLoading } = useListProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updatePrice = useUpdateProductPrice();
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    price: 0,
    wholesalePrice: 0,
    minWholesaleQty: 0,
  });

  const startEdit = (product: any) => {
    setEditingId(product.id);
    setFormData({
      price: product.price,
      wholesalePrice: product.wholesalePrice,
      minWholesaleQty: product.minWholesaleQty,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: number) => {
    updatePrice.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setEditingId(null);
          toast({ title: "Precios actualizados", description: "Los precios han sido guardados." });
        }
      }
    );
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Precios</h1>
          <p className="text-muted-foreground mt-1">Configura el precio público y las reglas de precio mayorista por producto.</p>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="w-[150px]">Precio Público</TableHead>
                <TableHead className="w-[150px]">Precio Mayorista</TableHead>
                <TableHead className="w-[150px]">Cant. Min. Mayorista</TableHead>
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando precios...</TableCell>
                </TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay productos en el inventario.</TableCell>
                </TableRow>
              ) : (
                products?.map(product => {
                  const isEditing = editingId === product.id;
                  
                  return (
                    <TableRow key={product.id} className={isEditing ? "bg-muted/50" : ""}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">$</span>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              className="h-8 w-full"
                              value={formData.price} 
                              onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} 
                            />
                          </div>
                        ) : (
                          <span>${product.price.toFixed(2)}</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">$</span>
                            <Input 
                              type="number" 
                              min="0" 
                              step="0.01" 
                              className="h-8 w-full"
                              value={formData.wholesalePrice} 
                              onChange={e => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })} 
                            />
                          </div>
                        ) : (
                          <span className="text-primary font-medium">${product.wholesalePrice.toFixed(2)}</span>
                        )}
                      </TableCell>
                      
                      <TableCell>
                        {isEditing ? (
                          <Input 
                            type="number" 
                            min="1" 
                            className="h-8 w-full"
                            value={formData.minWholesaleQty} 
                            onChange={e => setFormData({ ...formData, minWholesaleQty: parseInt(e.target.value) || 0 })} 
                          />
                        ) : (
                          <span>{product.minWholesaleQty} unds.</span>
                        )}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10" onClick={() => saveEdit(product.id)} disabled={updatePrice.isPending}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={cancelEdit}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startEdit(product)}>
                            Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
