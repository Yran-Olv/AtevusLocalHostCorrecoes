# 🎨 Frontend - Visão Geral

## 📋 Informações Gerais

**Tecnologia**: React 18  
**Linguagem**: JavaScript (com TypeScript configurado)  
**Roteamento**: React Router v5  
**Estado Global**: Context API + Zustand  
**Queries**: TanStack React Query v5  
**HTTP Client**: Axios v1.7.7  
**UI Framework**: Material-UI v4/v5 (coexistindo)  
**WebSocket**: Socket.IO Client v4.7.4  
**Versão**: 2.2.2v-26

---

## 🏗️ Arquitetura

O frontend segue uma arquitetura baseada em componentes:

```
┌─────────────────────────────────────┐
│         Routes (Rotas)              │
│    Define rotas da aplicação         │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Pages (Páginas)                 │
│    Componentes de página             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Components                     │
│    Componentes reutilizáveis        │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Hooks & Context                 │
│    Estado e lógica compartilhada     │
└─────────────────────────────────────┘
```

---

## 📦 Principais Funcionalidades

### 1. **Autenticação & Autorização**
- Login e Signup
- JWT token management
- Refresh token automático
- Controle de permissões (Can component)

### 2. **Dashboard**
- Métricas e estatísticas
- Gráficos e relatórios
- Filtros por período
- Visualização Kanban

### 3. **Gestão de Tickets**
- Lista de tickets
- Visualização Kanban
- Filtros avançados
- Atribuição e transferência
- Tags e categorização

### 4. **Mensagens**
- Chat em tempo real
- Envio de mídias
- Mensagens rápidas
- Edição e exclusão
- Encaminhamento

### 5. **WhatsApp**
- Gerenciamento de conexões
- QR Code para autenticação
- Status de conexão
- Múltiplas conexões

### 6. **Contatos**
- Gerenciamento de contatos
- Listas de contatos
- Importação em massa
- Campos customizados
- Tags

### 7. **Campanhas**
- Criação de campanhas
- Envio em massa
- Relatórios de entrega
- Controle de status

### 8. **FlowBuilder**
- Editor visual de fluxos
- Criação de chatbots
- Condicionais e lógicas
- Integração com IA

### 9. **Filas (Queues)**
- Gerenciamento de filas
- Distribuição automática
- Horários de atendimento
- Integrações

### 10. **Configurações**
- Configurações do sistema
- Configurações de empresa
- Personalização de tema
- Integrações

---

## 🔌 Tecnologias Principais

### Core
- **React 18**: Biblioteca UI
- **React Router v5**: Roteamento
- **Axios**: Cliente HTTP
- **TanStack React Query v5**: Cache e sincronização de dados

### UI
- **Material-UI v4**: Componentes UI (legado)
- **Material-UI v5**: Componentes UI (novo)
- **Styled Components**: Estilização
- **CSS Modules**: Estilos modulares

### Estado
- **Context API**: Estado global
- **Zustand**: Gerenciamento de estado leve
- **React Hooks**: Hooks customizados

### WebSocket
- **Socket.IO Client**: Comunicação em tempo real
- **SocketWorker**: Gerenciamento de conexões

### Utilitários
- **date-fns**: Manipulação de datas
- **Formik**: Formulários
- **Yup**: Validação
- **i18next**: Internacionalização
- **react-toastify**: Notificações

### Gráficos
- **Chart.js**: Gráficos
- **Recharts**: Gráficos alternativos

### Outros
- **react-flow-renderer**: Editor de fluxos
- **react-trello**: Kanban
- **react-big-calendar**: Calendário
- **qrcode.react**: QR Code

---

## 📁 Estrutura Principal

