# 📁 Backend - Estrutura de Pastas

## 📂 Visão Geral da Estrutura

```
backend/
├── src/                          # Código fonte TypeScript
│   ├── @types/                   # Definições de tipos TypeScript
│   ├── app.ts                    # Configuração principal do Express
│   ├── server.ts                 # Servidor HTTP
│   ├── bootstrap.ts              # Inicialização do sistema
│   ├── server-cluster.ts         # Modo cluster (multi-processo)
│   │
│   ├── controllers/              # Controladores (47 arquivos)
│   │   ├── api/                  # Controllers da API externa
│   │   └── [Controllers principais]
│   │
│   ├── models/                   # Modelos Sequelize (55 arquivos)
│   │   └── [Modelos do banco de dados]
│   │
│   ├── routes/                   # Rotas da API (44 arquivos)
│   │   ├── api/                  # Rotas da API externa
│   │   └── [Rotas principais]
│   │
│   ├── services/                 # Lógica de negócio (310 arquivos)
│   │   ├── [Services organizados por funcionalidade]
│   │
│   ├── helpers/                  # Funções auxiliares (27 arquivos)
│   │   └── [Helpers diversos]
│   │
│   ├── middleware/               # Middlewares (5 arquivos)
│   │   └── [Middlewares de autenticação e validação]
│   │
│   ├── libs/                     # Bibliotecas customizadas (6 arquivos)
│   │   ├── cache.ts              # Sistema de cache
│   │   ├── queue.ts              # Sistema de filas
│   │   ├── socket.ts              # Configuração Socket.IO
│   │   ├── store.ts              # Store para WhatsApp
│   │   └── wbot.ts               # Cliente WhatsApp (Baileys)
│   │
│   ├── database/                 # Migrations e Seeds
│   │   ├── migrations/           # 265 arquivos de migração
│   │   └── seeds/                # 4 arquivos de seed
│   │
│   ├── jobs/                     # Jobs assíncronos (3 arquivos)
│   │   ├── handleMessageQueue.ts
│   │   └── handleMessageAckQueue.ts
│   │
│   ├── queues/                   # Filas de processamento
│   │   └── userMonitor.ts
│   │
│   ├── scripts/                  # Scripts utilitários (2 arquivos)
│   │   ├── cleanup-lid-contacts.js
│   │   └── cleanup-redis-sessions.js
│   │
│   ├── utils/                    # Utilitários gerais (5 arquivos)
│   │   ├── logger.ts
│   │   ├── randomCode.ts
│   │   ├── randomizador.ts
│   │   ├── useDate.ts
│   │   └── version.ts
│   │
│   ├── config/                   # Arquivos de configuração (7 arquivos)
│   │   ├── auth.ts               # Configuração JWT
│   │   ├── database.ts           # Configuração Sequelize
│   │   ├── redis.ts              # Configuração Redis
│   │   ├── upload.ts             # Configuração upload
│   │   └── [Outros configs]
│   │
│   └── errors/                   # Tratamento de erros
│       └── AppError.ts
│
├── dist/                         # Código compilado (JavaScript)
│   └── [Estrutura espelhada de src/]
│
├── public/                       # Arquivos públicos estáticos
│   └── [Arquivos servidos publicamente]
│
├── private/                      # Arquivos privados
│   └── sessions/                 # Sessões WhatsApp
│
├── certs/                        # Certificados SSL
│
├── node_modules/                 # Dependências npm
│
├── package.json                  # Dependências e scripts
├── tsconfig.json                 # Configuração TypeScript
├── ecosystem.config.js          # Configuração PM2
└── jest.config.js               # Configuração Jest (testes)
```

---

## 📂 Detalhamento das Pastas

### 🎮 `controllers/` (47 arquivos)

Controladores que recebem requisições HTTP e coordenam a lógica.

