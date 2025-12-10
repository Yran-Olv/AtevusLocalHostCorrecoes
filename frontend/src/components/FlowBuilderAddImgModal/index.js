import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Box,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { Close as CloseIcon, CloudUpload as CloudUploadIcon } from "@mui/icons-material";
import Compressor from "compressorjs";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import "./FlowBuilderAddImgModal.css";

const FlowBuilderAddImgModal = ({ open, onSave, onUpdate, data, close }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isMounted = useRef(true);

  const [activeModal, setActiveModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState();
  const [oldImage, setOldImage] = useState();
  const [labels, setLabels] = useState({
    title: "Adicionar imagem ao fluxo",
    btn: "Adicionar"
  });
  const [medias, setMedias] = useState([]);

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar imagem",
        btn: "Salvar"
      });
      setOldImage(data.data.url);
      setPreview(process.env.REACT_APP_BACKEND_URL + '/public/' + data.data.url);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar imagem ao fluxo",
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
        data: { url: "" }
      });
      return;
    } else if (open === "create") {
      setLoading(true);
      const formData = new FormData();
      formData.append("fromMe", true);

      medias.forEach(async (media, idx) => {
        const file = media;

        if (!file) {
          return;
        }

        if (media?.type.split("/")[0] == "image") {
          new Compressor(file, {
            quality: 0.7,
            async success(media) {
              formData.append("medias", media);
              formData.append("body", media.name);
            },
            error(err) {
              toast.error("Erro ao comprimir imagem");
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
          const res = await api.post("/flowbuilder/img", formData);
          handleClose();
          onSave({
            url: res.data.name
          });
          toast.success("Imagem adicionada com sucesso!", {
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
    if (!e.target.files) {
      return;
    }

    if(e.target.files[0].size > 2000000){
      toast.error("Arquivo é muito grande! 2MB máximo", {
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
        <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
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
              <img 
                src={preview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: isMobile ? '300px' : '400px',
                  objectFit: 'contain',
                  borderRadius: 8
                }} 
              />
            </Box>
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
              {medias.length > 0 ? 'Trocar imagem' : 'Enviar imagem'}
              <input
                type="file"
                accept="image/png, image/jpg, image/jpeg"
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
            {open !== "edit" && (
              <Button
                type="submit"
                disabled={loading || medias.length === 0}
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
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderAddImgModal;
