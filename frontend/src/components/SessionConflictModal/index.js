import React, { useState } from "react";
import Button from "../UI/Button";
import "./SessionConflictModal.css";

const SessionConflictModal = ({ 
  isOpen, 
  onKeepCurrent, 
  onKeepBoth,
  onClose 
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKeepCurrent = async () => {
    setLoading(true);
    try {
      await onKeepCurrent();
    } finally {
      setLoading(false);
    }
  };

  const handleKeepBoth = async () => {
    setLoading(true);
    try {
      await onKeepBoth();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="session-conflict-overlay">
      <div className="session-conflict-modal">
        <div className="session-conflict-header">
          <div className="session-conflict-icon">🔐</div>
          <h3 className="session-conflict-title">
            Nova Sessão Detectada
          </h3>
        </div>
        
        <div className="session-conflict-content">
          <p className="session-conflict-message">
            Você fez login em outro dispositivo ou aba. Como deseja proceder?
          </p>
          
          <div className="session-conflict-options">
            <div className="session-conflict-option">
              <div className="session-conflict-option-icon">🔄</div>
              <div className="session-conflict-option-content">
                <h4 className="session-conflict-option-title">
                  Manter apenas esta sessão
                </h4>
                <p className="session-conflict-option-description">
                  A outra sessão será desconectada automaticamente. Você precisará fazer login novamente na outra aba ou dispositivo.
                </p>
              </div>
            </div>
            
            <div className="session-conflict-option">
              <div className="session-conflict-option-icon">✅</div>
              <div className="session-conflict-option-content">
                <h4 className="session-conflict-option-title">
                  Manter ambas as sessões
                </h4>
                <p className="session-conflict-option-description">
                  Você poderá usar o sistema em ambas as abas ou dispositivos simultaneamente.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="session-conflict-actions">
          <Button
            variant="outline"
            onClick={handleKeepCurrent}
            disabled={loading}
            fullWidth
          >
            {loading ? "Processando..." : "Manter apenas esta"}
          </Button>
          <Button
            variant="primary"
            onClick={handleKeepBoth}
            disabled={loading}
            fullWidth
          >
            {loading ? "Processando..." : "Manter ambas"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionConflictModal;

