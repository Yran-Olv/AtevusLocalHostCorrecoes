import React, { useContext, useState, useEffect, useRef } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";
import { 
  FiX, 
  FiPaperclip, 
  FiTrash2, 
  FiSave, 
  FiXCircle,
  FiMessageSquare,
  FiLoader
} from "react-icons/fi";
import { i18n } from "../../translate/i18n";
import { head } from "lodash";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import MessageVariablesPicker from "../MessageVariablesPicker";
import ConfirmationModal from "../ConfirmationModal";
import path from "path-browserify";
import "./style.css";

const QuickeMessageSchema = Yup.object().shape({
  shortcode: Yup.string().required("Obrigatório"),
});

const QuickMessageDialog = ({ open, onClose, quickemessageId, reload }) => {
  const { user } = useContext(AuthContext);
  const messageInputRef = useRef();

  const initialState = {
    shortcode: "",
    message: "",
    geral: false,
    status: true,
  };

  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [quickemessage, setQuickemessage] = useState(initialState);
  const [attachment, setAttachment] = useState(null);
  const attachmentFile = useRef(null);

  useEffect(() => {
    try {
      (async () => {
        if (!quickemessageId) return;

        const { data } = await api.get(`/quick-messages/${quickemessageId}`);

        setQuickemessage((prevState) => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toastError(err);
    }
  }, [quickemessageId, open]);

  const handleClose = () => {
    setQuickemessage(initialState);
    setAttachment(null);
    onClose();
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveQuickeMessage = async (values) => {
    const quickemessageData = { 
      ...values, 
      isMedia: true, 
      mediaPath: attachment 
        ? String(attachment.name).replace(/ /g, "_") 
        : values.mediaPath 
          ? path.basename(values.mediaPath).replace(/ /g, "_") 
          : null 
    };

    try {
      if (quickemessageId) {
        await api.put(`/quick-messages/${quickemessageId}`, quickemessageData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "quickMessage");
          formData.append("file", attachment);
          await api.post(
            `/quick-messages/${quickemessageId}/media-upload`,
            formData
          );
        }
      } else {
        const { data } = await api.post("/quick-messages", quickemessageData);
        if (attachment != null) {
          const formData = new FormData();
          formData.append("typeArch", "quickMessage");
          formData.append("file", attachment);
          await api.post(`/quick-messages/${data.id}/media-upload`, formData);
        }
      }
      toast.success(i18n.t("quickMessages.toasts.success"));
      if (typeof reload == "function") {
        reload();
      }
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (quickemessage.mediaPath) {
      await api.delete(`/quick-messages/${quickemessage.id}/media-upload`);
      setQuickemessage((prev) => ({
        ...prev,
        mediaPath: null,
      }));
      toast.success(i18n.t("quickMessages.toasts.deleted"));
      if (typeof reload == "function") {
        reload();
      }
    }
  };

  const handleClickMsgVar = async (msgVar, setValueFunc) => {
    const el = messageInputRef.current;
    const firstHalfText = el.value.substring(0, el.selectionStart);
    const secondHalfText = el.value.substring(el.selectionEnd);
    const newCursorPos = el.selectionStart + msgVar.length;

    setValueFunc("message", `${firstHalfText}${msgVar}${secondHalfText}`);

    await new Promise(r => setTimeout(r, 100));
    messageInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
  };

  if (!open) return null;

  return (
    <div className="quick-message-dialog-overlay" onClick={handleClose}>
      <div className="quick-message-dialog-container" onClick={(e) => e.stopPropagation()}>
        <ConfirmationModal
          title={i18n.t("quickMessages.confirmationModal.deleteTitle")}
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={deleteMedia}
        >
          {i18n.t("quickMessages.confirmationModal.deleteMessage")}
        </ConfirmationModal>

        <div className="quick-message-dialog-header">
          <div className="quick-message-dialog-title-wrapper">
            <FiMessageSquare className="quick-message-dialog-title-icon" />
            <h2 className="quick-message-dialog-title">
              {quickemessageId
                ? `${i18n.t("quickMessages.dialog.edit")}`
                : `${i18n.t("quickMessages.dialog.add")}`}
            </h2>
          </div>
          <button className="quick-message-dialog-close" onClick={handleClose}>
            <FiX />
          </button>
        </div>

        <div style={{ display: "none" }}>
          <input
            type="file"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>

        <Formik
          initialValues={quickemessage}
          enableReinitialize={true}
          validationSchema={QuickeMessageSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveQuickeMessage(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, setFieldValue, values }) => (
            <Form>
              <div className="quick-message-dialog-content">
                <div className="quick-message-dialog-form">
                  <div className="quick-message-dialog-field">
                    <label className="quick-message-dialog-label">
                      {i18n.t("quickMessages.dialog.shortcode")}
                    </label>
                    <Field
                      name="shortcode"
                      disabled={quickemessageId && values.visao && !values.geral && values.userId !== user.id}
                    >
                      {({ field }) => (
                        <div className="quick-message-dialog-input-wrapper">
                          <input
                            {...field}
                            type="text"
                            className={`quick-message-dialog-input ${touched.shortcode && errors.shortcode ? 'error' : ''}`}
                            autoFocus
                            disabled={quickemessageId && values.visao && !values.geral && values.userId !== user.id}
                          />
                          {touched.shortcode && errors.shortcode && (
                            <span className="quick-message-dialog-error">
                              {errors.shortcode}
                            </span>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  <div className="quick-message-dialog-field">
                    <label className="quick-message-dialog-label">
                      {i18n.t("quickMessages.dialog.message")}
                    </label>
                    <Field
                      name="message"
                    >
                      {({ field }) => (
                        <div className="quick-message-dialog-input-wrapper">
                          <textarea
                            {...field}
                            ref={messageInputRef}
                            className={`quick-message-dialog-textarea ${touched.message && errors.message ? 'error' : ''}`}
                            rows={7}
                            disabled={quickemessageId && values.visao && !values.geral && values.userId !== user.id}
                          />
                          {touched.message && errors.message && (
                            <span className="quick-message-dialog-error">
                              {errors.message}
                            </span>
                          )}
                        </div>
                      )}
                    </Field>
                  </div>

                  <div className="quick-message-dialog-variables">
                    <MessageVariablesPicker
                      disabled={isSubmitting || (quickemessageId && values.visao && !values.geral && values.userId !== user.id)}
                      onClick={value => handleClickMsgVar(value, setFieldValue)}
                    />
                  </div>

                  <div className="quick-message-dialog-field">
                    <label className="quick-message-dialog-label">
                      {i18n.t("quickMessages.dialog.visao")}
                    </label>
                    <Field
                      name="visao"
                    >
                      {({ field }) => (
                        <div className="quick-message-dialog-input-wrapper">
                          <select
                            {...field}
                            className="quick-message-dialog-select"
                            disabled={quickemessageId && values.visao && !values.geral && values.userId !== user.id}
                            onChange={(e) => {
                              setFieldValue("visao", e.target.value === "true");
                            }}
                            value={values.visao ? "true" : "false"}
                          >
                            <option value="true">{i18n.t("announcements.active")}</option>
                            <option value="false">{i18n.t("announcements.inactive")}</option>
                          </select>
                        </div>
                      )}
                    </Field>
                  </div>

                  {values.visao === true && (
                    <div className="quick-message-dialog-field">
                      <label className="quick-message-dialog-label">
                        {i18n.t("quickMessages.dialog.geral")}
                      </label>
                      <Field
                        name="geral"
                      >
                        {({ field }) => (
                          <div className="quick-message-dialog-input-wrapper">
                            <select
                              {...field}
                              className="quick-message-dialog-select"
                              disabled={quickemessageId && values.visao && !values.geral && values.userId !== user.id}
                              value={values.geral ? "true" : "false"}
                            >
                              <option value="true">{i18n.t("announcements.active")}</option>
                              <option value="false">{i18n.t("announcements.inactive")}</option>
                            </select>
                          </div>
                        )}
                      </Field>
                    </div>
                  )}

                  {(quickemessage.mediaPath || attachment) && (
                    <div className="quick-message-dialog-attachment">
                      <div className="quick-message-dialog-attachment-info">
                        <FiPaperclip className="quick-message-dialog-attachment-icon" />
                        <span className="quick-message-dialog-attachment-name">
                          {attachment ? attachment.name : quickemessage.mediaName}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="quick-message-dialog-attachment-delete"
                        onClick={() => setConfirmationOpen(true)}
                        disabled={quickemessageId && values.visao && !values.geral && values.userId !== user.id}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="quick-message-dialog-footer">
                {!attachment && !quickemessage.mediaPath && (
                  <button
                    type="button"
                    className="quick-message-dialog-button quick-message-dialog-button-attach"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting || (quickemessageId && values.visao && !values.geral && values.userId !== user.id)}
                  >
                    <FiPaperclip className="quick-message-dialog-button-icon" />
                    {i18n.t("quickMessages.buttons.attach")}
                  </button>
                )}
                <button
                  type="button"
                  className="quick-message-dialog-button quick-message-dialog-button-cancel"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <FiXCircle className="quick-message-dialog-button-icon" />
                  {i18n.t("quickMessages.buttons.cancel")}
                </button>
                <button
                  type="submit"
                  className="quick-message-dialog-button quick-message-dialog-button-save"
                  disabled={isSubmitting || (quickemessageId && values.visao && !values.geral && values.userId !== user.id)}
                >
                  {isSubmitting ? (
                    <FiLoader className="quick-message-dialog-button-spinner" />
                  ) : (
                    <FiSave className="quick-message-dialog-button-icon" />
                  )}
                  {quickemessageId
                    ? `${i18n.t("quickMessages.buttons.edit")}`
                    : `${i18n.t("quickMessages.buttons.add")}`}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default QuickMessageDialog;
