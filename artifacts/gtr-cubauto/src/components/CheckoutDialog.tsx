import { useState } from "react";
import { useCreateOrder } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListProductsQueryKey } from "@workspace/api-client-react";
import { CreditCard, Smartphone, Truck, CheckCircle2 } from "lucide-react";

type Product = { id: number; name: string; price: number; stock: number };

interface CheckoutDialogProps {
  product: Product | null;
  onClose: () => void;
  accentColor?: string;
  accentColorLight?: string;
}

const PAYMENT_METHODS = [
  { id: "zelle", label: "Zelle", icon: Smartphone, desc: "Pago digital instantáneo" },
  { id: "card", label: "Tarjeta de Crédito", icon: CreditCard, desc: "Visa, Mastercard, Amex" },
  { id: "cod", label: "Contra Entrega", icon: Truck, desc: "Paga al recibir el pedido" },
] as const;

type PaymentMethod = typeof PAYMENT_METHODS[number]["id"];

export function CheckoutDialog({ product, onClose, accentColor = "#16a34a", accentColorLight = "#16a34a22" }: CheckoutDialogProps) {
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"form" | "success">("form");
  const [clientName, setClientName] = useState("");
  const [qty, setQty] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [zelleRef, setZelleRef] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [address, setAddress] = useState("");

  const total = (product?.price ?? 0) * qty;

  const handleClose = () => {
    setStep("form");
    setClientName(""); setQty(1); setPaymentMethod("cod");
    setZelleRef(""); setCardNum(""); setCardName(""); setCardExpiry(""); setCardCvv(""); setAddress("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    const payLabels: Record<PaymentMethod, string> = { zelle: "Zelle", card: "Tarjeta", cod: "Contra Entrega" };
    const payExtra: Record<PaymentMethod, string> = {
      zelle: zelleRef ? ` Ref:${zelleRef}` : "",
      card: cardNum ? ` Tarjeta:****${cardNum.slice(-4)}` : "",
      cod: address ? ` Dir:${address}` : "",
    };
    const fullName = `${clientName || "Cliente Web"} [${payLabels[paymentMethod]}${payExtra[paymentMethod]}]`;
    createOrder.mutate(
      { data: { clientName: fullName, type: "retail", items: [{ productId: product.id, productName: product.name, qty, unitPrice: product.price }] } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setStep("success");
        },
        onError: () => toast({ title: "Error", description: "No se pudo procesar la orden.", variant: "destructive" }),
      }
    );
  };

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-md">
        {step === "success" ? (
          <div className="flex flex-col items-center py-8 gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: accentColorLight }}>
              <CheckCircle2 className="h-8 w-8" style={{ color: accentColor }} />
            </div>
            <h2 className="text-2xl font-black text-white">¡Orden Confirmada!</h2>
            <p className="text-zinc-400 text-center">Tu pedido de <strong className="text-white">{product?.name}</strong> fue registrado. Nos pondremos en contacto contigo pronto.</p>
            <div className="w-full rounded-xl p-4 border border-zinc-700 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Método de pago:</span><span className="font-semibold">{PAYMENT_METHODS.find(m => m.id === paymentMethod)?.label}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Cantidad:</span><span className="font-semibold">{qty} unidad(es)</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Total:</span><span className="font-black text-lg" style={{ color: accentColor }}>${total.toFixed(2)}</span></div>
            </div>
            <Button className="w-full rounded-full text-white" style={{ background: accentColor }} onClick={handleClose}>Cerrar</Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-white text-xl">Confirmar Compra</DialogTitle>
              <DialogDescription className="text-zinc-400">
                <strong className="text-white">{product?.name}</strong> — ${product?.price.toFixed(2)} c/u
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name + Qty */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wide">Nombre completo</Label>
                  <Input required value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Juan Pérez" className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wide">Cantidad</Label>
                  <Input type="number" required min="1" max={product?.stock} value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))} className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div className="space-y-1">
                  <Label className="text-zinc-300 text-xs uppercase tracking-wide">Total</Label>
                  <div className="h-10 flex items-center px-3 rounded-md border border-zinc-700 font-black text-lg" style={{ color: accentColor }}>${total.toFixed(2)}</div>
                </div>
              </div>

              {/* Payment method */}
              <div className="space-y-2">
                <Label className="text-zinc-300 text-xs uppercase tracking-wide">Método de Pago</Label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
                    <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border text-center transition-all"
                      style={{
                        borderColor: paymentMethod === id ? accentColor : "#374151",
                        background: paymentMethod === id ? accentColorLight : "transparent",
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: paymentMethod === id ? accentColor : "#9ca3af" }} />
                      <span className="text-xs font-bold" style={{ color: paymentMethod === id ? accentColor : "#9ca3af" }}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Zelle */}
              {paymentMethod === "zelle" && (
                <div className="rounded-xl p-4 border border-zinc-700 space-y-3" style={{ background: "#0d1117" }}>
                  <div className="text-sm text-zinc-300">
                    <p className="font-bold text-white mb-1">Datos Zelle GTR CUBAUTO:</p>
                    <p>📱 <span className="font-mono text-green-400">+1 (305) 555-0198</span></p>
                    <p>📧 <span className="font-mono text-green-400">pagos@gtrcubauto.com</span></p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-400 text-xs">Número de confirmación Zelle</Label>
                    <Input value={zelleRef} onChange={e => setZelleRef(e.target.value)} placeholder="Ej: ZLL-4829301" className="bg-zinc-800 border-zinc-700 text-white text-sm" />
                  </div>
                </div>
              )}

              {/* Credit Card */}
              {paymentMethod === "card" && (
                <div className="rounded-xl p-4 border border-zinc-700 space-y-3" style={{ background: "#0d1117" }}>
                  <div className="space-y-1">
                    <Label className="text-zinc-400 text-xs">Número de tarjeta</Label>
                    <Input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,"").slice(0,16))} placeholder="0000 0000 0000 0000" className="bg-zinc-800 border-zinc-700 text-white font-mono text-sm" maxLength={16} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-zinc-400 text-xs">Nombre en la tarjeta</Label>
                    <Input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="JUAN PEREZ" className="bg-zinc-800 border-zinc-700 text-white text-sm uppercase" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">Vencimiento</Label>
                      <Input value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} placeholder="MM/AA" className="bg-zinc-800 border-zinc-700 text-white text-sm" maxLength={5} />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-zinc-400 text-xs">CVV</Label>
                      <Input value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g,"").slice(0,4))} placeholder="***" className="bg-zinc-800 border-zinc-700 text-white text-sm" type="password" maxLength={4} />
                    </div>
                  </div>
                </div>
              )}

              {/* Cash on Delivery */}
              {paymentMethod === "cod" && (
                <div className="rounded-xl p-4 border border-zinc-700 space-y-3" style={{ background: "#0d1117" }}>
                  <p className="text-sm text-zinc-300">🚚 <strong className="text-white">Pago al recibir.</strong> Un cobrador visitará tu dirección en 24–48 horas.</p>
                  <div className="space-y-1">
                    <Label className="text-zinc-400 text-xs">Dirección de entrega</Label>
                    <Input required={paymentMethod === "cod"} value={address} onChange={e => setAddress(e.target.value)} placeholder="Calle, No, Ciudad, Provincia" className="bg-zinc-800 border-zinc-700 text-white text-sm" />
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={handleClose} className="border-zinc-700 text-zinc-300">Cancelar</Button>
                <Button type="submit" disabled={createOrder.isPending} className="text-white rounded-full px-6" style={{ background: accentColor }}>
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
