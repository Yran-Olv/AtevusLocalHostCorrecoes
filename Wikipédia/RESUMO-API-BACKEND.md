# 📋 Resumo Executivo - APIs do Backend

## 🎯 Base URL
```
http://localhost:8080
```

## 🔐 Autenticação

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "serializedUser": {
    "id": 1,
    "name": "Usuário",
    "email": "user@example.com",
    "profile": "admin",
    "companyId": 1,
    "token": "jwt-token-here",
    ...
  },
  "token": "access-token",
  "refreshToken": "refresh-token"
}
```

### Usar Token
```http
Authorization: Bearer <access-token>
```

---

## 📦 Principais Endpoints

### Tickets

```http
GET    /tickets                    # Listar tickets
GET    /tickets/:ticketId          # Detalhes do ticket
POST   /tickets                   # Criar ticket
PUT    /tickets/:ticketId         # Atualizar ticket
DELETE /tickets/:ticketId         # Deletar ticket
GET    /ticket/kanban             # Visualização Kanban
GET    /ticketreport/reports       # Relatórios
```

**Query Params (listar):**
- `searchParam`: Busca
- `pageNumber`: Página
- `status`: Filtro por status (pending, open, closed)

### Mensagens

```http
GET    /messages/:ticketId        # Listar mensagens
POST   /messages/:ticketId        # Enviar mensagem
DELETE /messages/:messageId       # Deletar mensagem
POST   /messages/edit/:messageId  # Editar mensagem
POST   /message/forward           # Encaminhar mensagem
```

**Enviar Mensagem (POST):**
```http
POST /messages/:ticketId
Content-Type: multipart/form-data
Authorization: Bearer <token>

body: "Texto da mensagem"
medias: [arquivos...]  # Array de arquivos
```

### Contatos

```http
GET    /contacts                  # Listar contatos
GET    /contacts/:contactId      # Detalhes do contato
POST   /contacts                 # Criar contato
PUT    /contacts/:contactId      # Atualizar contato
DELETE /contacts/:contactId      # Deletar contato
```

### WhatsApp

```http
GET    /whatsapp                 # Listar conexões
GET    /whatsapp/:whatsappId     # Detalhes da conexão
POST   /whatsapp                 # Criar conexão
PUT    /whatsapp/:whatsappId     # Atualizar conexão
DELETE /whatsapp/:whatsappId     # Deletar conexão
```

### Sessões WhatsApp

```http
POST   /whatsapp-session/:whatsappId  # Conectar/Desconectar
GET    /whatsapp-session/:whatsappId  # Status da sessão
```

### Filas (Queues)

```http
GET    /queues                   # Listar filas
GET    /queues/:queueId          # Detalhes da fila
POST   /queues                   # Criar fila
PUT    /queues/:queueId          # Atualizar fila
DELETE /queues/:queueId          # Deletar fila
```

### Campanhas

```http
GET    /campaigns                # Listar campanhas
GET    /campaigns/:campaignId    # Detalhes da campanha
POST   /campaigns                # Criar campanha
PUT    /campaigns/:campaignId    # Atualizar campanha
DELETE /campaigns/:campaignId    # Deletar campanha
POST   /campaigns/:campaignId/cancel    # Cancelar campanha
POST   /campaigns/:campaignId/restart   # Reiniciar campanha
```

### Chatbots

```http
GET    /chatbots                 # Listar chatbots
GET    /chatbots/:chatbotId     # Detalhes do chatbot
POST   /chatbots                 # Criar chatbot
PUT    /chatbots/:chatbotId     # Atualizar chatbot
DELETE /chatbots/:chatbotId     # Deletar chatbot
```

### Tags

```http
GET    /tags                     # Listar tags
GET    /tags/:tagId             # Detalhes da tag
POST   /tags                     # Criar tag
PUT    /tags/:tagId             # Atualizar tag
DELETE /tags/:tagId             # Deletar tag
```

### Usuários

```http
GET    /users                    # Listar usuários
GET    /users/:userId           # Detalhes do usuário
POST   /users                    # Criar usuário
PUT    /users/:userId           # Atualizar usuário
DELETE /users/:userId           # Deletar usuário
```

### Dashboard

```http
GET    /dashboard                # Dados do dashboard
GET    /statistics               # Estatísticas
```

### Agendamentos

```http
GET    /schedules                # Listar agendamentos
POST   /schedules                # Criar agendamento
PUT    /schedules/:scheduleId    # Atualizar agendamento
DELETE /schedules/:scheduleId    # Deletar agendamento
```

### Mensagens Rápidas

```http
GET    /quick-messages           # Listar mensagens rápidas
POST   /quick-messages           # Criar mensagem rápida
PUT    /quick-messages/:id      # Atualizar mensagem rápida
DELETE /quick-messages/:id      # Deletar mensagem rápida
```

---

## 🔌 API Externa (Token Auth)

### Enviar Mensagem via API

```http
POST /api/messages/send
Authorization: Bearer <whatsapp-token>
Content-Type: multipart/form-data

