import { Link } from "wouter";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Tag, Package, Clock } from "lucide-react";
import { useListProducts } from "@workspace/api-client-react";
import { useSiteConfig } from "@/hooks/use-site-config";

const NEON = "#00ff41";
const NEON_DIM = "#00ff4115";
const NEON_BORDER = "#00ff4130";

const PROMO_ICONS = [Tag, Package, Clock];

const CATEGORIES = [
  { href: "/motos", label: "Motos", subtitle: "Repuestos & Accesorios", desc: "Aceites, cadenas, filtros, frenos y todo para tu moto.", badge: "MOTOS" },
  { href: "/carros", label: "Carros", subtitle: "Piezas para Automóviles", desc: "Motores, suspensión, frenos, eléctrico y mucho más.", badge: "CARROS" },
  { href: "/piezas", label: "Piezas", subtitle: "Catálogo Completo", desc: "Bujías, baterías, correas, filtros y repuestos universales.", badge: "PIEZAS" },
  { href: "/multiservicio", label: "Multiservicio", subtitle: "Productos & Servicios", desc: "Nuevos productos y servicios adicionales para ti.", badge: "MULTISERVICIO" },
];

export default function Home() {
  const { data: products } = useListProducts();
  const config = useSiteConfig();
  const featured = products?.slice(0, 4) ?? [];

  const CATEGORY_IMAGES = [config.motosImage, config.carrosImage, config.piezasImage, config.multiservicioImage];

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[93vh] flex items-center overflow-hidden" style={{ background: "#000" }}>
        <img
          src={config.heroImage}
          alt="Auto en Cuba"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
          onError={e => {
            (e.target as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=80&fit=crop";
          }}
        />
        {/* Overlays */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.97) 40%, rgba(0,0,0,0.6) 100%)" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${NEON}18 0%, transparent 50%)` }} />
        {/* Neon scan line effect */}
        <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${NEON}, transparent)`, opacity: 0.4 }} />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-14 sm:py-20 lg:py-24 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* LEFT TEXT */}
          <div className="flex-1 max-w-2xl w-full">
            <div className="inline-flex items-center gap-2 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 rounded-full border text-[10px] sm:text-sm font-bold tracking-widest uppercase" style={{ borderColor: NEON_BORDER, background: NEON_DIM, color: NEON }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: NEON }} />
              TIENDA ONLINE EN CUBA
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-none mb-3 sm:mb-4 break-words">
              GTR<br />
              <span className="neon-text" style={{ color: NEON }}>{config.heroTitle.includes("CUBAUTO") ? "CUBAUTO" : config.heroTitle}</span>
            </h1>
            <p className="text-base sm:text-xl font-bold text-white/75 mb-2 sm:mb-3 tracking-wide uppercase">{config.heroSubtitle}</p>
            <p className="text-sm sm:text-base text-white/45 mb-6 sm:mb-10 max-w-xl leading-relaxed">{config.heroDescription}</p>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
              <Button asChild size="lg" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-full font-black text-black neon-glow border-0"
                style={{ background: NEON }}>
                <Link href="/piezas">Ver Catálogo <ArrowRight className="ml-2 h-5 w-5" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 rounded-full font-bold text-white"
                style={{ borderColor: NEON_BORDER, background: "transparent" }}>
                <Link href="/mayorista">Precios Mayorista</Link>
              </Button>
            </div>
          </div>

          {/* RIGHT PROMO WINDOWS */}
          <div className="flex flex-col gap-3 w-full lg:w-72 shrink-0">
            {config.promos.map(({ label, text }, i) => {
              const Icon = PROMO_ICONS[i] ?? Tag;
              return (
                <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-sm"
                  style={{ background: "rgba(0,0,0,0.75)", borderColor: NEON_BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: NEON_DIM }}>
                    <Icon className="h-5 w-5" style={{ color: NEON }} />
                  </div>
                  <div>
                    <div className="text-xs font-black tracking-widest uppercase" style={{ color: NEON }}>{label}</div>
                    <div className="text-white/85 text-sm font-semibold leading-tight">{text}</div>
                  </div>
                </div>
              );
            })}
            <Link href="/piezas" className="block">
              <div className="flex items-center justify-between p-4 rounded-2xl border cursor-pointer hover:scale-105 transition-transform"
                style={{ background: NEON_DIM, borderColor: NEON_BORDER }}>
                <span className="text-sm font-bold" style={{ color: NEON }}>Ver todas las ofertas</span>
                <ArrowRight className="h-4 w-4" style={{ color: NEON }} />
              </div>
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-25">
          <span className="text-xs tracking-widest uppercase" style={{ color: NEON }}>Explorar</span>
          <div className="w-px h-12" style={{ background: NEON }} />
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      {featured.length > 0 && (
        <section className="py-14" style={{ background: "#050505", borderTop: `1px solid ${NEON_BORDER}` }}>
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-white">Productos <span className="neon-text" style={{ color: NEON }}>Destacados</span></h2>
                <p className="text-sm mt-1" style={{ color: "#666" }}>Los más vendidos esta semana</p>
              </div>
              <Button asChild variant="outline" size="sm" className="text-sm" style={{ borderColor: NEON_BORDER, color: NEON, background: "transparent" }}>
                <Link href="/piezas">Ver todos <ArrowRight className="ml-1 h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featured.map(product => (
                <Link key={product.id} href="/piezas" className="group block rounded-xl overflow-hidden border transition-all hover:-translate-y-1"
                  style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = NEON_BORDER)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#1a1a1a")}
                >
                  <div className="h-36 overflow-hidden" style={{ background: "#111" }}>
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="p-3">
                    <div className="text-xs mb-1" style={{ color: "#555" }}>{product.category}</div>
                    <div className="text-white text-sm font-bold leading-tight line-clamp-2 mb-1">{product.name}</div>
                    <div className="font-black neon-text" style={{ color: NEON }}>${product.price.toFixed(2)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CATEGORIES ── */}
      <section className="py-12" style={{ background: "#000" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-white">Nuestras <span className="neon-text" style={{ color: NEON }}>Categorías</span></h2>
            <p className="mt-2 text-sm" style={{ color: "#555" }}>Selecciona lo que necesitas</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, i) => (
              <Link key={cat.href} href={cat.href} className="group relative overflow-hidden rounded-2xl cursor-pointer block" style={{ minHeight: 360 }}>
                <img src={CATEGORY_IMAGES[i]} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={e => { (e.target as HTMLImageElement).style.opacity = "0.1"; }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.15) 100%)" }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${NEON}44 0%, transparent 60%)` }} />
                <div className="absolute top-5 left-5">
                  <span className="text-xs font-black tracking-widest px-3 py-1 rounded-full text-black" style={{ background: NEON }}>{cat.badge}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-3xl font-black tracking-tight mb-1">{cat.label}</h3>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#666" }}>{cat.subtitle}</p>
                  <p className="text-sm mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{cat.desc}</p>
                  <div className="flex items-center gap-2 font-bold text-sm group-hover:gap-4 transition-all" style={{ color: NEON }}>
                    Ver productos <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
                {/* Neon bottom border on hover */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: NEON }} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
