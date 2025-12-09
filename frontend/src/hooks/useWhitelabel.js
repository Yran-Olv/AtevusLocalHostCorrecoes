import { useEffect, useState } from "react";
import api from "../services/api";

const applyWhitelabelStyles = (config) => {
  if (!config) return;

  const root = document.documentElement;
  
  // Menu Lateral
  if (config.sidebarBg) root.style.setProperty("--bg-sidebar", config.sidebarBg);
  if (config.sidebarText) root.style.setProperty("--text-on-sidebar", config.sidebarText);
  if (config.sidebarTextActive) root.style.setProperty("--text-inverse", config.sidebarTextActive);
  if (config.sidebarActiveBorder) root.style.setProperty("--color-primary-light", config.sidebarActiveBorder);
  
  // Navbar
  if (config.navbarBg) root.style.setProperty("--bg-navbar", config.navbarBg);
  if (config.navbarText) root.style.setProperty("--text-on-navbar", config.navbarText);
  
  // Fundo das Páginas
  if (config.pageBgLight) root.style.setProperty("--bg-secondary", config.pageBgLight);
  if (config.pageBgDark) {
    const darkModeStyle = document.querySelector('[data-theme="dark"]') || document.documentElement;
    darkModeStyle.style.setProperty("--bg-secondary", config.pageBgDark);
  }
  
  // Cards
  if (config.cardBgLight) root.style.setProperty("--bg-card", config.cardBgLight);
  if (config.cardBgDark) {
    const darkModeStyle = document.querySelector('[data-theme="dark"]') || document.documentElement;
    darkModeStyle.style.setProperty("--bg-card", config.cardBgDark);
  }
  
  // Textos
  if (config.textPrimaryLight) root.style.setProperty("--text-primary", config.textPrimaryLight);
  if (config.textPrimaryDark) {
    const darkModeStyle = document.querySelector('[data-theme="dark"]') || document.documentElement;
    darkModeStyle.style.setProperty("--text-primary", config.textPrimaryDark);
  }
  if (config.textSecondaryLight) root.style.setProperty("--text-secondary", config.textSecondaryLight);
  if (config.textSecondaryDark) {
    const darkModeStyle = document.querySelector('[data-theme="dark"]') || document.documentElement;
    darkModeStyle.style.setProperty("--text-secondary", config.textSecondaryDark);
  }
  
  // Cores Primárias
  if (config.primaryColor) root.style.setProperty("--color-primary", config.primaryColor);
  if (config.secondaryColor) root.style.setProperty("--color-secondary", config.secondaryColor);
  
  // Fontes
  if (config.fontFamily) {
    root.style.setProperty("--font-family", config.fontFamily);
    document.body.style.fontFamily = config.fontFamily;
  }
  if (config.fontSizeBase) {
    root.style.setProperty("--font-size-base", `${config.fontSizeBase}px`);
    document.body.style.fontSize = `${config.fontSizeBase}px`;
  }
  if (config.fontWeightNormal) root.style.setProperty("--font-weight-normal", config.fontWeightNormal);
  if (config.fontWeightBold) root.style.setProperty("--font-weight-bold", config.fontWeightBold);
};

const useWhitelabel = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWhitelabelConfig = async () => {
      // Verificar se há token antes de tentar carregar
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/whitelabel-config");
        setConfig(data);
        if (data) {
          applyWhitelabelStyles(data);
        }
      } catch (error) {
        // Silenciar erro 401 (não autenticado) - é esperado quando não logado
        if (error.response?.status !== 401) {
          console.error("Erro ao carregar configuração Whitelabel:", error);
        }
        // Usa valores padrão se não conseguir carregar
        setConfig(null);
      } finally {
        setLoading(false);
      }
    };

    loadWhitelabelConfig();

    // Observar mudanças no tema para reaplicar estilos
    const observer = new MutationObserver(() => {
      if (config) {
        applyWhitelabelStyles(config);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Reaplicar estilos quando o config mudar
  useEffect(() => {
    if (config) {
      applyWhitelabelStyles(config);
    }
  }, [config]);

  return { config, setConfig, loading, applyWhitelabelStyles };
};

export default useWhitelabel;
export { applyWhitelabelStyles };

