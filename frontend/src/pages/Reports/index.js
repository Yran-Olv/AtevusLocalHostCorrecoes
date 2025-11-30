import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import * as XLSX from 'xlsx';

// React Icons
import { 
  FiClock, 
  FiArrowRight, 
  FiDownload, 
  FiLoader,
  FiFacebook,
  FiInstagram
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { UsersFilter } from "../../components/UsersFilter";
import { WhatsappsFilter } from "../../components/WhatsappsFilter";
import { StatusFilter } from "../../components/StatusFilter";
import useDashboard from "../../hooks/useDashboard";
import QueueSelectCustom from "../../components/QueueSelectCustom";
import moment from "moment";
import ShowTicketLogModal from "../../components/ShowTicketLogModal";
import "./style.css";

const Reports = () => {
  const history = useHistory();
  const { getReport } = useDashboard();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWhatsapp, setSelectedWhatsapp] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [queueIds, setQueueIds] = useState([]);
  const [userIds, setUserIds] = useState([]);
  const [options, setOptions] = useState([]);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [dateFrom, setDateFrom] = useState(moment("1", "D").format("YYYY-MM-DD"));
  const [dateTo, setDateTo] = useState(moment().format("YYYY-MM-DD"));
  const [onlyRated, setOnlyRated] = useState(false);
  const [totalTickets, setTotalTickets] = useState(0);
  const [tickets, setTickets] = useState([]);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const [ticketOpen, setTicketOpen] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (searchParam.length >= 3) {
      setLoading(true);
      const delayDebounceFn = setTimeout(() => {
        const fetchContacts = async () => {
          try {
            const { data } = await api.get("contacts", {
              params: { searchParam },
            });
            setOptions(data.contacts);
            setFilteredOptions(data.contacts.slice(0, 10));
            setLoading(false);
          } catch (err) {
            setLoading(false);
            toastError(err);
          }
        };
        fetchContacts();
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setOptions([]);
      setFilteredOptions([]);
    }
  }, [searchParam]);

  const exportarGridParaExcel = async () => {
    setLoading(true);
    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: 1,
        pageSize: 9999999,
        onlyRated: onlyRated ? "true" : "false"
      });

      const ticketsData = data.tickets.map(ticket => {
        const createdAt = new Date(ticket.createdAt);
        const closedAt = new Date(ticket.closedAt);
        const dataFechamento = closedAt.toLocaleDateString();
        const horaFechamento = closedAt.toLocaleTimeString();
        const dataCriacao = createdAt.toLocaleDateString();
        const horaCriacao = createdAt.toLocaleTimeString();

        return {
          id: ticket.id,
          Conexão: ticket.whatsappName,
          Contato: ticket.contactName,
          Usuário: ticket.userName,
          Fila: ticket.queueName,
          Status: ticket.status,
          ÚltimaMensagem: ticket.lastMessage,
          DataAbertura: dataCriacao,
          HoraAbertura: horaCriacao,
          DataFechamento: ticket.closedAt === null ? "" : dataFechamento,
          HoraFechamento: ticket.closedAt === null ? "" : horaFechamento,
          TempoDeAtendimento: ticket.supportTime,
          nps: ticket.NPS,
        }
      });

      const ws = XLSX.utils.json_to_sheet(ticketsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'RelatorioDeAtendimentos');
      XLSX.writeFile(wb, 'relatorio-de-atendimentos.xlsx');
      setPageNumber(pageNumber);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (pageNumber) => {
    setLoading(true);
    try {
      const data = await getReport({
        searchParam,
        contactId: selectedContactId,
        whatsappId: JSON.stringify(selectedWhatsapp),
        users: JSON.stringify(userIds),
        queueIds: JSON.stringify(queueIds),
        status: JSON.stringify(selectedStatus),
        dateFrom,
        dateTo,
        page: pageNumber,
        pageSize: pageSize,
        onlyRated: onlyRated ? "true" : "false"
      });

      setTotalTickets(data.totalTickets.total);
      setHasMore(data.tickets.length === pageSize);
      setTickets(data.tickets);
      setPageNumber(pageNumber);
    } catch (error) {
      toastError(error);
    } finally {
      setLoading(false);
    }
  }

  const handleSelectedUsers = (selecteds) => {
    const users = selecteds.map((t) => t.id);
    setUserIds(users);
  };

  const handleSelectedWhatsapps = (selecteds) => {
    const whatsapp = selecteds.map((t) => t.id);
    setSelectedWhatsapp(whatsapp);
  };

  const handleSelectedStatus = (selecteds) => {
    const statusFilter = selecteds.map((t) => t.status);
    setSelectedStatus(statusFilter);
  };

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <FiFacebook style={{ color: "#3b5998", verticalAlign: "middle" }} />;
      case "instagram":
        return <FiInstagram style={{ color: "#e1306c", verticalAlign: "middle" }} />;
      case "whatsapp":
        return <FaWhatsapp style={{ color: "#25d366", verticalAlign: "middle" }} />
      default:
        return null;
    }
  };

  const handleSelectOption = (option) => {
    if (option && option.id) {
      setSelectedContactId(option.id);
    } else if (option && option.name && searchParam.length >= 3) {
      // Criar novo contato
      setSelectedContactId(null);
    }
    setSearchParam("");
    setShowAutocomplete(false);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalTickets / pageSize);
    const pages = [];
    
    // Mostrar no máximo 7 páginas
    let startPage = Math.max(1, pageNumber - 3);
    let endPage = Math.min(totalPages, pageNumber + 3);
    
    if (startPage > 1) {
      pages.push(
        <button
          key="first"
          className="reports-pagination-item"
          onClick={() => handleFilter(1)}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="dots1" className="reports-pagination-item disabled">...</span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`reports-pagination-item ${i === pageNumber ? 'active' : ''}`}
          onClick={() => handleFilter(i)}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="dots2" className="reports-pagination-item disabled">...</span>);
      }
      pages.push(
        <button
          key="last"
          className="reports-pagination-item"
          onClick={() => handleFilter(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    return pages;
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('open') || statusLower.includes('aberto')) {
      return 'open';
    } else if (statusLower.includes('pending') || statusLower.includes('pendente')) {
      return 'pending';
    } else if (statusLower.includes('closed') || statusLower.includes('fechado')) {
      return 'closed';
    }
    return '';
  };

  return (
    <MainContainer>
      <div className="reports-container">
        {openTicketMessageDialog && (
          <ShowTicketLogModal
            isOpen={openTicketMessageDialog}
            handleClose={() => setOpenTicketMessageDialog(false)}
            ticketId={ticketOpen.id}
          />
        )}
        
        <div className="reports-header">
          <h1 className="reports-title">{i18n.t("reports.title")}</h1>
        </div>

        <div className="reports-filters-panel">
          <div className="reports-filters-grid">
            {/* Autocomplete de Contato */}
            <div className="reports-filter-item" style={{ position: 'relative' }}>
              <label className="reports-filter-label">
                {i18n.t("newTicketModal.fieldLabel")}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="reports-input"
                  value={searchParam}
                  onChange={(e) => {
                    setSearchParam(e.target.value);
                    setShowAutocomplete(e.target.value.length >= 3);
                  }}
                  onFocus={() => {
                    if (searchParam.length >= 3) setShowAutocomplete(true);
                  }}
                  placeholder={i18n.t("newTicketModal.fieldLabel")}
                />
                {loading && (
                  <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                    <FiLoader className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                )}
                {showAutocomplete && filteredOptions.length > 0 && (
                  <div className="reports-autocomplete-dropdown">
                    {filteredOptions.map((option, index) => (
                      <div
                        key={index}
                        className="reports-autocomplete-option"
                        onClick={() => handleSelectOption(option)}
                      >
                        {option.channel && IconChannel(option.channel)}
                        <span style={{ marginLeft: option.channel ? '10px' : '0' }}>
                          {option.name} {option.number ? `- ${option.number}` : ''}
                        </span>
                      </div>
                    ))}
                    {searchParam.length >= 3 && !options.find(o => o.name === searchParam) && (
                      <div
                        className="reports-autocomplete-option"
                        onClick={() => handleSelectOption({ name: searchParam })}
                      >
                        {i18n.t("newTicketModal.add")} {searchParam}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="reports-filter-item">
              <WhatsappsFilter onFiltered={handleSelectedWhatsapps} />
            </div>

            <div className="reports-filter-item">
              <StatusFilter onFiltered={handleSelectedStatus} />
            </div>

            <div className="reports-filter-item">
              <UsersFilter onFiltered={handleSelectedUsers} />
            </div>

            <div className="reports-filter-item">
              <QueueSelectCustom
                selectedQueueIds={queueIds}
                onChange={values => setQueueIds(values)}
              />
            </div>

            <div className="reports-filter-item">
              <label className="reports-filter-label">Data Inicial</label>
              <input
                type="date"
                className="reports-input"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="reports-filter-item">
              <label className="reports-filter-label">Data Final</label>
              <input
                type="date"
                className="reports-input"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            <div className="reports-filter-item" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div className="reports-switch-wrapper">
                <label className="reports-switch">
                  <input
                    type="checkbox"
                    checked={onlyRated}
                    onChange={() => setOnlyRated(!onlyRated)}
                  />
                  <span className="reports-switch-slider"></span>
                </label>
                <span className="reports-switch-label">
                  {i18n.t("reports.buttons.onlyRated")}
                </span>
              </div>
              
              <button
                className="reports-button-icon"
                onClick={exportarGridParaExcel}
                title="Exportar para Excel"
              >
                <FiDownload />
              </button>
              
              <button
                className="reports-button"
                onClick={() => handleFilter(pageNumber)}
              >
                {i18n.t("reports.buttons.filter")}
              </button>
            </div>
          </div>
        </div>

        <div className="reports-table-container">
          <table className="reports-table" id="grid-attendants">
            <thead>
              <tr>
                <th className="center">{i18n.t("reports.table.id")}</th>
                <th>{i18n.t("reports.table.whatsapp")}</th>
                <th>{i18n.t("reports.table.contact")}</th>
                <th>{i18n.t("reports.table.user")}</th>
                <th>{i18n.t("reports.table.queue")}</th>
                <th className="center">{i18n.t("reports.table.status")}</th>
                <th>{i18n.t("reports.table.lastMessage")}</th>
                <th className="center">{i18n.t("reports.table.dateOpen")}</th>
                <th className="center">{i18n.t("reports.table.dateClose")}</th>
                <th className="center">{i18n.t("reports.table.supportTime")}</th>
                <th className="center">{i18n.t("reports.table.NPS")}</th>
                <th className="center">{i18n.t("reports.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="center">{ticket.id}</td>
                  <td>{ticket?.whatsappName || '-'}</td>
                  <td>{ticket?.contactName || '-'}</td>
                  <td>{ticket?.userName || '-'}</td>
                  <td>{ticket?.queueName || '-'}</td>
                  <td className="center">
                    <span className={`reports-status-badge ${getStatusBadgeClass(ticket?.status)}`}>
                      {ticket?.status || '-'}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ticket?.lastMessage || '-'}
                  </td>
                  <td className="center">{ticket?.createdAt || '-'}</td>
                  <td className="center">{ticket?.closedAt || '-'}</td>
                  <td className="center">{ticket?.supportTime || '-'}</td>
                  <td className="center">{ticket?.NPS || '-'}</td>
                  <td className="center">
                    <div className="reports-action-buttons">
                      <button
                        className="reports-action-icon history"
                        onClick={() => {
                          setOpenTicketMessageDialog(true);
                          setTicketOpen(ticket);
                        }}
                        title="Logs do Ticket"
                      >
                        <FiClock />
                      </button>
                      <button
                        className="reports-action-icon forward"
                        onClick={() => history.push(`/tickets/${ticket.uuid}`)}
                        title="Acessar Ticket"
                      >
                        <FiArrowRight />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && <TableRowSkeleton avatar columns={12} />}
              {!loading && tickets.length === 0 && (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '2rem', color: 'var(--reports-text-light)' }}>
                    Nenhum ticket encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="reports-pagination-container">
          <div className="reports-pagination">
            {renderPagination()}
          </div>
          
          <div className="reports-page-size-select">
            <label className="reports-filter-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              {i18n.t("tickets.search.ticketsPerPage")}
            </label>
            <select
              className="reports-input"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                handleFilter(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default Reports;
