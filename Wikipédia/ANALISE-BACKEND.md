# 📊 Análise Completa do Backend - Whaticket

## 🎯 Visão Geral

O backend do Whaticket é uma aplicação **Node.js/TypeScript** que utiliza **Express.js** como framework web. É um sistema de atendimento ao cliente via WhatsApp com funcionalidades avançadas de gestão de tickets, campanhas, chatbots e integrações.

---

## 🏗️ Arquitetura e Tecnologias

### Stack Principal
- **Runtime**: Node.js
- **Linguagem**: TypeScript (compilado para JavaScript em `dist/`)
- **Framework Web**: Express.js 4.17.3
- **ORM**: Sequelize 5.22.3 (com sequelize-typescript)
- **Banco de Dados**: PostgreSQL (com suporte a MySQL via configuração)
- **Cache/Filas**: Redis (Bull Queue)
- **WebSocket**: Socket.IO 4.7.4
- **WhatsApp**: Baileys (whaileys 6.4.3)

### Versão
- **Backend**: 2.2.2v-26

---

## 📁 Estrutura de Diretórios

### Organização MVC + Services

```
backend/src/
├── app.ts                 # Configuração do Express
├── server.ts              # Inicialização do servidor
├── bootstrap.ts           # Inicialização de dependências
│
├── config/                # Configurações
│   ├── auth.ts           # JWT tokens
│   ├── database.ts       # Sequelize config
│   ├── redis.ts          # Redis config
│   └── upload.ts         # Multer config
│
├── controllers/          # 47 controllers (camada HTTP)
│   ├── TicketController.ts
│   ├── MessageController.ts
│   ├── UserController.ts
│   └── ...
│
├── routes/               # 44 arquivos de rotas
│   ├── index.ts          # Agregador de rotas
│   ├── authRoutes.ts
│   ├── ticketRoutes.ts
│   └── ...
│
├── services/             # 310+ arquivos de serviços (lógica de negócio)
│   ├── TicketServices/
│   ├── MessageServices/
│   ├── WbotServices/     # WhatsApp/Baileys
│   └── ...
│
├── models/               # 55 modelos Sequelize
│   ├── Ticket.ts
│   ├── Message.ts
│   ├── User.ts
│   ├── Contact.ts
│   └── ...
│
├── middleware/           # 5 middlewares
│   ├── isAuth.ts         # JWT authentication
│   ├── isAuthCompany.ts
│   ├── tokenAuth.ts      # API token auth
│   └── ...
│
├── libs/                 # Bibliotecas compartilhadas
│   ├── socket.ts         # Socket.IO
│   ├── wbot.ts           # Baileys/WhatsApp
│   ├── cache.ts          # Redis
│   └── queue.ts          # Bull Queue
│
├── helpers/              # 27 funções auxiliares
│   ├── GetTicketWbot.ts
│   ├── SendMessage.ts
│   └── ...
│
├── database/
│   ├── migrations/       # 265 migrations
│   └── seeds/            # 4 seeds
│
├── jobs/                 # Processamento assíncrono
├── queues/               # Definição de filas Bull
└── utils/                # Utilitários (logger, etc)
```

---

## 🔐 Sistema de Autenticação

### Tipos de Autenticação

1. **JWT (JSON Web Token)** - Para usuários
   - Middleware: `isAuth`
   - Header: `Authorization: Bearer <token>`
   - Payload: `{ id, username, profile, companyId }`
   - Refresh Token disponível

2. **Token de API** - Para integrações externas
   - Middleware: `tokenAuth`
   - Token armazenado no modelo `Whatsapp`
   - Usado em rotas `/api/messages/*`

3. **Token de Ambiente** - Para operações administrativas
   - Middleware: `envTokenAuth`
   - Variável: `ENV_TOKEN`

### Endpoints de Autenticação

```typescript
POST   /auth/signup          # Criar usuário
POST   /auth/login           # Login (retorna token + refreshToken)
POST   /auth/refresh_token   # Renovar token
DELETE /auth/logout          # Logout
GET    /auth/me              # Dados do usuário autenticado
```

---

## 🛣️ Principais Rotas da API

### Autenticação
- `/auth/*` - Login, signup, refresh token

### Tickets (Atendimento)
- `GET    /tickets` - Listar tickets
- `GET    /tickets/:ticketId` - Detalhes do ticket
- `POST   /tickets` - Criar ticket
- `PUT    /tickets/:ticketId` - Atualizar ticket
- `DELETE /tickets/:ticketId` - Deletar ticket
- `GET    /ticket/kanban` - Visualização Kanban
- `GET    /ticketreport/reports` - Relatórios

