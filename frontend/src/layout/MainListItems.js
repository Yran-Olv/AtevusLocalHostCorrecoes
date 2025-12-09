import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { 
  FiLayout, FiMessageSquare, FiZap, FiUsers, FiCalendar, FiTag, 
  FiMessageCircle, FiCheckSquare, FiHelpCircle, FiSettings, FiUser, 
  FiGitBranch, FiFileText, FiList, FiLink, FiCode, FiLayers, 
  FiFolder, FiDollarSign, FiBriefcase, FiBell, FiGlobe, FiTrendingUp,
  FiChevronDown, FiChevronUp, FiGrid, FiBarChart2, FiClock
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi";
import { RiRobotLine, RiFlowChart } from "react-icons/ri";
import useHelps from "../hooks/useHelps";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { safeSocketOn, safeSocketOff, isSocketValid } from "../utils/socketHelper";
import { useActiveMenu } from "../context/ActiveMenuContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import "./menu.css";

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

// Componente de Item do Menu
const MenuItemLink = ({ to, icon, primary, tooltip, showBadge, collapsed, onClick }) => {
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  return (
    <RouterLink
      to={to}
      className={`menu-item ${isActive ? 'active' : ''} ${collapsed ? 'menu-tooltip collapsed' : ''}`}
      data-tooltip={collapsed ? primary : ''}
      onClick={onClick}
    >
      <div className="menu-item-icon">
        {icon}
      </div>
      {!collapsed && (
        <>
          <span className="menu-item-text">{primary}</span>
          {showBadge && <span className="menu-item-badge">!</span>}
        </>
      )}
      {collapsed && showBadge && <span className="menu-item-badge">!</span>}
    </RouterLink>
  );
};

// Componente de Menu Colapsável
const MenuCollapsible = ({ icon, primary, tooltip, collapsed, isOpen, onToggle, isActive, children }) => {
  return (
    <>
      <div
        className={`menu-collapsible ${isActive ? 'active' : ''} ${isOpen ? 'open' : ''} ${collapsed ? 'menu-tooltip' : ''}`}
        data-tooltip={collapsed ? primary : ''}
        onClick={onToggle}
      >
        <div className="menu-collapsible-icon">
          {icon}
        </div>
        {!collapsed && (
          <>
            <span className="menu-collapsible-text">{primary}</span>
            {isOpen ? (
              <FiChevronUp className="menu-collapsible-arrow" />
            ) : (
              <FiChevronDown className="menu-collapsible-arrow" />
            )}
          </>
        )}
      </div>
      <div className={`menu-submenu ${isOpen ? 'open' : ''}`}>
        {children}
      </div>
    </>
  );
};

// Componente de Submenu Item
const SubmenuItem = ({ to, primary, collapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <RouterLink
      to={to}
      className={`menu-submenu-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <span className="menu-submenu-item-text">{primary}</span>
    </RouterLink>
  );
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [flowHover, setFlowHover] = useState(false);
  const { list } = useHelps();
  const [hasHelps, setHasHelps] = useState(false);

  useEffect(() => {
    async function checkHelps() {
      try {
        const helps = await list();
        setHasHelps(helps && helps.length > 0);
      } catch (error) {
        // Se der erro de rede ou 404, simplesmente não mostra o menu de ajuda
        console.warn("Erro ao carregar helps:", error);
        setHasHelps(false);
      }
    }
    checkHelps();
  }, [list]);

  const isManagementActive =
    location.pathname === "/" || location.pathname.startsWith("/reports") || location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists") || location.pathname.startsWith("/flowbuilders");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();
  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
  }, [getVersion]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      if (planConfigs && planConfigs.plan) {
        setShowCampaigns(planConfigs.plan.useCampaigns || false);
        setShowKanban(planConfigs.plan.useKanban || false);
        setShowOpenAi(planConfigs.plan.useOpenAi || false);
        setShowIntegrations(planConfigs.plan.useIntegrations || false);
        setShowSchedules(planConfigs.plan.useSchedules || false);
        setShowInternalChat(planConfigs.plan.useInternalChat || false);
        setShowExternalApi(planConfigs.plan.useExternalApi || false);
      }
    }
    fetchData();
  }, [user.companyId, getPlanCompany]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id && isSocketValid(socket)) {
      const companyId = user.companyId;
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      safeSocketOn(socket, `company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        safeSocketOff(socket, `company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket, user.id, user.companyId]);

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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  const handleMenuItemClick = () => {
    if (window.innerWidth <= 768 && drawerClose) {
      drawerClose();
    }
  };

  return (
    <div className={`menu-container ${collapsed ? 'collapsed' : ''}`} onClick={handleMenuItemClick}>
      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") || user.allowRealTime === "enabled"
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <div className="menu-section">
            <div
              onMouseEnter={() => setManagementHover(true)}
              onMouseLeave={() => setManagementHover(false)}
            >
              <MenuCollapsible
                icon={<FiLayout />}
                primary={i18n.t("mainDrawer.listItems.management")}
                collapsed={collapsed}
                isOpen={openDashboardSubmenu}
                onToggle={() => setOpenDashboardSubmenu((prev) => !prev)}
                isActive={isManagementActive || managementHover}
              >
              <Can
                role={user.profile === "user" && user.showDashboard === "enabled" ? "admin" : user.profile}
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <>
                    <SubmenuItem
                      to="/"
                      primary={i18n.t("mainDrawer.listItems.dashboard")}
                      collapsed={collapsed}
                      onClick={handleMenuItemClick}
                    />
                    <SubmenuItem
                      to="/reports"
                      primary={i18n.t("mainDrawer.listItems.reports")}
                      collapsed={collapsed}
                      onClick={handleMenuItemClick}
                    />
                  </>
                )}
              />
              <Can
                role={user.profile === "user" && user.allowRealTime === "enabled" ? "admin" : user.profile}
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <SubmenuItem
                    to="/moments"
                    primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                    collapsed={collapsed}
                    onClick={handleMenuItemClick}
                  />
                )}
              />
              </MenuCollapsible>
            </div>
          </div>
        )}
      />

      <div className="menu-section">
        <MenuItemLink
          to="/tickets"
          icon={<FaWhatsapp style={{ color: '#25d366' }} />}
          primary={i18n.t("mainDrawer.listItems.tickets")}
          tooltip={collapsed}
          collapsed={collapsed}
          onClick={handleMenuItemClick}
        />

        <MenuItemLink
          to="/quick-messages"
          icon={<FiZap />}
          primary={i18n.t("mainDrawer.listItems.quickMessages")}
          tooltip={collapsed}
          collapsed={collapsed}
          onClick={handleMenuItemClick}
        />

        {showKanban && (
          <MenuItemLink
            to="/kanban"
            icon={<FiLayers />}
            primary={i18n.t("mainDrawer.listItems.kanban")}
            tooltip={collapsed}
            collapsed={collapsed}
            onClick={handleMenuItemClick}
          />
        )}

        <MenuItemLink
          to="/contacts"
          icon={<FiUsers />}
          primary={i18n.t("mainDrawer.listItems.contacts")}
          tooltip={collapsed}
          collapsed={collapsed}
          onClick={handleMenuItemClick}
        />

        {showSchedules && (
          <MenuItemLink
            to="/schedules"
            icon={<FiCalendar />}
            primary={i18n.t("mainDrawer.listItems.schedules")}
            tooltip={collapsed}
            collapsed={collapsed}
            onClick={handleMenuItemClick}
          />
        )}

        <MenuItemLink
          to="/tags"
          icon={<FiTag />}
          primary={i18n.t("mainDrawer.listItems.tags")}
          tooltip={collapsed}
          collapsed={collapsed}
          onClick={handleMenuItemClick}
        />

        {showInternalChat && (
          <MenuItemLink
            to="/chats"
            icon={<FiMessageCircle />}
            primary={i18n.t("mainDrawer.listItems.chats")}
            tooltip={collapsed}
            showBadge={!invisible}
            collapsed={collapsed}
            onClick={handleMenuItemClick}
          />
        )}

        <MenuItemLink
          to="/todolist"
          icon={<FiCheckSquare />}
          primary={i18n.t("mainDrawer.listItems.todoList")}
          tooltip={collapsed}
          collapsed={collapsed}
          onClick={handleMenuItemClick}
        />

        {hasHelps && (
          <MenuItemLink
            to="/helps"
            icon={<FiHelpCircle />}
            primary={i18n.t("mainDrawer.listItems.helps")}
            tooltip={collapsed}
            collapsed={collapsed}
            onClick={handleMenuItemClick}
          />
        )}
      </div>

      <Can
        role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
        perform="dashboard:view"
        yes={() => (
          <>
            <hr className="menu-divider" />
            {!collapsed && (
              <div className="menu-section-title">
                {i18n.t("mainDrawer.listItems.administration")}
              </div>
            )}

            <div className="menu-section">
              {showCampaigns && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <div
                      onMouseEnter={() => setCampaignHover(true)}
                      onMouseLeave={() => setCampaignHover(false)}
                    >
                      <MenuCollapsible
                        icon={<HiOutlineSparkles />}
                        primary={i18n.t("mainDrawer.listItems.campaigns")}
                        collapsed={collapsed}
                        isOpen={openCampaignSubmenu}
                        onToggle={() => setOpenCampaignSubmenu((prev) => !prev)}
                        isActive={isCampaignRouteActive || campaignHover}
                      >
                      <SubmenuItem
                        to="/campaigns"
                        primary={i18n.t("campaigns.subMenus.list")}
                        collapsed={collapsed}
                        onClick={handleMenuItemClick}
                      />
                      <SubmenuItem
                        to="/contact-lists"
                        primary={i18n.t("campaigns.subMenus.listContacts")}
                        collapsed={collapsed}
                        onClick={handleMenuItemClick}
                      />
                      <SubmenuItem
                        to="/campaigns-config"
                        primary={i18n.t("campaigns.subMenus.settings")}
                        collapsed={collapsed}
                        onClick={handleMenuItemClick}
                      />
                      </MenuCollapsible>
                    </div>
                  )}
                />
              )}

              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <div
                    onMouseEnter={() => setFlowHover(true)}
                    onMouseLeave={() => setFlowHover(false)}
                  >
                    <MenuCollapsible
                      icon={<RiFlowChart />}
                      primary={i18n.t("mainDrawer.listItems.flowBuilder")}
                      collapsed={collapsed}
                      isOpen={openFlowSubmenu}
                      onToggle={() => setOpenFlowSubmenu((prev) => !prev)}
                      isActive={isFlowbuilderRouteActive || flowHover}
                    >
                    <SubmenuItem
                      to="/flowbuilders"
                      primary={i18n.t("mainDrawer.listItems.flowChat")}
                      collapsed={collapsed}
                      onClick={handleMenuItemClick}
                    />
                    <SubmenuItem
                      to="/phrase-lists"
                      primary={i18n.t("mainDrawer.listItems.phraseLists")}
                      collapsed={collapsed}
                      onClick={handleMenuItemClick}
                    />
                    </MenuCollapsible>
                  </div>
                )}
              />

              {user.super && (
                <MenuItemLink
                  to="/announcements"
                  icon={<FiBell />}
                  primary={i18n.t("mainDrawer.listItems.annoucements")}
                  tooltip={collapsed}
                  collapsed={collapsed}
                  onClick={handleMenuItemClick}
                />
              )}

              {showExternalApi && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <MenuItemLink
                      to="/messages-api"
                      icon={<FiCode />}
                      primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                      tooltip={collapsed}
                      collapsed={collapsed}
                      onClick={handleMenuItemClick}
                    />
                  )}
                />
              )}

              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <MenuItemLink
                    to="/users"
                    icon={<FiUser />}
                    primary={i18n.t("mainDrawer.listItems.users")}
                    tooltip={collapsed}
                    collapsed={collapsed}
                    onClick={handleMenuItemClick}
                  />
                )}
              />

              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <MenuItemLink
                    to="/queues"
                    icon={<FiGitBranch />}
                    primary={i18n.t("mainDrawer.listItems.queues")}
                    tooltip={collapsed}
                    collapsed={collapsed}
                    onClick={handleMenuItemClick}
                  />
                )}
              />

              {showOpenAi && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <MenuItemLink
                      to="/prompts"
                      icon={<RiRobotLine />}
                      primary={i18n.t("mainDrawer.listItems.prompts")}
                      tooltip={collapsed}
                      collapsed={collapsed}
                      onClick={handleMenuItemClick}
                    />
                  )}
                />
              )}

              {showIntegrations && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <MenuItemLink
                      to="/queue-integration"
                      icon={<FiLink />}
                      primary={i18n.t("mainDrawer.listItems.queueIntegration")}
                      tooltip={collapsed}
                      collapsed={collapsed}
                      onClick={handleMenuItemClick}
                    />
                  )}
                />
              )}

              <Can
                role={user.profile === "user" && user.allowConnections === "enabled" ? "admin" : user.profile}
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <MenuItemLink
                    to="/connections"
                    icon={<FiLink />}
                    primary={i18n.t("mainDrawer.listItems.connections")}
                    tooltip={collapsed}
                    showBadge={connectionWarning}
                    collapsed={collapsed}
                    onClick={handleMenuItemClick}
                  />
                )}
              />

              {user.super && (
                <MenuItemLink
                  to="/allConnections"
                  icon={<FiGlobe />}
                  primary={i18n.t("mainDrawer.listItems.allConnections")}
                  tooltip={collapsed}
                  collapsed={collapsed}
                  onClick={handleMenuItemClick}
                />
              )}

              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <MenuItemLink
                    to="/files"
                    icon={<FiFolder />}
                    primary={i18n.t("mainDrawer.listItems.files")}
                    tooltip={collapsed}
                    collapsed={collapsed}
                    onClick={handleMenuItemClick}
                  />
                )}
              />

              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <MenuItemLink
                    to="/subscription"
                    icon={<FiDollarSign />}
                    primary={i18n.t("mainDrawer.listItems.financeiro")}
                    tooltip={collapsed}
                    collapsed={collapsed}
                    onClick={handleMenuItemClick}
                  />
                )}
              />

              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <MenuItemLink
                    to="/settings"
                    icon={<FiSettings />}
                    primary={i18n.t("mainDrawer.listItems.settings")}
                    tooltip={collapsed}
                    collapsed={collapsed}
                    onClick={handleMenuItemClick}
                  />
                )}
              />

              {user.super && (
                <MenuItemLink
                  to="/companies"
                  icon={<FiBriefcase />}
                  primary={i18n.t("mainDrawer.listItems.companies")}
                  tooltip={collapsed}
                  collapsed={collapsed}
                  onClick={handleMenuItemClick}
                />
              )}
            </div>
          </>
        )}
      />

      {!collapsed && version && (
        <div className="menu-version">
          {version}
        </div>
      )}
    </div>
  );
};

export default MainListItems;
