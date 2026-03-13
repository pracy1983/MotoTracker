const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize WebSocket server attached to the HTTP server
const wss = new WebSocket.Server({ 
  server,
  // The client connects to /ws, but Traefik might strip it.
  // We'll handle everything.
});

const connectedClients = new Set();

wss.on('connection', (ws, req) => {
  console.log(`WebSocket connected from ${req.socket.remoteAddress}`);
  connectedClients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received:', data);

      // Broadcast to all other clients
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

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('WebSocket server is running');
});

const port = process.env.WS_PORT || 3001;
server.listen(port, '0.0.0.0', () => {
  console.log(`WebSocket server listening on port ${port}`);
});

// Handle cleanup on process exit
function cleanup() {
  console.log('Cleaning up...');
  wss.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Don't exit immediately if possible, but usually safe in Docker
  cleanup();
});
