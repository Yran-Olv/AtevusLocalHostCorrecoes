# 📊 Análise Completa do FlowBuilder

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Dados](#estrutura-de-dados)
4. [Componentes Frontend](#componentes-frontend)
5. [Serviços Backend](#serviços-backend)
6. [Tipos de Nós](#tipos-de-nós)
7. [Fluxo de Execução](#fluxo-de-execução)
8. [Integrações](#integrações)
9. [Problemas Identificados](#problemas-identificados)
10. [Recomendações](#recomendações)

---

## 🎯 Visão Geral

O **FlowBuilder** é um sistema de construção de fluxos conversacionais (chatbots) visual, permitindo criar automações complexas para WhatsApp e Facebook Messenger. O sistema utiliza uma arquitetura baseada em nós (nodes) e conexões (edges), similar a ferramentas como Zapier ou Make.com.

### Funcionalidades Principais:
- ✅ Editor visual de fluxos (React Flow)
- ✅ Múltiplos tipos de nós (mensagem, menu, condição, intervalo, etc.)
- ✅ Integração com tickets e filas
- ✅ Suporte a mídias (imagem, áudio, vídeo)
- ✅ Campanhas e disparos automáticos
- ✅ Webhooks externos
- ✅ Randomizadores e condições

---

## 🏗️ Arquitetura

### Backend (Node.js + TypeScript + Sequelize)

```
backend/src/
├── models/
│   └── FlowBuilder.ts          # Modelo do banco de dados
├── controllers/
│   └── FlowBuilderController.ts # Endpoints REST
├── routes/
│   └── flowBuilderRoutes.ts    # Rotas da API
├── services/
│   ├── FlowBuilderService/     # CRUD de fluxos
│   └── WebhookService/
│       └── ActionsWebhookService.ts # Executor de nós
└── services/WbotServices/
    └── wbotMessageListener.ts  # Integração WhatsApp
```

### Frontend (React + Material-UI + React Flow)

```
frontend/src/
├── pages/
│   ├── FlowBuilder/            # Lista de fluxos
│   └── FlowBuilderConfig/      # Editor visual
│       └── nodes/              # Componentes de nós
├── components/
│   ├── FlowBuilderModal/       # Modal de criação
│   ├── FlowBuilderAddTextModal/
│   ├── FlowBuilderMenuModal/
│   └── ... (outros modais)
└── stores/
    └── useNodeStorage.js       # Estado global (Zustand)
```

---

## 💾 Estrutura de Dados

### Modelo FlowBuilder (Banco de Dados)

```typescript
{
  id: number;                    // ID único
  user_id: number;               // Criador do fluxo
  company_id: number;            // Empresa proprietária
  name: string;                   // Nome do fluxo
  active: boolean;                // Status ativo/inativo
  flow: {                         // JSON com estrutura do fluxo
    nodes: INodes[];             // Array de nós
    connections: IConnections[]; // Array de conexões
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Estrutura de Nós (INodes)

```typescript
interface INodes {
  id: string;                    // ID único do nó (30 caracteres aleatórios)
  position: { x: number; y: number };
  type: string;                   // Tipo: "start" | "message" | "menu" | "condition" | etc.
  data: {
    label?: string;              // Texto da mensagem
    message?: string;             // Mensagem do menu
    arrayOption?: Array<{        // Opções do menu
      number: number;
      value: string;
    }>;
    key?: string;                 // Chave da condição
    condition?: string;           // Operador da condição
    value?: string;               // Valor da condição
    sec?: number;                 // Segundos do intervalo
    url?: string;                 // URL de mídia
    percent?: number;             // Percentual do randomizador
    seq?: string[];               // Sequência do singleBlock
    elements?: Array<{            // Elementos do singleBlock
      number: string;
      value: string;
      original?: string;
      record?: boolean;
    }>;
    id?: number;                  // ID da fila (ticket node)
  };
  style?: {
    backgroundColor: string;
    padding: number;
    borderRadius: number;
  };
}
```

### Estrutura de Conexões (IConnections)

```typescript
interface IConnections {
  id: string;                     // ID único da conexão
  source: string;                 // ID do nó origem
  target: string;                  // ID do nó destino
  sourceHandle?: string;           // Handle específico (ex: "a1" para menu)
  targetHandle?: string;
}
```

### Campos do Ticket Relacionados

```typescript
{
  flowWebhook: boolean;           // Indica se está em um fluxo
  lastFlowId: string;             // ID do último nó executado
  hashFlowId: string;              // Hash do webhook (se aplicável)
  flowStopped: string;             // ID do fluxo ativo
  dataWebhook: {} | null;          // Dados do webhook
}
```

---

## 🎨 Componentes Frontend

### 1. Página de Listagem (`FlowBuilder/index.js`)

**Funcionalidades:**
- Lista todos os fluxos da empresa
- Busca por nome
- Ações: Criar, Editar, Duplicar, Excluir
- Navegação para editor

**Componentes Utilizados:**
- `FlowBuilderModal`: Modal de criação/edição de nome
- `ConfirmationModal`: Confirmação de exclusão/duplicação
- Socket.io para atualizações em tempo real

### 2. Editor Visual (`FlowBuilderConfig/index.js`)

**Funcionalidades:**
- Editor drag-and-drop (React Flow)
- SpeedDial para adicionar nós
- Salvamento automático
- Duplo clique para editar nós
- MiniMap e Controls

**Bibliotecas:**
- `react-flow-renderer`: Editor visual
- `@mui/material`: UI components
- `zustand`: Gerenciamento de estado

### 3. Tipos de Nós (Frontend)

Cada tipo de nó tem seu próprio componente em `nodes/`:

- **startNode.js**: Nó inicial (verde)
- **messageNode.js**: Mensagem de texto
- **menuNode.js**: Menu com opções numeradas
- **conditionNode.js**: Condição lógica
- **intervalNode.js**: Intervalo de tempo
- **imgNode.js**: Imagem
- **audioNode.js**: Áudio
- **videoNode.js**: Vídeo
- **randomizerNode.js**: Randomizador de caminhos
- **singleBlockNode.js**: Bloco com múltiplos elementos
- **ticketNode.js**: Transferência para fila

---

## ⚙️ Serviços Backend

### 1. CRUD de Fluxos

#### `CreateFlowBuilderService.ts`
- Cria novo fluxo
- Valida nome duplicado
- Retorna `'exist'` se nome já existe

#### `UpdateFlowBuilderService.ts`
- Atualiza nome do fluxo
- Valida duplicação

#### `DeleteFlowBuilderService.ts`
- Remove fluxo do banco

#### `ListFlowBuilderService.ts`
- Lista todos os fluxos da empresa

#### `GetFlowBuilderService.ts`
- Busca fluxo específico por ID

#### `FlowUpdateDataService.ts`
- **CRÍTICO**: Salva estrutura completa do fluxo (nodes + connections)
- Atualiza campo `flow` (JSON)

#### `DuplicateFlowBuilderService.ts`
- Duplica fluxo existente

### 2. Upload de Mídias

#### `UploadImgFlowBuilderService.ts`
- Upload de imagens
- Retorna caminho relativo

#### `UploadAudioFlowBuilderService.ts`
- Upload de áudios
- Suporta gravação

#### `UploadAllFlowBuilderService.ts`
- Upload múltiplo (imagens, áudios, vídeos)

### 3. Executor de Fluxos

#### `ActionsWebhookService.ts` ⭐ **CORE**

**Responsabilidades:**
- Executa nós sequencialmente
- Processa diferentes tipos de nós
- Gerencia estado do ticket
- Envia mensagens via WhatsApp
- Controla navegação entre nós

**Parâmetros:**
```typescript
ActionsWebhookService(
  whatsappId: number,
  idFlowDb: number,
  companyId: number,
  nodes: INodes[],
  connects: IConnections[],
  nextStage: string,              // ID do próximo nó
  dataWebhook: any,                // Dados do webhook
  details: any,                     // Detalhes do webhook
  hashWebhookId: string,
  pressKey?: string,                // Tecla pressionada (menu)
  idTicket?: number,
  numberPhrase?: {                  // Dados do contato
    number: string;
    name: string;
    email: string;
  }
)
```

**Fluxo de Execução:**
1. Processa dados do contato (nome, número, email)
2. Loop através de todos os nós
3. Identifica nó atual (`nextStage`)
4. Executa ação baseada no tipo do nó
5. Determina próximo nó através de conexões
6. Atualiza ticket com estado do fluxo

---

## 🔧 Tipos de Nós

### 1. **start** (Início)
- Nó inicial do fluxo
- Sempre o primeiro nó
- Não executa ação, apenas marca início

### 2. **message** (Mensagem)
- Envia mensagem de texto
- Suporta variáveis Mustache (`{{nome}}`, `{{numero}}`, etc.)
- Usa `SendMessage()` ou `SendWhatsAppMessage()`

### 3. **menu** (Menu)
- Exibe menu com opções numeradas
- Usuário responde com número (1, 2, 3...)
- Cada opção tem conexão própria (`sourceHandle: "a1"`, `"a2"`, etc.)
- Aguarda resposta do usuário

### 4. **condition** (Condição)
- Avalia condição lógica
- Compara valor de campo com operador
- Redireciona para caminho "true" ou "false"
- **⚠️ PROBLEMA**: Não implementado completamente no backend

### 5. **interval** (Intervalo)
- Aguarda X segundos antes de continuar
- Usa `intervalWhats(seconds)`
- Útil para simular digitação humana

### 6. **img** (Imagem)
- Envia imagem
- Caminho relativo: `public/flowbuilder/img/...`
- Usa `SendMessage()` com `mediaPath`

### 7. **audio** (Áudio)
- Envia áudio
- Suporta gravação (`record: true`)
- Usa `SendWhatsAppMediaFlow()`

### 8. **video** (Vídeo)
- Envia vídeo
- Similar ao áudio

### 9. **randomizer** (Randomizador)
- Escolhe caminho aleatoriamente
- Baseado em percentual (ex: 70% caminho A, 30% caminho B)
- Usa `randomizarCaminho(percent)`

### 10. **singleBlock** (Conteúdo)
- Bloco com múltiplos elementos em sequência
- Pode conter: mensagens, intervalos, imagens, áudios, vídeos
- Executa todos os elementos antes de continuar
- **Muito usado** para fluxos complexos

### 11. **ticket** (Transferência)
- Transfere ticket para fila
- Atualiza status para `pending`
- Envia mensagem de boas-vindas da fila
- **Interrompe fluxo** e aguarda atendimento humano

---

## 🔄 Fluxo de Execução

### Cenário 1: Primeira Mensagem (Integração na Conexão)

```
1. Usuário envia primeira mensagem
2. Sistema verifica se conexão tem integrationId
3. Busca integração (type === "flowbuilder")
4. Busca fluxo associado
5. Chama flowbuilderIntegration()
6. Inicia ActionsWebhookService() com primeiro nó
7. Executa nós sequencialmente
8. Atualiza ticket.flowStopped, ticket.lastFlowId
```

### Cenário 2: Resposta em Menu

```
1. Usuário responde com número (ex: "1")
2. Sistema detecta que ticket está em fluxo (flowStopped !== null)
3. Detecta que último nó era "menu"
4. Chama flowBuilderQueue()
5. ActionsWebhookService() recebe pressKey = "1"
6. Busca conexão com sourceHandle = "a1"
7. Continua fluxo a partir do nó destino
```

### Cenário 3: Campanha (Disparo por Frase)

```
1. Usuário envia frase específica (ex: "PROMOÇÃO")
2. Sistema busca em FlowCampaigns
3. Encontra fluxo associado à frase
4. Inicia ActionsWebhookService() com dados do contato
5. Executa fluxo completo
```

### Cenário 4: Webhook Externo

```
1. Webhook externo chama endpoint
2. DispatchWebHookService() recebe dados
3. Busca fluxo configurado no webhook
4. Inicia ActionsWebhookService() com dados do webhook
5. Processa variáveis do webhook (nome, celular, email)
6. Executa fluxo
```

---

## 🔗 Integrações

### 1. **WhatsApp (wbotMessageListener.ts)**

**Pontos de Integração:**
- `flowbuilderIntegration()`: Primeira mensagem
- `flowBuilderQueue()`: Respostas em menus
- `handleMessageIntegration()`: Campanhas

**Condições para Ativação:**
```typescript
!ticket.imported &&
!msg.key.fromMe &&
!ticket.isGroup &&
!ticket.queue &&
!ticket.user &&
!isMenu &&
(!ticket.dataWebhook || ticket.dataWebhook["status"] === "stopped") &&
!isNil(whatsapp.integrationId) &&
!ticket.useIntegration
```

### 2. **Facebook Messenger (facebookMessageListener.ts)**

**Similar ao WhatsApp**, mas usa:
- `ActionsWebhookFacebookService()` (versão adaptada)
- `flowBuilderQueue()` específico para Facebook

### 3. **Filas (Queues)**

**Integração:**
- Nó `ticket` transfere para fila
- Atualiza `ticket.queueId`
- Envia mensagem de boas-vindas
- Interrompe fluxo até atendimento humano

### 4. **Webhooks Externos**

**Fluxo:**
1. Webhook recebe dados externos
2. Mapeia campos (nome, celular, email)
3. Inicia fluxo com dados mapeados
4. Variáveis disponíveis via Mustache

---

## ❌ Problemas Identificados

### 🔴 **CRÍTICOS**

#### 1. **Nó "condition" Não Implementado**
- **Localização**: `ActionsWebhookService.ts`
- **Problema**: Tipo "condition" existe no frontend, mas não há lógica de execução no backend
- **Impacto**: Fluxos com condições não funcionam
- **Solução**: Implementar lógica de avaliação de condições

#### 2. **Erro de Sintaxe no flowBuilderQueue**
- **Localização**: `wbotMessageListener.ts:3116`
- **Código**:
```typescript
body
ticket.id,  // ❌ Falta vírgula
```
- **Impacto**: Erro de compilação/execução
- **Solução**: Adicionar vírgula

#### 3. **Falta Validação de Fluxo Vazio**
- **Problema**: Permite salvar fluxo sem nós ou conexões
- **Impacto**: Fluxos inválidos no banco
- **Solução**: Validar antes de salvar

#### 4. **Console.log Excessivo**
- **Localização**: `ActionsWebhookService.ts` (múltiplos)
- **Impacto**: Performance e exposição de dados sensíveis
- **Solução**: Usar `logger` utility

### 🟡 **MÉDIOS**

#### 5. **Falta Tratamento de Erros**
- **Problema**: Muitos `try/catch` sem tratamento adequado
- **Impacto**: Erros silenciosos
- **Solução**: Logging estruturado + Sentry

#### 6. **Race Conditions em Menus**
- **Problema**: Múltiplas mensagens podem processar menu simultaneamente
- **Impacto**: Fluxo pode pular nós
- **Solução**: Lock por ticket durante processamento

#### 7. **Falta Validação de Tipos**
- **Problema**: TypeScript não valida estrutura de nós
- **Impacto**: Erros em runtime
- **Solução**: Interfaces mais rígidas + validação

#### 8. **Performance em Fluxos Grandes**
- **Problema**: Loop sequencial em todos os nós
- **Impacto**: Lento para fluxos com 100+ nós
- **Solução**: Otimizar busca de nós (Map em vez de filter)

#### 9. **Falta Timeout**
- **Problema**: Fluxo pode travar indefinidamente
- **Impacto**: Tickets presos
- **Solução**: Timeout por nó (ex: 30s)

#### 10. **Duplicação de Código**
- **Problema**: `ActionsWebhookService` e `ActionsWebhookFacebookService` muito similares
- **Impacto**: Manutenção difícil
- **Solução**: Extrair lógica comum

### 🟢 **MELHORIAS**

#### 11. **Falta Testes**
- **Problema**: Nenhum teste unitário/integração
- **Solução**: Adicionar testes para cada tipo de nó

#### 12. **Documentação Incompleta**
- **Problema**: Falta documentação de variáveis Mustache
- **Solução**: Documentar todas as variáveis disponíveis

#### 13. **UI/UX**
- **Problema**: SpeedDial pode ser confuso
- **Solução**: Sidebar com categorias de nós

#### 14. **Validação de Conexões**
- **Problema**: Permite conexões inválidas (ex: menu sem opções)
- **Solução**: Validação no frontend antes de salvar

---

## 💡 Recomendações

### **Prioridade ALTA**

1. **Corrigir Erro de Sintaxe** (5 min)
   ```typescript
   // wbotMessageListener.ts:3116
   body,  // ✅ Adicionar vírgula
   ticket.id,
   ```

2. **Implementar Nó Condition** (2-4 horas)
   ```typescript
   if (nodeSelected.type === "condition") {
     const fieldValue = getFieldValue(nodeSelected.data.key, dataWebhook);
     const conditionMet = evaluateCondition(
       fieldValue,
       nodeSelected.data.condition,
       nodeSelected.data.value
     );
     
     const connections = connects.filter(c => c.source === nodeSelected.id);
     next = conditionMet 
       ? connections.find(c => c.sourceHandle === "true")?.target
       : connections.find(c => c.sourceHandle === "false")?.target;
   }
   ```

3. **Substituir console.log por logger** (1 hora)
   ```typescript
   // Substituir todos os console.log por:
   logger.debug('ActionWebhookService', { idFlowDb, nextStage });
   logger.error('Erro ao processar nó', error);
   ```

4. **Adicionar Validação de Fluxo** (1 hora)
   ```typescript
   // FlowUpdateDataService.ts
   if (!bodyData.nodes || bodyData.nodes.length === 0) {
     throw new AppError('Fluxo deve ter pelo menos um nó');
   }
   if (!bodyData.nodes.find(n => n.type === 'start')) {
     throw new AppError('Fluxo deve ter um nó inicial');
   }
   ```

### **Prioridade MÉDIA**

5. **Otimizar Performance** (2-3 horas)
   ```typescript
   // Criar Map para busca O(1)
   const nodesMap = new Map(nodes.map(n => [n.id, n]));
   const connectionsMap = new Map(
     connects.map(c => [`${c.source}-${c.sourceHandle || ''}`, c])
   );
   
   // Busca rápida
   const node = nodesMap.get(next);
   const connection = connectionsMap.get(`${node.id}-a1`);
   ```

6. **Adicionar Timeout** (1 hora)
   ```typescript
   const TIMEOUT_PER_NODE = 30000; // 30s
   const startTime = Date.now();
   
   if (Date.now() - startTime > TIMEOUT_PER_NODE) {
     logger.warn('Timeout no fluxo', { idFlowDb, idTicket });
     await ticket.update({ flowStopped: null, lastFlowId: null });
     break;
   }
   ```

7. **Tratamento de Erros Robusto** (2 horas)
   ```typescript
   try {
     // execução do nó
   } catch (error) {
     logger.error('Erro ao executar nó', {
       nodeId: nodeSelected.id,
       nodeType: nodeSelected.type,
       error: error.message,
       stack: error.stack
     });
     
     Sentry.captureException(error, {
       tags: { nodeType: nodeSelected.type },
       extra: { nodeId: nodeSelected.id, flowId: idFlowDb }
     });
     
     // Continuar ou parar fluxo?
     break; // ou next = null;
   }
   ```

### **Prioridade BAIXA**

8. **Refatorar Código Duplicado** (4-6 horas)
   - Extrair lógica comum de `ActionsWebhookService` e `ActionsWebhookFacebookService`
   - Criar `BaseActionsWebhookService` com lógica compartilhada

9. **Adicionar Testes** (8-12 horas)
   - Testes unitários para cada tipo de nó
   - Testes de integração para fluxos completos
   - Testes de edge cases (nós inválidos, conexões quebradas)

10. **Melhorar UI/UX** (4-6 horas)
    - Sidebar com categorias de nós
    - Preview de fluxo antes de salvar
    - Validação visual de conexões

---

## 📊 Métricas e Monitoramento

### **Métricas Recomendadas:**

1. **Performance:**
   - Tempo médio de execução por nó
   - Tempo total de fluxo
   - Nós mais lentos

2. **Erros:**
   - Taxa de erro por tipo de nó
   - Fluxos que mais falham
   - Timeouts

3. **Uso:**
   - Fluxos mais usados
   - Tipos de nós mais comuns
   - Tamanho médio de fluxos

### **Implementação:**

```typescript
// Adicionar ao ActionsWebhookService
const metrics = {
  startTime: Date.now(),
  nodesExecuted: 0,
  errors: []
};

// Ao finalizar
logger.info('Fluxo executado', {
  flowId: idFlowDb,
  duration: Date.now() - metrics.startTime,
  nodesExecuted: metrics.nodesExecuted,
  errors: metrics.errors.length
});
```

---

## 🔒 Segurança

### **Problemas Identificados:**

1. **Validação de Permissões:**
   - ✅ Já existe (`isAuth` middleware)
   - ⚠️ Falta validar se usuário pertence à empresa

2. **Sanitização de Dados:**
   - ⚠️ Mensagens não são sanitizadas antes de enviar
   - ⚠️ URLs de mídia não são validadas

3. **Rate Limiting:**
   - ⚠️ Não há limite de execuções simultâneas por fluxo
   - ⚠️ Pode causar spam

### **Recomendações:**

```typescript
// Validar empresa
if (flow.company_id !== companyId) {
  throw new AppError('Fluxo não pertence à empresa');
}

// Sanitizar mensagens
const sanitizedMessage = sanitizeHtml(nodeSelected.data.label);

// Rate limiting
const activeExecutions = await getActiveExecutions(idFlowDb);
if (activeExecutions > MAX_CONCURRENT_EXECUTIONS) {
  throw new AppError('Muitas execuções simultâneas');
}
```

---

## 📝 Conclusão

O **FlowBuilder** é um sistema robusto e funcional, mas possui algumas lacunas importantes:

### **Pontos Fortes:**
- ✅ Arquitetura bem estruturada
- ✅ Suporte a múltiplos tipos de mídia
- ✅ Integração com tickets e filas
- ✅ Editor visual intuitivo

### **Pontos Fracos:**
- ❌ Nó "condition" não implementado
- ❌ Erro de sintaxe crítico
- ❌ Falta validação e tratamento de erros
- ❌ Performance pode melhorar

### **Próximos Passos:**
1. Corrigir erros críticos (sintaxe, condition)
2. Adicionar validações e tratamento de erros
3. Otimizar performance
4. Adicionar testes
5. Melhorar documentação

---

**Última atualização:** Janeiro 2025  
**Versão analisada:** 2.2.2v-26

