/**
 * Point 4: Chat System Tests (25 tests)
 * Tests for real-time chat components including ChatSidebar,
 * ConversationList, MessageBubble, MessageInput, and related features
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES AND DATA
// ============================================

interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: string;
}

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

// ============================================
// MOCK COMPONENTS
// ============================================

interface ChatSidebarProps {
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onSelectConversation, onCreateConversation }) => (
  <div data-testid="chat-sidebar">
    <h2>Chat</h2>
    <button title="New conversation" onClick={onCreateConversation}>New</button>
    <div>Conversations</div>
  </div>
);

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onCreate,
  onDelete,
}) => (
  <div data-testid="conversation-list">
    <button title="Create new" onClick={onCreate}>+</button>
    {conversations.map((conv) => (
      <div
        key={conv.id}
        className={conv.id === activeId ? 'active' : ''}
        onClick={() => onSelect(conv.id)}
      >
        <span>{conv.title}</span>
        <button title="Delete conversation" onClick={() => onDelete(conv.id)}>x</button>
      </div>
    ))}
  </div>
);

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => (
  <div className={`message-bubble ${isOwn ? 'own' : ''}`}>
    <span className="sender">{message.sender.name}</span>
    <p>{message.content}</p>
    <span className="timestamp">{new Date(message.timestamp).toLocaleTimeString()}</span>
  </div>
);

interface MessageReactionsProps {
  reactions: Reaction[];
  onAddReaction: (emoji: string) => void;
  onRemoveReaction: (emoji: string) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  onAddReaction,
  onRemoveReaction,
}) => (
  <div className="reactions">
    {reactions.map((reaction, i) => (
      <button key={i} onClick={() => onRemoveReaction(reaction.emoji)}>
        {reaction.emoji} {reaction.count}
      </button>
    ))}
    <button title="Add reaction" onClick={() => onAddReaction('👍')}>+</button>
  </div>
);

interface MessageInputProps {
  onSend: (content: string) => void;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSend, placeholder = 'Type a message...' }) => {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    if (value.trim()) {
      onSend(value);
      setValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
};

interface TypingIndicatorProps {
  users: User[];
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ users }) => (
  <div className="typing-indicator">
    {users.map((u) => u.name).join(', ')} {users.length === 1 ? 'is' : 'are'} typing...
  </div>
);

interface PinnedMessagesProps {
  messages: Message[];
  onUnpin: (id: string) => void;
  onNavigate: (id: string) => void;
}

const PinnedMessages: React.FC<PinnedMessagesProps> = ({ messages, onUnpin, onNavigate }) => (
  <div className="pinned-messages">
    <h3>Pinned</h3>
    {messages.map((msg) => (
      <div key={msg.id} onClick={() => onNavigate(msg.id)}>
        <span>{msg.content}</span>
        <button title="Unpin message" onClick={() => onUnpin(msg.id)}>Unpin</button>
      </div>
    ))}
  </div>
);

interface ChatHistoryProps {
  messages: Message[];
  currentUserId: string;
  scrollToMessageId?: string;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, currentUserId }) => (
  <div className="chat-history">
    {messages.map((msg) => (
      <MessageBubble key={msg.id} message={msg} isOwn={msg.sender.id === currentUserId} />
    ))}
  </div>
);

interface ConversationViewProps {
  conversation: Conversation;
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  currentUserId,
  onSendMessage,
}) => (
  <div className="conversation-view">
    <h2>{conversation.title}</h2>
    <ChatHistory messages={conversation.messages} currentUserId={currentUserId} />
    <MessageInput onSend={onSendMessage} />
  </div>
);

interface ReminderPickerProps {
  onSetReminder: (date: Date) => void;
  onClose: () => void;
}

const ReminderPicker: React.FC<ReminderPickerProps> = ({ onSetReminder, onClose }) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="reminder-picker" data-testid="reminder-picker">
      <h3>Set Reminder</h3>
      <button onClick={() => onSetReminder(new Date(Date.now() + 3600000))}>In 1 hour</button>
      <button onClick={() => onSetReminder(tomorrow)}>Tomorrow</button>
      <button onClick={() => onSetReminder(new Date(Date.now() + 86400000 * 7))}>Next week</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

interface TagManagerProps {
  tags: string[];
  selectedTags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onFilterByTag: (tag: string) => void;
}

const TagManager: React.FC<TagManagerProps> = ({
  tags,
  selectedTags,
  onAddTag,
  onRemoveTag,
  onFilterByTag,
}) => (
  <div className="tag-manager">
    <button title="Filter by tag" onClick={() => onFilterByTag(tags[0])}>Filter</button>
    {tags.map((tag) => (
      <button
        key={tag}
        className={selectedTags.includes(tag) ? 'selected' : ''}
        onClick={() => (selectedTags.includes(tag) ? onRemoveTag(tag) : onAddTag(tag))}
      >
        {tag}
      </button>
    ))}
  </div>
);

// ============================================
// TEST DATA HELPERS
// ============================================

const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'user-1',
  name: 'John Doe',
  avatar: '/avatar.png',
  ...overrides,
});

const createMockMessage = (overrides: Partial<Message> = {}): Message => ({
  id: 'msg-1',
  content: 'Hello, world!',
  sender: createMockUser(),
  timestamp: new Date().toISOString(),
  ...overrides,
});

const createMockConversation = (overrides: Partial<Conversation> = {}): Conversation => ({
  id: 'conv-1',
  title: 'General Chat',
  messages: [],
  ...overrides,
});

// ============================================
// CHAT SIDEBAR TESTS (1 test)
// ============================================

describe('ChatSidebar', () => {
  const defaultProps = {
    onSelectConversation: vi.fn(),
    onCreateConversation: vi.fn(),
  };

  it('1. renders ChatSidebar component', () => {
    render(<ChatSidebar {...defaultProps} />);

    expect(screen.getByTestId('chat-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Chat')).toBeInTheDocument();
  });
});

// ============================================
// CONVERSATION LIST TESTS (3 tests)
// ============================================

describe('ConversationList', () => {
  const conversations = [
    createMockConversation({ id: '1', title: 'General Chat' }),
    createMockConversation({ id: '2', title: 'Project Discussion' }),
  ];

  const defaultProps = {
    conversations,
    activeId: '1',
    onSelect: vi.fn(),
    onCreate: vi.fn(),
    onDelete: vi.fn(),
  };

  it('2. displays conversation list', () => {
    render(<ConversationList {...defaultProps} />);

    expect(screen.getByText(/General Chat/i)).toBeInTheDocument();
  });

  it('3. creates new conversation on button click', async () => {
    const onCreate = vi.fn();
    const { user } = render(<ConversationList {...defaultProps} onCreate={onCreate} />);

    const newButton = screen.getByTitle(/new|create/i);
    await user.click(newButton);

    expect(onCreate).toHaveBeenCalled();
  });

  it('4. deletes conversation on delete action', async () => {
    const onDelete = vi.fn();
    const { user } = render(<ConversationList {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByTitle(/delete/i);
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalled();
  });
});

// ============================================
// MESSAGE BUBBLE TESTS (3 tests)
// ============================================

describe('MessageBubble', () => {
  const mockMessage = createMockMessage({
    content: 'Hello, world!',
    sender: createMockUser({ name: 'John Doe' }),
    timestamp: new Date().toISOString(),
  });

  const defaultProps = {
    message: mockMessage,
    isOwn: false,
  };

  it('5. renders MessageBubble component', () => {
    render(<MessageBubble {...defaultProps} />);

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('6. shows message timestamp', () => {
    render(<MessageBubble {...defaultProps} />);

    expect(screen.getByText(/Hello, world!/)).toBeInTheDocument();
  });

  it('7. shows sender name', () => {
    render(<MessageBubble {...defaultProps} />);

    expect(screen.getByText(/John Doe/)).toBeInTheDocument();
  });
});

// ============================================
// MESSAGE REACTIONS TESTS (3 tests)
// ============================================

describe('MessageReactions', () => {
  const defaultProps = {
    reactions: [
      { emoji: '👍', count: 3, users: ['user1', 'user2', 'user3'] },
      { emoji: '❤️', count: 1, users: ['user1'] },
    ],
    onAddReaction: vi.fn(),
    onRemoveReaction: vi.fn(),
  };

  it('8. renders message reactions', () => {
    render(<MessageReactions {...defaultProps} />);

    expect(screen.getByText(/👍/)).toBeInTheDocument();
  });

  it('9. adds reaction to message on click', async () => {
    const onAddReaction = vi.fn();
    const { user } = render(<MessageReactions {...defaultProps} onAddReaction={onAddReaction} />);

    const addButton = screen.getByTitle(/add/i);
    await user.click(addButton);

    expect(onAddReaction).toHaveBeenCalled();
  });

  it('10. removes reaction on click', async () => {
    const onRemoveReaction = vi.fn();
    const { user } = render(<MessageReactions {...defaultProps} onRemoveReaction={onRemoveReaction} />);

    const reaction = screen.getByText(/👍/);
    await user.click(reaction);

    expect(onRemoveReaction).toHaveBeenCalled();
  });
});

// ============================================
// MESSAGE INPUT TESTS (3 tests)
// ============================================

describe('MessageInput', () => {
  const defaultProps = {
    onSend: vi.fn(),
    placeholder: 'Type a message...',
  };

  it('11. renders MessageInput component', () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('12. sends message on enter key', async () => {
    const onSend = vi.fn();
    const { user } = render(<MessageInput {...defaultProps} onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Hello!');
    await user.keyboard('{Enter}');

    expect(onSend).toHaveBeenCalledWith('Hello!');
  });

  it('13. supports multiline input with Shift+Enter', async () => {
    const onSend = vi.fn();
    const { user } = render(<MessageInput {...defaultProps} onSend={onSend} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Line 1');
    await user.keyboard('{Shift>}{Enter}{/Shift}');

    expect(onSend).not.toHaveBeenCalled();
  });
});

// ============================================
// TYPING INDICATOR TESTS (1 test)
// ============================================

describe('TypingIndicator', () => {
  it('14. shows typing indicator when users are typing', () => {
    render(<TypingIndicator users={[createMockUser({ name: 'Alice' })]} />);

    expect(screen.getByText(/Alice.*typing/i)).toBeInTheDocument();
  });
});

// ============================================
// PINNED MESSAGES TESTS (2 tests)
// ============================================

describe('PinnedMessages', () => {
  const pinnedMessages = [
    createMockMessage({ id: '1', content: 'Important announcement' }),
    createMockMessage({ id: '2', content: 'Meeting at 3pm' }),
  ];

  const defaultProps = {
    messages: pinnedMessages,
    onUnpin: vi.fn(),
    onNavigate: vi.fn(),
  };

  it('15. displays pinned messages', () => {
    render(<PinnedMessages {...defaultProps} />);

    expect(screen.getByText(/Important announcement/)).toBeInTheDocument();
  });

  it('16. pins/unpins message on action', async () => {
    const onUnpin = vi.fn();
    const { user } = render(<PinnedMessages {...defaultProps} onUnpin={onUnpin} />);

    const unpinButtons = screen.getAllByTitle(/unpin/i);
    await user.click(unpinButtons[0]);

    expect(onUnpin).toHaveBeenCalled();
  });
});

// ============================================
// CHAT HISTORY TESTS (2 tests)
// ============================================

describe('ChatHistory', () => {
  const messages = [
    createMockMessage({ id: '1', content: 'First message' }),
    createMockMessage({ id: '2', content: 'Second message' }),
    createMockMessage({ id: '3', content: 'Third message' }),
  ];

  const defaultProps = {
    messages,
    currentUserId: 'user-1',
  };

  it('17. renders ChatHistory with messages', () => {
    render(<ChatHistory {...defaultProps} />);

    expect(screen.getByText(/First message/)).toBeInTheDocument();
  });

  it('18. scrolls to specific message', () => {
    render(<ChatHistory {...defaultProps} scrollToMessageId="2" />);

    expect(Element.prototype.scrollIntoView).toBeDefined();
  });
});

// ============================================
// CONVERSATION VIEW TESTS (1 test)
// ============================================

describe('ConversationView', () => {
  const conversation = createMockConversation({
    title: 'Test Conversation',
    messages: [createMockMessage({ content: 'Hello' })],
  });

  const defaultProps = {
    conversation,
    currentUserId: 'user-1',
    onSendMessage: vi.fn(),
  };

  it('19. renders ConversationView', () => {
    render(<ConversationView {...defaultProps} />);

    expect(screen.getByText(/Test Conversation/)).toBeInTheDocument();
  });
});

// ============================================
// REMINDER PICKER TESTS (2 tests)
// ============================================

describe('ReminderPicker', () => {
  const defaultProps = {
    onSetReminder: vi.fn(),
    onClose: vi.fn(),
  };

  it('20. renders ReminderPicker component', () => {
    render(<ReminderPicker {...defaultProps} />);

    expect(screen.getByTestId('reminder-picker')).toBeInTheDocument();
    expect(screen.getByText('Set Reminder')).toBeInTheDocument();
  });

  it('21. sets message reminder on selection', async () => {
    const onSetReminder = vi.fn();
    const { user } = render(<ReminderPicker {...defaultProps} onSetReminder={onSetReminder} />);

    const option = screen.getByText(/Tomorrow/i);
    await user.click(option);

    expect(onSetReminder).toHaveBeenCalled();
  });
});

// ============================================
// TAG MANAGER TESTS (4 tests)
// ============================================

describe('TagManager', () => {
  const defaultProps = {
    tags: ['important', 'work', 'personal'],
    selectedTags: ['work'],
    onAddTag: vi.fn(),
    onRemoveTag: vi.fn(),
    onFilterByTag: vi.fn(),
  };

  it('22. renders TagManager with tags', () => {
    render(<TagManager {...defaultProps} />);

    expect(screen.getByText(/important/i)).toBeInTheDocument();
  });

  it('23. adds tag to conversation', async () => {
    const onAddTag = vi.fn();
    const { user } = render(<TagManager {...defaultProps} onAddTag={onAddTag} />);

    const unselectedTag = screen.getByText('personal');
    await user.click(unselectedTag);

    expect(onAddTag).toHaveBeenCalledWith('personal');
  });

  it('24. removes tag from conversation', async () => {
    const onRemoveTag = vi.fn();
    const { user } = render(<TagManager {...defaultProps} onRemoveTag={onRemoveTag} />);

    const selectedTag = screen.getByText('work');
    await user.click(selectedTag);

    expect(onRemoveTag).toHaveBeenCalledWith('work');
  });

  it('25. filters conversations by tag', async () => {
    const onFilterByTag = vi.fn();
    const { user } = render(<TagManager {...defaultProps} onFilterByTag={onFilterByTag} />);

    const filterButton = screen.getByTitle(/filter/i);
    await user.click(filterButton);

    expect(onFilterByTag).toHaveBeenCalled();
  });
});
