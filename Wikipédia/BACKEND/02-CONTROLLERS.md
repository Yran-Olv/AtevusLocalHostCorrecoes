# 🎮 Backend - Controllers

## 📋 Visão Geral

Controllers são responsáveis por receber requisições HTTP, validar dados, chamar services e retornar respostas. Eles atuam como uma camada intermediária entre as rotas e a lógica de negócio.

**Total**: 47 controllers

---

## 📂 Estrutura

```
controllers/
├── api/                          # Controllers da API externa (token auth)
│   ├── CompanyController.ts
│   ├── ContactController.ts
│   ├── HelpController.ts
│   ├── MessageController.ts
│   ├── PartnerController.ts
│   └── PlanController.ts
│
└── [Controllers principais]      # 41 controllers
```

---

## 🎯 Controllers Principais

### 1. **TicketController.ts**
Gerencia tickets de atendimento.

**Métodos:**
- `index(req, res)` - Lista tickets com filtros
- `show(req, res)` - Mostra ticket específico
- `showFromUUID(req, res)` - Mostra ticket por UUID
- `showLog(req, res)` - Mostra log do ticket
- `store(req, res)` - Cria novo ticket
- `update(req, res)` - Atualiza ticket
- `remove(req, res)` - Remove ticket
- `kanban(req, res)` - Lista tickets para Kanban
- `report(req, res)` - Gera relatório de tickets
- `closeAll(req, res)` - Fecha todos os tickets

**Rotas:**
- `GET /tickets` - Listar
- `GET /tickets/:ticketId` - Mostrar
- `GET /tickets/u/:uuid` - Mostrar por UUID
- `GET /tickets-log/:ticketId` - Log
- `GET /ticket/kanban` - Kanban
- `GET /ticketreport/reports` - Relatório
- `POST /tickets` - Criar
- `PUT /tickets/:ticketId` - Atualizar
- `DELETE /tickets/:ticketId` - Deletar
- `POST /tickets/closeAll` - Fechar todos

**Query Params (index):**
- `searchParam` - Busca textual
- `pageNumber` - Número da página
- `status` - Filtro por status (pending, open, closed)
- `date` - Filtro por data
- `dateStart` / `dateEnd` - Período
- `queueIds` - Filas (separado por vírgula)
- `tags` - Tags (separado por vírgula)
- `users` - Usuários (separado por vírgula)
- `whatsapps` - WhatsApps (separado por vírgula)
- `showAll` - Mostrar todos (true/false)
- `withUnreadMessages` - Apenas com mensagens não lidas
- `isGroup` - Apenas grupos
- `sortTickets` - Ordenação
- `searchOnMessages` - Buscar nas mensagens

---

### 2. **MessageController.ts**
Gerencia mensagens.

**Métodos:**
- `index(req, res)` - Lista mensagens de um ticket
- `store(req, res)` - Envia mensagem
- `update(req, res)` - Atualiza mensagem
- `delete(req, res)` - Deleta mensagem
- `edit(req, res)` - Edita mensagem
- `forward(req, res)` - Encaminha mensagem
- `checkNumber(req, res)` - Verifica número WhatsApp

**Rotas:**
- `GET /messages/:ticketId` - Listar mensagens
- `POST /messages/:ticketId` - Enviar mensagem
- `PUT /messages/:messageId` - Atualizar mensagem
- `DELETE /messages/:messageId` - Deletar mensagem
- `POST /messages/edit/:messageId` - Editar mensagem
- `POST /message/forward` - Encaminhar mensagem
- `POST /messages/checkNumber` - Verificar número

**Body (store):**
```typescript
{
  body: string;              // Texto da mensagem
  medias?: File[];          // Arquivos (multipart/form-data)
  quotedMsgId?: number;     // ID da mensagem citada
}
```

---

### 3. **WhatsAppController.ts**
Gerencia conexões WhatsApp.

