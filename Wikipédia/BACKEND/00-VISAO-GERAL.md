# 🔧 Backend - Visão Geral

## 📋 Informações Gerais

**Tecnologia**: Node.js + TypeScript  
**Framework**: Express.js  
**ORM**: Sequelize  
**Banco de Dados**: PostgreSQL  
**Cache**: Redis  
**WebSocket**: Socket.IO  
**Versão**: 2.2.2v-26

---

## 🏗️ Arquitetura

O backend segue uma arquitetura em camadas:

```
┌─────────────────────────────────────┐
│         Routes (Rotas)              │
│    Define endpoints da API           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Controllers                     │
│    Validação e controle de fluxo     │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Services                        │
│    Lógica de negócio                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Models                         │
│    Entidades do banco de dados       │
└─────────────────────────────────────┘
```

---

## 📦 Principais Funcionalidades

### 1. **Autenticação & Autorização**
- JWT (JSON Web Tokens)
- Refresh Tokens
- Multi-tenant (por empresa)
- Controle de permissões (admin/user)

### 2. **Gestão de Tickets**
- Criação, atualização, fechamento
- Atribuição a usuários
- Filtros por status, fila, tags
- Histórico completo

### 3. **Mensagens**
- Envio/recebimento via WhatsApp
- Suporte a mídias (imagens, vídeos, áudios, documentos)
- Mensagens agendadas
- Mensagens rápidas (templates)

### 4. **WhatsApp Integration**
- Conexão via Baileys (API não oficial)
- Suporte a múltiplas conexões
- Gerenciamento de sessões
- QR Code para autenticação

### 5. **Campanhas**
- Criação e gerenciamento de campanhas
- Envio em massa
- Relatórios de entrega
- Controle de status

### 6. **FlowBuilder**
- Criação de fluxos conversacionais
- Condicionais e lógicas
- Integração com chatbots
- Automação de atendimento

### 7. **Chatbots & IA**
- Integração com OpenAI
- Dialogflow (Google)
- Chatbots customizados
- Prompts configuráveis

### 8. **Filas (Queues)**
- Distribuição de tickets
- Horários de atendimento
- Integrações externas
- Opções de fila

### 9. **Contatos & Listas**
- Gerenciamento de contatos
- Listas de contatos
- Campos customizados
- Importação em massa

### 10. **Relatórios & Estatísticas**
- Dashboard com métricas
- Relatórios de tickets
- Estatísticas de atendimento
- Análise de performance

---

## 🔌 Tecnologias Principais

### Core
- **Express.js**: Framework web
- **TypeScript**: Linguagem principal
- **Sequelize**: ORM para PostgreSQL
- **Socket.IO**: WebSocket para tempo real

### WhatsApp
- **Baileys (whaileys)**: Biblioteca WhatsApp
- **QR Code Terminal**: Exibição de QR Code

### Processamento
- **Bull**: Sistema de filas (Redis)
- **Node-Cron**: Agendamento de tarefas
- **FFmpeg**: Processamento de mídia

### Integrações
- **OpenAI**: Integração com ChatGPT
- **Dialogflow**: Chatbots Google
- **Google APIs**: Calendar, etc.
- **Supabase**: Serviços adicionais

### Segurança
- **Helmet**: Segurança HTTP
- **CORS**: Controle de origem
- **JWT**: Autenticação
- **Bcrypt**: Hash de senhas

---

## 📁 Estrutura Principal

```
backend/
├── src/
│   ├── app.ts              # Configuração Express
│   ├── server.ts           # Servidor HTTP
│   ├── bootstrap.ts        # Inicialização
│   ├── controllers/        # Controladores (47 arquivos)
│   ├── models/             # Modelos Sequelize (55 arquivos)
│   ├── routes/             # Rotas da API (44 arquivos)
│   ├── services/           # Lógica de negócio (310 arquivos)
│   ├── helpers/            # Funções auxiliares (27 arquivos)
│   ├── middleware/         # Middlewares (5 arquivos)
│   ├── libs/               # Bibliotecas customizadas (6 arquivos)
│   ├── database/           # Migrations e Seeds
│   ├── jobs/               # Jobs assíncronos
│   ├── queues/             # Filas de processamento
│   ├── scripts/             # Scripts utilitários
│   └── utils/              # Utilitários gerais
├── dist/                   # Código compilado (JavaScript)
├── public/                 # Arquivos públicos
├── private/                # Arquivos privados
└── package.json
```

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev:server    # Servidor com hot-reload (ts-node-dev)

