require('dotenv').config();

const express = require('express');
const https = require('https');
const WebSocket = require('ws');
const ngrok = require('ngrok');
const path = require('path');
const fs = require('fs');


const CA_CERTIFICATE_PATH = `${process.env.BASE_PATH_CERTIFICATE}/${process.env.CERTIFICATE_CA}`;
const SERVER_CERTIFICATE_PATH = `${process.env.BASE_PATH_CERTIFICATE}/${process.env.CERTIFICATE_SERVER}`;
const SERVER_KEY_PATH = `${process.env.BASE_PATH_CERTIFICATE}/${process.env.CERTIFICATE_KEY}`;
const SECURE_PROTOCOL = "TLSv1_2_method";

const caCert = fs.readFileSync(CA_CERTIFICATE_PATH);
const serverOptions = {
  key: fs.readFileSync(SERVER_KEY_PATH),
  cert: fs.readFileSync(SERVER_CERTIFICATE_PATH),
  ca: [caCert],
  passphrase: process.env.CERTIFICATE_PASSPHRASE,
  requestCert: true,
  secureProtocol: SECURE_PROTOCOL
};

const app = express();
const server = https.createServer(serverOptions, app);
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
      authtoken: process.env.NGROK_AUTH_TOKEN,
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
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
