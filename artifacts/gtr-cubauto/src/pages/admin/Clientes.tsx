import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useListCustomers, useDeleteCustomer, useSendCampaign, getListCustomersQueryKey,
  useListWholesaleCustomers, useDeleteWholesaleCustomer, getListWholesaleCustomersQueryKey,
} from "@workspace/api-client-react";
import type { WholesaleCustomerRecord } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import ExcelJS from "exceljs";
import {
  Users, Search, Trash2, Send, MapPin, Phone, Mail, X, ChevronDown, ChevronUp,
  Building2, FileSpreadsheet, ExternalLink, Camera,
} from "lucide-react";

const NEON = "#00ff41";
const NEON_DIM = "#00ff4115";
const NEON_BORDER = "#00ff4130";

const CUBA_PROVINCES = [
  "Pinar del Río","Artemisa","La Habana","Mayabeque","Matanzas",
  "Villa Clara","Cienfuegos","Sancti Spíritus","Ciego de Ávila",
  "Camagüey","Las Tunas","Holguín","Granma","Santiago de Cuba",
  "Guantánamo","Isla de la Juventud",
];

type Tab = "retail" | "mayoristas";

export default function Clientes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("retail");

  // — Retail —
  const { data: customers = [], isLoading } = useListCustomers();
  const deleteMutation = useDeleteCustomer();
  const campaignMutation = useSendCampaign();
  const [search, setSearch] = useState("");
  const [filterProvince, setFilterProvince] = useState("");
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState("");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  // — Mayoristas —
  const { data: wholesale = [], isLoading: wLoading } = useListWholesaleCustomers();
  const wDeleteMutation = useDeleteWholesaleCustomer();
  const [wSearch, setWSearch] = useState("");
  const [wFilterProvince, setWFilterProvince] = useState("");
  const [wFilterType, setWFilterType] = useState("");
  const [wConfirmDelete, setWConfirmDelete] = useState<number | null>(null);

  // — Retail helpers —
  const filteredRetail = customers.filter(c => {
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q))
      && (!filterProvince || c.province === filterProvince);
  });
  const provinceCount = (prov: string) => customers.filter(c => c.province === prov).length;

  const toggleProvince = (prov: string) =>
    setSelectedProvinces(prev => prev.includes(prov) ? prev.filter(p => p !== prov) : [...prev, prov]);

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
        toast({ title: "Cliente eliminado" });
        setConfirmDelete(null);
      },
    });
  };

  const handleCampaign = () => {
    if (!campaignMsg.trim()) { toast({ title: "Mensaje vacío", variant: "destructive" }); return; }
    campaignMutation.mutate({ data: { message: campaignMsg.trim(), provinces: selectedProvinces } }, {
      onSuccess: (result) => {
        toast({ title: `Campaña registrada — ${result.sent} destinatario${result.sent !== 1 ? "s" : ""}` });
        setCampaignMsg(""); setShowCampaign(false);
      },
    });
  };

  // — Mayoristas helpers —
  const filteredWholesale = wholesale.filter(c => {
    const q = wSearch.toLowerCase();
    return (
      (!q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
        || c.phone.includes(q) || c.companyName.toLowerCase().includes(q)
        || c.clientCode.toLowerCase().includes(q) || c.onatDocument.toLowerCase().includes(q))
      && (!wFilterProvince || c.province === wFilterProvince)
      && (!wFilterType || c.companyType === wFilterType)
    );
  });

  const handleWDelete = (id: number) => {
    wDeleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWholesaleCustomersQueryKey() });
        toast({ title: "Cliente mayorista eliminado" });
        setWConfirmDelete(null);
      },
    });
  };

  const handleExportExcel = async () => {
    const rows = filteredWholesale.map((c: WholesaleCustomerRecord) => ({
      "Código Cliente": c.clientCode,
      "Nº Cliente": c.clientNumber,
      "Tipo": c.companyType,
      "Empresa": c.companyName,
      "Responsable": c.name,
      "Provincia": c.province,
      "Teléfono": c.phone,
      "Email": c.email,
      "ONAT": c.onatDocument,
      "Foto ONAT": c.onatPhotoPath ? "Sí" : "No",
      "Fecha Registro": new Date(c.createdAt).toLocaleDateString("es-CU", {
        day: "2-digit", month: "2-digit", year: "numeric"
      }),
    }));

    const colWidths = [16, 10, 8, 28, 24, 18, 16, 28, 18, 10, 14];

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet("Clientes Mayoristas");

    if (rows.length > 0) {
      const headers = Object.keys(rows[0]) as (keyof (typeof rows)[0])[];
      ws.columns = headers.map((key, i) => ({
        header: String(key),
        key: String(key),
        width: colWidths[i] ?? 12,
      }));
      rows.forEach(row => ws.addRow(row));
    }

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GTR_Mayoristas_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({ title: "Excel exportado", description: `${rows.length} clientes exportados.` });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: NEON }}>
            <Users className="h-6 w-6" /> Clientes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {customers.length} retail · {wholesale.length} mayorista{wholesale.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#0d0d0d", border: `1px solid #222` }}>
          {([
            { id: "retail", label: "Clientes Retail", icon: Users, count: customers.length },
            { id: "mayoristas", label: "Clientes Mayoristas", icon: Building2, count: wholesale.length },
          ] as const).map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: tab === t.id ? NEON : "transparent",
                color: tab === t.id ? "#000" : "#666",
              }}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: tab === t.id ? "#00000033" : "#1a1a1a", color: tab === t.id ? "#000" : "#555" }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* ─── RETAIL TAB ─────────────────────────────── */}
        {tab === "retail" && (
          <>
            {/* Campaign button */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div />
              <Button onClick={() => setShowCampaign(p => !p)}
                className="font-bold flex items-center gap-2"
                style={{ background: NEON, color: "#000" }}>
                <Send className="h-4 w-4" />
                Enviar Campaña
                {showCampaign ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            {/* Campaign panel */}
            {showCampaign && (
              <div className="rounded-2xl border p-5 space-y-4" style={{ background: NEON_DIM, borderColor: NEON_BORDER }}>
                <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: NEON }}>
                  Nueva Campaña Publicitaria
                </h2>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Selecciona provincias — vacío = todos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {CUBA_PROVINCES.map(prov => {
                      const cnt = provinceCount(prov);
                      const sel = selectedProvinces.includes(prov);
                      return (
                        <button key={prov} type="button" onClick={() => toggleProvince(prov)}
                          className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
                          style={{ background: sel ? NEON : "#111", borderColor: sel ? NEON : "#333", color: sel ? "#000" : "#aaa" }}>
                          {prov} {cnt > 0 && `(${cnt})`}
                        </button>
                      );
                    })}
                  </div>
                  {selectedProvinces.length > 0 && (
                    <button type="button" className="text-xs underline" style={{ color: NEON }}
                      onClick={() => setSelectedProvinces([])}>Limpiar selección</button>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Mensaje</label>
                  <Textarea value={campaignMsg} onChange={e => setCampaignMsg(e.target.value)}
                    placeholder="¡Ofertas exclusivas esta semana!..." rows={4}
                    className="text-white border resize-none" style={{ background: "#0a0a0a", borderColor: "#333" }} />
                  <p className="text-xs text-muted-foreground">
                    Destinatarios:{" "}
                    <span style={{ color: NEON }} className="font-bold">
                      {selectedProvinces.length === 0
                        ? customers.length
                        : customers.filter(c => selectedProvinces.includes(c.province)).length}
                    </span>
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCampaign} disabled={!campaignMsg.trim() || campaignMutation.isPending}
                    className="font-bold flex items-center gap-2" style={{ background: NEON, color: "#000" }}>
                    <Send className="h-4 w-4" />
                    {campaignMutation.isPending ? "Registrando..." : "Registrar Campaña"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCampaign(false)}>
                    <X className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Total Clientes", value: customers.length },
                { label: "Provincias", value: [...new Set(customers.map(c => c.province))].length },
                { label: "Esta semana", value: customers.filter(c => Date.now() - new Date(c.createdAt).getTime() < 7 * 86400000).length },
                { label: "Hoy", value: customers.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length },
              ].map(s => (
                <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: "#0a0a0a", borderColor: NEON_BORDER }}>
                  <p className="text-2xl font-black" style={{ color: NEON }}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre, email o teléfono..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9 border text-white" style={{ background: "#0a0a0a", borderColor: "#333" }} />
              </div>
              <select value={filterProvince} onChange={e => setFilterProvince(e.target.value)}
                className="text-sm rounded-lg border px-3 py-2"
                style={{ background: "#0a0a0a", borderColor: "#333", color: filterProvince ? NEON : "#aaa" }}>
                <option value="">Todas las provincias</option>
                {CUBA_PROVINCES.map(p => <option key={p} value={p}>{p} ({provinceCount(p)})</option>)}
              </select>
              {(search || filterProvince) && (
                <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterProvince(""); }}>
                  <X className="h-4 w-4 mr-1" /> Limpiar
                </Button>
              )}
            </div>

            {/* Retail table */}
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: NEON_BORDER }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#0d0d0d", borderBottom: `1px solid ${NEON_BORDER}` }}>
                    {["Nombre", "Teléfono", "Email", "Provincia", "Registro", ""].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Cargando clientes...</td></tr>
                  ) : filteredRetail.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                      {customers.length === 0 ? "No hay clientes registrados aún." : "No se encontraron resultados."}
                    </td></tr>
                  ) : filteredRetail.map(c => (
                    <tr key={c.id} className="border-t" style={{ borderColor: "#1a1a1a" }}>
                      <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5 shrink-0" />{c.phone}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />{c.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs flex items-center gap-1 w-fit" style={{ borderColor: NEON_BORDER, color: NEON }}>
                          <MapPin className="h-3 w-3" />{c.province}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("es-CU", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3">
                        {confirmDelete === c.id ? (
                          <div className="flex gap-1.5 items-center">
                            <span className="text-xs text-red-400">¿Eliminar?</span>
                            <Button size="sm" variant="destructive" className="h-7 px-2 text-xs"
                              onClick={() => handleDelete(c.id)}>Sí</Button>
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs"
                              onClick={() => setConfirmDelete(null)}>No</Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            onClick={() => setConfirmDelete(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRetail.length > 0 && (
                <div className="px-4 py-2.5 text-xs text-muted-foreground border-t" style={{ borderColor: NEON_BORDER }}>
                  Mostrando {filteredRetail.length} de {customers.length} cliente{customers.length !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </>
        )}

        {/* ─── MAYORISTAS TAB ─────────────────────────── */}
        {tab === "mayoristas" && (
          <>
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1">
                {[
                  { label: "Total Mayoristas", value: wholesale.length },
                  { label: "TCP", value: wholesale.filter(c => c.companyType === "TCP").length },
                  { label: "MIPYME", value: wholesale.filter(c => c.companyType === "MIPYME").length },
                  { label: "Este mes", value: wholesale.filter(c => {
                    const d = new Date(c.createdAt);
                    const now = new Date();
                    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                  }).length },
                ].map(s => (
                  <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: "#0a0a0a", borderColor: NEON_BORDER }}>
                    <p className="text-2xl font-black" style={{ color: NEON }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
              <Button onClick={handleExportExcel}
                className="font-bold flex items-center gap-2 shrink-0"
                style={{ background: "#1a6b1a", color: "#fff", border: "1px solid #2a9b2a" }}>
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por nombre, empresa, código, ONAT..."
                  value={wSearch} onChange={e => setWSearch(e.target.value)}
                  className="pl-9 border text-white" style={{ background: "#0a0a0a", borderColor: "#333" }} />
              </div>
              <select value={wFilterType} onChange={e => setWFilterType(e.target.value)}
                className="text-sm rounded-lg border px-3 py-2"
                style={{ background: "#0a0a0a", borderColor: "#333", color: wFilterType ? NEON : "#aaa" }}>
                <option value="">TCP y MIPYME</option>
                <option value="TCP">TCP</option>
                <option value="MIPYME">MIPYME</option>
              </select>
              <select value={wFilterProvince} onChange={e => setWFilterProvince(e.target.value)}
                className="text-sm rounded-lg border px-3 py-2"
                style={{ background: "#0a0a0a", borderColor: "#333", color: wFilterProvince ? NEON : "#aaa" }}>
                <option value="">Todas las provincias</option>
                {CUBA_PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {(wSearch || wFilterProvince || wFilterType) && (
                <Button variant="ghost" size="sm"
                  onClick={() => { setWSearch(""); setWFilterProvince(""); setWFilterType(""); }}>
                  <X className="h-4 w-4 mr-1" /> Limpiar
                </Button>
              )}
            </div>

            {/* Wholesale table */}
            <div className="rounded-2xl border overflow-x-auto" style={{ borderColor: NEON_BORDER }}>
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr style={{ background: "#0d0d0d", borderBottom: `1px solid ${NEON_BORDER}` }}>
                    {["Código", "Empresa", "Tipo", "Responsable", "Provincia", "Teléfono", "Email", "ONAT", "Foto", "Registro", ""].map(h => (
                      <th key={h} className="text-left px-3 py-3 font-bold text-xs uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {wLoading ? (
                    <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">Cargando mayoristas...</td></tr>
                  ) : filteredWholesale.length === 0 ? (
                    <tr><td colSpan={11} className="text-center py-12 text-muted-foreground">
                      {wholesale.length === 0
                        ? "No hay clientes mayoristas registrados aún."
                        : "No se encontraron resultados."}
                    </td></tr>
                  ) : filteredWholesale.map(c => (
                    <tr key={c.id} className="border-t" style={{ borderColor: "#1a1a1a" }}>
                      <td className="px-3 py-3">
                        <span className="font-mono font-bold text-xs" style={{ color: NEON }}>{c.clientCode}</span>
                      </td>
                      <td className="px-3 py-3">
                        <p className="font-medium text-white text-xs leading-tight max-w-[160px] truncate">{c.companyName}</p>
                      </td>
                      <td className="px-3 py-3">
                        <Badge className="text-xs font-bold"
                          style={{ background: c.companyType === "TCP" ? "#00ff4120" : "#0066ff20",
                            color: c.companyType === "TCP" ? NEON : "#4499ff",
                            border: `1px solid ${c.companyType === "TCP" ? "#00ff4140" : "#4499ff40"}` }}>
                          {c.companyType}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-white text-xs">{c.name}</td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[90px]">{c.province}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-muted-foreground text-xs">
                          <Phone className="h-3 w-3 shrink-0" />{c.phone}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-muted-foreground text-xs truncate max-w-[140px]">
                          <Mail className="h-3 w-3 shrink-0" />{c.email}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono text-xs text-muted-foreground">{c.onatDocument}</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {c.onatPhotoPath ? (
                          <a
                            href={`${import.meta.env.BASE_URL}api/storage/objects${c.onatPhotoPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver foto ONAT"
                            className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg transition-colors"
                            style={{ background: "#00ff4115", color: NEON, border: "1px solid #00ff4130" }}
                          >
                            <Camera className="h-3 w-3" />
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(c.createdAt).toLocaleDateString("es-CU", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-3 py-3">
                        {wConfirmDelete === c.id ? (
                          <div className="flex gap-1 items-center">
                            <span className="text-xs text-red-400">¿Eliminar?</span>
                            <Button size="sm" variant="destructive" className="h-6 px-2 text-xs"
                              onClick={() => handleWDelete(c.id)}>Sí</Button>
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs"
                              onClick={() => setWConfirmDelete(null)}>No</Button>
                          </div>
                        ) : (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-red-400"
                            onClick={() => setWConfirmDelete(c.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWholesale.length > 0 && (
                <div className="px-4 py-2.5 text-xs text-muted-foreground border-t flex items-center justify-between" style={{ borderColor: NEON_BORDER }}>
                  <span>Mostrando {filteredWholesale.length} de {wholesale.length} mayorista{wholesale.length !== 1 ? "s" : ""}</span>
                  <button type="button" onClick={handleExportExcel}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg transition-colors"
                    style={{ background: "#1a6b1a22", color: "#2a9b2a", border: "1px solid #2a9b2a44" }}>
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    Exportar a Excel
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
