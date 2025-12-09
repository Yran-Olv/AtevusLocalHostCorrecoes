# 🚀 Comandos para Executar no Servidor

## ⚡ Solução Rápida (Copie e Cole)

Execute estes comandos **na ordem** no servidor:

```bash
cd /home/deploy/multivustestes/frontend

# 1. Limpar tudo (incluindo build antigo)
rm -rf node_modules package-lock.json .npm build

# 2. Limpar cache do npm
npm cache clean --force

# 3. Instalar dependências
npm install --legacy-peer-deps --no-audit

# 4. Verificar se funcionou
ls node_modules/react-scripts

# 5. Fazer build (IMPORTANTE!)
npm run build

# 6. Verificar se build foi criado
ls -la build/index.html

# 7. Se usar server.js, iniciar servidor
node server.js
```

## 📋 Explicação dos Comandos

### 1. Limpeza Completa
```bash
rm -rf node_modules package-lock.json .npm
```
- Remove `node_modules` (dependências antigas)
- Remove `package-lock.json` (lock file corrompido)
- Remove `.npm` (cache local)

### 2. Limpar Cache do NPM
```bash
npm cache clean --force
```
- Limpa o cache do npm que pode estar corrompido
- Força limpeza completa

### 3. Instalar Dependências
```bash
npm install --legacy-peer-deps --no-audit
```
- `--legacy-peer-deps`: Ignora conflitos de peer dependencies
- `--no-audit`: Pula verificação de vulnerabilidades (mais rápido)

### 4. Verificar Instalação
```bash
ls node_modules/react-scripts
```
- Verifica se `react-scripts` foi instalado corretamente
- Se aparecer a lista de arquivos, está OK

### 5. Fazer Build
```bash
npm run build
```
- Gera o build de produção
- Cria a pasta `build/` com os arquivos otimizados

## 🔄 Se Ainda Der Erro

### Tentativa 2: Sem --legacy-peer-deps
```bash
npm install --no-audit
```

### Tentativa 3: Usar Yarn (se disponível)
```bash
# Instalar yarn (se não tiver)
npm install -g yarn

# Limpar e instalar com yarn
rm -rf node_modules package-lock.json yarn.lock
yarn install --ignore-engines
```

## ✅ Verificação Final

Após a instalação, verifique:

```bash
# 1. Verificar se node_modules existe
ls -la node_modules | head -5

# 2. Verificar se react-scripts está instalado
ls node_modules/react-scripts

# 3. Verificar se react está instalado
ls node_modules/react

# 4. Tentar fazer build
npm run build
```

## 📊 O Que Foi Corrigido

1. ✅ **Dependências de teste atualizadas**:
   - `@testing-library/jest-dom`: `^5.11.4` → `^5.17.0`
   - `@testing-library/react`: `^11.0.4` → `^13.4.0`
   - `@testing-library/user-event`: `^12.1.7` → `^14.5.0`

2. ✅ **Scripts de build otimizados**:
   - Usando `react-scripts` nativo
   - Memória aumentada: `--max-old-space-size=4096`
   - Sem source maps: `GENERATE_SOURCEMAP=false`

3. ✅ **Lazy loading mantido**:
   - Todas as rotas usam `React.lazy()`
   - Code splitting automático

## 🎯 Resultado Esperado

Após executar os comandos, você deve ver:
- ✅ `node_modules/` criado com sucesso
- ✅ `react-scripts` instalado
- ✅ Build funcionando: `npm run build` cria a pasta `build/`

---

**Última atualização:** Janeiro 2025

