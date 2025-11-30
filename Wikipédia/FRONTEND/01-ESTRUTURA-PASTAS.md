# 📁 Frontend - Estrutura de Pastas

## 📂 Visão Geral da Estrutura

```
frontend/
├── public/                          # Arquivos públicos estáticos
│   ├── index.html                   # HTML principal
│   ├── favicon.ico                  # Favicon
│   ├── manifest.json                # PWA manifest
│   ├── logo.png                     # Logo padrão
│   └── [outros assets públicos]
│
├── src/
│   ├── App.js                       # Componente raiz da aplicação
│   ├── index.js                     # Entry point (React 18)
│   │
│   ├── pages/                       # Páginas da aplicação (40+ páginas)
│   │   ├── Login/                   # Tela de login
│   │   ├── Signup/                  # Tela de cadastro
│   │   ├── Dashboard/               # Dashboard principal
│   │   ├── Tickets/                 # Lista de tickets
│   │   ├── TicketResponsiveContainer/ # Container responsivo de ticket
│   │   ├── TicketsCustom/           # Tickets customizados
│   │   ├── TicketsAdvanced/         # Tickets avançados
│   │   ├── Chat/                     # Sistema de chat
│   │   ├── Kanban/                   # Visualização Kanban
│   │   ├── TagsKanban/              # Kanban de tags
│   │   ├── Contacts/                # Gerenciamento de contatos
│   │   ├── ContactLists/             # Listas de contatos
│   │   ├── ContactListItems/         # Itens de lista
│   │   ├── Users/                    # Gerenciamento de usuários
│   │   ├── Queues/                   # Filas de atendimento
│   │   ├── QueueIntegration/         # Integrações de fila
│   │   ├── Tags/                     # Tags
│   │   ├── Campaigns/               # Campanhas
│   │   ├── CampaignReport/          # Relatórios de campanha
│   │   ├── CampaignsConfig/         # Configuração de campanhas
│   │   ├── CampaignsPhrase/        # Frases de campanha
│   │   ├── FlowBuilder/             # Editor de fluxos
│   │   ├── FlowBuilderConfig/       # Configuração de fluxo
│   │   ├── FlowDefault/             # Fluxos padrão
│   │   ├── QuickMessages/           # Mensagens rápidas
│   │   ├── Schedules/               # Agendamentos
│   │   ├── Prompts/                 # Prompts de IA
│   │   ├── Files/                   # Gerenciamento de arquivos
│   │   ├── Settings/                # Configurações
│   │   ├── SettingsCustom/          # Configurações customizadas
│   │   ├── Connections/             # Conexões WhatsApp
│   │   ├── AllConnections/          # Todas conexões
│   │   ├── MessagesAPI/             # API de mensagens
│   │   ├── Reports/                 # Relatórios
│   │   ├── Helps/                   # Sistema de ajuda
│   │   ├── Companies/               # Gerenciamento de empresas
│   │   ├── Financeiro/              # Financeiro
│   │   ├── Subscription/            # Assinaturas
│   │   ├── Annoucements/            # Anúncios
│   │   ├── Moments/                 # Momentos
│   │   └── ToDoList/                # Lista de tarefas
│   │
│   ├── components/                  # Componentes reutilizáveis (171 arquivos)
│   │   ├── Ticket/                  # Componente de ticket
│   │   ├── MessagesList/            # Lista de mensagens
│   │   ├── MessageInput/            # Input de mensagem
│   │   ├── TicketHeader/            # Cabeçalho do ticket
│   │   ├── TicketInfo/              # Informações do ticket
│   │   ├── TicketListItem/          # Item de lista de ticket
│   │   ├── TicketsListCustom/       # Lista customizada de tickets
│   │   ├── ContactDrawer/           # Drawer de contato
│   │   ├── ContactModal/           # Modal de contato
│   │   ├── ContactForm/            # Formulário de contato
│   │   ├── ContactTag/              # Tag de contato
│   │   ├── ContactTagListModal/    # Modal de tags de contato
│   │   ├── WhatsAppModal/           # Modal de WhatsApp
│   │   ├── QueueModal/              # Modal de fila
│   │   ├── TagModal/                # Modal de tag
│   │   ├── UserModal/               # Modal de usuário
│   │   ├── CampaignModal/           # Modal de campanha
│   │   ├── ScheduleModal/           # Modal de agendamento
│   │   ├── QuickMessageDialog/      # Dialog de mensagem rápida
│   │   ├── PromptModal/             # Modal de prompt
│   │   ├── FileModal/               # Modal de arquivo
│   │   ├── WebhookModal/            # Modal de webhook
│   │   ├── FlowBuilderModal/        # Modal de fluxo
│   │   ├── FlowBuilderAddTextModal/ # Modal adicionar texto
│   │   ├── FlowBuilderAddImgModal/  # Modal adicionar imagem
│   │   ├── FlowBuilderAddAudioModal/# Modal adicionar áudio
│   │   ├── FlowBuilderAddVideoModal/# Modal adicionar vídeo
│   │   ├── FlowBuilderConditionModal/# Modal de condição
│   │   ├── FlowBuilderMenuModal/    # Modal de menu
│   │   ├── FlowBuilderIntervalModal/# Modal de intervalo
│   │   ├── FlowBuilderRandomizerModal/# Modal de randomizador
│   │   ├── FlowBuilderAddTicketModal/# Modal adicionar ticket
│   │   ├── FlowBuilderSingleBlockModal/# Modal bloco único
│   │   ├── AnnouncementModal/       # Modal de anúncio
│   │   ├── AnnouncementsPopover/    # Popover de anúncios
│   │   ├── NotificationsPopOver/    # Popover de notificações
│   │   ├── NotificationsVolume/     # Volume de notificações
│   │   ├── QrcodeModal/             # Modal de QR Code
│   │   ├── CameraModal/             # Modal de câmera
│   │   ├── AudioModal/              # Modal de áudio
│   │   ├── MessageModal/            # Modal de mensagem
│   │   ├── ForwardMessageModal/     # Modal encaminhar mensagem
│   │   ├── MessageOptionsMenu/      # Menu de opções de mensagem
│   │   ├── MessageUploadMedias/     # Upload de mídias
│   │   ├── MessageVariablesPicker/  # Seletor de variáveis
│   │   ├── MarkdownWrapper/         # Wrapper de markdown
│   │   ├── VcardPreview/            # Preview de vCard
│   │   ├── LocationPreview/         # Preview de localização
│   │   ├── ModalImageCors/          # Modal de imagem CORS
│   │   ├── ModalYoutubeCors/        # Modal de YouTube CORS
│   │   ├── TagsContainer/           # Container de tags
│   │   ├── TagsKanbanContainer/    # Container Kanban de tags
│   │   ├── TagTicketModal/          # Modal de tag de ticket
│   │   ├── TicketActionButtonsCustom/# Botões de ação customizados
│   │   ├── TicketAdvancedLayout/    # Layout avançado de ticket
│   │   ├── TicketHeaderSkeleton/     # Skeleton de cabeçalho
│   │   ├── TicketListForwardMessageItem/# Item de encaminhamento
│   │   ├── TicketMessagesDialog/    # Dialog de mensagens
│   │   ├── TicketOptionsMenu/        # Menu de opções de ticket
│   │   ├── TicketsListSkeleton/      # Skeleton de lista
│   │   ├── TicketsManagerTabs/      # Tabs de gerenciamento
│   │   ├── TicketsQueueSelect/      # Seletor de fila
│   │   ├── TransferTicketModalCustom/# Modal transferir ticket
│   │   ├── ShowTicketLogModal/      # Modal de log de ticket
│   │   ├── ShowTicketOpenModal/     # Modal abrir ticket
│   │   ├── NewTicketModal/          # Modal novo ticket
│   │   ├── AcceptTicketWithoutQueueModal/# Modal aceitar sem fila
│   │   ├── ContactImport/           # Importação de contatos
│   │   ├── ContactImportWpModal/    # Modal importar do WhatsApp
│   │   ├── ContactListDialog/       # Dialog de lista de contatos
│   │   ├── ContactListItemModal/    # Modal de item de lista
│   │   ├── ContactListTable/        # Tabela de lista de contatos
│   │   ├── ContactNotes/            # Notas de contato
│   │   ├── ContactNotesDialog/      # Dialog de notas
│   │   ├── ContactNotesDialogListItem/# Item de lista de notas
│   │   ├── ContactNotesEditModal/   # Modal editar nota
│   │   ├── ContactSendModal/        # Modal enviar para contato
│   │   ├── ContactsFilter/          # Filtro de contatos
│   │   ├── ConnectionsFilter/       # Filtro de conexões
│   │   ├── QueueFilter/             # Filtro de filas
│   │   ├── QueueSelect/              # Seletor de fila
│   │   ├── QueueSelectCustom/       # Seletor customizado
│   │   ├── QueueSelectSingle/       # Seletor único
│   │   ├── QueueOptions/            # Opções de fila
│   │   ├── QueueIntegrationModal/   # Modal de integração
│   │   ├── TagsFilter/              # Filtro de tags
│   │   ├── UsersFilter/             # Filtro de usuários
│   │   ├── WhatsappsFilter/         # Filtro de WhatsApps
│   │   ├── CreatedAtFilter/         # Filtro de data criação
│   │   ├── UpdatedAtFilter/         # Filtro de data atualização
│   │   ├── StatusFilter/             # Filtro de status
│   │   ├── ParamsFilter/            # Filtro de parâmetros
│   │   ├── Dashboard/               # Componentes de dashboard
│   │   ├── MainContainer/           # Container principal
│   │   ├── MainHeader/              # Cabeçalho principal
│   │   ├── MainHeaderButtonsWrapper/# Wrapper de botões
│   │   ├── Title/                   # Componente de título
│   │   ├── TableRowSkeleton/        # Skeleton de linha
│   │   ├── ConfirmationModal/       # Modal de confirmação
│   │   ├── BackdropLoading/         # Loading backdrop
│   │   ├── ButtonWithSpinner/       # Botão com spinner
│   │   ├── ColorPicker/             # Seletor de cor
│   │   ├── ColorBoxModal/           # Modal de cor
│   │   ├── CurrencyInput/          # Input de moeda
│   │   ├── Input/                   # Input customizado
│   │   ├── OutlinedDiv/            # Div com outline
│   │   ├── TabPanel/                # Painel de tab
│   │   ├── ToolTips/                # Tooltips
│   │   ├── WithSkeleton/            # HOC com skeleton
│   │   ├── Can/                     # Componente de permissão
│   │   ├── OnlyForSuperUser/        # Apenas super usuário
│   │   ├── ForbiddenPage/           # Página proibida
│   │   ├── Dialog/                  # Dialog genérico
│   │   ├── UserLanguageSelector/    # Seletor de idioma
│   │   ├── DarkMode/                # Modo escuro
│   │   ├── VersionControl/         # Controle de versão
│   │   ├── PWAInstallPrompt/       # Prompt de instalação PWA
│   │   ├── ConnectionIcon/         # Ícone de conexão
│   │   ├── ModalUsers/              # Modal de usuários
│   │   ├── CompaniesModal/          # Modal de empresas
│   │   ├── CompaniesManager/       # Gerenciador de empresas
│   │   ├── CompanyWhatsapps/        # WhatsApps da empresa
│   │   ├── PlansManager/            # Gerenciador de planos
│   │   ├── SubscriptionModal/       # Modal de assinatura
│   │   ├── HelpsManager/            # Gerenciador de ajuda
│   │   ├── Settings/                # Componentes de configuração
│   │   ├── FormFields/              # Campos de formulário
│   │   ├── CheckoutPage/            # Página de checkout
│   │   ├── MomentsUser/             # Momentos do usuário
│   │   ├── Softphone/               # Softphone
│   │   ├── ChatBots/                # Chatbots
│   │   └── [outros componentes]
│   │
│   ├── hooks/                       # Hooks customizados (20+ hooks)
│   │   ├── useAuth.js/              # Hook de autenticação
│   │   ├── useTickets/              # Hook de tickets
│   │   ├── useMessages/             # Hook de mensagens
│   │   ├── useContacts/             # Hook de contatos
│   │   ├── useUsers/                # Hook de usuários
│   │   ├── useUser/                 # Hook de usuário único
│   │   ├── useUserMoments/          # Hook de momentos
│   │   ├── useWhatsApps/            # Hook de WhatsApps
│   │   ├── useQueues/               # Hook de filas
│   │   ├── useQueueIntegrations/    # Hook de integrações
│   │   ├── useTags/                 # Hook de tags
│   │   ├── useCampaigns/            # Hook de campanhas
│   │   ├── useContactLists/         # Hook de listas
│   │   ├── useContactListItems/     # Hook de itens de lista
│   │   ├── useQuickMessages/        # Hook de mensagens rápidas
│   │   ├── useSchedules/            # Hook de agendamentos
│   │   ├── useSettings/             # Hook de configurações
│   │   ├── usePlans/                # Hook de planos
│   │   ├── useDashboard/            # Hook de dashboard
│   │   ├── useDate/                 # Hook de data
│   │   ├── useHelps/                # Hook de ajuda
│   │   ├── useInvoices/             # Hook de faturas
│   │   ├── useTicketNotes/          # Hook de notas
│   │   ├── useVersion/              # Hook de versão
│   │   ├── useWindowDimensions/     # Hook de dimensões
│   │   └── useLocalStorage/         # Hook de localStorage
│   │
│   ├── context/                     # Context API (9 contexts)
│   │   ├── Auth/                    # Context de autenticação
│   │   │   └── AuthContext.js
│   │   ├── Tickets/                 # Context de tickets
│   │   │   └── TicketsContext.js
│   │   ├── WhatsApp/                # Context de WhatsApp
│   │   │   └── WhatsAppsContext.js
│   │   ├── ActiveMenuContext/       # Context de menu ativo
│   │   ├── ReplyingMessageContext/  # Context de resposta
│   │   ├── EditingMessageContext/   # Context de edição
│   │   ├── ForwarMessageContext/    # Context de encaminhamento
│   │   ├── ProfileImageContext/     # Context de imagem
│   │   └── QueuesSelectedContext/   # Context de filas selecionadas
│   │
│   ├── services/                     # Serviços
│   │   ├── api.js                   # Cliente Axios configurado
│   │   ├── config.js                # Configurações
│   │   ├── socket.js                # Socket.IO helper
│   │   └── SocketWorker.js          # Worker de Socket.IO
│   │
│   ├── routes/                      # Rotas
│   │   ├── index.js                 # Definição de rotas
│   │   └── Route.js                 # Componente de rota protegida
│   │
│   ├── layout/                      # Layout principal
│   │   ├── index.js                 # Layout logado
│   │   ├── MainListItems.js         # Itens do menu lateral
│   │   └── themeContext.js          # Context de tema
│   │
│   ├── utils/                       # Utilitários
│   │   ├── socketHelper.js          # Helper de Socket.IO (segurança)
│   │   ├── capitalize.js            # Capitalizar string
│   │   ├── emojisArray.js           # Array de emojis
│   │   ├── formatFolderSize.js      # Formatar tamanho
│   │   ├── FormatMask.js            # Máscaras de formatação
│   │   ├── formatSerializedId.js    # Formatar ID serializado
│   │   ├── formatToCurrency.js      # Formatar moeda
│   │   ├── formatToHtmlFormat.js    # Formatar HTML
│   │   └── sleep.js                 # Função sleep
│   │
│   ├── translate/                   # Internacionalização
│   │   ├── i18n.js                  # Configuração i18next
│   │   └── languages/               # Arquivos de idioma
│   │       ├── pt-BR.js             # Português
│   │       ├── en.js                 # Inglês
│   │       ├── es.js                 # Espanhol
│   │       └── [outros idiomas]
│   │
│   ├── assets/                      # Assets estáticos
│   │   ├── logo.png                 # Logo
│   │   ├── logo-black.png           # Logo escuro
│   │   ├── favicon.ico              # Favicon
│   │   ├── nopicture.png            # Sem imagem
│   │   ├── sound.mp3                # Som de notificação
│   │   ├── wa-background.png        # Background WhatsApp
│   │   ├── wa-background-dark.png   # Background escuro
│   │   ├── planilha.xlsx            # Planilha exemplo
│   │   └── [outros assets]
│   │
│   ├── styles/                      # Estilos globais
│   │   └── styles.js                # Estilos JavaScript
│   │
│   ├── errors/                      # Tratamento de erros
│   │   └── toastError.js            # Helper de erro toast
│   │
│   ├── helpers/                     # Helpers
│   │   └── contrastColor.js         # Cor de contraste
│   │
│   ├── stores/                      # Stores (Zustand)
│   │   └── useNodeStorage.js        # Storage de nós
│   │
│   ├── config.js                    # Configurações gerais
│   ├── rules.js                     # Regras de permissão
│   └── react-app-env.d.ts          # Tipos TypeScript
│
└── package.json
```

---

## 📊 Estatísticas

- **Total de Arquivos JavaScript**: ~500+
- **Pages**: 40+
- **Components**: 171
- **Hooks**: 20+
- **Contexts**: 9
- **Routes**: 50+

---

## 🔄 Fluxo de Dados

```
1. Usuário interage com UI
   ↓
2. Component/Page
   ↓
3. Hook (useTickets, useMessages, etc.)
   ↓
4. Service (api.js ou socket.js)
   ↓
5. Backend API
   ↓
6. Response
   ↓
7. Context/State Update
   ↓
8. UI Re-render
```

---

## 📚 Próximos Passos

- [📄 Pages](./02-PAGES.md)
- [🧩 Components](./03-COMPONENTS.md)
- [🪝 Hooks](./04-HOOKS.md)
- [🌐 Context API](./05-CONTEXT.md)

