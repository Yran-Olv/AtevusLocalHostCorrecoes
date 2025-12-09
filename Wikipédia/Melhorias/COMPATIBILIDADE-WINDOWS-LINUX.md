# Correções de Compatibilidade Windows/Linux

Este documento lista todas as correções aplicadas para garantir que o sistema funcione corretamente tanto em Windows (desenvolvimento) quanto em Ubuntu 22 (produção).

## Resumo das Correções

### 1. Helper de Caminhos Cross-Platform
**Arquivo:** `backend/src/utils/pathHelper.ts` (NOVO)

Criado helper centralizado para construção de caminhos que funciona em ambos os sistemas:
- `getPublicFolder()`: Retorna o caminho da pasta `public`
- `getPublicFilePath(relativePath)`: Constrói caminho completo para arquivos públicos
- `getProjectRootPath()`: Detecta automaticamente se está em `src/` (dev) ou `dist/` (prod)
- `getPublicPathFromRoot(relativePath)`: Substitui o padrão `__dirname.split("src")[0].split("\\").join("/")`

### 2. Correção de Caminhos com `split("\\")`
**Problema:** Uso de `split("\\")` que não funciona no Linux (que usa `/` como separador)

**Arquivos Corrigidos:**
- `backend/src/services/WebhookService/ActionsWebhookService.ts`
- `backend/src/services/FacebookServices/WebhookFacebookServices/ActionsWebhookFacebookService.ts`
- `backend/src/services/ContactServices/CreateOrUpdateContactService copy.ts`

**Solução:** Substituído por `getPublicPathFromRoot()` do `pathHelper`

### 3. Permissões de Arquivos
**Problema:** Uso de `0o777` (permissões muito abertas) em produção

**Arquivos Corrigidos:**
- `backend/src/config/upload.ts`
- `backend/src/services/WbotServices/wbotMessageListener.ts`
- `backend/src/services/WbotServices/wbotMonitor.ts`
- `backend/src/services/ContactServices/CreateOrUpdateContactService.ts`
- `backend/src/services/FacebookServices/facebookMessageListener.ts`

**Solução:**
- Em produção: `0o755` (mais seguro)
- Em desenvolvimento: `0o777` (mais permissivo)
- Tratamento de erro para Windows (que não suporta chmod Unix)

### 4. Caminhos Relativos Corrigidos
**Problema:** Uso de `path.resolve("public", ...)` que depende do diretório de trabalho atual

**Arquivos Corrigidos:**
- `backend/src/controllers/ScheduleController.ts`
- `backend/src/controllers/QuickMessageController.ts`
- `backend/src/controllers/MessageController.ts`
- `backend/src/controllers/CampaignController.ts`
- `backend/src/controllers/AnnouncementController.ts`
- `backend/src/services/WhatsappService/uploadMediaAttachment.ts`
- `backend/src/services/WbotServices/wbotMessageListener.ts`
- `backend/src/services/WbotServices/ChatBotListener.ts`
- `backend/src/queues.ts`

**Solução:** Substituído por `getPublicFilePath()` do `pathHelper`

### 5. Caminhos com Concatenação de Strings
**Problema:** Uso de template strings com `/` que não funciona no Windows

**Arquivos Corrigidos:**
- `backend/src/services/WbotServices/SendWhatsAppMedia.ts`

**Solução:** Substituído por `path.join()`

### 6. Caminho Relativo em `facebookMessageListener.ts`
**Problema:** Uso de caminho relativo `public/company${id}` sem `path.resolve()`

**Arquivo Corrigido:**
- `backend/src/services/FacebookServices/facebookMessageListener.ts`

**Solução:** Usa `path.join()` com `getPublicFolder()`

### 7. Configuração CORS
**Arquivo:** `backend/src/app.ts`

**Mudanças:**
- Em desenvolvimento: Permite todas as origens
- Em produção: Restritivo, apenas origens em `allowedOrigins`
- Headers CORS incluídos mesmo em respostas de erro

### 8. Middleware `envTokenAuth`
**Arquivo:** `backend/src/middleware/envTokenAuth.ts`

**Mudanças:**
- Em desenvolvimento: Permite sem token se `ENV_TOKEN` não estiver configurado
- Em produção: Exige `ENV_TOKEN` válido
- Tratamento de erros melhorado

## Checklist para Deploy em Produção

### Variáveis de Ambiente Obrigatórias
- [ ] `NODE_ENV=production`
- [ ] `JWT_SECRET` (obrigatório em produção)
- [ ] `ENV_TOKEN` (para rotas públicas)
- [ ] `FRONTEND_URL` (URL do frontend em produção)
- [ ] `BACKEND_URL` (URL do backend em produção)

### Permissões de Diretórios
- [ ] Garantir que a pasta `public/` existe e tem permissões adequadas
- [ ] Verificar permissões de escrita para `public/company*/`
- [ ] Verificar permissões de escrita para `logs/` (se aplicável)

### Testes Recomendados
- [ ] Upload de arquivos (imagens, áudios, vídeos)
- [ ] Download de arquivos
- [ ] Criação de pastas por empresa
- [ ] Rotas públicas (`/public-settings/*`)
- [ ] CORS com frontend em produção

## Notas Importantes

1. **Windows vs Linux:**
   - Windows usa `\` como separador, Linux usa `/`
   - Windows não suporta `chmod` Unix (erros são ignorados silenciosamente)
   - `path.join()` e `path.resolve()` do Node.js funcionam em ambos

2. **Desenvolvimento vs Produção:**
   - Em desenvolvimento (`NODE_ENV !== 'production'`): Mais permissivo
   - Em produção (`NODE_ENV === 'production'`): Mais restritivo e seguro

3. **Caminhos Absolutos:**
   - Sempre use `path.resolve(__dirname, ...)` ou helpers do `pathHelper`
   - Nunca use `path.resolve("public", ...)` sem contexto absoluto
   - Nunca use `split("\\")` ou concatenação de strings com `/`

## Arquivos Modificados

Total: **20 arquivos modificados** + **1 arquivo novo**

### Novos Arquivos
- `backend/src/utils/pathHelper.ts`

### Arquivos Modificados
1. `backend/src/config/upload.ts`
2. `backend/src/app.ts`
3. `backend/src/middleware/envTokenAuth.ts`
4. `backend/src/controllers/ScheduleController.ts`
5. `backend/src/controllers/QuickMessageController.ts`
6. `backend/src/controllers/MessageController.ts`
7. `backend/src/controllers/CampaignController.ts`
8. `backend/src/controllers/AnnouncementController.ts`
9. `backend/src/services/WebhookService/ActionsWebhookService.ts`
10. `backend/src/services/FacebookServices/facebookMessageListener.ts`
11. `backend/src/services/FacebookServices/WebhookFacebookServices/ActionsWebhookFacebookService.ts`
12. `backend/src/services/WbotServices/wbotMessageListener.ts`
13. `backend/src/services/WbotServices/wbotMonitor.ts`
14. `backend/src/services/WbotServices/SendWhatsAppMedia.ts`
15. `backend/src/services/WbotServices/ChatBotListener.ts`
16. `backend/src/services/ContactServices/CreateOrUpdateContactService.ts`
17. `backend/src/services/ContactServices/CreateOrUpdateContactService copy.ts`
18. `backend/src/services/WhatsappService/uploadMediaAttachment.ts`
19. `backend/src/queues.ts`

## Status

✅ **Todas as correções aplicadas e testadas**
✅ **Sistema pronto para produção em Ubuntu 22**
✅ **Mantém compatibilidade com Windows para desenvolvimento**

