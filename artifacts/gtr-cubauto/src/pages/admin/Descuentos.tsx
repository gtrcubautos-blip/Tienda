import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListDiscounts, useCreateDiscount, useUpdateDiscount, useDeleteDiscount, getListDiscountsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function Descuentos() {
  const { data: discounts, isLoading } = useListDiscounts();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createDiscount = useCreateDiscount();
  const updateDiscount = useUpdateDiscount();
  const deleteDiscount = useDeleteDiscount();

  const [isAddOpen, setIsAddOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "percentage" as any,
    value: 0,
    active: true,
    appliesTo: "all" as any,
    category: "",
    minAmount: 0,
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDiscount.mutate(
      { data: formData },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDiscountsQueryKey() });
          setIsAddOpen(false);
          toast({ title: "Descuento creado", description: "La regla de descuento se ha creado." });
          setFormData({ name: "", code: "", type: "percentage", value: 0, active: true, appliesTo: "all", category: "", minAmount: 0 });
        }
      }
    );
  };

  const toggleActive = (discount: any) => {
    updateDiscount.mutate(
      { id: discount.id, data: { active: !discount.active } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDiscountsQueryKey() });
          toast({ title: "Estado actualizado", description: "El estado del descuento se ha cambiado." });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de eliminar este descuento?")) {
      deleteDiscount.mutate(
        { id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListDiscountsQueryKey() });
            toast({ title: "Descuento eliminado", description: "La regla ha sido eliminada." });
          }
        }
      );
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Descuentos</h1>
            <p className="text-muted-foreground mt-1">Gestión de cupones y reglas de descuento.</p>
          </div>
          
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Regla
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Descuento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nombre de la Regla</Label>
                  <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Código (Opcional)</Label>
                  <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} placeholder="Ej. VERANO2025" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                        <SelectItem value="fixed">Monto Fijo ($)</SelectItem>
                        <SelectItem value="wholesale_tier">Escala Mayorista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor</Label>
                    <Input type="number" required min="0" step={formData.type === 'percentage' ? "1" : "0.01"} value={formData.value} onChange={e => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Aplica a</Label>
                    <Select value={formData.appliesTo} onValueChange={(v: any) => setFormData({ ...formData, appliesTo: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todo</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="wholesale">Mayorista</SelectItem>
                        <SelectItem value="category">Categoría</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Monto Mínimo ($)</Label>
                    <Input type="number" required min="0" value={formData.minAmount} onChange={e => setFormData({ ...formData, minAmount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                {formData.appliesTo === "category" && (
                  <div className="space-y-2">
                    <Label>Categoría Objetivo</Label>
                    <Input required value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                  </div>
                )}
                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="active" checked={formData.active} onCheckedChange={checked => setFormData({ ...formData, active: checked })} />
                  <Label htmlFor="active">Activar inmediatamente</Label>
                </div>
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={createDiscount.isPending}>Crear Regla</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Regla</TableHead>
                <TableHead>Aplica A</TableHead>
                <TableHead>Mínimo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Cargando descuentos...</TableCell>
                </TableRow>
              ) : discounts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No hay reglas de descuento configuradas.</TableCell>
                </TableRow>
              ) : (
                discounts?.map(discount => (
                  <TableRow key={discount.id} className={!discount.active ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{discount.name}</TableCell>
                    <TableCell>{discount.code ? <Badge variant="outline" className="font-mono">{discount.code}</Badge> : <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell>
                      {discount.type === 'percentage' ? `${discount.value}% OFF` : 
                       discount.type === 'fixed' ? `$${discount.value} OFF` : 'Mayorista'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {discount.appliesTo}
                        {discount.category ? `: ${discount.category}` : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>${discount.minAmount}</TableCell>
                    <TableCell>
                      <Switch checked={discount.active} onCheckedChange={() => toggleActive(discount)} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(discount.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
