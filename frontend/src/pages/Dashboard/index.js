import React, { useContext, useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";
import { isEmpty } from "lodash";
import { isArray } from "lodash";
import moment from "moment";

// React Icons
import {
  FiFilter,
  FiX,
  FiPhone,
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiUserPlus,
  FiMessageSquare,
  FiSend,
  FiAlertCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiDownload
} from "react-icons/fi";

import { AuthContext } from "../../context/Auth/AuthContext";
import useDashboard from "../../hooks/useDashboard";
import useContacts from "../../hooks/useContacts";
import useMessages from "../../hooks/useMessages";
import { ChatsUser } from "./ChartsUser";
import ChartDonut from "./ChartDonut";
import Filters from "./Filters";
import { ChartsDate } from "./ChartsDate";
import TableAttendantsStatus from "../../components/Dashboard/TableAttendantsStatus";
import ForbiddenPage from "../../components/ForbiddenPage";
import { i18n } from "../../translate/i18n";

import "./style.css";

// Componente DashboardCard movido para fora para evitar problemas de renderização
const DashboardCard = ({ label, value, icon: Icon, iconClass }) => (
  <div className="dashboard-card">
    <div className="dashboard-card-content">
      <div className="dashboard-card-info">
        <span className="dashboard-card-label">{label}</span>
        <h3 className="dashboard-card-value">{value || 0}</h3>
      </div>
      <div className={`dashboard-card-icon ${iconClass}`}>
        <Icon />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [counters, setCounters] = useState({});
  const [attendants, setAttendants] = useState([]);
  const [filterType, setFilterType] = useState(1);
  const [period, setPeriod] = useState(0);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);
  const { find } = useDashboard();

  // FILTROS NPS
  const [tab, setTab] = useState("Indicadores");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedQueues, setSelectedQueues] = useState([]);

  let newDate = new Date();
  let date = newDate.getDate();
  let month = newDate.getMonth() + 1;
  let year = newDate.getFullYear();
  let nowIni = `${year}-${month < 10 ? `0${month}` : `${month}`}-01`;
  let now = `${year}-${month < 10 ? `0${month}` : `${month}`}-${date < 10 ? `0${date}` : `${date}`}`;

  const [showFilter, setShowFilter] = useState(false);
  const [dateStartTicket, setDateStartTicket] = useState(nowIni);
  const [dateEndTicket, setDateEndTicket] = useState(now);
  const [queueTicket, setQueueTicket] = useState(false);
  const [fetchDataFilter, setFetchDataFilter] = useState(false);

  const { user } = useContext(AuthContext);

  // Chamar todos os hooks no nível superior (regra dos hooks do React)
  const contactsAll = useContacts({});
  const contactsFiltered = useContacts({
    dateStart: dateStartTicket,
    dateEnd: dateEndTicket,
  });
  
  const messagesReceivedAll = useMessages({ fromMe: false });
  const messagesReceivedFiltered = useMessages({
    fromMe: false,
    dateStart: dateStartTicket,
    dateEnd: dateEndTicket,
  });
  
  const messagesSentAll = useMessages({ fromMe: true });
  const messagesSentFiltered = useMessages({
    fromMe: true,
    dateStart: dateStartTicket,
    dateEnd: dateEndTicket,
  });

  const exportarGridParaExcel = () => {
    const ws = XLSX.utils.table_to_sheet(document.getElementById('grid-attendants'));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'RelatorioDeAtendentes');
    XLSX.writeFile(wb, 'relatorio-de-atendentes.xlsx');
  };

  var userQueueIds = [];

  if (user.queues && user.queues.length > 0) {
    userQueueIds = user.queues.map((q) => q.id);
  }

  useEffect(() => {
    async function firstLoad() {
      await fetchData();
    }
    setTimeout(() => {
      firstLoad();
    }, 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDataFilter]);

  async function fetchData() {
    setLoading(true);

    let params = {};

    if (period > 0) {
      params = {
        days: period,
      };
    }

    if (!isEmpty(dateStartTicket) && moment(dateStartTicket).isValid()) {
      params = {
        ...params,
        date_from: moment(dateStartTicket).format("YYYY-MM-DD"),
      };
    }

    if (!isEmpty(dateEndTicket) && moment(dateEndTicket).isValid()) {
      params = {
        ...params,
        date_to: moment(dateEndTicket).format("YYYY-MM-DD"),
      };
    }

    if (Object.keys(params).length === 0) {
      toast.error("Parametrize o filtro");
      setLoading(false);
      return;
    }

    const data = await find(params);

    setCounters(data.counters);
    if (isArray(data.attendants)) {
      setAttendants(data.attendants);
    } else {
      setAttendants([]);
    }

    setLoading(false);
  }

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setSelectedUsers(users);
  };

  const handleChangeTab = (e, newValue) => {
    if (newValue) {
    setTab(newValue);
    } else {
      setTab(e.target.textContent);
    }
  };

  function formatTime(minutes) {
    return moment()
      .startOf("day")
      .add(minutes, "minutes")
      .format("HH[h] mm[m]");
  }

  const GetUsers = () => {
    let count;
    let userOnline = 0;
    attendants.forEach(user => {
      if (user.online === true) {
        userOnline = userOnline + 1
      }
    })
    count = userOnline === 0 ? 0 : userOnline;
    return count;
  };

  function toggleShowFilter() {
    setShowFilter(!showFilter);
  }

  // Verificar permissão após todos os hooks serem chamados
  if (user.profile === "user" && user.showDashboard === "disabled") {
    return <ForbiddenPage />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600, color: 'var(--dashboard-text)' }}>
          Dashboard
        </h1>
        <button
          className="dashboard-filter-btn"
                      onClick={toggleShowFilter}
        >
          {!showFilter ? <FiFilter /> : <FiX />}
          {!showFilter ? "Filtros" : "Fechar"}
        </button>
      </div>

                  {showFilter && (
        <div className="dashboard-filters-panel">
                    <Filters
                      setDateStartTicket={setDateStartTicket}
                      setDateEndTicket={setDateEndTicket}
                      dateStartTicket={dateStartTicket}
                      dateEndTicket={dateEndTicket}
                      setQueueTicket={setQueueTicket}
                      queueTicket={queueTicket}
                      fetchData={setFetchDataFilter}
                    />
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`dashboard-tab ${tab === "Indicadores" ? "active" : ""}`}
          onClick={(e) => handleChangeTab(e, "Indicadores")}
        >
          {i18n.t("dashboard.tabs.indicators")}
        </button>
        <button
          className={`dashboard-tab ${tab === "NPS" ? "active" : ""}`}
          onClick={(e) => handleChangeTab(e, "NPS")}
        >
          {i18n.t("dashboard.tabs.assessments")}
        </button>
        <button
          className={`dashboard-tab ${tab === "Atendentes" ? "active" : ""}`}
          onClick={(e) => handleChangeTab(e, "Atendentes")}
        >
          {i18n.t("dashboard.tabs.attendants")}
        </button>
      </div>

      {tab === "Indicadores" && (
        <div className="dashboard-tab-content active">
          <div className="dashboard-grid">
            <DashboardCard
              label={i18n.t("dashboard.cards.inAttendance")}
              value={counters.supportHappening}
              icon={FiPhone}
              iconClass="primary"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.waiting")}
              value={counters.supportPending}
              icon={FiClock}
              iconClass="secondary"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.finalized")}
              value={counters.supportFinished}
              icon={FiCheckCircle}
              iconClass="success"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.groups")}
              value={counters.supportGroups}
              icon={FiUsers}
              iconClass="info"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.activeAttendants")}
              value={`${GetUsers()}/${attendants.length}`}
              icon={FiUsers}
              iconClass="warning"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.newContacts")}
              value={counters.leads}
              icon={FiUserPlus}
              iconClass="danger"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.totalReceivedMessages")}
              value={`${messagesReceivedFiltered?.count || 0}/${messagesReceivedAll?.count || 0}`}
              icon={FiMessageSquare}
              iconClass="message"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.totalSentMessages")}
              value={`${messagesSentFiltered?.count || 0}/${messagesSentAll?.count || 0}`}
              icon={FiSend}
              iconClass="send"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.averageServiceTime")}
              value={formatTime(counters.avgSupportTime)}
              icon={FiAlertCircle}
              iconClass="time"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.averageWaitingTime")}
              value={formatTime(counters.avgWaitTime)}
              icon={FiClock}
              iconClass="wait"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.activeTickets")}
              value={counters.activeTickets}
              icon={FiTrendingUp}
              iconClass="active"
            />
            <DashboardCard
              label={i18n.t("dashboard.cards.passiveTickets")}
              value={counters.passiveTickets}
              icon={FiTrendingDown}
              iconClass="passive"
            />
          </div>
        </div>
      )}

      {tab === "NPS" && (
        <div className="dashboard-tab-content active">
          <div className="dashboard-nps-grid">
            <div className="dashboard-nps-card">
                            <ChartDonut
                data={[`{'name': 'Promotores', 'value': ${counters.npsPromotersPerc || 100}}`,
                `{'name': 'Detratores', 'value': ${counters.npsDetractorsPerc || 0}}`,
                `{'name': 'Neutros', 'value': ${counters.npsPassivePerc || 0}}`
                ]}
                value={counters.npsScore || 0}
                              title="Score"
                color={(parseInt(counters.npsPromotersPerc || 0) + parseInt(counters.npsDetractorsPerc || 0) + parseInt(counters.npsPassivePerc || 0)) === 0 ? ["#918F94"] : ["#2EA85A", "#F73A2C", "#F7EC2C"]}
              />
            </div>
            <div className="dashboard-nps-card">
                            <ChartDonut
                              title={i18n.t("dashboard.assessments.prosecutors")}
                value={counters.npsPromotersPerc || 0}
                              data={[`{'name': 'Promotores', 'value': 100}`]}
                              color={["#2EA85A"]}
                            />
            </div>
            <div className="dashboard-nps-card">
                            <ChartDonut
                              data={[`{'name': 'Neutros', 'value': 100}`]}
                              title={i18n.t("dashboard.assessments.neutral")}
                value={counters.npsPassivePerc || 0}
                              color={["#F7EC2C"]}
                            />
            </div>
            <div className="dashboard-nps-card">
                            <ChartDonut
                              data={[`{'name': 'Detratores', 'value': 100}`]}
                              title={i18n.t("dashboard.assessments.detractors")}
                value={counters.npsDetractorsPerc || 0}
                              color={["#F73A2C"]}
                            />
            </div>
          </div>
          <div className="dashboard-nps-stats">
            <h3>Estatísticas NPS</h3>
            <p><strong>{i18n.t("dashboard.assessments.totalCalls")}:</strong> {counters.tickets}</p>
            <p><strong>{i18n.t("dashboard.assessments.callsWaitRating")}:</strong> {counters.waitRating}</p>
            <p><strong>{i18n.t("dashboard.assessments.callsWithoutRating")}:</strong> {counters.withoutRating}</p>
            <p><strong>{i18n.t("dashboard.assessments.ratedCalls")}:</strong> {counters.withRating}</p>
            <p><strong>{i18n.t("dashboard.assessments.evaluationIndex")}:</strong> {Number((counters.percRating || 0) / 100).toLocaleString(undefined, { style: 'percent' })}</p>
          </div>
        </div>
      )}

      {tab === "Atendentes" && (
        <div className="dashboard-tab-content active">
          <button
            className="dashboard-export-btn"
            onClick={exportarGridParaExcel}
          >
            <FiDownload />
            Exportar para Excel
          </button>

          <div className="dashboard-table-container" id="grid-attendants">
                          {attendants.length ? (
                            <TableAttendantsStatus
                              attendants={attendants}
                              loading={loading}
                            />
            ) : (
              <div className="dashboard-empty">
                <p>Nenhum atendente encontrado</p>
              </div>
            )}
          </div>

          <div className="dashboard-chart-container">
                            <ChatsUser />
          </div>

          <div className="dashboard-chart-container">
                            <ChartsDate />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
