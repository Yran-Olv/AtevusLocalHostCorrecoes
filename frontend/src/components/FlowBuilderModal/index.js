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
import { useTheme, useMediaQuery, Box } from "@mui/material";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		flexWrap: "wrap",
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
		alignItems: "center",
	},

	btnWrapper: {
		position: "relative",
	},

	buttonProgress: {
		color: green[500],
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
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
});

const FlowBuilderModal = ({ open, onClose, flowId, nameWebhook = "", initialValues, onSave }) => {
	const classes = useStyles();
	const isMounted = useRef(true);
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

	const [contact, setContact] = useState({
		name: nameWebhook,
	});

	useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

	const handleClose = () => {
		onClose();
		setContact({
			name: "",
		});
	};

	const handleSaveContact = async values => {
		if(flowId){
			try {
				await api.put("/flowbuilder", {
					name: values.name,
					flowId
				  });
				  onSave(values.name)
				  handleClose()
				toast.success(i18n.t("webhookModal.toasts.update"));
			} catch (err) {
				toastError(err);
			}
		} else {
		try {
			await api.post("/flowbuilder", {
				name: values.name,
			  });
			  onSave(values.name)
			  handleClose()
			toast.success(i18n.t("webhookModal.saveSuccess"));
		} catch (err) {
			toastError(err);
		}
	}
	};
	
	return (
		<div className={classes.root}>
			<Dialog 
				open={open} 
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
					{flowId
						? `Editar Fluxo`
						: `Adicionar Fluxo`}
				</DialogTitle>
				<Formik
					initialValues={contact}
					enableReinitialize={true}
					validationSchema={ContactSchema}
					onSubmit={(values, actions) => {
						setTimeout(() => {
							handleSaveContact(values);
							actions.setSubmitting(false);
						}, 400);
					}}
				>
					{({ values, errors, touched, isSubmitting }) => (
						<Form>
							<DialogContent dividers>
								<Field
									as={TextField}
									label={i18n.t("contactModal.form.name")}
									name="name"
									autoFocus
									defaultValue={contact.name}
									error={Boolean(errors.name)}
									helperText={errors.name}
									variant="outlined"
									margin="dense"
									className={classes.textField}
									style={{width: '95%'}}
								/>
							
							</DialogContent>
							<DialogActions sx={{ p: 3, pt: 2, gap: 1, flexDirection: isMobile ? "column" : "row" }}>
								<Button
									onClick={handleClose}
									color="secondary"
									disabled={isSubmitting}
									variant="outlined"
									className={classes.button}
									fullWidth={isMobile}
								>
									{i18n.t("contactModal.buttons.cancel")}
								</Button>
								<Button
									type="submit"
									color="primary"
									disabled={isSubmitting}
									variant="contained"
									className={`${classes.btnWrapper} ${classes.button}`}
									fullWidth={isMobile}
								>
									{flowId
										? `${i18n.t("contactModal.buttons.okEdit")}`
										: `${i18n.t("contactModal.buttons.okAdd")}`}
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
								</Button>
							</DialogActions>
						</Form>
					)}
				</Formik>
			</Dialog>
		</div>
	);
};

export default FlowBuilderModal;
