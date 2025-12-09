#!/bin/bash

# Script completo de deploy em produção
# Execute: bash DEPLOY-PRODUCAO.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando deploy em produção..."

# 1. Ir para o diretório
cd /home/deploy/multivustestes/frontend || exit 1

# 2. Limpeza completa
echo "🧹 Limpando node_modules, package-lock.json e build antigo..."
rm -rf node_modules package-lock.json .npm build

# 3. Limpar cache do npm
echo "🗑️ Limpando cache do npm..."
npm cache clean --force

# 4. Instalar dependências
echo "📦 Instalando dependências..."
if ! npm install --legacy-peer-deps --no-audit; then
    echo "❌ Erro ao instalar dependências!"
    exit 1
fi

# 5. Verificar se react-scripts está instalado
if [ ! -d "node_modules/react-scripts" ]; then
    echo "❌ Erro: react-scripts não foi instalado!"
    exit 1
fi

# 6. Atualizar browserslist (opcional)
echo "🔄 Atualizando browserslist..."
npx update-browserslist-db@latest || true

# 7. Fazer build
echo "🔨 Executando build..."
if ! npm run build; then
    echo "❌ Erro ao fazer build!"
    echo "📋 Verifique os logs acima para identificar o problema."
    exit 1
fi

# 8. Verificar se o build foi criado
if [ ! -f "build/index.html" ]; then
    echo "❌ ERRO: Build não foi criado!"
    echo "   O arquivo build/index.html não existe."
    exit 1
fi

# 9. Verificar estrutura do build
echo "✅ Build criado com sucesso!"
echo "📊 Estrutura do build:"
ls -lh build/ | head -10

if [ -d "build/static" ]; then
    echo "📁 Arquivos estáticos:"
    ls -lh build/static/js/ | head -5
    echo ""
    echo "📊 Tamanho total do build:"
    du -sh build/
fi

echo ""
echo "✨ Deploy concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Verificar se o servidor está configurado corretamente"
echo "   2. Se usar server.js: node server.js"
echo "   3. Se usar PM2: pm2 restart multivus-frontend"
echo "   4. Se usar nginx: verificar configuração do nginx"

