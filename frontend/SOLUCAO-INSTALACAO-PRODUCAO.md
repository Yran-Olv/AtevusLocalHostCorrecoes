# 🔧 Solução para Erro de Instalação em Produção

## ❌ Problema

```
npm error notarget No matching version found for @jest/expect-utils@30.2.0.
```

Este erro ocorre porque:
1. O `package-lock.json` está desatualizado ou corrompido
2. Alguma dependência está pedindo uma versão do Jest que não existe
3. O cache do npm pode estar corrompido

## ✅ Solução Passo a Passo

### Opção 1: Limpeza Completa (Recomendado)

```bash
cd /home/deploy/multivustestes/frontend

# 1. Limpar tudo
rm -rf node_modules package-lock.json .npm

# 2. Limpar cache do npm
npm cache clean --force

# 3. Instalar com --legacy-peer-deps
npm install --legacy-peer-deps

# 4. Se ainda der erro, tentar sem --legacy-peer-deps
npm install
```

### Opção 2: Atualizar Dependências de Teste

Se a Opção 1 não funcionar, pode ser necessário atualizar as dependências de teste:

```bash
cd /home/deploy/multivustestes/frontend

# 1. Limpar
rm -rf node_modules package-lock.json

# 2. Atualizar dependências de teste para versões compatíveis
npm install --save-dev @testing-library/jest-dom@^5.17.0 --legacy-peer-deps
npm install --save-dev @testing-library/react@^13.4.0 --legacy-peer-deps
npm install --save-dev @testing-library/user-event@^14.5.0 --legacy-peer-deps

# 3. Instalar o resto
npm install --legacy-peer-deps
```

### Opção 3: Instalação Sem Dependências de Teste (Produção)

Se você não precisa das dependências de teste em produção:

```bash
cd /home/deploy/multivustestes/frontend

# 1. Limpar
rm -rf node_modules package-lock.json

# 2. Instalar apenas dependências de produção
npm install --production --legacy-peer-deps

# 3. Instalar devDependencies separadamente
npm install --save-dev --legacy-peer-deps
```

### Opção 4: Usar npm ci (Mais Seguro)

```bash
cd /home/deploy/multivustestes/frontend

# 1. Limpar
rm -rf node_modules package-lock.json

# 2. Gerar novo package-lock.json
npm install --package-lock-only --legacy-peer-deps

# 3. Instalar
npm ci --legacy-peer-deps
```

## 🔍 Diagnóstico

Para identificar qual dependência está causando o problema:

```bash
# Verificar qual pacote está pedindo @jest/expect-utils
npm ls @jest/expect-utils 2>&1 | head -20

# Verificar versões do Jest disponíveis
npm view @jest/expect-utils versions --json | tail -20
```

## ⚠️ Solução Definitiva

Se nenhuma das opções acima funcionar, pode ser necessário:

1. **Atualizar o package.json** para usar versões mais recentes das dependências de teste
2. **Remover dependências de teste** se não forem necessárias em produção
3. **Usar yarn** ao invés de npm (às vezes resolve conflitos melhor)

## 📝 Comando Completo Recomendado

```bash
cd /home/deploy/multivustestes/frontend

# Limpeza completa
rm -rf node_modules package-lock.json .npm
npm cache clean --force

# Atualizar browserslist (opcional, mas recomendado)
npx update-browserslist-db@latest

# Instalação
npm install --legacy-peer-deps --no-audit

# Verificar se funcionou
ls node_modules/react-scripts
```

## 🎯 Usando o Script Automatizado

Para facilitar, use o script automatizado:

```bash
cd /home/deploy/multivustestes/frontend
chmod +x COMANDOS-PRODUCAO-FINAL.sh
bash COMANDOS-PRODUCAO-FINAL.sh
```

O script faz tudo automaticamente e verifica se a instalação foi bem-sucedida.

---

**Última atualização:** Janeiro 2025

