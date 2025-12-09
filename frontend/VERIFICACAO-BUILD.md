# ✅ Verificação e Correção do Erro de Build

## ❌ Erro

```
Error: ENOENT: no such file or directory, stat '/home/deploy/multivustestes/frontend/build/index.html'
```

## 🔍 Causa

Este erro ocorre quando:
1. O build não foi executado ainda
2. O build falhou silenciosamente
3. O servidor está tentando servir o build antes de ele ser criado

## ✅ Solução Passo a Passo

### 1. Verificar se o Build Existe

```bash
cd /home/deploy/multivustestes/frontend

# Verificar se a pasta build existe
ls -la build/

# Se não existir, você verá: "No such file or directory"
```

### 2. Executar o Build

```bash
cd /home/deploy/multivustestes/frontend

# Primeiro, garantir que as dependências estão instaladas
npm install --legacy-peer-deps --no-audit

# Depois, executar o build
npm run build

# Verificar se o build foi criado
ls -la build/
ls -la build/index.html
```

### 3. Verificar se o Build Foi Criado Corretamente

Após o build, você deve ver:

```bash
build/
├── index.html          # ✅ Deve existir
├── static/
│   ├── css/
│   │   └── *.css
│   └── js/
│       └── *.js
└── asset-manifest.json
```

### 4. Iniciar o Servidor

```bash
# Se estiver usando o server.js do frontend
node server.js

# Ou se estiver usando PM2
pm2 start server.js --name multivus-frontend

# Ou se estiver usando nginx, verificar configuração
```

## 🛠️ Script Completo de Deploy

```bash
#!/bin/bash
cd /home/deploy/multivustestes/frontend

# 1. Limpar
rm -rf node_modules package-lock.json build

# 2. Instalar dependências
npm install --legacy-peer-deps --no-audit

# 3. Fazer build
npm run build

# 4. Verificar se build foi criado
if [ ! -f "build/index.html" ]; then
    echo "❌ ERRO: Build falhou!"
    echo "Verifique os logs acima para identificar o problema."
    exit 1
fi

# 5. Verificar tamanho do build
echo "✅ Build criado com sucesso!"
du -sh build/
ls -lh build/static/js/ | head -5

# 6. Iniciar servidor (se necessário)
# node server.js
```

## 🔍 Troubleshooting

### Build não está sendo criado?

1. **Verificar erros no build:**
   ```bash
   npm run build 2>&1 | tee build.log
   ```

2. **Verificar memória:**
   ```bash
   # Se der erro de memória, aumentar
   NODE_OPTIONS=--max-old-space-size=8192 npm run build
   ```

3. **Verificar permissões:**
   ```bash
   # Garantir que tem permissão de escrita
   ls -la .
   chmod -R 755 .
   ```

### Build foi criado mas servidor não encontra?

1. **Verificar caminho no server.js:**
   ```bash
   # O caminho deve ser relativo ao diretório do server.js
   cat server.js | grep build
   ```

2. **Verificar se está no diretório correto:**
   ```bash
   pwd
   # Deve ser: /home/deploy/multivustestes/frontend
   ```

3. **Verificar se o servidor está rodando:**
   ```bash
   # Se usar PM2
   pm2 list
   pm2 logs multivus-frontend
   ```

## 📋 Checklist de Deploy

- [ ] Dependências instaladas (`npm install`)
- [ ] Build executado (`npm run build`)
- [ ] Pasta `build/` criada
- [ ] Arquivo `build/index.html` existe
- [ ] Arquivos estáticos em `build/static/` existem
- [ ] Servidor iniciado (se usar server.js)
- [ ] Nginx configurado (se usar nginx)

## ⚠️ Nota Importante

O `server.js` agora verifica se o build existe antes de iniciar. Se o build não existir, o servidor não inicia e mostra uma mensagem de erro clara.

---

**Última atualização:** Janeiro 2025

