# 📚 Wiki - Documentação Completa do Projeto Multivus

## 🎯 Sobre o Projeto

**Multivus** é um sistema SaaS de multiatendimento via WhatsApp que integra API oficial ou não oficial, permitindo gerenciar múltiplos números e múltiplos atendentes. O **FlowBuilder** é um módulo adicional que adiciona automação conversacional, permitindo criar fluxos de atendimento, chatbots inteligentes e lógicas condicionais sem editar código.

**Versão**: 2.2.2v-26  
**Ano de Origem**: 2014 (código legado modernizado)  
**Ambiente Dev**: Windows (localhost)  
**Ambiente Prod**: Ubuntu 22.04 LTS (VPS)

---

## 📂 Estrutura da Documentação

### 🔧 Backend
- [📋 Visão Geral do Backend](./BACKEND/00-VISAO-GERAL.md) - Arquitetura, tecnologias e visão geral
- [📁 Estrutura de Pastas](./BACKEND/01-ESTRUTURA-PASTAS.md) - Organização completa do código (600+ arquivos)
- [🎮 Controllers](./BACKEND/02-CONTROLLERS.md) - 47 controllers detalhados com rotas e métodos
- [🗄️ Models (Banco de Dados)](./BACKEND/03-MODELS.md) - 55 models com relacionamentos e estrutura
- [📡 API Externa](./RESUMO-API-BACKEND.md) - Documentação completa da API REST

### 🎨 Frontend
- [📋 Visão Geral do Frontend](./FRONTEND/00-VISAO-GERAL.md) - Arquitetura React, tecnologias e funcionalidades
- [📁 Estrutura de Pastas](./FRONTEND/01-ESTRUTURA-PASTAS.md) - Organização completa (500+ arquivos)

### 📖 Documentação Existente
- [📋 Resumo API Backend](./RESUMO-API-BACKEND.md) - Endpoints, autenticação, WebSocket
- [🔧 Correções Aplicadas](./CORRECOES-APLICADAS.md) - Histórico de correções e melhorias
- [📋 Checklist Modernização](./CHECKLIST-MODERNIZACAO.md) - Checklist de modernização
- [🎨 Design Responsividade](./DESIGN-RESPONSIVIDADE.md) - Guia de design e responsividade
- [📝 Mensagens WhatsApp](./MENSAGENS-WHATSAPP.md) - Sistema de mensagens
- [📊 Análise Backend](./ANALISE-BACKEND.md) - Análise técnica do backend
- [📊 Análise Frontend](./ANALISE-FRONTEND.md) - Análise técnica do frontend
- [📋 Resumo Análise Completa](./RESUMO-ANALISE-COMPLETA.md) - Resumo executivo
- [📋 Plano Modernização Frontend](./PLANO-MODERNIZACAO-FRONTEND.md) - Plano de modernização
- [📋 Estrutura Backend](./ESTRUTURA-BACKEND.md) - Estrutura detalhada do backend

---

## 🚀 Início Rápido

### Backend
```bash
cd backend
npm install --force
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
npm start
```

### Frontend
```bash
cd frontend
npm install --force
npm start
```

---

## 📝 Notas Importantes

- **Ambiente de Desenvolvimento**: Windows (localhost)
- **Ambiente de Produção**: Ubuntu 22.04 LTS (VPS)
- **Banco de Dados**: PostgreSQL
- **Cache**: Redis
- **Process Manager**: PM2 (produção)

---

**Última Atualização**: 2025-01-27
