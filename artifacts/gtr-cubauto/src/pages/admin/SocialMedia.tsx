import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListProducts } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Share2, Instagram, Facebook, MessageCircle, Copy, Sparkles, CheckCheck, Clock, Zap, ExternalLink } from "lucide-react";

function TikTokIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style} aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.3 0 .59.04.87.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
    </svg>
  );
}

const TEMPLATES = [
  { id: "promo", label: "Promoción", emoji: "🔥", text: (name: string, price: string) => `🔥 *¡OFERTA ESPECIAL!* 🔥\n\n✅ ${name}\n💵 Precio: $${price} USD\n\n📦 Stock limitado — ¡Aprovecha ahora!\n🚚 Envío a toda Cuba en 24-48h\n\n📲 Escríbenos para más info\n☎️ GTR CUBAUTO — Tu repuesto seguro` },
  { id: "nuevo", label: "Nuevo Producto", emoji: "🆕", text: (name: string, price: string) => `🆕 *NUEVO EN STOCK* 🆕\n\n🛒 ${name}\n💲 Precio: $${price} USD\n\n✔️ Garantía de calidad\n✔️ Repuesto original verificado\n✔️ Despacho inmediato\n\n📞 Contáctanos: GTR CUBAUTO` },
  { id: "liquidacion", label: "Liquidación", emoji: "💥", text: (name: string, price: string) => `💥 *¡ÚLTIMAS UNIDADES!* 💥\n\n⚡ ${name}\n🏷️ Solo $${price} USD\n\n⚠️ Pocas piezas disponibles.\nNo dejes que se agote!\n\n👉 DM o WhatsApp\n🏁 GTR CUBAUTO` },
];

type PostHistory = { id: number; platform: string; text: string; product: string; date: string; status: "sent" | "scheduled" };

const MOCK_HISTORY: PostHistory[] = [
  { id: 1, platform: "WhatsApp", text: "🔥 ¡OFERTA! Aceite Motor 5W-30...", product: "Aceite Motor Sintético", date: "2026-05-18 10:30", status: "sent" },
  { id: 2, platform: "Instagram", text: "🆕 NUEVO: Kit de Embrague...", product: "Kit de Embrague", date: "2026-05-17 15:00", status: "sent" },
  { id: 3, platform: "Facebook", text: "💥 ¡ÚLTIMAS UNIDADES! Bujías...", product: "Bujías de Iridio", date: "2026-05-20 09:00", status: "scheduled" },
  { id: 4, platform: "TikTok", text: "🔥 Mira este repuesto en acción...", product: "Kit de Frenos", date: "2026-05-22 18:00", status: "sent" },
];

