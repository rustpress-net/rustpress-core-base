/**
 * WindowSyncService - Cross-window communication for detachable tabs
 * Uses BroadcastChannel API to sync state between main IDE and detached windows
 */

import type { OpenFile } from '../components/ide/IDE';

// ============================================
// MESSAGE TYPES
// ============================================

export type WindowSyncMessageType =
  | 'file-opened'
  | 'file-closed'
  | 'file-content-changed'
  | 'file-saved'
  | 'cursor-changed'
  | 'tab-detached'
  | 'tab-reattached'
  | 'request-file'
  | 'file-data'
  | 'window-closed'
  | 'sync-state'
  | 'ping'
  | 'pong';

export interface WindowSyncMessage {
  type: WindowSyncMessageType;
  windowId: string;
  timestamp: number;
  payload: unknown;
}

export interface FileContentPayload {
  path: string;
  content: string;
  originalContent?: string;
  language?: string;
}

export interface CursorPayload {
  path: string;
  line: number;
  column: number;
}

export interface DetachPayload {
  file: OpenFile;
  windowId: string;
}

export interface SyncStatePayload {
  openFiles: OpenFile[];
  activeFilePath: string | null;
}

// ============================================
// WINDOW SYNC SERVICE
// ============================================

class WindowSyncService {
  private channel: BroadcastChannel | null = null;
  private windowId: string;
  private detachedWindows: Map<string, Window> = new Map();
  private listeners: Map<WindowSyncMessageType, ((payload: unknown, windowId: string) => void)[]> = new Map();
  private isMainWindow: boolean = true;

  constructor() {
    this.windowId = this.generateWindowId();
    this.initChannel();

    // Check if this is a detached window
    const urlParams = new URLSearchParams(window.location.search);
    this.isMainWindow = !urlParams.has('detached');
  }

  private generateWindowId(): string {
    return `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initChannel(): void {
    if (typeof BroadcastChannel === 'undefined') {
      console.warn('BroadcastChannel not supported - detachable tabs will be disabled');
      return;
    }

    this.channel = new BroadcastChannel('rustpress-ide-sync');
    this.channel.onmessage = (event: MessageEvent<WindowSyncMessage>) => {
      this.handleMessage(event.data);
    };

    // Listen for window close
    window.addEventListener('beforeunload', () => {
      this.sendMessage('window-closed', { windowId: this.windowId });
    });
  }

  private handleMessage(message: WindowSyncMessage): void {
    // Don't process messages from self
    if (message.windowId === this.windowId) return;

    const listeners = this.listeners.get(message.type) || [];
    listeners.forEach(listener => listener(message.payload, message.windowId));
  }

  // ============================================
  // PUBLIC API
  // ============================================

  getWindowId(): string {
    return this.windowId;
  }

  isMain(): boolean {
    return this.isMainWindow;
  }

  sendMessage(type: WindowSyncMessageType, payload: unknown): void {
    if (!this.channel) return;

    const message: WindowSyncMessage = {
      type,
      windowId: this.windowId,
      timestamp: Date.now(),
      payload
    };

    this.channel.postMessage(message);
  }

  on(type: WindowSyncMessageType, callback: (payload: unknown, windowId: string) => void): () => void {
    const existing = this.listeners.get(type) || [];
    existing.push(callback);
    this.listeners.set(type, existing);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }

  off(type: WindowSyncMessageType, callback?: (payload: unknown, windowId: string) => void): void {
    if (callback) {
      const listeners = this.listeners.get(type) || [];
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    } else {
      this.listeners.delete(type);
    }
  }

  // ============================================
  // DETACHED WINDOW MANAGEMENT
  // ============================================

  detachTab(file: OpenFile): string | null {
    if (!this.channel) return null;

    const detachedWindowId = this.generateWindowId();
    const width = 900;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    // Build URL with file data
    const params = new URLSearchParams({
      detached: 'true',
      windowId: detachedWindowId,
      filePath: file.path,
      fileName: file.name
    });

    const detachedUrl = `${window.location.origin}/ide/detached?${params.toString()}`;

    const detachedWindow = window.open(
      detachedUrl,
      `ide-detached-${detachedWindowId}`,
      `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );

    if (detachedWindow) {
      this.detachedWindows.set(detachedWindowId, detachedWindow);

      // Send file data to the new window after a short delay
      setTimeout(() => {
        this.sendMessage('tab-detached', {
          file,
          windowId: detachedWindowId
        } as DetachPayload);
      }, 500);

      return detachedWindowId;
    }

    return null;
  }

  reattachTab(windowId: string, file: OpenFile): void {
    this.sendMessage('tab-reattached', {
      file,
      windowId
    } as DetachPayload);

    // Close the detached window
    const detachedWindow = this.detachedWindows.get(windowId);
    if (detachedWindow && !detachedWindow.closed) {
      detachedWindow.close();
    }
    this.detachedWindows.delete(windowId);
  }

  closeDetachedWindow(windowId: string): void {
    const detachedWindow = this.detachedWindows.get(windowId);
    if (detachedWindow && !detachedWindow.closed) {
      detachedWindow.close();
    }
    this.detachedWindows.delete(windowId);
  }

  getDetachedWindows(): Map<string, Window> {
    // Clean up closed windows
    this.detachedWindows.forEach((win, id) => {
      if (win.closed) {
        this.detachedWindows.delete(id);
      }
    });
    return this.detachedWindows;
  }

  // ============================================
  // FILE SYNC HELPERS
  // ============================================

  notifyFileOpened(file: OpenFile): void {
    this.sendMessage('file-opened', file);
  }

  notifyFileClosed(path: string): void {
    this.sendMessage('file-closed', { path });
  }

  notifyContentChanged(path: string, content: string): void {
    this.sendMessage('file-content-changed', {
      path,
      content
    } as FileContentPayload);
  }

  notifyFileSaved(path: string, content: string): void {
    this.sendMessage('file-saved', {
      path,
      content
    } as FileContentPayload);
  }

  notifyCursorChanged(path: string, line: number, column: number): void {
    this.sendMessage('cursor-changed', {
      path,
      line,
      column
    } as CursorPayload);
  }

  requestFileData(path: string): void {
    this.sendMessage('request-file', { path });
  }

  sendFileData(file: OpenFile, targetWindowId: string): void {
    this.sendMessage('file-data', { file, targetWindowId });
  }

  syncState(openFiles: OpenFile[], activeFilePath: string | null): void {
    this.sendMessage('sync-state', {
      openFiles,
      activeFilePath
    } as SyncStatePayload);
  }

  // ============================================
  // CLEANUP
  // ============================================

  destroy(): void {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
    this.detachedWindows.forEach((win) => {
      if (!win.closed) {
        win.close();
      }
    });
    this.detachedWindows.clear();
  }
}

// Export singleton instance
export const windowSyncService = new WindowSyncService();
export default windowSyncService;
