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
import { Slider, Stack, useTheme, useMediaQuery, Box } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1
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

const FlowBuilderRandomizerModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [percent, setPercent] = useState(0);
  const [activeModal, setActiveModal] = useState(false);
  

  useEffect(() => {
    if (open === "edit") {
      setPercent(data.data.percent);
      setActiveModal(true);
    } else if (open === "create") {
      setPercent(0);
      setActiveModal(true);
    }
    return () => {
      isMounted.current = false;
    };
  }, [open]);

  const handleClose = () => {
    close(null);
    setActiveModal(false);
  };

  const handleValue = (event, newValue) => {
    setPercent(newValue)
  }

  const handleSaveContact = async values => {
    if (!percent || parseInt(percent) <= 0) {
      return toast.error("Adicione o valor de intervalo");
    }
    if (parseInt(percent) > 120) {
      return toast.error("Máximo de tempo atingido 120 segundos");
    }
    if (open === "edit") {
      onUpdate({
        ...data,
        data: { percent: percent }
      });
    } else if (open === "create") {
      onSave({
        percent: percent
      });
    }
    handleClose();
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
          {open === "create"
            ? `Adicionar um randomizador ao fluxo`
            : `Editar randomizador`}
        </DialogTitle>
        <Stack>
          <DialogContent dividers>
            <Stack 
              direction={isMobile ? "column" : "row"} 
              minHeight={isMobile ? 160 : 120} 
              alignItems={'center'} 
              spacing={isMobile ? 2 : 4}
              sx={{ px: isMobile ? 1 : 0 }}
            >
              <Typography 
                sx={{ 
                  fontSize: isMobile ? "1.5rem" : "2rem", 
                  fontWeight: 600,
                  color: "primary.main",
                  minWidth: isMobile ? "auto" : 60,
                  textAlign: "center"
                }}
              >
                {percent}%
              </Typography>
              <Slider
                aria-label="Percentual"
                value={percent}
                valueLabelDisplay="auto"
                onChange={handleValue}
                step={10}
                marks
                min={0}
                max={100}
                sx={{
                  flex: 1,
                  "& .MuiSlider-thumb": {
                    width: isMobile ? 20 : 24,
                    height: isMobile ? 20 : 24
                  }
                }}
              />
              <Typography 
                sx={{ 
                  fontSize: isMobile ? "1.5rem" : "2rem", 
                  fontWeight: 600,
                  color: "secondary.main",
                  minWidth: isMobile ? "auto" : 60,
                  textAlign: "center"
                }}
              >
                {100 - percent}%
              </Typography>
            </Stack>
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
              {open === "create" ? `Adicionar` : "Editar"}
            </Button>
          </DialogActions>
        </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderRandomizerModal;
