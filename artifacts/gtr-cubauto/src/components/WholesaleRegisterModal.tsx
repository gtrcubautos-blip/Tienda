import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUBA_PROVINCES } from "@/components/WelcomeModal";
import { Building2, CheckCircle2, Copy, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const NEON = "#00ff41";
const NEON_DIM = "#00ff4115";
const NEON_BORDER = "#00ff4130";

const STORAGE_KEY = "gtr_wholesale_registered";

export function isWholesaleRegistered(): boolean {
  return !!localStorage.getItem(STORAGE_KEY);
}

interface WholesaleRegisterModalProps {
  open: boolean;
  onClose: () => void;
}

export function WholesaleRegisterModal({ open, onClose }: WholesaleRegisterModalProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [companyType, setCompanyType] = useState<"TCP" | "MIPYME" | "">("");
  const [companyName, setCompanyName] = useState("");
  const [onatDocument, setOnatDocument] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [clientCode, setClientCode] = useState("");
  const [clientNumber, setClientNumber] = useState(0);

  const canSubmit = name.trim() && phone.trim() && email.trim() && province && companyType && companyName.trim() && onatDocument.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/wholesale-customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          province,
          companyType,
          companyName: companyName.trim(),
          onatDocument: onatDocument.trim(),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setClientCode(data.clientCode);
        setClientNumber(data.clientNumber);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          name, phone, email, province, companyType, companyName, onatDocument,
          clientCode: data.clientCode, clientNumber: data.clientNumber, ts: Date.now()
        }));
        setStep("success");
      } else {
        toast({ title: "Error", description: "No se pudo completar el registro. Intente de nuevo.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error de conexión", description: "Verifique su conexión e intente de nuevo.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(clientCode).then(() =>
      toast({ title: "Copiado", description: "Código de cliente copiado al portapapeles." })
    );
  };

  const handleClose = () => {
    if (step === "form") {
      setName(""); setPhone(""); setEmail(""); setProvince(""); setCompanyType(""); setCompanyName(""); setOnatDocument("");
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <DialogContent
        className="border text-white p-0 overflow-hidden max-w-lg w-full"
        style={{ background: "#080808", borderColor: NEON_BORDER }}
        onPointerDownOutside={e => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Registro Mayorista — GTR CUBAUTO</DialogTitle>
        <DialogDescription className="sr-only">Registro para distribuidores y empresas mayoristas.</DialogDescription>

        {step === "success" ? (
          <div className="flex flex-col items-center py-12 px-8 gap-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: NEON_DIM, border: `2px solid ${NEON}44` }}>
              <CheckCircle2 className="h-10 w-10" style={{ color: NEON }} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">¡Registro Exitoso!</h2>
              <p className="text-sm mt-1" style={{ color: "#888" }}>
                Bienvenido al programa mayorista de GTR CUBAUTO.<br />
                Guarda tu código — lo necesitarás en cada pedido.
              </p>
            </div>

            <div className="w-full rounded-2xl border p-5 space-y-3" style={{ borderColor: NEON_BORDER, background: "#0a0a0a" }}>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#555" }}>Tus datos de acceso</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs" style={{ color: "#666" }}>Código de cliente</p>
                  <p className="text-2xl font-black font-mono" style={{ color: NEON }}>{clientCode}</p>
                </div>
                <button type="button" onClick={handleCopyCode}
                  className="p-2 rounded-lg border transition-colors"
                  style={{ borderColor: NEON_BORDER, background: NEON_DIM, color: NEON }}>
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm border-t pt-3" style={{ borderColor: "#1a1a1a" }}>
                <div>
                  <p className="text-xs" style={{ color: "#555" }}>Número de cliente</p>
                  <p className="font-bold text-white">#{clientNumber.toString().padStart(5, "0")}</p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#555" }}>Tipo de empresa</p>
                  <p className="font-bold" style={{ color: NEON }}>{companyType}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs" style={{ color: "#555" }}>Empresa</p>
                  <p className="font-bold text-white">{companyName}</p>
                </div>
                <div className="col-span-2 rounded-lg p-2.5" style={{ background: "#0d1a0d", border: "1px solid #00ff4122" }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: "#00ff4188" }}>Doc. ONAT</p>
                  <p className="font-mono font-bold text-sm text-white">{onatDocument}</p>
                </div>
              </div>
            </div>

            <p className="text-xs" style={{ color: "#555" }}>
              Nuestro equipo se pondrá en contacto en las próximas 24 horas para activar tu cuenta mayorista.
            </p>

            <Button onClick={handleClose}
              className="w-full rounded-full font-black text-black border-0 neon-glow py-5"
              style={{ background: NEON }}>
              Entendido
            </Button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 pt-5 pb-4 border-b flex items-start justify-between" style={{ borderColor: NEON_BORDER }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center neon-glow" style={{ background: NEON }}>
                  <Building2 className="h-5 w-5 text-black" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white leading-tight">Registro Mayorista</h2>
                  <p className="text-xs" style={{ color: NEON }}>GTR CUBAUTO · Distribuidores</p>
                </div>
              </div>
              <button type="button" onClick={handleClose}
                className="mt-0.5 rounded-full p-1.5 transition-colors hover:bg-white/10"
                style={{ color: "#555" }}>
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 pt-3 pb-1">
              <p className="text-xs" style={{ color: "#666" }}>
                Al registrarte recibirás un <strong style={{ color: NEON }}>código de cliente único</strong> y número de cuenta para acceder a precios mayoristas, órdenes por volumen y condiciones especiales.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Company type */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                  Tipo de empresa <span style={{ color: NEON }}>*</span>
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {(["TCP", "MIPYME"] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setCompanyType(type)}
                      className="p-4 rounded-xl border text-left transition-all"
                      style={{
                        borderColor: companyType === type ? NEON : "#222",
                        background: companyType === type ? NEON_DIM : "#0d0d0d",
                      }}
                    >
                      <p className="font-black text-lg" style={{ color: companyType === type ? NEON : "#aaa" }}>{type}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#666" }}>
                        {type === "TCP" ? "Trabajador por Cuenta Propia" : "Micro, Pequeña y Mediana Empresa"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                  Nombre de la empresa / negocio <span style={{ color: NEON }}>*</span>
                </Label>
                <Input required value={companyName} onChange={e => setCompanyName(e.target.value)}
                  placeholder="Ej: Taller Mecánico San Luis"
                  className="text-white border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  style={{ background: "#111" }} />
              </div>

              {/* ONAT Document */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                  Documento ONAT <span style={{ color: NEON }}>*</span>
                </Label>
                <Input required value={onatDocument} onChange={e => setOnatDocument(e.target.value)}
                  placeholder="Nº de registro tributario (ONAT)"
                  className="text-white border-0 focus-visible:ring-1 focus-visible:ring-primary"
                  style={{ background: "#111" }}
                />
                <p className="text-xs leading-relaxed" style={{ color: "#555" }}>
                  Número de inscripción en la Oficina Nacional de Administración Tributaria. Requerido para acceder a precios mayoristas.
                </p>
              </div>

              {/* Separator */}
              <div className="border-t pt-3" style={{ borderColor: "#1a1a1a" }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "#555" }}>Datos de contacto</p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                  Nombre del responsable <span style={{ color: NEON }}>*</span>
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
                  <SelectTrigger className="text-white border-0 focus:ring-1 focus:ring-primary" style={{ background: "#111" }}>
                    <SelectValue placeholder="Selecciona provincia..." />
                  </SelectTrigger>
                  <SelectContent style={{ background: "#1a1a1a" }}>
                    {CUBA_PROVINCES.map(p => (
                      <SelectItem key={p} value={p} className="text-white">{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Phone + Email */}
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
                    placeholder="correo@empresa.com" type="email"
                    className="text-white border-0 focus-visible:ring-1 focus-visible:ring-primary"
                    style={{ background: "#111" }} />
                </div>
              </div>

              <div className="pt-1 pb-2">
                <Button type="submit" disabled={!canSubmit || submitting}
                  className="w-full rounded-full font-black text-black border-0 py-5 transition-all"
                  style={{
                    background: canSubmit ? NEON : "#222",
                    color: canSubmit ? "#000" : "#555",
                    boxShadow: canSubmit ? `0 0 20px ${NEON}55` : "none",
                  }}>
                  {submitting ? "Registrando..." : "Registrarme como Mayorista"}
                </Button>
                <p className="text-center text-xs mt-3" style={{ color: "#444" }}>
                  Recibirás tu código de cliente y número de cuenta al instante.
                </p>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
