# 📨 Mensagens WhatsApp - Envio e Recebimento

Documentação sobre a lógica de envio e recebimento de mensagens do WhatsApp.

## 🏗️ Visão Geral

O sistema utiliza **Baileys** para comunicação com WhatsApp. As mensagens são processadas através de:
- **Listener** (`wbotMessageListener`) - Escuta eventos do Baileys
- **Services** - Processam e salvam mensagens
- **Filas Bull** - Processamento assíncrono (opcional)
- **Socket.IO** - Notificações em tempo real para frontend

---

## 📥 Recebimento de Mensagens

### Fluxo Completo

```
1. Baileys recebe mensagem
   ↓
2. wbotMessageListener (evento "messages.upsert")
   ↓
3. Validação (isValidMsg, filterMessages)
   ↓
4. Verifica se mensagem já existe no banco
   ↓
5. Adiciona à fila Bull OU processa diretamente (handleMessage)
   ↓
6. handleMessage:
   - Extrai contato (getContactMessage)
   - Cria/atualiza contato (CreateOrUpdateContactService)
   - Busca/cria ticket (FindOrCreateTicketService)
   - Baixa mídia (se houver)
   - Salva mensagem (CreateMessageService)
   - Emite evento Socket.IO
   ↓
7. Frontend recebe notificação em tempo real
```

### Componentes Principais

#### `wbotMessageListener` (`services/WbotServices/wbotMessageListener.ts`)
- **Evento:** `messages.upsert` - Nova mensagem recebida
- **Evento:** `messages.update` - Atualizações (leitura, status)
- **Evento:** `contacts.update` - Atualizações de contatos
- **Evento:** `groups.update` - Atualizações de grupos
- Filtra mensagens inválidas (stubs, protocolos)
- Verifica duplicatas no banco
- Detecta mensagens de campanha (`\u200c`)
- Adiciona à fila Bull ou processa diretamente

#### `handleMessage` (função interna)
**Processamento:**
1. Valida mensagem (`isValidMsg`)
2. Extrai contato (`getContactMessage`) - suporta LID/JID
3. Verifica/cria contato (`verifyContact` → `CreateOrUpdateContactService`)
4. Detecta grupos (`@g.us`)
5. Calcula mensagens não lidas (Redis cache)
6. Busca/cria ticket (`FindOrCreateTicketService`)
7. Processa mídia (download, conversão)
8. Salva mensagem (`CreateMessageService`)
9. Emite Socket.IO para frontend
10. Processa integrações (Chatbot, Dialogflow, Typebot, Webhooks)

#### `CreateOrUpdateContactService` (`services/ContactServices/`)
- Cria ou atualiza contato no banco
- Suporta LID (Linked ID) e JID
- Baixa foto de perfil
- Unifica duplicatas (LID → JID)
- Valida número real vs. LID embaralhado

#### `FindOrCreateTicketService` (`services/TicketServices/`)
- Busca ticket aberto existente
- Cria novo ticket se necessário
- Aplica regras de LGPD
- Define fila e usuário
- Considera tempo para criar novo ticket

#### `CreateMessageService` (`services/MessageServices/`)
- Salva mensagem no banco (PostgreSQL)
- Associa a ticket e contato
- Suporta mensagens privadas
- Inclui metadados (wid, ack, mediaType)
- Emite Socket.IO

---

## 📤 Envio de Mensagens

### Fluxo Completo

```
1. Frontend/API chama controller
   ↓
2. Controller valida e chama service
   ↓
3. Service obtém instância WhatsApp (GetTicketWbot)
   ↓
4. Prepara mensagem (formatação, mídia, opções)
   ↓
5. wbot.sendMessage() (Baileys)
   ↓
6. Salva mensagem no banco (CreateMessageService)
   ↓
7. Atualiza lastMessage do ticket
   ↓
8. Emite Socket.IO
```

### Componentes Principais

#### `SendWhatsAppMessage` (`services/WbotServices/SendWhatsAppMessage.ts`)
**Função:** Envia mensagem de texto
- Obtém instância WhatsApp do ticket
- Resolve número do contato (JID ou LID)
- Suporta mensagens com quote (resposta)
- Suporta vCard (contato)
- Formatação com Mustache (variáveis)
- Delay configurável
- Atualiza `lastMessage` do ticket

#### `SendWhatsAppMedia` (`services/WbotServices/SendWhatsAppMedia.ts`)
**Função:** Envia mídia (imagem, áudio, vídeo, documento)
- Processa diferentes tipos de mídia
- Converte áudio para Opus (FFmpeg)
- Detecta tipo por MIME
- Suporta legenda
- Upload para servidor
- Retorna URL da mídia

#### `GetTicketWbot` (`helpers/GetTicketWbot.ts`)
- Obtém instância WhatsApp ativa do ticket
- Retorna socket Baileys (`WASocket`)
- Valida `whatsappId` do ticket

### Chamadas de Envio

**Controllers que enviam:**
- `MessageController.store` - Envio manual pelo usuário
- `MessageController.forward` - Encaminhar mensagem
- `ApiController.sendMessage` - API externa
- `WhatsAppSessionController` - Mensagens automáticas

