import React, { useContext } from "react";
import { FiMessageSquare, FiLoader } from "react-icons/fi";
import MomentsUser from "../../components/MomentsUser";
import ForbiddenPage from "../../components/ForbiddenPage";
import { AuthContext } from "../../context/Auth/AuthContext";
import "./style.css";

const ChatMoments = () => {
  const { user } = useContext(AuthContext);

  if (user.profile === "user" && user.allowRealTime === "disabled") {
    return <ForbiddenPage />;
  }

  return (
    <div className="moments-container">
      <div className="moments-header">
        <h1 className="moments-title">
          <FiMessageSquare className="moments-title-icon" />
          Painel de Atendimentos
        </h1>
      </div>

      <div className="moments-content-wrapper">
        <div className="moments-card">
          <MomentsUser />
        </div>
      </div>
    </div>
  );
};

export default ChatMoments;
