#!/bin/bash

# Script para corrigir problemas de instalação em produção
# Execute: bash COMANDOS-FIX-INSTALACAO.sh

echo "🔧 Corrigindo problemas de instalação..."

# 1. Ir para o diretório do frontend
cd /home/deploy/multivustestes/frontend || exit 1

# 2. Limpeza completa
echo "🧹 Limpando node_modules, package-lock.json e cache..."
rm -rf node_modules package-lock.json .npm
npm cache clean --force

# 3. Tentar instalação com --legacy-peer-deps
echo "📦 Tentando instalação com --legacy-peer-deps..."
if npm install --legacy-peer-deps --no-audit; then
    echo "✅ Instalação concluída com sucesso!"
    exit 0
fi

# 4. Se falhar, tentar sem --legacy-peer-deps
echo "⚠️ Primeira tentativa falhou. Tentando sem --legacy-peer-deps..."
if npm install --no-audit; then
    echo "✅ Instalação concluída com sucesso!"
    exit 0
fi

# 5. Se ainda falhar, tentar instalar apenas produção
echo "⚠️ Segunda tentativa falhou. Tentando apenas dependências de produção..."
if npm install --production --legacy-peer-deps; then
    echo "✅ Dependências de produção instaladas!"
    echo "📦 Instalando devDependencies..."
    npm install --save-dev --legacy-peer-deps
    echo "✅ Instalação concluída!"
    exit 0
fi

# 6. Última tentativa: usar yarn se disponível
if command -v yarn &> /dev/null; then
    echo "⚠️ Tentando com yarn..."
    yarn install --ignore-engines
    if [ $? -eq 0 ]; then
        echo "✅ Instalação concluída com yarn!"
        exit 0
    fi
fi

echo "❌ Todas as tentativas falharam!"
echo "📋 Verifique o arquivo SOLUCAO-INSTALACAO-PRODUCAO.md para mais opções"
exit 1

