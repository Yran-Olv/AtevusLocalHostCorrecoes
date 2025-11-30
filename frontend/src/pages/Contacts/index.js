import React, {
    useState,
    useEffect,
    useReducer,
    useContext,
    useRef,
} from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import {
    FiSearch,
    FiPlus,
    FiEdit2,
    FiTrash2,
    FiCheckCircle,
    FiX,
    FiLock,
    FiChevronDown,
    FiPhone,
    FiUpload,
} from "react-icons/fi";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import { i18n } from "../../translate/i18n";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import { Can } from "../../components/Can";
import NewTicketModal from "../../components/NewTicketModal";
import { TagsFilter } from "../../components/TagsFilter";
import formatSerializedId from '../../utils/formatSerializedId';
import { v4 as uuidv4 } from "uuid";

import ContactImportWpModal from "../../components/ContactImportWpModal";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import { TicketsContext } from "../../context/Tickets/TicketsContext";
import "./style.css";

const reducer = (state, action) => {
    if (action.type === "LOAD_CONTACTS") {
        const contacts = action.payload;
        const newContacts = [];

        contacts.forEach((contact) => {
            const contactIndex = state.findIndex((c) => c.id === contact.id);
            if (contactIndex !== -1) {
                state[contactIndex] = contact;
            } else {
                newContacts.push(contact);
            }
        });

        return [...state, ...newContacts];
    }

    if (action.type === "UPDATE_CONTACTS") {
        const contact = action.payload;
        const contactIndex = state.findIndex((c) => c.id === contact.id);

        if (contactIndex !== -1) {
            state[contactIndex] = contact;
            return [...state];
        } else {
            return [contact, ...state];
        }
    }

    if (action.type === "DELETE_CONTACT") {
        const contactId = action.payload;

        const contactIndex = state.findIndex((c) => c.id === contactId);
        if (contactIndex !== -1) {
            state.splice(contactIndex, 1);
        }
        return [...state];
    }

    if (action.type === "RESET") {
        return [];
    }
};

