import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Package, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Package className="h-6 w-6" />
            <span>GTR CUBAUTO</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
              Catálogo Retail
            </Link>
            <Link href="/mayorista" className={`text-sm font-medium transition-colors hover:text-primary ${location === "/mayorista" ? "text-primary" : "text-muted-foreground"}`}>
              Mercado Mayorista
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin">
                <LogIn className="h-4 w-4 mr-2" />
                Acceso Admin
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card py-6 md:py-0">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between md:h-16 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} GTR CUBAUTO. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
