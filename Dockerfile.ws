FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY websocket-server.js .

# Ensure it uses the correct port
ENV WS_PORT=3001
EXPOSE 3001

CMD ["node", "websocket-server.js"]
