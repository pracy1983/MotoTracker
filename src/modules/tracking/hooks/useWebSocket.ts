import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '../utils/socket';
import { config } from '../config/appConfig';
import type { Location } from '../types';

export const useWebSocket = (motoId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocketClient | null>(null);

  const handleMessage = useCallback((message: any) => {
    try {
      if (message.type === 'location' && message.motoId === motoId) {
        // Handle location update
        const location = message.data as Location;
        console.log('Received location update:', location);
      }
    } catch (err) {
      console.error('Error handling message:', err);
    }
  }, [motoId]);

  const handleError = useCallback((error: Event) => {
    setError('Connection error');
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!wsRef.current && motoId) {
      wsRef.current = new WebSocketClient(
        config.SOCKET_URL,
        handleMessage,
        handleError
      );
      wsRef.current.connect();
      setIsConnected(true);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
        setIsConnected(false);
      }
    };
  }, [motoId, handleMessage, handleError]);

  const sendMessage = useCallback((data: any) => {
    if (wsRef.current) {
      wsRef.current.send(data);
    }
  }, []);

  return {
    isConnected,
    error,
    sendMessage
  };
};