**Métodos:**
- `index(req, res)` - Lista conexões
- `show(req, res)` - Mostra conexão
- `store(req, res)` - Cria conexão
- `update(req, res)` - Atualiza conexão
- `delete(req, res)` - Remove conexão

**Rotas:**
- `GET /whatsapp` - Listar
- `GET /whatsapp/:whatsappId` - Mostrar
- `POST /whatsapp` - Criar
- `PUT /whatsapp/:whatsappId` - Atualizar
- `DELETE /whatsapp/:whatsappId` - Deletar

**Body (store):**
```typescript
{
  name: string;              // Nome da conexão
  greetingMessage?: string;  // Mensagem de boas-vindas
  farewellMessage?: string; // Mensagem de despedida
  complationMessage?: string;
  ratingMessage?: string;
  status?: string;           // disconnected, connected, etc.
  isDefault?: boolean;       // Conexão padrão
  // ... outros campos
}
```

---

### 4. **WhatsAppSessionController.ts**
Gerencia sessões WhatsApp.

**Métodos:**
- `store(req, res)` - Inicia sessão
- `delete(req, res)` - Encerra sessão
- `show(req, res)` - Status da sessão

**Rotas:**
- `POST /whatsapp-session/:whatsappId` - Iniciar/Reiniciar
- `DELETE /whatsapp-session/:whatsappId` - Encerrar
- `GET /whatsapp-session/:whatsappId` - Status

---

### 5. **ContactController.ts**
Gerencia contatos.

**Métodos:**
- `index(req, res)` - Lista contatos
- `show(req, res)` - Mostra contato
- `store(req, res)` - Cria contato
- `update(req, res)` - Atualiza contato
- `delete(req, res)` - Remove contato
- `import(req, res)` - Importa contatos

**Rotas:**
- `GET /contacts` - Listar
- `GET /contacts/:contactId` - Mostrar
- `POST /contacts` - Criar
- `PUT /contacts/:contactId` - Atualizar
- `DELETE /contacts/:contactId` - Deletar
- `POST /contacts/import` - Importar

---

### 6. **UserController.ts**
Gerencia usuários.

**Métodos:**
- `index(req, res)` - Lista usuários
- `show(req, res)` - Mostra usuário
- `store(req, res)` - Cria usuário
- `update(req, res)` - Atualiza usuário
- `delete(req, res)` - Remove usuário

**Rotas:**
- `GET /users` - Listar
- `GET /users/:userId` - Mostrar
- `POST /users` - Criar
- `PUT /users/:userId` - Atualizar
- `DELETE /users/:userId` - Deletar

---

### 7. **CampaignController.ts**
Gerencia campanhas de envio.

**Métodos:**
- `index(req, res)` - Lista campanhas
- `show(req, res)` - Mostra campanha
- `store(req, res)` - Cria campanha
- `update(req, res)` - Atualiza campanha
- `delete(req, res)` - Remove campanha
- `cancel(req, res)` - Cancela campanha
- `restart(req, res)` - Reinicia campanha

**Rotas:**
- `GET /campaigns` - Listar
- `GET /campaigns/:campaignId` - Mostrar
- `POST /campaigns` - Criar
- `PUT /campaigns/:campaignId` - Atualizar
- `DELETE /campaigns/:campaignId` - Deletar
- `POST /campaigns/:campaignId/cancel` - Cancelar
- `POST /campaigns/:campaignId/restart` - Reiniciar

---

### 8. **FlowBuilderController.ts**
Gerencia fluxos conversacionais.

**Métodos:**
- `index(req, res)` - Lista fluxos
- `show(req, res)` - Mostra fluxo
- `store(req, res)` - Cria fluxo
- `update(req, res)` - Atualiza fluxo
- `delete(req, res)` - Remove fluxo

**Rotas:**
- `GET /flowbuilders` - Listar
- `GET /flowbuilders/:flowId` - Mostrar
- `POST /flowbuilders` - Criar
- `PUT /flowbuilders/:flowId` - Atualizar
- `DELETE /flowbuilders/:flowId` - Deletar

