import React, { useContext, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import ConfirmationModal from "../../components/ConfirmationModal";
import api from "../../services/api";
import '../Chat/whatsapp-chat.css';

export default function ChatList({
  chats,
  handleSelectChat,
  handleDeleteChat,
  handleEditChat,
  pageInfo,
  loading,
}) {
  const history = useHistory();
  const { user, socket } = useContext(AuthContext);
  const { datetimeToClient } = useDate();

  const [confirmationModal, setConfirmModalOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState({});

  const { id } = useParams();

  const goToMessages = async (chat) => {
    if (unreadMessages(chat) > 0) {
      try {
        await api.post(`/chats/${chat.id}/read`, { userId: user.id });
      } catch (err) {}
    }

    if (id !== chat.uuid) {
      history.push(`/chats/${chat.uuid}`);
      handleSelectChat(chat);
    }
  };

  const handleDelete = () => {
    handleDeleteChat(selectedChat);
  };

  const unreadMessages = (chat) => {
    const currentUser = chat.users.find((u) => u.userId === user.id);
    return currentUser.unreads;
  };

  const getPrimaryText = (chat) => {
    const mainText = chat.title;
    const unreads = unreadMessages(chat);
    return (
      <>
        {mainText}
        {unreads > 0 && (
          <Chip
            size="small"
            style={{ marginLeft: 5 }}
            label={unreads}
            color="secondary"
          />
        )}
      </>
    );
  };

  const getSecondaryText = (chat) => {
    return chat.lastMessage !== ""
      ? `${datetimeToClient(chat.updatedAt)}: ${chat.lastMessage}`
      : "";
  };

  return (
    <>
      <ConfirmationModal
        title={"Excluir Conversa"}
        open={confirmationModal}
        onClose={setConfirmModalOpen}
        onConfirm={handleDelete}
      >
        Esta ação não pode ser revertida, confirmar?
      </ConfirmationModal>
      <div>
        {Array.isArray(chats) &&
          chats.length > 0 &&
          chats.map((chat, key) => (
            <div
              key={key}
              className={`wa-chat-list-item ${chat.uuid === id ? 'active' : ''}`}
              onClick={() => goToMessages(chat)}
            >
              <div className="wa-chat-list-content">
                <div className="wa-chat-list-name">
                  {chat.title}
                  {unreadMessages(chat) > 0 && (
                    <span className="wa-chat-badge">{unreadMessages(chat)}</span>
                  )}
                </div>
                <div className="wa-chat-list-message">
                  {getSecondaryText(chat)}
                </div>
              </div>
              {chat.ownerId === user.id && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    className="wa-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToMessages(chat).then(() => {
                        handleEditChat(chat);
                      });
                    }}
                    title="Editar"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                    </svg>
                  </button>
                  <button
                    className="wa-icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedChat(chat);
                      setConfirmModalOpen(true);
                    }}
                    title="Excluir"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}
      </div>
    </>
  );
}
