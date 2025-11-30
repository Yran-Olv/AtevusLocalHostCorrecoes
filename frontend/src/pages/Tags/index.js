import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
import { toast } from "react-toastify";
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiTag, FiUsers, FiMoreHorizontal } from "react-icons/fi";

import MainContainer from "../../components/MainContainer";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import ContactTagListModal from "../../components/ContactTagListModal";

import './style.css';

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TAGS":
      return [...state, ...action.payload];
    case "UPDATE_TAGS":
      const tag = action.payload;
      const tagIndex = state.findIndex((s) => s.id === tag.id);

      if (tagIndex !== -1) {
        state[tagIndex] = tag;
        return [...state];
      } else {
        return [tag, ...state];
      }
    case "DELETE_TAGS":
      const tagId = action.payload;
      return state.filter((tag) => tag.id !== tagId);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const Tags = () => {
  const { user, socket } = useContext(AuthContext);

  const [selectedTagContacts, setSelectedTagContacts] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [selectedTagName, setSelectedTagName] = useState("");
  const [selectedTag, setSelectedTag] = useState(null);
  const [deletingTag, setDeletingTag] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [tags, dispatch] = useReducer(reducer, []);
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const pageNumberRef = useRef(1);

  useEffect(() => {
    const fetchMoreTags = async () => {
      try {
        const { data } = await api.get("/tags/", {
          params: { searchParam, pageNumber, kanban: 0 },
        });
        dispatch({ type: "LOAD_TAGS", payload: data.tags });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreTags();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (isSocketValid(socket) && user.companyId) {
      const onCompanyTags = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_TAGS", payload: data.tag });
        }

        if (data.action === "delete") {
          dispatch({ type: "DELETE_TAGS", payload: +data.tagId });
        }
      };
      safeSocketOn(socket, `company${user.companyId}-tag`, onCompanyTags);

      return () => {
        safeSocketOff(socket, `company${user.companyId}-tag`, onCompanyTags);
      };
    }
  }, [socket, user.companyId]);

  const handleOpenTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(true);
  };

  const handleCloseTagModal = () => {
    setSelectedTag(null);
    setTagModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setTagModalOpen(true);
  };

  const handleShowContacts = (contacts, tag) => {
    setSelectedTagContacts(contacts);
    setContactModalOpen(true);
    setSelectedTagName(tag);
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
    setSelectedTagContacts([]);
    setSelectedTagName("");
  };

  const handleDeleteTag = async (tagId) => {
    try {
      await api.delete(`/tags/${tagId}`);
      toast.success(i18n.t("tags.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingTag(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
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
      {contactModalOpen && (
        <ContactTagListModal
          open={contactModalOpen}
          onClose={handleCloseContactModal}
          tag={selectedTagName}
        />
      )}
      <ConfirmationModal
        title={deletingTag && `${i18n.t("tags.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteTag(deletingTag.id)}
      >
        {i18n.t("tags.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <TagModal
        open={tagModalOpen}
        onClose={handleCloseTagModal}
        aria-labelledby="form-dialog-title"
        tagId={selectedTag && selectedTag.id}
        kanban={0}
      />
      
      <div className="tags-container">
        <div className="tags-header">
          <div className="tags-header-content">
            <h1 className="tags-title">
              <FiTag className="tags-title-icon" />
              {i18n.t("tags.title")}
              <span className="tags-title-count">{tags.length}</span>
            </h1>
            <div className="tags-header-actions">
              <div className="tags-search-wrapper">
                <FiSearch className="tags-search-icon" />
                <input
                  type="search"
                  className="tags-search-input"
                  placeholder={i18n.t("contacts.searchPlaceholder")}
                  value={searchParam}
                  onChange={handleSearch}
                />
              </div>
              <button
                className="tags-button tags-button-primary"
                onClick={handleOpenTagModal}
              >
                <FiPlus />
                {i18n.t("tags.buttons.add")}
              </button>
            </div>
          </div>
        </div>

        <div className="tags-list-wrapper" onScroll={handleScroll}>
          {/* Desktop: Tabela */}
          <div className="tags-table-container">
            <table className="tags-table">
              <thead>
                <tr>
                  <th className="center">{i18n.t("tags.table.id")}</th>
                  <th className="center">{i18n.t("tags.table.name")}</th>
                  <th className="center">{i18n.t("tags.table.contacts")}</th>
                  <th className="center">{i18n.t("tags.table.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {tags.map((tag) => (
                  <tr key={tag.id}>
                    <td className="center">{tag.id}</td>
                    <td className="center">
                      <span
                        className="tags-chip"
                        style={{
                          backgroundColor: tag.color,
                          color: "white",
                        }}
                      >
                        {tag.name}
                      </span>
                    </td>
                    <td className="center">
                      <div className="tags-contacts-cell">
                        <span className="tags-contacts-count">{tag?.contacts?.length || 0}</span>
                        <button
                          className="tags-contacts-button"
                          onClick={() => handleShowContacts(tag?.contacts, tag)}
                          disabled={!tag?.contacts || tag?.contacts?.length === 0}
                          title="Ver contatos"
                        >
                          <FiMoreHorizontal />
                        </button>
                      </div>
                    </td>
                    <td className="center">
                      <div className="tags-actions">
                        <button
                          className="tags-action-button"
                          onClick={() => handleEditTag(tag)}
                          title="Editar tag"
                        >
                          <FiEdit2 className="tags-action-icon" />
                        </button>
                        <button
                          className="tags-action-button"
                          onClick={() => {
                            setConfirmModalOpen(true);
                            setDeletingTag(tag);
                          }}
                          title="Excluir tag"
                        >
                          <FiTrash2 className="tags-action-icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {loading && <TableRowSkeleton key="skeleton" columns={4} />}
              </tbody>
            </table>
          </div>

          {/* Mobile: Cards */}
          <div className="tags-cards-container">
            {tags.map((tag) => (
              <div key={tag.id} className="tags-card">
                <div className="tags-card-content">
                  <div className="tags-card-header">
                    <span
                      className="tags-card-chip"
                      style={{
                        backgroundColor: tag.color,
                        color: "white",
                      }}
                    >
                      <FiTag className="tags-card-chip-icon" />
                      {tag.name}
                    </span>
                    <span className="tags-card-id">#{tag.id}</span>
                  </div>
                  <div className="tags-card-info">
                    <div className="tags-card-contacts">
                      <FiUsers className="tags-card-contacts-icon" />
                      <span className="tags-card-contacts-text">
                        {tag?.contacts?.length || 0} {tag?.contacts?.length === 1 ? 'contato' : 'contatos'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="tags-card-actions-mobile">
                  <button
                    className="tags-card-action-btn"
                    onClick={() => handleShowContacts(tag?.contacts, tag)}
                    disabled={!tag?.contacts || tag?.contacts?.length === 0}
                    title="Ver contatos"
                  >
                    <FiUsers />
                  </button>
                  <button
                    className="tags-card-action-btn"
                    onClick={() => handleEditTag(tag)}
                    title="Editar tag"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="tags-card-action-btn tags-card-action-btn-danger"
                    onClick={() => {
                      setConfirmModalOpen(true);
                      setDeletingTag(tag);
                    }}
                    title="Excluir tag"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
            {loading && (
              <div className="tags-loading-skeleton">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="tags-skeleton-card">
                    <div className="tags-skeleton-chip"></div>
                    <div className="tags-skeleton-content">
                      <div className="tags-skeleton-line"></div>
                      <div className="tags-skeleton-line short"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tags.length === 0 && !loading && (
              <div className="tags-empty-state">
                <FiTag className="tags-empty-icon" />
                <p className="tags-empty-text">Nenhuma tag encontrada</p>
                <p className="tags-empty-subtext">Toque no botão + para criar uma nova tag</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainContainer>
  );
};

export default Tags;