### Mensagens
- `GET    /messages/:ticketId` - Listar mensagens de um ticket
- `POST   /messages/:ticketId` - Enviar mensagem (com upload de mídia)
- `DELETE /messages/:messageId` - Deletar mensagem
- `POST   /messages/edit/:messageId` - Editar mensagem
- `POST   /message/forward` - Encaminhar mensagem

### WhatsApp
- Rotas para gerenciar conexões WhatsApp (Baileys)
- Sessões, QR codes, status de conexão

### Contatos
- CRUD completo de contatos
- Listas de contatos
- Importação de contatos

### Campanhas
- Criação e gerenciamento de campanhas
- Envio em massa
- Agendamento

### Filas (Queues)
- Gerenciamento de filas de atendimento
- Distribuição de tickets
- Integrações com filas

### Chatbots
- Criação e configuração de chatbots
- Fluxos conversacionais

### Flow Builder
- Construção de fluxos interativos
- Campanhas com fluxos

### Webhooks
- `/webhook/*` - Recebimento de webhooks externos

### API Externa
- `/api/messages/send` - Envio via API (token auth)
- `/api/messages/checkNumber` - Verificar número
- `/api/companies/*` - Endpoints para empresas
- `/api/contacts/*` - Endpoints para contatos

### Outros Módulos
- **Tags**: Sistema de etiquetas
- **Agendamentos**: Mensagens agendadas
- **Relatórios**: Estatísticas e dashboards
- **Arquivos**: Upload e gerenciamento de arquivos
- **Configurações**: Settings da empresa
- **Planos**: Sistema de assinaturas
- **Faturas**: Invoices

---

## 💾 Modelos de Dados Principais

### Entidades Core

1. **User** - Usuários do sistema
   - Campos: id, name, email, profile, companyId, queues, etc.
   - Perfis: admin, user
   - Relacionamentos: Company, Queues, Tickets

2. **Company** - Empresas (multi-tenant)
   - Sistema multi-tenant
   - Cada empresa tem seus próprios dados

3. **Ticket** - Tickets de atendimento
   - Campos: status, contactId, userId, whatsappId, queueId
   - Status: pending, open, closed
   - Relacionamentos: Contact, User, Whatsapp, Queue, Messages, Tags

4. **Message** - Mensagens
   - Armazena mensagens do WhatsApp
   - Suporta texto, mídia, áudio, etc.

5. **Contact** - Contatos
   - Dados dos clientes
   - Campos customizados disponíveis

6. **Whatsapp** - Conexões WhatsApp
   - Uma conexão por instância
   - Token para API
   - Status de conexão

7. **Queue** - Filas de atendimento
   - Distribuição de tickets
   - Integrações disponíveis

### Outros Modelos Importantes
- **Campaign** - Campanhas de marketing
- **Chatbot** - Chatbots configurados
- **Tag** - Sistema de etiquetas
- **Schedule** - Agendamentos
- **QuickMessage** - Mensagens rápidas
- **FlowBuilder** - Fluxos interativos
- **Webhook** - Configurações de webhooks

---

## 🔄 Comunicação em Tempo Real (Socket.IO)

### Estrutura
- **Namespaces**: Um por `companyId` (`/${companyId}`)
- **Rooms**: Tickets, notificações, status

### Eventos do Cliente
```typescript
socket.on("joinChatBox", ticketId)        // Entrar em um ticket
socket.on("joinNotification")             // Receber notificações
socket.on("joinTickets", status)          // Filtrar por status
socket.on("joinTicketsLeave", status)    // Sair de um filtro
socket.on("joinChatBoxLeave", ticketId)   // Sair de um ticket
```

### Eventos do Servidor
- Notificações de novos tickets
- Atualizações de mensagens
- Mudanças de status
- Atualizações de conexões WhatsApp

---

## 🔌 Integrações e Bibliotecas Externas

### WhatsApp
- **Baileys (whaileys)**: Biblioteca para conexão WhatsApp Web
- Sessões armazenadas em Redis
- Suporte a múltiplas conexões por empresa

### Processamento de Mídia
- **FFmpeg**: Conversão de áudio/vídeo
- **Jimp**: Processamento de imagens
- **file-type**: Detecção de tipo de arquivo

### IA e Processamento
- **OpenAI**: Integração com GPT
- **Google Dialogflow**: Chatbots
- **Microsoft Cognitive Services**: Speech-to-text

### Outros
- **Supabase**: Armazenamento em nuvem
- **Puppeteer**: Automação de navegador
- **Bull**: Sistema de filas
- **Sentry**: Monitoramento de erros

---

## 📦 Dependências Principais

### Core
- `express` - Framework web
- `sequelize` + `sequelize-typescript` - ORM
- `socket.io` - WebSocket
- `jsonwebtoken` - JWT
- `bcryptjs` - Hash de senhas
- `multer` - Upload de arquivos

