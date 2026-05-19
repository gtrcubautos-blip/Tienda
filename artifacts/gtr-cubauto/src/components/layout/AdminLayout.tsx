import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PackageSearch, DollarSign, Percent, ShoppingBag, Settings, LogOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventario", label: "Inventario", icon: PackageSearch },
  { href: "/admin/precios", label: "Precios", icon: DollarSign },
  { href: "/admin/descuentos", label: "Descuentos", icon: Percent },
  { href: "/admin/ventas", label: "Ventas", icon: ShoppingBag },
  { href: "/admin/social", label: "Redes Sociales", icon: Share2 },
  { href: "/admin/config", label: "Configuración", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isAuth = localStorage.getItem("gtr_admin_auth") === "true";
    if (!isAuth && location !== "/admin") {
      setLocation("/admin");
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("gtr_admin_auth");
    setLocation("/admin");
  };

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, []);

  return (
    <div className="min-h-[100dvh] flex bg-background text-foreground dark">
      <aside className="w-64 flex-col hidden md:flex border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border text-sidebar-primary">
          <PackageSearch className="h-6 w-6 mr-2" />
          <span className="font-bold text-lg">GTR Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"}`}>
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <Button variant="outline" className="w-full justify-start text-sidebar-foreground hover:text-sidebar-foreground/80 border-sidebar-border" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden bg-background">
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 md:hidden">
          <span className="font-bold text-lg text-primary">GTR Admin</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
