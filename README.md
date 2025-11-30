## 🔄 Última Atualização (12/11/2025)

### Suporte a LID (Linked ID) do WhatsApp + Otimizações de Performance

**Passos para atualizar:**

```bash
# 1. Sincronizar arquivos do repositório
git pull origin main

# 2. Atualizar Baileys e Jimp
cd backend
npm install @whiskeysockets/baileys@6.7.21 jimp@1.6.0 --save

# 3. Build
npm run build

# 4. Executar migration (adiciona coluna 'lid' na tabela Contacts)
npx sequelize db:migrate

# 5. Restart PM2
pm2 restart backend
```

---
## Requisitos

| Componente | Mínimo | Recomendado |
| --- | --- | --- |
| **Node.js** | 20.19.x | 20.19.x ou superior |
| **Ubuntu** | 20.04 LTS | 22.04 LTS |
| **Memória RAM** | 6GB | 10GB+ |
| **vCPU** | 4 cores | 8+ cores |
| **Armazenamento** | 20GB SSD | 40GB+ SSD |
| **PostgreSQL** | 12+ | 14+ |
| **Redis** | 6+ | 7+ |

---

## 📚 Wiki e Documentação

### 🏗️ Estrutura do Backend
Ver [Wiki - Estrutura do Backend](wiki/ESTRUTURA-BACKEND.md) - Organização e funcionalidade de cada pasta

### 📨 Mensagens WhatsApp
Ver [Wiki - Mensagens WhatsApp](wiki/MENSAGENS-WHATSAPP.md) - Lógica de envio e recebimento de mensagens

### 🔒 Segurança
Ver [Wiki - Segurança](wiki/SEGURANCA.md)

### ⚡ Performance
Ver [Wiki - Performance](wiki/PERFORMANCE.md)

---
