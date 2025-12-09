import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import { Link } from 'react-router-dom';
import { FiSun, FiMoon, FiChevronLeft, FiRefreshCw, FiUser, FiFileText, FiSettings, FiLogOut } from "react-icons/fi";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";

import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";
// import UserLanguageSelector from "../components/UserLanguageSelector";

import ColorModeContext from "./themeContext";
import { getBackendUrl } from "../config";
import useSettings from "../hooks/useSettings";
import { safeSocketOn, safeSocketOff, safeSocketEmit, isSocketValid } from "../utils/socketHelper";
import "./themeToggle.css";
import "./layout.css";

// import { SocketContext } from "../context/Socket/SocketContext";

const backendUrl = getBackendUrl();

const LoggedInLayout = ({ children, themeToggle }) => {
  const [userToken, setUserToken] = useState("disabled");
  const [loadingUserToken, setLoadingUserToken] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user, socket } = useContext(AuthContext);
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const { colorMode } = useContext(ColorModeContext);
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("preferredTheme") || "light");
  const isMobile = window.innerWidth <= 768;

  useEffect(() => {
    const theme = localStorage.getItem("preferredTheme") || "light";
    setCurrentTheme(theme);
  }, [colorMode]);

  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);

  const { dateToClient } = useDate();
  const [profileUrl, setProfileUrl] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mainListItems = useMemo(
    () => <MainListItems drawerOpen={drawerOpen} collapsed={!drawerOpen} />,
    [user, drawerOpen]
  );

  const settings = useSettings();

  useEffect(() => {
    console.error = () => { };
    const getSetting = async () => {
      try {
        const response = await settings.get("AASaaS");

        if (response) {
          setUserToken("disabled");
        } else {
          setUserToken("disabled");
        }
      } catch (error) {
        setUserToken("disabled");
      }
    };

    getSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [userInitials, setUserInitials] = useState('');

  useEffect(() => {
    if (user && user.name) {
      const initials = user.name.charAt(0).toUpperCase();
      setUserInitials(initials);
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        if (user.defaultMenu === "closed") {
          setDrawerOpen(false);
        } else {
          setDrawerOpen(true);
        }
        setDrawerVariant("permanent");
      } else {
        setDrawerVariant("temporary");
        setDrawerOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [user.defaultMenu]);

  useEffect(() => {
    if (user.defaultTheme === "dark" && currentTheme === "light") {
      colorMode.toggleColorMode();
      setCurrentTheme("dark");
    }
  }, [user.defaultTheme, currentTheme, colorMode]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  useEffect(() => {

    const companyId = user.companyId;
    const userId = user.id;
    if (companyId) {
      //    const socket = socketManager.GetSocket();

      const ImageUrl = user.profileImage;

      if (ImageUrl !== undefined && ImageUrl !== null) {
        setProfileUrl(`${backendUrl}/public/company${companyId}/user/${ImageUrl}`);
      } else {
        const initials = user.name.charAt(0).toUpperCase();
        setUserInitials(initials);
      }

      const onCompanyAuthLayout = (data) => {
        if (data.user.id === +userId) {
          toastError("Sua conta foi acessada em outro computador.");
          setTimeout(() => {
            localStorage.clear();
            window.location.reload();
          }, 1000);
        }
      }

      if (isSocketValid(socket)) {
        safeSocketOn(socket, `company-${companyId}-auth`, onCompanyAuthLayout);

        safeSocketEmit(socket, "userStatus");
        const interval = setInterval(() => {
          safeSocketEmit(socket, "userStatus");
        }, 1000 * 60 * 5);

        return () => {
          safeSocketOff(socket, `company-${companyId}-auth`, onCompanyAuthLayout);
          clearInterval(interval);
        };
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const handleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const today = new Date();
  const dueDate = user?.company?.dueDate ? new Date(user.company.dueDate) : null;
  const timeDiff = dueDate ? dueDate - today : null;
  const daysRemaining = timeDiff ? Math.ceil(timeDiff / (1000 * 3600 * 24)) : null;

  const drawerClose = () => {
    if (window.innerWidth <= 768 || user.defaultMenu === "closed") {
      setDrawerOpen(false);
    }
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  };

  const handleMenuItemClick = () => {
    if (window.innerWidth <= 768) {
      setDrawerOpen(false);
    }
  };

  if (loading) {
    return <BackdropLoading />;
  }


  return (
    <div className="layout-root">
      {/* Drawer Overlay para mobile */}
      {drawerVariant === "temporary" && (
        <div 
          className={`layout-drawer-overlay ${drawerOpen ? 'visible' : ''}`}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer/Sidebar */}
      <aside 
        className={`layout-drawer ${drawerVariant} ${drawerOpen ? 'open' : ''} ${!drawerOpen ? 'collapsed' : ''}`}
      >
        <div className="layout-drawer-header">
          {drawerOpen && (
            <div className="layout-drawer-logo-text">
              <span className="logo-m">M</span>
              <span className="logo-text">ultivus</span>
            </div>
          )}
          <button 
            className="layout-drawer-toggle"
            onClick={() => setDrawerOpen(!drawerOpen)}
            aria-label="Toggle drawer"
          >
            <FiChevronLeft className={`layout-drawer-toggle-icon ${drawerOpen ? '' : 'rotated'}`} />
          </button>
        </div>
        <div className="layout-drawer-content">
          <MainListItems collapsed={!drawerOpen} drawerClose={drawerClose} />
        </div>
      </aside>

      {/* AppBar */}
      <header className={`layout-appbar ${drawerVariant === "permanent" ? 'shifted' : ''} ${drawerVariant === "permanent" && !drawerOpen ? 'collapsed' : ''}`}>
        <div className="layout-appbar-toolbar">
          <div className="layout-appbar-left">
            <button
              className={`layout-appbar-menu-button ${drawerOpen && drawerVariant === "permanent" ? 'hidden' : ''}`}
              onClick={() => setDrawerOpen(!drawerOpen)}
              aria-label="Abrir menu"
            >
              <img src="/mobile-logo-mini.svg" alt="" className="layout-appbar-menu-icon" />
            </button>

            <h2 className="layout-appbar-title">
              {i18n.t("mainDrawer.appBar.user.message")} <b>{user.name}</b>,{" "}
              {i18n.t("mainDrawer.appBar.user.messageEnd")}{" "}
              <b>{user?.company?.name}</b>!

              {!isMobile && user?.profile === "admin" && daysRemaining !== null && (
                <>
                  {daysRemaining <= 0 ? (
                    <span className="layout-appbar-danger" title="Não foi identificado o pagamento">
                      <b>Atenção:</b> Sistema suspenderá amanhã!
                    </span>
                  ) : daysRemaining <= 7 ? (
                    <span className="layout-appbar-warning" title="Necessário realizar o pagamento">
                      Sistema vence em <b>{daysRemaining} dia{daysRemaining !== 1 ? 's' : ''}</b>.
                    </span>
                  ) : null}
                </>
              )}
            </h2>

            {userToken === "enabled" && user?.companyId === 1 && (
              <span className="layout-chip">
                {i18n.t("mainDrawer.appBar.user.token")}
              </span>
            )}
          </div>

          <div className="layout-appbar-right">
            <button
              className={`theme-toggle ${currentTheme === "dark" ? "theme-toggle-dark" : "theme-toggle-light"}`}
              onClick={() => {
                colorMode.toggleColorMode();
                setCurrentTheme(currentTheme === "dark" ? "light" : "dark");
              }}
              aria-label={currentTheme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
              title={currentTheme === "dark" ? "Modo Claro" : "Modo Escuro"}
            >
              <div className="theme-toggle-track">
                <div className="theme-toggle-thumb">
                  {currentTheme === "dark" ? (
                    <FiMoon className="theme-toggle-icon" />
                  ) : (
                    <FiSun className="theme-toggle-icon" />
                  )}
                </div>
              </div>
            </button>

            <NotificationsVolume setVolume={setVolume} volume={volume} />

            <button
              className="layout-appbar-button"
              onClick={handleRefreshPage}
              aria-label={i18n.t("mainDrawer.appBar.refresh")}
              title={i18n.t("mainDrawer.appBar.refresh")}
            >
              <FiRefreshCw className="layout-appbar-button-icon" />
            </button>

            {user.id && <NotificationsPopOver volume={volume} />}

            <AnnouncementsPopover />

            <ChatPopover />

            <div className="layout-profile-menu" ref={profileMenuRef}>
              <div className="layout-profile-avatar-wrapper" onClick={handleMenu}>
                <div className="layout-profile-avatar">
                  {profileUrl ? (
                    <img src={profileUrl} alt={user.name} />
                  ) : (
                    userInitials
                  )}
                </div>
                <div className="layout-profile-badge"></div>
              </div>

              <UserModal
                open={userModalOpen}
                onClose={() => setUserModalOpen(false)}
                onImageUpdate={(newProfileUrl) => setProfileUrl(newProfileUrl)}
                userId={user?.id}
              />

              {menuOpen && (
                <div className="layout-profile-dropdown">
                  <div className="layout-profile-dropdown-header">
                    <div className="layout-profile-dropdown-avatar">
                      {profileUrl ? (
                        <img src={profileUrl} alt={user.name} />
                      ) : (
                        userInitials
                      )}
                    </div>
                    <div className="layout-profile-dropdown-info">
                      <p className="layout-profile-dropdown-name">{user.name}</p>
                      <p className="layout-profile-dropdown-role">
                        {user?.profile === "admin" ? "Administrador" : "Usuário"}
                      </p>
                    </div>
                  </div>

                  <div className="layout-profile-dropdown-divider"></div>

                  <button
                    className="layout-profile-dropdown-item"
                    onClick={handleOpenUserModal}
                  >
                    <FiUser className="layout-profile-dropdown-item-icon" />
                    Perfil
                  </button>

                  <Link
                    to="/todolist"
                    className="layout-profile-dropdown-item"
                    onClick={handleCloseMenu}
                  >
                    <FiFileText className="layout-profile-dropdown-item-icon" />
                    Anotações
                  </Link>

                  {user?.profile === "admin" && (
                    <Link
                      to="/settings"
                      className="layout-profile-dropdown-item"
                      onClick={handleCloseMenu}
                    >
                      <FiSettings className="layout-profile-dropdown-item-icon" />
                      Configurações
                    </Link>
                  )}

                  <div className="layout-profile-dropdown-divider"></div>

                  <button
                    className="layout-profile-dropdown-item logout"
                    onClick={handleClickLogout}
                  >
                    <FiLogOut className="layout-profile-dropdown-item-icon" />
                    {i18n.t("mainDrawer.appBar.user.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`layout-main ${drawerVariant === "permanent" ? 'shifted' : ''} ${drawerVariant === "permanent" && !drawerOpen ? 'collapsed' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default LoggedInLayout;
