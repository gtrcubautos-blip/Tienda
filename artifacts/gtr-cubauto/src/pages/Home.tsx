import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Truck, Tag, Package, Clock } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";

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
    description: "Bujías, baterías, correas, filtros y repuestos universales.",
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=85&fit=crop",
    accent: "#dc2626",
    badge: "PIEZAS",
  },
];

const FEATURES = [
  { icon: Zap, label: "Despacho Rápido", desc: "Entrega en 24–48 h en toda Cuba" },
  { icon: Shield, label: "Garantía de Calidad", desc: "Todos los productos verificados" },
  { icon: Truck, label: "Envío Nacional", desc: "Llegamos a todas las provincias" },
];

const PROMOS = [
  { icon: Tag, label: "OFERTA SEMANA", text: "20% OFF en lubricantes selectos", color: "#e65c1e", bg: "#1a0a00" },
  { icon: Package, label: "NUEVO STOCK", text: "Kits de embrague desde $62.00", color: "#16a34a", bg: "#021a06" },
  { icon: Clock, label: "ENVÍO GRATIS", text: "En compras superiores a $100 USD", color: "#1d4ed8", bg: "#020617" },
];

export default function Home() {
  const { data: products } = useListProducts();
  const featured = products?.slice(0, 4) ?? [];

  return (
    <PublicLayout>
      {/* HERO — car on modern road */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden" style={{ background: "#0a0a0f" }}>
        <img
          src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1800&q=80&fit=crop"
          alt="Auto en carretera moderna"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={e => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80&fit=crop"; }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.4) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(22,163,74,0.12) 0%, transparent 50%)" }} />

        <div className="relative z-10 container mx-auto px-6 py-24 flex flex-col lg:flex-row items-center gap-10">
          {/* TEXT */}
          <div className="flex-1 max-w-2xl">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full border" style={{ borderColor: "#16a34a44", background: "#16a34a10" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#16a34a" }} />
              <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: "#4ade80" }}>Tienda Online en Cuba</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-none mb-4">
              GTR<br />
              <span style={{ WebkitTextStroke: "2px #16a34a", color: "transparent" }}>CUBAUTO</span>
            </h1>
            <p className="text-xl md:text-2xl font-semibold text-white/80 mb-3 tracking-wide uppercase">
              Repuestos de Calidad para Autos y Motos
            </p>
            <p className="text-base text-white/50 mb-10 max-w-xl">
              Todo para tu vehículo en un solo lugar. Los mejores repuestos y accesorios con garantía de calidad y los precios más competitivos de Cuba.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="text-base px-8 py-6 rounded-full font-bold text-white shadow-lg" style={{ background: "#16a34a", boxShadow: "0 0 30px #16a34a44" }}>
                <Link href="/piezas">Ver Ofertas de la Semana <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 rounded-full font-bold border-white/20 text-white hover:bg-white/10">
                <Link href="/mayorista">Precios Mayorista</Link>
              </Button>
            </div>
          </div>

          {/* PROMO WINDOWS */}
          <div className="flex flex-col gap-3 w-full lg:w-72 shrink-0">
            {PROMOS.map(({ icon: Icon, label, text, color, bg }) => (
              <div key={label} className="flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm" style={{ background: bg + "cc", borderColor: color + "40" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: color + "20" }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <div>
                  <div className="text-xs font-black tracking-widest uppercase" style={{ color }}>{label}</div>
                  <div className="text-white/85 text-sm font-semibold leading-tight">{text}</div>
                </div>
              </div>
            ))}
            <Link href="/piezas" className="block">
              <div className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all hover:scale-105" style={{ background: "#16a34a18", borderColor: "#16a34a50" }}>
                <span className="text-sm font-bold" style={{ color: "#4ade80" }}>Ver todas las ofertas</span>
                <ArrowRight className="h-4 w-4" style={{ color: "#4ade80" }} />
              </div>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30">
          <span className="text-white text-xs tracking-widest uppercase">Explorar</span>
          <div className="w-px h-12 bg-white/40" />
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      {featured.length > 0 && (
        <section className="py-14 border-t border-white/5" style={{ background: "#050508" }}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Productos <span style={{ color: "#4ade80" }}>Destacados</span></h2>
                <p className="text-zinc-500 text-sm mt-1">Los más vendidos esta semana</p>
              </div>
              <Button asChild variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-white">
                <Link href="/piezas">Ver todos <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(product => (
                <Link key={product.id} href="/piezas" className="group block rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-green-500/40 transition-all hover:-translate-y-1">
                  <div className="h-36 overflow-hidden bg-zinc-800">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/400x280/0a1a0a/16a34a?text=${encodeURIComponent(product.name.slice(0,8))}`; }} />
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-zinc-500 mb-1">{product.category}</div>
                    <div className="text-white text-sm font-bold leading-tight line-clamp-2 mb-1">{product.name}</div>
                    <div className="font-black" style={{ color: "#4ade80" }}>${product.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CATEGORY CARDS */}
      <section className="bg-zinc-950 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">Nuestras <span style={{ color: "#4ade80" }}>Categorías</span></h2>
            <p className="text-zinc-400 mt-2">Selecciona la sección que necesitas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CATEGORIES.map((cat) => (
              <Link key={cat.href} href={cat.href} className="group relative overflow-hidden rounded-2xl cursor-pointer block" style={{ minHeight: 380 }}>
                <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)` }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `linear-gradient(to top, ${cat.accent}55 0%, transparent 60%)` }} />
                <div className="absolute top-5 left-5">
                  <span className="text-xs font-black tracking-widest px-3 py-1 rounded-full text-white" style={{ background: cat.accent }}>{cat.badge}</span>
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
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: "#16a34a18" }}>
                  <Icon className="h-6 w-6" style={{ color: "#16a34a" }} />
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
