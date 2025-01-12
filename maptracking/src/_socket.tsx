import readBlob from './_blobReader'
function startSocket(socketClient: WebSocket | null,
                     wsUrl: string,
                     callback: any,
                     setSocketMethodCallback: any) {
    let localSocketClient = socketClient;
    if (localSocketClient) {
        localSocketClient.close()
        localSocketClient = null;
    }
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    localSocketClient = new WebSocket(wsUrl);
    localSocketClient.addEventListener('message', async (event) => {
        await handleSocketMessage(event, callback);
    });
    setSocketMethodCallback(localSocketClient);
}

function closeAndClearOpenedSocket(socketClient: WebSocket | null) {
    if(socketClient) {
        socketClient.close();
        socketClient = null;
    }
}

async function handleSocketMessage(event: MessageEvent<any>, callback: any) {
    if (event.data instanceof Blob) {
        var message = await readBlob(event.data);
        callback(message);
    }
}

export const connectSocketClient = (socketClient: WebSocket | null,
                                    wsUrl: string,
                                    callback: any,
                                    setSocketMethodCallback: any) => {
    closeAndClearOpenedSocket(socketClient);
    startSocket(socketClient, wsUrl, callback, setSocketMethodCallback);
}

export const closeSocket = (socketClient: WebSocket | null) => {
    if (socketClient) {
        socketClient.close();
    }
}

