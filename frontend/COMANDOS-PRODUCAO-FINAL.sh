#!/bin/bash

# Script definitivo para instalação em produção
# Execute: bash COMANDOS-PRODUCAO-FINAL.sh

set -e  # Parar em caso de erro

echo "🚀 Iniciando instalação em produção..."

# 1. Ir para o diretório
cd /home/deploy/multivustestes/frontend || exit 1

# 2. Limpeza completa
echo "🧹 Limpando tudo..."
rm -rf node_modules package-lock.json .npm
npm cache clean --force

# 3. Atualizar browserslist primeiro (evita warnings)
echo "🔄 Atualizando browserslist..."
npx update-browserslist-db@latest || true

# 4. Instalar dependências
echo "📦 Instalando dependências..."
npm install --legacy-peer-deps --no-audit

# 5. Verificar instalação
if [ -d "node_modules" ]; then
    echo "✅ Instalação concluída com sucesso!"
    echo "📊 Verificando dependências críticas..."
    
    # Verificar se react-scripts está instalado
    if [ -d "node_modules/react-scripts" ]; then
        echo "✅ react-scripts instalado"
    else
        echo "❌ react-scripts não encontrado!"
        exit 1
    fi
    
    # Verificar se react está instalado
    if [ -d "node_modules/react" ]; then
        echo "✅ react instalado"
    else
        echo "❌ react não encontrado!"
        exit 1
    fi
    
    echo "✨ Tudo pronto para fazer build!"
    echo ""
    echo "Próximo passo: npm run build"
else
    echo "❌ Erro: node_modules não foi criado!"
    exit 1
fi

