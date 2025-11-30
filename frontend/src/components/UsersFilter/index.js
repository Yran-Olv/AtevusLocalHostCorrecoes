import React, { useEffect, useState, useRef } from "react";
import { FiX, FiChevronDown, FiUser } from "react-icons/fi";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import "./style.css";

export function UsersFilter({ onFiltered, initialUsers }) {
  const [users, setUsers] = useState([]);
  const [selecteds, setSelecteds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      await loadUsers();
    }
    fetchData();
  }, []);

  useEffect(() => {
    setSelecteds([]);
    if (
      Array.isArray(initialUsers) &&
      Array.isArray(users) &&
      users.length > 0
    ) {
      onChange(initialUsers);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUsers, users]);

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

  const loadUsers = async () => {
    try {
      const { data } = await api.get(`/users/list`);
      const userList = data.map((u) => ({ id: u.id, name: u.name }));
      setUsers(userList);
    } catch (err) {
      toastError(err);
    }
  };

  const onChange = async (value) => {
    setSelecteds(value);
    onFiltered(value);
  };

  const toggleUser = (user) => {
    const isSelected = selecteds.some(s => s.id === user.id);
    let newSelecteds;
    
    if (isSelected) {
      newSelecteds = selecteds.filter(s => s.id !== user.id);
    } else {
      newSelecteds = [...selecteds, user];
    }
    
    onChange(newSelecteds);
  };

  const removeUser = (userId, e) => {
    e.stopPropagation();
    const newSelecteds = selecteds.filter(s => s.id !== userId);
    onChange(newSelecteds);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="filter-autocomplete" ref={dropdownRef}>
      <label className="filter-label">
        {i18n.t("tickets.search.filterUsers")}
      </label>
      <div className="filter-input-wrapper">
        <div 
          className="filter-input"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="filter-chips">
            {selecteds.length === 0 ? (
              <span className="filter-placeholder">
                {i18n.t("tickets.search.filterUsers")}
              </span>
            ) : (
              selecteds.map((user) => (
                <span key={user.id} className="filter-chip">
                  <FiUser className="filter-chip-icon" />
                  {user.name}
                  <button
                    className="filter-chip-remove"
                    onClick={(e) => removeUser(user.id, e)}
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
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="filter-options">
              {filteredUsers.length === 0 ? (
                <div className="filter-empty">Nenhum usuário encontrado</div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selecteds.some(s => s.id === user.id);
                  return (
                    <div
                      key={user.id}
                      className={`filter-option ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleUser(user)}
                    >
                      <div className="filter-option-checkbox">
                        {isSelected && <div className="filter-option-check"></div>}
                      </div>
                      <FiUser className="filter-option-icon" />
                      <span className="filter-option-label">{user.name}</span>
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
