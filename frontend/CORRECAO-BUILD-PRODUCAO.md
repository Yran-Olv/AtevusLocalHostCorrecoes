# 🔧 Correção de Build em Produção (Linux)

## ❌ Problema Identificado

O build estava falhando porque:
1. O script estava usando `react-scripts` ao invés de `react-app-rewired`
2. Estava usando `--openssl-legacy-provider` desnecessariamente
3. `cross-env` pode não funcionar corretamente em alguns ambientes Linux
4. Browserslist desatualizado

## ✅ Correções Aplicadas

### 1. Scripts de Build Corrigidos
**Arquivo:** `frontend/package.json`

**Antes:**
```json
"build": "cross-env NODE_OPTIONS=--max-old-space-size=4096 GENERATE_SOURCEMAP=false react-app-rewired build"
```

**Depois:**
```json
"build": "NODE_OPTIONS=--max-old-space-size=4096 GENERATE_SOURCEMAP=false react-app-rewired build"
```

**Mudanças:**
- Removido `cross-env` (não necessário no Linux)
- Mantido `NODE_OPTIONS=--max-old-space-size=4096` para aumentar memória
- Mantido `GENERATE_SOURCEMAP=false` para builds mais rápidos
- Usando `react-app-rewired` corretamente

### 2. Script para Atualizar Browserslist
Adicionado script `update-browserslist`:
```json
"update-browserslist": "npx update-browserslist-db@latest"
```

## 🚀 Como Usar em Produção

### 1. Atualizar Browserslist (Recomendado)
```bash
cd frontend
npx update-browserslist-db@latest
```

### 2. Fazer Build
```bash
npm run build
```

### 3. Build Rápido (Alternativa)
```bash
npm run build:fast
```

## 📋 Comandos Completos

```bash
# 1. Ir para o diretório do frontend
cd /home/deploy/multivus/frontend

# 2. Atualizar browserslist (opcional, mas recomendado)
npx update-browserslist-db@latest

# 3. Instalar react-app-rewired se ainda não instalado
npm install react-app-rewired --save-dev --legacy-peer-deps

# 4. Fazer build
npm run build
# Build Rápido 
npm run build:fast

# 5. Verificar se o build foi criado
ls -lh build/
```

## ⚠️ Notas Importantes

1. **cross-env removido**: No Linux, não é necessário usar `cross-env`. A sintaxe `NODE_OPTIONS=...` funciona diretamente.

2. **Memória**: Se o build ainda falhar por memória, aumentar para `8192`:
   ```json
   "build": "NODE_OPTIONS=--max-old-space-size=8192 GENERATE_SOURCEMAP=false react-app-rewired build"
   ```

3. **Browserslist**: A atualização é recomendada mas não obrigatória. O build funcionará mesmo sem atualizar.

4. **Vulnerabilidades**: As vulnerabilidades reportadas pelo `npm audit` são principalmente de dependências de desenvolvimento e não afetam a produção. Para corrigir:
   ```bash
   npm audit fix
   ```

## 🐛 Troubleshooting

### Erro: "react-app-rewired: command not found"
**Solução:**
```bash
npm install react-app-rewired --save-dev --legacy-peer-deps
```

### Erro: "Cannot find module 'config-overrides.js'"
**Solução:** Verificar se o arquivo `config-overrides.js` existe na raiz do diretório `frontend/`

### Build ainda lento?
**Solução:** Usar `npm run build:fast` que desabilita algumas verificações

### Erro de memória?
**Solução:** Aumentar `--max-old-space-size` para `8192` ou `16384`

---

**Última atualização:** Janeiro 2025