---

### 9. **QueueController.ts**
Gerencia filas de atendimento.

**Métodos:**
- `index(req, res)` - Lista filas
- `show(req, res)` - Mostra fila
- `store(req, res)` - Cria fila
- `update(req, res)` - Atualiza fila
- `delete(req, res)` - Remove fila

**Rotas:**
- `GET /queues` - Listar
- `GET /queues/:queueId` - Mostrar
- `POST /queues` - Criar
- `PUT /queues/:queueId` - Atualizar
- `DELETE /queues/:queueId` - Deletar

---

### 10. **TagController.ts**
Gerencia tags.

**Métodos:**
- `index(req, res)` - Lista tags
- `show(req, res)` - Mostra tag
- `store(req, res)` - Cria tag
- `update(req, res)` - Atualiza tag
- `delete(req, res)` - Remove tag

**Rotas:**
- `GET /tags` - Listar
- `GET /tags/:tagId` - Mostrar
- `POST /tags` - Criar
- `PUT /tags/:tagId` - Atualizar
- `DELETE /tags/:tagId` - Deletar

---

### 11. **ChatController.ts**
Gerencia sistema de chat.

**Métodos:**
- `index(req, res)` - Lista chats
- `show(req, res)` - Mostra chat
- `store(req, res)` - Cria chat
- `update(req, res)` - Atualiza chat
- `delete(req, res)` - Remove chat
- `showFromUuid(req, res)` - Mostra chat por UUID
- `findMessages(req, res)` - Busca mensagens

**Rotas:**
- `GET /chats` - Listar
- `GET /chats/:chatId` - Mostrar
- `GET /chats/u/:uuid` - Mostrar por UUID
- `POST /chats` - Criar
- `PUT /chats/:chatId` - Atualizar
- `DELETE /chats/:chatId` - Deletar
- `GET /chats/:chatId/messages` - Mensagens

---

### 12. **ChatbotController.ts**
Gerencia chatbots.

**Métodos:**
- `index(req, res)` - Lista chatbots
- `show(req, res)` - Mostra chatbot
- `store(req, res)` - Cria chatbot
- `update(req, res)` - Atualiza chatbot
- `delete(req, res)` - Remove chatbot

**Rotas:**
- `GET /chatbots` - Listar
- `GET /chatbots/:chatbotId` - Mostrar
- `POST /chatbots` - Criar
- `PUT /chatbots/:chatbotId` - Atualizar
- `DELETE /chatbots/:chatbotId` - Deletar

---

### 13. **CompanyController.ts**
Gerencia empresas (multi-tenant).

**Métodos:**
- `index(req, res)` - Lista empresas
- `show(req, res)` - Mostra empresa
- `store(req, res)` - Cria empresa
- `update(req, res)` - Atualiza empresa
- `delete(req, res)` - Remove empresa

**Rotas:**
- `GET /companies` - Listar
- `GET /companies/:companyId` - Mostrar
- `POST /companies` - Criar
- `PUT /companies/:companyId` - Atualizar
- `DELETE /companies/:companyId` - Deletar

---

### 14. **QuickMessageController.ts**
Gerencia mensagens rápidas (templates).

**Métodos:**
- `index(req, res)` - Lista mensagens rápidas
- `show(req, res)` - Mostra mensagem rápida
- `store(req, res)` - Cria mensagem rápida
- `update(req, res)` - Atualiza mensagem rápida
- `delete(req, res)` - Remove mensagem rápida

**Rotas:**
- `GET /quick-messages` - Listar
- `GET /quick-messages/:id` - Mostrar
- `POST /quick-messages` - Criar
- `PUT /quick-messages/:id` - Atualizar
- `DELETE /quick-messages/:id` - Deletar

---

### 15. **ScheduleController.ts**
Gerencia agendamentos.

