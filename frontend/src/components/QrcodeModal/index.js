import React, { useEffect, useState, useContext } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import "./style.css";

/**
 * Modal de QR Code para conexão do WhatsApp
 * Exibe QR Code para escanear ou permite conexão via número de telefone
 * Design baseado no WhatsApp Web oficial
 */
const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+55");
  const [verificationCode, setVerificationCode] = useState("");
  const [requiresCode, setRequiresCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionCode, setConnectionCode] = useState(""); // Código de conexão gerado pelo backend (formato: XXXX-XXXX)
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    const fetchSession = async () => {
      if (!whatsAppId) return;

      setIsLoading(true);
      try {
        const { data } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(data.qrcode);
        setIsLoading(false);
      } catch (err) {
        toastError(err);
        setIsLoading(false);
      }
    };
    
    if (open && !showPhoneModal) {
      fetchSession();
    }
  }, [whatsAppId, open, showPhoneModal]);

  /**
   * Listener para eventos de atualização da sessão do WhatsApp via Socket.IO
   * Recebe atualizações em tempo real sobre QR Code, código de conexão e status
   */
  useEffect(() => {
    if (!whatsAppId || !isSocketValid(socket) || !open) return;
    const companyId = user.companyId;

    const onWhatsappData = (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        // Se receber novo QR Code, atualizar e parar loading
        if (data.session.qrcode) {
          setQrCode(data.session.qrcode);
          setIsLoading(false);
        }
        
        // Se receber código de conexão, exibir tela de código
        if (data.session.connectionCode) {
          setConnectionCode(data.session.connectionCode);
          setRequiresCode(true);
          setShowPhoneModal(true);
        }
      }

      // Se a sessão foi conectada (QR Code foi escaneado ou código foi verificado), fechar modal
      if (data.action === "update" && data.session.qrcode === "" && data.session.status === "CONNECTED") {
        onClose();
      }
    }
    
    // Registrar listener para eventos de sessão do WhatsApp
    safeSocketOn(socket, `company-${companyId}-whatsappSession`, onWhatsappData);

    // Limpar listener quando o componente desmontar ou dependências mudarem
    return () => {
      safeSocketOff(socket, `company-${companyId}-whatsappSession`, onWhatsappData);
    };
  }, [whatsAppId, onClose, socket, user.companyId, open]);

  /**
   * Envia o número de telefone para o backend gerar código de conexão
   * O backend retorna um código no formato XXXX-XXXX que deve ser inserido no WhatsApp do celular
   */
  const handlePhoneConnect = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      return;
    }

    // Formatar número completo: código do país + número (apenas dígitos)
    const fullPhoneNumber = countryCode + phoneNumber.replace(/\D/g, "");
    
    // Validar se o número tem pelo menos 10 dígitos (DDD + número)
    if (phoneNumber.replace(/\D/g, "").length < 10) {
      alert("Por favor, insira um número de telefone válido");
      return;
    }

    setIsSubmitting(true);
    try {
      // Enviar número para o backend gerar código de conexão
      const { data } = await api.post(`/whatsappsession/${whatsAppId}/phone`, {
        phoneNumber: fullPhoneNumber
      });
      
      // Se o backend retornar código de conexão, exibir tela de código
      if (data.connectionCode) {
        setConnectionCode(data.connectionCode);
        setRequiresCode(true);
        setIsSubmitting(false);
      } else if (data.note) {
        // Se retornar nota informativa, mostrar mensagem e voltar para QR Code
        alert("A autenticação por número de telefone requer integração com WhatsApp Business API. Por favor, use o QR Code para conectar.");
        setShowPhoneModal(false);
        setPhoneNumber("");
        setIsLoading(true);
        const { data: whatsappData } = await api.get(`/whatsapp/${whatsAppId}`);
        setQrCode(whatsappData.qrcode);
        setIsLoading(false);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
      }
    } catch (err) {
      toastError(err);
      setIsSubmitting(false);
    }
  };

  /**
   * Verifica o código de conexão inserido pelo usuário
   * NOTA: Esta funcionalidade completa requer integração com WhatsApp Business API
   * Atualmente apenas valida o formato do código
   */
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    
    // Validar se o código tem exatamente 6 dígitos
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      alert("Por favor, insira o código de 6 dígitos");
      return;
    }

    setIsSubmitting(true);
    try {
      // Enviar código para o backend verificar
      const { data } = await api.post(`/whatsappsession/${whatsAppId}/verify`, {
        code: verificationCode
      });
      
      if (data.message) {
        // Código verificado - aguardar conexão ser estabelecida
        setShowPhoneModal(false);
      }
    } catch (err) {
      toastError(err);
      setVerificationCode("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneLinkClick = () => {
    setShowPhoneModal(true);
    setPhoneNumber("");
    setVerificationCode("");
    setRequiresCode(false);
    setConnectionCode("");
  };

  const handleBackToQr = () => {
    setShowPhoneModal(false);
    setPhoneNumber("");
    setVerificationCode("");
    setRequiresCode(false);
    setConnectionCode("");
  };

  /**
   * Formata o número de telefone para exibição
   * Formato: +55 34 99919-8782
   */
  const formatPhoneDisplay = () => {
    if (!phoneNumber) return "";
    const cleaned = phoneNumber.replace(/\D/g, "");
    // Formatar conforme o tamanho do número
    if (cleaned.length <= 2) return countryCode + " " + cleaned;
    if (cleaned.length <= 7) return countryCode + " " + cleaned.slice(0, 2) + " " + cleaned.slice(2);
    // Formato completo: +55 34 99919-8782
    return countryCode + " " + cleaned.slice(0, 2) + " " + cleaned.slice(2, 7) + "-" + cleaned.slice(7);
  };

  if (!open) return null;

  return (
    <div className="qrcode-modal-overlay" onClick={onClose}>
      <div className="qrcode-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="qrcode-modal-close" onClick={onClose} aria-label="Fechar">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Banner de Download do Windows */}
        <div className="qrcode-windows-banner">
          <div className="qrcode-banner-content">
            <div className="qrcode-banner-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4h16v16H4V4z" fill="#00a884"/>
                <path d="M8 8h8v8H8V8z" fill="#ffffff"/>
              </svg>
            </div>
            <div className="qrcode-banner-text">
              <div className="qrcode-banner-title">Baixar o WhatsApp para Windows</div>
              <div className="qrcode-banner-subtitle">
                Baixe o novo app para Windows para fazer ligações, usar o compartilhamento de tela e ter uma experiência de uso mais rápida.
              </div>
            </div>
            <button className="qrcode-banner-button">
              Baixar
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M3 7l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {!showPhoneModal ? (
          <div className="qrcode-modal-content">
            <h2 className="qrcode-modal-title">
              Para configurar o WhatsApp no seu computador:
            </h2>

            <div className="qrcode-modal-body">
              <div className="qrcode-modal-instructions">
                <div className="qrcode-instruction-item">
                  <div className="qrcode-instruction-number">1</div>
                  <p className="qrcode-instruction-text">
                    Abra o WhatsApp <span className="qrcode-whatsapp-icon">💬</span> no seu celular.
                  </p>
                </div>

                <div className="qrcode-instruction-item">
                  <div className="qrcode-instruction-number">2</div>
                  <p className="qrcode-instruction-text">
                    Toque em <strong>Mais opções</strong> <span className="qrcode-icon">⋮</span> no Android ou em <strong>Configurações</strong> <span className="qrcode-icon">⚙</span> no iPhone.
                  </p>
                </div>

                <div className="qrcode-instruction-item">
                  <div className="qrcode-instruction-number">3</div>
                  <p className="qrcode-instruction-text">
                    Toque em <strong>Dispositivos conectados</strong> e, em seguida, em <strong>Conectar um dispositivo</strong>.
                  </p>
                </div>

                <div className="qrcode-instruction-item">
                  <div className="qrcode-instruction-number">4</div>
                  <p className="qrcode-instruction-text">
                    Aponte seu celular para esta tela para escanear o QR code.
                  </p>
                </div>
              </div>

              <div className="qrcode-modal-qr-container">
                {isLoading ? (
                  <div className="qrcode-loading">
                    <div className="qrcode-loading-spinner"></div>
                    <p>Gerando QR Code...</p>
                  </div>
                ) : qrCode ? (
                  <div className="qrcode-wrapper">
                    <QRCode 
                      value={qrCode} 
                      size={264}
                      level="H"
                      includeMargin={true}
                      className="qrcode-image"
                    />
                  </div>
                ) : (
                  <div className="qrcode-error">
                    <p>Erro ao gerar QR Code</p>
                    <p className="qrcode-error-subtitle">Tente novamente</p>
                  </div>
                )}
              </div>
            </div>

            <button className="qrcode-modal-phone-link" onClick={handlePhoneLinkClick}>
              Conectar com número de telefone
            </button>
          </div>
        ) : !requiresCode ? (
          <div className="qrcode-modal-content">
            <h2 className="qrcode-modal-title">Insira o número de telefone</h2>
            <p className="qrcode-modal-subtitle">Selecione o país e insira seu número de telefone.</p>

            <form onSubmit={handlePhoneConnect} className="qrcode-phone-form">
              <div className="qrcode-phone-input-wrapper">
                <div className="qrcode-country-select">
                  <span className="qrcode-flag">🇧🇷</span>
                  <span className="qrcode-country-name">Brasil</span>
                  <svg className="qrcode-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>

              <div className="qrcode-phone-input-wrapper">
                <input
                  type="tel"
                  className="qrcode-phone-input"
                  placeholder=""
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                    setPhoneNumber(value);
                  }}
                  required
                  disabled={isSubmitting}
                />
                <div className="qrcode-phone-prefix">{countryCode}</div>
              </div>

              <button
                type="submit"
                className="qrcode-phone-button-primary qrcode-button-avancar"
                disabled={isSubmitting || !phoneNumber.trim() || phoneNumber.replace(/\D/g, "").length < 10}
              >
                {isSubmitting ? "Enviando..." : "Avançar"}
              </button>
            </form>

            <button className="qrcode-modal-phone-link" onClick={handleBackToQr}>
              Conectar com o QR code
            </button>
          </div>
        ) : (
          <div className="qrcode-modal-content">
            <h2 className="qrcode-modal-title">Insira o código no seu celular</h2>
            <p className="qrcode-modal-subtitle">
              Conectando a conta do WhatsApp {formatPhoneDisplay()} <button className="qrcode-edit-link" onClick={() => setRequiresCode(false)}>(Editar)</button>
            </p>

            <div className="qrcode-code-display">
              {connectionCode ? connectionCode.split("").map((char, index) => (
                <div key={index} className="qrcode-code-box">
                  {char === "-" ? "-" : char}
                </div>
              )) : (
                <div className="qrcode-loading">
                  <div className="qrcode-loading-spinner"></div>
                  <p>Gerando código...</p>
                </div>
              )}
            </div>

            <div className="qrcode-modal-instructions qrcode-code-instructions">
              <div className="qrcode-instruction-item">
                <div className="qrcode-instruction-number">1</div>
                <p className="qrcode-instruction-text">
                  Abra o WhatsApp <span className="qrcode-whatsapp-icon">💬</span> no seu celular.
                </p>
              </div>

              <div className="qrcode-instruction-item">
                <div className="qrcode-instruction-number">2</div>
                <p className="qrcode-instruction-text">
                  Toque em <strong>Mais opções</strong> <span className="qrcode-icon">⋮</span> no Android ou em <strong>Configurações</strong> <span className="qrcode-icon">⚙</span> no iPhone.
                </p>
              </div>

              <div className="qrcode-instruction-item">
                <div className="qrcode-instruction-number">3</div>
                <p className="qrcode-instruction-text">
                  Toque em <strong>Dispositivos conectados</strong> e, em seguida, em <strong>Conectar dispositivo</strong>.
                </p>
              </div>

              <div className="qrcode-instruction-item">
                <div className="qrcode-instruction-number">4</div>
                <p className="qrcode-instruction-text">
                  Toque em <strong>Conectar com número de telefone</strong> e insira o código exibido no seu celular.
                </p>
              </div>
            </div>

            <button className="qrcode-modal-phone-link" onClick={handleBackToQr}>
              Conectar com o QR code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(QrcodeModal);
