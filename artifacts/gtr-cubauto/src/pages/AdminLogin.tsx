import { useState } from "react";
import { useLocation } from "wouter";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "RIVERO123") {
      localStorage.setItem("gtr_admin_auth", "true");
      setLocation("/admin/dashboard");
    } else {
      toast({
        title: "Error de autenticación",
        description: "La contraseña ingresada es incorrecta.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-zinc-950 to-zinc-950 pointer-events-none" />
      
      <Card className="w-full max-w-md relative z-10 border-zinc-800 bg-zinc-900/50 backdrop-blur-xl">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <Package className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">GTR CUBAUTO</CardTitle>
          <CardDescription className="text-zinc-400">
            Panel de Administración
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-zinc-950/50 border-zinc-800 text-white placeholder:text-zinc-500"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full text-white font-medium" size="lg">
              Acceder al Sistema
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