**Métodos:**
- `index(req, res)` - Lista agendamentos
- `show(req, res)` - Mostra agendamento
- `store(req, res)` - Cria agendamento
- `update(req, res)` - Atualiza agendamento
- `delete(req, res)` - Remove agendamento

**Rotas:**
- `GET /schedules` - Listar
- `GET /schedules/:scheduleId` - Mostrar
- `POST /schedules` - Criar
- `PUT /schedules/:scheduleId` - Atualizar
- `DELETE /schedules/:scheduleId` - Deletar

---

### 16. **PromptController.ts**
Gerencia prompts de IA.

**Métodos:**
- `index(req, res)` - Lista prompts
- `show(req, res)` - Mostra prompt
- `store(req, res)` - Cria prompt
- `update(req, res)` - Atualiza prompt
- `delete(req, res)` - Remove prompt

**Rotas:**
- `GET /prompts` - Listar
- `GET /prompts/:promptId` - Mostrar
- `POST /prompts` - Criar
- `PUT /prompts/:promptId` - Atualizar
- `DELETE /prompts/:promptId` - Deletar

---

### 17. **FileController.ts**
Gerencia arquivos.

**Métodos:**
- `index(req, res)` - Lista arquivos
- `show(req, res)` - Mostra arquivo
- `store(req, res)` - Faz upload
- `update(req, res)` - Atualiza arquivo
- `delete(req, res)` - Remove arquivo

**Rotas:**
- `GET /files` - Listar
- `GET /files/:fileId` - Mostrar
- `POST /files` - Upload
- `PUT /files/:fileId` - Atualizar
- `DELETE /files/:fileId` - Deletar

---

### 18. **StatisticsController.ts**
Estatísticas e relatórios.

**Métodos:**
- `index(req, res)` - Estatísticas gerais
- `tickets(req, res)` - Estatísticas de tickets
- `messages(req, res)` - Estatísticas de mensagens

**Rotas:**
- `GET /statistics` - Estatísticas gerais
- `GET /statistics/tickets` - Estatísticas de tickets
- `GET /statistics/messages` - Estatísticas de mensagens

---

### 19. **DashbardController.ts**
Dashboard e métricas.

**Métodos:**
- `index(req, res)` - Dados do dashboard

**Rotas:**
- `GET /dashboard` - Dados do dashboard

---

### 20. **SettingController.ts**
Configurações do sistema.

**Métodos:**
- `index(req, res)` - Lista configurações
- `update(req, res)` - Atualiza configuração

**Rotas:**
- `GET /settings` - Listar
- `PUT /settings/:key` - Atualizar

---

### 21. **CompanySettingsController.ts**
Configurações de empresa.

**Métodos:**
- `index(req, res)` - Lista configurações
- `update(req, res)` - Atualiza configuração

**Rotas:**
- `GET /company-settings` - Listar
- `PUT /company-settings/:key` - Atualizar

---

### 22. **ContactListController.ts**
Listas de contatos.

**Métodos:**
- `index(req, res)` - Lista listas
- `show(req, res)` - Mostra lista
- `store(req, res)` - Cria lista
- `update(req, res)` - Atualiza lista
- `delete(req, res)` - Remove lista
- `import(req, res)` - Importa contatos

**Rotas:**
- `GET /contact-lists` - Listar
- `GET /contact-lists/:listId` - Mostrar
- `POST /contact-lists` - Criar
- `PUT /contact-lists/:listId` - Atualizar
- `DELETE /contact-lists/:listId` - Deletar
- `POST /contact-lists/:listId/import` - Importar

---

### 23. **ContactListItemController.ts**
Itens de lista de contatos.

**Métodos:**
- `index(req, res)` - Lista itens
- `show(req, res)` - Mostra item
- `store(req, res)` - Cria item
- `update(req, res)` - Atualiza item
- `delete(req, res)` - Remove item

