require('dotenv').config();

const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const express = require('express');
const app = express();

const server = http.createServer(app);

let CLIENT_WEB_SOCKET = null;
let SERVER_WEB_SOCKET = null;

function startProxyServer() {
  let proxySocket = new WebSocket.Server({ server });
  
  proxySocket.on('connection', (clientWebSocket) => {
    CLIENT_WEB_SOCKET = clientWebSocket;
    writeLog('Proxy webSocket connected');
    connectTargetSocket();
  
    clientWebSocket.on('message', (message) => {
      writeLog(`Received: ${message}`);
    });
  
    clientWebSocket.on('close', () => {
      closeServerWebSocket();
      writeLog('WebSocket disconnected');
    });
  });
}

server.listen(8080, () => {
  writeLog('Proxy webSocket server listening on port 8080');
});

function closeServerWebSocket() {
  if(SERVER_WEB_SOCKET == null) {
    return;
  }

  writeLog('Closing server WebSocket connection with client...');
  SERVER_WEB_SOCKET.close();
}

function connectTargetSocket() {
  let socketClientOptions = {
    key: fs.readFileSync(process.env.CERTIFICATE_CLIENT_KEY),
    cert: fs.readFileSync(process.env.CERTIFICATE_CLIENT),
    passphrase: "DLalu5PXT7UHH0k",
    rejectUnauthorized: false
  };
  let wssTarget = new WebSocket('wss://localhost:3001', socketClientOptions);
  
  wssTarget.on('open', () => {
    writeLog("Connection opened.");
    SERVER_WEB_SOCKET = wssTarget;
  });
  
  wssTarget.on('message', (data) => {
    sendSocketMessage(data);
  });
}

function sendSocketMessage(messageData) {
  if(CLIENT_WEB_SOCKET == null) {
    writeLog('Current WebSocket client is undefined.');
    return;
  }

  writeLog("Sending message...");
  CLIENT_WEB_SOCKET.send(messageData);
}

function writeLog(logMessage) {
  let currentDate = new Date().toISOString().replace('T', ' ').split('.')[0]; // Get current date and time in the format yyyy-MM-dd HH:mm:ss
  console.log(`[${currentDate}][PROXY WEBSOCKET]: ${logMessage}`)
}

startProxyServer();