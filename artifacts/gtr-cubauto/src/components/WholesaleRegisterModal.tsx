import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CUBA_PROVINCES } from "@/components/WelcomeModal";
import { Building2, CheckCircle2, Copy, X, Camera, Upload, ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUpload } from "@workspace/object-storage-web";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"form" | "success">("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [province, setProvince] = useState("");
  const [companyType, setCompanyType] = useState<"TCP" | "MIPYME" | "">("");
  const [companyName, setCompanyName] = useState("");
  const [onatDocument, setOnatDocument] = useState("");
  const [onatPhotoPath, setOnatPhotoPath] = useState("");
  const [photoFileName, setPhotoFileName] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clientCode, setClientCode] = useState("");
  const [clientNumber, setClientNumber] = useState(0);

  const { uploadFile, isUploading, error: uploadError, progress } = useUpload({
    onSuccess: (res) => {
      setOnatPhotoPath(res.objectPath);
    },
    onError: () => {
      toast({ title: "Error de subida", description: "No se pudo subir la foto. Intente de nuevo.", variant: "destructive" });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      toast({ title: "Formato no válido", description: "Use JPG, PNG, WEBP o PDF.", variant: "destructive" });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Archivo muy grande", description: "El archivo no puede superar 8 MB.", variant: "destructive" });
      return;
    }

    setPhotoFileName(file.name);
    setOnatPhotoPath("");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }

    await uploadFile(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canSubmit =
    name.trim() &&
    phone.trim() &&
    email.trim() &&
    province &&
    companyType &&
    companyName.trim() &&
    onatDocument.trim() &&
    onatPhotoPath.trim();

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
          onatPhotoPath,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setClientCode(data.clientCode);
        setClientNumber(data.clientNumber);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          name, phone, email, province, companyType, companyName, onatDocument, onatPhotoPath,
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
      setName(""); setPhone(""); setEmail(""); setProvince("");
      setCompanyType(""); setCompanyName(""); setOnatDocument("");
      setOnatPhotoPath(""); setPhotoFileName(""); setPhotoPreview(null);
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
                <div className="col-span-2 flex items-center gap-2 rounded-lg p-2.5" style={{ background: "#0d1a0d", border: "1px solid #00ff4122" }}>
                  <Camera className="h-4 w-4 shrink-0" style={{ color: NEON }} />
                  <p className="text-xs font-bold text-white truncate">Foto ONAT subida ✓</p>
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
                  Número de inscripción en la Oficina Nacional de Administración Tributaria.
                </p>
              </div>

              {/* ONAT Photo Upload */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wide" style={{ color: "#888" }}>
                  Foto / Escáner del ONAT <span style={{ color: NEON }}>*</span>
                </Label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />

                {!onatPhotoPath && !isUploading ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl border-2 border-dashed p-6 flex flex-col items-center gap-3 transition-all hover:border-opacity-80 group"
                    style={{ borderColor: "#333", background: "#0a0a0a" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = NEON + "66")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "#333")}
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: NEON_DIM, border: `1px solid ${NEON_BORDER}` }}>
                      <Camera className="h-6 w-6" style={{ color: NEON }} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-white">Subir foto del ONAT</p>
                      <p className="text-xs mt-0.5" style={{ color: "#555" }}>JPG, PNG, WEBP o PDF · Máx. 8 MB</p>
                    </div>
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold"
                      style={{ background: NEON_DIM, border: `1px solid ${NEON_BORDER}`, color: NEON }}>
                      <Upload className="h-3 w-3" />
                      Seleccionar archivo
                    </div>
                  </button>
                ) : isUploading ? (
                  <div className="w-full rounded-xl border p-4 flex flex-col gap-3"
                    style={{ borderColor: NEON_BORDER, background: "#0a0a0a" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: NEON_DIM, border: `1px solid ${NEON_BORDER}` }}>
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: NEON }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-white truncate">{photoFileName}</p>
                        <p className="text-xs" style={{ color: "#555" }}>Subiendo...</p>
                      </div>
                    </div>
                    <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ background: "#1a1a1a" }}>
                      <div className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%`, background: NEON }} />
                    </div>
                  </div>
                ) : (
                  <div className="w-full rounded-xl border p-4 flex items-center gap-3"
                    style={{ borderColor: "#00ff4144", background: "#0d1a0d" }}>
                    {photoPreview ? (
                      <img src={photoPreview} alt="ONAT preview"
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                        style={{ border: `1px solid ${NEON_BORDER}` }} />
                    ) : (
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: NEON_DIM, border: `1px solid ${NEON_BORDER}` }}>
                        <ImageIcon className="h-5 w-5" style={{ color: NEON }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" style={{ color: NEON }} />
                        <p className="text-xs font-bold text-white truncate">{photoFileName}</p>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "#00ff4177" }}>Documento subido correctamente</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                      style={{ background: "#1a1a1a", color: "#666" }}>
                      Cambiar
                    </button>
                  </div>
                )}

                {uploadError && (
                  <p className="text-xs" style={{ color: "#ff4444" }}>
                    Error al subir: {uploadError.message}
                  </p>
                )}
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
                <Button type="submit" disabled={!canSubmit || submitting || isUploading}
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
