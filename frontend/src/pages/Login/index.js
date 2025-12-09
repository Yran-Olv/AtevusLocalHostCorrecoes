import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import TypingEffect from "../../components/TypingEffect";
import api from "../../services/api";
import { toast } from "react-toastify";
import "./style.css";

const Login = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { handleLogin } = useContext(AuthContext);
  const { colorMode } = useContext(ColorModeContext);
  const { appLogoFavicon, appName } = colorMode;
  const [alert, setAlert] = useState({ open: false, message: "", severity: "error" });
  const [focusedEmail, setFocusedEmail] = useState(false);
  const [focusedPassword, setFocusedPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginConfig, setLoginConfig] = useState(null);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Limpar cache ao entrar na tela
  useEffect(() => {
    const clearCache = async () => {
      try {
        // Limpar cache do navegador
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        }
        
        // Limpar localStorage e sessionStorage (exceto preferências do usuário)
        const preferredTheme = localStorage.getItem("preferredTheme");
        const volume = localStorage.getItem("volume");
        localStorage.clear();
        sessionStorage.clear();
        if (preferredTheme) localStorage.setItem("preferredTheme", preferredTheme);
        if (volume) localStorage.setItem("volume", volume);
        
        // Forçar reload do service worker
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => reg.unregister()));
        }
      } catch (error) {
        console.error("Erro ao limpar cache:", error);
      } finally {
        setIsLoading(false);
      }
    };

    clearCache();
    loadLoginConfig();
  }, []);

  const loadLoginConfig = async () => {
    try {
      const { data } = await api.get("/login-config");
      setLoginConfig(data);
      
      // Aplica CSS customizado se houver
      if (data.customCss) {
        const styleId = "login-custom-css";
        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
          styleElement = document.createElement("style");
          styleElement.id = styleId;
          document.head.appendChild(styleElement);
        }
        styleElement.textContent = data.customCss;
      }

      // Aplica cores do tema
      if (data.primaryColor || data.secondaryColor) {
        const root = document.documentElement;
        if (data.primaryColor) {
          root.style.setProperty("--primary", data.primaryColor);
        }
        if (data.secondaryColor) {
          root.style.setProperty("--secondary", data.secondaryColor);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar configuração do login:", err);
    }
  };

  const handleRecoveryRequest = async (e) => {
    e.preventDefault();
    if (!recoveryEmail) {
      toast.error("Por favor, informe seu email");
      return;
    }

    try {
      await api.post("/auth/password-recovery", { email: recoveryEmail });
      toast.success("Se o email existir, você receberá instruções para recuperar sua senha.");
      setShowRecovery(false);
      setRecoveryEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Erro ao solicitar recuperação de senha");
    }
  };

  const handleChangeInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: name === 'email' ? value.toLowerCase() : value });
  };

  const handlSubmit = async (e) => {
    e.preventDefault();
    if (!user.email || !user.password) {
      setAlert({
        open: true,
        message: "Por favor, preencha todos os campos.",
        severity: "warning",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await handleLogin(user);
    } catch (error) {
      setAlert({
        open: true,
        message: error.message || "Senha incorreta ou usuário não encontrado.",
        severity: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="login-loading">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Carregando sistema...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{loginConfig?.title || appName || "Multivus"} - Login</title>
        <link rel="icon" href={appLogoFavicon} />
      </Helmet>
      <div className="multivus-login">
        {/* Background com tema WhatsApp */}
        <div 
          className="multivus-background"
          style={loginConfig?.backgroundImageUrl ? {
            backgroundImage: `url(${loginConfig.backgroundImageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {}}
        >
          {!loginConfig?.backgroundImageUrl && (
            <>
              <div className="whatsapp-pattern"></div>
              <div className="gradient-overlay"></div>
            </>
          )}
        </div>

        <div className="multivus-container">
          {/* Seção Esquerda - Branding Empresarial */}
          <div className="multivus-brand-section">
            {loginConfig?.logoUrl ? (
              <img src={loginConfig.logoUrl} alt="Logo" className="brand-logo-image" />
            ) : (
              <div className="brand-logo">
                <div className="logo-shape">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </div>
              </div>
            )}
            <h1 className="brand-name">{loginConfig?.title || appName || "Multivus"}</h1>
            <p className="brand-subtitle">
              {loginConfig?.enableTypingEffect && loginConfig?.typingTexts?.length > 0 ? (
                <TypingEffect 
                  texts={loginConfig.typingTexts} 
                  speed={100}
                  deleteSpeed={50}
                  pauseTime={2000}
                />
              ) : (
                loginConfig?.subtitle || "Sistema de Atendimento WhatsApp"
              )}
            </p>
            <div className="brand-features">
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <span>Múltiplos Atendentes</span>
              </div>
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
                <span>Atendimento Organizado</span>
              </div>
              <div className="feature-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
                <span>Respostas Rápidas</span>
              </div>
            </div>
            {loginConfig?.welcomeMessage && (
              <p className="brand-welcome">{loginConfig.welcomeMessage}</p>
            )}
          </div>

          {/* Seção Direita - Formulário */}
          <div className="multivus-form-section">
            {/* Header Mobile */}
            <div className="mobile-header">
              <div className="mobile-logo">
                {loginConfig?.logoUrl ? (
                  <img src={loginConfig.logoUrl} alt="Logo" />
                ) : (
                  <div className="mobile-logo-shape">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </div>
                )}
              </div>
              <h2 className="mobile-title">{loginConfig?.title || appName || "Multivus"}</h2>
            </div>

            <div className="multivus-card">
              <div className="card-header">
                <RouterLink to="/login" className="tab-button active">
                  Entrar
                </RouterLink>
                <RouterLink to="/signup" className="tab-button">
                  Criar Conta
                </RouterLink>
              </div>

              <form className="multivus-form" onSubmit={handlSubmit}>
                {alert.open && (
                  <div className={`alert-box alert-${alert.severity}`}>
                    <div className="alert-content">
                      <strong>{alert.severity === "error" ? "Erro" : "Aviso"}</strong>
                      <span>{alert.message}</span>
                    </div>
                    <button
                      type="button"
                      className="alert-close"
                      onClick={() => setAlert({ ...alert, open: false })}
                      aria-label="Fechar"
                    >
                      ×
                    </button>
                  </div>
                )}

                <div className="form-title">
                  <h2>Bem-vindo de volta</h2>
                  <p>Entre com suas credenciais para acessar o sistema</p>
                </div>

                <div className={`input-wrapper ${focusedEmail || user.email ? 'focused' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={user.email}
                    onChange={handleChangeInput}
                    onFocus={() => setFocusedEmail(true)}
                    onBlur={() => setFocusedEmail(false)}
                    autoComplete="email"
                    autoFocus
                    required
                    placeholder=" "
                  />
                  <label htmlFor="email">{i18n.t("login.form.email")}</label>
                </div>

                <div className={`input-wrapper ${focusedPassword || user.password ? 'focused' : ''}`}>
                  <div className="input-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={user.password}
                    onChange={handleChangeInput}
                    onFocus={() => setFocusedPassword(true)}
                    onBlur={() => setFocusedPassword(false)}
                    autoComplete="current-password"
                    required
                    placeholder=" "
                  />
                  <label htmlFor="password">{i18n.t("login.form.password")}</label>
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>

                {loginConfig?.enablePasswordRecovery && (
                  <div className="recovery-link">
                    <button
                      type="button"
                      onClick={() => setShowRecovery(true)}
                      className="link-button"
                    >
                      Esqueceu sua senha?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className={`submit-button ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="button-spinner"></span>
                      <span>Entrando...</span>
                    </>
                  ) : (
                    "ENTRAR"
                  )}
                </button>
              </form>

              {showRecovery && loginConfig?.enablePasswordRecovery && (
                <div className="recovery-modal">
                  <div className="recovery-content">
                    <h3>Recuperar Senha</h3>
                    <p>Digite seu email para receber instruções de recuperação:</p>
                    <form onSubmit={handleRecoveryRequest}>
                      <input
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="Seu email"
                        required
                        className="recovery-input"
                      />
                      <div className="recovery-buttons">
                        <button type="submit" className="recovery-submit">
                          Enviar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRecovery(false);
                            setRecoveryEmail("");
                          }}
                          className="recovery-cancel"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>

            <div className="multivus-footer">
              <p>
                © {new Date().getFullYear()} {loginConfig?.title || appName || "Multivus"}. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
