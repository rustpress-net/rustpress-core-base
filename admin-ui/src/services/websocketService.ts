/**
 * WebSocket Service for real-time collaboration and chat
 */

import type {
  ClientMessage,
  ServerMessage,
  CursorPosition,
  Selection,
  TextChange,
  UserStatus,
} from '../types/collaboration';

type MessageHandler = (message: ServerMessage) => void;

interface WebSocketServiceOptions {
  url: string;
  token: string;
  onMessage?: MessageHandler;
  onConnect?: (sessionId: string, userId: string) => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private options: WebSocketServiceOptions | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private isConnecting = false;
  private sessionId: string | null = null;
  private userId: string | null = null;

  /**
   * Connect to the WebSocket server
   */
  connect(options: WebSocketServiceOptions): void {
    if (this.socket?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.options = options;
    this.isConnecting = true;

    // Build WebSocket URL with token
    const wsUrl = new URL(options.url);
    wsUrl.searchParams.set('token', options.token);

    try {
      this.socket = new WebSocket(wsUrl.toString());

      this.socket.onopen = () => {
        console.log('[WS] Connected');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.startPingInterval();
      };

      this.socket.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (e) {
          console.error('[WS] Failed to parse message:', e);
        }
      };

      this.socket.onclose = () => {
        console.log('[WS] Disconnected');
        this.isConnecting = false;
        this.stopPingInterval();
        this.options?.onDisconnect?.();
        this.attemptReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('[WS] Error:', error);
        this.isConnecting = false;
        this.options?.onError?.(error);
      };

      if (options.onMessage) {
        this.messageHandlers.add(options.onMessage);
      }
    } catch (e) {
      console.error('[WS] Failed to connect:', e);
      this.isConnecting = false;
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.stopPingInterval();
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.sessionId = null;
    this.userId = null;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Add a message handler
   */
  addMessageHandler(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  /**
   * Remove a message handler
   */
  removeMessageHandler(handler: MessageHandler): void {
    this.messageHandlers.delete(handler);
  }

  /**
   * Send a message to the server
   */
  send(message: ClientMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('[WS] Cannot send message, not connected');
    }
  }

  // ============================================
  // Presence Methods
  // ============================================

  updateStatus(status: UserStatus): void {
    this.send({ type: 'UpdateStatus', payload: { status } });
  }

  // ============================================
  // File Collaboration Methods
  // ============================================

  openFile(filePath: string): void {
    this.send({ type: 'OpenFile', payload: { file_path: filePath } });
  }

  closeFile(filePath: string): void {
    this.send({ type: 'CloseFile', payload: { file_path: filePath } });
  }

  moveCursor(filePath: string, position: CursorPosition): void {
    this.send({ type: 'MoveCursor', payload: { file_path: filePath, position } });
  }

  updateSelection(filePath: string, selection: Selection | null): void {
    this.send({ type: 'UpdateSelection', payload: { file_path: filePath, selection } });
  }

  applyChanges(filePath: string, changes: TextChange[]): void {
    this.send({ type: 'ApplyChanges', payload: { file_path: filePath, changes } });
  }

  // ============================================
  // Chat Methods
  // ============================================

  sendMessage(
    conversationId: string,
    content: string,
    contentType?: string,
    replyToId?: string
  ): void {
    this.send({
      type: 'SendMessage',
      payload: {
        conversation_id: conversationId,
        content,
        content_type: contentType,
        reply_to_id: replyToId,
      },
    });
  }

  editMessage(messageId: string, content: string): void {
    this.send({ type: 'EditMessage', payload: { message_id: messageId, content } });
  }

  deleteMessage(messageId: string): void {
    this.send({ type: 'DeleteMessage', payload: { message_id: messageId } });
  }

  addReaction(messageId: string, emoji: string): void {
    this.send({ type: 'AddReaction', payload: { message_id: messageId, emoji } });
  }

  removeReaction(messageId: string, emoji: string): void {
    this.send({ type: 'RemoveReaction', payload: { message_id: messageId, emoji } });
  }

  pinMessage(messageId: string): void {
    this.send({ type: 'PinMessage', payload: { message_id: messageId } });
  }

  unpinMessage(messageId: string): void {
    this.send({ type: 'UnpinMessage', payload: { message_id: messageId } });
  }

  startTyping(conversationId: string): void {
    this.send({ type: 'StartTyping', payload: { conversation_id: conversationId } });
  }

  stopTyping(conversationId: string): void {
    this.send({ type: 'StopTyping', payload: { conversation_id: conversationId } });
  }

  markRead(conversationId: string, messageId: string): void {
    this.send({ type: 'MarkRead', payload: { conversation_id: conversationId, message_id: messageId } });
  }

  joinConversation(conversationId: string): void {
    this.send({ type: 'JoinConversation', payload: { conversation_id: conversationId } });
  }

  leaveConversation(conversationId: string): void {
    this.send({ type: 'LeaveConversation', payload: { conversation_id: conversationId } });
  }

  // ============================================
  // Internal Methods
  // ============================================

  private handleMessage(message: ServerMessage): void {
    // Handle connection message
    if (message.type === 'Connected') {
      this.sessionId = message.payload.session_id;
      this.userId = message.payload.user_id;
      this.options?.onConnect?.(message.payload.session_id, message.payload.user_id);
    }

    // Broadcast to all handlers
    this.messageHandlers.forEach((handler) => {
      try {
        handler(message);
      } catch (e) {
        console.error('[WS] Handler error:', e);
      }
    });
  }

  private attemptReconnect(): void {
    if (!this.options) return;

    const maxAttempts = this.options.maxReconnectAttempts ?? 10;
    const interval = this.options.reconnectInterval ?? 3000;

    if (this.reconnectAttempts >= maxAttempts) {
      console.log('[WS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`[WS] Reconnecting in ${interval}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      if (this.options) {
        this.connect(this.options);
      }
    }, interval);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.send({ type: 'Ping' });
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  // ============================================
  // Getters
  // ============================================

  getSessionId(): string | null {
    return this.sessionId;
  }

  getUserId(): string | null {
    return this.userId;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
export default websocketService;