**Rotas:**
- `GET /contact-lists/:listId/items` - Listar
- `GET /contact-lists/:listId/items/:itemId` - Mostrar
- `POST /contact-lists/:listId/items` - Criar
- `PUT /contact-lists/:listId/items/:itemId` - Atualizar
- `DELETE /contact-lists/:listId/items/:itemId` - Deletar

---

### 24. **QueueIntegrationController.ts**
Integrações de fila.

**Métodos:**
- `index(req, res)` - Lista integrações
- `show(req, res)` - Mostra integração
- `store(req, res)` - Cria integração
- `update(req, res)` - Atualiza integração
- `delete(req, res)` - Remove integração

**Rotas:**
- `GET /queue-integrations` - Listar
- `GET /queue-integrations/:id` - Mostrar
- `POST /queue-integrations` - Criar
- `PUT /queue-integrations/:id` - Atualizar
- `DELETE /queue-integrations/:id` - Deletar

---

### 25. **QueueOptionController.ts**
Opções de fila.

**Métodos:**
- `index(req, res)` - Lista opções
- `show(req, res)` - Mostra opção
- `store(req, res)` - Cria opção
- `update(req, res)` - Atualiza opção
- `delete(req, res)` - Remove opção

**Rotas:**
- `GET /queue-options` - Listar
- `GET /queue-options/:id` - Mostrar
- `POST /queue-options` - Criar
- `PUT /queue-options/:id` - Atualizar
- `DELETE /queue-options/:id` - Deletar

---

### 26. **WebHookController.ts**
Webhooks.

**Métodos:**
- `index(req, res)` - Lista webhooks
- `show(req, res)` - Mostra webhook
- `store(req, res)` - Cria webhook
- `update(req, res)` - Atualiza webhook
- `delete(req, res)` - Remove webhook
- `trigger(req, res)` - Dispara webhook

**Rotas:**
- `GET /webhooks` - Listar
- `GET /webhooks/:webhookId` - Mostrar
- `POST /webhooks` - Criar
- `PUT /webhooks/:webhookId` - Atualizar
- `DELETE /webhooks/:webhookId` - Deletar
- `POST /webhooks/:webhookId/trigger` - Disparar

---

### 27. **FlowDefaultController.ts**
Fluxos padrão.

**Métodos:**
- `index(req, res)` - Lista fluxos padrão
- `show(req, res)` - Mostra fluxo padrão
- `store(req, res)` - Cria fluxo padrão
- `update(req, res)` - Atualiza fluxo padrão
- `delete(req, res)` - Remove fluxo padrão

**Rotas:**
- `GET /flow-defaults` - Listar
- `GET /flow-defaults/:id` - Mostrar
- `POST /flow-defaults` - Criar
- `PUT /flow-defaults/:id` - Atualizar
- `DELETE /flow-defaults/:id` - Deletar

---

### 28. **FlowCampaignController.ts**
Campanhas de fluxo.

**Métodos:**
- `index(req, res)` - Lista campanhas de fluxo
- `show(req, res)` - Mostra campanha de fluxo
- `store(req, res)` - Cria campanha de fluxo
- `update(req, res)` - Atualiza campanha de fluxo
- `delete(req, res)` - Remove campanha de fluxo

**Rotas:**
- `GET /flow-campaigns` - Listar
- `GET /flow-campaigns/:id` - Mostrar
- `POST /flow-campaigns` - Criar
- `PUT /flow-campaigns/:id` - Atualizar
- `DELETE /flow-campaigns/:id` - Deletar

---

### 29. **CampaignSettingController.ts**
Configurações de campanha.

**Métodos:**
- `index(req, res)` - Lista configurações
- `update(req, res)` - Atualiza configuração

**Rotas:**
- `GET /campaign-settings` - Listar
- `PUT /campaign-settings/:key` - Atualizar

---

### 30. **TicketNoteController.ts**
Notas de ticket.

