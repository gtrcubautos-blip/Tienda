import { ReactNode, useState, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, ShieldAlert } from "lucide-react";

const FINANCE_PASSWORD = "CESIA123";
const STORAGE_KEY = "gtr_finance_auth";
const NEON = "#00ff41";

export function isFinanceAuthed(): boolean {
  try { return sessionStorage.getItem(STORAGE_KEY) === "true"; } catch { return false; }
}

export function clearFinanceAuth() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function FinanceGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(() => isFinanceAuthed());
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password === FINANCE_PASSWORD) {
      try { sessionStorage.setItem(STORAGE_KEY, "true"); } catch { /* ignore */ }
      setAuthed(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
    }
  };

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center space-y-3 pb-4">
          <div
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center"
            style={{ background: `${NEON}18`, border: `1px solid ${NEON}40` }}
          >
            <ShieldAlert className="h-7 w-7" style={{ color: NEON }} />
          </div>
          <CardTitle className="text-xl font-black">Acceso Restringido</CardTitle>
          <p className="text-sm text-muted-foreground">
            Esta sección está reservada al <strong className="text-foreground">Director de Finanzas</strong>.
            Ingresa la contraseña para continuar.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-finance-gate">
            <div className="space-y-1.5">
              <Label htmlFor="finance-pwd" className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-3 w-3" /> Contraseña de Finanzas
              </Label>
              <Input
                id="finance-pwd"
                type="password"
                autoFocus
                value={password}
                onChange={e => { setPassword(e.target.value); setError(false); }}
                placeholder="••••••••"
                autoComplete="current-password"
                className="text-base"
                data-testid="input-finance-password"
              />
              {error && (
                <p className="text-xs font-bold text-red-500 pt-1">Contraseña incorrecta. Inténtalo de nuevo.</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full font-black text-black border-0"
              style={{ background: NEON }}
              data-testid="btn-finance-submit"
            >
              Acceder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
