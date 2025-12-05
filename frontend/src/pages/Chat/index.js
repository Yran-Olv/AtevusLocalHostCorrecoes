import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { has, isObject } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import { i18n } from "../../translate/i18n";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import './whatsapp-chat.css';

// Modal Component (simplificado sem Material-UI)
const ChatModal = ({ open, chat, type, handleClose, handleLoadNewChat, setChats }) => {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      if (type === "edit" && chat) {
        const userList = chat.users.map((u) => ({
          id: u.user.id,
          name: u.user.name,
        }));
        setUsers(userList);
        setTitle(chat.title);
      } else {
        setUsers([]);
        setTitle("");
      }
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      let data;
      if (type === "edit") {
        const response = await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
        data = response.data;
        setChats((prevChats) =>
          prevChats.map((c) => (c.id === chat.id ? data : c))
        );
      } else {
        const response = await api.post("/chats", {
          users,
          title,
        });
        data = response.data;
        setChats((prevChats) => [data, ...prevChats]);
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={handleClose}>
      <div style={{
        backgroundColor: 'var(--wa-panel-light)',
        borderRadius: '8px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 16px 0', color: 'var(--wa-text-primary)' }}>Nova Conversa</h2>
        <div style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid var(--wa-border)',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit'
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <UsersFilter
            onFiltered={(users) => setUsers(users)}
            initialUsers={users}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={handleClose}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'transparent',
              color: 'var(--wa-text-primary)'
            }}
          >
            {i18n.t("chatInternal.modal.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={users === undefined || users.length === 0 || title === null || title === "" || title === undefined}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              background: 'var(--wa-green)',
              color: 'white',
              opacity: (users === undefined || users.length === 0 || title === null || title === "" || title === undefined) ? 0.5 : 1
            }}
          >
            {i18n.t("chatInternal.modal.save")}
          </button>
        </div>
      </div>
    </div>
  );
};

function Chat() {
  const { user, socket } = useContext(AuthContext);
  const history = useHistory();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [records, setRecords] = useState([]);
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [originalChats, setOriginalChats] = useState([]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Detectar mudanças de tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);

          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            selectChat(chat);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      const data = await findChats();
      const { records } = data;

      // Adicione este console.log para inspecionar as propriedades dos chats
      console.log("Chats fetched:", records);

      // Salve os chats originais
      setOriginalChats(records);
      setChats(records); // Defina os chats para a lista original
      setRecords(records); // Armazena os records
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredChats = originalChats.filter(chat => {
        // Verifique se o título do chat inclui o termo de busca
        const titleMatch = chat.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Verifique se alguma mensagem do chat inclui o termo de busca
        const messagesMatch = chat.messages && chat.messages.some(message =>
          message.message.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Retorna verdadeiro se o título ou as mensagens corresponderem
        return titleMatch || messagesMatch;
      });
      setChats(filteredChats);
    } else {
      setChats(originalChats); // Restaura os chats originais se o termo de busca estiver vazio
    }
  }, [searchTerm, originalChats]);


  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  useEffect(() => {
    const companyId = user.companyId;

    const onChatUser = (data) => {
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        const changedChats = chats.map((chat) => {
          if (chat.id === data.record.id) {
            setCurrentChat(data.record);
            return {
              ...data.record,
            };
          }
          return chat;
        });
        setChats(changedChats);
      }
    };

    const onChat = (data) => {
      if (data.action === "delete") {
        const filteredChats = chats.filter((c) => c.id !== +data.id);
        setChats(filteredChats);
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    };

    const onCurrentChat = (data) => {
      if (data.action === "new-message") {
        setMessages((prev) => [...prev, data.newMessage]);
        const changedChats = chats.map((chat) => {
          if (chat.id === data.newMessage.chatId) {
            return {
              ...data.chat,
            };
          }
          return chat;
        });
        setChats(changedChats);
        scrollToBottomRef.current();
      }

      if (data.action === "update") {
        const changedChats = chats.map((chat) => {
          if (chat.id === data.chat.id) {
            return {
              ...data.chat,
            };
          }
          return chat;
        });
        setChats(changedChats);
        scrollToBottomRef.current();
      }
    };

    if (isSocketValid(socket) && companyId && user?.id) {
      safeSocketOn(socket, `company-${companyId}-chat-user-${user.id}`, onChatUser);
      safeSocketOn(socket, `company-${companyId}-chat`, onChat);
      if (isObject(currentChat) && has(currentChat, "id")) {
        safeSocketOn(socket, `company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
      }

      return () => {
        safeSocketOff(socket, `company-${companyId}-chat-user-${user.id}`, onChatUser);
        safeSocketOff(socket, `company-${companyId}-chat`, onChat);
        if (isObject(currentChat) && has(currentChat, "id")) {
          safeSocketOff(socket, `company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (error) {
      console.error("Erro selectChat:", error);
    }
  };

  const sendMessage = async (contentMessage) => {
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
    } catch (error) {
      console.error("Erro setLoading:", error);
    }
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (error) {
      console.error("Erro deletChat:", error);
    }
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/chats/${chatId}/messages?pageNumber=${messagesPage}`
      );
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (error) {
      console.error("Erro setLoading:", error);
    }
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) {
      await findMessages(currentChat.id);
    }
  };

  const findChats = async () => {
    try {
      const { data } = await api.get("/chats");
      return data;
    } catch (error) {
      console.error("Erro findChats:", error);
    }
  };

  const renderDesktop = () => {
    return (
      <div className="wa-chat-container">
        <div 
          className={`wa-chat-sidebar ${isMobile && isObject(currentChat) && has(currentChat, "id") ? 'hidden' : ''}`}
        >
          <div className="wa-chat-sidebar-header">
            <h2 className="wa-chat-sidebar-title">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
              Chats
            </h2>
            <div className="wa-chat-sidebar-actions">
              <button 
                className="wa-icon-btn"
                onClick={() => {
                  setDialogType("new");
                  setShowDialog(true);
                }}
                title="Nova Conversa"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            </div>
          </div>
          <div className="wa-chat-search">
            <input
              type="text"
              className="wa-chat-search-input"
              placeholder="Pesquisar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="wa-chat-list-container">
            {chats.length === 0 ? (
              <div className="wa-empty-state">
                <h3 className="wa-empty-state-title">Nada aqui!</h3>
                <p className="wa-empty-state-text">Nenhuma mensagem encontrada, abra uma nova caso deseje.</p>
              </div>
            ) : (
              <ChatList
                chats={chats}
                pageInfo={chatsPageInfo}
                loading={loading}
                handleSelectChat={(chat) => selectChat(chat)}
                handleDeleteChat={(chat) => deleteChat(chat)}
                handleEditChat={(chat) => {
                  setDialogType("edit");
                  setShowDialog(true);
                  setCurrentChat(chat);
                }}
              />
            )}
          </div>
        </div>
        <div className="wa-chat-messages-area">
          {isObject(currentChat) && has(currentChat, "id") ? (
            <>
              <ChatMessages
                chat={currentChat}
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
                records={records}
              />
              {messages.length === 0 && (
                <div className="wa-empty-state" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                  <p className="wa-empty-state-text">Esta conversa está vazia. Você pode começar a digitar!</p>
                </div>
              )}
            </>
          ) : (
            <div className="wa-empty-state">
              <p className="wa-empty-state-text">Selecione uma conversa para iniciar.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        setChats={setChats}
        handleLoadNewChat={(data) => {
          setMessages([]);
          setMessagesPage(1);
          setCurrentChat(data);
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
      />
      {renderDesktop()}
    </>
  );
}

export default Chat;