**Tipos suportados:**
- Texto simples
- Texto com formatação
- Imagens (JPG, PNG, WebP)
- Áudios (convertidos para Opus)
- Vídeos (MP4)
- Documentos (PDF, DOC, etc.)
- Stickers
- Localização
- Contatos (vCard)
- Mensagens com quote (resposta)

---

## 🔄 Processamento Assíncrono

### Filas Bull (Opcional)

Se `REDIS_URI_MSG_CONN` estiver configurado:

**Fila `handleMessage`:**
- Processa recebimento de mensagens
- Job ID: `{whatsappId}-handleMessage-{messageId}`
- Prioridade: 1

**Fila `handleMessageAck`:**
- Processa confirmações de leitura
- Atualiza status da mensagem (enviado, entregue, lido)

**Workers:**
- `jobs/handleMessageQueue.ts` - Processa mensagens
- `jobs/handleMessageAckQueue.ts` - Processa ACKs

---

## 📋 Tipos de Mensagens Suportadas

| Tipo | Descrição | Processamento |
|------|-----------|---------------|
| `conversation` | Texto simples | Salva body direto |
| `extendedTextMessage` | Texto com formatação | Extrai texto + contexto |
| `imageMessage` | Imagem | Download + thumbnail |
| `videoMessage` | Vídeo | Download + thumbnail |
| `audioMessage` | Áudio/Voz | Download + conversão Opus |
| `documentMessage` | Documento | Download + metadados |
| `stickerMessage` | Sticker | Download como imagem |
| `locationMessage` | Localização | Coordenadas + preview |
| `contactMessage` | Contato (vCard) | Extrai nome + número |
| `ephemeralMessage` | Temporária | Processa mensagem interna |
| `viewOnceMessage` | Visualização única | Download + flag |
| `reactionMessage` | Reação | Associa à mensagem original |
| `editedMessage` | Editada | Atualiza mensagem existente |

---

## 🎯 Integrações no Recebimento

Quando uma mensagem é recebida, o sistema pode acionar:

1. **Chatbot** (`ChatBotListener`)
   - Responde automaticamente
   - Fluxos condicionais
   - Desabilitável por contato

2. **Dialogflow** (`QueueIntegrationServices`)
   - IA conversacional
   - Integração por fila

3. **Typebot** (`TypebotServices`)
   - Chatbots visuais
   - Webhook de resposta

4. **Webhooks** (`WebhookService`)
   - Notifica sistemas externos
   - Payload customizável

5. **Campanhas**
   - Detecta mensagens de campanha (`\u200c`)
   - Fecha ticket automaticamente
   - Rastreia envios

---

## 🔐 Tratamento LID/JID

### Linked ID (LID)
- Identificador privado do WhatsApp (`xxx@lid`)
- Não revela número real
- Suportado desde Baileys 6.7.21

### Fluxo de Detecção
1. `isLidUser()` detecta LID em `remoteJid`
2. `getContactMessage()` extrai informações
3. `CreateOrUpdateContactService` unifica LID → JID
4. Prioriza número real quando disponível
5. Evita duplicação de contatos

### Campos Importantes
- `remoteJid` - ID principal (pode ser LID ou JID)
- `remoteJidAlt` - JID alternativo (quando LID presente)
- `participant` - Em grupos, pode ser LID
- `participantAlt` - JID alternativo do participante

---

## 📊 Eventos Socket.IO

### Recebimento
```typescript
`company-${companyId}-ticket` - Atualização de ticket
`company-${companyId}-message` - Nova mensagem
```

### Envio
```typescript
`company-${companyId}-ticket` - Ticket atualizado
`company-${companyId}-message` - Mensagem enviada
```

---

## 🛠️ Arquivos Principais

| Arquivo | Função |
|---------|--------|
| `services/WbotServices/wbotMessageListener.ts` | Listener principal (3960 linhas) |
| `services/WbotServices/SendWhatsAppMessage.ts` | Envio de texto |
| `services/WbotServices/SendWhatsAppMedia.ts` | Envio de mídia |
| `services/ContactServices/CreateOrUpdateContactService.ts` | Gestão de contatos |
| `services/TicketServices/FindOrCreateTicketService.ts` | Gestão de tickets |
| `services/MessageServices/CreateMessageService.ts` | Persistência de mensagens |
| `helpers/GetTicketWbot.ts` | Obtém instância WhatsApp |
| `libs/wbot.ts` | Gerenciamento de conexões Baileys |

---

## 📝 Observações Importantes

- **Mensagens duplicadas:** Verificadas por `wid` (WhatsApp ID)
- **Mensagens de campanha:** Detectadas por caractere `\u200c`
- **Processamento assíncrono:** Ativado via `REDIS_URI_MSG_CONN`
- **Mutex:** Previne race conditions em criação de tickets
- **Cache Redis:** Armazena contadores de não lidas
- **LGPD:** Pode exigir consentimento antes de criar ticket
- **Grupos:** Suportados se `allowGroup = true` no WhatsApp

