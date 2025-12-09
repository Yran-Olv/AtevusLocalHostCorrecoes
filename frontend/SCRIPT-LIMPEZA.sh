#!/bin/bash

# Script para limpar o frontend
# Execute: bash SCRIPT-LIMPEZA.sh

echo "🧹 Iniciando limpeza do frontend..."

cd "$(dirname "$0")" || exit 1

# 1. Remover pasta apagar/ (se existir)
if [ -d "apagar" ]; then
    echo "🗑️ Removendo pasta apagar/..."
    rm -rf apagar/
    echo "✅ Pasta apagar/ removida"
else
    echo "ℹ️ Pasta apagar/ não encontrada"
fi

# 2. Remover arquivos duplicados
echo "🔍 Procurando arquivos duplicados..."

if [ -f "src/components/ContactImportWpModal/index copy.js" ]; then
    echo "🗑️ Removendo arquivo duplicado: ContactImportWpModal/index copy.js"
    rm -f "src/components/ContactImportWpModal/index copy.js"
fi

if [ -f "src/pages/Financeiro/index_.js" ]; then
    echo "⚠️ Arquivo encontrado: Financeiro/index_.js (verificar se é necessário)"
fi

# 3. Limpar node_modules/.cache
if [ -d "node_modules/.cache" ]; then
    echo "🗑️ Limpando cache do node_modules..."
    rm -rf node_modules/.cache
    echo "✅ Cache limpo"
fi

# 4. Limpar build antigo
if [ -d "build" ]; then
    echo "🗑️ Removendo build antigo..."
    rm -rf build/
    echo "✅ Build antigo removido"
fi

# 5. Limpar logs
echo "🗑️ Limpando logs..."
rm -f npm-debug.log* yarn-debug.log* yarn-error.log*

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Revisar e remover console.logs manualmente"
echo "   2. Corrigir memory leaks em useUser/index.js"
echo "   3. Executar: npm install"
echo "   4. Executar: npm run build"

