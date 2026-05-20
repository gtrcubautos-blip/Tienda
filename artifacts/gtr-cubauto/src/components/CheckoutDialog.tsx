import { useState, useEffect } from "react";
import { useCreateOrder, getListProductsQueryKey } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { CreditCard, Smartphone, Truck, CheckCircle2, MapPin } from "lucide-react";
import { getSiteConfig } from "@/hooks/use-site-config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WelcomeModal, isRegistered } from "@/components/WelcomeModal";

const NEON = "#00ff41";
const NEON_DIM = "#00ff4115";
const NEON_BORDER = "#00ff4130";

const CUBA_PROVINCES = [
  "Pinar del Río", "Artemisa", "La Habana", "Mayabeque", "Matanzas",
  "Villa Clara", "Cienfuegos", "Sancti Spíritus", "Ciego de Ávila",
  "Camagüey", "Las Tunas", "Holguín", "Granma", "Santiago de Cuba",
  "Guantánamo", "Isla de la Juventud",
];

type Product = { id: number; name: string; price: number; stock: number };
interface CheckoutDialogProps { product: Product | null; onClose: () => void; }

const PAYMENT_METHODS = [
  { id: "zelle", label: "Zelle", icon: Smartphone },
  { id: "card", label: "Tarjeta", icon: CreditCard },
  { id: "cod", label: "Contra Entrega", icon: Truck },
] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number]["id"];