**Principais Controllers:**
- `TicketController.ts` - Gestão de tickets
- `MessageController.ts` - Envio/recebimento de mensagens
- `WhatsAppController.ts` - Gerenciamento de conexões WhatsApp
- `UserController.ts` - Gestão de usuários
- `ContactController.ts` - Gestão de contatos
- `CampaignController.ts` - Campanhas de envio
- `FlowBuilderController.ts` - Fluxos conversacionais
- `ChatController.ts` - Sistema de chat
- `QueueController.ts` - Filas de atendimento
- `TagController.ts` - Tags
- `CompanyController.ts` - Empresas (multi-tenant)
- `api/` - Controllers da API externa (token auth)

**Padrão:**
```typescript
class Controller {
  async index(req, res) { }    // GET /resource
  async show(req, res) { }     // GET /resource/:id
  async store(req, res) { }    // POST /resource
  async update(req, res) { }   // PUT /resource/:id
  async delete(req, res) { }   // DELETE /resource/:id
}
```

---

### 🗄️ `models/` (55 arquivos)

Modelos Sequelize que representam tabelas do banco de dados.

**Principais Models:**
- `User.ts` - Usuários
- `Company.ts` - Empresas
- `Ticket.ts` - Tickets
- `Message.ts` - Mensagens
- `Contact.ts` - Contatos
- `Whatsapp.ts` - Conexões WhatsApp
- `Queue.ts` - Filas
- `Tag.ts` - Tags
- `Campaign.ts` - Campanhas
- `FlowBuilder.ts` - Fluxos
- `Chat.ts` - Chats
- `Chatbot.ts` - Chatbots
- `Schedule.ts` - Agendamentos
- `QuickMessage.ts` - Mensagens rápidas
- `Setting.ts` - Configurações
- `Webhook.ts` - Webhooks
- `Plan.ts` - Planos de assinatura
- `Subscription.ts` - Assinaturas

**Padrão:**
```typescript
@Table
class Model extends Model {
  @PrimaryKey
  id: number;
  
  @Column
  name: string;
  
  // Relacionamentos
  @BelongsTo
  company: Company;
}
```

---

### 🛣️ `routes/` (44 arquivos)

Define os endpoints da API e conecta com controllers.

**Principais Rotas:**
- `ticketRoutes.ts` - `/tickets`
- `messageRoutes.ts` - `/messages`
- `whatsappRoutes.ts` - `/whatsapp`
- `userRoutes.ts` - `/users`
- `contactRoutes.ts` - `/contacts`
- `campaignRoutes.ts` - `/campaigns`
- `flowBuilderRoutes.ts` - `/flowbuilders`
- `chatRoutes.ts` - `/chats`
- `queueRoutes.ts` - `/queues`
- `tagRoutes.ts` - `/tags`
- `authRoutes.ts` - `/auth`
- `apiRoutes.ts` - `/api/*` (API externa)

**Padrão:**
```typescript
routes.get('/', controller.index);
routes.get('/:id', controller.show);
routes.post('/', middleware, controller.store);
routes.put('/:id', middleware, controller.update);
routes.delete('/:id', middleware, controller.delete);
```

---

### ⚙️ `services/` (310 arquivos)

Lógica de negócio organizada por funcionalidade.

**Estrutura por Funcionalidade:**

#### `TicketServices/` (16 arquivos)
- `CreateService.ts` - Criar ticket
- `UpdateService.ts` - Atualizar ticket
- `ListService.ts` - Listar tickets
- `ShowService.ts` - Mostrar ticket
- `DeleteService.ts` - Deletar ticket
- `FindService.ts` - Buscar ticket
- `FindAllService.ts` - Buscar todos
- `UpdateTicketService.ts` - Atualizar
- `ShowTicketService.ts` - Mostrar
- `DeleteTicketService.ts` - Deletar
- `CreateTicketService.ts` - Criar
- `ListTicketsService.ts` - Listar
- `UpdateTicketUserService.ts` - Atribuir usuário
- `UpdateTicketQueueService.ts` - Atribuir fila
- `UpdateTicketStatusService.ts` - Atualizar status
- `SendWhatsAppMessage.ts` - Enviar mensagem

