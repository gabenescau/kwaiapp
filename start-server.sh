#!/usr/bin/env bash
# start-server.sh — Inicia servidor PHP local

PORT=8000
echo "🚀 Iniciando servidor PHP na porta $PORT..."
echo "📝 Acesse: http://localhost:$PORT"
echo "🔗 Webhook: http://localhost:$PORT/api/zuckpay_pix.php"
echo ""
echo "Pressione Ctrl+C para parar"
echo ""

php -S localhost:$PORT
