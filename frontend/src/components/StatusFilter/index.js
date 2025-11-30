import React, { useState, useRef, useEffect } from "react";
import { FiX, FiChevronDown, FiCircle } from "react-icons/fi";
import { i18n } from "../../translate/i18n";
import "./style.css";

export function StatusFilter({ onFiltered }) {
  const [selecteds, setSelecteds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const status = [
    { status: 'open', name: i18n.t("tickets.search.filterConectionsOptions.open"), color: '#10b981' },
    { status: 'closed', name: i18n.t("tickets.search.filterConectionsOptions.closed"), color: '#6b7280' },
    { status: 'pending', name: i18n.t("tickets.search.filterConectionsOptions.pending"), color: '#f59e0b' },
    { status: 'group', name: 'Grupos', color: '#3b82f6' },
  ];

  const onChange = async (value) => {
    setSelecteds(value);
    onFiltered(value);
  };

  const toggleStatus = (statusItem) => {
    const isSelected = selecteds.some(s => s.status === statusItem.status);
    let newSelecteds;
    
    if (isSelected) {
      newSelecteds = selecteds.filter(s => s.status !== statusItem.status);
    } else {
      newSelecteds = [...selecteds, statusItem];
    }
    
    onChange(newSelecteds);
  };

  const removeStatus = (statusValue, e) => {
    e.stopPropagation();
    const newSelecteds = selecteds.filter(s => s.status !== statusValue);
    onChange(newSelecteds);
  };

  const filteredStatus = status.filter(statusItem =>
    statusItem.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="filter-autocomplete" ref={dropdownRef}>
      <label className="filter-label">
        Filtro por Status
      </label>
      <div className="filter-input-wrapper">
        <div 
          className="filter-input"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="filter-chips">
            {selecteds.length === 0 ? (
              <span className="filter-placeholder">
                Filtro por Status
              </span>
            ) : (
              selecteds.map((statusItem) => (
                <span 
                  key={statusItem.status} 
                  className="filter-chip"
                  style={{ backgroundColor: statusItem.color }}
                >
                  <FiCircle className="filter-chip-icon" />
                  {statusItem.name}
                  <button
                    className="filter-chip-remove"
                    onClick={(e) => removeStatus(statusItem.status, e)}
                  >
                    <FiX />
                  </button>
                </span>
              ))
            )}
          </div>
          <FiChevronDown className={`filter-arrow ${isOpen ? 'open' : ''}`} />
        </div>
        
        {isOpen && (
          <div className="filter-dropdown">
            <div className="filter-search">
              <input
                type="text"
                className="filter-search-input"
                placeholder="Buscar status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="filter-options">
              {filteredStatus.length === 0 ? (
                <div className="filter-empty">Nenhum status encontrado</div>
              ) : (
                filteredStatus.map((statusItem) => {
                  const isSelected = selecteds.some(s => s.status === statusItem.status);
                  return (
                    <div
                      key={statusItem.status}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleStatus(statusItem)}
                    >
                      <div className="filter-option-checkbox">
                        {isSelected && <div className="filter-option-check"></div>}
                      </div>
                      <FiCircle 
                        className="filter-option-icon" 
                        style={{ color: statusItem.color }}
                      />
                      <span className="filter-option-label">{statusItem.name}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
