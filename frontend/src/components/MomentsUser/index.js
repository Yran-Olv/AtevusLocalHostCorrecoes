import React, { Fragment, useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import { format, isSameDay, parseISO } from "date-fns";
import { getBackendUrl } from "../../config";

// React Icons
import { 
  FiEye, 
  FiAlertCircle, 
  FiUser, 
  FiMessageSquare,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";

import "./style.css";

const backendUrl = getBackendUrl();

const DashboardManage = () => {
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);

  const [tickets, setTickets] = useState([]);
  const [update, setUpdate] = useState(false);
  const [ticketNot, setTicketNot] = useState(0);
  const companyId = user.companyId;

  const userQueueIds = user.queues.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/usersMoments");
        setTickets(data);
        setUpdate(!update);
      } catch (err) {
        if (err.response?.status !== 500) {
          toastError(err);
        } else {
          toast.error(`${i18n.t("frontEndErrors.getUsers")}`);
        }
      }
    })();
  }, []);

  useEffect(() => {
    const companyId = user.companyId;
    
    const onAppMessage = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        (async () => {
          try {
            const { data } = await api.get("/usersMoments");
            setTickets(data);
            setUpdate(!update);
          } catch (err) {
            if (err.response?.status !== 500) {
              toastError(err);
            } else {
              toast.error(`${i18n.t("frontEndErrors.getUsers")}`);
            }
          }
        })();
      }
    }
  
    if (isSocketValid(socket) && companyId) {
      safeSocketOn(socket, `company-${companyId}-ticket`, onAppMessage);
      safeSocketOn(socket, `company-${companyId}-appMessage`, onAppMessage);
  
      return () => {
        safeSocketOff(socket, `company-${companyId}-ticket`, onAppMessage);
        safeSocketOff(socket, `company-${companyId}-appMessage`, onAppMessage);
      };
    }
  }, [socket, companyId]);

  const Moments = useMemo(() => {
    if (tickets && tickets.length > 0) {
      const ticketsByUser = tickets.reduce((userTickets, ticket) => {
        const user = ticket.user;

        if (user) {
          const userIndex = userTickets.findIndex((group) => group.user.id === user.id);
          if (userIndex === -1) {
            userTickets.push({
              user,
              userTickets: [ticket],
            });
          } else {
            userTickets[userIndex].userTickets.push(ticket);
          }
        }
        return userTickets;
      }, []);

      return ticketsByUser.map((group, index) => (
        <div key={index} className="moments-user-card">
          <div className="moments-card-header">
            <div className="moments-card-header-content">
              <div className="moments-avatar-wrapper">
                {group.user.profileImage ? (
                  <img 
                    src={`${backendUrl}/public/company${companyId}/user/${group.user.profileImage}`}
                    alt={group.user.name}
                    className="moments-avatar"
                  />
                ) : (
                  <div className="moments-avatar-placeholder">
                    <FiUser />
                  </div>
                )}
                <div className="moments-avatar-badge"></div>
              </div>
              <div className="moments-card-header-info">
                <h3 className="moments-card-header-title">
                  {group?.user?.name || "Pendentes"}
                </h3>
                <p className="moments-card-header-subtitle">
                  <FiMessageSquare className="moments-icon-small" />
                  {group.userTickets?.length} {group.userTickets?.length === 1 ? 'Atendimento' : 'Atendimentos'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="moments-card-body">
            {group.userTickets.map((ticket, ticketIndex) => (
              <div 
                key={ticket.id} 
                className={`moments-ticket-item ${Number(ticket.unreadMessages) > 0 ? 'unread' : ''}`}
                onClick={() => {
                  if (user.profile === "admin" || ticket.userId === user.id) {
                    history.push(`/tickets/${ticket.uuid}`);
                  }
                }}
              >
                <div className="moments-ticket-avatar">
                  {ticket.contact.urlPicture ? (
                    <img 
                      src={ticket.contact.urlPicture} 
                      alt={ticket.contact.name}
                      className="moments-ticket-avatar-img"
                    />
                  ) : (
                    <div className="moments-ticket-avatar-placeholder">
                      <FiUser />
                    </div>
                  )}
                  {Number(ticket.unreadMessages) > 0 && (
                    <div className="moments-unread-badge">
                      {ticket.unreadMessages > 9 ? '9+' : ticket.unreadMessages}
                    </div>
                  )}
                </div>
                
                <div className="moments-ticket-content">
                  <div className="moments-ticket-header">
                    <h4 className="moments-ticket-name">
                      {ticket?.contact?.name?.length > 30 
                        ? ticket?.contact?.name.substring(0, 25) + '...' 
                        : ticket?.contact?.name}
                    </h4>
                    <span className={`moments-ticket-time ${Number(ticket.unreadMessages) > 0 ? 'unread' : ''}`}>
                      {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                        format(parseISO(ticket.updatedAt), "HH:mm")
                      ) : (
                        format(parseISO(ticket.updatedAt), "dd/MM/yyyy")
                      )}
                    </span>
                  </div>
                  
                  <p className="moments-ticket-message">
                    {ticket.lastMessage?.length > 30 
                      ? String(ticket.lastMessage).substring(0, 27) + '...' 
                      : ticket.lastMessage}
                  </p>
                  
                  <div className="moments-ticket-tags">
                    {ticket?.whatsapp?.name && (
                      <span className="moments-tag moments-tag-whatsapp">
                        {ticket.whatsapp.name}
                      </span>
                    )}
                    {ticket.queue?.name && (
                      <span 
                        className="moments-tag moments-tag-queue"
                        style={{ backgroundColor: ticket.queue?.color || "#7c7c7c" }}
                      >
                        {ticket.queue.name.toUpperCase()}
                      </span>
                    )}
                    {!ticket.queue?.name && (
                      <span className="moments-tag moments-tag-queue">
                        SEM FILA
                      </span>
                    )}
                  </div>
                </div>
                
                {(user.profile === "admin" || ticket.userId === user.id) && (
                  <button
                    className="moments-ticket-action"
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push(`/tickets/${ticket.uuid}`);
                    }}
                    title="Acessar Ticket"
                  >
                    <FiEye />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ));
    } else {
      return null;
    }
  }, [update, tickets, companyId, user, history]);

  const MomentsPending = useMemo(() => {
    if (tickets && tickets.length > 0) {
      const pendingTickets = tickets.filter((ticket) => !ticket.user);

      if (pendingTickets.length === 0) return null;

      return (
        <div className="moments-user-card moments-pending-card">
          <div className="moments-card-header moments-card-header-pending">
            <div className="moments-card-header-content">
              <div className="moments-avatar-wrapper">
                <div className="moments-avatar-placeholder moments-avatar-pending">
                  <FiAlertCircle />
                </div>
                <div className="moments-avatar-badge moments-avatar-badge-pending"></div>
              </div>
              <div className="moments-card-header-info">
                <h3 className="moments-card-header-title">
                  Pendentes
                  <FiAlertCircle className="moments-pending-icon" />
                </h3>
                <p className="moments-card-header-subtitle">
                  <FiMessageSquare className="moments-icon-small" />
                  {pendingTickets?.length} {pendingTickets?.length === 1 ? 'Atendimento' : 'Atendimentos'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="moments-card-body">
            {pendingTickets.map((ticket) => (
              <div 
                key={ticket.id} 
                className={`moments-ticket-item ${Number(ticket.unreadMessages) > 0 ? 'unread' : ''}`}
              >
                <div className="moments-ticket-avatar">
                  {ticket.contact.urlPicture ? (
                    <img 
                      src={ticket.contact.urlPicture} 
                      alt={ticket.contact.name}
                      className="moments-ticket-avatar-img"
                    />
                  ) : (
                    <div className="moments-ticket-avatar-placeholder">
                      <FiUser />
                    </div>
                  )}
                  {Number(ticket.unreadMessages) > 0 && (
                    <div className="moments-unread-badge">
                      {ticket.unreadMessages > 9 ? '9+' : ticket.unreadMessages}
                    </div>
                  )}
                </div>
                
                <div className="moments-ticket-content">
                  <div className="moments-ticket-header">
                    <h4 className="moments-ticket-name">
                      {ticket?.contact?.name}
                    </h4>
                    <span className={`moments-ticket-time ${Number(ticket.unreadMessages) > 0 ? 'unread' : ''}`}>
                      {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                        format(parseISO(ticket.updatedAt), "HH:mm")
                      ) : (
                        format(parseISO(ticket.updatedAt), "dd/MM/yyyy")
                      )}
                    </span>
                  </div>
                  
                  <p className="moments-ticket-message">
                    {ticket.lastMessage?.length > 30 
                      ? String(ticket.lastMessage).substring(0, 27) + '...' 
                      : ticket.lastMessage}
                  </p>
                  
                  <div className="moments-ticket-tags">
                    {ticket?.whatsapp?.name && (
                      <span className="moments-tag moments-tag-whatsapp">
                        {ticket.whatsapp.name}
                      </span>
                    )}
                    {ticket.queue?.name && (
                      <span 
                        className="moments-tag moments-tag-queue"
                        style={{ backgroundColor: ticket.queue?.color || "#7c7c7c" }}
                      >
                        {ticket.queue.name.toUpperCase()}
                      </span>
                    )}
                    {!ticket.queue?.name && (
                      <span className="moments-tag moments-tag-queue">
                        SEM FILA
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }, [update, tickets]);

  if (!tickets || tickets.length === 0) {
    return (
      <div className="moments-empty-state">
        <div className="moments-empty-icon">
          <FiMessageSquare />
        </div>
        <h3 className="moments-empty-text">Nenhum atendimento no momento</h3>
        <p className="moments-empty-subtext">Os atendimentos aparecerão aqui quando houver tickets ativos</p>
      </div>
    );
  }

  return (
    <div className="moments-grid">
      {Moments}
      {MomentsPending}
    </div>
  );
};

export default DashboardManage;
