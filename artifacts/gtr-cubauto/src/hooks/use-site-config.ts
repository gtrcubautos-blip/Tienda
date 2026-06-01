import { useState, useEffect } from "react";

export interface SiteConfig {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  promos: Array<{ label: string; text: string }>;
  motosImage: string;
  carrosImage: string;
  piezasImage: string;
  multiservicioImage: string;
  whatsapp: string;
  quoteWhatsapps: Array<{ label: string; number: string }>;
  email: string;
  zellePhone: string;
  fbUrl: string;
  igUrl: string;
  tiktokUrl: string;
}

export const DEFAULT_CONFIG: SiteConfig = {
  heroImage: "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=1800&q=80&fit=crop",
  heroTitle: "GTR CUBAUTO",
  heroSubtitle: "Repuestos de Calidad para Autos y Motos",
  heroDescription: "Todo para tu vehículo en un solo lugar. Los mejores repuestos y accesorios con garantía de calidad y los precios más competitivos de Cuba.",
  promos: [
    { label: "OFERTA SEMANA", text: "20% OFF en lubricantes selectos" },
    { label: "NUEVO STOCK", text: "Kits de embrague desde $62.00" },
    { label: "ENVÍO GRATIS", text: "En compras superiores a $100 USD" },
  ],
  motosImage: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1400&q=85&fit=crop",
  carrosImage: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1400&q=85&fit=crop",
  piezasImage: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=1400&q=85&fit=crop",
  multiservicioImage: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=1400&q=85&fit=crop",
  whatsapp: "+1 (305) 555-0198",
  quoteWhatsapps: [{ label: "Ventas", number: "+53 5 555 5555" }],
  email: "pagos@gtrcubauto.com",
  zellePhone: "+1 (305) 555-0198",
  fbUrl: "https://facebook.com/gtrcubauto",
  igUrl: "https://instagram.com/gtrcubauto",
  tiktokUrl: "https://tiktok.com/@gtrcubauto",
};

const STORAGE_KEY = "gtr_site_config";

export function getSiteConfig(): SiteConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_CONFIG };
}

export function setSiteConfig(config: SiteConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  window.dispatchEvent(new Event("gtr_config_changed"));
}

export function useSiteConfig(): SiteConfig {
  const [config, setConfig] = useState<SiteConfig>(getSiteConfig);
  useEffect(() => {
    const handler = () => setConfig(getSiteConfig());
    window.addEventListener("gtr_config_changed", handler);
    return () => window.removeEventListener("gtr_config_changed", handler);
  }, []);
  return config;
}
