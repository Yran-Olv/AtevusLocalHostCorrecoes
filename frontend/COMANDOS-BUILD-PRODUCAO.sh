#!/bin/bash

# Script para build em produção (Linux)
# Execute: bash COMANDOS-BUILD-PRODUCAO.sh

echo "🚀 Iniciando build de produção..."

# 1. Ir para o diretório do frontend
cd /home/deploy/multivus/frontend || exit 1

# 2. Verificar se react-app-rewired está instalado
if ! npm list react-app-rewired &> /dev/null; then
    echo "📦 Instalando react-app-rewired..."
    npm install react-app-rewired --save-dev --legacy-peer-deps
fi

# 3. Atualizar browserslist (opcional, mas recomendado)
echo "🔄 Atualizando browserslist..."
npm run update-browserslist || npx update-browserslist-db@latest

# 4. Verificar se config-overrides.js existe
if [ ! -f "config-overrides.js" ]; then
    echo "❌ Erro: config-overrides.js não encontrado!"
    echo "   Certifique-se de que o arquivo existe na raiz do diretório frontend/"
    exit 1
fi

# 5. Limpar cache (opcional, mas recomendado para builds limpos)
echo "🧹 Limpando cache..."
rm -rf node_modules/.cache
rm -rf build

# 6. Fazer build
echo "🔨 Iniciando build..."
npm run build

# 7. Verificar se o build foi criado
if [ -d "build" ]; then
    echo "✅ Build concluído com sucesso!"
    echo "📊 Tamanho do build:"
    du -sh build/
    echo "📁 Arquivos criados:"
    ls -lh build/static/js/ | head -10
else
    echo "❌ Erro: Build não foi criado!"
    exit 1
fi

echo "✨ Processo concluído!"

