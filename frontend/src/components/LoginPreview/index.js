import React from "react";
import "./LoginPreview.css";

const LoginPreview = ({ config, theme }) => {
  const themeConfig = theme || {};
  const previewConfig = {
    ...config,
    primaryColor: config.primaryColor || themeConfig.primaryColor || "#128c7e",
    secondaryColor: config.secondaryColor || themeConfig.secondaryColor || "#25d366",
    backgroundGradient: themeConfig.backgroundGradient || "linear-gradient(135deg, #128c7e 0%, #075e54 50%, #0a4d3e 100%)",
    layout: themeConfig.layout || "split",
  };

  const teamImages = config.teamImages ? (Array.isArray(config.teamImages) ? config.teamImages : JSON.parse(config.teamImages || "[]")) : [];

  return (
    <div className="login-preview-container">
      <div className="login-preview-header">
        <h3>Preview da Tela de Login</h3>
        <p>Visualização em tempo real das alterações</p>
      </div>
      
      <div className="login-preview-wrapper">
        <div 
          className={`login-preview login-preview-${previewConfig.layout}`}
          style={{
            background: previewConfig.backgroundImageUrl 
              ? `url(${previewConfig.backgroundImageUrl})` 
              : previewConfig.backgroundGradient,
            backgroundSize: previewConfig.backgroundImageUrl ? 'cover' : 'auto',
            backgroundPosition: 'center',
          }}
        >
          {/* Background Pattern */}
          {!previewConfig.backgroundImageUrl && (
            <div className="preview-pattern"></div>
          )}

          <div className="preview-container">
            {/* Seção Branding */}
            <div className="preview-brand-section">
              {previewConfig.logoUrl ? (
                <img src={previewConfig.logoUrl} alt="Logo" className="preview-logo" />
              ) : (
                <div className="preview-logo-placeholder">
                  <span>{themeConfig.icon || "💬"}</span>
                </div>
              )}
              
              <h2 className="preview-title">{previewConfig.title || "Multivus"}</h2>
              <p className="preview-subtitle">
                {previewConfig.subtitle || "Sistema de Atendimento WhatsApp"}
              </p>

              {/* Imagens da Equipe */}
              {teamImages.length > 0 && (
                <div className="preview-team-images">
                  {teamImages.slice(0, 4).map((img, index) => (
                    <div key={index} className="preview-team-member">
                      <img src={img} alt={`Membro ${index + 1}`} />
                    </div>
                  ))}
                  {teamImages.length > 4 && (
                    <div className="preview-team-member preview-team-more">
                      <span>+{teamImages.length - 4}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              <div className="preview-features">
                <div className="preview-feature">
                  <span>👥</span>
                  <span>Múltiplos Atendentes</span>
                </div>
                <div className="preview-feature">
                  <span>💬</span>
                  <span>Atendimento Organizado</span>
                </div>
                <div className="preview-feature">
                  <span>⚡</span>
                  <span>Respostas Rápidas</span>
                </div>
              </div>
            </div>

            {/* Seção Formulário */}
            <div className="preview-form-section">
              <div className="preview-card">
                <div className="preview-card-header">
                  <button className="preview-tab active">Entrar</button>
                  <button className="preview-tab">Criar Conta</button>
                </div>
                <div className="preview-form">
                  <h3 className="preview-form-title">Bem-vindo de volta</h3>
                  <div className="preview-input">
                    <span className="preview-input-icon">📧</span>
                    <input type="text" placeholder="Email" disabled />
                  </div>
                  <div className="preview-input">
                    <span className="preview-input-icon">🔒</span>
                    <input type="password" placeholder="Senha" disabled />
                  </div>
                  <button className="preview-submit-button" style={{ background: previewConfig.primaryColor }}>
                    ENTRAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPreview;