```
frontend/
├── public/                 # Arquivos públicos
│   ├── index.html
│   ├── favicon.ico
│   └── [assets públicos]
│
├── src/
│   ├── App.js              # Componente raiz
│   ├── index.js            # Entry point
│   │
│   ├── pages/              # Páginas (40+ páginas)
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Tickets/
│   │   ├── Chat/
│   │   └── [outras páginas]
│   │
│   ├── components/         # Componentes (171 arquivos)
│   │   ├── Ticket/
│   │   ├── MessageInput/
│   │   ├── MessagesList/
│   │   └── [outros componentes]
│   │
│   ├── hooks/              # Hooks customizados (20+ hooks)
│   │   ├── useAuth/
│   │   ├── useTickets/
│   │   ├── useMessages/
│   │   └── [outros hooks]
│   │
│   ├── context/            # Context API (9 contexts)
│   │   ├── Auth/
│   │   ├── Tickets/
│   │   ├── WhatsApp/
│   │   └── [outros contexts]
│   │
│   ├── services/           # Serviços
│   │   ├── api.js         # Cliente Axios
│   │   ├── socket.js      # Socket.IO
│   │   └── SocketWorker.js
│   │
│   ├── routes/             # Rotas
│   │   ├── index.js
│   │   └── Route.js
│   │
│   ├── layout/             # Layout principal
│   │   ├── index.js
│   │   └── MainListItems.js
│   │
│   ├── utils/              # Utilitários
│   │   ├── socketHelper.js
│   │   └── [outros utils]
│   │
│   ├── translate/          # Internacionalização
│   │   ├── i18n.js
│   │   └── languages/
│   │
│   ├── assets/             # Assets estáticos
│   │   └── [imagens, ícones, etc.]
│   │
│   └── styles/            # Estilos globais
│
└── package.json
```

---

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia servidor de desenvolvimento (porta 3000)

# Build
npm run build          # Build de produção
npm run builddev       # Build de desenvolvimento

# Testes
npm test               # Executa testes
```

---

## 🔐 Autenticação

### Fluxo de Autenticação

1. **Login**: `POST /auth/login`
   - Armazena token no localStorage
   - Redireciona para dashboard

2. **Refresh Token**: Automático via interceptor Axios
   - Renova token expirado
   - Usa refresh token do cookie

3. **Logout**: Limpa localStorage e redireciona

### Context de Autenticação

```javascript
const { user, isAuth, handleLogin, handleLogout, socket } = useContext(AuthContext);
```

---

## 🌐 WebSocket (Socket.IO Client)

### Conexão

```javascript
import { socketConnection } from "../services/socket";

const socket = socketConnection({ user });
```

### Eventos Principais

**Ouvir Eventos:**
```javascript
socket.on(`company-${companyId}-ticket`, (data) => {
  // Atualizar tickets
});

socket.on(`company-${companyId}-appMessage`, (data) => {
  // Nova mensagem
});
```

**Emitir Eventos:**
```javascript
socket.emit("joinChatBox", ticketId);
socket.emit("userStatus");
```

### Helper de Segurança

```javascript
import { safeSocketOn, safeSocketOff, isSocketValid } from "../utils/socketHelper";

if (isSocketValid(socket)) {
  safeSocketOn(socket, 'event-name', callback);
}
```

---

## 🎨 Temas e Estilização

### Sistema de Temas

- **Material-UI v4**: Tema legado
- **Material-UI v5**: Tema novo
- **Dark Mode**: Suportado
- **Cores Customizáveis**: Por empresa

### Estilização

- **CSS Modules**: Para componentes específicos
- **Styled Components**: Para estilos dinâmicos
- **Material-UI Styles**: Para componentes MUI
- **CSS Global**: Para estilos globais

---

## 🌍 Internacionalização (i18n)

### Idiomas Suportados

- Português (pt-BR) - Padrão
- Inglês (en)
- Espanhol (es)
- [Outros idiomas]

### Uso

```javascript
import { i18n } from "../translate/i18n";

i18n.t("login.form.email");
```

---

## 📱 Responsividade

### Breakpoints

- **Mobile**: < 600px
- **Tablet**: 600px - 960px
- **Desktop**: > 960px

### Abordagem

- Mobile-first
- Media queries
- Componentes adaptativos

---

## 🔄 Estado Global

### Contexts Disponíveis

1. **AuthContext**: Autenticação e usuário
2. **TicketsContext**: Estado de tickets
3. **WhatsAppsContext**: Conexões WhatsApp
4. **ActiveMenuContext**: Menu ativo
5. **ReplyingMessageContext**: Mensagem sendo respondida
6. **EditingMessageContext**: Mensagem sendo editada
7. **ForwardMessageContext**: Mensagem sendo encaminhada
8. **ProfileImageContext**: Imagem de perfil
9. **QueuesSelectedContext**: Filas selecionadas

---

## 📚 Próximos Passos

- [📁 Estrutura de Pastas](./01-ESTRUTURA-PASTAS.md)
- [📄 Pages](./02-PAGES.md)
- [🧩 Components](./03-COMPONENTS.md)
- [🪝 Hooks](./04-HOOKS.md)

