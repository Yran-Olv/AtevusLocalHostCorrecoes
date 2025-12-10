import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from "react-router-dom";
import api from "../../services/api";

import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";

import { AuthContext } from "../../context/Auth/AuthContext";

import { Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, useTheme } from "@material-ui/core";
import { isNil } from 'lodash';
import ShowTicketOpen from '../ShowTicketOpenModal';
import ContactModal from "../ContactModal";
import CloseIcon from "@material-ui/icons/Close";
import ChatIcon from "@material-ui/icons/Chat";
import GroupAddIcon from "@material-ui/icons/GroupAdd";

const VcardPreview = ({ contact, numbers, queueId, whatsappId, vcardRaw }) => {
    const theme = useTheme();
    const history = useHistory();
    const { user } = useContext(AuthContext);

    const companyId = user.companyId;

    const [openAlert, setOpenAlert] = useState(false);
    const [userTicketOpen, setUserTicketOpen] = useState("");
    const [queueTicketOpen, setQueueTicketOpen] = useState("");

    const [selectedContact, setContact] = useState({
        id: 0,
        name: contact || "",
        number: numbers || "",
        profilePicUrl: ""
    });
    const [notOnWhatsApp, setNotOnWhatsApp] = useState(false);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [phoneType, setPhoneType] = useState("TEL");
    const cleanNumber = (selectedContact.number || "").replace(/[^\d]/g, "").replace(/@.*/, "");
    const vcardName = contact;

    // useEffect(() => {
    //     const delayDebounceFn = setTimeout(() => {
    //         const fetchContacts = async () => {
    //             try {
    //                 const number = numbers.replace(/\D/g, "");
    //                 const { data } = await api.get(`/contacts/profile/${number}`);

    //                 let obj = {
    //                     id: data.contactId,
    //                     name: contact,
    //                     number: numbers,
    //                     profilePicUrl: data.profilePicUrl
    //                 }

    //                 setContact(obj)

    //             } catch (err) {
    //                 console.log(err)
    //                 toastError(err);
    //             }
    //         };
    //         fetchContacts();
    //     }, 500);
    //     return () => clearTimeout(delayDebounceFn);
    // }, [contact, numbers]);


    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    if (isNil(numbers) || !numbers || numbers === "") {
                        setContact(prev => ({
                            ...prev,
                            name: contact || prev.name
                        }));
                        return
                    }
                    
                    const number = numbers.replace(/\D/g, "");
                    
                    if (!number || number.length < 8) {
                        setContact(prev => ({
                            ...prev,
                            name: contact || prev.name,
                            number: numbers
                        }));
                        return;
                    }
                    
                    const getData = await api.get(`/contacts/profile/${number}`);

                    if (getData.data.contactId && getData.data.contactId !== 0) {
                        let obj = {
                            id: getData.data.contactId,
                            name: contact,
                            number: numbers,
                            profilePicUrl: getData.data.urlPicture
                        }

                        setContact(obj)
                  
                    } else {
                        let contactObj = {
                            name: contact,
                            number: number,
                            email: "",
                            companyId: companyId
                        }

                        const { data } = await api.post("/contacts", contactObj);
                        setContact(data)
                    }
            
                } catch (err) {
                    if (err?.response?.data?.error === "NUMBER_NOT_ON_WHATSAPP") {
                        setNotOnWhatsApp(true);
                        setContact(prev => ({
                            ...prev,
                            name: contact || prev.name,
                            number: numbers
                        }));
                    } else {
                        setContact(prev => ({
                            ...prev,
                            name: contact || prev.name,
                            number: numbers
                        }));
                    }
                }
            };
            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [companyId, contact, numbers]);

    useEffect(() => {
        if (!vcardRaw) return;
        try {

            const telMatch = vcardRaw.match(/TEL;([^:]+):/i);
            if (telMatch && telMatch[1]) {
                const parts = telMatch[1].split(";");
                const typePart = parts.find(p => p.toLowerCase().includes("type="));
                if (typePart) {
                    const value = typePart.split("=")[1];
                    if (value) setPhoneType(value.toUpperCase());
                } else if (parts[0]) {
                    setPhoneType(parts[0].toUpperCase());
                }
            }
        } catch (e) {
        }
    }, [vcardRaw]);

    const handleCloseAlert = () => {
        setOpenAlert(false);
        setOpenAlert(false);
        setUserTicketOpen("");
        setQueueTicketOpen("");
    };

    const handleNewChat = async () => {
        if (notOnWhatsApp) {
            setInviteModalOpen(true);
            return;
        }
        try {
            const { data: ticket } = await api.post("/tickets", {
                contactId: selectedContact.id,
                userId: user.id,
                status: "open",
                queueId,
                companyId: companyId,
                whatsappId
            });

            history.push(`/tickets/${ticket.uuid}`);
        } catch (err) {
            const ticket = JSON.parse(err.response.data.error);

            if (ticket.userId !== user?.id) {
                setOpenAlert(true);
                setUserTicketOpen(ticket.user.name);
                setQueueTicketOpen(ticket.queue.name);
            } else {
                setOpenAlert(false);
                setUserTicketOpen("");
                setQueueTicketOpen("");

                history.push(`/tickets/${ticket.uuid}`);
            }
        }
    }

    const handleInviteClose = () => setInviteModalOpen(false);
    const handleInfoClose = () => setInfoModalOpen(false);

    const handleSaveContact = (saved) => {
        if (saved) {
            setContact(prev => ({
                ...prev,
                id: saved.id || prev.id,
                name: saved.name || prev.name,
                number: saved.number || prev.number,
                profilePicUrl: saved.profilePicUrl || prev.profilePicUrl
            }));
        }
        setContactModalOpen(false);
    };

    const primaryActionLabel = notOnWhatsApp ? "Convidar para WhatsApp" : "Conversar";

    return (
        <>
            <div style={{
                minWidth: "240px",
                maxWidth: "19vw",
                width: "fit-content",
            }}>
                <ShowTicketOpen
                    isOpen={openAlert}
                    handleClose={handleCloseAlert}
                    user={userTicketOpen}
                    queue={queueTicketOpen}
                />
                <Grid container spacing={1}>
                    <Grid
                        item
                        xs={12}
                        style={{ display: "flex", alignItems: "center", cursor: "pointer", padding: "10px 15px" }}
                        onClick={() => setInfoModalOpen(true)}
                    >
                        <Avatar src={selectedContact?.urlPicture || "/nopicture.png"} style={{ width: 52, height: 52 }} />
                        <Typography
                            style={{ marginTop: "12px", marginLeft: "10px", fontSize: "1rem", fontWeight: 700, color: theme.palette.text.primary, opacity: 0.7 }}
                            color="primary"
                            variant="subtitle1"
                            gutterBottom
                        >
                            {selectedContact.name}
                        </Typography>
                    </Grid>
                    <Grid item xs={12} style={{ padding: "10px 10px 0px" }}>
                        <Divider />
                        <Button
                            fullWidth
                            color="primary"
                            onClick={handleNewChat}
                            disabled={!selectedContact.number}
                        >
                            {primaryActionLabel}
                        </Button>
                    </Grid>
                </Grid>
            </div>

            {/* Modal de convite para WhatsApp */}
            <Dialog open={inviteModalOpen} onClose={handleInviteClose}>
                <DialogTitle>Convidar para o WhatsApp</DialogTitle>
                <DialogContent dividers>
                    <Typography gutterBottom>
                        Este número não está ativo no WhatsApp. Você pode enviar um convite ou salvar o contato para tentar mais tarde.
                    </Typography>
                    <Typography color="textSecondary">
                        Número: {selectedContact.number}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setContactModalOpen(true)} color="primary">
                        Salvar contato
                    </Button>
                    <Button onClick={handleInviteClose} color="primary" variant="contained">
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de informações do contato (estilo WhatsApp) */}
            <Dialog
                open={infoModalOpen}
                onClose={handleInfoClose}
                maxWidth="xs"
                fullWidth
                PaperProps={{ style: { borderRadius: 18 } }}
            >
                <DialogTitle
                    disableTypography
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 5, paddingBottom: 5 }}
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <IconButton onClick={handleInfoClose} edge="start">
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="subtitle1" style={{ marginLeft: 8 }}>
                            Mostrar contato
                        </Typography>
                    </div>
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} alignItems="center" style={{ marginBottom: 16 }}>
                        <Grid item>
                            <Avatar src={selectedContact?.urlPicture || "/nopicture.png"} style={{ width: 52, height: 52 }} />
                        </Grid>
                        <Grid item xs>
                            <Typography style={{ fontSize: "1rem", fontWeight: 700, color: theme.palette.text.primary }}>{selectedContact.name}</Typography>
                        </Grid>
                    </Grid>

                    <Grid container alignItems="center" justifyContent="space-between" style={{ marginBottom: 4 }}>
                        <Grid item>
                            <Typography style={{ fontSize: "1.1rem" }}>{selectedContact.number}</Typography>
                            <Typography variant="body2" style={{ color: "#1FA855" }}>
                                {phoneType || "TEL"}
                            </Typography>
                        </Grid>
                        <Grid item>
                            {notOnWhatsApp ? (
                                <Button
                                    color="primary"
                                    startIcon={<GroupAddIcon />}
                                    onClick={() => setInviteModalOpen(true)}
                                >
                                    Convidar
                                </Button>
                            ) : (
                                <IconButton color="primary" onClick={handleNewChat} disabled={!selectedContact.number}>
                                    <ChatIcon />
                                </IconButton>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setContactModalOpen(true)} color="primary">
                        Salvar contato
                    </Button>
                    <Button onClick={handleNewChat} color="primary" variant="contained" disabled={!selectedContact.number}>
                        {notOnWhatsApp ? "Convidar" : "Conversar"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de edição/criação do contato */}
            <ContactModal
                open={contactModalOpen}
                onClose={() => setContactModalOpen(false)}
                contactId={selectedContact.id || undefined}
                initialValues={{
                    name: vcardName || selectedContact.name,
                    number: cleanNumber,
                    email: selectedContact.email || ""
                }}
                onSave={handleSaveContact}
            />
        </>
    );

};

export default VcardPreview;