### WhatsApp
- `whaileys` - Cliente WhatsApp
- `@adiwajshing/keyed-db` - Banco de dados chaveado

### Filas e Cache
- `bull` - Sistema de filas
- `redis` (via configuração)
- `node-cache` - Cache em memória

### Utilitários
- `date-fns` - Manipulação de datas
- `axios` - HTTP client
- `uuid` - Geração de UUIDs
- `yup` - Validação de schemas

---

## 🔧 Configurações Importantes

### Variáveis de Ambiente Necessárias

```env
# Servidor
PORT=8080
FRONTEND_URL=http://localhost:3000

# Banco de Dados
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whaticket
DB_USER=postgres
DB_PASS=password
DB_POOL_MAX=100
DB_POOL_MIN=15

# Autenticação
JWT_SECRET=your-secret-key
ENV_TOKEN=your-env-token

# Redis
REDIS_URI_ACK=redis://localhost:6379

# Upload
UPLOAD_DIR=./public

# Sentry (opcional)
SENTRY_DSN=your-sentry-dsn

# Bull Board (opcional)
BULL_BOARD=true
BULL_USER=admin
BULL_PASS=password
```

---

## 🚀 Scripts Disponíveis

```json
{
  "build": "tsc",                    // Compilar TypeScript
  "watch": "tsc -w",                 // Watch mode
  "start": "nodemon dist/server.js", // Produção
  "dev:server": "ts-node-dev ...",   // Desenvolvimento
  "db:migrate": "sequelize db:migrate",
  "db:seed": "sequelize db:seed:all",
  "test": "jest",
  "lint": "eslint src/**/*.ts"
}
```

---

## 📡 Padrões de Resposta da API

### Sucesso
```json
{
  "id": 1,
  "name": "Exemplo",
  ...
}
```

### Erro
```json
{
  "error": "ERR_SESSION_EXPIRED"
}
```

### Erros Customizados
- `ERR_SESSION_EXPIRED` (401)
- `ERR_INVALID_CREDENTIALS` (401)
- `ERR_OUT_OF_HOURS` (401)
- `ERR_SYSTEM_INVALID` (401)

---

## 🔍 Pontos de Atenção para Atualização do Frontend

### 1. Autenticação
- ✅ JWT com Bearer token
- ✅ Refresh token disponível
- ✅ Headers: `Authorization: Bearer <token>`
- ✅ Cookies para refresh token

### 2. CORS
- Configurado para `FRONTEND_URL`
- Credentials habilitado

### 3. Upload de Arquivos
- Endpoint: `POST /messages/:ticketId`
- FormData com campo `medias[]`
- Limite: 5MB

### 4. WebSocket
- Namespace: `/${companyId}`
- Query param: `userId` na conexão
- Rooms para tickets e notificações

### 5. Paginação
- Verificar padrão usado nos controllers
- Provavelmente query params: `page`, `limit`

### 6. Filtros e Busca
- Verificar implementação em cada controller
- Possivelmente query params

### 7. Formato de Datas
- Timezone: `America/Sao_Paulo`
- Formato: Verificar uso de `date-fns`

### 8. Tratamento de Erros
- Status codes HTTP padrão
- Mensagens de erro em `error` field
- Sentry para monitoramento

---

## 🎯 Recomendações para o Novo Frontend

1. **Cliente HTTP**
   - Axios ou Fetch com interceptors
   - Refresh token automático
   - Tratamento centralizado de erros

2. **WebSocket**
   - Socket.IO client
   - Reconexão automática
   - Gerenciamento de rooms

3. **Estado Global**
   - Context API ou Redux/Zustand
   - Cache de dados do usuário
   - Sincronização com WebSocket

4. **Upload de Arquivos**
   - Suporte a múltiplos arquivos
   - Preview antes do envio
   - Progress bar

5. **Autenticação**
   - Armazenar token seguro (httpOnly cookies ou secure storage)
   - Refresh automático antes de expirar
   - Logout em caso de 401

6. **TypeScript**
   - Tipar todas as respostas da API
   - Interfaces para models
   - Type-safe API client

---

## 📝 Notas Finais

- Backend bem estruturado e organizado
- Sistema multi-tenant (Company-based)
- Arquitetura escalável com filas e cache
- Suporte a múltiplas conexões WhatsApp
- Sistema robusto de autenticação e autorização
- WebSocket para atualizações em tempo real
- Extensível com webhooks e APIs externas

O backend está pronto para receber um frontend moderno. Todas as APIs REST estão bem definidas e o sistema de WebSocket permite atualizações em tempo real sem polling.

