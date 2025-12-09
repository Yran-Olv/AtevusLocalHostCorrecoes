# 🚀 Multivus - Sistema de Multiatendimento WhatsApp

Sistema SaaS completo para gerenciamento de atendimento via WhatsApp com múltiplos números, múltiplos atendentes, automação conversacional (FlowBuilder) e integração com gateway de pagamento.

**Versão**: 2.2.2v-26  
**Ano de Origem**: 2014 (código legado modernizado)  
**Ambiente Dev**: Windows (localhost)  
**Ambiente Prod**: Ubuntu 22.04 LTS (VPS)

---

## 🔄 Última Atualização 09/12/2025 01:05 Madrugada

### ✨ Novas Funcionalidades Implementadas

#### 🎨 **Sistema de Configuração Completo via UI**
- **Gerencianet (EfiBank)**: Configuração completa via `/settings` - chaves, secrets, webhook URL, chave PIX
- **Tela de Login 100% Configurável**: Personalização completa da tela de login via `/settings` -> "Tela Login"
  - Temas pré-definidos brasileiros (Natal, Ano Novo, Dia da Mulher, Dia das Mães, Consciência Negra, Independência, Carnaval, Páscoa, Festa Junina, Dia dos Pais, Dia das Crianças)
  - Upload de imagens (logo, background, fotos da equipe)
  - Configuração de cores, textos, animações
  - Preview em tempo real
  - Configuração de email (SMTP) integrada
- **Whitelabel Avançado**: Customização completa de cores, fontes e estilos via `/settings` -> "Whitelabel"
  - Cores do menu lateral, navbar, fundo das páginas
  - Cores de texto (claro/escuro)
  - Cores primárias e secundárias
  - Configuração de fontes (família, tamanho, peso)

#### 🔐 **Sistema de Autenticação Melhorado**
- **Recuperação de Senha**: Sistema completo de recuperação via email
- **Gerenciamento de Sessões**: Opção para manter múltiplas sessões ou desconectar outras
- **JWT Configurável**: Obrigatório em produção, opcional em desenvolvimento

#### 🎯 **Melhorias de UX/UI**
- **Design Responsivo Completo**: Sistema totalmente responsivo para computadores, tablets e celulares (Android e iOS)
- **Remoção de Material-UI**: Substituído por componentes customizados e responsivos
- **Tema Unificado**: Sistema de cores corporativo unificado em todo o sistema
- **Menu Lateral Melhorado**: Texto "Multivus" como logo, melhor legibilidade, totalmente responsivo
- **Loading Screen**: Tela de carregamento com limpeza automática de cache

#### 📱 **PWA (Progressive Web App) Melhorado**
- Notificações com som para Android, iOS e Desktop
- Service Worker otimizado
- Cache management inteligente
- Suporte completo para instalação em dispositivos móveis

#### 🔧 **Compatibilidade Cross-Platform**
- **Windows/Linux**: Sistema totalmente compatível com Windows (dev) e Ubuntu 22 (prod)
- **Helper de Caminhos**: Sistema centralizado para construção de caminhos cross-platform
- **Permissões de Arquivos**: Configuração automática de permissões adequadas por ambiente
- **CORS Configurado**: Restritivo em produção, permissivo em desenvolvimento

#### 🐛 **Correções e Melhorias**
- Correção de erros de CORS
- Melhoria no tratamento de erros de validação
- Sistema de validação aprimorado com feedback visual
- Correção de problemas de responsividade em mobile
- Otimização de performance

---

## 📋 Requisitos

| Componente | Mínimo | Recomendado |
| --- | --- | --- |
| **Node.js** | 20.19.x | 20.19.x ou superior |
| **Ubuntu** | 20.04 LTS | 22.04 LTS |
| **Memória RAM** | 6GB | 10GB+ |
| **vCPU** | 4 cores | 8+ cores |
| **Armazenamento** | 20GB SSD | 40GB+ SSD |
| **PostgreSQL** | 12+ | 14+ |
| **Redis** | 6+ | 7+ |

