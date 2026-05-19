import { Link } from "wouter";
import { ShoppingCart, LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">G</span>
          </div>
          <span className="font-bold text-xl tracking-tight hidden sm:inline-block">GTR CUBAUTO</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">
            Catálogo
          </Link>
          <Link href="/mayorista" className="text-sm font-medium transition-colors hover:text-primary">
            Mayoristas
          </Link>
          <Link href="/contacto" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/admin" className="hidden sm:flex">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              <span>Acceso Admin</span>
            </Button>
          </Link>
          <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline-block">Carrito (0)</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