{
  "number": "5511999999999",
  "body": "Mensagem de texto",
  "whatsappId": 1,
  "medias": [arquivos...]  # Opcional
}
```

### Verificar Número

```http
POST /api/messages/checkNumber
Authorization: Bearer <whatsapp-token>
Content-Type: application/json

{
  "number": "5511999999999"
}
```

### Enviar Imagem por Link

```http
POST /api/messages/send/linkImage
Authorization: Bearer <whatsapp-token>
Content-Type: application/json

{
  "number": "5511999999999",
  "imageUrl": "https://example.com/image.jpg",
  "caption": "Legenda opcional"
}
```

---

## 🔄 WebSocket (Socket.IO)

### Conexão
```javascript
const socket = io(`http://localhost:8080/${companyId}`, {
  query: { userId: user.id }
});
```

### Eventos do Cliente

```javascript
// Entrar em um ticket
socket.emit("joinChatBox", ticketId);

// Receber notificações
socket.emit("joinNotification");

// Filtrar tickets por status
socket.emit("joinTickets", "pending");

// Sair de um filtro
socket.emit("joinTicketsLeave", "pending");

// Sair de um ticket
socket.emit("joinChatBoxLeave", ticketId);
```

### Eventos do Servidor

```javascript
// Novo ticket
socket.on("ticket", (data) => {
  // data: { ticket, contact, ... }
});

// Nova mensagem
socket.on("appMessage", (data) => {
  // data: { message, ticket, ... }
});

// Atualização de ticket
socket.on("ticketUpdate", (data) => {
  // data: { ticket, ... }
});

// Notificações
socket.on("notification", (data) => {
  // data: { ... }
});
```

---

## 📊 Estruturas de Dados Principais

### Ticket
```typescript
{
  id: number;
  status: "pending" | "open" | "closed";
  unreadMessages: number;
  lastMessage: string;
  contactId: number;
  userId: number;
  whatsappId: number;
  queueId: number;
  companyId: number;
  uuid: string;
  channel: string;
  isGroup: boolean;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
  contact: Contact;
  user: User;
  whatsapp: Whatsapp;
  queue: Queue;
  messages: Message[];
  tags: Tag[];
}
```

### Message
```typescript
{
  id: number;
  body: string;
  ack: number;
  read: boolean;
  mediaType: string;
  mediaUrl: string;
  ticketId: number;
  contactId: number;
  fromMe: boolean;
  quotedMsgId: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Contact
```typescript
{
  id: number;
  name: string;
  number: string;
  email: string;
  profilePicUrl: string;
  companyId: number;
  extraInfo: JSON;
  createdAt: Date;
  updatedAt: Date;
}
```

### User
```typescript
{
  id: number;
  name: string;
  email: string;
  profile: "admin" | "user";
  companyId: number;
  profileImage: string;
  defaultTheme: "light" | "dark";
  queues: Queue[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## ⚠️ Códigos de Erro Comuns

| Código | Descrição |
|--------|-----------|
| `ERR_SESSION_EXPIRED` | Token expirado ou inválido |
| `ERR_INVALID_CREDENTIALS` | Credenciais inválidas |
| `ERR_OUT_OF_HOURS` | Fora do horário de trabalho |
| `ERR_SYSTEM_INVALID` | Sistema inválido |

---

## 📝 Notas Importantes

1. **Paginação**: A maioria dos endpoints de listagem aceita `pageNumber` e `searchParam`
2. **Upload**: Limite de 5MB por arquivo
3. **Timezone**: Todas as datas são em `America/Sao_Paulo`
4. **CORS**: Configurado para `FRONTEND_URL`
5. **Cookies**: Refresh token pode ser enviado via cookie
6. **Multi-tenant**: Todos os dados são filtrados por `companyId` automaticamente

---

## 🚀 Exemplo de Uso Completo

```typescript
// 1. Login
const loginResponse = await fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
const { token, refreshToken } = await loginResponse.json();

// 2. Listar Tickets
const ticketsResponse = await fetch('http://localhost:8080/tickets?pageNumber=1', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const tickets = await ticketsResponse.json();

// 3. Enviar Mensagem
const formData = new FormData();
formData.append('body', 'Olá!');
formData.append('medias', file);

const messageResponse = await fetch(`http://localhost:8080/messages/${ticketId}`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

// 4. WebSocket
const socket = io(`http://localhost:8080/${companyId}`, {
  query: { userId: user.id }
});

socket.emit('joinChatBox', ticketId);
socket.on('appMessage', (data) => {
  console.log('Nova mensagem:', data);
});
```

