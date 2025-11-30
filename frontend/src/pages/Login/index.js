import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Helmet } from "react-helmet";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
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

  return (
    <>
      <Helmet>
        <title>Multivus - Login</title>
        <link rel="icon" href={appLogoFavicon} />
      </Helmet>
      <div className="multivus-login">
        <div className="multivus-background">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
          <div className="grid-pattern"></div>
        </div>

        <div className="multivus-container">
          <div className="multivus-brand">
            <div className="brand-logo">
              <div className="logo-shape">
                <span>M</span>
              </div>
            </div>
            <h1 className="brand-name">Multivus</h1>
            <p className="brand-tagline">Sistema de Multiatendimento</p>
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
                  i18n.t("login.buttons.submit")
                )}
              </button>
            </form>
          </div>

          <div className="multivus-footer">
            <p>
              © {new Date().getFullYear()} Multivus. Todos os direitos reservados.
            </p>
            <p className="footer-links">
              <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacidade</a>
              <span> • </span>
              <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Termos</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
