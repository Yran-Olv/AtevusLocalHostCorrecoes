import React, { useState, useEffect } from 'react';
import { FiX, FiClock, FiUser, FiLayers, FiCheckCircle } from 'react-icons/fi';
import { i18n } from '../../translate/i18n';
import { format, parseISO } from 'date-fns';
import api from '../../services/api';
import toastError from "../../errors/toastError";
import "./style.css";

const ShowTicketLogModal = ({ isOpen, handleClose, ticketId }) => {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const typeDescriptions = {
    create: i18n.t("showTicketLogModal.options.create"),
    chatBot: i18n.t("showTicketLogModal.options.chatBot"),
    queue: i18n.t("showTicketLogModal.options.queue"),
    open: i18n.t("showTicketLogModal.options.open"),
    access: i18n.t("showTicketLogModal.options.access"),
    transfered: i18n.t("showTicketLogModal.options.transfered"),
    receivedTransfer: i18n.t("showTicketLogModal.options.receivedTransfer"),
    pending: i18n.t("showTicketLogModal.options.pending"),
    closed: i18n.t("showTicketLogModal.options.closed"),
    reopen: i18n.t("showTicketLogModal.options.reopen"),
    redirect: i18n.t("showTicketLogModal.options.redirect")
  };

  useEffect(() => {
    if (isOpen && ticketId) {
      setLoading(true);
      const delayDebounceFn = setTimeout(() => {
        const fetchLogs = async () => {
          try {
            const { data } = await api.get(`/tickets-log/${ticketId}`);
            setLogs(data);
            setLoading(false);
          } catch (err) {
            setLoading(false);
            toastError(err);
          }
        };
        fetchLogs();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    }
  }, [isOpen, ticketId]);

  const getLogIcon = (type) => {
    switch (type) {
      case 'create':
      case 'open':
      case 'reopen':
        return <FiCheckCircle className="log-icon log-icon-success" />;
      case 'closed':
        return <FiX className="log-icon log-icon-error" />;
      case 'queue':
      case 'redirect':
        return <FiLayers className="log-icon log-icon-info" />;
      case 'access':
      case 'transfered':
      case 'receivedTransfer':
        return <FiUser className="log-icon log-icon-primary" />;
      default:
        return <FiClock className="log-icon log-icon-default" />;
    }
  };

  const getLogDescription = (log) => {
    if (log.type === 'access' || log.type === 'transfered' || 
        log.type === 'open' || log.type === 'pending' || 
        log.type === "closed" || log.type === "reopen") {
      return log?.user?.name || 'Sistema';
    } else if (log.type === 'queue' || log.type === 'redirect') {
      return log?.queue?.name || 'Fila';
    } else if (log.type === 'receivedTransfer') {
      return `${log?.queue?.name || 'Fila'} - ${log?.user?.name || 'Usuário'}`;
    }
    return 'Sistema';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <FiClock className="modal-title-icon" />
            {i18n.t('showTicketLogModal.title.header')}
          </h2>
          <button className="modal-close" onClick={handleClose}>
            <FiX />
          </button>
        </div>
        
        <div className="modal-content">
          {loading ? (
            <div className="log-loading">
              <div className="log-loading-spinner"></div>
              <p>Carregando logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="log-empty">
              <FiClock className="log-empty-icon" />
              <p>Nenhum log encontrado</p>
            </div>
          ) : (
            <div className="log-timeline">
              {logs.map((log, index) => (
                <div key={index} className="log-item">
                  <div className="log-item-line"></div>
                  <div className="log-item-icon">
                    {getLogIcon(log.type)}
                  </div>
                  <div className="log-item-content">
                    <div className="log-item-header">
                      <span className="log-item-user">
                        {getLogDescription(log)}
                      </span>
                      <span className="log-item-time">
                        {format(parseISO(log?.createdAt), 'dd/MM/yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="log-item-type">
                      {typeDescriptions[log.type] || log.type}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="modal-button" onClick={handleClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowTicketLogModal;
