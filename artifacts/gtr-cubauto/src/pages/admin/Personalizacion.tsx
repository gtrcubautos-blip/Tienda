import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { getSiteConfig, setSiteConfig, DEFAULT_CONFIG, type SiteConfig } from "@/hooks/use-site-config";
import { Save, RotateCcw, Eye, ImageIcon, MessageSquare, Phone, Globe } from "lucide-react";

const TABS = [
  { id: "hero", label: "Hero Principal", icon: ImageIcon },
  { id: "promos", label: "Promociones", icon: MessageSquare },
  { id: "categorias", label: "Imágenes Categorías", icon: ImageIcon },
  { id: "contacto", label: "Contacto & Redes", icon: Phone },
] as const;
type TabId = typeof TABS[number]["id"];

export default function Personalizacion() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>("hero");
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSiteConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast({ title: "Cambios guardados", description: "Los cambios se aplicaron a la tienda en tiempo real." });
  };

  const handleReset = () => {
    setConfig({ ...DEFAULT_CONFIG });
    setSiteConfig(DEFAULT_CONFIG);
    toast({ title: "Configuración restaurada", description: "Valores por defecto restaurados." });
  };

  const updatePromo = (i: number, field: "label" | "text", val: string) => {
    const promos = [...config.promos];
    promos[i] = { ...promos[i], [field]: val };
    setConfig({ ...config, promos });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight">Personalización del Sitio</h1>
            <p className="text-muted-foreground mt-1">Edita textos, imágenes y contenido de la tienda en tiempo real</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.open("/", "_blank")} className="gap-2">
              <Eye className="h-4 w-4" /> Vista Previa
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
              <RotateCcw className="h-4 w-4" /> Restaurar
            </Button>
            <Button size="sm" onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" /> {saved ? "¡Guardado!" : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        {/* ── HERO ── */}
        {activeTab === "hero" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Sección Hero</h2>
              <div className="space-y-2">
                <Label>Imagen de Fondo (URL)</Label>
                <Input value={config.heroImage} onChange={e => setConfig({ ...config, heroImage: e.target.value })} placeholder="https://..." />
                <p className="text-xs text-muted-foreground">Recomendado: imagen de auto en Cuba, mínimo 1800px de ancho</p>
              </div>
              <div className="space-y-2">
                <Label>Título Principal</Label>
                <Input value={config.heroTitle} onChange={e => setConfig({ ...config, heroTitle: e.target.value })} placeholder="GTR CUBAUTO" />
              </div>
              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input value={config.heroSubtitle} onChange={e => setConfig({ ...config, heroSubtitle: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Textarea value={config.heroDescription} onChange={e => setConfig({ ...config, heroDescription: e.target.value })} className="resize-none" rows={3} />
              </div>
            </div>
            {/* Preview */}
            <div className="rounded-xl overflow-hidden border border-border" style={{ minHeight: 300 }}>
              <div className="relative h-full min-h-64 flex items-end" style={{ background: "#000" }}>
                <img src={config.heroImage} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-35"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,0.95) 40%, rgba(0,0,0,0.5) 100%)" }} />
                <div className="relative z-10 p-6">
                  <div className="text-3xl font-black text-white leading-none">GTR<br />
                    <span style={{ color: "#00ff41" }}>CUBAUTO</span>
                  </div>
                  <p className="text-white/70 text-xs mt-2 uppercase tracking-wide">{config.heroSubtitle}</p>
                  <p className="text-white/40 text-xs mt-1 max-w-xs">{config.heroDescription}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── PROMOS ── */}
        {activeTab === "promos" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {config.promos.map((promo, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="text-xs font-black uppercase tracking-wide text-muted-foreground">Ventana {i + 1}</div>
                <div className="space-y-2">
                  <Label>Etiqueta</Label>
                  <Input value={promo.label} onChange={e => updatePromo(i, "label", e.target.value)} placeholder="OFERTA SEMANA" />
                </div>
                <div className="space-y-2">
                  <Label>Texto</Label>
                  <Input value={promo.text} onChange={e => updatePromo(i, "text", e.target.value)} placeholder="Descripción de la promo" />
                </div>
                {/* Preview */}
                <div className="rounded-xl p-3 border flex items-center gap-3" style={{ background: "#050505", borderColor: "#00ff4130" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "#00ff4115" }}>
                    <MessageSquare className="h-4 w-4" style={{ color: "#00ff41" }} />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase" style={{ color: "#00ff41" }}>{promo.label || "ETIQUETA"}</div>
                    <div className="text-white/85 text-xs font-semibold">{promo.text || "Texto de promoción"}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CATEGORIAS ── */}
        {activeTab === "categorias" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { key: "motosImage" as const, label: "Página Motos", hint: "Imagen de moto" },
              { key: "carrosImage" as const, label: "Página Carros", hint: "Imagen de auto" },
              { key: "piezasImage" as const, label: "Página Piezas", hint: "Imagen de motor/piezas" },
              { key: "multiservicioImage" as const, label: "Página Multiservicio", hint: "Imagen de productos/servicios" },
            ].map(({ key, label, hint }) => (
              <div key={key} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="text-xs font-black uppercase tracking-wide text-muted-foreground">{label}</div>
                <div className="h-40 rounded-xl overflow-hidden" style={{ background: "#111" }}>
                  <img src={config[key]} alt={label} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="space-y-2">
                  <Label>URL de imagen</Label>
                  <Input value={config[key]} onChange={e => setConfig({ ...config, [key]: e.target.value })} placeholder="https://images.unsplash.com/..." />
                  <p className="text-xs text-muted-foreground">{hint} — se muestra en el header de la página</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── CONTACTO ── */}
        {activeTab === "contacto" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Datos de Pago y Contacto</h2>
              <div className="space-y-2">
                <Label>Teléfono WhatsApp</Label>
                <Input value={config.whatsapp} onChange={e => setConfig({ ...config, whatsapp: e.target.value })} placeholder="+1 (305) 555-0000" />
                <p className="text-xs text-muted-foreground">Se muestra a clientes en el checkout</p>
              </div>
              <div className="space-y-2">
                <Label>Email de contacto / Zelle</Label>
                <Input value={config.email} onChange={e => setConfig({ ...config, email: e.target.value })} placeholder="pagos@gtrcubauto.com" />
              </div>
              <div className="space-y-2">
                <Label>Número Zelle</Label>
                <Input value={config.zellePhone} onChange={e => setConfig({ ...config, zellePhone: e.target.value })} placeholder="+1 (305) 555-0198" />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 space-y-5">
              <h2 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground"><Globe className="h-4 w-4" />Redes Sociales</h2>
              <div className="space-y-2">
                <Label>Facebook URL</Label>
                <Input value={config.fbUrl} onChange={e => setConfig({ ...config, fbUrl: e.target.value })} placeholder="https://facebook.com/tupage" />
              </div>
              <div className="space-y-2">
                <Label>Instagram URL</Label>
                <Input value={config.igUrl} onChange={e => setConfig({ ...config, igUrl: e.target.value })} placeholder="https://instagram.com/tupage" />
              </div>
              <div className="space-y-2">
                <Label>TikTok URL</Label>
                <Input value={config.tiktokUrl} onChange={e => setConfig({ ...config, tiktokUrl: e.target.value })} placeholder="https://tiktok.com/@tupage" />
              </div>
              <div className="rounded-xl p-4 border border-border bg-muted space-y-2 text-sm">
                <p className="font-semibold">Vista previa de contacto en checkout:</p>
                <p>📱 Zelle: <strong>{config.zellePhone}</strong></p>
                <p>📧 Email: <strong>{config.email}</strong></p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <Button size="lg" onClick={handleSave} className="gap-2 px-8">
            <Save className="h-4 w-4" /> {saved ? "¡Guardado!" : "Guardar Todos los Cambios"}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
