import React, { useState, useEffect, useContext } from "react";
import { 
  FiSearch, 
  FiPlus, 
  FiCalendar,
  FiClock,
  FiEye,
  FiUser,
  FiMessageSquare
} from "react-icons/fi";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";
import "./style.css";

const Kanban = () => {
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [ticketNot, setTicketNot] = useState(0);
  const [file, setFile] = useState({ lanes: [] });
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const jsonString = user?.queues && Array.isArray(user.queues) 
    ? user.queues.map(queue => queue?.UserQueue?.queueId).filter(Boolean)
    : [];

  useEffect(() => {
    fetchTags();
  }, [user]);

  const fetchTags = async () => {
    try {
      const response = await api.get("/tag/kanban/");
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      fetchTickets();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(jsonString),
          startDate: startDate,
          endDate: endDate,
        }
      });
      setTickets(data.tickets);
    } catch (err) {
      console.log(err);
      setTickets([]);
    }
  };

  useEffect(() => {
    if (isSocketValid(socket) && user.companyId) {
      const companyId = user.companyId;
      const onAppMessage = (data) => {
        if (data.action === "create" || data.action === "update" || data.action === "delete") {
          fetchTickets();
        }
      };
      safeSocketOn(socket, `company-${companyId}-ticket`, onAppMessage);
      safeSocketOn(socket, `company-${companyId}-appMessage`, onAppMessage);

      return () => {
        safeSocketOff(socket, `company-${companyId}-ticket`, onAppMessage);
        safeSocketOff(socket, `company-${companyId}-appMessage`, onAppMessage);
      };
    }
  }, [socket, startDate, endDate, user.companyId]);

  const handleSearchClick = () => {
    fetchTickets();
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <FaFacebook className="kanban-channel-icon kanban-channel-facebook" />;
      case "instagram":
        return <FaInstagram className="kanban-channel-icon kanban-channel-instagram" />;
      case "whatsapp":
        return <FaWhatsapp className="kanban-channel-icon kanban-channel-whatsapp" />;
      default:
        return null;
    }
  };

  const popularCards = (jsonString) => {
    if (!tickets || !Array.isArray(tickets)) {
      setFile({ lanes: [] });
      return;
    }

    if (!tags || !Array.isArray(tags)) {
      setFile({ lanes: [] });
      return;
    }

    const filteredTickets = tickets.filter(ticket => ticket && ticket.tags && Array.isArray(ticket.tags) && ticket.tags.length === 0);

    const lanes = [
      {
        id: "lane0",
        title: i18n.t("tagsKanban.laneDefault"),
        label: filteredTickets.length.toString(),
        cards: filteredTickets.map(ticket => ({
          id: ticket.id.toString(),
          label: "Ticket nº " + ticket.id.toString(),
          description: (
            <div className="kanban-card-content">
              <div className="kanban-card-header">
                <span className="kanban-card-number">{ticket.contact?.number || 'N/A'}</span>
                <span className={`kanban-card-time ${Number(ticket.unreadMessages) > 0 ? 'unread' : ''}`}>
                  {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                    format(parseISO(ticket.updatedAt), "HH:mm")
                  ) : (
                    format(parseISO(ticket.updatedAt), "dd/MM/yyyy")
                  )}
                </span>
              </div>
              <div className="kanban-card-message">{ticket.lastMessage || " "}</div>
              <div className="kanban-card-actions">
                <button
                  className="kanban-card-button"
                  onClick={() => {
                    handleCardClick(ticket.uuid)
                  }}
                >
                  <FiEye className="kanban-card-button-icon" />
                  Ver Ticket
                </button>
                {ticket?.user && (
                  <span className="kanban-card-user-badge">
                    <FiUser className="kanban-card-user-icon" />
                    {ticket.user?.name.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          ),
          title: (
            <div className="kanban-card-title">
              {IconChannel(ticket.channel)}
              <span className="kanban-card-title-text">{ticket.contact?.name || 'Sem nome'}</span>
            </div>
          ),
          draggable: true,
          href: "/tickets/" + ticket.uuid,
        })),
      },
      ...tags.map(tag => {
        const filteredTickets = tickets.filter(ticket => {
          if (!ticket || !ticket.tags || !Array.isArray(ticket.tags)) return false;
          const tagIds = ticket.tags.map(tag => tag.id);
          return tagIds.includes(tag.id);
        });

        return {
          id: tag.id.toString(),
          title: tag.name,
          label: filteredTickets?.length.toString(),
          cards: filteredTickets.map(ticket => ({
            id: ticket.id.toString(),
            label: "Ticket nº " + ticket.id.toString(),
            description: (
              <div className="kanban-card-content">
                <div className="kanban-card-info">
                  <span className="kanban-card-number">{ticket.contact?.number || 'N/A'}</span>
                  <span className={`kanban-card-time ${Number(ticket.unreadMessages) > 0 ? 'unread' : ''}`}>
                    {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                      format(parseISO(ticket.updatedAt), "HH:mm")
                    ) : (
                      format(parseISO(ticket.updatedAt), "dd/MM/yyyy")
                    )}
                  </span>
                </div>
                <div className="kanban-card-message">{ticket.lastMessage || " "}</div>
                <div className="kanban-card-actions">
                  <button
                    className="kanban-card-button"
                    onClick={() => {
                      handleCardClick(ticket.uuid)
                    }}
                  >
                    <FiEye className="kanban-card-button-icon" />
                    Ver Ticket
                  </button>
                  {ticket?.user && (
                    <span className="kanban-card-user-badge">
                      <FiUser className="kanban-card-user-icon" />
                      {ticket.user?.name.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            ),
            title: (
              <div className="kanban-card-title">
                {IconChannel(ticket.channel)}
                <span className="kanban-card-title-text">{ticket.contact?.name || 'Sem nome'}</span>
              </div>
            ),
            draggable: true,
            href: "/tickets/" + ticket.uuid,
          })),
          style: { backgroundColor: tag.color, color: "white" }
        };
      }),
    ];

    setFile({ lanes });
  };

  const handleCardClick = (uuid) => {
    history.push('/tickets/' + uuid);
  };

  useEffect(() => {
    popularCards(jsonString);
  }, [tags, tickets]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
      await fetchTickets(jsonString);
      popularCards(jsonString);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddConnectionClick = () => {
    history.push('/tagsKanban');
  };

  // Garantir que file sempre tenha lanes
  const boardData = file && file.lanes ? file : { lanes: [] };

  return (
    <div className="kanban-container">
      <div className="kanban-header">
        <div className="kanban-title-wrapper">
          <h1 className="kanban-title">
            <FiMessageSquare className="kanban-title-icon" />
            {i18n.t("tagsKanban.title") || "Kanban de Tickets"}
          </h1>
        </div>
        
        <div className="kanban-filters">
          <div className="kanban-date-filters">
            <div className="kanban-date-input-wrapper">
              <label className="kanban-date-label">
                <FiCalendar className="kanban-date-icon" />
                Data de início
              </label>
              <input
                type="date"
                className="kanban-date-input"
                value={startDate}
                onChange={handleStartDateChange}
              />
            </div>
            
            <div className="kanban-date-input-wrapper">
              <label className="kanban-date-label">
                <FiCalendar className="kanban-date-icon" />
                Data de fim
              </label>
              <input
                type="date"
                className="kanban-date-input"
                value={endDate}
                onChange={handleEndDateChange}
              />
            </div>
            
            <button
              className="kanban-search-button"
              onClick={handleSearchClick}
            >
              <FiSearch className="kanban-search-icon" />
              Buscar
            </button>
          </div>
          
          <Can role={user.profile} perform="dashboard:view" yes={() => (
            <button
              className="kanban-add-button"
              onClick={handleAddConnectionClick}
            >
              <FiPlus className="kanban-add-icon" />
              Adicionar colunas
            </button>
          )} />
        </div>
      </div>

      <div className="kanban-board-wrapper">
        {boardData.lanes && boardData.lanes.length > 0 ? (
          <Board
            data={boardData}
            onCardMoveAcrossLanes={handleCardMove}
            style={{ backgroundColor: 'transparent' }}
          />
        ) : (
          <div className="kanban-empty-state">
            <div className="kanban-empty-icon">
              <FiMessageSquare />
            </div>
            <h3 className="kanban-empty-text">Carregando Kanban...</h3>
            <p className="kanban-empty-subtext">Aguarde enquanto os dados são carregados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kanban;