#### `MessageServices/` (7 arquivos)
- `CreateService.ts` - Criar mensagem
- `DeleteService.ts` - Deletar mensagem
- `EditService.ts` - Editar mensagem
- `ForwardService.ts` - Encaminhar mensagem
- `ListService.ts` - Listar mensagens
- `ShowService.ts` - Mostrar mensagem
- `SendService.ts` - Enviar mensagem

#### `WhatsappService/` (12 arquivos)
- `CreateService.ts` - Criar conexão
- `UpdateService.ts` - Atualizar conexão
- `DeleteService.ts` - Deletar conexão
- `ListService.ts` - Listar conexões
- `ShowService.ts` - Mostrar conexão
- `StartSessionService.ts` - Iniciar sessão
- `RestartSessionService.ts` - Reiniciar sessão
- `DisconnectSessionService.ts` - Desconectar sessão

#### `WbotServices/` (21 arquivos)
- `StartAllWhatsAppsSessions.ts` - Iniciar todas sessões
- `StartWhatsAppSession.ts` - Iniciar sessão
- `SendWhatsAppMessage.ts` - Enviar mensagem
- `SendWhatsAppMedia.ts` - Enviar mídia
- `HandleWhatsAppMessage.ts` - Processar mensagem recebida
- `HandleWhatsAppAck.ts` - Processar confirmação
- `HandleWhatsAppConnection.ts` - Processar conexão
- `GetWhatsAppQrCode.ts` - Obter QR Code
- `DisconnectWhatsApp.ts` - Desconectar
- [Outros serviços WhatsApp]

#### `ContactServices/` (18 arquivos)
- `CreateService.ts` - Criar contato
- `UpdateService.ts` - Atualizar contato
- `DeleteService.ts` - Deletar contato
- `ListService.ts` - Listar contatos
- `ShowService.ts` - Mostrar contato
- `FindService.ts` - Buscar contato
- `FindAllService.ts` - Buscar todos
- `ImportService.ts` - Importar contatos
- [Outros serviços de contato]

#### `CampaignService/` (9 arquivos)
- `CreateService.ts` - Criar campanha
- `UpdateService.ts` - Atualizar campanha
- `DeleteService.ts` - Deletar campanha
- `ListService.ts` - Listar campanhas
- `ShowService.ts` - Mostrar campanha
- `CancelService.ts` - Cancelar campanha
- `RestartService.ts` - Reiniciar campanha
- `FindAllService.ts` - Buscar todas
- `FindService.ts` - Buscar campanha

#### `FlowBuilderService/` (12 arquivos)
- `CreateService.ts` - Criar fluxo
- `UpdateService.ts` - Atualizar fluxo
- `DeleteService.ts` - Deletar fluxo
- `ListService.ts` - Listar fluxos
- `ShowService.ts` - Mostrar fluxo
- `ExecuteService.ts` - Executar fluxo
- [Outros serviços de fluxo]

#### `UserServices/` (10 arquivos)
- `CreateService.ts` - Criar usuário
- `UpdateService.ts` - Atualizar usuário
- `DeleteService.ts` - Deletar usuário
- `ListService.ts` - Listar usuários
- `ShowService.ts` - Mostrar usuário
- `FindAllService.ts` - Buscar todos
- `FindService.ts` - Buscar usuário
- `UpdatePasswordService.ts` - Atualizar senha
- `UpdateProfileService.ts` - Atualizar perfil

