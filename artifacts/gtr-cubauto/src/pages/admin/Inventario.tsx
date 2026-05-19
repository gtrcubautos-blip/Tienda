import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function Inventario() {
  const { data: products, isLoading } = useListProducts();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    stock: 0,
    price: 0,
    wholesalePrice: 0,
    minWholesaleQty: 0,
    image: "",
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate(
      { data: { ...formData, description: "" } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsAddOpen(false);
          toast({ title: "Producto creado", description: "El producto se ha creado correctamente." });
          setFormData({ name: "", category: "", stock: 0, price: 0, wholesalePrice: 0, minWholesaleQty: 0, image: "" });
        }
      }
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    
    updateProduct.mutate(
      { id: editingId, data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setEditingId(null);
          toast({ title: "Producto actualizado", description: "El producto se ha actualizado." });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
            toast({ title: "Producto eliminado", description: "El producto ha sido eliminado." });
          }
        }
      );
    }
  };

  const openEdit = (product: any) => {
    setFormData({
      name: product.name,
      category: product.category,
      stock: product.stock,
      price: product.price,
      wholesalePrice: product.wholesalePrice,
      minWholesaleQty: product.minWholesaleQty,
      image: product.image,
    });
    setEditingId(product.id);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
            <p className="text-muted-foreground mt-1">Gestión de productos y existencias.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Producto</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <Input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input type="number" required min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Precio Retail ($)</Label>
                    <Input type="number" required min="0" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio Mayorista ($)</Label>
                    <Input type="number" required min="0" step="0.01" value={formData.wholesalePrice} onChange={e => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Min. Cantidad Mayorista</Label>
                  <Input type="number" required min="1" value={formData.minWholesaleQty} onChange={e => setFormData({ ...formData, minWholesaleQty: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="space-y-2">
                  <Label>URL de Imagen</Label>
                  <Input required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createProduct.isPending}>Guardar Producto</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Img</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Cargando inventario...</TableCell>
                </TableRow>
              ) : products?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No hay productos en el inventario.</TableCell>
                </TableRow>
              ) : (
                products?.map(product => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-10 h-10 bg-white rounded border flex items-center justify-center p-1">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right">
                      <span className={product.stock <= 5 ? "text-destructive font-bold" : ""}>
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={editingId === product.id} onOpenChange={(open) => {
                          if (open) openEdit(product);
                          else setEditingId(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon"><Pencil className="w-4 h-4" /></Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Editar Producto</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleEditSubmit} className="space-y-4">
                              <div className="space-y-2">
                                <Label>Nombre</Label>
                                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Categoría</Label>
                                  <Input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Stock</Label>
                                  <Input type="number" required min="0" value={formData.stock} onChange={e => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label>URL de Imagen</Label>
                                <Input required value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                              </div>
                              <div className="pt-4 flex justify-end">
                                <Button type="submit" disabled={updateProduct.isPending}>Actualizar</Button>
                              </div>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
