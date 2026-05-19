import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import Mayorista from "@/pages/Mayorista";
import AdminLogin from "@/pages/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import Inventario from "@/pages/admin/Inventario";
import Precios from "@/pages/admin/Precios";
import Descuentos from "@/pages/admin/Descuentos";
import Ventas from "@/pages/admin/Ventas";
import Config from "@/pages/admin/Config";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/mayorista" component={Mayorista} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={Dashboard} />
      <Route path="/admin/inventario" component={Inventario} />
      <Route path="/admin/precios" component={Precios} />
      <Route path="/admin/descuentos" component={Descuentos} />
      <Route path="/admin/ventas" component={Ventas} />
      <Route path="/admin/config" component={Config} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