#### Outros Services:
- `ChatService/` (10 arquivos) - Sistema de chat
- `QueueService/` (5 arquivos) - Filas
- `TagServices/` (8 arquivos) - Tags
- `Statistics/` (9 arquivos) - Estatísticas
- `WebhookService/` (10 arquivos) - Webhooks
- `PromptServices/` (5 arquivos) - Prompts IA
- `ChatBotServices/` (6 arquivos) - Chatbots
- `FileServices/` (7 arquivos) - Arquivos
- `ScheduleServices/` (5 arquivos) - Agendamentos
- `QuickMessageService/` (7 arquivos) - Mensagens rápidas
- `QueueIntegrationServices/` (8 arquivos) - Integrações de fila
- `ContactListService/` (9 arquivos) - Listas de contatos
- `ContactListItemService/` (8 arquivos) - Itens de lista
- `HelpServices/` (7 arquivos) - Ajuda
- `InvoicesService/` (6 arquivos) - Faturas
- `PlanService/` (6 arquivos) - Planos
- `SettingServices/` (7 arquivos) - Configurações
- `ScheduledMessagesService/` (5 arquivos) - Mensagens agendadas
- `ReportService/` (3 arquivos) - Relatórios
- `FacebookServices/` (4 arquivos) - Integração Facebook
- `TypebotServices/` (1 arquivo) - Integração Typebot
- `PartnerServices/` (7 arquivos) - Parceiros
- `CompanyService/` (11 arquivos) - Empresas
- `CompaniesSettings/` (3 arquivos) - Configurações de empresa
- `AuthServices/` (2 arquivos) - Autenticação
- `BaileysServices/` (3 arquivos) - Baileys
- `DialogChatBotsServices/` (5 arquivos) - Dialog chatbots
- `FlowCampaignService/` (5 arquivos) - Campanhas de fluxo
- `FlowDefaultService/` (3 arquivos) - Fluxos padrão
- `IntegrationsServices/` (1 arquivo) - Integrações
- `UserQueueServices/` (1 arquivo) - Filas de usuário
- `ConfigLoaderService/` (1 arquivo) - Carregador de config

**Padrão:**
```typescript
class Service {
  async execute(data) {
    // Validações
    // Lógica de negócio
    // Persistência
    // Retorno
  }
}
```

---

### 🛠️ `helpers/` (27 arquivos)

Funções auxiliares reutilizáveis.

**Principais Helpers:**
- `SendMessage.ts` - Enviar mensagem WhatsApp
- `SendMessageFlow.ts` - Enviar mensagem via fluxo
- `GetWhatsapp.ts` - Obter conexão WhatsApp
- `GetTicketWbot.ts` - Obter cliente WhatsApp do ticket
- `GetWbotMessage.ts` - Obter mensagem do WhatsApp
- `CreateTokens.ts` - Criar tokens JWT
- `SendRefreshToken.ts` - Enviar refresh token
- `SerializeUser.ts` - Serializar usuário
- `CheckContactOpenTickets.ts` - Verificar tickets abertos
- `CheckContactSomeTicket.ts` - Verificar algum ticket
- `CheckSettings.ts` - Verificar configurações
- `SendMail.ts` - Enviar email
- `Mustache.ts` - Template engine
- `SetTicketMessagesAsRead.ts` - Marcar mensagens como lidas
- `UpdateTicketByRemoteJid.ts` - Atualizar ticket por remoteJid
- `UpdateDeletedUserOpenTicketsStatus.ts` - Atualizar tickets de usuário deletado
- `GetDefaultWhatsApp.ts` - Obter WhatsApp padrão
- `GetDefaultWhatsAppByUser.ts` - Obter WhatsApp padrão por usuário
- `SerializeWbotMsgId.ts` - Serializar ID de mensagem
- `addLogs.ts` - Adicionar logs
- `authState.ts` - Estado de autenticação
- `ChekIntegrations.ts` - Verificar integrações
- `cleanOrphanSessions.ts` - Limpar sessões órfãs
- `Debounce.ts` - Função debounce
- `updateUser.ts` - Atualizar usuário
- `useMultiFileAuthState.ts` - Estado de autenticação multi-arquivo

---

### 🔐 `middleware/` (5 arquivos)

Middlewares de autenticação e validação.

**Middlewares:**
- `isAuth.ts` - Verifica token JWT
- `isAuthCompany.ts` - Verifica token e empresa
- `isSuper.ts` - Verifica se é super admin
- `tokenAuth.ts` - Autenticação por token
- `envTokenAuth.ts` - Autenticação por token de ambiente

**Uso:**
```typescript
routes.get('/protected', isAuth, controller.index);
routes.post('/admin', isSuper, controller.store);
```

---

