import React, { useEffect, useState, useRef } from "react";
import { FiX, FiChevronDown, FiSmartphone } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import "./style.css";

export function WhatsappsFilter({ onFiltered, initialWhatsapps }) {
  const [whatsapps, setWhatsapps] = useState([]);
  const [selecteds, setSelecteds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      await loadWhatsapps();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelecteds([]);
    if (
      Array.isArray(initialWhatsapps) &&
      Array.isArray(whatsapps) &&
      whatsapps.length > 0
    ) {
      onChange(initialWhatsapps);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialWhatsapps, whatsapps]);

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

  const loadWhatsapps = async () => {
    try {
      const { data } = await api.get(`/whatsapp`);
      const whatsappList = data.map((w) => ({ id: w.id, name: w.name, channel: w.channel }));
      setWhatsapps(whatsappList);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async (value) => {
    setSelecteds(value);
    onFiltered(value);
  };

  const toggleWhatsapp = (whatsapp) => {
    const isSelected = selecteds.some(s => s.id === whatsapp.id);
    let newSelecteds;
    
    if (isSelected) {
      newSelecteds = selecteds.filter(s => s.id !== whatsapp.id);
    } else {
      newSelecteds = [...selecteds, whatsapp];
    }
    
    onChange(newSelecteds);
  };

  const removeWhatsapp = (whatsappId, e) => {
    e.stopPropagation();
    const newSelecteds = selecteds.filter(s => s.id !== whatsappId);
    onChange(newSelecteds);
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case "whatsapp":
        return <FaWhatsapp style={{ color: "#25d366" }} />;
      default:
        return <FiSmartphone />;
    }
  };

  const filteredWhatsapps = whatsapps.filter(whatsapp =>
    whatsapp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="filter-autocomplete" ref={dropdownRef}>
      <label className="filter-label">
        {i18n.t("tickets.search.filterConections")}
      </label>
      <div className="filter-input-wrapper">
        <div 
          className="filter-input"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="filter-chips">
            {selecteds.length === 0 ? (
              <span className="filter-placeholder">
                {i18n.t("tickets.search.filterConections")}
              </span>
            ) : (
              selecteds.map((whatsapp) => (
                <span key={whatsapp.id} className="filter-chip filter-chip-whatsapp">
                  {getChannelIcon(whatsapp.channel)}
                  {whatsapp.name}
                  <button
                    className="filter-chip-remove"
                    onClick={(e) => removeWhatsapp(whatsapp.id, e)}
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
                placeholder="Buscar conexão..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="filter-options">
              {filteredWhatsapps.length === 0 ? (
                <div className="filter-empty">Nenhuma conexão encontrada</div>
              ) : (
                filteredWhatsapps.map((whatsapp) => {
                  const isSelected = selecteds.some(s => s.id === whatsapp.id);
                  return (
                    <div
                      key={whatsapp.id}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleWhatsapp(whatsapp)}
                    >
                      <div className="filter-option-checkbox">
                        {isSelected && <div className="filter-option-check"></div>}
                      </div>
                      {getChannelIcon(whatsapp.channel)}
                      <span className="filter-option-label">{whatsapp.name}</span>
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
