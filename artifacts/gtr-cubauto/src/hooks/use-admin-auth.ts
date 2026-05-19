import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem("gtr_admin_auth") === "true";
  });
  const [, setLocation] = useLocation();

  const login = (password: string) => {
    if (password === "RIVERO123") {
      localStorage.setItem("gtr_admin_auth", "true");
      setIsAuthenticated(true);
      setLocation("/admin/dashboard");
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("gtr_admin_auth");
    setIsAuthenticated(false);
    setLocation("/admin");
  };

  return { isAuthenticated, login, logout };
}
