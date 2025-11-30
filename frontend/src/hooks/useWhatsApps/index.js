import { useState, useEffect, useReducer, useContext } from "react";
import toastError from "../../errors/toastError";

import api from "../../services/api";
// import { SocketContext } from "../../context/Socket/SocketContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import { isNill } from "lodash";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../../utils/socketHelper";

const reducer = (state, action) => {
  if (action.type === "LOAD_WHATSAPPS") {
    const whatsApps = action.payload;

    return [...whatsApps];
  }

  if (action.type === "UPDATE_WHATSAPPS") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex] = whatsApp;
      return [...state];
    } else {
      return [whatsApp, ...state];
    }
  }

  if (action.type === "UPDATE_SESSION") {
    const whatsApp = action.payload;
    const whatsAppIndex = state.findIndex((s) => s.id === whatsApp.id);

    if (whatsAppIndex !== -1) {
      state[whatsAppIndex].status = whatsApp.status;
      state[whatsAppIndex].updatedAt = whatsApp.updatedAt;
      state[whatsAppIndex].qrcode = whatsApp.qrcode;
      state[whatsAppIndex].retries = whatsApp.retries;
      return [...state];
    } else {
      return [...state];
    }
  }

  if (action.type === "DELETE_WHATSAPPS") {
    const whatsAppId = action.payload;

    const whatsAppIndex = state.findIndex((s) => s.id === whatsAppId);
    if (whatsAppIndex !== -1) {
      state.splice(whatsAppIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useWhatsApps = () => {
  const [whatsApps, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(true);
//   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);



  useEffect(() => {
    setLoading(true);
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/whatsapp/?session=0");
        dispatch({ type: "LOAD_WHATSAPPS", payload: data });
        setLoading(false);
      } catch (_) {
        setLoading(false);
        // toastError(err);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (user.companyId && isSocketValid(socket)) {

      const companyId = user.companyId;
//    const socket = socketManager.GetSocket();

      const onCompanyWhatsapp = (data) => {
        if (data.action === "update") {
          dispatch({ type: "UPDATE_WHATSAPPS", payload: data.whatsapp });
        }
        if (data.action === "delete") {
          dispatch({ type: "DELETE_WHATSAPPS", payload: data.whatsappId });
        }
      }

      const onCompanyWhatsappSession = (data) => {
        if (data.action === "update") {
          dispatch({ type: "UPDATE_SESSION", payload: data.session });
        }
      }

      safeSocketOn(socket, `company-${companyId}-whatsapp`, onCompanyWhatsapp);
      safeSocketOn(socket, `company-${companyId}-whatsappSession`, onCompanyWhatsappSession);

      return () => {
        safeSocketOff(socket, `company-${companyId}-whatsapp`, onCompanyWhatsapp);
        safeSocketOff(socket, `company-${companyId}-whatsappSession`, onCompanyWhatsappSession);
      };
    }
  }, [socket, user.companyId]);

  return { whatsApps, loading };
};

export default useWhatsApps;
