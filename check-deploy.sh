#!/bin/bash
echo "🔍 Verificando deploy..."
echo ""
echo "🌐 URL: https://vsd-smart-final.pages.dev"
echo ""
echo "📋 Código de respuesta:"
curl -s -o /dev/null -w "%{http_code}" https://vsd-smart-final.pages.dev
echo ""
echo ""
echo "📋 Versión en producción:"
curl -s https://vsd-smart-final.pages.dev | grep -o 'version="[^"]*"' | head -1
echo ""
echo "✅ Verificación completada"
