import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";

const NEON = "#00ff41";
const NEON_DIM = "#00ff4115";
const NEON_BORDER = "#00ff4130";
const STORAGE_KEY = "gtr_registered";

const CUBA_PROVINCES = [
  "Pinar del Río","Artemisa","La Habana","Mayabeque","Matanzas",
  "Villa Clara","Cienfuegos","Sancti Spíritus","Ciego de Ávila",
  "Camagüey","Las Tunas","Holguín","Granma","Santiago de Cuba",
  "Guantánamo","Isla de la Juventud",
];

const TERMS_TEXT = `TÉRMINOS Y CONDICIONES GENERALES — GTR CUBAUTO

Última actualización: Mayo 2026

1. OBJETO Y ACEPTACIÓN
Al registrarse y utilizar los servicios de GTR CUBAUTO ("la Tienda"), usted acepta quedar vinculado por los presentes Términos y Condiciones. Si no está de acuerdo con alguna disposición, debe abstenerse de utilizar la plataforma.

2. SERVICIOS OFRECIDOS
GTR CUBAUTO opera como tienda en línea especializada en la venta de repuestos y accesorios para automóviles y motocicletas. Los productos se describen con la mayor exactitud posible; sin embargo, las imágenes son de carácter ilustrativo.

3. PROCESO DE COMPRA Y PRECIOS
Los precios se expresan en dólares estadounidenses (USD). Una vez realizado un pedido, el cliente recibirá confirmación por los canales indicados. GTR CUBAUTO se reserva el derecho de cancelar órdenes en caso de error de precio, falta de stock o imposibilidad de entrega.

4. PEDIDOS PENDIENTES
Los pedidos con estado "Pendiente" tienen una vigencia máxima de 48 horas. Transcurrido ese plazo sin confirmación de pago o sin que se haya podido contactar al cliente, el pedido será cancelado automáticamente y el stock liberado.

5. PAGOS Y MÉTODOS ACEPTADOS
Se aceptan pagos mediante Zelle, tarjeta bancaria y pago contra entrega según disponibilidad de zona. El pago debe efectuarse dentro del período de vigencia del pedido. GTR CUBAUTO no almacena datos de tarjetas de crédito.

6. ENVÍOS Y ENTREGAS
Las entregas se realizan dentro del territorio cubano según zonas habilitadas. Los plazos de entrega son orientativos y pueden verse afectados por circunstancias externas. El riesgo pasa al cliente desde el momento de la entrega física.

7. DEVOLUCIONES Y GARANTÍAS
Se aceptan devoluciones dentro de los 7 días siguientes a la recepción, siempre que el producto se encuentre en su estado original y sin uso, con embalaje intacto. Piezas usadas o instaladas no son susceptibles de devolución salvo defecto de fábrica comprobado.

8. LIMITACIÓN DE RESPONSABILIDAD
GTR CUBAUTO no será responsable de daños indirectos, pérdida de beneficios o daños derivados del uso incorrecto de los productos. La responsabilidad total no excederá el valor del pedido correspondiente.

9. MODIFICACIONES
GTR CUBAUTO se reserva el derecho de modificar estos Términos en cualquier momento. Las modificaciones serán publicadas en la plataforma y entrarán en vigor desde su publicación.`;

