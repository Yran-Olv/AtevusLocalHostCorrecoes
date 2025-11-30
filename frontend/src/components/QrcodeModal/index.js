import React, { useEffect, useState, useContext } from "react";
import QRCode from "qrcode.react";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import "./style.css";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
  const [qrCode, setQrCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
    
    if (open) {
      fetchSession();
    }
  }, [whatsAppId, open]);

  useEffect(() => {
    if (!whatsAppId || !isSocketValid(socket) || !open) return;
    const companyId = user.companyId;

    const onWhatsappData = (data) => {
      if (data.action === "update" && data.session.id === whatsAppId) {
        setQrCode(data.session.qrcode);
        setIsLoading(false);
      }

      if (data.action === "update" && data.session.qrcode === "") {
        onClose();
      }
    }
    
    safeSocketOn(socket, `company-${companyId}-whatsappSession`, onWhatsappData);

    return () => {
      safeSocketOff(socket, `company-${companyId}-whatsappSession`, onWhatsappData);
    };
  }, [whatsAppId, onClose, socket, user.companyId, open]);

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

        <div className="qrcode-modal-content">
          <h2 className="qrcode-modal-title">
            Para configurar o WhatsApp no seu computador:
          </h2>

          <div className="qrcode-modal-body">
            <div className="qrcode-modal-instructions">
              <div className="qrcode-instruction-item">
                <div className="qrcode-instruction-number">1</div>
                <p className="qrcode-instruction-text">
                  Abra o WhatsApp no seu celular.
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

          <button className="qrcode-modal-phone-link" onClick={onClose}>
            Conectar com número de telefone
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(QrcodeModal);
