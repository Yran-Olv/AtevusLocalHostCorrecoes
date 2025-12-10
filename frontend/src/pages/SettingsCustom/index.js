import React, { useState, useEffect, useContext } from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import Tabs, { Tab } from "../../components/UI/Tabs";
import TabPanel from "../../components/TabPanel";

import SchedulesForm from "../../components/SchedulesForm";
import CompaniesManager from "../../components/CompaniesManager";
import PlansManager from "../../components/PlansManager";
import HelpsManager from "../../components/HelpsManager";
import Options from "../../components/Settings/Options";
import Whitelabel from "../../components/Settings/Whitelabel";
import GerencianetConfig from "../../components/Settings/GerencianetConfig";
import LoginConfig from "../../components/Settings/LoginConfig";

import { i18n } from "../../translate/i18n.js";
import { toast } from "react-toastify";

import useCompanies from "../../hooks/useCompanies";
import { AuthContext } from "../../context/Auth/AuthContext";

import OnlyForSuperUser from "../../components/OnlyForSuperUser";
import useCompanySettings from "../../hooks/useSettings/companySettings";
import useSettings from "../../hooks/useSettings";
import ForbiddenPage from "../../components/ForbiddenPage/index.js";
import "./SettingsCustom.css";

const SettingsCustom = () => {
  const [tab, setTab] = useState("options");
  const [schedules, setSchedules] = useState([]);
  const [company, setCompany] = useState({});
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [settings, setSettings] = useState({});
  const [oldSettings, setOldSettings] = useState({});
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);

  const { find, updateSchedules } = useCompanies();

  //novo hook
  const { getAll: getAllSettings } = useCompanySettings();
  const { getAll: getAllSettingsOld } = useSettings();
  const { user, socket } = useContext(AuthContext);

  useEffect(() => {
    async function findData() {
      setLoading(true);
      try {
        const companyId = user.companyId;
        const company = await find(companyId);

        const settingList = await getAllSettings(companyId);

        const settingListOld = await getAllSettingsOld();

        setCompany(company);
        setSchedules(company.schedules);
        setSettings(settingList);
        setOldSettings(settingListOld);

        setSchedulesEnabled(settingList.scheduleType === "company");
        setCurrentUser(user);
      } catch (e) {
        toast.error(e);
      }
      setLoading(false);
    }
    findData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleSubmitSchedules = async (data) => {
    setLoading(true);
    try {
      setSchedules(data);
      await updateSchedules({ id: company.id, schedules: data });
      toast.success("Horários atualizados com sucesso.");
    } catch (e) {
      toast.error(e);
    }
    setLoading(false);
  };

  const isSuper = () => {
    return currentUser.super;
  };

  return (
    <MainContainer className="settings-container">
      {user.profile === "user" ? (
        <ForbiddenPage />
      ) : (
        <>
          <MainHeader>
            <Title>{i18n.t("settings.title")}</Title>
          </MainHeader>
          <div className="settings-content">
            <Tabs value={tab} onChange={handleTabChange} className="settings-tabs">
              <Tab label={i18n.t("settings.tabs.options")} value="options" />
              {schedulesEnabled && <Tab label="Horários" value="schedules" />}
              {isSuper() && <Tab label="Empresas" value="companies" />}
              {isSuper() && <Tab label={i18n.t("settings.tabs.plans")} value="plans" />}
              {isSuper() && <Tab label={i18n.t("settings.tabs.helps")} value="helps" />}
              {isSuper() && <Tab label="Whitelabel" value="whitelabel" />}
              {isSuper() && <Tab label="Gerencianet" value="gerencianet" />}
              {isSuper() && <Tab label="Tela de Login" value="login" />}
            </Tabs>
            <div className="settings-panel">
              <TabPanel className="settings-panel-content" value={tab} name="schedules">
                <SchedulesForm
                  loading={loading}
                  onSubmit={handleSubmitSchedules}
                  initialValues={schedules}
                />
              </TabPanel>
              <OnlyForSuperUser
                user={currentUser}
                yes={() => (
                  <>
                    <TabPanel className="settings-panel-content" value={tab} name="companies">
                      <CompaniesManager />
                    </TabPanel>

                    <TabPanel className="settings-panel-content" value={tab} name="plans">
                      <PlansManager />
                    </TabPanel>

                    <TabPanel className="settings-panel-content" value={tab} name="helps">
                      <HelpsManager />
                    </TabPanel>
                    <TabPanel className="settings-panel-content" value={tab} name="whitelabel">
                      <Whitelabel settings={oldSettings} />
                    </TabPanel>
                    <TabPanel className="settings-panel-content" value={tab} name="gerencianet">
                      <GerencianetConfig />
                    </TabPanel>
                    <TabPanel className="settings-panel-content" value={tab} name="login">
                      <LoginConfig />
                    </TabPanel>
                  </>
                )}
              />
              <TabPanel className="settings-panel-content" value={tab} name="options">
                <Options
                  settings={settings}
                  oldSettings={oldSettings}
                  user={currentUser}
                  scheduleTypeChanged={(value) =>
                    setSchedulesEnabled(value === "company")
                  }
                />
              </TabPanel>
            </div>
          </div>
        </>
      )}
    </MainContainer>
  );
};

export default SettingsCustom;
