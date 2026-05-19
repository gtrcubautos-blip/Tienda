import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, DollarSign, Tags, ShoppingCart, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventario", label: "Inventario", icon: Package },
  { href: "/admin/precios", label: "Precios", icon: DollarSign },
  { href: "/admin/descuentos", label: "Descuentos", icon: Tags },
  { href: "/admin/ventas", label: "Ventas", icon: ShoppingCart },
  { href: "/admin/config", label: "Configuración", icon: Settings },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAdminAuth();

  return (
    <div className="w-64 border-r bg-sidebar text-sidebar-foreground flex flex-col h-screen fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-sidebar-primary rounded flex items-center justify-center">
            <span className="text-sidebar-primary-foreground font-bold text-xl">G</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">GTR Admin</span>
        </Link>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium",
              location === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-white"
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md transition-colors text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
