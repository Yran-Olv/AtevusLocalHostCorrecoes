# 🚀 Guia de Deploy para Produção - Ubuntu 22

## 📋 Pré-requisitos

- ✅ VPS Ubuntu 22.04 LTS
- ✅ Node.js 20.19.x instalado
- ✅ PostgreSQL 14+ configurado
- ✅ Redis 7+ configurado
- ✅ PM2 instalado globalmente
- ✅ Nginx configurado (se usar proxy reverso)
- ✅ Git configurado para pull do repositório

### ⚠️ Nota sobre Compatibilidade

Este sistema é desenvolvido no **Windows (localhost)** e implantado em **Ubuntu 22 (produção)**. 
Todas as correções aplicadas são compatíveis com ambos os ambientes graças ao uso de:
- `cross-env` para variáveis de ambiente
- Caminhos relativos nos imports
- Scripts npm compatíveis com ambos os sistemas

---

## 🔄 Processo de Deploy

### 1. Preparação no Ambiente de Desenvolvimento (Windows)

#### 1.1. Commit das Alterações
```bash
git add .
git commit -m "feat: atualizações de dependências e correções"
git push origin main
```

#### 1.2. Verificar Build Local (Opcional)
```bash
cd frontend
npm run build
# Verificar se o build funciona sem erros
```

---

### 2. Deploy no Servidor Ubuntu 22

#### 2.1. Conectar ao Servidor
```bash
ssh usuario@seu-servidor.com
```

#### 2.2. Navegar para o Diretório do Projeto
```bash
cd /caminho/para/seu/projeto
# Exemplo: cd /var/www/multivus
```

#### 2.3. Atualizar Código do Repositório
```bash
git pull origin main
```

#### 2.4. Instalar/Atualizar Dependências do Frontend
```bash
cd frontend
npm install --force
```

#### 2.5. Build do Frontend
```bash
npm run build
```

**Nota**: O build cria a pasta `build/` com os arquivos estáticos.

#### 2.6. Instalar/Atualizar Dependências do Backend
```bash
cd ../backend
npm install --force
```

#### 2.7. Build do Backend
```bash
npm run build
```

**Nota**: O build compila TypeScript para JavaScript na pasta `dist/`.

#### 2.8. Executar Migrações do Banco de Dados
```bash
npx sequelize db:migrate
```

**⚠️ IMPORTANTE**: 
- Faça backup do banco antes de executar migrações em produção
- Teste migrações em ambiente de staging primeiro

#### 2.9. Verificar Variáveis de Ambiente
```bash
# Verificar se o arquivo .env existe e está configurado
cat .env

# Verificar variáveis críticas:
# - DATABASE_URL
# - REDIS_HOST
# - FRONTEND_URL
# - REACT_APP_BACKEND_URL (no frontend)
```

#### 2.10. Reiniciar Aplicação com PM2
```bash
# Parar aplicação atual
pm2 stop multivus-backend

# Reiniciar aplicação
pm2 restart multivus-backend

# Ou se for a primeira vez:
pm2 start ecosystem.config.js
```

#### 2.11. Verificar Status
```bash
# Ver status dos processos
pm2 status

# Ver logs em tempo real
pm2 logs multivus-backend

# Ver logs apenas de erros
pm2 logs multivus-backend --err

# Ver informações detalhadas
pm2 describe multivus-backend
```

---

## 🔍 Verificações Pós-Deploy

### 1. Verificar Backend
```bash
# Testar endpoint de health (se existir)
curl http://localhost:PORT/api/version

# Verificar logs
pm2 logs multivus-backend --lines 50
```

### 2. Verificar Frontend
- Acessar URL do frontend no navegador
- Verificar console do navegador (F12) por erros
- Testar login
- Testar funcionalidades críticas

### 3. Verificar Banco de Dados
```bash
# Conectar ao PostgreSQL
psql -U usuario -d nome_banco

# Verificar últimas migrações
SELECT * FROM "SequelizeMeta" ORDER BY name DESC LIMIT 5;
```