---

## 🚀 Instalação

### Backend

```bash
# 1. Instalar dependências
cd backend
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Executar migrations
npx sequelize db:migrate

# 4. Executar seeds (opcional)
npx sequelize db:seed:all

# 5. Build (TypeScript)
npm run build

# 6. Iniciar em desenvolvimento
npm run dev

# 7. Iniciar em produção
npm start
# ou com PM2
pm2 start dist/server.js --name multivus-backend
```

### Frontend

```bash
# 1. Instalar dependências
cd frontend
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Iniciar em desenvolvimento
npm start

# 4. Build para produção
npm run build

# 5. Servir build (com serve ou nginx)
serve -s build -l 3000
```

---

## ⚙️ Configuração

### Variáveis de Ambiente Obrigatórias (Backend)

```env
# Ambiente
NODE_ENV=production

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multivus
DB_USER=postgres
DB_PASS=senha

# JWT (obrigatório em produção)
JWT_SECRET=seu-jwt-secret-aqui

# URLs
FRONTEND_URL=https://seu-frontend.com
BACKEND_URL=https://seu-backend.com

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (ou configure via UI em /settings -> Tela Login)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu-email@gmail.com
MAIL_PASS=sua-senha
MAIL_FROM=noreply@multivus.com

# Gerencianet (ou configure via UI em /settings -> Gerencianet)
GERENCIANET_CLIENT_ID=seu-client-id
GERENCIANET_CLIENT_SECRET=seu-client-secret
GERENCIANET_SANDBOX=true
GERENCIANET_PIX_KEY=sua-chave-pix
```

### Variáveis de Ambiente (Frontend)

```env
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_FRONTEND_URL=http://localhost:3000
```

---

## 🎯 Funcionalidades Principais

### 📱 Multiatendimento WhatsApp
- Múltiplos números WhatsApp por empresa
- Múltiplos atendentes simultâneos
- Integração com API oficial e não oficial
- Fila de atendimento
- Transferência de tickets
- Histórico completo de conversas

### 🤖 FlowBuilder - Automação Conversacional
- Criação visual de fluxos de conversa
- Nodes: Start, Message, Menu, Condition, Interval, Image, Audio, Video, Randomizer
- Lógica condicional avançada
- Integração com tickets e contatos
- Chatbot inteligente

### 💳 Integração com Gerencianet (EfiBank)
- Geração de cobranças PIX
- Webhook para atualização automática
- Gestão de assinaturas
- Configuração completa via UI

### 🎨 Personalização Completa
- **Tela de Login**: 100% configurável com temas, imagens, textos
- **Whitelabel**: Customização completa de cores, fontes e estilos
- **Temas Pré-definidos**: 11 temas brasileiros prontos para uso

### 🔐 Segurança
- Autenticação JWT
- Recuperação de senha via email
- Gerenciamento de sessões
- CORS configurado
- Permissões de arquivos adequadas

### 📊 Dashboard e Relatórios
- Dashboard com métricas em tempo real
- Relatórios de atendimento
- Estatísticas de tickets
- Análise de performance

---

## 📚 Documentação

### 📖 Wiki Completa
Acesse a [Wiki do Projeto](Wikipédia/README.md) para documentação detalhada:
- [Estrutura do Backend](Wikipédia/BACKEND/00-VISAO-GERAL.md)
- [Estrutura do Frontend](Wikipédia/FRONTEND/00-VISAO-GERAL.md)
- [API REST](Wikipédia/RESUMO-API-BACKEND.md)
- [Mensagens WhatsApp](Wikipédia/MENSAGENS-WHATSAPP.md)

### 🔧 Documentação Técnica
- [Compatibilidade Windows/Linux](COMPATIBILIDADE-WINDOWS-LINUX.md) - Guia completo de compatibilidade
- [Correções Aplicadas](Wikipédia/Melhorias/CORRECOES-GerenciaNet.md) - Histórico de correções

