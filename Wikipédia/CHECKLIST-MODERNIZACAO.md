# ✅ Checklist de Modernização - Frontend Whaticket

## 📋 Checklist Geral

Use este checklist para acompanhar o progresso da modernização do frontend.

---

## 🔴 FASE 1: Fundação e Dependências (Prioridade ALTA)

### Preparação
- [ ] Criar branch `modernization` do `main`
- [ ] Fazer backup completo do código atual
- [ ] Criar tag de versão atual: `v2.2.2-pre-modernization`
- [ ] Documentar estado atual (screenshots, funcionalidades)

### Atualizar Axios
- [ ] `npm install axios@^1.7.7`
- [ ] Testar login/logout
- [ ] Testar todas as chamadas de API
- [ ] Verificar interceptors funcionando
- [ ] Commit: `chore: atualizar axios para 1.7.7`

### Atualizar React Query
- [ ] `npm uninstall react-query`
- [ ] `npm install @tanstack/react-query@^5.0.0`
- [ ] Atualizar imports: `react-query` → `@tanstack/react-query`
- [ ] Testar queries existentes
- [ ] Commit: `chore: atualizar react-query para v5`

### Remover Moment.js
- [ ] `npm uninstall moment`
- [ ] Buscar todos os usos: `grep -r "moment" frontend/src`
- [ ] Substituir por date-fns
- [ ] Testar formatação de datas
- [ ] Commit: `refactor: substituir moment.js por date-fns`

### Atualizar Entry Point
- [ ] Atualizar `index.js` para usar `createRoot`
- [ ] Testar inicialização da aplicação
- [ ] Commit: `refactor: usar createRoot do React 18`

### Validação Fase 1
- [ ] Aplicação inicia sem erros
- [ ] Login funciona
- [ ] Todas as páginas carregam
- [ ] Socket.IO conecta
- [ ] Sem erros no console
- [ ] Performance mantida

**Status Fase 1**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

---

## 🎨 FASE 2: Design System e Responsividade (Prioridade CRÍTICA)

### ⚠️ IMPORTANTE: Design Totalmente Novo
- [ ] Revisar documento `DESIGN-RESPONSIVIDADE.md`
- [ ] Definir que o design será **totalmente diferente** do atual
- [ ] Design deve ser **profissional e elegante**
- [ ] Responsividade para **Android, iOS e Desktop**

### Criar Design System
- [ ] Definir paleta de cores moderna
- [ ] Escolher tipografia (sugestão: Inter)
- [ ] Definir sistema de espaçamento
- [ ] Criar tema base (MUI v5)
- [ ] Configurar breakpoints
- [ ] Criar componentes base (Button, Input, Card)
- [ ] Documentar design system
- [ ] Commit: `feat: criar novo design system`

### Implementar Responsividade
- [ ] Criar hook `useResponsive`
- [ ] Implementar layout mobile (< 600px)
- [ ] Implementar layout tablet (600px - 1199px)
- [ ] Implementar layout desktop (≥ 1200px)
- [ ] Testar em dispositivos Android reais
- [ ] Testar em dispositivos iOS reais
- [ ] Testar em diferentes navegadores desktop
- [ ] Testar orientação portrait/landscape
- [ ] Commit: `feat: implementar responsividade completa`

### Componentes Responsivos Base
- [ ] Header/Navbar responsivo
- [ ] Sidebar/Drawer responsivo
- [ ] Cards responsivos
- [ ] Tabelas responsivas (transformar em cards no mobile)
- [ ] Formulários responsivos
- [ ] Modals/Dialogs responsivos (full-screen no mobile)
- [ ] Commit: `feat: criar componentes base responsivos`

### Validação Fase 2
- [ ] Design totalmente diferente do atual
- [ ] Funciona perfeitamente no mobile (Android/iOS)
- [ ] Funciona perfeitamente no tablet
- [ ] Funciona perfeitamente no desktop
- [ ] Touch targets ≥ 44px no mobile
- [ ] Performance adequada em todos os dispositivos
- [ ] Dark mode funcional em todos os dispositivos

