import React from "react";
import { i18n } from "../../translate/i18n";
import "../Dashboard/style.css";

const Filters = ({
  setDateStartTicket,
  setDateEndTicket,
  dateStartTicket,
  dateEndTicket,
  setQueueTicket,
  queueTicket,
  fetchData
}) => {
  const [queues, setQueues] = React.useState(queueTicket);
  const [dateStart, setDateStart] = React.useState(dateStartTicket);
  const [dateEnd, setDateEnd] = React.useState(dateEndTicket);
  const [fetchDataFilter, setFetchDataFilter] = React.useState(false);

  return (
    <div className="dashboard-filters-panel">
      <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.25rem', fontWeight: 600, color: 'var(--dashboard-text)' }}>
        Filtros
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--dashboard-text-light)' }}>
            {i18n.t("dashboard.date.initialDate")}
          </label>
          <input
            type="date"
            name="dateStart"
            value={dateStart}
            onChange={(e) => setDateStart(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid var(--dashboard-border)',
              borderRadius: '8px',
              fontSize: '0.95rem',
              backgroundColor: 'var(--dashboard-card-bg)',
              color: 'var(--dashboard-text)',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--dashboard-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--dashboard-border)'}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--dashboard-text-light)' }}>
            {i18n.t("dashboard.date.finalDate")}
          </label>
          <input
            type="date"
            name="dateEnd"
            value={dateEnd}
            onChange={(e) => setDateEnd(e.target.value)}
            style={{
              padding: '0.75rem',
              border: '1px solid var(--dashboard-border)',
              borderRadius: '8px',
              fontSize: '0.95rem',
              backgroundColor: 'var(--dashboard-card-bg)',
              color: 'var(--dashboard-text)',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--dashboard-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--dashboard-border)'}
          />
        </div>
        <button
          className="dashboard-filter-btn"
          onClick={() => {
            setQueueTicket(queues);
            setDateStartTicket(dateStart);
            setDateEndTicket(dateEnd);
            setFetchDataFilter(!fetchDataFilter);
            fetchData(!fetchDataFilter);
          }}
          style={{
            background: 'var(--dashboard-gradient)',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(6, 81, 131, 0.3)',
            height: 'fit-content'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 4px 12px rgba(6, 81, 131, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(6, 81, 131, 0.3)';
          }}
        >
          Filtrar
        </button>
      </div>
    </div>
  );
};

export default Filters;
