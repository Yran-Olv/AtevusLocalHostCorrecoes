import React, { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";
import '../Chat/whatsapp-chat.css';


export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  scrollToBottomRef,
  pageInfo,
  loading,
  records,
}) {
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef(null);
  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollTop = baseRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    console.log("Mensagens recebidas:", messages);
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    console.log("Records:", records);
  }, [records]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
      <div className="wa-messages-container" ref={baseRef}>
        {Array.isArray(messages) &&
          messages.map((item, key) => {
            const userRecord = Array.isArray(records)
              ? records.flatMap(record => record.users || []).find(user => user.user.id === item.senderId)
              : null;

            const companyId = userRecord ? userRecord.user.companyId : null;
            const baseUrl = process.env.REACT_APP_BACKEND_URL;
            let avatarSrc = userRecord && userRecord.user.profileImage
              ? `${baseUrl}/public/company${companyId}/user/${userRecord.user.profileImage}`
              : null;

            let avatarContent = avatarSrc ? null : userRecord ? userRecord.user.name.charAt(0) : '';

            if (item.senderId === user.id) {
              return (
                <div key={key} className="wa-message wa-message-sent">
                  <div className="wa-message-bubble">
                    <div className="wa-message-text">{item.message}</div>
                    <div className="wa-message-time">
                      {item.createdAt ? datetimeToClient(item.createdAt) : "Data inválida"}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={item.id} className="wa-message wa-message-received">
                  {avatarSrc ? (
                    <img src={avatarSrc} alt={userRecord ? userRecord.user.name : "Usuário"} className="wa-message-avatar" />
                  ) : (
                    <div className="wa-message-avatar" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--wa-green)',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      {avatarContent}
                    </div>
                  )}
                  <div className="wa-message-bubble">
                    <div className="wa-message-text">{item.message}</div>
                    <div className="wa-message-time">
                      {item.createdAt ? datetimeToClient(item.createdAt) : "Data inválida"}
                    </div>
                  </div>
                </div>
              );
            }
          })}
      </div>
      <div className="wa-input-container">
        <div className="wa-input-wrapper">
          <textarea
            className="wa-input-field"
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && !e.shiftKey && contentMessage.trim() !== "") {
                e.preventDefault();
                handleSendMessage(contentMessage)
                  .catch(err => {
                    console.error("Erro ao enviar mensagem:", err);
                  });
                setContentMessage("");
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            placeholder="Digite uma mensagem"
            rows={1}
          />
        </div>
        <button
          className="wa-send-button"
          onClick={() => {
            if (contentMessage.trim() !== "") {
              handleSendMessage(contentMessage)
                .catch(err => {
                  console.error("Erro ao enviar mensagem:", err);
                });
              setContentMessage("");
            }
          }}
          disabled={contentMessage.trim() === ""}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
