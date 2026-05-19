import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useListCustomers, useDeleteCustomer, useSendCampaign } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCustomersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Search, Trash2, Send, MapPin, Phone, Mail, X, ChevronDown, ChevronUp,
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

export default function Clientes() {
  const { data: customers = [], isLoading } = useListCustomers();
  const deleteMutation = useDeleteCustomer();
  const campaignMutation = useSendCampaign();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterProvince, setFilterProvince] = useState<string>("");
  const [showCampaign, setShowCampaign] = useState(false);
  const [campaignMsg, setCampaignMsg] = useState("");
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q);
    const matchProv = !filterProvince || c.province === filterProvince;
    return matchSearch && matchProv;
  });

  const toggleProvince = (prov: string) => {
    setSelectedProvinces(prev =>
      prev.includes(prov) ? prev.filter(p => p !== prov) : [...prev, prov]
    );
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListCustomersQueryKey() });
        toast({ title: "Cliente eliminado", description: "El registro fue eliminado correctamente." });
        setConfirmDelete(null);
      },
    });
  };

  const handleCampaign = () => {
    if (!campaignMsg.trim()) {
      toast({ title: "Mensaje vacío", description: "Escribe el mensaje de la campaña.", variant: "destructive" });
      return;
    }
    campaignMutation.mutate(
      { data: { message: campaignMsg.trim(), provinces: selectedProvinces } },
      {
        onSuccess: (result) => {
          toast({
            title: `Campaña registrada — ${result.sent} destinatario${result.sent !== 1 ? "s" : ""}`,
            description: selectedProvinces.length === 0
              ? "Todos los clientes están incluidos."
              : `Provincias: ${selectedProvinces.join(", ")}`,
          });
          setCampaignMsg("");
          setShowCampaign(false);
        },
      }
    );
  };

  const provinceCount = (prov: string) => customers.filter(c => c.province === prov).length;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2" style={{ color: NEON }}>
              <Users className="h-6 w-6" /> Clientes Registrados
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {customers.length} cliente{customers.length !== 1 ? "s" : ""} en base de datos
            </p>
          </div>
          <Button
            onClick={() => setShowCampaign(prev => !prev)}
            className="font-bold flex items-center gap-2"
            style={{ background: NEON, color: "#000" }}
          >
            <Send className="h-4 w-4" />
            Enviar Campaña
            {showCampaign ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {/* Campaign Panel */}
        {showCampaign && (
          <div className="rounded-2xl border p-5 space-y-4" style={{ background: NEON_DIM, borderColor: NEON_BORDER }}>
            <h2 className="font-bold text-sm uppercase tracking-widest" style={{ color: NEON }}>
              Nueva Campaña Publicitaria
            </h2>

            {/* Province selector */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Selecciona provincias de destino — deja vacío para enviar a <strong>todos</strong>:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CUBA_PROVINCES.map(prov => {
                  const count = provinceCount(prov);
                  const selected = selectedProvinces.includes(prov);
                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => toggleProvince(prov)}
                      className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
                      style={{
                        background: selected ? NEON : "#111",
                        borderColor: selected ? NEON : "#333",
                        color: selected ? "#000" : "#aaa",
                      }}
                    >
                      {prov} {count > 0 && `(${count})`}
                    </button>
                  );
                })}
              </div>
              {selectedProvinces.length > 0 && (
                <button
                  type="button"
                  className="text-xs underline"
                  style={{ color: NEON }}
                  onClick={() => setSelectedProvinces([])}
                >
                  Limpiar selección
                </button>
              )}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                Mensaje de la campaña
              </label>
              <Textarea
                value={campaignMsg}
                onChange={e => setCampaignMsg(e.target.value)}
                placeholder="¡Ofertas exclusivas esta semana! Nuevos repuestos para motos desde $25 USD. Escríbenos al WhatsApp..."
                rows={4}
                className="text-white border resize-none"
                style={{ background: "#0a0a0a", borderColor: "#333" }}
              />
              <p className="text-xs text-muted-foreground">
                Destinatarios estimados:{" "}
                <span style={{ color: NEON }} className="font-bold">
                  {selectedProvinces.length === 0
                    ? customers.length
                    : customers.filter(c => selectedProvinces.includes(c.province)).length}
                </span>{" "}
                cliente{(selectedProvinces.length === 0 ? customers.length : customers.filter(c => selectedProvinces.includes(c.province)).length) !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCampaign}
                disabled={!campaignMsg.trim() || campaignMutation.isPending}
                className="font-bold flex items-center gap-2"
                style={{ background: NEON, color: "#000" }}
              >
                <Send className="h-4 w-4" />
                {campaignMutation.isPending ? "Registrando..." : "Registrar Campaña"}
              </Button>
              <Button variant="outline" onClick={() => setShowCampaign(false)}>
                <X className="h-4 w-4 mr-1" /> Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Stats by province */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Clientes", value: customers.length },
            { label: "Provincias", value: [...new Set(customers.map(c => c.province))].length },
            { label: "Esta semana", value: customers.filter(c => Date.now() - new Date(c.createdAt).getTime() < 7 * 86400000).length },
            { label: "Hoy", value: customers.filter(c => new Date(c.createdAt).toDateString() === new Date().toDateString()).length },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border p-4 text-center" style={{ background: "#0a0a0a", borderColor: NEON_BORDER }}>
              <p className="text-2xl font-black" style={{ color: NEON }}>{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o teléfono..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 border text-white"
              style={{ background: "#0a0a0a", borderColor: "#333" }}
            />
          </div>
          <select
            value={filterProvince}
            onChange={e => setFilterProvince(e.target.value)}
            className="text-sm rounded-lg border px-3 py-2"
            style={{ background: "#0a0a0a", borderColor: "#333", color: filterProvince ? NEON : "#aaa" }}
          >
            <option value="">Todas las provincias</option>
            {CUBA_PROVINCES.map(p => (
              <option key={p} value={p}>{p} ({provinceCount(p)})</option>
            ))}
          </select>
          {(search || filterProvince) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setFilterProvince(""); }}>
              <X className="h-4 w-4 mr-1" /> Limpiar
            </Button>
          )}
        </div>

        {/* Table */}
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
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">
                  {customers.length === 0 ? "No hay clientes registrados aún." : "No se encontraron resultados."}
                </td></tr>
              ) : (
                filtered.map(c => (
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
                ))
              )}
            </tbody>
          </table>
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 text-xs text-muted-foreground border-t" style={{ borderColor: NEON_BORDER }}>
              Mostrando {filtered.length} de {customers.length} cliente{customers.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
