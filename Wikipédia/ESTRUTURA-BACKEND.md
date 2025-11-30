# 📁 Estrutura do Backend

Documentação resumida sobre a organização e funcionalidade de cada pasta do backend.

## 🏗️ Arquitetura

Padrão **MVC + Services**: `Request → Routes → Controllers → Services → Models → Database`

---

## 📂 Pastas Principais

### `src/config/`
Configurações da aplicação (auth, database, redis, upload)

### `src/controllers/`
Recebem requisições HTTP, validam entrada, chamam services e retornam resposta. Um controller por entidade (User, Ticket, WhatsApp, etc.)

### `src/routes/`
Define endpoints da API REST. Mapeia URLs para controllers e aplica middlewares de autenticação.

### `src/services/`
Lógica de negócio. Cada entidade tem sua pasta com services (Create, Update, Delete, List, Show).
**Principais:** `WbotServices/` (WhatsApp/Baileys), `TicketServices/`, `MessageServices/`, `ContactServices/`, `WhatsappService/`

### `src/models/`
Modelos de dados (Sequelize ORM). Representam tabelas e relacionamentos. Principais: `User`, `Company`, `Ticket`, `Message`, `Contact`, `Whatsapp`

### `src/libs/`
Bibliotecas compartilhadas: `wbot.ts` (WhatsApp/Baileys), `cache.ts` (Redis), `queue.ts` (Bull), `socket.ts` (Socket.IO)

### `src/helpers/`
Funções auxiliares reutilizáveis: `GetTicketWbot.ts`, `cleanOrphanSessions.ts`, `useMultiFileAuthState.ts`, `Mustache.ts`

### `src/middleware/`
Interceptadores de requisições: `isAuth.ts` (JWT), `isAuthCompany.ts`, `isSuper.ts`, `tokenAuth.ts`

### `src/database/`
Migrations (alterações de schema) e seeds (dados iniciais)

### `src/jobs/`
Processamento assíncrono: `handleMessageQueue.ts`, `handleMessageAckQueue.ts`

### `src/queues/`
Definição de filas Bull (`userMonitor.ts`, `queues.ts`)

### `src/scripts/`
Scripts CLI: `cleanup-redis-sessions.ts`, `cleanup-lid-contacts.ts`

### `src/utils/`
Utilitários gerais (`logger.ts`, `randomCode.ts`)

### `src/errors/`
Classes de erro customizadas (`AppError.ts`)

### `src/@types/`
Definições de tipos TypeScript

---

## 🔄 Fluxo de Dados - Exemplo: Conectar WhatsApp

1. **Route** → Define endpoint `POST /whatsapp-session/:whatsappId`
2. **Controller** → Recebe requisição, valida, chama service
3. **Service** → Lógica de negócio, chama lib, atualiza banco
4. **Lib** (`wbot.ts`) → Cria conexão Baileys, gerencia sessão
5. **Model** → Persiste dados no PostgreSQL

---

## 🎯 Principais Integrações

| Integração | Lib | Uso |
|------------|-----|-----|
| **WhatsApp (Baileys)** | `libs/wbot.ts` | Conexões WhatsApp, eventos `connection.update`, `messages.upsert` |
| **WebSocket** | `libs/socket.ts` | Notificações em tempo real (namespaces por `companyId`) |
| **Redis** | `libs/cache.ts` | Cache, sessões Baileys, filas (chaves: `sessions:{whatsappId}:*`) |
| **PostgreSQL** | Sequelize | Models em `models/`, migrations em `database/migrations/` |

---

## 📝 Convenções

- **Services:** Um service por operação (Create, Update, Delete, List, Show)
- **Controllers:** Um controller por entidade
- **Naming:** PascalCase (classes), camelCase (funções)
- **Imports:** Agrupados por origem (externos → internos → relativos)