**Status Fase 2**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

## 🎨 FASE 2.5: Migração Material-UI (Prioridade ALTA)

### Preparação
- [ ] Auditar uso de Material-UI v4: `grep -r "@material-ui" frontend/src`
- [ ] Listar todos os componentes que usam v4
- [ ] Criar plano de migração componente por componente
- [ ] Priorizar componentes críticos (Layout, Tickets, Messages)

### Instalar MUI v5 (se necessário)
- [ ] `npm install @mui/material @mui/icons-material`
- [ ] Verificar versão instalada

### Migrar Layout Principal
- [ ] `layout/index.js` - Migrar para MUI v5
- [ ] `layout/MainListItems.js` - Migrar para MUI v5
- [ ] Testar menu lateral
- [ ] Testar responsividade
- [ ] Commit: `refactor(layout): migrar para MUI v5`

### Migrar Componentes de Autenticação
- [ ] `pages/Login/index.js` - Migrar para MUI v5
- [ ] `pages/Signup/index.js` - Migrar para MUI v5
- [ ] Testar login/signup
- [ ] Commit: `refactor(auth): migrar para MUI v5`

### Migrar Componentes de Tickets
- [ ] `components/Ticket/` - Migrar para MUI v5
- [ ] `components/TicketsManager/` - Migrar para MUI v5
- [ ] `components/TicketListItem/` - Migrar para MUI v5
- [ ] Testar listagem de tickets
- [ ] Testar visualização de ticket
- [ ] Commit: `refactor(tickets): migrar para MUI v5`

### Migrar Componentes de Mensagens
- [ ] `components/MessageInput/` - Migrar para MUI v5
- [ ] `components/MessagesList/` - Migrar para MUI v5
- [ ] Testar envio de mensagens
- [ ] Testar recebimento de mensagens
- [ ] Commit: `refactor(messages): migrar para MUI v5`

### Migrar Outros Componentes
- [ ] Migrar componentes restantes gradualmente
- [ ] Testar cada componente após migração
- [ ] Commit incremental: `refactor(componente): migrar para MUI v5`

### Remover Material-UI v4
- [ ] `npm uninstall @material-ui/core @material-ui/icons @material-ui/lab @material-ui/pickers @material-ui/styles`
- [ ] Verificar que não há mais imports de v4
- [ ] Testar aplicação completa
- [ ] Commit: `chore: remover Material-UI v4 completamente`

### Validação Fase 2
- [ ] Nenhum import de `@material-ui/*` restante
- [ ] Todos os componentes renderizam corretamente
- [ ] Dark mode funciona
- [ ] Responsividade mantida
- [ ] Bundle size reduzido
- [ ] Performance mantida ou melhorada

**Status Fase 2**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

---

## 🛣️ FASE 3: React Router v6 (Prioridade ALTA)

### Preparação
- [ ] Auditar rotas atuais
- [ ] Documentar estrutura de rotas
- [ ] Identificar rotas protegidas

### Instalar React Router v6
- [ ] `npm install react-router-dom@^6.20.0`
- [ ] Verificar versão instalada

### Atualizar Estrutura de Rotas
- [ ] Atualizar `routes/index.js` para usar `Routes` ao invés de `Switch`
- [ ] Converter `component` prop para `element`
- [ ] Atualizar `Route.js` para usar `Outlet` e `Navigate`
- [ ] Testar navegação básica
- [ ] Commit: `refactor(routes): migrar para React Router v6`

### Atualizar useHistory → useNavigate
- [ ] Buscar todos os usos: `grep -r "useHistory" frontend/src`
- [ ] Substituir por `useNavigate`
- [ ] Atualizar chamadas: `history.push()` → `navigate()`
- [ ] Testar navegação programática
- [ ] Commit: `refactor: substituir useHistory por useNavigate`

