import React, { useState, useEffect, useReducer, useContext } from "react";

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

import { makeStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import NewTicketModal from "../../components/NewTicketModal";
import { SocketContext } from "../../context/Socket/SocketContext";
import WebhookModal from "../../components/WebhookModal";
import {
  AddCircle,
  Build,
  ContentCopy,
  DevicesFold,
  MoreVert,
  WebhookOutlined,
  CheckCircle,
  Cancel
} from "@mui/icons-material";

import {
  Button,
  CircularProgress,
  Grid,
  Menu,
  MenuItem,
  Stack,
  Box,
  Chip,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActionArea
} from "@mui/material";

import FlowBuilderModal from "../../components/FlowBuilderModal";

import {
  colorBackgroundTable,
  colorLineTable,
  colorLineTableHover,
  colorPrimary,
  colorTitleTable,
  colorTopTable
} from "../../styles/styles";

import "./FlowBuilder.css";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach(contact => {
      const contactIndex = state.findIndex(c => c.id === contact.id);
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
    const contactIndex = state.findIndex(c => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state];
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex(c => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    backgroundColor: colorBackgroundTable(),
    borderRadius: 12,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1)
    }
  },
  flowCard: {
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    borderRadius: 16,
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)",
      borderColor: colorPrimary()
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5)
    }
  },
  searchField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "scale(1.02)"
      },
      "&.Mui-focused": {
        transform: "scale(1.02)",
        boxShadow: `0 0 0 3px ${colorPrimary()}20`
      }
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      marginBottom: theme.spacing(1)
    }
  },
  addButton: {
    borderRadius: 12,
    textTransform: "none",
    padding: theme.spacing(1.5, 3),
    fontWeight: 600,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: `0 8px 16px ${colorPrimary()}40`
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%",
      padding: theme.spacing(1.2, 2)
    }
  }
}));

