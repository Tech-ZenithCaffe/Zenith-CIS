#!/usr/bin/env bash
set -e

NODE_PATH="/mnt/c/Program Files/nodejs"
PORT=${1:-3000}

export PATH="$NODE_PATH:$PATH"

echo "Starting dev server on port $PORT..."

HOSTNAME=0.0.0.0 "$NODE_PATH/npx.cmd" next dev --port "$PORT" > /tmp/zenith-dev.log 2>&1 &
DEV_PID=$!
echo "PID: $DEV_PID"

# Wait for server to be ready
for i in $(seq 1 60); do
  HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --max-time 2 http://127.0.0.1:$PORT/auth/login 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" != "000" ]; then
    echo "READY after ${i}s (HTTP $HTTP_CODE)"
    # Print last few log lines
    tail -5 /tmp/zenith-dev.log 2>/dev/null
    exit 0
  fi
  sleep 1
done

echo "TIMEOUT - server did not start within 60s"
tail -30 /tmp/zenith-dev.log 2>/dev/null
kill $DEV_PID 2>/dev/null || true
exit 1
