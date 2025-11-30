# 🗄️ Backend - Models (Banco de Dados)

## 📋 Visão Geral

Models são as entidades do banco de dados usando Sequelize ORM. Eles definem a estrutura das tabelas, relacionamentos e validações.

**Total**: 55 models  
**ORM**: Sequelize + Sequelize-TypeScript  
**Banco**: PostgreSQL

---

## 📊 Principais Models

### 1. **User.ts** - Usuários
```typescript
{
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  profile: "admin" | "user";
  companyId: number;
  profileImage?: string;
  defaultTheme: "light" | "dark";
  tokenVersion: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  tickets: Ticket[];
  queues: Queue[];
  whatsapps: Whatsapp[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `HasMany` Tickets
- `BelongsToMany` Queues (via UserQueue)
- `HasMany` QuickMessages
- `HasMany` Chatbots

---

### 2. **Company.ts** - Empresas (Multi-tenant)
```typescript
{
  id: number;
  name: string;
  phone: string;
  email: string;
  document: string;
  paymentMethod: string;
  status: boolean;
  dueDate: Date;
  planId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  plan: Plan;
  users: User[];
  tickets: Ticket[];
  contacts: Contact[];
  whatsapps: Whatsapp[];
  queues: Queue[];
  settings: Setting[];
}
```

**Relacionamentos:**
- `BelongsTo` Plan
- `HasMany` Users
- `HasMany` Tickets
- `HasMany` Contacts
- `HasMany` Whatsapps
- `HasMany` Queues
- `HasMany` Settings

---

### 3. **Ticket.ts** - Tickets de Atendimento
```typescript
{
  id: number;
  uuid: string;
  status: "pending" | "open" | "closed" | "group";
  unreadMessages: number;
  lastMessage?: string;
  contactId: number;
  userId?: number;
  whatsappId?: number;
  queueId?: number;
  companyId: number;
  channel: "whatsapp" | "facebook" | "instagram" | "telegram";
  isGroup: boolean;
  isBot: boolean;
  lastFlowId?: string;
  flowWebhook: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  contact: Contact;
  user: User;
  whatsapp: Whatsapp;
  queue: Queue;
  company: Company;
  messages: Message[];
  tags: Tag[];
}
```

**Relacionamentos:**
- `BelongsTo` Contact
- `BelongsTo` User
- `BelongsTo` Whatsapp
- `BelongsTo` Queue
- `BelongsTo` Company
- `HasMany` Messages
- `BelongsToMany` Tags (via TicketTag)

---

### 4. **Message.ts** - Mensagens
```typescript
{
  id: number;
  remoteJid: string;
  participant?: string;
  dataJson: string;
  ack: number;              // 0=pending, 1=delivered, 2=read, 3=error
  read: boolean;
  fromMe: boolean;
  body: string;
  mediaUrl?: string;
  mediaType?: string;
  quotedMsgId?: number;
  ticketId: number;
  contactId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  ticket: Ticket;
  contact: Contact;
  company: Company;
  quotedMsg?: Message;
}
```

**Relacionamentos:**
- `BelongsTo` Ticket
- `BelongsTo` Contact
- `BelongsTo` Company
- `BelongsTo` Message (quotedMsg)

---

### 5. **Contact.ts** - Contatos
```typescript
{
  id: number;
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  extraInfo?: JSON;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  tickets: Ticket[];
  messages: Message[];
  tags: Tag[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `HasMany` Tickets
- `HasMany` Messages
- `BelongsToMany` Tags (via ContactTag)

---

### 6. **Whatsapp.ts** - Conexões WhatsApp
```typescript
{
  id: number;
  name: string;
  session?: string;
  qrcode?: string;
  status: "DISCONNECTED" | "CONNECTED" | "OPENING" | "PAIRING";
  battery?: number;
  plugged?: boolean;
  retries: number;
  greetingMessage?: string;
  farewellMessage?: string;
  complationMessage?: string;
  ratingMessage?: string;
  companyId: number;
  isDefault: boolean;
  groupAsTicket: "enabled" | "disabled";
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  tickets: Ticket[];
  queues: Queue[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `HasMany` Tickets
- `BelongsToMany` Queues (via WhatsappQueue)

---

### 7. **Queue.ts** - Filas de Atendimento
```typescript
{
  id: number;
  name: string;
  color: string;
  greetingMessage?: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  tickets: Ticket[];
  users: User[];
  whatsapps: Whatsapp[];
  options: QueueOption[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `HasMany` Tickets
- `BelongsToMany` Users (via UserQueue)
- `BelongsToMany` Whatsapps (via WhatsappQueue)
- `HasMany` QueueOptions

---

### 8. **Tag.ts** - Tags
```typescript
{
  id: number;
  name: string;
  color: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  tickets: Ticket[];
  contacts: Contact[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `BelongsToMany` Tickets (via TicketTag)
- `BelongsToMany` Contacts (via ContactTag)

---

### 9. **Campaign.ts** - Campanhas
```typescript
{
  id: number;
  name: string;
  message?: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "FINALIZADA" | "CANCELADA";
  scheduledAt?: Date;
  companyId: number;
  contactListId?: number;
  whatsappId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  contactList: ContactList;
  whatsapp: Whatsapp;
  shippings: CampaignShipping[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `BelongsTo` ContactList
- `BelongsTo` Whatsapp
- `HasMany` CampaignShippings

---

### 10. **FlowBuilder.ts** - Fluxos Conversacionais
```typescript
{
  id: number;
  name: string;
  flowJson: JSON;           // Estrutura do fluxo
  companyId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` Company

---

### 11. **Chat.ts** - Sistema de Chat
```typescript
{
  id: number;
  uuid: string;
  title?: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  messages: ChatMessage[];
  users: ChatUser[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `HasMany` ChatMessages
- `HasMany` ChatUsers

---

### 12. **Chatbot.ts** - Chatbots
```typescript
{
  id: number;
  name: string;
  type: "text" | "button" | "list";
  greetingMessage?: string;
  companyId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  user: User;
  dialogs: DialogChatBot[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `BelongsTo` User
- `HasMany` DialogChatBots

---

### 13. **Schedule.ts** - Agendamentos
```typescript
{
  id: number;
  body: string;
  sendAt: Date;
  sentAt?: Date;
  contactId: number;
  ticketId?: number;
  userId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  contact: Contact;
  ticket?: Ticket;
  user: User;
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` Contact
- `BelongsTo` Ticket
- `BelongsTo` User
- `BelongsTo` Company

---

### 14. **QuickMessage.ts** - Mensagens Rápidas
```typescript
{
  id: number;
  shortcode: string;
  message: string;
  companyId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  user: User;
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `BelongsTo` User

---

### 15. **Plan.ts** - Planos de Assinatura
```typescript
{
  id: number;
  name: string;
  amount: number;
  users: number;
  connections: number;
  queues: number;
  useOpenAi: boolean;
  useDialogflow: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  companies: Company[];
}
```

**Relacionamentos:**
- `HasMany` Companies

---

### 16. **Setting.ts** - Configurações
```typescript
{
  id: number;
  key: string;
  value: string;
  companyId?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Relacionamentos:**
- `BelongsTo` Company (opcional)

---

### 17. **Webhook.ts** - Webhooks
```typescript
{
  id: number;
  url: string;
  type: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  headers?: JSON;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` Company

---

### 18. **ContactList.ts** - Listas de Contatos
```typescript
{
  id: number;
  name: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  items: ContactListItem[];
}
```

**Relacionamentos:**
- `BelongsTo` Company
- `HasMany` ContactListItems

---

### 19. **ContactListItem.ts** - Itens de Lista
```typescript
{
  id: number;
  name: string;
  number: string;
  email?: string;
  contactListId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  contactList: ContactList;
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` ContactList
- `BelongsTo` Company

---

### 20. **Prompt.ts** - Prompts de IA
```typescript
{
  id: number;
  name: string;
  prompt: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` Company

---

### 21. **Files.ts** - Arquivos
```typescript
{
  id: number;
  name: string;
  path: string;
  type: string;
  size: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` Company

---

### 22. **QueueIntegration.ts** - Integrações de Fila
```typescript
{
  id: number;
  name: string;
  type: string;
  config: JSON;
  queueId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  queue: Queue;
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` Queue
- `BelongsTo` Company

---

### 23. **QueueOption.ts** - Opções de Fila
```typescript
{
  id: number;
  title: string;
  message: string;
  option: number;
  queueId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  queue: Queue;
}
```

**Relacionamentos:**
- `BelongsTo` Queue

---

### 24. **TicketNote.ts** - Notas de Ticket
```typescript
{
  id: number;
  note: string;
  ticketId: number;
  userId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  ticket: Ticket;
  user: User;
  company: Company;
}
```

**Relacionamentos:**
- `BelongsTo` Ticket
- `BelongsTo` User
- `BelongsTo` Company

---

### 25. **TicketTag.ts** - Tags de Ticket (Tabela Pivô)
```typescript
{
  ticketId: number;
  tagId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 26. **ContactTag.ts** - Tags de Contato (Tabela Pivô)
```typescript
{
  contactId: number;
  tagId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 27. **UserQueue.ts** - Usuários de Fila (Tabela Pivô)
```typescript
{
  userId: number;
  queueId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 28. **WhatsappQueue.ts** - WhatsApps de Fila (Tabela Pivô)
```typescript
{
  whatsappId: number;
  queueId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 29. **Announcement.ts** - Anúncios
```typescript
{
  id: number;
  title: string;
  text: string;
  priority: "low" | "normal" | "high";
  companyId?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 30. **Help.ts** - Sistema de Ajuda
```typescript
{
  id: number;
  title: string;
  description: string;
  video?: string;
  companyId?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 31. **Subscription.ts** - Assinaturas
```typescript
{
  id: number;
  companyId: number;
  planId: number;
  status: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
  plan: Plan;
}
```

---

### 32. **Invoices.ts** - Faturas
```typescript
{
  id: number;
  companyId: number;
  amount: number;
  status: string;
  dueDate: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Relacionamentos
  company: Company;
}
```

---

### 33. **TicketTraking.ts** - Rastreamento de Ticket
```typescript
{
  id: number;
  ticketId: number;
  userId?: number;
  queueId?: number;
  whatsappId?: number;
  companyId: number;
  startedAt: Date;
  finishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 34. **LogTicket.ts** - Logs de Ticket
```typescript
{
  id: number;
  ticketId: number;
  userId?: number;
  queueId?: number;
  type: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 35. **UserRating.ts** - Avaliações de Usuário
```typescript
{
  id: number;
  userId: number;
  ticketId: number;
  rating: number;
  comment?: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 36. **Baileys.ts** - Sessões Baileys
```typescript
{
  id: number;
  whatsappId: number;
  session: string;
  data: JSON;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 37. **ChatMessage.ts** - Mensagens de Chat
```typescript
{
  id: number;
  chatId: number;
  senderId: number;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 38. **ChatUser.ts** - Usuários de Chat
```typescript
{
  id: number;
  chatId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 39. **DialogChatBot.ts** - Diálogos de Chatbot
```typescript
{
  id: number;
  chatbotId: number;
  trigger: string;
  response: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 40. **FlowDefault.ts** - Fluxos Padrão
```typescript
{
  id: number;
  name: string;
  flowJson: JSON;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 41. **FlowCampaign.ts** - Campanhas de Fluxo
```typescript
{
  id: number;
  flowId: number;
  campaignId: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 42. **FlowAudio.ts** - Áudios de Fluxo
```typescript
{
  id: number;
  flowId: number;
  audioUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 43. **FlowImg.ts** - Imagens de Fluxo
```typescript
{
  id: number;
  flowId: number;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 44. **CampaignSetting.ts** - Configurações de Campanha
```typescript
{
  id: number;
  campaignId: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 45. **CampaignShipping.ts** - Envios de Campanha
```typescript
{
  id: number;
  campaignId: number;
  contactId: number;
  status: string;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 46. **ContactCustomField.ts** - Campos Customizados de Contato
```typescript
{
  id: number;
  contactId: number;
  name: string;
  value: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 47. **ContactWallet.ts** - Carteira de Contato
```typescript
{
  id: number;
  contactId: number;
  balance: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 48. **ScheduledMessages.ts** - Mensagens Agendadas
```typescript
{
  id: number;
  body: string;
  sendAt: Date;
  sentAt?: Date;
  contactId: number;
  ticketId?: number;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 49. **ScheduledMessagesEnvio.ts** - Envios Agendados
```typescript
{
  id: number;
  scheduledMessageId: number;
  status: string;
  sentAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 50. **Integrations.ts** - Integrações
```typescript
{
  id: number;
  name: string;
  type: string;
  config: JSON;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 51. **FilesOptions.ts** - Opções de Arquivo
```typescript
{
  id: number;
  fileId: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 52. **Versions.ts** - Versões do Sistema
```typescript
{
  id: number;
  version: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 53. **ApiUsages.ts** - Uso da API
```typescript
{
  id: number;
  endpoint: string;
  method: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 54. **Partner.ts** - Parceiros
```typescript
{
  id: number;
  name: string;
  token: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 55. **CompaniesSettings.ts** - Configurações de Empresa
```typescript
{
  id: number;
  companyId: number;
  key: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔗 Relacionamentos Principais

### Hierarquia Multi-tenant
```
Company (1) ──→ (N) Users
Company (1) ──→ (N) Tickets
Company (1) ──→ (N) Contacts
Company (1) ──→ (N) Whatsapps
Company (1) ──→ (N) Queues
```

### Fluxo de Ticket
```
Contact (1) ──→ (N) Tickets
Ticket (1) ──→ (N) Messages
Ticket (N) ──→ (N) Tags (via TicketTag)
Ticket (N) ──→ (1) User
Ticket (N) ──→ (1) Queue
Ticket (N) ──→ (1) Whatsapp
```

### Sistema de Filas
```
Queue (1) ──→ (N) Tickets
Queue (N) ──→ (N) Users (via UserQueue)
Queue (N) ──→ (N) Whatsapps (via WhatsappQueue)
Queue (1) ──→ (N) QueueOptions
```

---

## 📝 Decoradores Sequelize-TypeScript

### Principais Decoradores

```typescript
@Table                    // Define como tabela
@PrimaryKey              // Chave primária
@AutoIncrement          // Auto-incremento
@Column                 // Coluna
@ForeignKey             // Chave estrangeira
@BelongsTo              // Relacionamento N:1
@HasMany                // Relacionamento 1:N
@BelongsToMany          // Relacionamento N:N
@CreatedAt              // Data de criação
@UpdatedAt              // Data de atualização
@Default                 // Valor padrão
@AllowNull              // Permite null
@BeforeCreate           // Hook antes de criar
@BeforeUpdate           // Hook antes de atualizar
@BeforeDestroy          // Hook antes de deletar
```

---

## 🔄 Hooks e Validações

### Exemplo de Hook

```typescript
@BeforeCreate
static hashPassword = async (user: User): Promise<void> => {
  if (user.password) {
    user.passwordHash = await hash(user.password, 8);
  }
};
```

---

## 📚 Próximos Passos

- [🛣️ Routes](./04-ROUTES.md)
- [⚙️ Services](./05-SERVICES.md)
- [🔌 WebSocket](./06-WEBSOCKET.md)

