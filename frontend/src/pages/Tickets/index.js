import React from "react";
import { useParams } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { makeStyles } from "@material-ui/core/styles";

import TicketsManager from "../../components/TicketsManager";
import Ticket from "../../components/Ticket";

import './ticket.css';
import multivusNoticket from '../../assets/multivusMacbook.png';

import { i18n } from "../../translate/i18n";
import { ClassNames } from "@emotion/react";

const useStyles = makeStyles(theme => ({
	chatContainer: {
		flex: 1,
		padding: 0,
		height: `calc(100vh - 56px)`,
		overflowY: "hidden",
		width: "100%",
		boxSizing: "border-box",
		marginLeft: 0,
		transition: "margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
	},

	chatPapper: {
		// backgroundColor: "red",
		display: "flex",
		height: "100%",
	},

	contactsWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflowY: "hidden",
	},
	messagessWrapper: {
		display: "flex",
		height: "100%",
		flexDirection: "column",
	},
	welcomeMsg: {
		background: "#f0f2f5",
		display: "flex",
		justifyContent: "space-evenly",
		alignItems: "center",
		height: "100%",
		textAlign: "center",
	},
	logo: {
		logo: theme.logo,
		content: "url(" + ((theme.appLogoLight || theme.appLogoDark) ? getBackendUrl() + "/public/" + (theme.mode === "light" ? theme.appLogoLight || theme.appLogoDark : theme.appLogoDark || theme.appLogoLight) : (theme.mode === "light" ? logo : logoDark)) + ")"
	},
}));

const Chat = () => {
	const classes = useStyles();
	const { ticketId } = useParams();

	return (
		<div className={classes.chatContainer}>
			<div className={classes.chatPapper}>
				<Grid container spacing={0}>
					<Grid item xs={4} className={classes.contactsWrapper}>
						<TicketsManager />
					</Grid>
					<Grid item xs={8} className={classes.messagessWrapper}>
						{ticketId ? (
							<>
								<Ticket />
							</>
						) : (
							<Paper square variant="outlined" className={classes.welcomeMsg}>
								<span>
									<center>
										<img className={classes.logo} width="50%" alt="" />
									</center>
									{i18n.t("chat.noTicketMessage")}
								</span>
							</Paper>
						)}
					</Grid>
				</Grid>
			</div>
		</div>
	);
};

export default Chat;
