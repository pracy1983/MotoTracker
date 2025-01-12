const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const ngrok = require('ngrok');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const connectedClients = new Set();

function runServer() {
  wss.on('connection', (ws) => {
    console.log('WebSocket connected');
    connectedClients.add(ws);
  
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        console.log('Received:', data);
  
        // Broadcast para todos os clientes conectados
        connectedClients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
          }
        });
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
  
    ws.on('close', () => {
      console.log('WebSocket disconnected');
      connectedClients.delete(ws);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connectedClients.delete(ws);
    });
  });
  
  const port = process.env.WS_PORT || 3001;
  server.listen(port, () => {
    console.log(`WebSocket server listening on port ${port}`);
  });
}

async function runNgrok() {
  if (!process.env.NGROK_AUTHTOKEN) {
    console.warn('NGROK_AUTHTOKEN not found in environment variables');
    return;
  }

  try {
    const url = await ngrok.connect({
      addr: process.env.WS_PORT || 3001,
      authtoken: process.env.NGROK_AUTHTOKEN,
      proto: 'tcp'
    });
    
    console.log('Ngrok tunnel established:', url);
    return url;
  } catch (error) {
    console.error('Error starting ngrok:', error);
    return null;
  }
}

// Handle cleanup
async function cleanup() {
  try {
    console.log('Cleaning up...');
    await ngrok.kill();
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

// Handle cleanup on process exit
process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  cleanup();
});

async function main() {
  runServer();
  if (process.env.NODE_ENV === 'production') {
    await runNgrok();
  }
}

main();
