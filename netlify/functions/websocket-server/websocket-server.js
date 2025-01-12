const WebSocket = require('ws');
const { createServer } = require('http');

// Configuração do servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });
const connectedClients = new Set();

// Gerenciamento de conexões WebSocket
wss.on('connection', (ws) => {
  console.log('Cliente conectado');
  connectedClients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Mensagem recebida:', data);

      // Broadcast para todos os clientes conectados
      connectedClients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
    }
  });

  ws.on('close', () => {
    console.log('Cliente desconectado');
    connectedClients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('Erro no WebSocket:', error);
    connectedClients.delete(ws);
  });
});

// Handler para a função do Netlify
exports.handler = async function(event, context) {
  // Apenas permitir conexões WebSocket
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: 'Método não permitido'
    };
  }

  // Verificar se é uma solicitação de upgrade do WebSocket
  const headers = event.headers || {};
  if (headers.upgrade?.toLowerCase() !== 'websocket') {
    return {
      statusCode: 400,
      body: 'Conexão WebSocket necessária'
    };
  }

  try {
    // Criar servidor HTTP para o WebSocket
    const server = createServer();

    // Configurar upgrade do WebSocket
    server.on('upgrade', (request, socket, head) => {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    });

    return {
      statusCode: 101,
      headers: {
        'Upgrade': 'websocket',
        'Connection': 'Upgrade'
      }
    };
  } catch (error) {
    console.error('Erro ao configurar WebSocket:', error);
    return {
      statusCode: 500,
      body: 'Erro interno do servidor'
    };
  }
};
