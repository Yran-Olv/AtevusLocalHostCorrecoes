import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { 
  FiSearch, 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiCheckCircle,
  FiMessageSquare,
  FiFile,
  FiLoader
} from "react-icons/fi";

import MainContainer from "../../components/MainContainer";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import QuickMessageDialog from "../../components/QuickMessageDialog";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { isArray } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import "./style.css";

const reducer = (state, action) => {
  if (action.type === "LOAD_QUICKMESSAGES") {
    const quickmessages = action.payload;
    const newQuickmessages = [];

    if (isArray(quickmessages)) {
      quickmessages.forEach((quickemessage) => {
        const quickemessageIndex = state.findIndex(
          (u) => u.id === quickemessage.id
        );
        if (quickemessageIndex !== -1) {
          state[quickemessageIndex] = quickemessage;
        } else {
          newQuickmessages.push(quickemessage);
        }
      });
    }

    return [...state, ...newQuickmessages];
  }

  if (action.type === "UPDATE_QUICKMESSAGES") {
    const quickemessage = action.payload;
    const quickemessageIndex = state.findIndex((u) => u.id === quickemessage.id);

    if (quickemessageIndex !== -1) {
      state[quickemessageIndex] = quickemessage;
      return [...state];
    } else {
      return [quickemessage, ...state];
    }
  }

  if (action.type === "DELETE_QUICKMESSAGE") {
    const quickemessageId = action.payload;

    const quickemessageIndex = state.findIndex((u) => u.id === quickemessageId);
    if (quickemessageIndex !== -1) {
      state.splice(quickemessageIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Quickemessages = () => {
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedQuickemessage, setSelectedQuickemessage] = useState(null);
  const [deletingQuickemessage, setDeletingQuickemessage] = useState(null);
  const [quickemessageModalOpen, setQuickMessageDialogOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [quickemessages, dispatch] = useReducer(reducer, []);
  const { user, socket } = useContext(AuthContext);

  const { profile } = user;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchQuickemessages();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (isSocketValid(socket) && user.companyId) {
      const companyId = user.companyId;

      const onQuickMessageEvent = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_QUICKMESSAGES", payload: data.record });
        }
        if (data.action === "delete") {
          dispatch({ type: "DELETE_QUICKMESSAGE", payload: +data.id });
        }
      };
      safeSocketOn(socket, `company-${companyId}-quickemessage`, onQuickMessageEvent);

      return () => {
        safeSocketOff(socket, `company-${companyId}-quickemessage`, onQuickMessageEvent);
      };
    }
  }, [socket, user.companyId]);

  const fetchQuickemessages = async () => {
    try {
      const companyId = user.companyId;
      const { data } = await api.get("/quick-messages", {
        params: { searchParam, pageNumber },
      });

      dispatch({ type: "LOAD_QUICKMESSAGES", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const handleOpenQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(true);
  };

  const handleCloseQuickMessageDialog = () => {
    setSelectedQuickemessage(null);
    setQuickMessageDialogOpen(false);
    fetchQuickemessages();
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditQuickemessage = (quickemessage) => {
    setSelectedQuickemessage(quickemessage);
    setQuickMessageDialogOpen(true);
  };

  const handleDeleteQuickemessage = async (quickemessageId) => {
    try {
      await api.delete(`/quick-messages/${quickemessageId}`);
      toast.success(i18n.t("quickemessages.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingQuickemessage(null);
    setSearchParam("");
    setPageNumber(1);
    fetchQuickemessages();
    dispatch({ type: "RESET" });
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

  return (
    <MainContainer>
      <ConfirmationModal
        title={deletingQuickemessage && `${i18n.t("quickMessages.confirmationModal.deleteTitle")} ${deletingQuickemessage.shortcode}?`}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteQuickemessage(deletingQuickemessage.id)}
      >
        {i18n.t("quickMessages.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      
      <QuickMessageDialog
        resetPagination={() => {
          setPageNumber(1);
          fetchQuickemessages();
        }}
        open={quickemessageModalOpen}
        onClose={handleCloseQuickMessageDialog}
        aria-labelledby="form-dialog-title"
        quickemessageId={selectedQuickemessage && selectedQuickemessage.id}
      />

      <div className="quick-messages-container">
        <div className="quick-messages-header">
          <div className="quick-messages-title-wrapper">
            <h1 className="quick-messages-title">
              <FiMessageSquare className="quick-messages-title-icon" />
              {i18n.t("quickMessages.title")}
            </h1>
          </div>
          
          <div className="quick-messages-actions">
            <div className="quick-messages-search-wrapper">
              <div className="quick-messages-search">
                <FiSearch className="quick-messages-search-icon" />
                <input
                  type="search"
                  className="quick-messages-search-input"
                  placeholder={i18n.t("quickMessages.searchPlaceholder")}
                  value={searchParam}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <button
              className="quick-messages-add-button"
              onClick={handleOpenQuickMessageDialog}
            >
              <FiPlus className="quick-messages-add-icon" />
              {i18n.t("quickMessages.buttons.add")}
            </button>
          </div>
        </div>

        <div 
          className="quick-messages-table-container"
          onScroll={handleScroll}
        >
          <table className="quick-messages-table">
            <thead className="quick-messages-table-head">
              <tr>
                <th className="quick-messages-table-header">
                  {i18n.t("quickMessages.table.shortcode")}
                </th>
                <th className="quick-messages-table-header">
                  {i18n.t("quickMessages.table.mediaName")}
                </th>
                <th className="quick-messages-table-header">
                  {i18n.t("quickMessages.table.status")}
                </th>
                <th className="quick-messages-table-header">
                  {i18n.t("quickMessages.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="quick-messages-table-body">
              {quickemessages.length === 0 && !loading ? (
                <tr>
                  <td colSpan="4" className="quick-messages-empty">
                    <div className="quick-messages-empty-content">
                      <FiMessageSquare className="quick-messages-empty-icon" />
                      <p className="quick-messages-empty-text">
                        Nenhuma mensagem rápida encontrada
                      </p>
                      <p className="quick-messages-empty-subtext">
                        Clique em "Adicionar" para criar sua primeira mensagem rápida
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {quickemessages.map((quickemessage) => (
                    <tr key={quickemessage.id} className="quick-messages-table-row">
                      <td className="quick-messages-table-cell">
                        <span className="quick-messages-shortcode">
                          {quickemessage.shortcode}
                        </span>
                      </td>
                      <td className="quick-messages-table-cell">
                        <div className="quick-messages-media">
                          {quickemessage.mediaName ? (
                            <>
                              <FiFile className="quick-messages-media-icon" />
                              <span className="quick-messages-media-name">
                                {quickemessage.mediaName}
                              </span>
                            </>
                          ) : (
                            <span className="quick-messages-no-media">
                              {i18n.t("quickMessages.noAttachment")}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="quick-messages-table-cell">
                        {quickemessage.geral === true ? (
                          <span className="quick-messages-status-badge active">
                            <FiCheckCircle className="quick-messages-status-icon" />
                            Geral
                          </span>
                        ) : (
                          <span className="quick-messages-status-badge inactive">
                            Específico
                          </span>
                        )}
                      </td>
                      <td className="quick-messages-table-cell">
                        <div className="quick-messages-actions-cell">
                          <button
                            className="quick-messages-action-button quick-messages-action-edit"
                            onClick={() => handleEditQuickemessage(quickemessage)}
                            title="Editar"
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="quick-messages-action-button quick-messages-action-delete"
                            onClick={() => {
                              setConfirmModalOpen(true);
                              setDeletingQuickemessage(quickemessage);
                            }}
                            title="Excluir"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {loading && <TableRowSkeleton columns={4} />}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainContainer>
  );
};

export default Quickemessages;