**Métodos:**
- `index(req, res)` - Lista notas
- `show(req, res)` - Mostra nota
- `store(req, res)` - Cria nota
- `update(req, res)` - Atualiza nota
- `delete(req, res)` - Remove nota

**Rotas:**
- `GET /tickets/:ticketId/notes` - Listar
- `GET /tickets/:ticketId/notes/:noteId` - Mostrar
- `POST /tickets/:ticketId/notes` - Criar
- `PUT /tickets/:ticketId/notes/:noteId` - Atualizar
- `DELETE /tickets/:ticketId/notes/:noteId` - Deletar

---

### 31. **TicketTagController.ts**
Tags de ticket.

**Métodos:**
- `store(req, res)` - Adiciona tag ao ticket
- `delete(req, res)` - Remove tag do ticket

**Rotas:**
- `POST /tickets/:ticketId/tags` - Adicionar tag
- `DELETE /tickets/:ticketId/tags/:tagId` - Remover tag

---

### 32. **AnnouncementController.ts**
Anúncios/avisos.

**Métodos:**
- `index(req, res)` - Lista anúncios
- `show(req, res)` - Mostra anúncio
- `store(req, res)` - Cria anúncio
- `update(req, res)` - Atualiza anúncio
- `delete(req, res)` - Remove anúncio

**Rotas:**
- `GET /announcements` - Listar
- `GET /announcements/:id` - Mostrar
- `POST /announcements` - Criar
- `PUT /announcements/:id` - Atualizar
- `DELETE /announcements/:id` - Deletar

---

### 33. **HelpController.ts**
Sistema de ajuda.

**Métodos:**
- `index(req, res)` - Lista ajudas
- `show(req, res)` - Mostra ajuda
- `store(req, res)` - Cria ajuda
- `update(req, res)` - Atualiza ajuda
- `delete(req, res)` - Remove ajuda

**Rotas:**
- `GET /helps` - Listar
- `GET /helps/:id` - Mostrar
- `POST /helps` - Criar
- `PUT /helps/:id` - Atualizar
- `DELETE /helps/:id` - Deletar

---

### 34. **PlanController.ts**
Planos de assinatura.

**Métodos:**
- `index(req, res)` - Lista planos
- `show(req, res)` - Mostra plano
- `store(req, res)` - Cria plano
- `update(req, res)` - Atualiza plano
- `delete(req, res)` - Remove plano

**Rotas:**
- `GET /plans` - Listar
- `GET /plans/:planId` - Mostrar
- `POST /plans` - Criar
- `PUT /plans/:planId` - Atualizar
- `DELETE /plans/:planId` - Deletar

---

### 35. **SubscriptionController.ts**
Assinaturas.

**Métodos:**
- `index(req, res)` - Lista assinaturas
- `show(req, res)` - Mostra assinatura
- `store(req, res)` - Cria assinatura
- `update(req, res)` - Atualiza assinatura
- `delete(req, res)` - Remove assinatura

**Rotas:**
- `GET /subscriptions` - Listar
- `GET /subscriptions/:id` - Mostrar
- `POST /subscriptions` - Criar
- `PUT /subscriptions/:id` - Atualizar
- `DELETE /subscriptions/:id` - Deletar

---

### 36. **InvoicesController.ts**
Faturas.

**Métodos:**
- `index(req, res)` - Lista faturas
- `show(req, res)` - Mostra fatura
- `store(req, res)` - Cria fatura
- `update(req, res)` - Atualiza fatura
- `delete(req, res)` - Remove fatura

**Rotas:**
- `GET /invoices` - Listar
- `GET /invoices/:id` - Mostrar
- `POST /invoices` - Criar
- `PUT /invoices/:id` - Atualizar
- `DELETE /invoices/:id` - Deletar

---

### 37. **SessionController.ts**
Sessões de autenticação.

**Métodos:**
- `store(req, res)` - Login
- `delete(req, res)` - Logout
- `refresh(req, res)` - Refresh token