const Contacts = () => {
    const history = useHistory();

    //   const socketManager = useContext(SocketContext);
    const { user, socket } = useContext(AuthContext);


    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchParam, setSearchParam] = useState("");
    const [contacts, dispatch] = useReducer(reducer, []);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);

    const [importContactModalOpen, setImportContactModalOpen] = useState(false);
    const [deletingContact, setDeletingContact] = useState(null);
    const [ImportContacts, setImportContacts] = useState(null);
    const [blockingContact, setBlockingContact] = useState(null);
    const [unBlockingContact, setUnBlockingContact] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [exportContact, setExportContact] = useState(false);
    const [confirmChatsOpen, setConfirmChatsOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});
    const fileUploadRef = useRef(null);
    const [selectedTags, setSelectedTags] = useState([]);
    const { setCurrentTicket } = useContext(TicketsContext);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const { getAll: getAllSettings } = useCompanySettings();
    const [hideNum, setHideNum] = useState(false);
    const [enableLGPD, setEnableLGPD] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        if (dropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);
    useEffect(() => {

        async function fetchData() {

            const settingList = await getAllSettings(user.companyId);

            for (const [key, value] of Object.entries(settingList)) {
                
                if (key === "enableLGPD") setEnableLGPD(value === "enabled");
                if (key === "lgpdHideNumber") setHideNum(value === "enabled");
                
              }

            // if (settingHideNumber.lgpdHideNumber === "enabled") {
            //     setHideNum(true);
            // }
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleImportExcel = async () => {
        try {
            const formData = new FormData();
            formData.append("file", fileUploadRef.current.files[0]);
            await api.request({
                url: `/contacts/upload`,
                method: "POST",
                data: formData,
            });
            history.go(0);
        } catch (err) {
            toastError(err);
        }
    };

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam, selectedTags]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    const { data } = await api.get("/contacts/", {
                        params: { searchParam, pageNumber, contactTag: JSON.stringify(selectedTags) },
                    });
                    dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
                    setHasMore(data.hasMore);
                    setLoading(false);
                } catch (err) {
                    toastError(err);
                }
            };
            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber, selectedTags]);

    useEffect(() => {
        if (isSocketValid(socket) && user.companyId) {
          const companyId = user.companyId;
          //    const socket = socketManager.GetSocket();

          const onContactEvent = (data) => {
              if (data.action === "update" || data.action === "create") {
                  dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
              }

              if (data.action === "delete") {
                  dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
              }
          };
          safeSocketOn(socket, `company-${companyId}-contact`, onContactEvent);

          return () => {
            safeSocketOff(socket, `company-${companyId}-contact`, onContactEvent);
          };
        }
    }, [socket, user.companyId]);

    const handleSelectTicket = (ticket) => {
        const code = uuidv4();
        const { id, uuid } = ticket;
        setCurrentTicket({ id, uuid, code });
    }

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.uuid !== undefined) {
            handleSelectTicket(ticket);
            history.push(`/tickets/${ticket.uuid}`);
        }
    };

    const handleSelectedTags = (selecteds) => {
        const tags = selecteds.map((t) => t.id);
        setSelectedTags(tags);
    };

    const handleSearch = (event) => {
        setSearchParam(event.target.value.toLowerCase());
    };

    const handleOpenContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(true);
    };

    const handleCloseContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(false);
    };

    const hadleEditContact = (contactId) => {
        setSelectedContactId(contactId);
        setContactModalOpen(true);
    };

    const handleDeleteContact = async (contactId) => {
        try {
            await api.delete(`/contacts/${contactId}`);
            toast.success(i18n.t("contacts.toasts.deleted"));
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
    };

    const handleBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: false });
            toast.success("Contato bloqueado");
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
        setBlockingContact(null);
    };

    const handleUnBlockContact = async (contactId) => {
        try {
            await api.put(`/contacts/block/${contactId}`, { active: true });
            toast.success("Contato desbloqueado");
        } catch (err) {
            toastError(err);
        }
        setDeletingContact(null);
        setSearchParam("");
        setPageNumber(1);
        setUnBlockingContact(null);
    };

    const handleimportContact = async () => {
        try {
            await api.post("/contacts/import");
            history.go(0);
            setImportContacts(false);
        } catch (err) {
            toastError(err);
            setImportContacts(false);
        }
    };

    const handleimportChats = async () => {
        try {
            await api.post("/contacts/import/chats");
            history.go(0);
        } catch (err) {
            toastError(err);
        }
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

    // function getDateLastMessage(contact) {
    //     if (!contact) return null;
    //     if (!contact.tickets) return null;

    //     if (contact.tickets.length > 0) {
    //         const date = new Date(contact.tickets[contact.tickets.length - 1].updatedAt);

    //         const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    //         const month = date.getMonth() + 1 > 9 ? date.getMonth() + 1 : `0${date.getMonth() + 1}`;
    //         const year = date.getFullYear();
    //         const hours = date.getHours() > 9 ? date.getHours() : `0${date.getHours()}`;
    //         const minutes = date.getMinutes() > 9 ? date.getMinutes() : `0${date.getMinutes()}`;

    //         return `${day}/${month}/${year} ${hours}:${minutes}`;
    //     }

    //     return null;
    // }


    const getChannelIcon = (channel) => {
        switch (channel) {
            case "whatsapp":
                return <FaWhatsapp className="contacts-channel-icon contacts-channel-whatsapp" />;
            case "instagram":
                return <FaInstagram className="contacts-channel-icon contacts-channel-instagram" />;
            case "facebook":
                return <FaFacebook className="contacts-channel-icon contacts-channel-facebook" />;
            default:
                return null;
        }
    };

    return (
        <MainContainer className="contacts-container">
            <NewTicketModal
                modalOpen={newTicketModalOpen}
                initialContact={contactTicket}
                onClose={(ticket) => {
                    handleCloseOrOpenTicket(ticket);
                }}
            />
            <ContactModal
                open={contactModalOpen}
                onClose={handleCloseContactModal}
                aria-labelledby="form-dialog-title"
                contactId={selectedContactId}
            ></ContactModal>
            <ConfirmationModal
                title={
                    deletingContact
                        ? `${i18n.t(
                            "contacts.confirmationModal.deleteTitle"
                        )} ${deletingContact.name}?`
                        : blockingContact
                            ? `Bloquear Contato ${blockingContact.name}?`
                            : unBlockingContact
                                ? `Desbloquear Contato ${unBlockingContact.name}?`
                                : ImportContacts
                                    ? `${i18n.t("contacts.confirmationModal.importTitlte")}`
                                    : `${i18n.t("contactListItems.confirmationModal.importTitlte")}`
                }
                open={confirmOpen}
                onClose={setConfirmOpen}
                onConfirm={(e) =>
                    deletingContact
                        ? handleDeleteContact(deletingContact.id)
                        : blockingContact
                            ? handleBlockContact(blockingContact.id)
                            : unBlockingContact
                                ? handleUnBlockContact(unBlockingContact.id)
                                : ImportContacts
                                    ? handleimportContact()
                                    : handleImportExcel()
                }
            >
                {exportContact
                    ?
                    `${i18n.t("contacts.confirmationModal.exportContact")}`
                    : deletingContact
                        ? `${i18n.t("contacts.confirmationModal.deleteMessage")}`
                        : blockingContact
                            ? `${i18n.t("contacts.confirmationModal.blockContact")}`
                            : unBlockingContact
                                ? `${i18n.t("contacts.confirmationModal.unblockContact")}`
                                : ImportContacts
                                    ? `${i18n.t("contacts.confirmationModal.importMessage")}`
                                    : `${i18n.t(
                                        "contactListItems.confirmationModal.importMessage"
                                    )}`}
            </ConfirmationModal>
            <ConfirmationModal
                title={i18n.t("contacts.confirmationModal.importChat")}
                open={confirmChatsOpen}
                onClose={setConfirmChatsOpen}
                onConfirm={(e) => handleimportChats()}
            >
                {i18n.t("contacts.confirmationModal.wantImport")}
            </ConfirmationModal>
            <div className="contacts-header">
                <div className="contacts-header-content">
                    <h1 className="contacts-title">
                        {i18n.t("contacts.title")}
                        <span className="contacts-title-count">({contacts.length})</span>
                    </h1>
                    <div className="contacts-header-actions">
                        <TagsFilter
                            onFiltered={handleSelectedTags}
                        />
                        <div className="contacts-search-wrapper">
                            <FiSearch className="contacts-search-icon" />
                            <input
                                type="search"
                                className="contacts-search-input"
                                placeholder={i18n.t("contacts.searchPlaceholder")}
                                value={searchParam}
                                onChange={handleSearch}
                            />
                        </div>
                        <div className="contacts-dropdown" ref={dropdownRef}>
                            <button
                                className="contacts-dropdown-button"
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                                Importar / Exportar
                                <FiChevronDown />
                            </button>
                            {dropdownOpen && (
                                <div className="contacts-dropdown-menu">
                                    <button
                                        className="contacts-dropdown-item"
                                        onClick={() => {
                                            setConfirmOpen(true);
                                            setImportContacts(true);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        <FiPhone className="contacts-dropdown-item-icon" />
                                        {i18n.t("contacts.menu.importYourPhone")}
                                    </button>
                                    <button
                                        className="contacts-dropdown-item"
                                        onClick={() => {
                                            setImportContactModalOpen(true);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        <FiUpload className="contacts-dropdown-item-icon" />
                                        {i18n.t("contacts.menu.importToExcel")}
                                    </button>
                                </div>
                            )}
                        </div>
                        <button
                            className="contacts-button contacts-button-primary"
                            onClick={handleOpenContactModal}
                        >
                            <FiPlus />
                            {i18n.t("contacts.buttons.add")}
                        </button>
                    </div>
                </div>
            </div>

            {importContactModalOpen && (
                <ContactImportWpModal
                    isOpen={importContactModalOpen}
                    handleClose={() => setImportContactModalOpen(false)}
                    selectedTags={selectedTags}
                    hideNum={hideNum}
                    userProfile={user.profile}
                />
            )}
            <div className="contacts-list-wrapper" onScroll={handleScroll}>
                <input
                    style={{ display: "none" }}
                    id="upload"
                    name="file"
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={() => {
                        setConfirmOpen(true);
                    }}
                    ref={fileUploadRef}
                />
                {/* Desktop: Tabela */}
                <div className="contacts-table-container">
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>{i18n.t("contacts.table.name")}</th>
                                <th className="center">{i18n.t("contacts.table.whatsapp")}</th>
                                <th className="center">{i18n.t("contacts.table.email")}</th>
                                <th className="center">{i18n.t("contacts.table.whatsapp")}</th>
                                <th className="center">Status</th>
                                <th className="center">{i18n.t("contacts.table.actions")}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td>
                                        {contact?.urlPicture ? (
                                            <img
                                                src={contact.urlPicture}
                                                alt={contact.name}
                                                className="contacts-avatar"
                                            />
                                        ) : (
                                            <div className="contacts-avatar-placeholder">
                                                {contact.name?.charAt(0)?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                    </td>
                                    <td>{contact.name}</td>
                                    <td className="center">
                                        {((enableLGPD && hideNum && user.profile === "user")
                                            ? contact.isGroup
                                                ? contact.number :
                                                formatSerializedId(contact?.number) === null ? contact.number.slice(0, -6) + "**-**" + contact?.number.slice(-2) :
                                                    formatSerializedId(contact?.number)?.slice(0, -6) + "**-**" + contact?.number?.slice(-2) :
                                                    contact.isGroup ? contact.number : formatSerializedId(contact?.number)
                                        )}
                                    </td>
                                    <td className="center">{contact.email}</td>
                                    <td className="center">{contact?.whatsapp?.name}</td>
                                    <td className="center">
                                        <div className="contacts-status">
                                            {contact.active ? (
                                                <FiCheckCircle className="contacts-status-icon contacts-status-active" />
                                            ) : (
                                                <FiX className="contacts-status-icon contacts-status-inactive" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="center">
                                        <div className="contacts-actions">
                                            <button
                                                className="contacts-action-button"
                                                disabled={!contact.active}
                                                onClick={() => {
                                                    setContactTicket(contact);
                                                    setNewTicketModalOpen(true);
                                                }}
                                                title="Abrir conversa"
                                            >
                                                {getChannelIcon(contact.channel)}
                                            </button>
                                            <button
                                                className="contacts-action-button"
                                                onClick={() => hadleEditContact(contact.id)}
                                                title="Editar contato"
                                            >
                                                <FiEdit2 className="contacts-action-icon" />
                                            </button>
                                            <button
                                                className="contacts-action-button"
                                                onClick={
                                                    contact.active
                                                        ? () => {
                                                            setConfirmOpen(true);
                                                            setBlockingContact(contact);
                                                        }
                                                        : () => {
                                                            setConfirmOpen(true);
                                                            setUnBlockingContact(contact);
                                                        }
                                                }
                                                title={contact.active ? "Bloquear contato" : "Desbloquear contato"}
                                            >
                                                {contact.active ? (
                                                    <FiLock className="contacts-action-icon" />
                                                ) : (
                                                    <FiCheckCircle className="contacts-action-icon" />
                                                )}
                                            </button>
                                            <Can
                                                role={user.profile}
                                                perform="contacts-page:deleteContact"
                                                yes={() => (
                                                    <button
                                                        className="contacts-action-button"
                                                        onClick={(e) => {
                                                            setConfirmOpen(true);
                                                            setDeletingContact(contact);
                                                        }}
                                                        title="Excluir contato"
                                                    >
                                                        <FiTrash2 className="contacts-action-icon" />
                                                    </button>
                                                )}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {loading && <TableRowSkeleton avatar columns={6} />}
                        </tbody>
                    </table>
                </div>

                {/* Mobile: Cards estilo WhatsApp */}
                <div className="contacts-cards-container">
                    {contacts.map((contact) => (
                        <div key={contact.id} className="contacts-card">
                            <div className="contacts-card-content">
                                <div className="contacts-card-avatar-wrapper">
                                    {contact?.urlPicture ? (
                                        <img
                                            src={contact.urlPicture}
                                            alt={contact.name}
                                            className="contacts-card-avatar"
                                        />
                                    ) : (
                                        <div className="contacts-card-avatar-placeholder">
                                            {contact.name?.charAt(0)?.toUpperCase() || "?"}
                                        </div>
                                    )}
                                    <div className={`contacts-card-status-badge ${contact.active ? 'active' : 'inactive'}`}>
                                        {contact.active ? (
                                            <FiCheckCircle />
                                        ) : (
                                            <FiX />
                                        )}
                                    </div>
                                </div>
                                <div className="contacts-card-info">
                                    <div className="contacts-card-header">
                                        <h3 className="contacts-card-name">{contact.name}</h3>
                                        {getChannelIcon(contact.channel)}
                                    </div>
                                    <div className="contacts-card-details">
                                        <div className="contacts-card-detail-item">
                                            <FiPhone className="contacts-card-detail-icon" />
                                            <span className="contacts-card-detail-text">
                                                {((enableLGPD && hideNum && user.profile === "user")
                                                    ? contact.isGroup
                                                        ? contact.number :
                                                        formatSerializedId(contact?.number) === null ? contact.number.slice(0, -6) + "**-**" + contact?.number.slice(-2) :
                                                            formatSerializedId(contact?.number)?.slice(0, -6) + "**-**" + contact?.number?.slice(-2) :
                                                            contact.isGroup ? contact.number : formatSerializedId(contact?.number)
                                                )}
                                            </span>
                                        </div>
                                        {contact.email && (
                                            <div className="contacts-card-detail-item">
                                                <span className="contacts-card-detail-label">Email:</span>
                                                <span className="contacts-card-detail-text">{contact.email}</span>
                                            </div>
                                        )}
                                        {contact?.whatsapp?.name && (
                                            <div className="contacts-card-detail-item">
                                                <span className="contacts-card-detail-label">WhatsApp:</span>
                                                <span className="contacts-card-detail-text">{contact.whatsapp.name}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="contacts-card-actions-mobile">
                                <button
                                    className="contacts-card-action-btn"
                                    disabled={!contact.active}
                                    onClick={() => {
                                        setContactTicket(contact);
                                        setNewTicketModalOpen(true);
                                    }}
                                    title="Abrir conversa"
                                >
                                    {getChannelIcon(contact.channel)}
                                </button>
                                <button
                                    className="contacts-card-action-btn"
                                    onClick={() => hadleEditContact(contact.id)}
                                    title="Editar contato"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    className="contacts-card-action-btn"
                                    onClick={
                                        contact.active
                                            ? () => {
                                                setConfirmOpen(true);
                                                setBlockingContact(contact);
                                            }
                                            : () => {
                                                setConfirmOpen(true);
                                                setUnBlockingContact(contact);
                                            }
                                    }
                                    title={contact.active ? "Bloquear contato" : "Desbloquear contato"}
                                >
                                    {contact.active ? <FiLock /> : <FiCheckCircle />}
                                </button>
                                <Can
                                    role={user.profile}
                                    perform="contacts-page:deleteContact"
                                    yes={() => (
                                        <button
                                            className="contacts-card-action-btn contacts-card-action-btn-danger"
                                            onClick={(e) => {
                                                setConfirmOpen(true);
                                                setDeletingContact(contact);
                                            }}
                                            title="Excluir contato"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="contacts-loading-skeleton">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="contacts-skeleton-card">
                                    <div className="contacts-skeleton-avatar"></div>
                                    <div className="contacts-skeleton-content">
                                        <div className="contacts-skeleton-line"></div>
                                        <div className="contacts-skeleton-line short"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </MainContainer >
    );
};

export default Contacts;