const PRIVACY_TEXT = `POLÍTICA DE PRIVACIDAD — GTR CUBAUTO

Última actualización: Mayo 2026

1. RESPONSABLE DEL TRATAMIENTO
GTR CUBAUTO es el responsable del tratamiento de los datos personales que usted nos facilite a través de nuestra plataforma.

2. DATOS QUE RECOPILAMOS
Recopilamos los siguientes datos personales: nombre completo, número de teléfono, correo electrónico y provincia de residencia. Adicionalmente, registramos datos de las transacciones realizadas (productos, montos, método de pago, dirección de entrega).

3. FINALIDAD DEL TRATAMIENTO
Sus datos son utilizados exclusivamente para: (a) gestionar y procesar sus pedidos; (b) comunicarnos con usted sobre el estado de su orden; (c) mejorar nuestros servicios y personalizar su experiencia de compra; (d) cumplir con obligaciones legales aplicables.

4. CONSERVACIÓN DE DATOS
Sus datos se conservarán durante el tiempo necesario para la ejecución del contrato de compraventa y, posteriormente, durante los plazos legales de conservación aplicables. Puede solicitar su eliminación en cualquier momento.

5. COMPARTICIÓN DE DATOS
GTR CUBAUTO no vende, alquila ni cede sus datos personales a terceros con fines comerciales. Podemos compartir datos con proveedores de servicios de pago o logística estrictamente necesarios para la ejecución del pedido, quienes operan bajo acuerdos de confidencialidad.

6. SEGURIDAD
Implementamos medidas técnicas y organizativas para proteger sus datos frente a accesos no autorizados, pérdida o alteración. Sin embargo, ningún sistema de transmisión de datos por internet es absolutamente seguro.

7. DERECHOS DEL USUARIO
Usted tiene derecho a acceder, rectificar, suprimir, limitar el tratamiento y oponerse al uso de sus datos personales. Para ejercer estos derechos, contáctenos a través de los canales oficiales de GTR CUBAUTO.

8. COOKIES Y ALMACENAMIENTO LOCAL
Esta plataforma utiliza almacenamiento local del navegador (localStorage) para guardar preferencias del usuario y datos de sesión. No utilizamos cookies de rastreo de terceros.

9. CAMBIOS EN LA POLÍTICA
Nos reservamos el derecho de actualizar esta Política de Privacidad. Le notificaremos de cambios significativos mediante aviso en la plataforma.`;