### Atualizar Redirects
- [ ] Substituir `<Redirect>` por `<Navigate>`
- [ ] Atualizar lógica de redirecionamento
- [ ] Testar redirecionamentos
- [ ] Commit: `refactor: usar Navigate ao invés de Redirect`

### Validação Fase 3
- [ ] Todas as rotas funcionam
- [ ] Navegação programática funciona
- [ ] Rotas protegidas funcionam
- [ ] Redirecionamentos funcionam
- [ ] Sem warnings no console
- [ ] Performance mantida

**Status Fase 3**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

---

## 🔷 FASE 4: TypeScript (Prioridade MÉDIA)

### Configuração
- [ ] Atualizar `tsconfig.json` com configurações corretas
- [ ] Configurar paths aliases
- [ ] Testar compilação TypeScript

### Criar Types Base
- [ ] `types/index.ts` - Criar interfaces principais
- [ ] `types/user.ts` - Interface User
- [ ] `types/ticket.ts` - Interface Ticket
- [ ] `types/message.ts` - Interface Message
- [ ] `types/api.ts` - Tipos de API
- [ ] Commit: `feat: adicionar types base`

### Migrar Services
- [ ] `services/api.js` → `services/api.ts`
- [ ] `services/socket.js` → `services/socket.ts`
- [ ] Adicionar tipos em todas as funções
- [ ] Testar serviços
- [ ] Commit: `refactor(services): migrar para TypeScript`

### Migrar Hooks
- [ ] `hooks/useAuth.js/` → `hooks/useAuth.ts`
- [ ] `hooks/useTickets/` → `hooks/useTickets.ts`
- [ ] Adicionar tipos de retorno
- [ ] Testar hooks
- [ ] Commit: `refactor(hooks): migrar para TypeScript`

### Migrar Componentes (Gradual)
- [ ] Migrar componentes críticos primeiro
- [ ] Adicionar tipos de props
- [ ] Testar cada componente
- [ ] Commit incremental

### Validação Fase 4
- [ ] TypeScript compila sem erros
- [ ] Tipos corretos em todos os lugares
- [ ] Autocomplete funcionando
- [ ] Sem erros de tipo
- [ ] Funcionalidades mantidas

**Status Fase 4**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

---

## 🗄️ FASE 5: Estado com Zustand (Prioridade MÉDIA)

### Criar Stores
- [ ] `stores/authStore.ts` - Store de autenticação
- [ ] `stores/ticketsStore.ts` - Store de tickets (se necessário)
- [ ] `stores/uiStore.ts` - Store de UI (theme, etc)
- [ ] Testar stores isoladamente
- [ ] Commit: `feat: adicionar stores Zustand`

### Migrar AuthContext
- [ ] Refatorar `context/Auth/AuthContext.js` para usar Zustand
- [ ] Manter compatibilidade com código existente
- [ ] Testar autenticação
- [ ] Commit: `refactor(auth): usar Zustand`

### Migrar Outros Contextos
- [ ] Avaliar quais contextos podem ser migrados
- [ ] Migrar gradualmente
- [ ] Testar após cada migração
- [ ] Commit incremental

### Remover Contextos Não Utilizados
- [ ] Identificar contextos não utilizados
- [ ] Remover código morto
- [ ] Testar aplicação
- [ ] Commit: `chore: remover contextos não utilizados`

### Validação Fase 5
- [ ] Estado funciona corretamente
- [ ] Menos re-renders
- [ ] Performance melhorada
- [ ] Código mais limpo

**Status Fase 5**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

---

## ⚡ FASE 6: Otimizações (Prioridade BAIXA)

### Code Splitting
- [ ] Identificar rotas para lazy loading
- [ ] Implementar lazy loading nas rotas
- [ ] Adicionar Suspense boundaries
- [ ] Testar carregamento
- [ ] Commit: `perf: adicionar code splitting`

