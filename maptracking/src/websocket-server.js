// src/websocket-server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const ngrok = require('ngrok');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const connectedClients = new Set();


function runServer() {
  wss.on('connection', (ws) => {
    console.log('WebSocket connected');
    connectedClients.add(ws);
  
    ws.on('message', (message) => {
      console.log(`Received: ${message}`);
  
      connectedClients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });
  
    ws.on('close', () => {
      console.log('WebSocket disconnected');
      connectedClients.delete(ws);
    });
  });
  
  server.listen(3001, () => {
    console.log('WebSocket server listening on port 3001');
  });
}



async function runNgrok() {
    let stringNgrokDir = "../" ?? "";
    const binPath = path.resolve(__dirname, stringNgrokDir);
    
    var url = await ngrok.connect({
      addr: 3001,
      binPath: () => binPath,
      authtoken: "22YFK8bJIhlKrWeX6FuAikG0J8H_6SJBKqAXGtVBvTWKmXrdm",
      proto: 'tcp'
    }, (err) => {
      if (err) {
        console.error('Error starting Ngrok:', err);
        reject(err);
      }
    });

    return url;
}

let ngrokUrl = "";

// Handle cleanup on process exit
process.on('exit', async () => {
  if (ngrokUrl) {
    console.log('Closing Ngrok tunnel');
    await ngrok.disconnect(ngrokUrl);
  }
});

async function main() {
  try {
    runServer();
    ngrokUrl = await runNgrok();
    console.log("NGROK URL: " + ngrokUrl);
    // Use ngrokUrl as needed
  } catch (error) {
    // Handle errors
    console.error('Error:', error);
  }
}

main();
