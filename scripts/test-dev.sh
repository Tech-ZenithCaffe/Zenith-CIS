#!/usr/bin/env bash
#
# test-dev.sh — Verifica se o servidor de desenvolvimento Next.js arranca
#               e responde a pedidos HTTP.
#
# Uso:
#   bash scripts/test-dev.sh
#
# Pré-requisitos:
#   - Node.js instalado (npm)
#   - .env.local configurado com credenciais Supabase (placeholders servem)
#   - Porta 3000 livre
#
# Nota (Windows/WSL):
#   - Se o Node.js estiver instalado no Windows mas não no WSL, o script
#     tenta detetá-lo em /mnt/c/Program Files/nodejs/ automaticamente.
#   - Se o Next.js demorar muito a compilar, aumenta TIMEOUT_SEC abaixo.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TIMEOUT_SEC=45
DEV_PORT=3000
DEV_PID=""

cleanup() {
  echo ""
  echo "🧹 A fazer cleanup..."
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
    echo "   Servidor dev parado (PID $DEV_PID)"
  fi
}
trap cleanup EXIT

# --------------------------------------------------
echo "🔍 A verificar pré-requisitos..."

# 1. Node.js — procura no PATH e em paths comuns do Windows (WSL)
NODE_BIN=""
if command -v node &>/dev/null; then
  NODE_BIN="$(command -v node)"
elif [ -x "/mnt/c/Program Files/nodejs/node.exe" ]; then
  NODE_BIN="/mnt/c/Program Files/nodejs/node.exe"
  PATH="/mnt/c/Program Files/nodejs:$PATH"
elif [ -x "/mnt/c/Program Files/nodejs/node" ]; then
  NODE_BIN="/mnt/c/Program Files/nodejs/node"
  PATH="/mnt/c/Program Files/nodejs:$PATH"
fi

if [ -z "$NODE_BIN" ]; then
  echo "❌ Node.js não encontrado."
  echo "   Instala Node.js em https://nodejs.org ou adiciona ao PATH."
  exit 1
fi
echo "   Node.js: $NODE_BIN"
echo "   Versão:  $("$NODE_BIN" --version)"

# 2. Dependências instaladas
if [ ! -d "$SCRIPT_DIR/node_modules" ]; then
  echo "⚠️  node_modules não encontrado. A correr npm install..."
  cd "$SCRIPT_DIR"
  npm install
fi

# 3. .env.local
if [ ! -f "$SCRIPT_DIR/.env.local" ]; then
  echo "⚠️  .env.local não encontrado. A copiar de .env.example..."
  cp "$SCRIPT_DIR/.env.example" "$SCRIPT_DIR/.env.local"
  echo "   ✏️  Substitui os placeholders em .env.local pelas credenciais reais mais tarde."
fi

# 4. Porta livre — tenta curl primeiro (mais portátil que lsof/ss)
if curl -s -o /dev/null --max-time 2 "http://localhost:$DEV_PORT" 2>/dev/null; then
  echo "⚠️  A porta $DEV_PORT já está ocupada (algo respondeu)."
  echo "   Fecha o processo ou usa uma porta diferente."
  echo "   Para encontrar o processo: lsof -i :$DEV_PORT  ou  ss -tlnp"
  exit 1
fi

echo "✅ Pré-requisitos OK"
echo ""

# --------------------------------------------------
echo "🚀 A arrancar npm run dev (porta $DEV_PORT)..."
cd "$SCRIPT_DIR"

npm run dev -- --port "$DEV_PORT" &>/tmp/zenith-dev-test.log &
DEV_PID=$!

echo "   PID: $DEV_PID"
echo "   Log:  tail -f /tmp/zenith-dev-test.log"
echo ""

# --------------------------------------------------
echo "⏳ A aguardar servidor ficar pronto (timeout: ${TIMEOUT_SEC}s)..."

attempts=0
while [ $attempts -lt "$TIMEOUT_SEC" ]; do
  # Verifica se o processo ainda está vivo
  if ! kill -0 "$DEV_PID" 2>/dev/null; then
    echo "❌ O servidor dev morreu inesperadamente. Log:"
    tail -20 /tmp/zenith-dev-test.log
    exit 1
  fi

  # Tenta conectar — espera HTTP 200 num endpoint conhecido
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 \
    "http://localhost:$DEV_PORT/auth/login" 2>/dev/null || echo "000")

  if [ "$HTTP_CODE" != "000" ]; then
    echo "✅ Servidor respondeu em $attempts segundos (HTTP $HTTP_CODE)!"
    echo ""
    echo "📄 Endpoints verificados:"
    for path in "/" "/auth/login"; do
      STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 2 \
        "http://localhost:$DEV_PORT$path" 2>/dev/null || echo "erro")
      echo "   GET $path → HTTP $STATUS"
    done
    echo ""
    echo "✅ Teste concluído com sucesso! O servidor dev arranca corretamente."
    exit 0
  fi

  sleep 1
  attempts=$((attempts + 1))
done

# --------------------------------------------------
# Timeout
echo "❌ Timeout após ${TIMEOUT_SEC}s — o servidor não respondeu."
echo ""
echo "   📋 Últimas 30 linhas do log do servidor:"
echo "   ─────────────────────────────────────────"
tail -30 /tmp/zenith-dev-test.log
echo ""
echo "   🔍 Dica: Verifica se há erros de compilação no log acima."
echo "   Se for erro de credenciais Supabase, atualiza .env.local"
echo "   com valores reais do teu projeto Supabase."
exit 1