### 🎨 Guias de Configuração
- **Gerencianet**: Configure via `/settings` -> "Gerencianet"
- **Tela de Login**: Configure via `/settings` -> "Tela Login"
- **Whitelabel**: Configure via `/settings` -> "Whitelabel"

---

## 🛠️ Desenvolvimento

### Estrutura do Projeto

```
multivus/
├── backend/              # Backend Node.js/TypeScript
│   ├── src/
│   │   ├── controllers/  # Controllers da API
│   │   ├── services/     # Lógica de negócio
│   │   ├── models/      # Models do Sequelize
│   │   ├── routes/      # Rotas da API
│   │   ├── config/      # Configurações
│   │   └── utils/       # Utilitários (inclui pathHelper)
│   └── public/          # Arquivos públicos
│
├── frontend/             # Frontend React
│   ├── src/
│   │   ├── components/  # Componentes React
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # Serviços (API, etc)
│   │   └── styles/      # Estilos globais
│   └── public/          # Arquivos públicos
│
└── Wikipédia/           # Documentação completa
```

### Scripts Úteis

```bash
# Backend
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build TypeScript
npm run start        # Produção
npm run lint         # Linter

# Frontend
npm start            # Desenvolvimento
npm run build        # Build para produção
npm test             # Testes
```

---

## 🔒 Segurança

### Checklist de Produção

- [ ] `NODE_ENV=production` configurado
- [ ] `JWT_SECRET` definido e seguro
- [ ] `ENV_TOKEN` configurado para rotas públicas
- [ ] CORS configurado apenas para origens permitidas
- [ ] Permissões de arquivos adequadas (0o755)
- [ ] Banco de dados com senha forte
- [ ] Redis protegido
- [ ] HTTPS configurado
- [ ] Firewall configurado

---

## 🐛 Troubleshooting

### Problemas Comuns

**Erro de CORS:**
- Verificar `FRONTEND_URL` e `BACKEND_URL` no `.env`
- Verificar configuração de CORS em `backend/src/app.ts`

**Erro de Permissões (Linux):**
- Verificar permissões da pasta `public/`
- Executar: `chmod -R 755 public/`

**Erro de JWT:**
- Verificar se `JWT_SECRET` está configurado
- Em produção, JWT é obrigatório

**Cache não limpa:**
- O sistema limpa cache automaticamente no loading screen
- Se necessário, limpar manualmente: `Ctrl+Shift+R` (Chrome) ou `Ctrl+F5`

---

## 📞 Suporte

Para dúvidas e suporte:
- Consulte a [Wiki](Wikipédia/README.md)
- Verifique a [documentação de compatibilidade](COMPATIBILIDADE-WINDOWS-LINUX.md)
- Revise as [correções aplicadas](Wikipédia/Melhorias/CORRECOES-GerenciaNet.md)

---

## 📝 Changelog

### Janeiro 2025
- ✨ Sistema de configuração completo via UI (Gerencianet, Login, Whitelabel)
- ✨ Tela de Login 100% configurável com temas brasileiros
- ✨ Sistema de recuperação de senha
- ✨ Gerenciamento de sessões múltiplas
- ✨ PWA melhorado com notificações sonoras
- ✨ Loading screen com limpeza automática de cache
- ✨ Compatibilidade completa Windows/Linux
- ✨ Design responsivo completo
- ✨ Remoção de Material-UI
- 🐛 Correções de CORS
- 🐛 Correções de caminhos cross-platform
- 🐛 Melhorias de validação e tratamento de erros

### Novembro 2024
- ✨ Suporte a LID (Linked ID) do WhatsApp
- ⚡ Otimizações de performance

---

## 📄 Licença

Este projeto é proprietário. Todos os direitos reservados.

---

## 👥 Contribuidores

Desenvolvido e mantido pela equipe Multivus.

---

**Última atualização**: Janeiro 2025