type LegalSection = "terms" | "privacy" | null;

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"form" | "done">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [expanded, setExpanded] = useState<LegalSection>(null);

  useEffect(() => {
    const registered = localStorage.getItem(STORAGE_KEY);
    if (!registered) {
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim() && phone.trim() && email.trim() && province && acceptTerms && acceptPrivacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      await fetch(`${import.meta.env.BASE_URL}api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), email: email.trim(), province }),
      });
    } catch {
      // Silently continue — registration saves locally regardless
    } finally {
      setSubmitting(false);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, phone, email, province, ts: Date.now() }));
    setStep("done");
  };

  const handleDone = () => setOpen(false);

  const toggle = (section: LegalSection) =>
    setExpanded(prev => (prev === section ? null : section));

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="border text-white p-0 overflow-hidden max-w-lg w-full"
        style={{ background: "#080808", borderColor: NEON_BORDER }}
        onPointerDownOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Registro de Cliente — GTR CUBAUTO</DialogTitle>
        <DialogDescription className="sr-only">Completa tus datos para acceder a la tienda y acepta los términos y la política de privacidad.</DialogDescription>
        {step === "done" ? (
          /* ── SUCCESS ── */
          <div className="flex flex-col items-center py-12 px-8 gap-5 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: NEON_DIM, border: `2px solid ${NEON}44` }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: NEON }} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">¡Bienvenido, {name.split(" ")[0]}!</h2>
              <p className="text-sm mt-2" style={{ color: "#888" }}>
                Tu registro en GTR CUBAUTO fue exitoso.<br />
                Ya puedes explorar y comprar con total seguridad.
              </p>
            </div>
            <Button onClick={handleDone}
              className="w-full rounded-full font-black text-black border-0 neon-glow py-5"
              style={{ background: NEON }}>
              Entrar a la Tienda
            </Button>
          </div>
        ) : (
          /* ── FORM ── */
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b" style={{ borderColor: NEON_BORDER }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center neon-glow" style={{ background: NEON }}>
                  <Package className="h-4.5 w-4.5 text-black h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">GTR CUBAUTO</h2>
                  <p className="text-xs" style={{ color: NEON }}>Registro de Cliente</p>
                </div>
              </div>
              <p className="text-xs mt-3" style={{ color: "#666" }}>
                Para continuar, completa tus datos. Solo se requieren una vez.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                  Nombre completo <span style={{ color: NEON }}>*</span>
                </Label>
                <Input required value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej: Juan Pérez González"
                  className="text-white border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  style={{ background: "#111" }} />
              </div>

              {/* Province */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                  Provincia <span style={{ color: NEON }}>*</span>
                </Label>
                <Select value={province} onValueChange={setProvince} required>
                  <SelectTrigger className="text-white border-0 focus:ring-1 focus:ring-primary"
                    style={{ background: "#111" }}>
                    <SelectValue placeholder="Selecciona tu provincia..." />
                  </SelectTrigger>
                  <SelectContent style={{ background: "#1a1a1a" }}>
                    {CUBA_PROVINCES.map(p => (
                      <SelectItem key={p} value={p} className="text-white">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone + Email row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                    Teléfono <span style={{ color: NEON }}>*</span>
                  </Label>
                  <Input required value={phone} onChange={e => setPhone(e.target.value)}
                    placeholder="+53 5 000 0000" type="tel"
                    className="text-white border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    style={{ background: "#111" }} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                    Email <span style={{ color: NEON }}>*</span>
                  </Label>
                  <Input required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com" type="email"
                    className="text-white border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    style={{ background: "#111" }} />
                </div>
              </div>

              {/* ── Términos y condiciones ── */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e1e1e" }}>
                <button type="button" onClick={() => toggle("terms")}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left transition-colors"
                  style={{ background: "#0f0f0f", color: expanded === "terms" ? NEON : "#bbb" }}>
                  <span>📄 Términos y Condiciones Generales</span>
                  {expanded === "terms" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expanded === "terms" && (
                  <div className="px-4 py-3 max-h-48 overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap"
                    style={{ background: "#0a0a0a", color: "#888", borderTop: "1px solid #1e1e1e" }}>
                    {TERMS_TEXT}
                  </div>
                )}
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#0c0c0c", borderTop: "1px solid #1a1a1a" }}>
                  <input type="checkbox" id="chk-terms" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                    className="w-4 h-4 rounded accent-green-400 cursor-pointer" />
                  <label htmlFor="chk-terms" className="text-xs cursor-pointer" style={{ color: "#aaa" }}>
                    He leído y acepto los <span style={{ color: NEON }}>Términos y Condiciones</span>
                    <span style={{ color: NEON }}> *</span>
                  </label>
                </div>
              </div>

              {/* ── Política de privacidad ── */}
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#1e1e1e" }}>
                <button type="button" onClick={() => toggle("privacy")}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-left transition-colors"
                  style={{ background: "#0f0f0f", color: expanded === "privacy" ? NEON : "#bbb" }}>
                  <span>🔒 Política de Privacidad</span>
                  {expanded === "privacy" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                {expanded === "privacy" && (
                  <div className="px-4 py-3 max-h-48 overflow-y-auto text-xs leading-relaxed whitespace-pre-wrap"
                    style={{ background: "#0a0a0a", color: "#888", borderTop: "1px solid #1e1e1e" }}>
                    {PRIVACY_TEXT}
                  </div>
                )}
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: "#0c0c0c", borderTop: "1px solid #1a1a1a" }}>
                  <input type="checkbox" id="chk-privacy" checked={acceptPrivacy} onChange={e => setAcceptPrivacy(e.target.checked)}
                    className="w-4 h-4 rounded accent-green-400 cursor-pointer" />
                  <label htmlFor="chk-privacy" className="text-xs cursor-pointer" style={{ color: "#aaa" }}>
                    He leído y acepto la <span style={{ color: NEON }}>Política de Privacidad</span>
                    <span style={{ color: NEON }}> *</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-1 pb-2">
                <Button type="submit" disabled={!canSubmit}
                  className="w-full rounded-full font-black text-black border-0 py-5 transition-all"
                  style={{
                    background: canSubmit ? NEON : "#222",
                    color: canSubmit ? "#000" : "#555",
                    boxShadow: canSubmit ? `0 0 20px ${NEON}55` : "none",
                  }}>
                  {submitting ? "Guardando..." : "Confirmar y Entrar a la Tienda"}
                </Button>
                <p className="text-center text-xs mt-3" style={{ color: "#444" }}>
                  Todos los campos marcados con <span style={{ color: NEON }}>*</span> son obligatorios.
                  Tus datos son confidenciales y nunca serán compartidos con terceros.
                </p>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
