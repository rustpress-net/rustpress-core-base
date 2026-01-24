import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocketStore, useAlertStore, useUIStore } from '@store/index';
import type { WebSocketEvent, WebSocketEventType } from '@/types';

const WS_URL = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/queue-manager`;
const RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

export function useWebSocket() {
  const queryClient = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectDelayRef = useRef(RECONNECT_DELAY);

  const {
    setConnected,
    setConnecting,
    setError,
    setLastMessage,
    incrementReconnectAttempts,
    resetReconnectAttempts,
    reconnectAttempts,
  } = useWebSocketStore();

  const { addAlert } = useAlertStore();
  const { preferences } = useUIStore();

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const data: WebSocketEvent = JSON.parse(event.data);
      setLastMessage(data);

      // Invalidate relevant queries based on event type
      switch (data.type as WebSocketEventType) {
        case 'queue.updated':
        case 'queue.deleted':
          queryClient.invalidateQueries({ queryKey: ['queues'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
          break;

        case 'message.enqueued':
        case 'message.processed':
        case 'message.failed':
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
          break;

        case 'worker.registered':
        case 'worker.heartbeat':
        case 'worker.offline':
          queryClient.invalidateQueries({ queryKey: ['workers'] });
          break;

        case 'alert.triggered':
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
          if (preferences.notifications_enabled && 'Notification' in window) {
            const alertData = data.data as { title: string; message: string };
            new Notification('Queue Manager Alert', {
              body: alertData.message,
              icon: '/vite.svg',
            });
          }
          break;

        case 'alert.resolved':
          queryClient.invalidateQueries({ queryKey: ['alerts'] });
          break;

        case 'metrics.updated':
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
          break;
      }
    } catch (err) {
      console.error('Failed to parse WebSocket message:', err);
    }
  }, [queryClient, setLastMessage, addAlert, preferences.notifications_enabled]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnecting(true);

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        setConnected(true);
        resetReconnectAttempts();
        reconnectDelayRef.current = RECONNECT_DELAY;

        // Subscribe to all events
        ws.send(JSON.stringify({
          type: 'subscribe',
          channels: ['queues', 'messages', 'workers', 'alerts', 'metrics'],
        }));
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;

        // Schedule reconnection
        const delay = Math.min(
          reconnectDelayRef.current * Math.pow(2, reconnectAttempts),
          MAX_RECONNECT_DELAY
        );
        reconnectTimeoutRef.current = setTimeout(() => {
          incrementReconnectAttempts();
          connect();
        }, delay);
      };

      ws.onerror = (error) => {
        setError('WebSocket connection error');
        console.error('WebSocket error:', error);
      };

      ws.onmessage = handleMessage;

      wsRef.current = ws;
    } catch (err) {
      setError('Failed to connect to WebSocket');
      setConnecting(false);
    }
  }, [
    handleMessage,
    setConnected,
    setConnecting,
    setError,
    resetReconnectAttempts,
    incrementReconnectAttempts,
    reconnectAttempts,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setConnected(false);
  }, [setConnected]);

  const send = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Request notification permission on mount
  useEffect(() => {
    if (preferences.notifications_enabled && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [preferences.notifications_enabled]);

  return {
    connect,
    disconnect,
    send,
  };
}

export default useWebSocket;
