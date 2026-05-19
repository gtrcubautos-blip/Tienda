import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Config() {
  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground mt-1">Ajustes generales de la plataforma GTR CUBAUTO.</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Datos de la Tienda</CardTitle>
            <CardDescription>Información pública que se muestra a los clientes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre Comercial</Label>
              <Input defaultValue="GTR CUBAUTO" />
            </div>
            <div className="space-y-2">
              <Label>Teléfono de Contacto (Ventas Mayoristas)</Label>
              <Input defaultValue="+1 (809) 555-0199" />
            </div>
            <div className="space-y-2">
              <Label>Correo de Soporte</Label>
              <Input defaultValue="ventas@gtrcubauto.do" />
            </div>
            <div className="space-y-2">
              <Label>Dirección Física</Label>
              <Input defaultValue="Av. 27 de Febrero, Santo Domingo, RD" />
            </div>
            <div className="pt-2">
              <Button>Guardar Cambios</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Cambiar credenciales de acceso administrativo.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Contraseña Actual</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Nueva Contraseña</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nueva Contraseña</Label>
              <Input type="password" />
            </div>
            <div className="pt-2">
              <Button variant="outline">Actualizar Contraseña</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
