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
  CircularProgress,
  Stack,
  Box,
  Checkbox,
  FormControlLabel,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Close as CloseIcon, CloudUpload as CloudUploadIcon, Mic as MicIcon } from "@mui/icons-material";
import Compressor from "compressorjs";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import "./FlowBuilderAddAudioModal.css";

const FlowBuilderAddAudioModal = ({ open, onSave, onUpdate, data, close }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(false);
  const [preview, setPreview] = useState();
  const [labels, setLabels] = useState({
    title: "Adicionar áudio ao fluxo",
    btn: "Adicionar"
  });
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar áudio",
        btn: "Salvar"
      });
      setPreview(process.env.REACT_APP_BACKEND_URL + '/public/' + data.data.url);
      setRecord(data.data.record);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar áudio ao fluxo",
        btn: "Adicionar"
      });
      setActiveModal(true);
    } else {
      setActiveModal(false);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
    setMedias([]);
    setPreview();
    setRecord(false);
  };

  const handleSaveContact = async () => {
    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { url: data.data.url, record: record }
      });
      return;
    } else if (open === "create") {
      if (medias.length === 0) {
        toast.error("Selecione um arquivo de áudio", {
          position: "bottom-right",
        });
        return;
      }

      setLoading(true);
      const formData = new FormData();
      formData.append("fromMe", true);

      medias.forEach(async (media) => {
        const file = media;
        if (!file) return;

        if (media?.type.split("/")[0] === "image") {
          new Compressor(file, {
            quality: 0.7,
            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              toast.error("Erro ao comprimir arquivo");
              console.log(err.message);
            }
          });
        } else {
          formData.append("medias", media);
          formData.append("body", media.name);
        }
      });

      setTimeout(async () => {
        try {
          const res = await api.post("/flowbuilder/audio", formData);
          handleClose();
          onSave({
            url: res.data.name,
            record: record
          });
          toast.success("Áudio adicionado com sucesso!", {
            position: "bottom-right",
            autoClose: 2000,
          });
          setLoading(false);
          setMedias([]);
          setPreview();
        } catch (error) {
          toastError(error);
          setLoading(false);
        }
      }, 1000);
    }
  };

  const handleChangeMedias = e => {
    if (!e.target.files) return;

    if(e.target.files[0].size > 5000000){
      toast.error("Arquivo é muito grande! 5MB máximo", {
        position: "bottom-right",
      });
      return;
    }

    const selectedMedias = Array.from(e.target.files);
    setPreview(URL.createObjectURL(e.target.files[0]));
    setMedias(selectedMedias);
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
          <MicIcon fontSize="small" />
          {labels.title}
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
          {preview && (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'grey.100',
                p: 2
              }}
            >
              <audio controls style={{ width: '100%', maxWidth: '500px' }}>
                <source src={preview} type="audio/mp3" />
                Seu navegador não suporta HTML5
              </audio>
            </Box>
          )}

          {preview && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={record}
                  onChange={(e) => setRecord(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2">
                  Enviar como áudio gravado na hora
                </Typography>
              }
            />
          )}

          {!loading && open !== "edit" && (
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth={isMobile}
              sx={{
                py: 1.5,
                fontSize: isMobile ? '0.875rem' : '1rem',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {medias.length > 0 ? 'Trocar áudio' : 'Enviar áudio'}
              <input
                type="file"
                accept="audio/ogg, audio/mp3, audio/mpeg, audio/wav"
                disabled={loading}
                hidden
                onChange={handleChangeMedias}
              />
            </Button>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={isMobile ? 32 : 40} />
            </Box>
          )}
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
        {!loading && (
          <>
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
              disabled={loading || (open === "create" && medias.length === 0)}
              color="primary"
              variant="contained"
              onClick={handleSaveContact}
              fullWidth={isMobile}
              sx={{
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              {labels.btn}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderAddAudioModal;
