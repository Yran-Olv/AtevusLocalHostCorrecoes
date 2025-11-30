import React from "react";
import { FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { i18n } from "../../translate/i18n";
import "./style.css";

const ConfirmationModal = ({ title, children, open, onClose, onConfirm }) => {
	if (!open) return null;

	const handleConfirm = () => {
		onClose(false);
		onConfirm();
	};

	const handleCancel = () => {
		onClose(false);
	};

	return (
		<div className="confirmation-modal-overlay" onClick={handleCancel}>
			<div className="confirmation-modal-container" onClick={(e) => e.stopPropagation()}>
				<div className="confirmation-modal-header">
					<div className="confirmation-modal-title-wrapper">
						<FiAlertCircle className="confirmation-modal-icon" />
						<h2 className="confirmation-modal-title">{title}</h2>
					</div>
					<button className="confirmation-modal-close" onClick={handleCancel}>
						<FiX />
					</button>
				</div>
				
				<div className="confirmation-modal-content">
					<p className="confirmation-modal-message">{children}</p>
				</div>
				
				<div className="confirmation-modal-footer">
					<button
						className="confirmation-modal-button confirmation-modal-button-cancel"
						onClick={handleCancel}
					>
						{i18n.t("confirmationModal.buttons.cancel")}
					</button>
					<button
						className="confirmation-modal-button confirmation-modal-button-confirm"
						onClick={handleConfirm}
					>
						<FiCheckCircle className="confirmation-modal-button-icon" />
						{i18n.t("confirmationModal.buttons.confirm")}
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmationModal;
