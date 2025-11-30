# ⚠️ Configuração JWT - Erro Corrigido

## 🔴 Erro Encontrado

```
ERROR: secretOrPrivateKey must have a value
```

**Causa**: A variável de ambiente `JWT_SECRET` não está configurada ou está vazia.

---

## ✅ Solução

### 1. Verificar/Criar arquivo `.env` no backend

Crie ou edite o arquivo `backend/.env`:

```env
# JWT Configuration
JWT_SECRET=sua-chave-secreta-super-segura-aqui-minimo-32-caracteres
JWT_REFRESH_SECRET=sua-chave-refresh-secreta-diferente-aqui

# Outras variáveis importantes
PORT=8080
FRONTEND_URL=http://localhost:3000

# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=whaticket
DB_USER=postgres
DB_PASS=sua-senha

# Redis (se estiver usando)
REDIS_URI_ACK=redis://localhost:6379
```

### 2. Gerar uma chave secreta segura

```bash
# No terminal, gere uma chave aleatória:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Reiniciar o backend

Após configurar o `.env`, reinicie o servidor backend:

```bash
cd backend
npm run build
npm start
```

---

## 📝 Nota

O código em `backend/src/config/auth.ts` tem um fallback:

```typescript
secret: process.env.JWT_SECRET || "mysecret"
```

Mas se `process.env.JWT_SECRET` for uma string vazia (`""`), o fallback não funciona. Por isso é importante garantir que a variável esteja definida corretamente.

---

## ✅ Verificação

Após configurar, teste fazendo login no frontend. O erro não deve mais aparecer.

