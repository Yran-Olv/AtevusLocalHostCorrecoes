import React, {
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { isArray } from "lodash";
import { useDate } from "../../hooks/useDate";
import { AuthContext } from "../../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";
import notifySound from "../../assets/sound.mp3";
import useSound from "use-sound";
import { i18n } from "../../translate/i18n";
import '../Chat/whatsapp-chat.css';

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

export default function ChatPopover() {
  const { user, socket } = useContext(AuthContext);


  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [invisible, setInvisible] = useState(true);
  const { datetimeToClient } = useDate();
  const [play] = useSound(notifySound);
  const soundAlertRef = useRef();

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.companyId && isSocketValid(socket)) {

      const companyId = user.companyId;
//    const socket = socketManager.GetSocket();

      const onCompanyChatPopover = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
          if (data.newMessage.senderId !== user.id) {

            soundAlertRef.current();
          }
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      }

      safeSocketOn(socket, `company-${companyId}-chat`, onCompanyChatPopover);

      return () => {
        safeSocketOff(socket, `company-${companyId}-chat`, onCompanyChatPopover);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, socket]);


  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
      toastError(err);
    }
  };

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setInvisible(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const goToMessages = (chat) => {
    window.location.href = `/chats/${chat.uuid}`;
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  return (
    <div>
      <button
        className="wa-icon-btn"
        onClick={handleClick}
        style={{ 
          color: "white",
          position: 'relative'
        }}
        aria-describedby={id}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
        </svg>
        {!invisible && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--wa-green)',
            border: '2px solid white'
          }} />
        )}
      </button>
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            pointerEvents: 'none'
          }}
          onClick={handleClose}
        >
          <div
            style={{
              position: 'absolute',
              bottom: '60px',
              right: '20px',
              minWidth: '300px',
              maxWidth: '500px',
              maxHeight: '300px',
              backgroundColor: 'var(--wa-panel-light)',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: 'auto'
            }}
            onScroll={handleScroll}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              padding: '12px',
              borderBottom: '1px solid var(--wa-border)',
              fontWeight: '500',
              color: 'var(--wa-text-primary)'
            }}>
              Chats
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              maxHeight: '250px'
            }}>
              {isArray(chats) && chats.length > 0 ? (
                chats.map((item, key) => (
                  <div
                    key={key}
                    className="wa-chat-list-item"
                    onClick={() => {
                      goToMessages(item);
                      handleClose();
                    }}
                    style={{
                      background: key % 2 === 0 ? 'var(--wa-hover)' : 'transparent'
                    }}
                  >
                    <div className="wa-chat-list-content">
                      <div className="wa-chat-list-message">{item.lastMessage}</div>
                      <div className="wa-chat-list-time" style={{ fontSize: '12px' }}>
                        {datetimeToClient(item.updatedAt)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--wa-text-secondary)' }}>
                  {i18n.t("mainDrawer.appBar.notRegister")}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
