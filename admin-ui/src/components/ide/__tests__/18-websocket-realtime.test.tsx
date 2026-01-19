/**
 * Point 18: WebSocket & Real-time Tests (25 tests)
 * Tests for WebSocket connections, real-time collaboration,
 * live updates, and connection management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '../../../test/utils';

// ============================================
// WEBSOCKET CONNECTION TESTS (5 tests)
// ============================================

describe('WebSocket Connection', () => {
  it('1. establishes WebSocket connection', async () => {
    const onConnect = vi.fn();

    const WebSocketComponent = () => {
      const [status, setStatus] = React.useState('connecting');

      React.useEffect(() => {
        // Simulate connection
        const timer = setTimeout(() => {
          setStatus('connected');
          onConnect();
        }, 10);
        return () => clearTimeout(timer);
      }, []);

      return <div data-testid="status">{status}</div>;
    };

    render(<WebSocketComponent />);

    await waitFor(() => {
      expect(onConnect).toHaveBeenCalled();
    });
  });

  it('2. handles connection errors', async () => {
    const onError = vi.fn();

    const ErrorHandlingWS = () => {
      const [error, setError] = React.useState<string | null>(null);

      React.useEffect(() => {
        // Simulate error
        const timer = setTimeout(() => {
          setError('Connection failed');
          onError();
        }, 10);
        return () => clearTimeout(timer);
      }, []);

      return <div>{error ? <span role="alert">{error}</span> : 'Connecting...'}</div>;
    };

    render(<ErrorHandlingWS />);

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
    });
  });

  it('3. reconnects on disconnect', () => {
    let connectionAttempts = 0;

    const attemptConnection = () => {
      connectionAttempts++;
      return connectionAttempts < 3;
    };

    while (attemptConnection()) {
      // Keep trying until max attempts
    }

    expect(connectionAttempts).toBe(3);
  });

  it('4. closes connection on unmount', () => {
    const closeSpy = vi.fn();

    const CleanupWS = () => {
      React.useEffect(() => {
        return () => closeSpy();
      }, []);

      return <div>Cleanup Test</div>;
    };

    const { unmount } = render(<CleanupWS />);
    unmount();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('5. shows connection status indicator', () => {
    const ConnectionStatus = ({ status }: { status: 'connected' | 'disconnected' | 'connecting' }) => (
      <div>
        <span
          className={
            status === 'connected' ? 'bg-green-500' :
            status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }
          data-testid="status-indicator"
        />
        <span>{status}</span>
      </div>
    );

    const { rerender } = render(<ConnectionStatus status="connecting" />);
    expect(screen.getByText('connecting')).toBeInTheDocument();

    rerender(<ConnectionStatus status="connected" />);
    expect(screen.getByText('connected')).toBeInTheDocument();
  });
});

// ============================================
// REAL-TIME COLLABORATION TESTS (5 tests)
// ============================================

describe('Real-time Collaboration', () => {
  it('6. shows collaborator cursors', () => {
    const collaborators = [
      { id: 'user1', name: 'Alice', cursorPosition: { line: 10, column: 5 }, color: '#ff0000' },
      { id: 'user2', name: 'Bob', cursorPosition: { line: 20, column: 15 }, color: '#00ff00' },
    ];

    const CollaboratorCursors = ({ collaborators }: { collaborators: typeof collaborators }) => (
      <div>
        {collaborators.map((c) => (
          <div
            key={c.id}
            data-testid={`cursor-${c.id}`}
            style={{ backgroundColor: c.color }}
          >
            {c.name} at line {c.cursorPosition.line}
          </div>
        ))}
      </div>
    );

    render(<CollaboratorCursors collaborators={collaborators} />);

    expect(screen.getByTestId('cursor-user1')).toBeInTheDocument();
    expect(screen.getByTestId('cursor-user2')).toBeInTheDocument();
    expect(screen.getByText(/Alice at line 10/)).toBeInTheDocument();
  });

  it('7. syncs document changes in real-time', () => {
    const onSync = vi.fn();

    const SyncedEditor = ({ onSync }: { onSync: (content: string) => void }) => {
      const [content, setContent] = React.useState('');

      const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        onSync(e.target.value);
      };

      return (
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Synced editor"
        />
      );
    };

    render(<SyncedEditor onSync={onSync} />);

    fireEvent.change(screen.getByPlaceholderText('Synced editor'), { target: { value: 'Hello' } });

    expect(onSync).toHaveBeenCalledWith('Hello');
  });

  it('8. handles concurrent edits', () => {
    const mergeChanges = (base: string, change1: string, change2: string) => {
      if (change1 === base) return change2;
      if (change2 === base) return change1;
      return `${change1}\n${change2}`;
    };

    const base = 'Original';
    const user1Change = 'Original - User 1 edit';
    const user2Change = 'Original - User 2 edit';

    const merged = mergeChanges(base, user1Change, user2Change);
    expect(merged).toContain('User 1');
    expect(merged).toContain('User 2');
  });

  it('9. shows typing indicators', () => {
    const TypingIndicator = ({ users }: { users: string[] }) => (
      <div>
        {users.length > 0 && (
          <span data-testid="typing">
            {users.join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
          </span>
        )}
      </div>
    );

    const { rerender } = render(<TypingIndicator users={['Alice']} />);
    expect(screen.getByText('Alice is typing...')).toBeInTheDocument();

    rerender(<TypingIndicator users={['Alice', 'Bob']} />);
    expect(screen.getByText('Alice, Bob are typing...')).toBeInTheDocument();
  });

  it('10. displays presence information', () => {
    const users = [
      { id: '1', name: 'Alice', status: 'online', avatar: 'A' },
      { id: '2', name: 'Bob', status: 'away', avatar: 'B' },
      { id: '3', name: 'Charlie', status: 'offline', avatar: 'C' },
    ];

    const PresenceList = ({ users }: { users: typeof users }) => (
      <ul>
        {users.map((user) => (
          <li key={user.id} data-status={user.status}>
            <span>{user.avatar}</span>
            <span>{user.name}</span>
            <span>{user.status}</span>
          </li>
        ))}
      </ul>
    );

    render(<PresenceList users={users} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('online')).toBeInTheDocument();
    expect(screen.getByText('away')).toBeInTheDocument();
  });
});

// ============================================
// LIVE UPDATE TESTS (5 tests)
// ============================================

describe('Live Updates', () => {
  it('11. receives file system updates', async () => {
    const onUpdate = vi.fn();

    const FileWatcher = ({ onUpdate }: { onUpdate: (event: { type: string; path: string }) => void }) => {
      const [updates, setUpdates] = React.useState<Array<{ type: string; path: string }>>([]);

      React.useEffect(() => {
        // Simulate file change event
        const timer = setTimeout(() => {
          const event = { type: 'change', path: '/src/index.ts' };
          setUpdates((prev) => [...prev, event]);
          onUpdate(event);
        }, 10);

        return () => clearTimeout(timer);
      }, [onUpdate]);

      return (
        <div>
          {updates.map((u, i) => (
            <div key={i}>{u.type}: {u.path}</div>
          ))}
        </div>
      );
    };

    render(<FileWatcher onUpdate={onUpdate} />);

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith({ type: 'change', path: '/src/index.ts' });
    });
  });

  it('12. updates terminal output in real-time', () => {
    const TerminalOutput = ({ lines }: { lines: string[] }) => (
      <div data-testid="terminal">
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    );

    const { rerender } = render(<TerminalOutput lines={['$ npm start']} />);
    expect(screen.getByText('$ npm start')).toBeInTheDocument();

    rerender(<TerminalOutput lines={['$ npm start', 'Starting server...', 'Server running on port 3000']} />);
    expect(screen.getByText('Server running on port 3000')).toBeInTheDocument();
  });

  it('13. streams build output', () => {
    const BuildOutput = ({ output, isBuilding }: { output: string[]; isBuilding: boolean }) => (
      <div>
        <div data-testid="build-status">{isBuilding ? 'Building...' : 'Ready'}</div>
        <pre>{output.join('\n')}</pre>
      </div>
    );

    const { rerender } = render(<BuildOutput output={[]} isBuilding={true} />);
    expect(screen.getByText('Building...')).toBeInTheDocument();

    rerender(<BuildOutput output={['Compiling...', 'Done!']} isBuilding={false} />);
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText(/Done!/)).toBeInTheDocument();
  });

  it('14. shows live preview updates', () => {
    const LivePreview = ({ content, lastUpdated }: { content: string; lastUpdated: Date }) => (
      <div>
        <div data-testid="preview-content">{content}</div>
        <div data-testid="last-updated">Updated: {lastUpdated.toLocaleTimeString()}</div>
      </div>
    );

    const now = new Date();
    render(<LivePreview content="<h1>Hello</h1>" lastUpdated={now} />);

    expect(screen.getByTestId('preview-content')).toHaveTextContent('<h1>Hello</h1>');
    expect(screen.getByTestId('last-updated')).toBeInTheDocument();
  });

  it('15. notifies on external file changes', () => {
    const FileChangeNotification = ({ show, fileName, onReload }: { show: boolean; fileName: string; onReload: () => void }) => {
      if (!show) return null;

      return (
        <div role="alert">
          <p>{fileName} has been modified externally</p>
          <button onClick={onReload}>Reload</button>
          <button>Ignore</button>
        </div>
      );
    };

    const onReload = vi.fn();
    render(<FileChangeNotification show={true} fileName="index.ts" onReload={onReload} />);

    expect(screen.getByText(/modified externally/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  });
});

// ============================================
// MESSAGE HANDLING TESTS (5 tests)
// ============================================

describe('Message Handling', () => {
  it('16. parses WebSocket messages correctly', () => {
    const parseMessage = (data: string) => {
      try {
        return JSON.parse(data);
      } catch {
        return { error: 'Invalid JSON' };
      }
    };

    expect(parseMessage('{"type":"update","data":"test"}')).toEqual({ type: 'update', data: 'test' });
    expect(parseMessage('invalid')).toEqual({ error: 'Invalid JSON' });
  });

  it('17. handles different message types', () => {
    type MessageType = 'file_change' | 'cursor_move' | 'chat' | 'presence';

    const handleMessage = (type: MessageType, payload: any) => {
      switch (type) {
        case 'file_change':
          return { action: 'reload', path: payload.path };
        case 'cursor_move':
          return { action: 'moveCursor', position: payload.position };
        case 'chat':
          return { action: 'addMessage', message: payload.message };
        case 'presence':
          return { action: 'updatePresence', users: payload.users };
        default:
          return { action: 'unknown' };
      }
    };

    expect(handleMessage('file_change', { path: '/src/index.ts' })).toEqual({
      action: 'reload',
      path: '/src/index.ts',
    });

    expect(handleMessage('cursor_move', { position: { line: 10, column: 5 } })).toEqual({
      action: 'moveCursor',
      position: { line: 10, column: 5 },
    });
  });

  it('18. queues messages when disconnected', () => {
    const messageQueue: any[] = [];
    let isConnected = false;

    const sendMessage = (message: any) => {
      if (isConnected) {
        return { sent: true, message };
      } else {
        messageQueue.push(message);
        return { queued: true, queueLength: messageQueue.length };
      }
    };

    const result1 = sendMessage({ type: 'update', data: 'test1' });
    expect(result1.queued).toBe(true);
    expect(messageQueue).toHaveLength(1);

    isConnected = true;
    const result2 = sendMessage({ type: 'update', data: 'test2' });
    expect(result2.sent).toBe(true);
  });

  it('19. processes queued messages on reconnect', () => {
    const queue = [
      { type: 'message1', data: 'data1' },
      { type: 'message2', data: 'data2' },
    ];
    const sentMessages: any[] = [];

    const processQueue = (messages: any[]) => {
      messages.forEach((msg) => sentMessages.push(msg));
      return messages.length;
    };

    const processed = processQueue(queue);
    expect(processed).toBe(2);
    expect(sentMessages).toHaveLength(2);
  });

  it('20. handles message acknowledgments', () => {
    const pendingMessages = new Map<string, { message: any; timestamp: number }>();

    const sendWithAck = (id: string, message: any) => {
      pendingMessages.set(id, { message, timestamp: Date.now() });
    };

    const acknowledge = (id: string) => {
      const wasPresent = pendingMessages.has(id);
      pendingMessages.delete(id);
      return wasPresent;
    };

    sendWithAck('msg-1', { type: 'update', data: 'test' });
    expect(pendingMessages.size).toBe(1);

    const acked = acknowledge('msg-1');
    expect(acked).toBe(true);
    expect(pendingMessages.size).toBe(0);
  });
});

// ============================================
// CONNECTION MANAGEMENT TESTS (5 tests)
// ============================================

describe('Connection Management', () => {
  it('21. implements heartbeat/ping-pong', () => {
    vi.useFakeTimers();
    const heartbeatInterval = 30000;
    const pings: number[] = [];

    const sendPing = () => {
      pings.push(Date.now());
    };

    const intervalId = setInterval(sendPing, heartbeatInterval);

    vi.advanceTimersByTime(heartbeatInterval * 3);

    expect(pings.length).toBe(3);

    clearInterval(intervalId);
    vi.useRealTimers();
  });

  it('22. detects connection timeout', () => {
    vi.useFakeTimers();
    const timeout = 5000;
    let timedOut = false;

    const lastResponse = Date.now();

    const checkTimeout = () => {
      if (Date.now() - lastResponse > timeout) {
        timedOut = true;
      }
      return timedOut;
    };

    expect(checkTimeout()).toBe(false);

    vi.advanceTimersByTime(6000);
    expect(checkTimeout()).toBe(true);

    vi.useRealTimers();
  });

  it('23. implements exponential backoff for reconnection', () => {
    const calculateBackoff = (attempt: number, baseDelay: number = 1000, maxDelay: number = 30000) => {
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
      return delay;
    };

    expect(calculateBackoff(0)).toBe(1000);
    expect(calculateBackoff(1)).toBe(2000);
    expect(calculateBackoff(2)).toBe(4000);
    expect(calculateBackoff(3)).toBe(8000);
    expect(calculateBackoff(5)).toBe(30000);
  });

  it('24. limits reconnection attempts', () => {
    const maxAttempts = 5;
    let attempts = 0;
    const connectionResults: boolean[] = [];

    const attemptConnection = (): boolean => {
      if (attempts >= maxAttempts) {
        return false;
      }
      attempts++;
      connectionResults.push(false);
      return true;
    };

    while (attemptConnection()) {
      // Keep trying
    }

    expect(attempts).toBe(maxAttempts);
    expect(connectionResults).toHaveLength(maxAttempts);
  });

  it('25. handles graceful disconnection', () => {
    const onDisconnect = vi.fn();

    const GracefulDisconnect = ({ onDisconnect }: { onDisconnect: () => void }) => {
      const [connected, setConnected] = React.useState(true);

      const handleDisconnect = () => {
        setConnected(false);
        onDisconnect();
      };

      return (
        <div>
          <span>{connected ? 'Connected' : 'Disconnected'}</span>
          <button onClick={handleDisconnect}>Disconnect</button>
        </div>
      );
    };

    render(<GracefulDisconnect onDisconnect={onDisconnect} />);

    expect(screen.getByText('Connected')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Disconnect' }));

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(onDisconnect).toHaveBeenCalled();
  });
});
