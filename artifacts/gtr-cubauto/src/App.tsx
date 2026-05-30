import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Motos from "@/pages/Motos";
import Carros from "@/pages/Carros";
import Piezas from "@/pages/Piezas";
import Multiservicio from "@/pages/Multiservicio";
import Mayorista from "@/pages/Mayorista";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import Inventario from "@/pages/admin/Inventario";
import Precios from "@/pages/admin/Precios";
import Descuentos from "@/pages/admin/Descuentos";
import Ventas from "@/pages/admin/Ventas";
import Config from "@/pages/admin/Config";
import SocialMedia from "@/pages/admin/SocialMedia";
import Personalizacion from "@/pages/admin/Personalizacion";
import Clientes from "@/pages/admin/Clientes";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/motos" component={Motos} />
      <Route path="/carros" component={Carros} />
      <Route path="/piezas" component={Piezas} />
      <Route path="/multiservicio" component={Multiservicio} />
      <Route path="/mayorista" component={Mayorista} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/inventario" component={Inventario} />
      <Route path="/admin/precios" component={Precios} />
      <Route path="/admin/descuentos" component={Descuentos} />
      <Route path="/admin/ventas" component={Ventas} />
      <Route path="/admin/clientes" component={Clientes} />
      <Route path="/admin/social" component={SocialMedia} />
      <Route path="/admin/personalizacion" component={Personalizacion} />
      <Route path="/admin/config" component={Config} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
