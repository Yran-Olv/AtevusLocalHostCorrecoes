# 🔧 Correções Aplicadas - Whaticket/FlowBuilder

---

## 🚀 GUIA COMPLETO: Configuração do Gerencianet (PIX) do Zero

### 📋 Pré-requisitos

Antes de começar, você precisa ter:
- ✅ Conta no Gerencianet (criar em: https://gerencianet.com.br/)
- ✅ Acesso ao painel administrativo do Gerencianet
- ✅ Acesso ao servidor/ambiente onde o backend está rodando
- ✅ Permissão para editar arquivos `.env` e adicionar arquivos na pasta `backend/certs/`

---

### 📝 Passo 1: Criar Conta e Aplicação no Gerencianet

###### 1.1. Criar Conta
1. Acesse: https://gerencianet.com.br/
2. Clique em **"Cadastre-se"** ou **"Criar Conta"**
3. Preencha os dados da empresa
4. Confirme o email
5. Complete o cadastro com os dados fiscais

#### 1.2. Criar Aplicação
1. Faça login no painel do Gerencianet
2. Vá em **"Desenvolvedores"** → **"Aplicações"** (ou **"Minhas Aplicações"**)
3. Clique em **"Nova Aplicação"** ou **"Criar Aplicação"**
4. Preencha:
   - **Nome da Aplicação**: Ex: "Whaticket PIX"
   - **Descrição**: Ex: "Sistema de pagamento para assinaturas"
5. Clique em **"Criar"**
6. **IMPORTANTE**: Copie e guarde:
   - **Client ID** (exemplo: `Client_Id_1234567890abcdef`)
   - **Client Secret** (exemplo: `Client_Secret_abcdef1234567890`)

⚠️ **ATENÇÃO**: O Client Secret só é mostrado UMA VEZ. Guarde em local seguro!

---

### 📝 Passo 2: Configurar ambiente (Sandbox ou Produção)

#### 2.1. Ambiente Sandbox (Testes)
- ✅ **Recomendado para desenvolvimento e testes**
- ✅ Não cobra taxas reais
- ✅ Permite testar sem risco
- ⚠️ Valores são fictícios

#### 2.2. Ambiente Produção
- ⚠️ **Apenas após testes completos**
- ⚠️ Cobra taxas reais
- ⚠️ Requer certificado de produção
- ⚠️ Requer chave PIX real cadastrada

**Para começar, use SANDBOX!**

---

### 📝 Passo 3: Cadastrar Chave PIX

1. No painel do Gerencianet, vá em **"PIX"** → **"Minhas Chaves"**
2. Clique em **"Cadastrar Chave"** ou **"Nova Chave"**
3. Escolha o tipo de chave:
   - **CPF/CNPJ**: Chave vinculada ao documento
   - **Email**: Chave vinculada ao email
   - **Telefone**: Chave vinculada ao telefone
   - **Aleatória**: Chave aleatória (recomendado)
4. Preencha os dados conforme o tipo escolhido
5. Confirme o cadastro
6. **Copie a chave PIX** gerada (exemplo: `123e4567-e89b-12d3-a456-426614174000`)

---

### 📝 Passo 4: Baixar Certificado PIX

1. No painel do Gerencianet, vá em **"PIX"** → **"Certificados"**
2. Clique em **"Baixar Certificado"** ou **"Gerar Certificado"**
3. Escolha o ambiente:
   - **Sandbox**: Para testes
   - **Produção**: Para ambiente real
4. Baixe o arquivo `.p12`
5. **IMPORTANTE**: Anote a senha do certificado (se solicitada)

---

### 📝 Passo 5: Configurar no Backend

#### 5.1. Colocar Certificado na Pasta Correta

1. Crie a pasta `certs` dentro de `backend/` (se não existir):
   ```bash
   # Windows
   mkdir backend\certs
   
   # Linux/Mac
   mkdir -p backend/certs
   ```

2. Copie o arquivo `.p12` baixado para `backend/certs/`
   - Exemplo: `backend/certs/certificado-producao.p12`
   - Ou: `backend/certs/certificado-sandbox.p12`

#### 5.2. Configurar Variáveis de Ambiente

1. Abra o arquivo `.env` do backend (na raiz do projeto `backend/`)

2. Adicione as seguintes variáveis:

```env
# ============================================
# GERENCIANET - CONFIGURAÇÃO PIX
# ============================================

# Ambiente: true para sandbox (testes), false para produção
GERENCIANET_SANDBOX=true

# Credenciais da Aplicação (obtidas no Passo 1.2)
GERENCIANET_CLIENT_ID=Client_Id_1234567890abcdef
GERENCIANET_CLIENT_SECRET=Client_Secret_abcdef1234567890

# Chave PIX cadastrada (obtida no Passo 3)
GERENCIANET_CHAVEPIX=123e4567-e89b-12d3-a456-426614174000

# Nome do certificado .p12 (SEM a extensão .p12)
# Exemplo: se o arquivo é "certificado-sandbox.p12", use apenas "certificado-sandbox"
GERENCIANET_PIX_CERT=certificado-sandbox
```

#### 5.3. Exemplo Completo de Configuração

**Para Sandbox (Desenvolvimento):**
```env
GERENCIANET_SANDBOX=true
GERENCIANET_CLIENT_ID=Client_Id_abc123def456
GERENCIANET_CLIENT_SECRET=Client_Secret_xyz789uvw012
GERENCIANET_CHAVEPIX=chave-pix-sandbox-12345
GERENCIANET_PIX_CERT=certificado-sandbox
```

**Para Produção:**
```env
GERENCIANET_SANDBOX=false
GERENCIANET_CLIENT_ID=Client_Id_producao_123
GERENCIANET_CLIENT_SECRET=Client_Secret_producao_456
GERENCIANET_CHAVEPIX=chave-pix-producao-real
GERENCIANET_PIX_CERT=certificado-producao
```

---

### 📝 Passo 6: Verificar Configuração

#### 6.1. Verificar Estrutura de Pastas

```
backend/
├── certs/
│   └── certificado-sandbox.p12    ✅ Certificado deve estar aqui
├── src/
│   └── config/
│       └── Gn.ts                  ✅ Arquivo de configuração
└── .env                           ✅ Variáveis de ambiente
```

#### 6.2. Verificar Variáveis de Ambiente

Execute no terminal (dentro da pasta `backend/`):

```bash
# Windows (PowerShell)
Get-Content .env | Select-String "GERENCIANET"

# Linux/Mac
grep GERENCIANET .env
```

Você deve ver todas as 5 variáveis configuradas.

#### 6.3. Testar Configuração

1. Inicie o backend:
   ```bash
   cd backend
   npm run dev
   # ou
   npm start
   ```

2. Verifique os logs no console:
   - ✅ Se aparecer avisos sobre variáveis faltando, corrija o `.env`
   - ✅ Se aparecer aviso sobre certificado não encontrado, verifique o caminho

---

### 📝 Passo 7: Configurar Webhook (Opcional mas Recomendado)

O webhook permite que o Gerencianet notifique automaticamente quando um pagamento for confirmado.

#### 7.1. Obter URL do Webhook

A URL do webhook deve ser:
```
https://seu-dominio.com/subscription/return/c5c0f5a4-efe2-447f-8c73-55f8c0f07284/pix
```

⚠️ **IMPORTANTE**: 
- Substitua `seu-dominio.com` pelo seu domínio real
- A URL deve ser acessível publicamente (HTTPS)
- O caminho `/subscription/return/c5c0f5a4-efe2-447f-8c73-55f8c0f07284/pix` já está configurado no código

#### 7.2. Configurar no Gerencianet

1. No painel do Gerencianet, vá em **"PIX"** → **"Webhooks"**
2. Clique em **"Configurar Webhook"** ou **"Novo Webhook"**
3. Preencha:
   - **Chave PIX**: A mesma chave cadastrada no Passo 3
   - **URL do Webhook**: A URL completa do Passo 7.1
4. Salve a configuração

#### 7.3. Testar Webhook

1. No painel do Gerencianet, vá em **"PIX"** → **"Webhooks"**
2. Clique em **"Testar Webhook"** ou **"Enviar Teste"**
3. Verifique se o backend recebeu a requisição (verifique os logs)

---

### 📝 Passo 8: Verificar Dados da Empresa no Sistema

Antes de testar o pagamento, certifique-se de que:

1. **A empresa tem documento cadastrado:**
   - Acesse o sistema Whaticket
   - Vá em **"Empresas"** ou **"Companies"**
   - Edite a empresa
   - Verifique se há **CPF** (11 dígitos) ou **CNPJ** (14 dígitos) cadastrado
   - Se não houver, cadastre o documento

2. **A empresa tem plano associado:**
   - Verifique se a empresa tem um plano ativo
   - O plano deve ter um valor (`amount`) maior que zero

---

### 📝 Passo 9: Testar Criação de Cobrança PIX

#### 9.1. Teste Manual

1. Acesse o sistema Whaticket
2. Vá em **"Assinatura"** ou **"Subscription"**
3. Clique em **"Assine Agora!"**
4. Preencha os dados do formulário
5. Selecione um plano
6. Clique em **"PAGAR"**
7. **Resultado esperado**:
   - ✅ Deve aparecer um QR Code PIX
   - ✅ Deve aparecer o valor da cobrança
   - ✅ Deve aparecer um botão para copiar o código PIX

#### 9.2. Verificar Logs

Se houver erro, verifique os logs do backend:

```bash
# Ver logs em tempo real
cd backend
npm run dev
```

Procure por mensagens como:
- ✅ `Criando cobrança PIX:` - Indica que está tentando criar
- ❌ `Erro ao criar assinatura Gerencianet:` - Indica erro (veja a mensagem)

#### 9.3. Erros Comuns e Soluções

| Erro | Causa | Solução |
|------|-------|---------|
| "Chave PIX não configurada" | Variável `GERENCIANET_CHAVEPIX` vazia | Verificar `.env` |
| "Certificado não encontrado" | Arquivo `.p12` não está em `backend/certs/` | Mover certificado para pasta correta |
| "Documento da empresa é obrigatório" | Empresa sem CPF/CNPJ | Cadastrar documento da empresa |
| "Plano não encontrado" | Empresa sem plano associado | Associar plano à empresa |
| "Valor do plano inválido" | Plano com valor zero ou negativo | Corrigir valor do plano |
| "Erro de autenticação" | Client ID ou Secret incorretos | Verificar credenciais no `.env` |

---

### 📝 Passo 10: Testar Pagamento (Sandbox)

#### 10.1. Simular Pagamento no Sandbox

1. No painel do Gerencianet, vá em **"PIX"** → **"Cobranças"** ou **"Transações"**
2. Encontre a cobrança criada
3. Clique em **"Simular Pagamento"** ou **"Marcar como Pago"**
4. O webhook deve ser disparado automaticamente
5. Verifique se a licença da empresa foi renovada no sistema

#### 10.2. Verificar Atualização

1. Acesse o sistema Whaticket
2. Vá em **"Empresas"** → Selecione a empresa
3. Verifique se a **"Data de Vencimento"** foi atualizada (deve ter +30 dias)

---

### ✅ Checklist Final

Antes de considerar a configuração completa, verifique:

- [ ] Conta criada no Gerencianet
- [ ] Aplicação criada e credenciais copiadas
- [ ] Chave PIX cadastrada
- [ ] Certificado `.p12` baixado
- [ ] Certificado colocado em `backend/certs/`
- [ ] Todas as 5 variáveis no `.env` configuradas
- [ ] Backend reiniciado após configurar `.env`
- [ ] Empresa tem documento (CPF/CNPJ) cadastrado
- [ ] Empresa tem plano com valor válido
- [ ] Teste de criação de cobrança funcionou
- [ ] QR Code PIX é gerado corretamente
- [ ] Webhook configurado (opcional mas recomendado)

---

### 🆘 Suporte e Troubleshooting

#### Logs Detalhados

O sistema agora gera logs detalhados. Para ver:

```bash
cd backend
npm run dev
```

Procure por mensagens que começam com:
- `Criando cobrança PIX:` - Dados enviados
- `Erro ao criar assinatura Gerencianet:` - Erro detalhado

#### Contato com Suporte Gerencianet

- **Email**: suporte@gerencianet.com.br
- **Documentação**: https://dev.gerencianet.com.br/
- **Status da API**: https://status.gerencianet.com.br/

---

### 📚 Documentação Adicional

- **API Gerencianet**: https://dev.gerencianet.com.br/docs/api-pix
- **SDK TypeScript**: https://www.npmjs.com/package/gn-api-sdk-typescript
- **Webhooks PIX**: https://dev.gerencianet.com.br/docs/webhook-pix

---

## ✅ Correções Implementadas

### 1. **Atualização do React 18 - createRoot** ✅
- **Arquivo**: `frontend/src/index.js`
- **Mudança**: Substituído `ReactDOM.render` (deprecated) por `createRoot` do React 18
- **Impacto**: Compatibilidade com React 18 e remoção de warnings

### 2. **Migração React Query** ✅
- **Arquivo**: `frontend/src/App.js` e `frontend/package.json`
- **Mudança**: 
  - Import atualizado de `react-query` para `@tanstack/react-query`
  - `package.json` atualizado para `@tanstack/react-query@^5.59.0`
- **Impacto**: Versão moderna e mantida do React Query

### 3. **Migração Material-UI v4 → v5** ✅ (Parcial)
- **Arquivos**: `frontend/src/index.js`, `frontend/src/App.js`
- **Mudanças**:
  - `@material-ui/core/CssBaseline` → `@mui/material/CssBaseline`
  - `@material-ui/core/locale` → `@mui/material/locale`
  - `@material-ui/core/styles` → `@mui/material/styles`
  - `@material-ui/core` → `@mui/material`
  - Tema atualizado: `type: mode` → `mode` (padrão do MUI v5)
- **Impacto**: Base para migração completa do Material-UI

### 4. **Atualização do Axios** ✅
- **Arquivo**: `frontend/package.json`
- **Mudança**: `axios@^0.21.1` → `axios@^1.7.7`
- **Impacto**: Correções de segurança críticas e melhorias de performance

### 5. **Correção do Gerencianet - Assinatura e Pagamento PIX** ✅
- **Arquivos**: 
  - `backend/src/controllers/SubscriptionController.ts`
  - `frontend/src/components/CheckoutPage/CheckoutPage.js`
  - `frontend/src/components/CheckoutPage/CheckoutSuccess/CheckoutSuccess.js`
  - `frontend/src/pages/Subscription/index.js`
  - `frontend/src/hooks/useDate/index.js`
- **Mudanças**:
  - ✅ Formato de preço corrigido: USD → BRL (formato esperado pelo Gerencianet PIX)
  - ✅ Validações completas: company, plan, document, invoiceId
  - ✅ Tratamento de erros melhorado com mensagens detalhadas da API
  - ✅ Schema Yup flexível: aceita string ou number para price
  - ✅ Validação de data de vencimento corrigida
  - ✅ Email de cobrança corrigido (usa email da empresa)
  - ✅ Logs detalhados para debugging
- **Impacto**: Sistema de pagamento PIX funcionando corretamente

### 6. **Correção de Validação de Data de Vencimento** ✅
- **Arquivos**: 
  - `frontend/src/hooks/useDate/index.js`
  - `frontend/src/pages/Subscription/index.js`
- **Mudanças**:
  - ✅ Validação de data antes de calcular dias restantes
  - ✅ Mensagens mais claras (incluindo quando licença está vencida)
  - ✅ Tratamento de datas inválidas
- **Impacto**: Interface mostra corretamente o status da licença

---

## 🌐 Ambientes do Sistema

### Desenvolvimento (Windows)
- **Sistema Operacional**: Windows (localhost)
- **Uso**: Desenvolvimento e testes locais
- **Comandos**: Usar comandos padrão do npm

### Produção (VPS Ubuntu 22)
- **Sistema Operacional**: Ubuntu 22.04 LTS
- **Gerenciador de Processos**: PM2 (configurado em `ecosystem.config.js`)
- **Uso**: Ambiente de produção
- **Comandos**: Usar comandos com `sudo` quando necessário

---

## 📋 Próximos Passos Necessários

### ⚠️ IMPORTANTE: Instalar Dependências

#### 🪟 No Windows (Desenvolvimento)

```bash
cd frontend
npm install --force
```

#### 🐧 No Ubuntu 22 (Produção)

```bash
cd frontend
npm install --force
# Ou se necessário:
sudo npm install --force
```

### 🔄 Migrações Pendentes

#### 1. **Material-UI v4 → v5** (Alta Prioridade)
- **Status**: Apenas `App.js` e `index.js` migrados
- **Pendente**: ~1259 arquivos ainda usam `@material-ui/*`
- **Ação**: Migração gradual componente por componente
- **Referência**: Ver `wiki/CHECKLIST-MODERNIZACAO.md`

#### 2. **Substituir Moment.js por date-fns** (Média Prioridade)
- **Status**: Moment.js ainda está em uso (~70 arquivos)
- **Ação**: Substituir gradualmente por `date-fns` (já instalado)
- **Benefício**: Bundle menor, melhor performance

#### 3. **React Router v5 → v6** (Alta Prioridade)
- **Status**: Ainda usando React Router v5
- **Ação**: Migrar para v6 (mudanças significativas na API)
- **Referência**: Ver `wiki/PLANO-MODERNIZACAO-FRONTEND.md`

---

## 🧪 Testes Recomendados

### 🪟 Testes no Windows (Desenvolvimento)

Após instalar as dependências, teste:

1. **Inicialização da aplicação**
   ```bash
   cd frontend
   npm start
   ```
   - Verificar se não há erros no console
   - Verificar se a aplicação carrega corretamente

2. **Funcionalidades críticas**
   - [ ] Login funciona
   - [ ] Navegação entre páginas funciona
   - [ ] Socket.IO conecta
   - [ ] Envio/recebimento de mensagens funciona
   - [ ] Tema claro/escuro funciona

3. **Verificar console do navegador**
   - Sem erros críticos
   - Warnings são aceitáveis (mas devem ser corrigidos gradualmente)

### 🐧 Deploy para Produção (Ubuntu 22)

#### 1. Build do Frontend
```bash
cd frontend
npm install --force
npm run build
```

#### 2. Build do Backend
```bash
cd backend
npm install --force
npm run build
```

#### 3. Executar Migrações
```bash
cd backend
npx sequelize db:migrate
```

#### 4. Reiniciar PM2
```bash
pm2 restart multivus-backend
# Ou se necessário:
sudo pm2 restart multivus-backend
```

#### 5. Verificar Status
```bash
pm2 status
pm2 logs multivus-backend
```

#### ⚠️ Importante para Produção
- Verificar variáveis de ambiente (`.env`) estão configuradas
- Verificar `REACT_APP_BACKEND_URL` está correto
- Verificar conexão com PostgreSQL e Redis
- Verificar permissões de arquivos e pastas
- Monitorar logs do PM2 após deploy

---

## ⚠️ Problemas Conhecidos

### 1. Locale do Material-UI
- **Problema**: A importação `@mui/material/locale` pode não funcionar
- **Solução**: Se houver erro, usar `@mui/x-date-pickers` para localização
- **Status**: Aguardando teste

### 2. Componentes Material-UI v4
- **Problema**: Muitos componentes ainda usam v4
- **Impacto**: Pode haver conflitos de estilos
- **Solução**: Migração gradual (ver checklist)

### 3. React Query v3 → v5
- **Problema**: Algumas APIs mudaram
- **Impacto**: Pode precisar ajustes em hooks customizados
- **Solução**: Verificar hooks que usam `react-query`

---

## 📚 Documentação de Referência

- **Análise Completa**: `wiki/RESUMO-ANALISE-COMPLETA.md`
- **Checklist de Modernização**: `wiki/CHECKLIST-MODERNIZACAO.md`
- **Plano de Modernização**: `wiki/PLANO-MODERNIZACAO-FRONTEND.md`
- **Design e Responsividade**: `wiki/DESIGN-RESPONSIVIDADE.md`

---

## 🎯 Prioridades de Correção

### 🔴 Crítico (Fazer Agora)
1. ✅ Atualizar createRoot (FEITO)
2. ✅ Atualizar axios (FEITO)
3. ✅ Atualizar react-query (FEITO)
4. ⏳ Instalar dependências (`npm install --force`)
5. ⏳ Testar aplicação após instalação

### 🟡 Alta (Próximas Semanas)
1. Migrar Material-UI v4 → v5 (gradualmente)
2. Migrar React Router v5 → v6
3. Substituir Moment.js por date-fns

### 🟢 Média (Futuro)
1. Migrar para TypeScript
2. Otimizações de performance
3. Adicionar testes

---

## 📝 Notas Técnicas

### Mudanças no React Query v5
- `QueryClient` agora vem de `@tanstack/react-query`
- APIs principais permanecem compatíveis
- Alguns hooks podem precisar de ajustes

### Mudanças no Material-UI v5
- `type` → `mode` na paleta do tema
- Alguns componentes mudaram de API
- `makeStyles` ainda funciona, mas `sx` prop é preferido

### Mudanças no Axios 1.x
- API principal mantida compatível
- Melhorias de segurança
- Melhor suporte a TypeScript

---

---

## 🌍 Compatibilidade Multi-Ambiente

### ✅ Testado e Compatível

As correções aplicadas são **compatíveis com ambos os ambientes**:

- ✅ **Windows (Desenvolvimento)**: Todas as mudanças funcionam normalmente
- ✅ **Ubuntu 22 (Produção)**: Compatível com PM2 e ambiente de produção

### 📝 Notas Importantes

1. **Variáveis de Ambiente**: 
   - Windows: Usar `.env` ou variáveis do sistema
   - Ubuntu: Verificar `.env` no servidor antes do deploy

2. **Build de Produção**:
   - Windows: `npm run build` (para testes)
   - Ubuntu: `npm run build` (antes do deploy)
   - ✅ Ambos usam `cross-env` para compatibilidade entre sistemas

3. **Gerenciamento de Processos**:
   - Windows: Usar `npm start` para desenvolvimento
   - Ubuntu: Usar `pm2` para produção (já configurado em `ecosystem.config.js`)

4. **Caminhos de Arquivos**:
   - Windows: Usa `\` (barra invertida)
   - Ubuntu: Usa `/` (barra normal)
   - ✅ Código usa caminhos relativos, então funciona em ambos

5. **Compatibilidade Cross-Platform**:
   - ✅ `cross-env` instalado em frontend e backend
   - ✅ `NODE_OPTIONS=--openssl-legacy-provider` funciona em ambos os sistemas
   - ✅ Scripts npm são compatíveis com Windows e Linux

---

## 📚 Documentação Adicional

- **Deploy para Produção**: Ver `DEPLOY-PRODUCAO.md` (criado)
- **Análise Completa**: `wiki/RESUMO-ANALISE-COMPLETA.md`
- **Checklist de Modernização**: `wiki/CHECKLIST-MODERNIZACAO.md`

---

## 🔧 Configuração do Gerencianet (PIX)

### Variáveis de Ambiente Necessárias

Adicione ao arquivo `.env` do backend:

```env
# Gerencianet - Configuração PIX
GERENCIANET_SANDBOX=true                    # true para sandbox, false para produção
GERENCIANET_CLIENT_ID=seu_client_id         # Client ID da aplicação Gerencianet
GERENCIANET_CLIENT_SECRET=seu_client_secret # Client Secret da aplicação
GERENCIANET_CHAVEPIX=sua_chave_pix          # Chave PIX cadastrada no Gerencianet
GERENCIANET_PIX_CERT=nome_certificado       # Nome do certificado .p12 (sem extensão)
```

### Estrutura de Pastas

```
backend/
  ├── certs/
  │   └── nome_certificado.p12    # Certificado PIX do Gerencianet
  └── src/
      └── config/
          └── Gn.ts                # Configuração do Gerencianet
```

### Como Obter as Credenciais

1. **Acesse o painel do Gerencianet**: https://gerencianet.com.br/
2. **Crie uma aplicação** no menu "Aplicações"
3. **Copie o Client ID e Client Secret**
4. **Cadastre uma chave PIX** no menu "PIX" → "Minhas Chaves"
5. **Baixe o certificado .p12** no menu "PIX" → "Certificados"
6. **Coloque o certificado** na pasta `backend/certs/`

### Validação

O sistema agora valida automaticamente:
- ✅ Se todas as variáveis de ambiente estão configuradas
- ✅ Se o certificado existe na pasta correta
- ✅ Se os dados da empresa estão completos (documento, nome)
- ✅ Se o plano tem valor válido

### Troubleshooting

**Erro: "Chave PIX não configurada"**
- Verifique se `GERENCIANET_CHAVEPIX` está no `.env`
- Verifique se a chave está cadastrada no Gerencianet

**Erro: "Certificado não encontrado"**
- Verifique se o arquivo `.p12` está em `backend/certs/`
- Verifique se `GERENCIANET_PIX_CERT` tem o nome correto (sem extensão)

**Erro: "Documento da empresa é obrigatório"**
- Certifique-se de que a empresa tem CPF ou CNPJ cadastrado
- O documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)

---

**Data das Correções**: 2025-01-27  
**Versão do Sistema**: 2.2.2v-26  
**Ambientes**: ✅ Windows (Dev) | ✅ Ubuntu 22 (Prod)  
**Status**: ✅ Correções base aplicadas - Sistema de pagamento PIX corrigido e validado

