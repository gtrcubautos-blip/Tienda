import { ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, PackageSearch, DollarSign, Percent, ShoppingBag, Settings, LogOut, Share2, Paintbrush, Users, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/inventario", label: "Inventario", icon: PackageSearch },
  { href: "/admin/precios", label: "Precios", icon: DollarSign },
  { href: "/admin/descuentos", label: "Descuentos", icon: Percent },
  { href: "/admin/ventas", label: "Ventas", icon: ShoppingBag },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/social", label: "Redes Sociales", icon: Share2 },
  { href: "/admin/personalizacion", label: "Personalizar Sitio", icon: Paintbrush },
  { href: "/admin/config", label: "Configuración", icon: Settings },
];

const NEON = "#00ff41";

function NavList({ location, onNavigate, handleLogout }: { location: string; onNavigate?: () => void; handleLogout: () => void }) {
  return (
    <>
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-bold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full justify-start text-sidebar-foreground border-sidebar-border"
          onClick={() => { onNavigate?.(); handleLogout(); }}
        >
          <LogOut className="h-4 w-4 mr-2" /> Cerrar Sesión
        </Button>
      </div>
    </>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem("gtr_admin_auth") === "true";
    if (!isAuth && location !== "/admin") setLocation("/admin");
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("gtr_admin_auth");
    setLocation("/admin");
  };

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => { document.documentElement.classList.remove("dark"); };
  }, []);

  const currentLabel = navItems.find(n => n.href === location)?.label ?? "Admin";

  return (
    <div className="min-h-[100dvh] flex bg-background text-foreground dark">
      {/* Desktop sidebar */}
      <aside className="w-64 flex-col hidden md:flex border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border" style={{ color: NEON }}>
          <PackageSearch className="h-6 w-6 mr-2" />
          <span className="font-black text-lg tracking-tight">GTR Admin</span>
        </div>
        <NavList location={location} handleLogout={handleLogout} />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="p-0 w-72 max-w-[85vw] flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border"
        >
          <div className="h-16 flex items-center px-6 border-b border-sidebar-border shrink-0" style={{ color: NEON }}>
            <PackageSearch className="h-6 w-6 mr-2" />
            <span className="font-black text-lg tracking-tight">GTR Admin</span>
          </div>
          <NavList location={location} onNavigate={() => setMobileOpen(false)} handleLogout={handleLogout} />
        </SheetContent>
      </Sheet>

      <main className="flex-1 flex flex-col overflow-hidden bg-background min-w-0">
        {/* Mobile header */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-3 md:hidden shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-black text-base text-primary truncate">{currentLabel}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Cerrar sesión">
            <LogOut className="h-5 w-5" />
          </Button>
        </header>
        <div className="flex-1 overflow-auto p-3 sm:p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
