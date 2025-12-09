import React, { useEffect, useState } from "react";
import Input from "../UI/Input";
import Select from "../UI/Select";
import Tabs, { Tab } from "../UI/Tabs";
import { i18n } from "../../translate/i18n";
import useSettings from "../../hooks/useSettings";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import "./Options.css";

export default function Options(props) {
  const { oldSettings, settings, scheduleTypeChanged, user } = props;

  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [chatBotType, setChatBotType] = useState("text");

  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);

  const [userCreation, setUserCreation] = useState("disabled");
  const [loadingUserCreation, setLoadingUserCreation] = useState(false);

  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] = useState(false);

  const [UserRandom, setUserRandom] = useState("enabled");
  const [loadingUserRandom, setLoadingUserRandom] = useState(false);

  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("enabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] = useState(false);

  const [AcceptCallWhatsapp, setAcceptCallWhatsapp] = useState("enabled");
  const [loadingAcceptCallWhatsapp, setLoadingAcceptCallWhatsapp] = useState(false);

  const [sendSignMessage, setSendSignMessage] = useState("enabled");
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);

  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] = useState("enabled");
  const [loadingSendGreetingMessageOneQueues, setLoadingSendGreetingMessageOneQueues] = useState(false);

  const [sendQueuePosition, setSendQueuePosition] = useState("enabled");
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] = useState(false);

  const [sendFarewellWaitingTicket, setSendFarewellWaitingTicket] = useState("enabled");
  const [loadingSendFarewellWaitingTicket, setLoadingSendFarewellWaitingTicket] = useState(false);

  const [acceptAudioMessageContact, setAcceptAudioMessageContact] = useState("enabled");
  const [loadingAcceptAudioMessageContact, setLoadingAcceptAudioMessageContact] = useState(false);

  //LGPD
  const [enableLGPD, setEnableLGPD] = useState("disabled");
  const [loadingEnableLGPD, setLoadingEnableLGPD] = useState(false);

  const [lgpdMessage, setLGPDMessage] = useState("");
  const [loadinglgpdMessage, setLoadingLGPDMessage] = useState(false);

  const [lgpdLink, setLGPDLink] = useState("");
  const [loadingLGPDLink, setLoadingLGPDLink] = useState(false);

  const [lgpdDeleteMessage, setLGPDDeleteMessage] = useState("disabled");
  const [loadingLGPDDeleteMessage, setLoadingLGPDDeleteMessage] = useState(false);

  const [lgpdConsent, setLGPDConsent] = useState("disabled");
  const [loadingLGPDConsent, setLoadingLGPDConsent] = useState(false);

  const [lgpdHideNumber, setLGPDHideNumber] = useState("disabled");
  const [loadingLGPDHideNumber, setLoadingLGPDHideNumber] = useState(false);

  // Tag obrigatoria
  const [requiredTag, setRequiredTag] = useState("enabled");
  const [loadingRequiredTag, setLoadingRequiredTag] = useState(false);

  // Fechar ticket ao transferir para outro setor
  const [closeTicketOnTransfer, setCloseTicketOnTransfer] = useState(false);
  const [loadingCloseTicketOnTransfer, setLoadingCloseTicketOnTransfer] = useState(false);

  // Usar carteira de clientes
  const [directTicketsToWallets, setDirectTicketsToWallets] = useState(false);
  const [loadingDirectTicketsToWallets, setLoadingDirectTicketsToWallets] = useState(false);

  //MENSAGENS CUSTOMIZADAS
  const [transferMessage, setTransferMessage] = useState("Seu Atendimento foi Transferido para o setor ${queue.name},Aguarde atendimento por favor...");
  const [loadingTransferMessage, setLoadingTransferMessage] = useState(false);

  const [greetingAcceptedMessage, setGreetingAcceptedMessage] = useState("");
  const [loadingGreetingAcceptedMessage, setLoadingGreetingAcceptedMessage] = useState(false);

  const [AcceptCallWhatsappMessage, setAcceptCallWhatsappMessage] = useState("");
  const [loadingAcceptCallWhatsappMessage, setLoadingAcceptCallWhatsappMessage] = useState(false);

  const [sendQueuePositionMessage, setSendQueuePositionMessage] = useState("");
  const [loadingSendQueuePositionMessage, setLoadingSendQueuePositionMessage] = useState(false);

  const [showNotificationPending, setShowNotificationPending] = useState(false);
  const [loadingShowNotificationPending, setLoadingShowNotificationPending] = useState(false);

  const { update: updateUserCreation } = useSettings();
  const { update } = useCompanySettings();

  const isSuper = () => {
    return user.super;
  };

  useEffect(() => {
    if (Array.isArray(oldSettings) && oldSettings.length) {
      const userPar = oldSettings.find((s) => s.key === "userCreation");
      if (userPar) {
        setUserCreation(userPar.value);
      }
    }
  }, [oldSettings]);

  useEffect(() => {
    for (const [key, value] of Object.entries(settings)) {
      if (key === "userRating") setUserRating(value);
      if (key === "scheduleType") setScheduleType(value);
      if (key === "chatBotType") setChatBotType(value);
      if (key === "acceptCallWhatsapp") setAcceptCallWhatsapp(value);
      if (key === "userRandom") setUserRandom(value);
      if (key === "sendGreetingMessageOneQueues") setSendGreetingMessageOneQueues(value);
      if (key === "sendSignMessage") setSendSignMessage(value);
      if (key === "sendFarewellWaitingTicket") setSendFarewellWaitingTicket(value);
      if (key === "sendGreetingAccepted") setSendGreetingAccepted(value);
      if (key === "sendQueuePosition") setSendQueuePosition(value);
      if (key === "acceptAudioMessageContact") setAcceptAudioMessageContact(value);
      if (key === "enableLGPD") setEnableLGPD(value);
      if (key === "requiredTag") setRequiredTag(value);
      if (key === "lgpdDeleteMessage") setLGPDDeleteMessage(value);
      if (key === "lgpdHideNumber") setLGPDHideNumber(value);
      if (key === "lgpdConsent") setLGPDConsent(value);
      if (key === "lgpdMessage") setLGPDMessage(value);
      if (key === "sendMsgTransfTicket") setSettingsTransfTicket(value);
      if (key === "lgpdLink") setLGPDLink(value);
      if (key === "DirectTicketsToWallets") setDirectTicketsToWallets(value);
      if (key === "closeTicketOnTransfer") setCloseTicketOnTransfer(value);
      if (key === "transferMessage") setTransferMessage(value);
      if (key === "greetingAcceptedMessage") setGreetingAcceptedMessage(value);
      if (key === "AcceptCallWhatsappMessage") setAcceptCallWhatsappMessage(value);
      if (key === "sendQueuePositionMessage") setSendQueuePositionMessage(value);
      if (key === "showNotificationPending") setShowNotificationPending(value);
    }
  }, [settings]);

  // Handler functions (mantendo todas as funções originais)
  async function handleChangeUserCreation(value) {
    setUserCreation(value);
    setLoadingUserCreation(true);
    await updateUserCreation({ key: "userCreation", value });
    setLoadingUserCreation(false);
  }

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    await update({ column: "userRating", data: value });
    setLoadingUserRating(false);
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    await update({ column: "scheduleType", data: value });
    setLoadingScheduleType(false);
    if (typeof scheduleTypeChanged === "function") {
      scheduleTypeChanged(value);
    }
  }

  async function handleChatBotType(value) {
    setChatBotType(value);
    await update({ column: "chatBotType", data: value });
  }

  async function handleLGPDMessage(value) {
    setLGPDMessage(value);
    setLoadingLGPDMessage(true);
    await update({ column: "lgpdMessage", data: value });
    setLoadingLGPDMessage(false);
  }

  async function handletransferMessage(value) {
    setTransferMessage(value);
    setLoadingTransferMessage(true);
    await update({ column: "transferMessage", data: value });
    setLoadingTransferMessage(false);
  }

  async function handleGreetingAcceptedMessage(value) {
    setGreetingAcceptedMessage(value);
    setLoadingGreetingAcceptedMessage(true);
    await update({ column: "greetingAcceptedMessage", data: value });
    setLoadingGreetingAcceptedMessage(false);
  }

  async function handleAcceptCallWhatsappMessage(value) {
    setAcceptCallWhatsappMessage(value);
    setLoadingAcceptCallWhatsappMessage(true);
    await update({ column: "AcceptCallWhatsappMessage", data: value });
    setLoadingAcceptCallWhatsappMessage(false);
  }

  async function handlesendQueuePositionMessage(value) {
    setSendQueuePositionMessage(value);
    setLoadingSendQueuePositionMessage(true);
    await update({ column: "sendQueuePositionMessage", data: value });
    setLoadingSendQueuePositionMessage(false);
  }

  async function handleShowNotificationPending(value) {
    setShowNotificationPending(value);
    setLoadingShowNotificationPending(true);
    await update({ column: "showNotificationPending", data: value });
    setLoadingShowNotificationPending(false);
  }

  async function handleLGPDLink(value) {
    setLGPDLink(value);
    setLoadingLGPDLink(true);
    await update({ column: "lgpdLink", data: value });
    setLoadingLGPDLink(false);
  }

  async function handleLGPDDeleteMessage(value) {
    setLGPDDeleteMessage(value);
    setLoadingLGPDDeleteMessage(true);
    await update({ column: "lgpdDeleteMessage", data: value });
    setLoadingLGPDDeleteMessage(false);
  }

  async function handleLGPDConsent(value) {
    setLGPDConsent(value);
    setLoadingLGPDConsent(true);
    await update({ column: "lgpdConsent", data: value });
    setLoadingLGPDConsent(false);
  }

  async function handleLGPDHideNumber(value) {
    setLGPDHideNumber(value);
    setLoadingLGPDHideNumber(true);
    await update({ column: "lgpdHideNumber", data: value });
    setLoadingLGPDHideNumber(false);
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    await update({ column: "sendGreetingAccepted", data: value });
    setLoadingSendGreetingAccepted(false);
  }

  async function handleUserRandom(value) {
    setUserRandom(value);
    setLoadingUserRandom(true);
    await update({ column: "userRandom", data: value });
    setLoadingUserRandom(false);
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    await update({ column: "sendMsgTransfTicket", data: value });
    setLoadingSettingsTransfTicket(false);
  }

  async function handleAcceptCallWhatsapp(value) {
    setAcceptCallWhatsapp(value);
    setLoadingAcceptCallWhatsapp(true);
    await update({ column: "acceptCallWhatsapp", data: value });
    setLoadingAcceptCallWhatsapp(false);
  }

  async function handleSendSignMessage(value) {
    setSendSignMessage(value);
    setLoadingSendSignMessage(true);
    await update({ column: "sendSignMessage", data: value });
    localStorage.setItem("sendSignMessage", value === "enabled" ? true : false);
    setLoadingSendSignMessage(false);
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    await update({ column: "sendGreetingMessageOneQueues", data: value });
    setLoadingSendGreetingMessageOneQueues(false);
  }

  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value);
    setLoadingSendQueuePosition(true);
    await update({ column: "sendQueuePosition", data: value });
    setLoadingSendQueuePosition(false);
  }

  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value);
    setLoadingSendFarewellWaitingTicket(true);
    await update({ column: "sendFarewellWaitingTicket", data: value });
    setLoadingSendFarewellWaitingTicket(false);
  }

  async function handleAcceptAudioMessageContact(value) {
    setAcceptAudioMessageContact(value);
    setLoadingAcceptAudioMessageContact(true);
    await update({ column: "acceptAudioMessageContact", data: value });
    setLoadingAcceptAudioMessageContact(false);
  }

  async function handleEnableLGPD(value) {
    setEnableLGPD(value);
    setLoadingEnableLGPD(true);
    await update({ column: "enableLGPD", data: value });
    setLoadingEnableLGPD(false);
  }

  async function handleRequiredTag(value) {
    setRequiredTag(value);
    setLoadingRequiredTag(true);
    await update({ column: "requiredTag", data: value });
    setLoadingRequiredTag(false);
  }

  async function handleCloseTicketOnTransfer(value) {
    setCloseTicketOnTransfer(value);
    setLoadingCloseTicketOnTransfer(true);
    await update({ column: "closeTicketOnTransfer", data: value });
    setLoadingCloseTicketOnTransfer(false);
  }

  async function handleDirectTicketsToWallets(value) {
    setDirectTicketsToWallets(value);
    setLoadingDirectTicketsToWallets(true);
    await update({ column: "DirectTicketsToWallets", data: value });
    setLoadingDirectTicketsToWallets(false);
  }

  const enabledDisabledOptions = [
    { value: "disabled", label: i18n.t("settings.settings.options.disabled") },
    { value: "enabled", label: i18n.t("settings.settings.options.enabled") },
  ];

  const booleanOptions = [
    { value: false, label: i18n.t("settings.settings.options.disabled") },
    { value: true, label: i18n.t("settings.settings.options.enabled") },
  ];

  return (
    <div className="options-container">
      <div className="options-grid">
        {/* CRIAÇÃO DE COMPANY/USERS */}
        {isSuper() && (
          <div className="options-item">
            <Select
              label={i18n.t("settings.settings.options.creationCompanyUser")}
              value={userCreation}
              onChange={(e) => handleChangeUserCreation(e.target.value)}
              options={enabledDisabledOptions}
              helperText={loadingUserCreation ? i18n.t("settings.settings.options.updating") : ""}
            />
          </div>
        )}

        {/* AVALIAÇÕES */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.evaluations")}
            value={userRating}
            onChange={(e) => handleChangeUserRating(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingUserRating ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* AGENDAMENTO DE EXPEDIENTE */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.officeScheduling")}
            value={scheduleType}
            onChange={(e) => handleScheduleType(e.target.value)}
            options={[
              { value: "disabled", label: i18n.t("settings.settings.options.disabled") },
              { value: "queue", label: i18n.t("settings.settings.options.queueManagement") },
              { value: "company", label: i18n.t("settings.settings.options.companyManagement") },
              { value: "connection", label: i18n.t("settings.settings.options.connectionManagement") },
            ]}
            helperText={loadingScheduleType ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* ENVIAR SAUDAÇÃO AO ACEITAR O TICKET */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.sendGreetingAccepted")}
            value={SendGreetingAccepted}
            onChange={(e) => handleSendGreetingAccepted(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingSendGreetingAccepted ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* ESCOLHER OPERADOR ALEATORIO */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.userRandom")}
            value={UserRandom}
            onChange={(e) => handleUserRandom(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingUserRandom ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* ENVIAR MENSAGEM DE TRANSFERENCIA */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.sendMsgTransfTicket")}
            value={SettingsTransfTicket}
            onChange={(e) => handleSettingsTransfTicket(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingSettingsTransfTicket ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* TIPO DO BOT */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.chatBotType")}
            value={chatBotType}
            onChange={(e) => handleChatBotType(e.target.value)}
            options={[{ value: "text", label: "Texto" }]}
            helperText={loadingScheduleType ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* AVISO SOBRE LIGAÇÃO DO WHATSAPP */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.acceptCallWhatsapp")}
            value={AcceptCallWhatsapp}
            onChange={(e) => handleAcceptCallWhatsapp(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingAcceptCallWhatsapp ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* HABILITAR PARA O ATENDENTE RETIRAR O ASSINATURA */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.sendSignMessage")}
            value={sendSignMessage}
            onChange={(e) => handleSendSignMessage(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingSendSignMessage ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* ENVIAR SAUDAÇÃO QUANDO HOUVER SOMENTE 1 FILA */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.sendGreetingMessageOneQueues")}
            value={sendGreetingMessageOneQueues}
            onChange={(e) => handleSendGreetingMessageOneQueues(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingSendGreetingMessageOneQueues ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* ENVIAR MENSAGEM COM A POSIÇÃO DA FILA */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.sendQueuePosition")}
            value={sendQueuePosition}
            onChange={(e) => handleSendQueuePosition(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingSendQueuePosition ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        {/* ENVIAR MENSAGEM DE DESPEDIDA NO AGUARDANDO */}
        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.sendFarewellWaitingTicket")}
            value={sendFarewellWaitingTicket}
            onChange={(e) => handleSendFarewellWaitingTicket(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingSendFarewellWaitingTicket ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.acceptAudioMessageContact")}
            value={acceptAudioMessageContact}
            onChange={(e) => handleAcceptAudioMessageContact(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingAcceptAudioMessageContact ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.enableLGPD")}
            value={enableLGPD}
            onChange={(e) => handleEnableLGPD(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingEnableLGPD ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.requiredTag")}
            value={requiredTag}
            onChange={(e) => handleRequiredTag(e.target.value)}
            options={enabledDisabledOptions}
            helperText={loadingRequiredTag ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.closeTicketOnTransfer")}
            value={String(closeTicketOnTransfer)}
            onChange={(e) => {
              const val = e.target.value === "true";
              handleCloseTicketOnTransfer(val);
            }}
            options={booleanOptions.map(opt => ({ value: String(opt.value), label: opt.label }))}
            helperText={loadingCloseTicketOnTransfer ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Select
            label={i18n.t("settings.settings.options.showNotificationPending")}
            value={String(showNotificationPending)}
            onChange={(e) => {
              const val = e.target.value === "true";
              handleShowNotificationPending(val);
            }}
            options={booleanOptions.map(opt => ({ value: String(opt.value), label: opt.label }))}
            helperText={loadingShowNotificationPending ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>
      </div>

      {/*-----------------LGPD-----------------*/}
      {enableLGPD === "enabled" && (
        <div className="lgpd-section">
          <Tabs value={0} onChange={() => {}}>
            <Tab label={i18n.t("settings.settings.LGPD.title")} value={0} />
          </Tabs>
          <div className="options-grid">
            <div className="options-item options-item-full">
              <Input
                label={i18n.t("settings.settings.LGPD.welcome")}
                value={lgpdMessage}
                onChange={(e) => handleLGPDMessage(e.target.value)}
                multiline
                rows={3}
                helperText={loadinglgpdMessage ? i18n.t("settings.settings.options.updating") : ""}
              />
            </div>
            <div className="options-item options-item-full">
              <Input
                label={i18n.t("settings.settings.LGPD.linkLGPD")}
                value={lgpdLink}
                onChange={(e) => handleLGPDLink(e.target.value)}
                helperText={loadingLGPDLink ? i18n.t("settings.settings.options.updating") : ""}
              />
            </div>
            <div className="options-item">
              <Select
                label={i18n.t("settings.settings.LGPD.obfuscateMessageDelete")}
                value={lgpdDeleteMessage}
                onChange={(e) => handleLGPDDeleteMessage(e.target.value)}
                options={[
                  { value: "disabled", label: i18n.t("settings.settings.LGPD.disabled") },
                  { value: "enabled", label: i18n.t("settings.settings.LGPD.enabled") },
                ]}
                helperText={loadingLGPDDeleteMessage ? i18n.t("settings.settings.options.updating") : ""}
              />
            </div>
            <div className="options-item">
              <Select
                label={i18n.t("settings.settings.LGPD.alwaysConsent")}
                value={lgpdConsent}
                onChange={(e) => handleLGPDConsent(e.target.value)}
                options={[
                  { value: "disabled", label: i18n.t("settings.settings.LGPD.disabled") },
                  { value: "enabled", label: i18n.t("settings.settings.LGPD.enabled") },
                ]}
                helperText={loadingLGPDConsent ? i18n.t("settings.settings.options.updating") : ""}
              />
            </div>
            <div className="options-item">
              <Select
                label={i18n.t("settings.settings.LGPD.obfuscatePhoneUser")}
                value={lgpdHideNumber}
                onChange={(e) => handleLGPDHideNumber(e.target.value)}
                options={[
                  { value: "disabled", label: i18n.t("settings.settings.LGPD.disabled") },
                  { value: "enabled", label: i18n.t("settings.settings.LGPD.enabled") },
                ]}
                helperText={loadingLGPDHideNumber ? i18n.t("settings.settings.options.updating") : ""}
              />
            </div>
          </div>
        </div>
      )}

      {/* MENSAGENS CUSTOMIZADAS */}
      <div className="options-grid">
        <div className="options-item">
          <Input
            label={i18n.t("settings.settings.customMessages.transferMessage")}
            value={transferMessage}
            onChange={(e) => handletransferMessage(e.target.value)}
            multiline
            rows={3}
            required={SettingsTransfTicket === "enabled"}
            helperText={loadingTransferMessage ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Input
            label={i18n.t("settings.settings.customMessages.greetingAcceptedMessage")}
            value={greetingAcceptedMessage}
            onChange={(e) => handleGreetingAcceptedMessage(e.target.value)}
            multiline
            rows={3}
            required={SendGreetingAccepted === "enabled"}
            helperText={loadingGreetingAcceptedMessage ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Input
            label={i18n.t("settings.settings.customMessages.AcceptCallWhatsappMessage")}
            value={AcceptCallWhatsappMessage}
            onChange={(e) => handleAcceptCallWhatsappMessage(e.target.value)}
            multiline
            rows={3}
            required={AcceptCallWhatsapp === "disabled"}
            helperText={loadingAcceptCallWhatsappMessage ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>

        <div className="options-item">
          <Input
            label={i18n.t("settings.settings.customMessages.sendQueuePositionMessage")}
            value={sendQueuePositionMessage}
            onChange={(e) => handlesendQueuePositionMessage(e.target.value)}
            multiline
            rows={3}
            required={sendQueuePosition === "enabled"}
            helperText={loadingSendQueuePositionMessage ? i18n.t("settings.settings.options.updating") : ""}
          />
        </div>
      </div>
    </div>
  );
}
