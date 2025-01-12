@echo off

REM Start the Next.js development server and WebSocket server
concurrently "npm run dev" "node src/websocket-server-ssl.js" "node src/websocket-server-local-proxy.js"
