import React, { useState, useEffect, useReducer, useCallback, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";
import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import ScheduleModal from "../../components/ScheduleModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import usePlans from "../../hooks/usePlans";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "moment/locale/pt-br";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./style.css";

// Defina a função getUrlParam antes de usá-la
function getUrlParam(paramName) {
  const searchParams = new URLSearchParams(window.location.search);
  return searchParams.get(paramName);
}

const eventTitleStyle = {
  fontSize: "14px", // Defina um tamanho de fonte menor
  overflow: "hidden", // Oculte qualquer conteúdo excedente
  whiteSpace: "nowrap", // Evite a quebra de linha do texto
  textOverflow: "ellipsis", // Exiba "..." se o texto for muito longo
};

const localizer = momentLocalizer(moment);
var defaultMessages = {
  date: "Data",
  time: "Hora",
  event: "Evento",
  allDay: "Dia Todo",
  week: "Semana",
  work_week: "Agendamentos",
  day: "Dia",
  month: "Mês",
  previous: "Anterior",
  next: "Próximo",
  yesterday: "Ontem",
  tomorrow: "Amanhã",
  today: "Hoje",
  agenda: "Agenda",
  noEventsInRange: "Não há agendamentos no período.",
  showMore: function showMore(total) {
    return "+" + total + " mais";
  }
};

const reducer = (state, action) => {
  if (action.type === "LOAD_SCHEDULES") {
    const schedules = action.payload;
    const newSchedules = [];

    schedules.forEach((schedule) => {
      const scheduleIndex = state.findIndex((s) => s.id === schedule.id);
      if (scheduleIndex !== -1) {
        state[scheduleIndex] = schedule;
      } else {
        newSchedules.push(schedule);
      }
    });

    return [...state, ...newSchedules];
  }

  if (action.type === "UPDATE_SCHEDULES") {
    const schedule = action.payload;
    const scheduleIndex = state.findIndex((s) => s.id === schedule.id);

    if (scheduleIndex !== -1) {
      state[scheduleIndex] = schedule;
      return [...state];
    } else {
      return [schedule, ...state];
    }
  }

  if (action.type === "DELETE_SCHEDULE") {
    const scheduleId = action.payload;

    const scheduleIndex = state.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex !== -1) {
      state.splice(scheduleIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Schedules = () => {
  const history = useHistory();

  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);


  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deletingSchedule, setDeletingSchedule] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [schedules, dispatch] = useReducer(reducer, []);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [contactId, setContactId] = useState(+getUrlParam("contactId"));

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs || !planConfigs.plan || !planConfigs.plan.useSchedules) {
        if (planConfigs && planConfigs.plan) {
          toast.error("Esta empresa não possui permissão para acessar essa página! Estamos lhe redirecionando.");
          setTimeout(() => {
            history.push(`/`)
          }, 1000);
        }
        // Se planConfigs estiver vazio (erro de rede), não redirecionar
      }
    }
    fetchData();
  }, [user, history, getPlanCompany]);

  const fetchSchedules = useCallback(async () => {
    try {
      const { data } = await api.get("/schedules", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_SCHEDULES", payload: data.schedules });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  }, [searchParam, pageNumber]);

  const handleOpenScheduleModalFromContactId = useCallback(() => {
    if (contactId) {
      handleOpenScheduleModal();
    }
  }, [contactId]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchSchedules();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [
    searchParam,
    pageNumber,
    contactId,
    fetchSchedules,
    handleOpenScheduleModalFromContactId,
  ]);

  useEffect(() => {
    // handleOpenScheduleModalFromContactId();
    // const socket = socketManager.GetSocket(user.companyId, user.id);


    const onCompanySchedule = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_SCHEDULES", payload: data.schedule });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_SCHEDULE", payload: +data.scheduleId });
      }
    }

    if (isSocketValid(socket) && user.companyId) {
      safeSocketOn(socket, `company${user.companyId}-schedule`, onCompanySchedule);

      return () => {
        safeSocketOff(socket, `company${user.companyId}-schedule`, onCompanySchedule);
      };
    }
  }, [socket, user.companyId]);

  const cleanContact = () => {
    setContactId("");
  };

  const handleOpenScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(true);
  };

  const handleCloseScheduleModal = () => {
    setSelectedSchedule(null);
    setScheduleModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditSchedule = (schedule) => {
    setSelectedSchedule(schedule);
    setScheduleModalOpen(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      await api.delete(`/schedules/${scheduleId}`);
      toast.success(i18n.t("schedules.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingSchedule(null);
    setSearchParam("");
    setPageNumber(1);

    dispatch({ type: "RESET" });
    setPageNumber(1);
    await fetchSchedules();
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const truncate = (str, len) => {
    if (str.length > len) {
      return str.substring(0, len) + "...";
    }
    return str;
  };

  return (
    <MainContainer className="schedules-container">
      <ConfirmationModal
        title={
          deletingSchedule &&
          `${i18n.t("schedules.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteSchedule(deletingSchedule.id)}
      >
        {i18n.t("schedules.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      {scheduleModalOpen && (
        <ScheduleModal
          open={scheduleModalOpen}
          onClose={handleCloseScheduleModal}
          reload={fetchSchedules}
          scheduleId={
            selectedSchedule ? selectedSchedule.id : null
          }
          contactId={contactId}
          cleanContact={cleanContact}
        />
      )}
      <div className="schedules-header">
        <div className="schedules-header-content">
          <h1 className="schedules-title">
            <FiCalendar className="schedules-title-icon" />
            {i18n.t("schedules.title")}
            <span className="schedules-title-count">({schedules.length})</span>
          </h1>
          <div className="schedules-header-actions">
            <div className="schedules-search-wrapper">
              <FiSearch className="schedules-search-icon" />
              <input
                type="search"
                className="schedules-search-input"
                placeholder={i18n.t("contacts.searchPlaceholder")}
                value={searchParam}
                onChange={handleSearch}
              />
            </div>
            <button
              className="schedules-button"
              onClick={handleOpenScheduleModal}
            >
              <FiPlus />
              {i18n.t("schedules.buttons.add")}
            </button>
          </div>
        </div>
      </div>
      <div className="schedules-list-wrapper" onScroll={handleScroll}>
        {/* Desktop: Calendário */}
        <div className="schedules-calendar-wrapper">
          <Calendar
            messages={defaultMessages}
            formats={{
              agendaDateFormat: "DD/MM ddd",
              weekdayFormat: "dddd"
            }}
            localizer={localizer}
            events={schedules.map((schedule) => ({
              title: (
                <div key={schedule.id} className="event-container">
                  <div className="event-title">{schedule?.contact?.name || "Sem nome"}</div>
                  <div className="event-actions">
                    <button
                      className="event-action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSchedule(schedule);
                        setScheduleModalOpen(true);
                      }}
                      title="Editar agendamento"
                    >
                      <FiEdit2 className="event-action-icon" />
                    </button>
                    <button
                      className="event-action-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmModalOpen(true);
                        setDeletingSchedule(schedule);
                      }}
                      title="Excluir agendamento"
                    >
                      <FiTrash2 className="event-action-icon" />
                    </button>
                  </div>
                </div>
              ),
              start: new Date(schedule.sendAt),
              end: new Date(schedule.sendAt),
            }))}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
          />
        </div>

        {/* Mobile: Lista de eventos estilo Google Calendar */}
        <div className="schedules-events-list">
          {schedules.length === 0 && !loading ? (
            <div className="schedules-empty-state">
              <FiCalendar className="schedules-empty-icon" />
              <p className="schedules-empty-text">Nenhum agendamento encontrado</p>
              <p className="schedules-empty-subtext">Toque no botão + para criar um novo agendamento</p>
            </div>
          ) : (
            schedules
              .sort((a, b) => new Date(a.sendAt) - new Date(b.sendAt))
              .map((schedule) => {
                const scheduleDate = new Date(schedule.sendAt);
                const timeString = scheduleDate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const dateString = scheduleDate.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });

                return (
                  <div key={schedule.id} className="schedules-event-item">
                    <div className="schedules-event-item-header">
                      <div className="schedules-event-time">
                        {timeString}
                      </div>
                      <div className="schedules-event-content">
                        <h3 className="schedules-event-title">
                          {schedule?.contact?.name || "Sem nome"}
                        </h3>
                        <p className="schedules-event-contact">
                          {dateString}
                        </p>
                      </div>
                    </div>
                    <div className="schedules-event-actions">
                      <button
                        className="schedules-event-action-btn"
                        onClick={() => {
                          handleEditSchedule(schedule);
                          setScheduleModalOpen(true);
                        }}
                        title="Editar agendamento"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="schedules-event-action-btn schedules-event-action-btn-danger"
                        onClick={() => {
                          setConfirmModalOpen(true);
                          setDeletingSchedule(schedule);
                        }}
                        title="Excluir agendamento"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                );
              })
          )}
          {loading && (
            <div className="schedules-empty-state">
              <div className="schedules-loading-spinner"></div>
              <p className="schedules-empty-text">Carregando agendamentos...</p>
            </div>
          )}
        </div>
      </div>
    </MainContainer>
  );
};

export default Schedules;