### Memoização
- [ ] Identificar componentes pesados
- [ ] Adicionar `React.memo` onde necessário
- [ ] Adicionar `useMemo` e `useCallback`
- [ ] Testar performance
- [ ] Commit: `perf: adicionar memoização`

### Bundle Optimization
- [ ] Analisar bundle size
- [ ] Identificar dependências grandes
- [ ] Otimizar imports
- [ ] Testar bundle final
- [ ] Commit: `perf: otimizar bundle size`

### Validação Fase 6
- [ ] Bundle size reduzido
- [ ] First Load melhorado
- [ ] Performance geral melhorada
- [ ] Lighthouse score melhorado

**Status Fase 6**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

---

## 🧪 FASE 7: Testes (Prioridade BAIXA)

### Configuração
- [ ] Configurar Jest
- [ ] Configurar React Testing Library
- [ ] Criar estrutura de testes
- [ ] Commit: `test: configurar ambiente de testes`

### Testes Unitários
- [ ] Testar hooks customizados
- [ ] Testar utilitários
- [ ] Testar services
- [ ] Commit: `test: adicionar testes unitários`

### Testes de Componentes
- [ ] Testar componentes críticos
- [ ] Testar formulários
- [ ] Testar navegação
- [ ] Commit: `test: adicionar testes de componentes`

### Testes de Integração
- [ ] Testar fluxo de login
- [ ] Testar fluxo de tickets
- [ ] Testar fluxo de mensagens
- [ ] Commit: `test: adicionar testes de integração`

### Validação Fase 7
- [ ] Cobertura de testes > 60%
- [ ] Todos os testes passando
- [ ] Testes rodando no CI/CD

**Status Fase 7**: ⬜ Não iniciada | 🟡 Em progresso | ✅ Concluída

---

## ✅ Validação Final

### Funcionalidades
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Listagem de tickets funciona
- [ ] Visualização de ticket funciona
- [ ] Envio de mensagens funciona
- [ ] Recebimento de mensagens funciona
- [ ] Socket.IO conecta
- [ ] Dark mode funciona
- [ ] Todas as páginas carregam
- [ ] Navegação funciona

### Performance
- [ ] Bundle size reduzido
- [ ] First Load < 2s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse score > 80

### Qualidade
- [ ] Sem erros no console
- [ ] Sem warnings críticos
- [ ] Código limpo e organizado
- [ ] Documentação atualizada

### Compatibilidade
- [ ] Compatível com backend atual
- [ ] APIs funcionando
- [ ] WebSocket funcionando
- [ ] Autenticação funcionando

---

## 📊 Progresso Geral

**Fase 1 (Fundação)**: ⬜ 0% | 🟡 50% | ✅ 100%  
**Fase 2 (UI)**: ⬜ 0% | 🟡 50% | ✅ 100%  
**Fase 3 (Router)**: ⬜ 0% | 🟡 50% | ✅ 100%  
**Fase 4 (TypeScript)**: ⬜ 0% | 🟡 50% | ✅ 100%  
**Fase 5 (Estado)**: ⬜ 0% | 🟡 50% | ✅ 100%  
**Fase 6 (Otimizações)**: ⬜ 0% | 🟡 50% | ✅ 100%  
**Fase 7 (Testes)**: ⬜ 0% | 🟡 50% | ✅ 100%

**Progresso Total**: ⬜ 0% | 🟡 50% | ✅ 100%

---

## 📝 Notas

Use este espaço para anotar problemas encontrados, soluções aplicadas, ou observações importantes durante a modernização:

```
[Data] - [Nota]
```

---

## 🎯 Próximas Ações

- [ ] Revisar checklist com equipe
- [ ] Definir responsáveis por cada fase
- [ ] Estabelecer cronograma
- [ ] Iniciar Fase 1

---

**Última Atualização**: [Data]  
**Responsável**: [Nome]  
**Status Geral**: ⬜ Não iniciado | 🟡 Em progresso | ✅ Concluído