**Rotas:**
- `POST /auth/login` - Login
- `DELETE /auth/logout` - Logout
- `POST /auth/refresh_token` - Refresh token
- `GET /auth/me` - Usuário atual

---

### 38. **VersionController.ts**
Controle de versão.

**Métodos:**
- `index(req, res)` - Versão atual

**Rotas:**
- `GET /version` - Versão

---

### 39. **ImportPhoneContactsController.ts**
Importação de contatos do telefone.

**Métodos:**
- `store(req, res)` - Importa contatos

**Rotas:**
- `POST /import-phone-contacts` - Importar

---

### 40. **ScheduledMessagesController.ts**
Mensagens agendadas.

**Métodos:**
- `index(req, res)` - Lista mensagens agendadas
- `show(req, res)` - Mostra mensagem agendada
- `store(req, res)` - Cria mensagem agendada
- `update(req, res)` - Atualiza mensagem agendada
- `delete(req, res)` - Remove mensagem agendada

**Rotas:**
- `GET /scheduled-messages` - Listar
- `GET /scheduled-messages/:id` - Mostrar
- `POST /scheduled-messages` - Criar
- `PUT /scheduled-messages/:id` - Atualizar
- `DELETE /scheduled-messages/:id` - Deletar

---

### 41. **ApiController.ts**
Controller base para API externa.

---

## 🔌 Controllers da API Externa (`api/`)

### 1. **api/MessageController.ts**
API externa para envio de mensagens (token auth).

**Rotas:**
- `POST /api/messages/send` - Enviar mensagem
- `POST /api/messages/checkNumber` - Verificar número
- `POST /api/messages/send/linkImage` - Enviar imagem por link

### 2. **api/ContactController.ts**
API externa para contatos.

**Rotas:**
- `GET /api/contacts` - Listar
- `POST /api/contacts` - Criar
- `PUT /api/contacts/:id` - Atualizar
- `DELETE /api/contacts/:id` - Deletar

### 3. **api/CompanyController.ts**
API externa para empresas.

**Rotas:**
- `GET /api/companies` - Listar
- `GET /api/companies/:id` - Mostrar

### 4. **api/PlanController.ts**
API externa para planos.

**Rotas:**
- `GET /api/plans` - Listar
- `GET /api/plans/:id` - Mostrar

### 5. **api/HelpController.ts**
API externa para ajuda.

**Rotas:**
- `GET /api/helps` - Listar

### 6. **api/PartnerController.ts**
API externa para parceiros.

**Rotas:**
- `GET /api/partners` - Listar
- `POST /api/partners` - Criar

---

## 🔐 Middlewares Aplicados

### Padrão de Uso

```typescript
// Autenticação obrigatória
routes.get('/resource', isAuth, controller.index);

// Autenticação + verificação de empresa
routes.post('/resource', isAuthCompany, controller.store);

// Apenas super admin
routes.delete('/resource/:id', isSuper, controller.delete);

// Autenticação por token (API externa)
routes.post('/api/resource', tokenAuth, controller.store);
```

---

## 📝 Padrão de Resposta

### Sucesso
```typescript
res.status(200).json({
  data: result,
  message: "Operação realizada com sucesso"
});
```

### Erro
```typescript
res.status(400).json({
  error: "Mensagem de erro",
  details: errorDetails
});
```

---

## 🔄 Fluxo Típico

```typescript
// 1. Controller recebe requisição
async index(req: Request, res: Response) {
  const { searchParam, pageNumber } = req.query;
  const { companyId } = req.user; // Do middleware isAuth
  
  // 2. Chama service
  const result = await ListService.execute({
    searchParam,
    pageNumber,
    companyId
  });
  
  // 3. Retorna resposta
  return res.status(200).json(result);
}
```

---

## 📚 Próximos Passos

- [🗄️ Models](./03-MODELS.md)
- [🛣️ Routes](./04-ROUTES.md)
- [⚙️ Services](./05-SERVICES.md)

