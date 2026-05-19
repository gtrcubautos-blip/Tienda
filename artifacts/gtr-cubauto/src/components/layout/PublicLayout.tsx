import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Package, LogIn, Menu, X, Bike, Car, Wrench, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/motos", label: "Motos", icon: Bike, color: "#e65c1e" },
  { href: "/carros", label: "Carros", icon: Car, color: "#1d4ed8" },
  { href: "/piezas", label: "Piezas", icon: Wrench, color: "#dc2626" },
  { href: "/mayorista", label: "Mayorista", icon: Users, color: "#10b981" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#0a0a0f", color: "#f9fafb" }}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b" style={{ background: "rgba(10,10,15,0.95)", borderColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-lg tracking-tight text-white">GTR <span className="text-orange-500">CUBAUTO</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => {
              const isActive = location === href;
              return (
                <Link key={href} href={href} data-testid={`nav-${label.toLowerCase()}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    color: isActive ? color : "rgba(255,255,255,0.55)",
                    background: isActive ? `${color}18` : "transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = color; e.currentTarget.style.background = `${color}10`; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; } }}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild className="hidden md:flex border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800">
              <Link href="/admin" data-testid="link-admin">
                <LogIn className="h-4 w-4 mr-1.5" /> Admin
              </Link>
            </Button>
            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#0d0d14" }}>
            {NAV_ITEMS.map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{ color: location === href ? color : "rgba(255,255,255,0.65)", background: location === href ? `${color}15` : "transparent" }}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400">
              <LogIn className="h-4 w-4" /> Acceso Admin
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-8" style={{ borderColor: "rgba(255,255,255,0.07)", background: "#050508" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center">
                <Package className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-black text-white">GTR <span className="text-orange-500">CUBAUTO</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              {NAV_ITEMS.map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-white transition-colors">{label}</Link>
              ))}
            </div>
            <p className="text-xs text-zinc-600">© {new Date().getFullYear()} GTR CUBAUTO — Cuba. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
