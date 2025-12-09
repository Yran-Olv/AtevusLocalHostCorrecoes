import React, { useEffect, useState, useContext, useRef } from "react";
import Input from "../UI/Input";
import ColorInput from "../UI/ColorInput";
import FileUpload from "../UI/FileUpload";
import Button from "../UI/Button";
import Select from "../UI/Select";
import useSettings from "../../hooks/useSettings";
import { toast } from "react-toastify";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js/index.js";
import ColorModeContext from "../../layout/themeContext";
import api from "../../services/api";
import { getBackendUrl } from "../../config";
import defaultLogoLight from "../../assets/logo.png";
import defaultLogoDark from "../../assets/logo-black.png";
import defaultLogoFavicon from "../../assets/favicon.ico";
import ColorBoxModal from "../ColorBoxModal/index.js";
import { applyWhitelabelStyles } from "../../hooks/useWhitelabel";
import "./Whitelabel.css";

export default function Whitelabel(props) {
  const { settings } = props;
  const [settingsLoaded, setSettingsLoaded] = useState({});
  const [whitelabelConfig, setWhitelabelConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getCurrentUserInfo } = useAuth();
  const [currentUser, setCurrentUser] = useState({});
  const { colorMode } = useContext(ColorModeContext);
  const [primaryColorLightModalOpen, setPrimaryColorLightModalOpen] = useState(false);
  const [primaryColorDarkModalOpen, setPrimaryColorDarkModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("colors");

  const logoLightInput = useRef(null);
  const logoDarkInput = useRef(null);
  const logoFaviconInput = useRef(null);
  const [appName, setAppName] = useState(settingsLoaded.appName || "");

  const { update } = useSettings();

  // Carregar configuração do Whitelabel
  useEffect(() => {
    const loadWhitelabelConfig = async () => {
      try {
        const { data } = await api.get("/whitelabel-config");
        setWhitelabelConfig(data);
      } catch (error) {
        console.error("Erro ao carregar configuração Whitelabel:", error);
      }
    };

    loadWhitelabelConfig();
  }, []);


  function updateSettingsLoaded(key, value) {
    const newSettings = { ...settingsLoaded };
    newSettings[key] = value;
    setSettingsLoaded(newSettings);
  }

  useEffect(() => {
    getCurrentUserInfo().then((u) => {
      setCurrentUser(u);
    });

    if (Array.isArray(settings) && settings.length) {
      const primaryColorLight = settings.find((s) => s.key === "primaryColorLight")?.value;
      const primaryColorDark = settings.find((s) => s.key === "primaryColorDark")?.value;
      const appLogoLight = settings.find((s) => s.key === "appLogoLight")?.value;
      const appLogoDark = settings.find((s) => s.key === "appLogoDark")?.value;
      const appLogoFavicon = settings.find((s) => s.key === "appLogoFavicon")?.value;
      const appName = settings.find((s) => s.key === "appName")?.value;

      setAppName(appName || "");
      setSettingsLoaded({
        ...settingsLoaded,
        primaryColorLight,
        primaryColorDark,
        appLogoLight,
        appLogoDark,
        appLogoFavicon,
        appName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  async function handleSaveSetting(key, value) {
    await update({
      key,
      value,
    });
    updateSettingsLoaded(key, value);
    toast.success("Operação atualizada com sucesso.");
  }

  // Salvar configuração do Whitelabel
  const handleSaveWhitelabelConfig = async () => {
    setLoading(true);
    try {
      const configToSave = {
        ...whitelabelConfig,
        appName: appName || whitelabelConfig?.appName
      };
      
      const { data } = await api.put("/whitelabel-config", configToSave);
      setWhitelabelConfig(data);
      applyWhitelabelStyles(data);
      // Recarregar página para aplicar todas as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      toast.success("Configurações de Whitelabel salvas com sucesso! A página será recarregada...");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  // Resetar para padrões
  const handleResetConfig = async () => {
    if (!window.confirm("Deseja realmente resetar todas as configurações para os valores padrão?")) {
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await api.post("/whitelabel-config/reset");
      setWhitelabelConfig(data);
      applyWhitelabelStyles(data);
      // Recarregar página para aplicar todas as mudanças
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      toast.success("Configurações resetadas para os valores padrão! A página será recarregada...");
    } catch (error) {
      console.error("Erro ao resetar configuração:", error);
      toast.error("Erro ao resetar configurações");
    } finally {
      setLoading(false);
    }
  };

  // Atualizar campo específico
  const handleUpdateField = (field, value) => {
    setWhitelabelConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const uploadLogo = async (e, mode) => {
    if (!e.target.files) {
      return;
    }

    const file = e.target.files[0];
    const formData = new FormData();

    formData.append("typeArch", "logo");
    formData.append("mode", mode);
    formData.append("file", file);

    await api
      .post("/settings-whitelabel/logo", formData, {
        onUploadProgress: (event) => {
          let progress = Math.round((event.loaded * 100) / event.total);
          console.log(`A imagem está ${progress}% carregada... `);
        },
      })
      .then(async (response) => {
        updateSettingsLoaded(`appLogo${mode}`, response.data);
        colorMode[`setAppLogo${mode}`](getBackendUrl() + "/public/" + response.data);
        
        // Atualizar também no WhitelabelConfig
        if (whitelabelConfig) {
          await handleUpdateField(`appLogo${mode}`, response.data);
        }
      })
      .catch((err) => {
        console.error(`Houve um problema ao realizar o upload da imagem.`);
        console.log(err);
        toast.error("Erro ao fazer upload da imagem");
      });
  };

  const calculatedLogoLight = colorMode.appLogoLight || defaultLogoLight;
  const calculatedLogoDark = colorMode.appLogoDark || defaultLogoDark;
  const calculatedLogoFavicon = colorMode.appLogoFavicon || defaultLogoFavicon;

  const fontOptions = [
    { value: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif", label: "Inter (Padrão)" },
    { value: "Roboto, sans-serif", label: "Roboto" },
    { value: "Open Sans, sans-serif", label: "Open Sans" },
    { value: "Lato, sans-serif", label: "Lato" },
    { value: "Montserrat, sans-serif", label: "Montserrat" },
    { value: "Poppins, sans-serif", label: "Poppins" },
    { value: "Nunito, sans-serif", label: "Nunito" },
    { value: "Raleway, sans-serif", label: "Raleway" },
    { value: "Ubuntu, sans-serif", label: "Ubuntu" },
    { value: "Arial, sans-serif", label: "Arial" },
    { value: "Helvetica, sans-serif", label: "Helvetica" },
    { value: "Georgia, serif", label: "Georgia (Serif)" },
    { value: "Times New Roman, serif", label: "Times New Roman (Serif)" },
  ];

  if (!whitelabelConfig) {
    return <div className="whitelabel-container">Carregando...</div>;
  }

  return (
    <div className="whitelabel-container">
      <OnlyForSuperUser
        user={currentUser}
        yes={() => (
          <>
            {/* Seções */}
            <div className="whitelabel-sections">
              <button
                className={`whitelabel-section-btn ${activeSection === "colors" ? "active" : ""}`}
                onClick={() => setActiveSection("colors")}
              >
                Cores
              </button>
              <button
                className={`whitelabel-section-btn ${activeSection === "fonts" ? "active" : ""}`}
                onClick={() => setActiveSection("fonts")}
              >
                Fontes
              </button>
              <button
                className={`whitelabel-section-btn ${activeSection === "logos" ? "active" : ""}`}
                onClick={() => setActiveSection("logos")}
              >
                Logos
              </button>
            </div>

            {/* Seção de Cores */}
            {activeSection === "colors" && (
              <div className="whitelabel-section-content">
                <h3 className="section-title">Cores do Menu Lateral</h3>
                <div className="whitelabel-grid">
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Fundo do Menu Lateral"
                      value={whitelabelConfig.sidebarBg || "#1a1d29"}
                      onChange={(e) => handleUpdateField("sidebarBg", e.target.value)}
                      helperText="Cor de fundo do menu lateral"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Texto do Menu Lateral"
                      value={whitelabelConfig.sidebarText || "#e4e6eb"}
                      onChange={(e) => handleUpdateField("sidebarText", e.target.value)}
                      helperText="Cor do texto no menu lateral"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Texto Ativo do Menu"
                      value={whitelabelConfig.sidebarTextActive || "#ffffff"}
                      onChange={(e) => handleUpdateField("sidebarTextActive", e.target.value)}
                      helperText="Cor do texto quando o item está ativo"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Borda Ativa do Menu"
                      value={whitelabelConfig.sidebarActiveBorder || "#25d366"}
                      onChange={(e) => handleUpdateField("sidebarActiveBorder", e.target.value)}
                      helperText="Cor da borda do item ativo"
                    />
                  </div>
                </div>

                <h3 className="section-title">Cores do Navbar (Rodapé de Cima)</h3>
                <div className="whitelabel-grid">
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Fundo do Navbar"
                      value={whitelabelConfig.navbarBg || "#128c7e"}
                      onChange={(e) => handleUpdateField("navbarBg", e.target.value)}
                      helperText="Cor de fundo da barra superior"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Texto do Navbar"
                      value={whitelabelConfig.navbarText || "#ffffff"}
                      onChange={(e) => handleUpdateField("navbarText", e.target.value)}
                      helperText="Cor do texto na barra superior"
                    />
                  </div>
                </div>

                <h3 className="section-title">Cores de Fundo das Páginas</h3>
                <div className="whitelabel-grid">
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Fundo Páginas (Modo Claro)"
                      value={whitelabelConfig.pageBgLight || "#f8f9fa"}
                      onChange={(e) => handleUpdateField("pageBgLight", e.target.value)}
                      helperText="Cor de fundo das páginas no modo claro"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Fundo Páginas (Modo Escuro)"
                      value={whitelabelConfig.pageBgDark || "#0f1117"}
                      onChange={(e) => handleUpdateField("pageBgDark", e.target.value)}
                      helperText="Cor de fundo das páginas no modo escuro"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Fundo Cards (Modo Claro)"
                      value={whitelabelConfig.cardBgLight || "#ffffff"}
                      onChange={(e) => handleUpdateField("cardBgLight", e.target.value)}
                      helperText="Cor de fundo dos cards no modo claro"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Fundo Cards (Modo Escuro)"
                      value={whitelabelConfig.cardBgDark || "#1a1d29"}
                      onChange={(e) => handleUpdateField("cardBgDark", e.target.value)}
                      helperText="Cor de fundo dos cards no modo escuro"
                    />
                  </div>
                </div>

                <h3 className="section-title">Cores de Texto</h3>
                <div className="whitelabel-grid">
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Texto Primário (Modo Claro)"
                      value={whitelabelConfig.textPrimaryLight || "#1a1a1a"}
                      onChange={(e) => handleUpdateField("textPrimaryLight", e.target.value)}
                      helperText="Cor do texto principal no modo claro"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Texto Primário (Modo Escuro)"
                      value={whitelabelConfig.textPrimaryDark || "#e4e6eb"}
                      onChange={(e) => handleUpdateField("textPrimaryDark", e.target.value)}
                      helperText="Cor do texto principal no modo escuro"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Texto Secundário (Modo Claro)"
                      value={whitelabelConfig.textSecondaryLight || "#4a5568"}
                      onChange={(e) => handleUpdateField("textSecondaryLight", e.target.value)}
                      helperText="Cor do texto secundário no modo claro"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Texto Secundário (Modo Escuro)"
                      value={whitelabelConfig.textSecondaryDark || "#b0b3b8"}
                      onChange={(e) => handleUpdateField("textSecondaryDark", e.target.value)}
                      helperText="Cor do texto secundário no modo escuro"
                    />
                  </div>
                </div>

                <h3 className="section-title">Cores Primárias</h3>
                <div className="whitelabel-grid">
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Cor Primária"
                      value={whitelabelConfig.primaryColor || "#128c7e"}
                      onChange={(e) => handleUpdateField("primaryColor", e.target.value)}
                      helperText="Cor primária do sistema"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <ColorInput
                      label="Cor Secundária"
                      value={whitelabelConfig.secondaryColor || "#25d366"}
                      onChange={(e) => handleUpdateField("secondaryColor", e.target.value)}
                      helperText="Cor secundária do sistema"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Fontes */}
            {activeSection === "fonts" && (
              <div className="whitelabel-section-content">
                <h3 className="section-title">Configurações de Fonte</h3>
                <div className="whitelabel-grid">
                  <div className="whitelabel-item">
                    <Select
                      label="Família da Fonte"
                      value={whitelabelConfig.fontFamily || fontOptions[0].value}
                      onChange={(e) => handleUpdateField("fontFamily", e.target.value)}
                      options={fontOptions}
                      helperText="Fonte utilizada em todo o sistema"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <Input
                      label="Tamanho Base da Fonte (px)"
                      type="number"
                      value={whitelabelConfig.fontSizeBase || 16}
                      onChange={(e) => handleUpdateField("fontSizeBase", parseInt(e.target.value) || 16)}
                      helperText="Tamanho base da fonte em pixels"
                      min="12"
                      max="24"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <Input
                      label="Peso da Fonte Normal"
                      type="number"
                      value={whitelabelConfig.fontWeightNormal || 400}
                      onChange={(e) => handleUpdateField("fontWeightNormal", parseInt(e.target.value) || 400)}
                      helperText="Peso da fonte normal (100-900)"
                      min="100"
                      max="900"
                      step="100"
                    />
                  </div>
                  <div className="whitelabel-item">
                    <Input
                      label="Peso da Fonte Negrito"
                      type="number"
                      value={whitelabelConfig.fontWeightBold || 600}
                      onChange={(e) => handleUpdateField("fontWeightBold", parseInt(e.target.value) || 600)}
                      helperText="Peso da fonte negrito (100-900)"
                      min="100"
                      max="900"
                      step="100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Seção de Logos */}
            {activeSection === "logos" && (
              <div className="whitelabel-section-content">
                <h3 className="section-title">Logos e Nome do Sistema</h3>
                <div className="whitelabel-grid">
                  <div className="whitelabel-item">
                    <Input
                      label="Nome do sistema"
                      value={appName}
                      onChange={(e) => {
                        setAppName(e.target.value);
                      }}
                      onBlur={async () => {
                        await handleSaveSetting("appName", appName);
                        colorMode.setAppName(appName || "Multivus");
                        handleUpdateField("appName", appName);
                      }}
                      helperText="Nome exibido no sistema"
                    />
                  </div>

                  <div className="whitelabel-item">
                    <FileUpload
                      label="Logotipo claro"
                      value={settingsLoaded.appLogoLight || ""}
                      onChange={(e) => uploadLogo(e, "Light")}
                      onDelete={() => {
                        handleSaveSetting("appLogoLight", "");
                        colorMode.setAppLogoLight(defaultLogoLight);
                        handleUpdateField("appLogoLight", "");
                      }}
                      accept="image/*"
                      helperText="Logo exibido no modo claro"
                    />
                  </div>

                  <div className="whitelabel-item">
                    <FileUpload
                      label="Logotipo escuro"
                      value={settingsLoaded.appLogoDark || ""}
                      onChange={(e) => uploadLogo(e, "Dark")}
                      onDelete={() => {
                        handleSaveSetting("appLogoDark", "");
                        colorMode.setAppLogoDark(defaultLogoDark);
                        handleUpdateField("appLogoDark", "");
                      }}
                      accept="image/*"
                      helperText="Logo exibido no modo escuro"
                    />
                  </div>

                  <div className="whitelabel-item">
                    <FileUpload
                      label="Favicon"
                      value={settingsLoaded.appLogoFavicon || ""}
                      onChange={(e) => uploadLogo(e, "Favicon")}
                      onDelete={() => {
                        handleSaveSetting("appLogoFavicon", "");
                        colorMode.setAppLogoFavicon(defaultLogoFavicon);
                        handleUpdateField("appLogoFavicon", "");
                      }}
                      accept="image/*"
                      helperText="Ícone exibido na aba do navegador"
                    />
                  </div>

                  <div className="whitelabel-item whitelabel-preview">
                    <div className="preview-container">
                      <h3 className="preview-title">Preview - Logo Claro</h3>
                      <div className="preview-box preview-light">
                        <img
                          src={calculatedLogoLight}
                          alt="light-logo-preview"
                          className="preview-image"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="whitelabel-item whitelabel-preview">
                    <div className="preview-container">
                      <h3 className="preview-title">Preview - Logo Escuro</h3>
                      <div className="preview-box preview-dark">
                        <img
                          src={calculatedLogoDark}
                          alt="dark-logo-preview"
                          className="preview-image"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="whitelabel-item whitelabel-preview">
                    <div className="preview-container">
                      <h3 className="preview-title">Preview - Favicon</h3>
                      <div className="preview-box preview-favicon">
                        <img
                          src={calculatedLogoFavicon}
                          alt="favicon-preview"
                          className="preview-image"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="whitelabel-actions">
              <Button
                variant="primary"
                onClick={handleSaveWhitelabelConfig}
                disabled={loading}
              >
                {loading ? "Salvando..." : "Salvar Todas as Configurações"}
              </Button>
              <Button
                variant="outline"
                onClick={handleResetConfig}
                disabled={loading}
              >
                Resetar para Padrões
              </Button>
            </div>
          </>
        )}
      />
    </div>
  );
}
