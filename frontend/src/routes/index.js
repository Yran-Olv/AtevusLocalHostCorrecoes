import React, { useEffect, useState, Suspense, lazy } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import { AuthProvider } from "../context/Auth/AuthContext";
import { TicketsContextProvider } from "../context/Tickets/TicketsContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";
import LoadingFallback from "../components/LoadingFallback";

// Lazy loading de todas as páginas - isso reduz drasticamente o tempo de build
const Dashboard = lazy(() => import("../pages/Dashboard"));
const TicketResponsiveContainer = lazy(() => import("../pages/TicketResponsiveContainer"));
const Signup = lazy(() => import("../pages/Signup"));
const Login = lazy(() => import("../pages/Login"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Connections = lazy(() => import("../pages/Connections"));
const SettingsCustom = lazy(() => import("../pages/SettingsCustom"));
const Financeiro = lazy(() => import("../pages/Financeiro"));
const Users = lazy(() => import("../pages/Users"));
const Contacts = lazy(() => import("../pages/Contacts"));
const ContactImportPage = lazy(() => import("../pages/Contacts/import"));
const ChatMoments = lazy(() => import("../pages/Moments"));
const Queues = lazy(() => import("../pages/Queues"));
const Tags = lazy(() => import("../pages/Tags"));
const MessagesAPI = lazy(() => import("../pages/MessagesAPI"));
const Helps = lazy(() => import("../pages/Helps"));
const ContactLists = lazy(() => import("../pages/ContactLists"));
const ContactListItems = lazy(() => import("../pages/ContactListItems"));
const Companies = lazy(() => import("../pages/Companies"));
const QuickMessages = lazy(() => import("../pages/QuickMessages"));
const Schedules = lazy(() => import("../pages/Schedules"));
const Campaigns = lazy(() => import("../pages/Campaigns"));
const CampaignsConfig = lazy(() => import("../pages/CampaignsConfig"));
const CampaignReport = lazy(() => import("../pages/CampaignReport"));
const Annoucements = lazy(() => import("../pages/Annoucements"));
const Chat = lazy(() => import("../pages/Chat"));
const Prompts = lazy(() => import("../pages/Prompts"));
const AllConnections = lazy(() => import("../pages/AllConnections"));
const Reports = lazy(() => import("../pages/Reports"));
const FlowBuilderConfig = lazy(() => import("../pages/FlowBuilderConfig").then(module => ({ default: module.FlowBuilderConfig })));
const FlowBuilder = lazy(() => import("../pages/FlowBuilder"));
const FlowDefault = lazy(() => import("../pages/FlowDefault"));
const CampaignsPhrase = lazy(() => import("../pages/CampaignsPhrase"));
const Subscription = lazy(() => import("../pages/Subscription"));
const QueueIntegration = lazy(() => import("../pages/QueueIntegration"));
const Files = lazy(() => import("../pages/Files"));
const ToDoList = lazy(() => import("../pages/ToDoList"));
const Kanban = lazy(() => import("../pages/Kanban"));
const TagsKanban = lazy(() => import("../pages/TagsKanban"));
const Routes = () => {
  const [showCampaigns, setShowCampaigns] = useState(false);

  useEffect(() => {
    const cshow = localStorage.getItem("cshow");
    if (cshow !== undefined) {
      setShowCampaigns(true);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <TicketsContextProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <Route exact path="/reset-password" component={ResetPassword} />
              <WhatsAppsProvider>
                <LoggedInLayout>
                  <Suspense fallback={<LoadingFallback />}>
                    <Route exact path="/financeiro" component={Financeiro} isPrivate />
                    <Route exact path="/subscription" component={Subscription} isPrivate />

                    <Route exact path="/companies" component={Companies} isPrivate />
                    <Route exact path="/" component={Dashboard} isPrivate />
                    <Route exact path="/tickets/:ticketId?" component={TicketResponsiveContainer} isPrivate />
                    <Route exact path="/connections" component={Connections} isPrivate />
                    <Route exact path="/quick-messages" component={QuickMessages} isPrivate />
                    <Route exact path="/todolist" component={ToDoList} isPrivate />
                    <Route exact path="/schedules" component={Schedules} isPrivate />
                    <Route exact path="/tags" component={Tags} isPrivate />
                    <Route exact path="/contacts" component={Contacts} isPrivate />
                    <Route exact path="/contacts/import" component={ContactImportPage} isPrivate />
                    <Route exact path="/helps" component={Helps} isPrivate />
                    <Route exact path="/users" component={Users} isPrivate />
                    <Route exact path="/messages-api" component={MessagesAPI} isPrivate />
                    <Route exact path="/settings" component={SettingsCustom} isPrivate />
                    <Route exact path="/queues" component={Queues} isPrivate />
                    <Route exact path="/reports" component={Reports} isPrivate />
                    <Route exact path="/queue-integration" component={QueueIntegration} isPrivate />
                    <Route exact path="/announcements" component={Annoucements} isPrivate />
                    <Route
                      exact
                      path="/phrase-lists"
                      component={CampaignsPhrase}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/flowbuilders"
                      component={FlowBuilder}
                      isPrivate
                    />
                    <Route
                      exact
                      path="/flowbuilder/:id?"
                      component={FlowBuilderConfig}
                      isPrivate
                    />
                    <Route exact path="/chats/:id?" component={Chat} isPrivate />
                    <Route exact path="/files" component={Files} isPrivate />
                    <Route exact path="/moments" component={ChatMoments} isPrivate />
                    <Route exact path="/Kanban" component={Kanban} isPrivate />
                    <Route exact path="/TagsKanban" component={TagsKanban} isPrivate />
                    <Route exact path="/prompts" component={Prompts} isPrivate />
                    <Route exact path="/allConnections" component={AllConnections} isPrivate />
                    {showCampaigns && (
                      <>
                        <Route exact path="/contact-lists" component={ContactLists} isPrivate />
                        <Route exact path="/contact-lists/:contactListId/contacts" component={ContactListItems} isPrivate />
                        <Route exact path="/campaigns" component={Campaigns} isPrivate />
                        <Route exact path="/campaign/:campaignId/report" component={CampaignReport} isPrivate />
                        <Route exact path="/campaigns-config" component={CampaignsConfig} isPrivate />
                      </>
                    )}
                  </Suspense>
                </LoggedInLayout>
              </WhatsAppsProvider>
            </Switch>
          </Suspense>
          <ToastContainer position="top-center" autoClose={3000} />
        </TicketsContextProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