export default function SocialMedia() {
  const { data: products } = useListProducts();
  const { toast } = useToast();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("promo");
  const [customText, setCustomText] = useState("");
  const [activeTab, setActiveTab] = useState<"whatsapp" | "facebook" | "instagram" | "tiktok">("whatsapp");
  const [copied, setCopied] = useState(false);
  const [discount, setDiscount] = useState("");

  const selectedProduct = products?.find(p => p.id === selectedProductId);
  const template = TEMPLATES.find(t => t.id === selectedTemplate);

  const finalPrice = selectedProduct
    ? discount
      ? (selectedProduct.price * (1 - parseFloat(discount) / 100)).toFixed(2)
      : selectedProduct.price.toFixed(2)
    : "0.00";

  const generatedText = customText ||
    (selectedProduct && template ? template.text(selectedProduct.name, finalPrice) : "");

  const platformColors: Record<string, string> = {
    whatsapp: "#25d366",
    facebook: "#1877f2",
    instagram: "#e1306c",
    tiktok: "#fe2c55",
  };

  const handleTikTokUpload = () => {
    window.open("https://www.tiktok.com/tiktokstudio/upload", "_blank");
    toast({ title: "Abriendo TikTok Studio", description: "Sube tu video o foto y pega el texto copiado." });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Copiado", description: "Texto copiado al portapapeles." });
    });
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(generatedText)}`;
    window.open(url, "_blank");
    toast({ title: "Abriendo WhatsApp Web", description: "Selecciona el contacto o grupo." });
  };

  const handleFBShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://gtrcubauto.com&quote=${encodeURIComponent(generatedText.slice(0,200))}`, "_blank");
  };

  const handleAutoGenerate = () => {
    if (!selectedProduct) { toast({ title: "Selecciona un producto", variant: "destructive" }); return; }
    const t = TEMPLATES.find(t => t.id === selectedTemplate);
    if (t) setCustomText(t.text(selectedProduct.name, finalPrice));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Redes Sociales</h1>
          <p className="text-muted-foreground mt-1">Genera y publica contenido promocional automáticamente</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Generator */}
          <div className="space-y-4">
            {/* Step 1: Product */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-black text-primary-foreground">1</div>
                <h2 className="font-bold text-sm uppercase tracking-wide">Seleccionar Producto</h2>
              </div>
              <select
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                value={selectedProductId ?? ""}
                onChange={e => { setSelectedProductId(Number(e.target.value)); setCustomText(""); }}
              >
                <option value="">— Elige un producto —</option>
                {products?.map(p => (
                  <option key={p.id} value={p.id}>{p.name} — ${p.price.toFixed(2)}</option>
                ))}
              </select>
              {selectedProduct && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-14 h-14 rounded-lg object-cover" />
                  <div>
                    <div className="font-bold text-sm">{selectedProduct.name}</div>
                    <div className="text-muted-foreground text-xs">{selectedProduct.category} · Stock: {selectedProduct.stock}</div>
                    <div className="text-primary font-black">${finalPrice}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Template */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-black text-primary-foreground">2</div>
                <h2 className="font-bold text-sm uppercase tracking-wide">Tipo de Publicación</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => (
                  <button key={t.id} type="button" onClick={() => { setSelectedTemplate(t.id); setCustomText(""); }}
                    className={`p-3 rounded-xl border text-center text-sm font-semibold transition-all ${selectedTemplate === t.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    <div className="text-xl mb-1">{t.emoji}</div>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="space-y-1 flex-1">
                  <Label className="text-xs text-muted-foreground">Descuento % (opcional)</Label>
                  <Input value={discount} onChange={e => setDiscount(e.target.value)} placeholder="Ej: 20" type="number" min="0" max="90" className="text-sm" />
                </div>
                <div className="pt-5">
                  <Button onClick={handleAutoGenerate} size="sm" className="gap-1">
                    <Sparkles className="h-4 w-4" /> Generar
                  </Button>
                </div>
              </div>
            </div>

            {/* Step 3: Edit text */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-black text-primary-foreground">3</div>
                  <h2 className="font-bold text-sm uppercase tracking-wide">Editar Texto</h2>
                </div>
                <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1 text-xs">
                  {copied ? <><CheckCheck className="h-3 w-3 text-primary" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar</>}
                </Button>
              </div>
              <Textarea
                value={generatedText}
                onChange={e => setCustomText(e.target.value)}
                placeholder="Escribe o genera el texto de tu publicación..."
                className="min-h-[180px] font-mono text-sm resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">{generatedText.length} caracteres</div>
            </div>
          </div>

          {/* RIGHT: Preview + Share */}
          <div className="space-y-4">
            {/* Platform tabs */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Share2 className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-sm uppercase tracking-wide">Publicar en</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "whatsapp" as const, label: "WhatsApp", icon: MessageCircle },
                  { id: "facebook" as const, label: "Facebook", icon: Facebook },
                  { id: "instagram" as const, label: "Instagram", icon: Instagram },
                  { id: "tiktok" as const, label: "TikTok", icon: TikTokIcon },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setActiveTab(id)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border text-xs font-bold transition-all`}
                    style={{
                      borderColor: activeTab === id ? platformColors[id] : "#374151",
                      background: activeTab === id ? platformColors[id] + "22" : "transparent",
                      color: activeTab === id ? platformColors[id] : "#9ca3af",
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="rounded-xl border border-border p-4 space-y-3" style={{ background: "#0d1117" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-black text-primary-foreground">G</div>
                  <div>
                    <div className="text-sm font-bold text-white">GTR CUBAUTO</div>
                    <div className="text-xs text-zinc-500">{activeTab === "whatsapp" ? "Grupo WhatsApp" : activeTab === "facebook" ? "Página Facebook" : activeTab === "tiktok" ? "TikTok · @gtrcubauto" : "@gtrcubauto"}</div>
                  </div>
                </div>
                {selectedProduct && (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-32 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                )}
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-sans leading-relaxed max-h-32 overflow-y-auto">{generatedText || "Genera el texto para ver la vista previa..."}</pre>
              </div>

              {/* Share buttons */}
              <div className="space-y-2">
                {activeTab === "whatsapp" && (
                  <Button onClick={handleWhatsAppShare} className="w-full gap-2 text-white" style={{ background: "#25d366" }} disabled={!generatedText}>
                    <MessageCircle className="h-4 w-4" /> Compartir por WhatsApp
                  </Button>
                )}
                {activeTab === "facebook" && (
                  <Button onClick={handleFBShare} className="w-full gap-2 text-white" style={{ background: "#1877f2" }} disabled={!generatedText}>
                    <Facebook className="h-4 w-4" /> Publicar en Facebook
                  </Button>
                )}
                {activeTab === "instagram" && (
                  <div className="rounded-xl border border-zinc-700 p-4 text-sm text-zinc-400 space-y-2">
                    <p><strong className="text-white">Instrucciones Instagram:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Copia el texto con el botón "Copiar"</li>
                      <li>Descarga la imagen del producto</li>
                      <li>Abre Instagram en tu teléfono</li>
                      <li>Crea un nuevo post y pega el texto</li>
                    </ol>
                    <Button variant="outline" onClick={handleCopy} className="w-full gap-2 text-xs border-pink-500/50 text-pink-400">
                      <Copy className="h-3 w-3" /> Copiar texto para Instagram
                    </Button>
                  </div>
                )}
                {activeTab === "tiktok" && (
                  <div className="space-y-2">
                    <Button onClick={handleTikTokUpload} className="w-full gap-2 text-white" style={{ background: "#fe2c55" }} disabled={!generatedText}>
                      <TikTokIcon className="h-4 w-4" /> Publicar en TikTok <ExternalLink className="h-3 w-3" />
                    </Button>
                    <div className="rounded-xl border border-zinc-700 p-4 text-sm text-zinc-400 space-y-2">
                      <p><strong className="text-white">Cómo publicar en TikTok:</strong></p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Copia el texto con el botón "Copiar"</li>
                        <li>Pulsa "Publicar en TikTok" para abrir TikTok Studio</li>
                        <li>Sube tu video o foto del producto</li>
                        <li>Pega el texto en la descripción y publica</li>
                      </ol>
                      <Button variant="outline" onClick={handleCopy} className="w-full gap-2 text-xs" style={{ borderColor: "#fe2c5580", color: "#fe2c55" }}>
                        <Copy className="h-3 w-3" /> Copiar texto para TikTok
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Auto-schedule teaser */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-sm text-primary uppercase tracking-wide">Publicación Automática</h2>
                <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">PRO</Badge>
              </div>
              <p className="text-xs text-muted-foreground">Programa publicaciones para que salgan automáticamente a la hora que elijas.</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Fecha</Label>
                  <Input type="date" className="text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hora</Label>
                  <Input type="time" className="text-sm" />
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2 text-xs border-primary/30 text-primary" disabled={!generatedText}>
                <Clock className="h-4 w-4" /> Programar Publicación
              </Button>
            </div>
          </div>
        </div>

        {/* History */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-bold text-sm uppercase tracking-wide">Historial de Publicaciones</h2>
          <div className="space-y-2">
            {MOCK_HISTORY.map(post => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: platformColors[post.platform.toLowerCase() as keyof typeof platformColors] + "22" }}>
                    {post.platform === "WhatsApp" ? <MessageCircle className="h-4 w-4" style={{ color: "#25d366" }} /> :
                     post.platform === "Facebook" ? <Facebook className="h-4 w-4" style={{ color: "#1877f2" }} /> :
                     post.platform === "TikTok" ? <TikTokIcon className="h-4 w-4" style={{ color: "#fe2c55" }} /> :
                     <Instagram className="h-4 w-4" style={{ color: "#e1306c" }} />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate">{post.product}</div>
                    <div className="text-xs text-muted-foreground truncate">{post.text}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-muted-foreground">{post.date}</span>
                  <Badge className={post.status === "sent" ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/20" : "bg-amber-500/15 text-amber-500 border-amber-500/20"}>
                    {post.status === "sent" ? "Enviado" : "Programado"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
