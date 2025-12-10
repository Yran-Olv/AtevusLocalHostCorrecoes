import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Stack, useTheme, useMediaQuery, Box } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "scale(1.01)"
      },
      "&.Mui-focused": {
       	transform: "scale(1.01)",
        boxShadow: "0 0 0 3px rgba(0, 123, 255, 0.1)"
      }
    },
    [theme.breakpoints.down("sm")]: {
      width: "100%"
    }
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  btnWrapper: {
    position: "relative"
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: 16,
      [theme.breakpoints.down("sm")]: {
        margin: 16,
        maxWidth: "calc(100% - 32px)"
      }
    }
  },
  button: {
    borderRadius: 12,
    textTransform: "none",
    padding: theme.spacing(1, 3),
    fontWeight: 600,
    transition: "all 0.3s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
    },
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0.8, 2),
      fontSize: "0.875rem"
    }
  }
}));

const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite um nome!"),
  text: Yup.string()
    .min(2, "Muito curto!")
    .max(50, "Muito longo!")
    .required("Digite uma mensagem!")
});

const FlowBuilderAddTextModal = ({ open, onSave, onUpdate, data, close }) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeModal, setActiveModal] = useState(false);

  const [labels, setLabels] = useState({
    title: "Adicionar mensagem ao fluxo",
    btn: "Adicionar"
  });

  const [textDig, setTextDig] = useState();

  useEffect(() => {
    if (open === "edit") {
      setLabels({
        title: "Editar mensagem ao fluxo",
        btn: "Salvar"
      });
      setTextDig(data.data.label);
      setActiveModal(true);
    } else if (open === "create") {
      setLabels({
        title: "Adicionar mensagem ao fluxo",
        btn: "Adicionar"
      });
      setTextDig("");
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
    close(null)
    setActiveModal(false);
  };

  const handleSaveContact = async () => {
    if (open === "edit") {
      handleClose();
      onUpdate({
        ...data,
        data: { label: textDig }
      });
      return;
    } else if (open === "create") {
      handleClose();
      onSave({
        text: textDig
      });
    }
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={activeModal}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        scroll="paper"
        className={classes.dialog}
        PaperProps={{
          sx: {
            animation: "modalContent 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }
        }}
        BackdropProps={{
          sx: {
            animation: "modalBackdrop 0.2s ease-out"
          }
        }}
      >
        <DialogTitle 
          id="form-dialog-title"
          sx={{
            fontSize: isMobile ? "1.25rem" : "1.5rem",
            fontWeight: 600,
            pb: 2
          }}
        >
          {labels.title}
        </DialogTitle>
        <Stack>
          <DialogContent dividers>
            <TextField
              label={"Mensagem"}
              multiline
              rows={isMobile ? 5 : 7}
              name="text"
              variant="outlined"
              value={textDig}
              margin="dense"
              onChange={e => setTextDig(e.target.value)}
              className={classes.textField}
              sx={{ width: "100%" }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, gap: 1, flexDirection: isMobile ? "column" : "row" }}>
            <Button 
              onClick={handleClose} 
              color="secondary" 
              variant="outlined"
              className={classes.button}
              fullWidth={isMobile}
            >
              {i18n.t("contactModal.buttons.cancel")}
            </Button>
            <Button
              type="submit"
              color="primary"
              variant="contained"
              className={`${classes.btnWrapper} ${classes.button}`}
              onClick={() => handleSaveContact()}
              fullWidth={isMobile}
            >
              {`${labels.btn}`}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderAddTextModal;