### 📚 `libs/` (6 arquivos)

Bibliotecas customizadas.

**Bibliotecas:**
- `wbot.ts` - Cliente WhatsApp (Baileys)
  - Inicialização de sessões
  - Envio de mensagens
  - Recebimento de mensagens
  - Gerenciamento de conexão

- `socket.ts` - Configuração Socket.IO
  - Inicialização do servidor Socket.IO
  - Eventos de conexão/desconexão
  - Broadcast de eventos

- `queue.ts` - Sistema de filas (Bull)
  - Configuração de filas
  - Processamento de jobs
  - Retry e falhas

- `cache.ts` - Sistema de cache
  - Cache em memória
  - Cache Redis
  - TTL e invalidação

- `store.ts` - Store para WhatsApp
  - Persistência de sessões
  - Autenticação multi-arquivo
  - Gerenciamento de estado

---

### 🗄️ `database/`

#### `migrations/` (265 arquivos)
Migrações do Sequelize para criar/alterar tabelas.

**Exemplos:**
- `20240101000000-create-users.ts`
- `20240101000001-create-companies.ts`
- `20240101000002-create-tickets.ts`
- [263 outras migrações]

#### `seeds/` (4 arquivos)
Dados iniciais para popular o banco.

**Seeds:**
- `20240101000000-seed-users.ts`
- `20240101000001-seed-companies.ts`
- `20240101000002-seed-plans.ts`
- `20240101000003-seed-settings.ts`

---

### ⚙️ `config/` (7 arquivos)

Arquivos de configuração.

**Configs:**
- `auth.ts` - Configuração JWT
  - Secret keys
  - Tempo de expiração
  - Refresh token config

- `database.ts` - Configuração Sequelize
  - Conexão PostgreSQL
  - Pool de conexões
  - Dialect config

- `redis.ts` - Configuração Redis
  - Host e porta
  - Senha
  - Database

- `upload.ts` - Configuração upload
  - Diretório de destino
  - Tamanho máximo
  - Tipos permitidos

- `uploadExt.ts` - Configuração upload externo
- `Gn.ts` - Configuração Gerencianet
- `privateFiles.ts` - Configuração arquivos privados

---

### 🔄 `jobs/` (3 arquivos)

Jobs assíncronos para processamento em background.

**Jobs:**
- `handleMessageQueue.ts` - Processa fila de mensagens
- `handleMessageAckQueue.ts` - Processa confirmações de entrega
- `index.ts` - Inicialização de jobs

---

### 📝 `scripts/` (2 arquivos)

Scripts utilitários para manutenção.

**Scripts:**
- `cleanup-lid-contacts.js` - Limpar contatos órfãos
- `cleanup-redis-sessions.js` - Limpar sessões Redis

---

### 🛠️ `utils/` (5 arquivos)

Utilitários gerais.

**Utils:**
- `logger.ts` - Sistema de logs (Pino/Winston)
- `randomCode.ts` - Gerar códigos aleatórios
- `randomizador.ts` - Funções de randomização
- `useDate.ts` - Utilitários de data
- `version.ts` - Controle de versão

---

## 📊 Estatísticas

- **Total de Arquivos TypeScript**: ~600+
- **Controllers**: 47
- **Models**: 55
- **Routes**: 44
- **Services**: 310
- **Helpers**: 27
- **Migrations**: 265
- **Seeds**: 4

---

## 🔄 Fluxo de Requisição

```
1. Cliente HTTP Request
   ↓
2. Routes (routes/*.ts)
   ↓
3. Middleware (middleware/*.ts)
   ↓
4. Controller (controllers/*.ts)
   ↓
5. Service (services/*/Service.ts)
   ↓
6. Model (models/*.ts)
   ↓
7. Database (PostgreSQL)
   ↓
8. Response
```

---

## 📚 Próximos Passos

- [🎮 Controllers](./02-CONTROLLERS.md)
- [🗄️ Models](./03-MODELS.md)
- [🛣️ Routes](./04-ROUTES.md)
- [⚙️ Services](./05-SERVICES.md)

