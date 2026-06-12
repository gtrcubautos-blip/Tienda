import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { CUBA_PROVINCES } from "@/components/WelcomeModal";
import { isRegistered, WelcomeModal } from "@/components/WelcomeModal";
import { useCreateOrder, getListProductsQueryKey, useListQuoteWhatsapps } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useSiteConfig } from "@/hooks/use-site-config";
import {
  Trash2, Plus, Minus, ShoppingBag, CreditCard, Smartphone, Truck,
  CheckCircle2, MapPin, ShoppingCart, MessageCircle
} from "lucide-react";

const NEON = "#00ff41";
const NEON_DIM = "#00ff4115";
const NEON_BORDER = "#00ff4130";

const PAYMENT_METHODS = [
  { id: "zelle", label: "Zelle", shortLabel: "Zelle", icon: Smartphone },
  { id: "card", label: "Tarjeta", shortLabel: "Tarjeta", icon: CreditCard },
  { id: "cod", label: "Contra Entrega", shortLabel: "Contra Entr.", icon: Truck },
] as const;
type PaymentMethod = typeof PAYMENT_METHODS[number]["id"];

export function CartDrawer() {
  const { items, removeItem, updateQty, clearCart, totalItems, totalPrice, cartOpen, setCartOpen } = useCart();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const cfg = useSiteConfig();

  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart");
  const [needsRegistration, setNeedsRegistration] = useState(false);

  const savedData = (() => { try { return JSON.parse(localStorage.getItem("gtr_registered") ?? "{}"); } catch { return {}; } })();
  const [clientName, setClientName] = useState(savedData.name ?? "");
  const [province, setProvince] = useState(savedData.province ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [zelleRef, setZelleRef] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [address, setAddress] = useState("");
  const [showQuotePicker, setShowQuotePicker] = useState(false);

  const { data: quoteData, isError: quoteIsError } = useListQuoteWhatsapps();
  const quoteNumbers = (quoteData ?? []).filter(q => q.number && q.number.replace(/\D/g, "").length >= 8);

  const buildQuoteText = () => {
    const lines = items.map(it => `• ${it.name} x${it.qty} — $${(it.price * it.qty).toFixed(2)}`);
    const name = (clientName || savedData.name || "").trim();
    return [
      "🏁 *GTR CUBAUTO* — Solicitud de cotización",
      "",
      ...lines,
      "",
      `Total estimado: $${totalPrice.toFixed(2)} USD`,
      name ? `Cliente: ${name}` : "",
    ].filter(Boolean).join("\n");
  };

  const openQuote = (number: string) => {
    const digits = number.replace(/\D/g, "");
    window.open(`https://wa.me/${digits}?text=${encodeURIComponent(buildQuoteText())}`, "_blank");
    setShowQuotePicker(false);
  };

  const handleQuote = () => {
    if (items.length === 0) return;
    if (quoteIsError) {
      toast({ title: "Error al cargar los números", description: "No se pudieron cargar los números de WhatsApp, intenta de nuevo.", variant: "destructive" });
      return;
    }
    if (quoteNumbers.length === 0) {
      toast({ title: "WhatsApp no configurado", description: "Configura un número de cotización en el panel de administración (Personalización → WhatsApp para Cotizaciones).", variant: "destructive" });
      return;
    }
    if (quoteNumbers.length === 1) { openQuote(quoteNumbers[0].number); return; }
    setShowQuotePicker(p => !p);
  };

  const handleProceedToCheckout = () => {
    if (!isRegistered()) {
      setNeedsRegistration(true);
    } else {
      setCheckoutStep("checkout");
    }
  };

  const handleRegistrationComplete = () => {
    try {
      const d = JSON.parse(localStorage.getItem("gtr_registered") ?? "{}");
      if (d.name) setClientName(d.name);
      if (d.province) setProvince(d.province);
    } catch { /* ignore */ }
    setNeedsRegistration(false);
    setCheckoutStep("checkout");
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const payLabels: Record<PaymentMethod, string> = { zelle: "Zelle", card: "Tarjeta", cod: "Contra Entrega" };
    const payExtra: Record<PaymentMethod, string> = {
      zelle: zelleRef ? ` Ref:${zelleRef}` : "",
      card: cardNum ? ` ****${cardNum.slice(-4)}` : "",
      cod: address ? ` Dir:${address}` : "",
    };
    const regionTag = province ? ` [${province}]` : "";
    const fullName = `${clientName || "Cliente"} [${payLabels[paymentMethod]}${payExtra[paymentMethod]}]${regionTag}`;

    createOrder.mutate(
      {
        data: {
          clientName: fullName,
          type: "retail",
          items: items.map(item => ({
            productId: item.id,
            productName: item.name,
            qty: item.qty,
            unitPrice: item.price,
          })),
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          clearCart();
          setCheckoutStep("success");
        },
        onError: () => toast({ title: "Error", description: "No se pudo procesar la orden.", variant: "destructive" }),
      }
    );
  };

  const handleClose = () => {
    setCartOpen(false);
    setCheckoutStep("cart");
    setNeedsRegistration(false);
  };

  // Registration gate modal
  if (needsRegistration) {
    return (
      <WelcomeModal
        forceOpen={true}
        onComplete={handleRegistrationComplete}
        onClose={() => setNeedsRegistration(false)}
      />
    );
  }

  return (
    <Sheet open={cartOpen} onOpenChange={open => { if (!open) handleClose(); }}>
      <SheetContent
        side="right"
        className="flex flex-col p-0 text-white border-l"
        style={{ background: "#080808", borderColor: NEON_BORDER, width: "min(420px, 100vw)" }}
      >
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b flex-row items-center justify-between" style={{ borderColor: NEON_BORDER }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: NEON }}>
              <ShoppingCart className="h-4 w-4 text-black" />
            </div>
            <SheetTitle className="text-white font-black text-base">
              {checkoutStep === "success" ? "¡Pedido Confirmado!" : checkoutStep === "checkout" ? "Confirmar Pedido" : `Mi Carrito (${totalItems})`}
            </SheetTitle>
          </div>
          {checkoutStep === "checkout" && (
            <button type="button" onClick={() => setCheckoutStep("cart")}
              className="text-xs font-bold transition-colors"
              style={{ color: "#555" }}
              onMouseEnter={e => (e.currentTarget.style.color = NEON)}
              onMouseLeave={e => (e.currentTarget.style.color = "#555")}>
              ← Volver al carrito
            </button>
          )}
        </SheetHeader>

        {/* Success screen */}
        {checkoutStep === "success" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center neon-glow"
              style={{ background: NEON_DIM, border: `2px solid ${NEON}44` }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: NEON }} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">¡Orden Registrada!</h2>
              <p className="text-sm mt-2" style={{ color: "#888" }}>
                Tu pedido fue confirmado. Nos pondremos en contacto pronto.
              </p>
            </div>
            <Button className="w-full rounded-full font-black text-black border-0 neon-glow" style={{ background: NEON }} onClick={handleClose}>
              Seguir Comprando
            </Button>
          </div>
        )}

        {/* Cart items */}
        {checkoutStep === "cart" && (
          <>
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#111" }}>
                  <ShoppingBag className="h-8 w-8" style={{ color: "#333" }} />
                </div>
                <p className="font-bold text-white">Tu carrito está vacío</p>
                <p className="text-sm" style={{ color: "#555" }}>Agrega productos desde Motos, Carros o Piezas.</p>
                <Button onClick={handleClose} className="rounded-full px-6 font-bold text-black border-0"
                  style={{ background: NEON }}>
                  Explorar Productos
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3 rounded-xl p-3 border"
                      style={{ background: "#0d0d0d", borderColor: "#1a1a1a" }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/64x64/000/00ff41?text=GTR`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white leading-tight line-clamp-2">{item.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#555" }}>{item.category}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-black text-base" style={{ color: NEON }}>${(item.price * item.qty).toFixed(2)}</span>
                          <div className="flex items-center gap-1.5">
                            <button type="button" onClick={() => item.qty === 1 ? removeItem(item.id) : updateQty(item.id, item.qty - 1)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors"
                              style={{ borderColor: "#2a2a2a", background: "#111", color: "#888" }}>
                              {item.qty === 1 ? <Trash2 className="h-3 w-3" style={{ color: "#ff4444" }} /> : <Minus className="h-3 w-3" />}
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-white">{item.qty}</span>
                            <button type="button" onClick={() => updateQty(item.id, item.qty + 1)}
                              disabled={item.qty >= item.stock}
                              className="w-7 h-7 rounded-lg flex items-center justify-center border transition-colors"
                              style={{ borderColor: "#2a2a2a", background: "#111", color: item.qty >= item.stock ? "#333" : "#888" }}>
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: NEON_BORDER }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "#888" }}>Total ({totalItems} productos):</span>
                    <span className="font-black text-2xl" style={{ color: NEON }}>${totalPrice.toFixed(2)}</span>
                  </div>
                  <Button className="w-full rounded-full font-black text-black border-0 neon-glow py-5"
                    style={{ background: NEON }} onClick={handleProceedToCheckout}>
                    Proceder al Pago
                  </Button>
                  <Button type="button" onClick={handleQuote}
                    className="w-full rounded-full font-bold py-5 gap-2 text-white border-0"
                    style={{ background: "#25d366" }}>
                    <MessageCircle className="h-4 w-4" /> Solicitar cotización por WhatsApp
                  </Button>
                  {showQuotePicker && quoteNumbers.length > 1 && (
                    <div className="rounded-xl border p-2 space-y-1" style={{ borderColor: NEON_BORDER, background: "#050505" }}>
                      <p className="text-xs px-2 py-1" style={{ color: "#888" }}>Elige a quién enviar la cotización:</p>
                      {quoteNumbers.map((q, i) => (
                        <button key={i} type="button" onClick={() => openQuote(q.number)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white text-left transition-colors"
                          style={{ background: "#111" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#1a1a1a")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#111")}>
                          <MessageCircle className="h-4 w-4 shrink-0" style={{ color: "#25d366" }} />
                          <span className="font-semibold truncate">{q.label || "WhatsApp"}</span>
                          <span className="ml-auto text-xs shrink-0" style={{ color: "#666" }}>{q.number}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  <button type="button" onClick={clearCart}
                    className="w-full text-xs text-center transition-colors"
                    style={{ color: "#444" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#ff4444")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#444")}>
                    Vaciar carrito
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Checkout form */}
        {checkoutStep === "checkout" && (
          <form onSubmit={handleSubmitOrder} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Order summary */}
              <div className="rounded-xl p-3 border space-y-1.5" style={{ borderColor: "#1e1e1e", background: "#0d0d0d" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#555" }}>Resumen del pedido</p>
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span style={{ color: "#aaa" }}>{item.name} x{item.qty}</span>
                    <span className="font-bold text-white">${(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-1.5 flex justify-between font-black" style={{ borderColor: "#222" }}>
                  <span style={{ color: "#888" }}>Total</span>
                  <span style={{ color: NEON }}>${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {/* Client name */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide" style={{ color: "#888" }}>Nombre completo</Label>
                <Input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Juan Pérez"
                  className="text-white border-0 focus-visible:ring-1" style={{ background: "#111" }} />
              </div>

              {/* Province */}
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wide flex items-center gap-1" style={{ color: "#888" }}>
                  <MapPin className="h-3 w-3" /> Provincia
                </Label>
                <Select value={province} onValueChange={setProvince}>
                  <SelectTrigger className="text-white border-0 h-10 text-sm" style={{ background: "#111" }}>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent className="border-0 max-h-60" style={{ background: "#1a1a1a" }}>
                    {CUBA_PROVINCES.map(p => (
                      <SelectItem key={p} value={p} className="text-white text-sm">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Payment */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wide" style={{ color: "#888" }}>Método de Pago</Label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {PAYMENT_METHODS.map(({ id, label, shortLabel, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                      className="flex flex-col items-center gap-1 p-2 sm:p-3 rounded-xl border text-center transition-all min-w-0"
                      style={{ borderColor: paymentMethod === id ? NEON : "#222", background: paymentMethod === id ? NEON_DIM : "transparent" }}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: paymentMethod === id ? NEON : "#555" }} />
                      <span className="text-[10px] sm:text-xs font-bold leading-tight" style={{ color: paymentMethod === id ? NEON : "#555" }}>
                        <span className="sm:hidden">{shortLabel}</span>
                        <span className="hidden sm:inline">{label}</span>
                      </span>
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
            </div>

            <div className="px-5 py-4 border-t" style={{ borderColor: NEON_BORDER }}>
              <Button type="submit" disabled={createOrder.isPending}
                className="w-full rounded-full font-black text-black border-0 neon-glow py-5"
                style={{ background: NEON }}>
                {createOrder.isPending ? "Procesando..." : `Confirmar Pedido · $${totalPrice.toFixed(2)}`}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