const FlowBuilder = () => {
  const classes = useStyles();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam, setSearchParam] = useState("");
  const [contacts, dispatch] = useReducer(reducer, []);
  const [webhooks, setWebhooks] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [selectedWebhookName, setSelectedWebhookName] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [contactTicket, setContactTicket] = useState({});
  const [deletingContact, setDeletingContact] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmDuplicateOpen, setConfirmDuplicateOpen] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [reloadData, setReloadData] = useState(false);
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("/flowbuilder");
          setWebhooks(data.flows);
          dispatch({ type: "LOAD_CONTACTS", payload: data.flows });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber, reloadData]);

  useEffect(() => {
    if (isSocketValid(socket) && user.companyId) {
      const companyId = user.companyId;

      const onContact = (data) => {
        if (data.action === "update" || data.action === "create") {
          dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
        }

        if (data.action === "delete") {
          dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
        }
      }
      
      safeSocketOn(socket, `company-${companyId}-contact`, onContact);

      return () => {
        safeSocketOff(socket, `company-${companyId}-contact`, onContact);
      };
    }
  }, [socket, user.companyId]);

  const handleSearch = event => {
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

  const handleCloseOrOpenTicket = ticket => {
    setNewTicketModalOpen(false);
    if (ticket !== undefined && ticket.uuid !== undefined) {
      history.push(`/tickets/${ticket.uuid}`);
    }
  };

  const hadleEditContact = () => {
    setSelectedContactId(deletingContact.id);
    setSelectedWebhookName(deletingContact.name);
    setContactModalOpen(true);
  };

  const handleDeleteWebhook = async webhookId => {
    try {
      await api.delete(`/flowbuilder/${webhookId}`).then(res => {
        setDeletingContact(null);
        setReloadData(old => !old);
      });
      toast.success("Fluxo excluído com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const handleDuplicateFlow = async flowId => {
    try {
      await api.post(`/flowbuilder/duplicate`, { flowId: flowId }).then(res => {
        setDeletingContact(null);
        setReloadData(old => !old);
      });
      toast.success("Fluxo duplicado com sucesso");
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber(prevState => prevState + 1);
  };

  const handleScroll = e => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportLink = () => {
    history.push(`/flowbuilder/${deletingContact.id}`)
  }

  return (
    <MainContainer className={classes.mainContainer}>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        initialContact={contactTicket}
        onClose={ticket => {
          handleCloseOrOpenTicket(ticket);
        }}
      />
      <FlowBuilderModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        flowId={selectedContactId}
        nameWebhook={selectedWebhookName}
        onSave={() => setReloadData(old => !old)}
      ></FlowBuilderModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `${i18n.t("contacts.confirmationModal.deleteTitle")} ${
                deletingContact.name
              }?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmOpen}
        onClose={setConfirmOpen}
        onConfirm={e =>
          deletingContact ? handleDeleteWebhook(deletingContact.id) : () => {}
        }
      >
        {deletingContact
          ? `Tem certeza que deseja deletar este fluxo? Todas as integrações relacionados serão perdidos.`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <ConfirmationModal
        title={
          deletingContact
            ? `Deseja duplicar o fluxo ${deletingContact.name}?`
            : `${i18n.t("contacts.confirmationModal.importTitlte")}`
        }
        open={confirmDuplicateOpen}
        onClose={setConfirmDuplicateOpen}
        onConfirm={e =>
          deletingContact ? handleDuplicateFlow(deletingContact.id) : () => {}
        }
      >
        {deletingContact
          ? `Tem certeza que deseja duplicar este fluxo?`
          : `${i18n.t("contacts.confirmationModal.importMessage")}`}
      </ConfirmationModal>
      <MainHeader>
        <Title>Fluxos de conversa</Title>
        <MainHeaderButtonsWrapper>
          <Stack 
            direction={isMobile ? "column" : "row"} 
            spacing={2} 
            width={isMobile ? "100%" : "auto"}
            sx={{ width: isMobile ? "100%" : "auto" }}
          >
            <TextField
              placeholder={i18n.t("contacts.searchPlaceholder")}
              type="search"
              value={searchParam}
              onChange={handleSearch}
              className={classes.searchField}
              size={isMobile ? "small" : "medium"}
              InputProps={{
                style: {
                  color: colorTitleTable()
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon style={{ color: "gray" }} />
                  </InputAdornment>
                )
              }}
            />
            <Button
              variant="contained"
              onClick={handleOpenContactModal}
              className={classes.addButton}
              startIcon={<AddCircle />}
              style={{ backgroundColor: colorPrimary() }}
            >
              {isMobile ? "Adicionar" : "Adicionar Fluxo"}
            </Button>
          </Stack>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={`${classes.mainPaper} flow-scrollbar`}
        variant="outlined"
        onScroll={handleScroll}
      >
        {!isMobile && (
          <Grid container sx={{ padding: 2, mb: 2, display: { xs: "none", sm: "flex" } }}>
            <Grid item xs={12} sm={5} sx={{ color: colorTopTable(), fontWeight: 600 }}>
              {i18n.t("contacts.table.name")}
            </Grid>
            <Grid item xs={12} sm={4} sx={{ color: colorTopTable(), fontWeight: 600 }} align="center">
              Status
            </Grid>
            <Grid item xs={12} sm={3} align="end" sx={{ color: colorTopTable(), fontWeight: 600 }}>
              {i18n.t("contacts.table.actions")}
            </Grid>
          </Grid>
        )}
        <Stack spacing={isMobile ? 1.5 : 2}>
          {webhooks.map((contact, index) => (
            <Card
              key={contact.id}
              className={`${classes.flowCard} flow-animate-fadeIn`}
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => history.push(`/flowbuilder/${contact.id}`)}
              sx={{
                "&:hover": {
                  "& .flow-card-actions": {
                    opacity: 1
                  }
                }
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${colorPrimary()}20 0%, ${colorPrimary()}10 100%)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}
                      >
                        <DevicesFold sx={{ color: colorPrimary(), fontSize: 24 }} />
                      </Box>
                      <Stack>
                        <Box
                          sx={{
                            fontWeight: 600,
                            fontSize: isMobile ? "0.95rem" : "1rem",
                            color: colorTitleTable()
                          }}
                        >
                          {contact.name}
                        </Box>
                        {isMobile && (
                          <Chip
                            icon={contact.active ? <CheckCircle /> : <Cancel />}
                            label={contact.active ? "Ativo" : "Desativado"}
                            size="small"
                            color={contact.active ? "success" : "default"}
                            sx={{
                              mt: 0.5,
                              fontSize: "0.7rem",
                              height: 20
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  </Grid>
                  {!isMobile && (
                    <Grid item xs={12} sm={4} align="center">
                      <Chip
                        icon={contact.active ? <CheckCircle /> : <Cancel />}
                        label={contact.active ? "Ativo" : "Desativado"}
                        color={contact.active ? "success" : "default"}
                        sx={{
                          fontWeight: 500
                        }}
                      />
                    </Grid>
                  )}
                  <Grid 
                    item 
                    xs={12} 
                    sm={3} 
                    align={isMobile ? "start" : "end"}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      id={`menu-button-${contact.id}`}
                      aria-controls={open && deletingContact?.id === contact.id ? "basic-menu" : undefined}
                      aria-haspopup="true"
                      aria-expanded={open && deletingContact?.id === contact.id ? "true" : undefined}
                      onClick={(e) => {
                        handleClick(e);
                        setDeletingContact(contact);
                      }}
                      sx={{
                        borderRadius: "50%",
                        minWidth: 40,
                        width: 40,
                        height: 40,
                        p: 0,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.05)",
                          transform: "rotate(90deg)"
                        }
                      }}
                    >
                      <MoreVert sx={{ color: colorTitleTable() }} />
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              PaperProps={{
                sx: {
                  borderRadius: 3,
                  mt: 1,
                  minWidth: 180,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  "& .MuiMenuItem-root": {
                    px: 2,
                    py: 1.5,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(0,0,0,0.05)",
                      transform: "translateX(4px)"
                    }
                  }
                }
              }}
              MenuListProps={{
                "aria-labelledby": "basic-button"
              }}
            >
              <MenuItem 
                onClick={() => {
                  handleClose();
                  hadleEditContact();
                }}
              >
                <EditIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Editar nome
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleClose();
                  exportLink();
                }}
              >
                <Build sx={{ mr: 1.5, fontSize: 20 }} />
                Editar fluxo
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleClose();
                  setConfirmDuplicateOpen(true);
                }}
              >
                <ContentCopy sx={{ mr: 1.5, fontSize: 20 }} />
                Duplicar
              </MenuItem>
              <MenuItem 
                onClick={() => {
                  handleClose();
                  setConfirmOpen(true);
                }}
                sx={{ color: "error.main" }}
              >
                <DeleteOutlineIcon sx={{ mr: 1.5, fontSize: 20 }} />
                Excluir
              </MenuItem>
            </Menu>
          {loading && (
            <Stack
              justifyContent={"center"}
              alignItems={"center"}
              minHeight={"50vh"}
            >
              <CircularProgress size={isMobile ? 40 : 50} />
            </Stack>
          )}
          {!loading && webhooks.length === 0 && (
            <Stack
              justifyContent={"center"}
              alignItems={"center"}
              minHeight={"40vh"}
              spacing={2}
            >
              <DevicesFold sx={{ fontSize: 64, color: "text.secondary", opacity: 0.5 }} />
              <Box sx={{ color: "text.secondary", textAlign: "center" }}>
                <Box sx={{ fontWeight: 600, mb: 1 }}>Nenhum fluxo encontrado</Box>
                <Box sx={{ fontSize: "0.9rem" }}>
                  {searchParam ? "Tente buscar com outros termos" : "Crie seu primeiro fluxo de conversa"}
                </Box>
              </Box>
            </Stack>
          )}
        </Stack>
      </Paper>
    </MainContainer>
  );
};

export default FlowBuilder;
