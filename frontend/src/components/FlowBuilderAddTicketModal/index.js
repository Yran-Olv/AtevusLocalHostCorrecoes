import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Close as CloseIcon, ConfirmationNumber as TicketIcon } from "@mui/icons-material";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import "./FlowBuilderAddTicketModal.css";

const FlowBuilderTicketModal = ({
    open,
    onSave,
    data,
    onUpdate,
    close
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));
    const isMounted = useRef(true);
    const [activeModal, setActiveModal] = useState(false);
    const [queues, setQueues] = useState([]);
    const [selectedQueue, setQueueSelected] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open === 'edit') {
            (async () => {
                try {
                    setLoading(true);
                    const { data: old } = await api.get("/queue");
                    setQueues(old);
                    const queue = old.find((item) => item.id === data.data.id);
                    if (queue) {
                        setQueueSelected(queue.id);
                    }
                    setActiveModal(true);
                } catch (error) {
                    console.log(error);
                    toastError(error);
                } finally {
                    setLoading(false);
                }
            })();
        } else if (open === 'create') {
            (async () => {
                try {
                    setLoading(true);
                    const { data } = await api.get("/queue");
                    setQueues(data);
                    setActiveModal(true);
                } catch (error) {
                    console.log(error);
                    toastError(error);
                } finally {
                    setLoading(false);
                }
            })();
        } else {
            setActiveModal(false);
        }
        
        return () => {
            isMounted.current = false;
        };
    }, [open]);

    const handleClose = () => {
        close(null);
        setActiveModal(false);
        setQueueSelected(undefined);
    };

    const handleSaveContact = () => {
        if (!selectedQueue) {
            toast.error('Selecione uma fila', {
                position: "bottom-right",
            });
            return;
        }
        
        const queue = queues.find(item => item.id === selectedQueue);
        
        if (open === 'edit') {
            onUpdate({
                ...data,
                data: queue
            });
        } else if (open === 'create') {
            onSave({
                data: queue
            });
        }
        handleClose();
    };

    return (
        <Dialog
            open={activeModal}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : 2,
                    maxHeight: isMobile ? '100vh' : '90vh',
                    margin: isMobile ? 0 : 2,
                }
            }}
            className="flowbuilder-modal"
        >
            <DialogTitle 
                sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    pb: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <Typography variant="h6" component="div" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TicketIcon fontSize="small" />
                    {open === 'create' ? 'Adicionar ticket ao fluxo' : 'Editar ticket'}
                </Typography>
                <IconButton
                    onClick={handleClose}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            backgroundColor: 'action.hover',
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3, pb: 2 }}>
                <Stack spacing={3}>
                    <FormControl fullWidth>
                        <InputLabel id="queue-select-label">Selecione uma Fila</InputLabel>
                        <Select
                            labelId="queue-select-label"
                            id="queue-select"
                            value={selectedQueue || ""}
                            label="Selecione uma Fila"
                            onChange={(e) => setQueueSelected(e.target.value)}
                            disabled={loading}
                            sx={{
                                textTransform: 'none',
                            }}
                        >
                            {queues.length > 0 ? (
                                queues.map((queue) => (
                                    <MenuItem key={queue.id} value={queue.id}>
                                        {queue.name}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>Nenhuma fila disponível</MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Stack>
            </DialogContent>

            <DialogActions 
                sx={{ 
                    px: 3, 
                    pb: 2, 
                    pt: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    gap: 1
                }}
            >
                <Button
                    onClick={handleClose}
                    color="inherit"
                    variant="outlined"
                    fullWidth={isMobile}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                    }}
                >
                    {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !selectedQueue}
                    color="primary"
                    variant="contained"
                    onClick={handleSaveContact}
                    fullWidth={isMobile}
                    sx={{
                        textTransform: 'none',
                        fontWeight: 500,
                    }}
                >
                    {open === 'create' ? 'Adicionar' : 'Salvar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FlowBuilderTicketModal;
