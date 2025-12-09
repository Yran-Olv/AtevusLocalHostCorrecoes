import React, { useState, useEffect, useMemo } from "react";
import api from "./services/api";
import "react-toastify/dist/ReactToastify.css";
import "./styles/global-theme.css";
import "./styles/text-legibility.css";
import "./components/UI/variables.css";
import useWhitelabel from "./hooks/useWhitelabel";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ptBR } from "@mui/material/locale";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ThemeProvider as MuiStylesThemeProvider } from "@mui/styles";
import { ThemeProvider as MaterialUIThemeProvider } from "@material-ui/styles";
import ColorModeContext from "./layout/themeContext";
import { ActiveMenuProvider } from "./context/ActiveMenuContext";
import Favicon from "react-favicon";
import { getBackendUrl } from "./config";
import Routes from "./routes";
import defaultLogoLight from "./assets/logo.png";
import defaultLogoDark from "./assets/logo-black.png";
import defaultLogoFavicon from "./assets/favicon.ico";
import useSettings from "./hooks/useSettings";
import LoadingScreen from "./components/LoadingScreen";
import SessionConflictModal from "./components/SessionConflictModal";

const queryClient = new QueryClient();

const App = () => {
  const [locale, setLocale] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const appColorLocalStorage = localStorage.getItem("primaryColorLight") || localStorage.getItem("primaryColorDark") || "#065183";
  const appNameLocalStorage = localStorage.getItem("appName") || "";
  // Respeita apenas a preferência salva do usuário, padrão é "light"
  const preferredTheme = window.localStorage.getItem("preferredTheme");
  const [mode, setMode] = useState(preferredTheme || "light");
  const [primaryColorLight, setPrimaryColorLight] = useState(appColorLocalStorage);
  const [primaryColorDark, setPrimaryColorDark] = useState(appColorLocalStorage);
  const [appLogoLight, setAppLogoLight] = useState(defaultLogoLight);
  const [appLogoDark, setAppLogoDark] = useState(defaultLogoDark);
  const [appLogoFavicon, setAppLogoFavicon] = useState(defaultLogoFavicon);
  const [appName, setAppName] = useState(appNameLocalStorage);
  const { getPublicSetting } = useSettings();
  
  // Carregar e aplicar configurações do Whitelabel
  const { config: whitelabelConfig } = useWhitelabel();

  // Estado para gerenciar conflito de sessão
  const [sessionConflict, setSessionConflict] = useState({
    isOpen: false,
    pendingRequest: null
  });

  // Limpar cache ao carregar a aplicação
  useEffect(() => {
    const clearCacheAndLoad = async () => {
      try {
        console.log("🔄 Limpando cache do sistema...");
        
        // Limpar todos os caches do navegador
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          console.log(`🗑️ Encontrados ${cacheNames.length} caches para limpar`);
          await Promise.all(
            cacheNames.map(cacheName => {
              console.log(`🗑️ Limpando cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
          console.log("✅ Todos os caches foram limpos");
        }
        
        // Salvar preferências do usuário antes de limpar
        const preferredTheme = localStorage.getItem("preferredTheme");
        const volume = localStorage.getItem("volume");
        const authToken = localStorage.getItem("token");
        const refreshToken = localStorage.getItem("refreshToken");
        const userId = localStorage.getItem("userId");
        
        // Limpar localStorage e sessionStorage
        localStorage.clear();
        sessionStorage.clear();
        
        // Restaurar preferências importantes
        if (preferredTheme) {
          localStorage.setItem("preferredTheme", preferredTheme);
        }
        if (volume) {
          localStorage.setItem("volume", volume);
        }
        if (authToken) {
          localStorage.setItem("token", authToken);
        }
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        if (userId) {
          localStorage.setItem("userId", userId);
        }
        
        console.log("✅ localStorage limpo (preferências preservadas)");
        
        // Forçar atualização do service worker (com tratamento de erros)
        if ('serviceWorker' in navigator) {
          try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            console.log(`🔄 Encontrados ${registrations.length} service workers`);
            
            for (const registration of registrations) {
              try {
                // Limpar cache antes de desregistrar
                if (registration.active || registration.waiting || registration.installing) {
                  const cacheNames = await caches.keys();
                  await Promise.all(
                    cacheNames.map(cacheName => {
                      try {
                        return caches.delete(cacheName);
                      } catch (err) {
                        console.warn(`Erro ao deletar cache ${cacheName}:`, err);
                        return Promise.resolve();
                      }
                    })
                  );
                }
                
                // Desregistrar service workers antigos
                const unregistered = await registration.unregister();
                if (unregistered) {
                  console.log("🗑️ Service worker desregistrado");
                }
              } catch (err) {
                // Ignorar erros de desregistro (pode já estar em estado inválido)
                console.warn("Erro ao desregistrar service worker (não crítico):", err);
              }
            }
          } catch (err) {
            console.warn("Erro ao gerenciar service workers (não crítico):", err);
          }
        }
        
        // Adicionar timestamp para forçar reload de recursos
        const timestamp = Date.now();
        localStorage.setItem("lastCacheClear", timestamp.toString());
        
        // Forçar reload de recursos estáticos adicionando query string
        const links = document.querySelectorAll('link[rel="stylesheet"], script[src]');
        links.forEach(link => {
          if (link.href || link.src) {
            const url = new URL(link.href || link.src, window.location.origin);
            url.searchParams.set('v', timestamp);
            if (link.href) link.href = url.href;
            if (link.src) link.src = url.href;
          }
        });
        
        console.log("✅ Cache limpo com sucesso! Sistema pronto para carregar.");
        
        // Aguardar um pouco para garantir que tudo foi limpo
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error("❌ Erro ao limpar cache:", error);
      } finally {
        // Aguardar um mínimo de tempo para mostrar a tela de loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
      }
    };

    clearCacheAndLoad();
  }, []);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === "light" ? "dark" : "light";
          window.localStorage.setItem("preferredTheme", newMode); // Persistindo o tema no localStorage
          return newMode;
        });
      },
      setPrimaryColorLight,
      setPrimaryColorDark,
      setAppLogoLight,
      setAppLogoDark,
      setAppLogoFavicon,
      setAppName,
      appLogoLight,
      appLogoDark,
      appLogoFavicon,
      appName,
      mode,
    }),
    [appLogoLight, appLogoDark, appLogoFavicon, appName, mode]
  );

  const theme = useMemo(
    () =>
      createTheme(
        {
          scrollbarStyles: {
            "&::-webkit-scrollbar": {
              width: "8px",
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
              backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
            },
          },
          scrollbarStylesSoft: {
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: mode === "light" ? "#F3F3F3" : "#333333",
            },
          },
          palette: {
            mode,
            primary: { 
              main: mode === "light" ? primaryColorLight : primaryColorDark,
              light: mode === "light" ? primaryColorLight : primaryColorDark,
              dark: mode === "light" ? primaryColorDark : primaryColorLight,
            },
            secondary: {
              main: mode === "light" ? "#f50057" : "#f48fb1",
            },
            error: {
              main: "#f44336",
            },
            warning: {
              main: "#ff9800",
            },
            info: {
              main: "#2196f3",
            },
            success: {
              main: "#4caf50",
            },
            textPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
            borderPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
            dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
            light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
            fontColor: mode === "light" ? primaryColorLight : primaryColorDark,
            tabHeaderBackground: mode === "light" ? "#f0f2f5" : "#666",
            optionsBackground: mode === "light" ? "#fafafa" : "#333",
            fancyBackground: mode === "light" ? "#fafafa" : "#333",
            total: mode === "light" ? "#fff" : "#222",
            messageIcons: mode === "light" ? "grey" : "#F3F3F3",
            inputBackground: mode === "light" ? "#FFFFFF" : "#333",
            barraSuperior: mode === "light" ? primaryColorLight : "#666",
            background: {
              paper: mode === "light" ? "#fff" : "#424242",
              default: mode === "light" ? "#fafafa" : "#303030",
            },
            text: {
              primary: mode === "light" ? "rgba(0, 0, 0, 0.87)" : "#fff",
              secondary: mode === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.7)",
            },
          },
          mode,
          appLogoLight,
          appLogoDark,
          appLogoFavicon,
          appName,
          calculatedLogoDark: () => {
            if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
              return appLogoLight;
            }
            return appLogoDark;
          },
          calculatedLogoLight: () => {
            if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
              return appLogoDark;
            }
            return appLogoLight;
          },
        },
        locale
      ),
    [appLogoLight, appLogoDark, appLogoFavicon, appName, locale, mode, primaryColorDark, primaryColorLight]
  );

  useEffect(() => {
    const i18nlocale = localStorage.getItem("i18nextLng");
    const browserLocale = i18nlocale.substring(0, 2) + i18nlocale.substring(3, 5);

    if (browserLocale === "ptBR") {
      setLocale(ptBR);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("preferredTheme", mode);
  }, [mode]);

  useEffect(() => {
    // Carregar configurações públicas de forma silenciosa
    // Se falhar, usa valores padrão sem mostrar erros no console
    const loadPublicSettings = async () => {
      try {
        const [primaryColorLight, primaryColorDark, appLogoLight, appLogoDark, appLogoFavicon, appName] = await Promise.allSettled([
          getPublicSetting("primaryColorLight"),
          getPublicSetting("primaryColorDark"),
          getPublicSetting("appLogoLight"),
          getPublicSetting("appLogoDark"),
          getPublicSetting("appLogoFavicon"),
          getPublicSetting("appName")
        ]);

        if (primaryColorLight.status === 'fulfilled' && primaryColorLight.value) {
          setPrimaryColorLight(primaryColorLight.value || "#0000FF");
        }
        if (primaryColorDark.status === 'fulfilled' && primaryColorDark.value) {
          setPrimaryColorDark(primaryColorDark.value || "#39ACE7");
        }
        if (appLogoLight.status === 'fulfilled' && appLogoLight.value) {
          setAppLogoLight(appLogoLight.value ? getBackendUrl() + "/public/" + appLogoLight.value : defaultLogoLight);
        }
        if (appLogoDark.status === 'fulfilled' && appLogoDark.value) {
          setAppLogoDark(appLogoDark.value ? getBackendUrl() + "/public/" + appLogoDark.value : defaultLogoDark);
        }
        if (appLogoFavicon.status === 'fulfilled' && appLogoFavicon.value) {
          setAppLogoFavicon(appLogoFavicon.value ? getBackendUrl() + "/public/" + appLogoFavicon.value : defaultLogoFavicon);
        }
        if (appName.status === 'fulfilled' && appName.value) {
          setAppName(appName.value || "Multivus");
        }
      } catch (error) {
        // Silenciar erros - usa valores padrão
        console.warn("Não foi possível carregar algumas configurações públicas:", error.message);
      }
    };

    loadPublicSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--primaryColor", mode === "light" ? primaryColorLight : primaryColorDark);
    root.setAttribute("data-theme", mode);
    
    // Reaplicar estilos do Whitelabel quando o tema mudar
    if (whitelabelConfig) {
      const { applyWhitelabelStyles } = require("./hooks/useWhitelabel");
      applyWhitelabelStyles(whitelabelConfig);
    }
  }, [primaryColorLight, primaryColorDark, mode, whitelabelConfig]);

  useEffect(() => {
    async function fetchVersionData() {
      try {
        const response = await api.get("/version");
        const { data } = response;
        window.localStorage.setItem("frontendVersion", data.version);
      } catch (error) {
        console.log("Error fetching data", error);
      }
    }
    fetchVersionData();
  }, []);

  // Listener para conflito de sessão
  useEffect(() => {
    const handleSessionConflict = (event) => {
      setSessionConflict({
        isOpen: true,
        pendingRequest: event.detail.originalRequest
      });
    };

    window.addEventListener('session-conflict', handleSessionConflict);

    return () => {
      window.removeEventListener('session-conflict', handleSessionConflict);
    };
  }, []);

  // Funções para lidar com a escolha do usuário
  const handleKeepCurrent = async () => {
    try {
      // Desconectar outras sessões incrementando tokenVersion
      const { data } = await api.post("/auth/disconnect-other-sessions", {}, {
        withCredentials: true
      });
      
      if (data && data.token) {
        localStorage.setItem("token", JSON.stringify(data.token));
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
      }
      
      // Tentar novamente a requisição pendente
      if (sessionConflict.pendingRequest) {
        await api(sessionConflict.pendingRequest);
      }
      
      setSessionConflict({ isOpen: false, pendingRequest: null });
    } catch (error) {
      console.error("Erro ao manter apenas esta sessão:", error);
      // Se falhar, recarregar a página
      window.location.reload();
    }
  };

  const handleKeepBoth = async () => {
    try {
      // Atualizar refresh token permitindo múltiplas sessões
      const { data } = await api.post("/auth/refresh_token", {
        allowMultipleSessions: true
      }, {
        withCredentials: true
      });
      
      if (data && data.token) {
        localStorage.setItem("token", JSON.stringify(data.token));
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
      }
      
      // Tentar novamente a requisição pendente
      if (sessionConflict.pendingRequest) {
        await api(sessionConflict.pendingRequest);
      }
      
      setSessionConflict({ isOpen: false, pendingRequest: null });
    } catch (error) {
      console.error("Erro ao manter ambas as sessões:", error);
      // Se falhar, recarregar a página
      window.location.reload();
    }
  };

  // Mostrar tela de loading enquanto limpa cache
  if (isLoading) {
    return <LoadingScreen appName={appName || "Multivus"} />;
  }

  return (
    <>
      <Favicon url={appLogoFavicon ? getBackendUrl() + "/public/" + appLogoFavicon : defaultLogoFavicon} />
      <SessionConflictModal
        isOpen={sessionConflict.isOpen}
        onKeepCurrent={handleKeepCurrent}
        onKeepBoth={handleKeepBoth}
        onClose={() => setSessionConflict({ isOpen: false, pendingRequest: null })}
      />
      <ColorModeContext.Provider value={{ colorMode }}>
        <ThemeProvider theme={theme}>
          <MuiStylesThemeProvider theme={theme}>
            <MaterialUIThemeProvider theme={theme}>
              <QueryClientProvider client={queryClient}>
                <ActiveMenuProvider>
                  <Routes />
                </ActiveMenuProvider>
              </QueryClientProvider>
            </MaterialUIThemeProvider>
          </MuiStylesThemeProvider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
};

export default App;
