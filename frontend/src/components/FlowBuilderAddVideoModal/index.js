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
  Alert,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Close as CloseIcon, CloudUpload as CloudUploadIcon, Videocam as VideocamIcon } from "@mui/icons-material";
import Compressor from "compressorjs";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import "./FlowBuilderAddVideoModal.css";

const FlowBuilderAddVideoModal = ({ open, onSave, onUpdate, data, close }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState();
  const [labels, setLabels] = useState({
    title: "Adicionar vídeo ao fluxo",
    btn: "Adicionar"
  });
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar vídeo",
        btn: "Salvar"
      });
      setPreview(process.env.REACT_APP_BACKEND_URL + '/public/' + data.data.url);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar vídeo ao fluxo",
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
  };

  const handleSaveContact = async () => {
    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { url: data.data.url }
      });
      return;
    } else if (open === "create") {
      if (medias.length === 0) {
        toast.error("Selecione um arquivo de vídeo", {
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
          const res = await api.post("/flowbuilder/video", formData);
          handleClose();
          onSave({
            url: res.data.name,
          });
          toast.success("Vídeo adicionado com sucesso!", {
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

    if(e.target.files[0].size > 20000000){
      toast.error("Arquivo é muito grande! 20MB máximo", {
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
      maxWidth="md"
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
          <VideocamIcon fontSize="small" />
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
                p: 1
              }}
            >
              <video 
                controls 
                style={{ 
                  width: '100%', 
                  maxWidth: '100%',
                  maxHeight: isMobile ? '300px' : '500px',
                  borderRadius: 8
                }}
              >
                <source src={preview} type="video/mp4" />
                Seu navegador não suporta HTML5
              </video>
            </Box>
          )}

          {!loading && open !== "edit" && !preview && (
            <Stack spacing={2}>
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
                Enviar vídeo
                <input
                  type="file"
                  accept="video/mp4"
                  disabled={loading}
                  hidden
                  onChange={handleChangeMedias}
                />
              </Button>
              <Alert severity="warning" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                ATENÇÃO! Apenas vídeos em MP4!
              </Alert>
            </Stack>
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

export default FlowBuilderAddVideoModal;