# Build
npm run build         # Compila TypeScript para JavaScript
npm run watch         # Compila e observa mudanças

# Produção
npm start             # Inicia servidor (dist/server.js)

# Banco de Dados
npm run db:migrate    # Executa migrações
npm run db:seed       # Popula banco com dados iniciais

# Testes
npm test              # Executa testes Jest
npm run lint          # Verifica código com ESLint
```

---

## 🔐 Autenticação

### Fluxo de Autenticação

1. **Login**: `POST /auth/login`
   - Recebe email e senha
   - Retorna JWT token e refresh token
   - Armazena refresh token em cookie (opcional)

2. **Refresh Token**: `POST /auth/refresh_token`
   - Renova token expirado
   - Usa refresh token do cookie ou header

3. **Middleware de Autenticação**:
   - `isAuth`: Verifica token JWT
   - `isAuthCompany`: Verifica token e empresa
   - `isSuper`: Verifica se é super admin

### Headers Necessários

```http
Authorization: Bearer <jwt-token>
```

---

## 🌐 WebSocket (Socket.IO)

### Conexão

```javascript
const socket = io(`http://localhost:8080/${companyId}`, {
  query: { userId: user.id }
});
```

### Eventos Principais

**Cliente → Servidor:**
- `joinChatBox`: Entrar em um ticket
- `joinNotification`: Receber notificações
- `joinTickets`: Filtrar tickets por status
- `userStatus`: Atualizar status do usuário

**Servidor → Cliente:**
- `company-{companyId}-ticket`: Eventos de ticket
- `company-{companyId}-appMessage`: Novas mensagens
- `company-{companyId}-contact`: Atualizações de contato
- `company-{companyId}-chat`: Eventos de chat

---

## 📊 Banco de Dados

### Principais Tabelas

- **Users**: Usuários do sistema
- **Companies**: Empresas (multi-tenant)
- **Tickets**: Tickets de atendimento
- **Messages**: Mensagens
- **Contacts**: Contatos
- **Whatsapps**: Conexões WhatsApp
- **Queues**: Filas de atendimento
- **Tags**: Tags para organização
- **Campaigns**: Campanhas de envio
- **FlowBuilder**: Fluxos conversacionais

### Migrations

- Total: 265 arquivos de migração
- Localização: `src/database/migrations/`
- Comando: `npx sequelize db:migrate`

---

## 🔄 Sistema de Filas

### Filas Disponíveis

1. **messageQueue**: Processamento de mensagens
2. **sendScheduledMessages**: Mensagens agendadas
3. **handleMessageAckQueue**: Confirmações de entrega

### Bull Board

Interface web para monitorar filas:
- URL: `http://localhost:8080/admin/queues`
- Autenticação: Basic Auth (BULL_USER / BULL_PASS)

---

## 📝 Logs

### Sistema de Logs

- **Pino**: Logger principal
- **Winston**: Logger alternativo
- **Sentry**: Monitoramento de erros (opcional)

### Níveis de Log

- `info`: Informações gerais
- `warn`: Avisos
- `error`: Erros
- `debug`: Debug (desenvolvimento)

---

## ⚙️ Configuração

### Variáveis de Ambiente Principais

```env
# Servidor
PORT=8080
NODE_ENV=production

# Banco de Dados
DB_HOST=localhost
DB_USER=postgres
DB_PASS=password
DB_NAME=multivus

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# Frontend
FRONTEND_URL=http://localhost:3000

# WhatsApp
WHATSAPP_SESSION_PATH=./private/sessions

# Upload
UPLOAD_MAX_SIZE=5242880  # 5MB
```

---

## 🐛 Debug & Desenvolvimento

### Modo Debug

```bash
DEBUG=* npm run dev:server
```

### Hot Reload

```bash
npm run dev:server
# Usa ts-node-dev para hot-reload automático
```

### Logs Detalhados

Ative logs detalhados no código:
```typescript
logger.info('Mensagem de log');
logger.error('Erro', error);
```

---

## 📚 Próximos Passos

- [📁 Estrutura de Pastas](./01-ESTRUTURA-PASTAS.md)
- [🎮 Controllers](./02-CONTROLLERS.md)
- [🗄️ Models](./03-MODELS.md)
- [🛣️ Routes](./04-ROUTES.md)