export function CheckoutDialog({ product, onClose }: CheckoutDialogProps) {
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cfg = getSiteConfig();
  const [step, setStep] = useState<"form" | "success">("form");
  const [needsRegistration, setNeedsRegistration] = useState(false);

  // Pre-fill name from registration data if available
  const savedData = (() => { try { return JSON.parse(localStorage.getItem("gtr_registered") ?? "{}"); } catch { return {}; } })();
  const [clientName, setClientName] = useState(savedData.name ?? "");
  const [province, setProvince] = useState(savedData.province ?? "");
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // When product is set (dialog opens), gate on registration
  useEffect(() => {
    if (product && !isRegistered()) {
      setNeedsRegistration(true);
    }
  }, [product]);
  const [zelleRef, setZelleRef] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [address, setAddress] = useState("");

  const total = (product?.price ?? 0) * qty;

  const handleClose = () => {
    setStep("form"); setQty(1); setPaymentMethod("cod");
    setZelleRef(""); setCardNum(""); setCardName(""); setCardExpiry(""); setCardCvv(""); setAddress("");
    setNeedsRegistration(false);
    onClose();
  };

  const handleRegistrationComplete = () => {
    // Re-read saved data to pre-fill checkout fields
    try {
      const d = JSON.parse(localStorage.getItem("gtr_registered") ?? "{}");
      if (d.name) setClientName(d.name);
      if (d.province) setProvince(d.province);
    } catch { /* ignore */ }
    setNeedsRegistration(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const payLabels: Record<PaymentMethod, string> = { zelle: "Zelle", card: "Tarjeta", cod: "Contra Entrega" };
    const payExtra: Record<PaymentMethod, string> = {
      zelle: zelleRef ? ` Ref:${zelleRef}` : "",
      card: cardNum ? ` ****${cardNum.slice(-4)}` : "",
      cod: address ? ` Dir:${address}` : "",
    };
    const regionTag = province ? ` [${province}]` : "";
    const fullName = `${clientName || "Cliente"} [${payLabels[paymentMethod]}${payExtra[paymentMethod]}]${regionTag}`;
    createOrder.mutate(
      { data: { clientName: fullName, type: "retail", items: [{ productId: product.id, productName: product.name, qty, unitPrice: product.price }] } },
      {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setStep("success"); },
        onError: () => toast({ title: "Error", description: "No se pudo procesar la orden.", variant: "destructive" }),
      }
    );
  };

  // Registration gate: show WelcomeModal before checkout for unregistered users
  if (needsRegistration) {
    return (
      <WelcomeModal
        forceOpen={true}
        onComplete={handleRegistrationComplete}
      />
    );
  }

  return (
    <Dialog open={!!product} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="border text-white max-w-md" style={{ background: "#080808", borderColor: NEON_BORDER }}>
        {step === "success" ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center neon-glow" style={{ background: NEON_DIM }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: NEON }} />
            </div>
            <h2 className="text-2xl font-black text-white">¡Orden Confirmada!</h2>
            <p className="text-sm text-center" style={{ color: "#888" }}>
              Tu pedido de <strong className="text-white">{product?.name}</strong> fue registrado. Nos pondremos en contacto pronto.
            </p>
            <div className="w-full rounded-xl p-4 border space-y-2 text-sm" style={{ borderColor: NEON_BORDER, background: "#0a0a0a" }}>
              <div className="flex justify-between"><span style={{ color: "#666" }}>Método:</span><span className="font-bold">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span></div>
              {province && <div className="flex justify-between"><span style={{ color: "#666" }}>Región:</span><span className="font-bold">{province}</span></div>}
              <div className="flex justify-between"><span style={{ color: "#666" }}>Cantidad:</span><span className="font-bold">{qty} ud.</span></div>
              <div className="flex justify-between"><span style={{ color: "#666" }}>Total:</span><span className="font-black text-lg neon-text" style={{ color: NEON }}>${total.toFixed(2)}</span></div>
            </div>
            <Button className="w-full rounded-full font-black text-black border-0 neon-glow" style={{ background: NEON }} onClick={handleClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black">Confirmar Compra</DialogTitle>
              <DialogDescription style={{ color: "#666" }}>
                <strong className="text-white">{product?.name}</strong> — <span style={{ color: NEON }}>${product?.price.toFixed(2)}</span> c/u
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <Label className="text-xs uppercase tracking-wide" style={{ color: "#888" }}>Nombre completo</Label>
                <Input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Juan Pérez"
                  className="text-white border-0 focus-visible:ring-1" style={{ background: "#111" }} />
              </div>

              {/* Province + Qty row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wide flex items-center gap-1" style={{ color: "#888" }}>
                    <MapPin className="h-3 w-3" /> Provincia
                  </Label>
                  <Select value={province} onValueChange={setProvince}>
                    <SelectTrigger className="text-white border-0 h-10 text-sm" style={{ background: "#111" }}>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent className="border-0 max-h-60" style={{ background: "#1a1a1a" }}>
                      {CUBA_PROVINCES.map(p => (
                        <SelectItem key={p} value={p} className="text-white hover:bg-white/10 text-sm">{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs uppercase tracking-wide" style={{ color: "#888" }}>Cantidad</Label>
                  <Input type="number" required min="1" max={product?.stock} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-white border-0" style={{ background: "#111" }} />
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-4 py-2 rounded-xl border" style={{ borderColor: NEON_BORDER, background: "#050505" }}>
                <span className="text-sm" style={{ color: "#888" }}>Total a pagar:</span>
                <span className="font-black text-2xl neon-text" style={{ color: NEON }}>${total.toFixed(2)}</span>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide" style={{ color: "#888" }}>Método de Pago</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all"
                      style={{ borderColor: paymentMethod === id ? NEON : "#222", background: paymentMethod === id ? NEON_DIM : "transparent" }}>
                      <Icon className="h-5 w-5" style={{ color: paymentMethod === id ? NEON : "#555" }} />
                      <span className="text-xs font-bold" style={{ color: paymentMethod === id ? NEON : "#555" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {paymentMethod === "zelle" && (
                <div className="rounded-xl p-4 border space-y-3" style={{ background: "#050505", borderColor: NEON_BORDER }}>
                  <p className="text-sm font-bold text-white">Datos Zelle GTR CUBAUTO:</p>
                  <p className="text-sm">📱 <span className="font-mono" style={{ color: NEON }}>{cfg.zellePhone}</span></p>
                  <p className="text-sm">📧 <span className="font-mono" style={{ color: NEON }}>{cfg.email}</span></p>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: "#666" }}>Confirmación Zelle (opcional)</Label>
                    <Input value={zelleRef} onChange={e => setZelleRef(e.target.value)} placeholder="Ej: ZLL-4829301"
                      className="text-white border-0 text-sm" style={{ background: "#111" }} />
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div className="rounded-xl p-4 border space-y-3" style={{ background: "#050505", borderColor: NEON_BORDER }}>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: "#666" }}>Número de tarjeta</Label>
                    <Input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").slice(0,16))} placeholder="0000 0000 0000 0000"
                      className="text-white font-mono border-0 text-sm" style={{ background: "#111" }} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: "#666" }}>Nombre en la tarjeta</Label>
                    <Input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="JUAN PEREZ"
                      className="text-white border-0 text-sm uppercase" style={{ background: "#111" }} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs" style={{ color: "#666" }}>Vencimiento</Label>
                      <Input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/AA"
                        className="text-white border-0 text-sm" style={{ background: "#111" }} maxLength={5} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" style={{ color: "#666" }}>CVV</Label>
                      <Input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="***"
                        className="text-white border-0 text-sm" style={{ background: "#111" }} type="password" />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="rounded-xl p-4 border space-y-3" style={{ background: "#050505", borderColor: NEON_BORDER }}>
                  <p className="text-sm"><strong className="text-white">🚚 Pago al recibir.</strong> <span style={{ color: "#888" }}>Un cobrador llegará en 24–48 horas.</span></p>
                  <div className="space-y-1">
                    <Label className="text-xs" style={{ color: "#666" }}>Dirección de entrega</Label>
                    <Input required value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, No, Ciudad, Provincia"
                      className="text-white border-0 text-sm" style={{ background: "#111" }} />
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleClose} className="border font-semibold" style={{ borderColor: "#222", color: "#888", background: "transparent" }}>Cancelar</Button>
                <Button type="submit" disabled={createOrder.isPending} className="rounded-full px-6 font-black text-black border-0 neon-glow" style={{ background: NEON }}>
                  {createOrder.isPending ? "Procesando..." : "Confirmar Pedido"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
