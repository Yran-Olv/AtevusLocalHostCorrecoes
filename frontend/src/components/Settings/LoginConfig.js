import React, { useEffect, useState } from "react";
import Input from "../UI/Input";
import Button from "../UI/Button";
import Switch from "../UI/Switch";
import Select from "../UI/Select";
import Chip from "../UI/Chip";
import FileUpload from "../UI/FileUpload";
import { toast } from "react-toastify";
import api from "../../services/api";
import OnlyForSuperUser from "../OnlyForSuperUser";
import useAuth from "../../hooks/useAuth.js/index.js";
import ColorPicker from "../ColorPicker";
import LoginPreview from "../LoginPreview";
import { getBackendUrl } from "../../config";
import "./LoginConfig.css";

export default function LoginConfig() {
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState({});
  const [config, setConfig] = useState({
    theme: "default",
    logoUrl: "",
    backgroundImageUrl: "",
    title: "Multivus",
    subtitle: "Sistema de Atendimento WhatsApp",
    typingTexts: [],
    primaryColor: "#128c7e",
    secondaryColor: "#25d366",
    enableTypingEffect: true,
    enableAnimations: true,
    enablePasswordRecovery: true,
    customCss: "",
    welcomeMessage: "Um sistema de atendimento pelo WhatsApp. Permite que várias pessoas usem o mesmo número de WhatsApp ao mesmo tempo, para responder clientes de forma organizada e profissional.",
    mailHost: "",
    mailPort: 587,
    mailUser: "",
    mailPass: "",
    mailFrom: "",
    mailSecure: true,
  });
  const [newTypingText, setNewTypingText] = useState("");
  const [currentUser, setCurrentUser] = useState({});
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const formRef = React.useRef(null);
  const { getCurrentUserInfo } = useAuth();

  useEffect(() => {
    getCurrentUserInfo().then((u) => {
      setCurrentUser(u);
    });
    loadConfig();
    loadThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadConfig = async () => {
    try {
      const { data } = await api.get("/login-config");
      
      // Parse typingTexts
      let typingTexts = [];
      if (data.typingTexts) {
        if (Array.isArray(data.typingTexts)) {
          typingTexts = data.typingTexts;
        } else if (typeof data.typingTexts === 'string') {
          try {
            typingTexts = JSON.parse(data.typingTexts);
          } catch {
            typingTexts = [];
          }
        }
      }
      
      // Parse teamImages
      let teamImages = [];
      if (data.teamImages) {
        if (Array.isArray(data.teamImages)) {
          teamImages = data.teamImages;
        } else if (typeof data.teamImages === 'string') {
          try {
            teamImages = JSON.parse(data.teamImages);
          } catch {
            teamImages = [];
          }
        }
      }
      
      setConfig({
        ...data,
        typingTexts,
        teamImages,
      });
    } catch (err) {
      console.error("Erro ao carregar configuração:", err);
      toast.error("Erro ao carregar configuração do Login");
    }
  };

  const loadThemes = async () => {
    try {
      const { data } = await api.get("/login-config/themes");
      setThemes(data);
    } catch (err) {
      console.error("Erro ao carregar temas:", err);
    }
  };

  useEffect(() => {
    if (config.theme && themes[config.theme]) {
      setSelectedTheme(themes[config.theme]);
    }
  }, [config.theme, themes]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setConfig({
      ...config,
      [field]: value,
    });
  };

  const handleThemeChange = (event) => {
    const themeName = event.target.value;
    const theme = themes[themeName];
    
    if (theme) {
      setSelectedTheme(theme);
      setConfig({
        ...config,
        theme: themeName,
        primaryColor: theme.primaryColor || config.primaryColor,
        secondaryColor: theme.secondaryColor || config.secondaryColor,
        typingTexts: theme.typingTexts || config.typingTexts,
        backgroundImageUrl: theme.backgroundImageUrl || config.backgroundImageUrl,
      });
    } else {
      setSelectedTheme(null);
      setConfig({
        ...config,
        theme: themeName,
      });
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    formData.append("typeArch", "login");

    try {
      const { data } = await api.post("/login-config/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const backendUrl = getBackendUrl();
      const fileUrl = data.url || `${backendUrl}/public/${data.filename}`;

      if (type === "logo") {
        setConfig({ ...config, logoUrl: fileUrl });
      } else if (type === "background") {
        setConfig({ ...config, backgroundImageUrl: fileUrl });
      } else if (type === "team") {
        const currentTeamImages = Array.isArray(config.teamImages) ? config.teamImages : [];
        if (currentTeamImages.length >= 8) {
          toast.warning("Máximo de 8 fotos da equipe permitidas");
          return;
        }
        setConfig({ ...config, teamImages: [...currentTeamImages, fileUrl] });
      }

      toast.success("Imagem enviada com sucesso!");
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
      toast.error(err.response?.data?.message || "Erro ao enviar imagem");
    }
  };

  const handleRemoveTeamImage = (index) => {
    const currentTeamImages = Array.isArray(config.teamImages) ? config.teamImages : [];
    setConfig({
      ...config,
      teamImages: currentTeamImages.filter((_, i) => i !== index),
    });
  };

  const handleAddTypingText = () => {
    if (newTypingText.trim()) {
      setConfig({
        ...config,
        typingTexts: [...config.typingTexts, newTypingText.trim()],
      });
      setNewTypingText("");
    }
  };

  const handleRemoveTypingText = (index) => {
    setConfig({
      ...config,
      typingTexts: config.typingTexts.filter((_, i) => i !== index),
    });
  };

  const scrollToField = (fieldName) => {
    // Normalizar nome do campo (pode vir do backend em diferentes formatos)
    const normalizedField = fieldName.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    // Mapear nomes de campos para IDs ou classes
    const fieldMap = {
      mailhost: "mailHost",
      mailport: "mailPort",
      mailuser: "mailUser",
      mailpass: "mailPass",
      mailfrom: "mailFrom",
      logourl: "logoUrl",
      backgroundimageurl: "backgroundImageUrl",
      primarycolor: "primaryColor",
      secondarycolor: "secondaryColor",
      title: "title",
      subtitle: "subtitle"
    };

    const fieldId = fieldMap[normalizedField] || fieldName;
    
    // Tentar encontrar o campo por ID, name ou label
    let fieldElement = document.getElementById(fieldId) ||
                      document.querySelector(`[name="${fieldId}"]`) ||
                      document.querySelector(`[data-field="${fieldId}"]`);
    
    if (!fieldElement) {
      // Tentar encontrar pelo label
      const labels = document.querySelectorAll('label');
      for (let label of labels) {
        if (label.textContent.toLowerCase().includes(fieldName.toLowerCase())) {
          const input = label.nextElementSibling || label.querySelector('input, select, textarea');
          if (input) {
            fieldElement = input;
            break;
          }
        }
      }
    }

    if (fieldElement) {
      fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      fieldElement.focus();
      
      // Destacar o campo com erro
      fieldElement.style.borderColor = '#f44336';
      fieldElement.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
      
      setTimeout(() => {
        fieldElement.style.borderColor = '';
        fieldElement.style.boxShadow = '';
      }, 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});

    try {
      const submitData = {
        ...config,
        teamImages: Array.isArray(config.teamImages) ? config.teamImages : [],
        typingTexts: Array.isArray(config.typingTexts) ? config.typingTexts : [],
      };
      
      await api.put("/login-config", submitData);
      toast.success("Configuração do Login salva com sucesso!");
      setFieldErrors({});
    } catch (err) {
      console.error("Erro ao salvar configuração:", err);
      
      const errorData = err.response?.data;
      
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Erros de validação com campos específicos
        const errors = {};
        errorData.errors.forEach((error) => {
          // Normalizar nome do campo para garantir correspondência
          const fieldName = error.field.toLowerCase().replace(/[^a-z0-9]/g, "");
          const fieldMap = {
            mailhost: "mailHost",
            mailport: "mailPort",
            mailuser: "mailUser",
            mailpass: "mailPass",
            mailfrom: "mailFrom",
            logourl: "logoUrl",
            backgroundimageurl: "backgroundImageUrl",
            primarycolor: "primaryColor",
            secondarycolor: "secondaryColor"
          };
          const mappedField = fieldMap[fieldName] || error.field;
          errors[mappedField] = error.message;
        });
        
        setFieldErrors(errors);
        
        // Mostrar mensagem principal
        toast.error(errorData.message || "Erro de validação. Verifique os campos destacados.");
        
        // Scroll para o primeiro campo com erro
        if (errorData.fields && errorData.fields.length > 0) {
          setTimeout(() => {
            scrollToField(errorData.fields[0]);
          }, 500);
        }
      } else {
        // Erro genérico
        toast.error(errorData?.message || "Erro ao salvar configuração");
      }
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = [
    { value: "default", label: "Padrão" },
    { value: "natalino", label: "Natalino" },
    { value: "anoNovo", label: "Ano Novo" },
    { value: "diaMulher", label: "Dia da Mulher" },
    { value: "diaMaes", label: "Dia das Mães" },
    { value: "conscienciaNegra", label: "Consciência Negra" },
  ];

  return (
    <OnlyForSuperUser
      user={currentUser}
      yes={() => (
        <form onSubmit={handleSubmit} className="login-config-form">
          <div className="config-header">
            <h2>Configuração da Tela de Login</h2>
            <p className="config-description">
              Configure completamente a aparência e comportamento da tela de login.
              Todas as alterações são aplicadas imediatamente.
            </p>
          </div>

          {/* Preview do Login */}
          <div className="config-item config-item-full">
            <LoginPreview config={config} theme={selectedTheme || themes[config.theme]} />
          </div>

          <div className="config-grid">
            {/* Seleção de Temas com Preview */}
            <div className="config-item config-item-full">
              <label className="input-label">Temas Brasileiros</label>
              <div className="themes-grid">
                {Object.entries(themes).map(([key, theme]) => (
                  <div
                    key={key}
                    className={`theme-card ${config.theme === key ? 'active' : ''}`}
                    onClick={() => {
                      const event = { target: { value: key } };
                      handleThemeChange(event);
                    }}
                  >
                    <div className="theme-icon">{theme.icon || "💬"}</div>
                    <div className="theme-name">{theme.name}</div>
                    <div className="theme-description">{theme.description}</div>
                    <div className="theme-colors">
                      <span 
                        className="theme-color-dot" 
                        style={{ background: theme.primaryColor }}
                      ></span>
                      <span 
                        className="theme-color-dot" 
                        style={{ background: theme.secondaryColor }}
                      ></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="config-item">
              <Select
                label="Tema Selecionado"
                value={config.theme}
                onChange={handleThemeChange}
                options={themeOptions}
                helperText="Tema atual aplicado"
              />
            </div>

            <div className="config-item">
              <Input
                label="Título"
                value={config.title || ""}
                onChange={handleChange("title")}
                helperText="Título principal exibido no login"
              />
            </div>

            <div className="config-item config-item-full">
              <Input
                label="Subtítulo"
                value={config.subtitle || ""}
                onChange={handleChange("subtitle")}
                multiline
                rows={2}
                helperText="Subtítulo ou descrição exibida no login"
              />
            </div>

            <div className="config-item">
              <label className="input-label">Logo</label>
              <FileUpload
                label=""
                value={config.logoUrl || ""}
                onChange={(e) => handleImageUpload(e, "logo")}
                accept="image/*"
                helperText="Faça upload do logo da empresa"
              />
              {config.logoUrl && (
                <div className="image-preview">
                  <img src={config.logoUrl} alt="Logo" />
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, logoUrl: "" })}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="config-item">
              <label className="input-label">Imagem de Fundo</label>
              <FileUpload
                label=""
                value={config.backgroundImageUrl || ""}
                onChange={(e) => handleImageUpload(e, "background")}
                accept="image/*"
                helperText="Faça upload de imagem de fundo personalizada"
              />
              {config.backgroundImageUrl && (
                <div className="image-preview">
                  <img src={config.backgroundImageUrl} alt="Background" />
                  <button
                    type="button"
                    onClick={() => setConfig({ ...config, backgroundImageUrl: "" })}
                    className="remove-image-btn"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div className="config-item config-item-full">
              <label className="input-label">Fotos da Equipe</label>
              <FileUpload
                label=""
                value=""
                onChange={(e) => handleImageUpload(e, "team")}
                accept="image/*"
                helperText="Adicione fotos da equipe (máximo 8)"
              />
              {config.teamImages && config.teamImages.length > 0 && (
                <div className="team-images-grid">
                  {config.teamImages.map((img, index) => (
                    <div key={index} className="team-image-item">
                      <img src={img} alt={`Membro ${index + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveTeamImage(index)}
                        className="remove-image-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="config-item">
              <div className="color-input-wrapper">
                <Input
                  label="Cor Primária"
                  value={config.primaryColor || ""}
                  onChange={handleChange("primaryColor")}
                  helperText="Cor principal do tema"
                />
                <ColorPicker
                  color={config.primaryColor}
                  onChange={(color) => setConfig({ ...config, primaryColor: color })}
                />
              </div>
            </div>

            <div className="config-item">
              <div className="color-input-wrapper">
                <Input
                  label="Cor Secundária"
                  value={config.secondaryColor || ""}
                  onChange={handleChange("secondaryColor")}
                  helperText="Cor secundária do tema"
                />
                <ColorPicker
                  color={config.secondaryColor}
                  onChange={(color) => setConfig({ ...config, secondaryColor: color })}
                />
              </div>
            </div>

            <div className="config-item config-item-full">
              <Input
                label="Mensagem de Boas-vindas"
                value={config.welcomeMessage || ""}
                onChange={handleChange("welcomeMessage")}
                helperText="Mensagem exibida na tela de login"
              />
            </div>

            <div className="config-item config-item-full">
              <div className="switch-wrapper">
                <Switch
                  checked={config.enableTypingEffect}
                  onChange={handleChange("enableTypingEffect")}
                  label="Ativar Efeito de Digitação (Typing Effect)"
                />
                <p className="config-helper">
                  Exibe textos com animação de digitação
                </p>
              </div>
            </div>

            {config.enableTypingEffect && (
              <div className="config-item config-item-full">
                <div className="typing-texts-container">
                  <label className="input-label">Textos para Efeito de Digitação</label>
                  <div className="chips-container">
                    {config.typingTexts.map((text, index) => (
                      <Chip
                        key={index}
                        label={text}
                        onDelete={() => handleRemoveTypingText(index)}
                      />
                    ))}
                  </div>
                  <div className="add-text-input-wrapper">
                    <Input
                      value={newTypingText}
                      onChange={(e) => setNewTypingText(e.target.value)}
                      placeholder="Digite um texto..."
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTypingText();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAddTypingText}
                      size="small"
                    >
                      +
                    </Button>
                  </div>
                  <p className="config-helper">
                    Textos que serão exibidos com animação de digitação
                  </p>
                </div>
              </div>
            )}

            <div className="config-item">
              <div className="switch-wrapper">
                <Switch
                  checked={config.enableAnimations}
                  onChange={handleChange("enableAnimations")}
                  label="Ativar Animações"
                />
              </div>
            </div>

            <div className="config-item">
              <div className="switch-wrapper">
                <Switch
                  checked={config.enablePasswordRecovery}
                  onChange={handleChange("enablePasswordRecovery")}
                  label="Ativar Recuperação de Senha"
                />
              </div>
            </div>

            <div className="config-item config-item-full">
              <Input
                label="CSS Personalizado"
                value={config.customCss || ""}
                onChange={handleChange("customCss")}
                multiline
                rows={6}
                helperText="CSS adicional para personalização avançada"
              />
            </div>

            <div className="config-item config-item-full">
              <div className="section-divider">
                <h3>Configurações de Email (Recuperação de Senha)</h3>
                <p className="config-description">
                  Configure o servidor de email para envio de recuperação de senha. Se não configurado, usará as variáveis de ambiente do .env.
                </p>
              </div>
            </div>

            <div className="config-item">
              <Input
                id="mailHost"
                data-field="mailHost"
                label="Servidor SMTP (Host)"
                value={config.mailHost || ""}
                onChange={(e) => {
                  handleChange("mailHost")(e);
                  if (fieldErrors.mailHost) {
                    setFieldErrors({ ...fieldErrors, mailHost: null });
                  }
                }}
                helperText={!fieldErrors.mailHost ? "Ex: smtp.gmail.com" : ""}
                error={fieldErrors.mailHost || false}
              />
            </div>

            <div className="config-item">
              <Input
                id="mailPort"
                data-field="mailPort"
                label="Porta SMTP"
                type="number"
                value={config.mailPort || 587}
                onChange={(e) => {
                  handleChange("mailPort")(e);
                  if (fieldErrors.mailPort) {
                    setFieldErrors({ ...fieldErrors, mailPort: null });
                  }
                }}
                helperText={!fieldErrors.mailPort ? "587 (TLS) ou 465 (SSL)" : ""}
                error={fieldErrors.mailPort || false}
              />
            </div>

            <div className="config-item">
              <Input
                id="mailUser"
                data-field="mailUser"
                label="Usuário/Email SMTP"
                type="email"
                value={config.mailUser || ""}
                onChange={(e) => {
                  handleChange("mailUser")(e);
                  if (fieldErrors.mailUser) {
                    setFieldErrors({ ...fieldErrors, mailUser: null });
                  }
                }}
                helperText={!fieldErrors.mailUser ? "Email do servidor SMTP" : ""}
                error={fieldErrors.mailUser || false}
              />
            </div>

            <div className="config-item">
              <Input
                id="mailPass"
                data-field="mailPass"
                label="Senha SMTP"
                type="password"
                value={config.mailPass && !config.mailPass.startsWith("***") ? config.mailPass : ""}
                onChange={(e) => {
                  handleChange("mailPass")(e);
                  if (fieldErrors.mailPass) {
                    setFieldErrors({ ...fieldErrors, mailPass: null });
                  }
                }}
                helperText={!fieldErrors.mailPass ? "Senha do email (deixe em branco para manter a atual)" : ""}
                placeholder={config.mailPass && config.mailPass.startsWith("***") ? "Senha já configurada (digite nova para alterar)" : ""}
                error={fieldErrors.mailPass || false}
              />
            </div>

            <div className="config-item">
              <Input
                id="mailFrom"
                data-field="mailFrom"
                label="Email Remetente (From)"
                type="email"
                value={config.mailFrom || ""}
                onChange={(e) => {
                  handleChange("mailFrom")(e);
                  if (fieldErrors.mailFrom) {
                    setFieldErrors({ ...fieldErrors, mailFrom: null });
                  }
                }}
                helperText={!fieldErrors.mailFrom ? "Email que aparecerá como remetente" : ""}
                error={fieldErrors.mailFrom || false}
              />
            </div>

            <div className="config-item">
              <div className="switch-wrapper">
                <Switch
                  checked={config.mailSecure !== undefined ? config.mailSecure : true}
                  onChange={handleChange("mailSecure")}
                  label="Usar SSL/TLS Seguro"
                />
                <p className="config-helper">
                  Ative para porta 465 (SSL), desative para porta 587 (TLS)
                </p>
              </div>
            </div>

            <div className="config-item config-item-full">
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                loading={loading}
                fullWidth
              >
                {loading ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </div>
          </div>
        </form>
      )}
    />
  );
}
