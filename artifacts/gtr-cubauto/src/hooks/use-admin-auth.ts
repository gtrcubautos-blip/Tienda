import { useState } from "react";
import { useLocation } from "wouter";
import { adminLogin } from "@workspace/api-client-react";
import { getAdminToken, setAdminToken, clearAdminToken } from "@/lib/admin-token";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => getAdminToken() !== null);
  const [, setLocation] = useLocation();

  const login = async (password: string): Promise<boolean> => {
    try {
      const { token } = await adminLogin({ password });
      setAdminToken(token);
      setIsAuthenticated(true);
      setLocation("/admin/dashboard");
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    clearAdminToken();
    setIsAuthenticated(false);
    setLocation("/admin");
  };

  return { isAuthenticated, login, logout };
}