### 4. Verificar Redis
```bash
# Conectar ao Redis
redis-cli

# Verificar conexão
PING
# Deve retornar: PONG
```

---

## ⚠️ Troubleshooting

### Problema: PM2 não inicia
```bash
# Verificar se o arquivo dist/server.js existe
ls -la backend/dist/server.js

# Verificar permissões
chmod +x backend/dist/server.js

# Tentar iniciar manualmente para ver erros
cd backend
node dist/server.js
```

### Problema: Build do Frontend falha
```bash
# Limpar cache do npm
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install --force
npm run build
```

### Problema: Erros de permissão
```bash
# Ajustar permissões (cuidado com sudo!)
sudo chown -R $USER:$USER /caminho/do/projeto
chmod -R 755 /caminho/do/projeto
```

### Problema: Porta já em uso
```bash
# Verificar qual processo está usando a porta
sudo lsof -i :PORTA
# Ou
sudo netstat -tulpn | grep PORTA

# Matar processo se necessário
sudo kill -9 PID
```

### Problema: Variáveis de ambiente não carregadas
```bash
# Verificar se o .env está no lugar certo
ls -la backend/.env

# Verificar conteúdo (sem expor senhas)
cat backend/.env | grep -v PASSWORD
```

---

## 🔄 Rollback (Em caso de problemas)

### 1. Reverter Código
```bash
# Voltar para commit anterior
git log --oneline -10  # Ver últimos commits
git checkout COMMIT_ANTERIOR

# Ou reverter último commit
git revert HEAD
```

### 2. Reinstalar Dependências Antigas
```bash
cd frontend
npm install --force

cd ../backend
npm install --force
npm run build
```

### 3. Restaurar Banco de Dados (se necessário)
```bash
# Restaurar backup do banco
psql -U usuario -d nome_banco < backup.sql
```

### 4. Reiniciar PM2
```bash
pm2 restart multivus-backend
```

---

## 📊 Monitoramento

### Comandos Úteis do PM2
```bash
# Status geral
pm2 status

# Monitoramento em tempo real
pm2 monit

# Informações de memória/CPU
pm2 describe multivus-backend

# Reiniciar com zero downtime
pm2 reload multivus-backend

# Salvar configuração atual
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

### Logs
```bash
# Ver logs em tempo real
pm2 logs multivus-backend

# Ver apenas erros
pm2 logs multivus-backend --err

# Ver últimas 100 linhas
pm2 logs multivus-backend --lines 100

# Limpar logs
pm2 flush
```

---

## 🔐 Segurança

### Checklist de Segurança
- [ ] Arquivo `.env` não está no repositório (verificar `.gitignore`)
- [ ] Senhas do banco são fortes
- [ ] Firewall configurado (UFW)
- [ ] SSL/HTTPS configurado (Let's Encrypt)
- [ ] Backups automáticos configurados
- [ ] Logs de acesso monitorados
- [ ] Variáveis sensíveis não expostas

---

## 📝 Checklist de Deploy

### Antes do Deploy
- [ ] Testar localmente no Windows
- [ ] Commit e push das alterações
- [ ] Backup do banco de dados
- [ ] Verificar variáveis de ambiente

### Durante o Deploy
- [ ] Git pull no servidor
- [ ] Instalar dependências (frontend e backend)
- [ ] Build do frontend
- [ ] Build do backend
- [ ] Executar migrações
- [ ] Reiniciar PM2

### Após o Deploy
- [ ] Verificar status do PM2
- [ ] Verificar logs
- [ ] Testar frontend no navegador
- [ ] Testar funcionalidades críticas
- [ ] Monitorar por alguns minutos

---

## 🆘 Suporte

Em caso de problemas:
1. Verificar logs do PM2
2. Verificar logs do Nginx (se usar)
3. Verificar logs do sistema: `journalctl -u nginx`
4. Verificar espaço em disco: `df -h`
5. Verificar memória: `free -h`
6. Verificar processos: `htop` ou `top`

---

**Última Atualização**: 2025-01-27  
**Ambiente de Produção**: Ubuntu 22.04 LTS  
**Gerenciador de Processos**: PM2

