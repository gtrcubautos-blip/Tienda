import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { Package, LogIn, Menu, X, Bike, Car, Wrench, Users, ShoppingCart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

const NEON = "#00ff41";
const NEON_BORDER = "#00ff4128";

const NAV_ITEMS = [
  { href: "/motos", label: "Motos", icon: Bike },
  { href: "/carros", label: "Carros", icon: Car },
  { href: "/piezas", label: "Piezas", icon: Wrench },
  { href: "/multiservicio", label: "Multiservicio", icon: Sparkles },
  { href: "/mayorista", label: "Mayorista", icon: Users },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems, setCartOpen } = useCart();

  return (
    <div className="min-h-[100dvh] flex flex-col" style={{ background: "#000", color: "#fff" }}>
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 w-full" style={{ background: "rgba(0,0,0,0.95)", borderBottom: `1px solid ${NEON_BORDER}`, backdropFilter: "blur(12px)" }}>
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center neon-glow" style={{ background: NEON }}>
              <Package className="h-4 w-4 text-black" />
            </div>
            <span className="font-black text-lg tracking-tight">
              GTR <span className="neon-text" style={{ color: NEON }}>CUBAUTO</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = location === href;
              return (
                <Link key={href} href={href} data-testid={`nav-${label.toLowerCase()}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                  style={{
                    color: isActive ? "#000" : "rgba(255,255,255,0.55)",
                    background: isActive ? NEON : "transparent",
                    boxShadow: isActive ? `0 0 12px ${NEON}66` : "none",
                  }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = NEON; e.currentTarget.style.background = `${NEON}12`; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = "rgba(255,255,255,0.55)"; e.currentTarget.style.background = "transparent"; } }}
                >
                  <Icon className="h-3.5 w-3.5" />{label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Cart icon */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              data-testid="btn-cart"
              className="relative flex items-center justify-center w-9 h-9 rounded-full border transition-all"
              style={{ borderColor: totalItems > 0 ? NEON : NEON_BORDER, background: totalItems > 0 ? `${NEON}15` : "transparent", color: totalItems > 0 ? NEON : "rgba(255,255,255,0.5)" }}
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black text-black"
                  style={{ background: NEON }}>
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </button>

            <Button variant="outline" size="sm" asChild className="hidden md:flex font-semibold"
              style={{ borderColor: NEON_BORDER, color: "rgba(255,255,255,0.6)", background: "transparent" }}>
              <Link href="/admin" data-testid="link-admin">
                <LogIn className="h-4 w-4 mr-1.5" /> Admin
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" style={{ color: "#fff" }} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden px-4 py-3 space-y-1 max-h-[calc(100dvh-4rem)] overflow-y-auto" style={{ background: "#050505", borderTop: `1px solid ${NEON_BORDER}` }}>
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold"
                style={{ color: location === href ? "#000" : "rgba(255,255,255,0.65)", background: location === href ? NEON : "transparent" }}
              >
                <Icon className="h-4 w-4" />{label}
              </Link>
            ))}
            <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm" style={{ color: "#555" }}>
              <LogIn className="h-4 w-4" /> Acceso Admin
            </Link>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="py-8" style={{ background: "#050505", borderTop: `1px solid ${NEON_BORDER}` }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: NEON }}>
                <Package className="h-3.5 w-3.5 text-black" />
              </div>
              <span className="font-black">GTR <span className="neon-text" style={{ color: NEON }}>CUBAUTO</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm" style={{ color: "#444" }}>
              {NAV_ITEMS.map(({ href, label }) => (
                <Link key={href} href={href} className="transition-colors" style={{ color: "#444" }}
                  onMouseEnter={e => (e.currentTarget.style.color = NEON)}
                  onMouseLeave={e => (e.currentTarget.style.color = "#444")}
                >{label}</Link>
              ))}
            </div>
            <p className="text-xs" style={{ color: "#333" }}>© {new Date().getFullYear()} GTR CUBAUTO — Cuba</p>
          </div>
        </div>
      </footer>

      {/* Global cart drawer */}
      <CartDrawer />
    </div>
  );
}
