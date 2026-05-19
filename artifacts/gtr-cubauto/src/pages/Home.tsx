import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck } from "lucide-react";

const CATEGORIES = [
  {
    href: "/motos",
    label: "Motos",
    subtitle: "Repuestos & Accesorios",
    description: "Aceites, cadenas, filtros, frenos y todo lo que necesita tu moto.",
    image: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&q=85&fit=crop",
    accent: "#e65c1e",
    badge: "MOTOS",
  },
  {
    href: "/carros",
    label: "Carros",
    subtitle: "Piezas Originales y Genéricas",
    description: "Motores, suspensión, frenos, eléctrico y mucho más para tu auto.",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900&q=85&fit=crop",
    accent: "#1d4ed8",
    badge: "CARROS",
  },
  {
    href: "/piezas",
    label: "Piezas Generales",
    subtitle: "Catálogo Completo",
    description: "Bujías, baterías, correas, filtros y repuestos universales para cualquier vehículo.",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=85&fit=crop",
    accent: "#dc2626",
    badge: "PIEZAS",
  },
];

const FEATURES = [
  { icon: Zap, label: "Despacho Rápido", desc: "Entrega en 24-48 h en toda Cuba" },
  { icon: Shield, label: "Garantía de Calidad", desc: "Todos los productos verificados" },
  { icon: Truck, label: "Envío Nacional", desc: "Llegamos a todas las provincias" },
];

export default function Home() {
  return (
    <PublicLayout>
      {/* HERO */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #1a0a00 50%, #0a0010 100%)" }}
      >
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600&q=60&fit=crop')", backgroundSize: "cover", backgroundPosition: "center" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.5) 100%)" }} />

        <div className="relative z-10 container mx-auto px-6 py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border border-orange-500/40 bg-orange-500/10">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 text-sm font-semibold tracking-widest uppercase">Tienda en Cuba</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-4">
              GTR<br />
              <span style={{ WebkitTextStroke: "2px #e65c1e", color: "transparent" }}>CUBAUTO</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-white/80 mb-3 tracking-wide uppercase">
              Repuestos de Calidad para Autos y Motos
            </p>
            <p className="text-base text-white/50 mb-10 max-w-xl">
              Todo para tu vehículo en un solo lugar. Los mejores repuestos y accesorios con garantía de calidad y los precios más competitivos.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-full font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/30">
                <Link href="/piezas">Ver Ofertas de la Semana <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 rounded-full font-bold border-white/20 text-white hover:bg-white/10">
                <Link href="/mayorista">Precios Mayorista</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-white text-xs tracking-widest uppercase">Explorar</span>
          <div className="w-px h-12 bg-white/40" />
        </div>
      </section>

      {/* CATEGORY CARDS */}
      <section className="bg-zinc-950 py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Nuestras <span className="text-orange-500">Categorías</span></h2>
            <p className="text-zinc-400 mt-2 text-lg">Selecciona la sección que necesitas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.href} href={cat.href} className="group relative overflow-hidden rounded-2xl cursor-pointer block" style={{ minHeight: 420 }}>
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)` }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${cat.accent}55 0%, transparent 60%)` }} />

                <div className="absolute top-5 left-5">
                  <span className="text-xs font-black tracking-widest px-3 py-1 rounded-full text-white" style={{ background: cat.accent }}>
                    {cat.badge}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-black tracking-tight mb-1">{cat.label}</h3>
                  <p className="text-sm font-semibold uppercase tracking-widest mb-2 opacity-70">{cat.subtitle}</p>
                  <p className="text-sm text-white/60 mb-4 leading-relaxed">{cat.description}</p>
                  <div className="flex items-center gap-2 font-bold text-sm group-hover:gap-4 transition-all" style={{ color: cat.accent }}>
                    Ver productos <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#0a0a0f" }} className="py-14 border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
                  <Icon className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{label}</div>
                  <div className="text-zinc-400 text-sm mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
