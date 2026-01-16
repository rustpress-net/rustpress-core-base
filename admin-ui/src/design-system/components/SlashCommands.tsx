import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// SLASH COMMANDS - COMPONENT 6 OF 10 (POST EDITOR ENHANCEMENTS)
// Quick actions via "/" trigger, command palette, and block insertion
// ============================================================================

// Types
export type CommandCategory = 'basic' | 'media' | 'embed' | 'layout' | 'advanced' | 'ai';

export interface SlashCommand {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: CommandCategory;
  keywords: string[];
  shortcut?: string;
  action: () => void | Promise<void>;
  disabled?: boolean;
}

export interface SlashCommandsConfig {
  enabled: boolean;
  trigger: string;
  showCategories: boolean;
  maxResults: number;
  recentCommands: string[];
  customCommands: SlashCommand[];
}

interface SlashCommandsContextValue {
  config: SlashCommandsConfig;
  commands: SlashCommand[];
  updateConfig: (config: Partial<SlashCommandsConfig>) => void;
  registerCommand: (command: SlashCommand) => void;
  unregisterCommand: (id: string) => void;
  executeCommand: (id: string) => Promise<void>;
  searchCommands: (query: string) => SlashCommand[];
}

// Default commands
const createDefaultCommands = (insertBlock: (type: string, data?: any) => void): SlashCommand[] => [
  // Basic
  { id: 'paragraph', name: 'Paragraph', description: 'Plain text block', icon: '¶', category: 'basic', keywords: ['text', 'p'], action: () => insertBlock('paragraph') },
  { id: 'heading1', name: 'Heading 1', description: 'Large heading', icon: 'H1', category: 'basic', keywords: ['h1', 'title'], shortcut: 'Ctrl+1', action: () => insertBlock('heading', { level: 1 }) },
  { id: 'heading2', name: 'Heading 2', description: 'Medium heading', icon: 'H2', category: 'basic', keywords: ['h2'], shortcut: 'Ctrl+2', action: () => insertBlock('heading', { level: 2 }) },
  { id: 'heading3', name: 'Heading 3', description: 'Small heading', icon: 'H3', category: 'basic', keywords: ['h3'], shortcut: 'Ctrl+3', action: () => insertBlock('heading', { level: 3 }) },
  { id: 'bulletList', name: 'Bullet List', description: 'Unordered list', icon: '•', category: 'basic', keywords: ['ul', 'unordered'], action: () => insertBlock('list', { type: 'bullet' }) },
  { id: 'numberedList', name: 'Numbered List', description: 'Ordered list', icon: '1.', category: 'basic', keywords: ['ol', 'ordered'], action: () => insertBlock('list', { type: 'numbered' }) },
  { id: 'todoList', name: 'To-do List', description: 'Checklist items', icon: '☐', category: 'basic', keywords: ['checkbox', 'task'], action: () => insertBlock('list', { type: 'todo' }) },
  { id: 'quote', name: 'Quote', description: 'Blockquote', icon: '"', category: 'basic', keywords: ['blockquote'], action: () => insertBlock('quote') },
  { id: 'divider', name: 'Divider', description: 'Horizontal line', icon: '—', category: 'basic', keywords: ['hr', 'line', 'separator'], action: () => insertBlock('divider') },
  { id: 'code', name: 'Code Block', description: 'Code with syntax highlighting', icon: '<>', category: 'basic', keywords: ['pre', 'syntax'], action: () => insertBlock('code') },

  // Media
  { id: 'image', name: 'Image', description: 'Upload or embed an image', icon: '🖼', category: 'media', keywords: ['photo', 'picture', 'img'], action: () => insertBlock('image') },
  { id: 'gallery', name: 'Gallery', description: 'Multiple images in a grid', icon: '🖼️', category: 'media', keywords: ['images', 'photos'], action: () => insertBlock('gallery') },
  { id: 'video', name: 'Video', description: 'Embed a video', icon: '🎬', category: 'media', keywords: ['movie', 'mp4'], action: () => insertBlock('video') },
  { id: 'audio', name: 'Audio', description: 'Embed audio file', icon: '🎵', category: 'media', keywords: ['music', 'sound', 'mp3'], action: () => insertBlock('audio') },
  { id: 'file', name: 'File', description: 'Attach a file', icon: '📎', category: 'media', keywords: ['attachment', 'download'], action: () => insertBlock('file') },

  // Embeds
  { id: 'youtube', name: 'YouTube', description: 'Embed YouTube video', icon: '▶️', category: 'embed', keywords: ['video', 'yt'], action: () => insertBlock('embed', { type: 'youtube' }) },
  { id: 'twitter', name: 'Twitter/X', description: 'Embed a tweet', icon: '🐦', category: 'embed', keywords: ['tweet', 'x'], action: () => insertBlock('embed', { type: 'twitter' }) },
  { id: 'codepen', name: 'CodePen', description: 'Embed CodePen', icon: '✒️', category: 'embed', keywords: ['pen', 'code'], action: () => insertBlock('embed', { type: 'codepen' }) },
  { id: 'github', name: 'GitHub Gist', description: 'Embed a Gist', icon: '🐙', category: 'embed', keywords: ['gist', 'code'], action: () => insertBlock('embed', { type: 'gist' }) },
  { id: 'figma', name: 'Figma', description: 'Embed Figma design', icon: '🎨', category: 'embed', keywords: ['design', 'prototype'], action: () => insertBlock('embed', { type: 'figma' }) },
  { id: 'loom', name: 'Loom', description: 'Embed Loom video', icon: '🎥', category: 'embed', keywords: ['screencast', 'recording'], action: () => insertBlock('embed', { type: 'loom' }) },

  // Layout
  { id: 'columns2', name: '2 Columns', description: 'Two column layout', icon: '▥', category: 'layout', keywords: ['split', 'col'], action: () => insertBlock('columns', { count: 2 }) },
  { id: 'columns3', name: '3 Columns', description: 'Three column layout', icon: '▤', category: 'layout', keywords: ['split', 'col'], action: () => insertBlock('columns', { count: 3 }) },
  { id: 'callout', name: 'Callout', description: 'Highlighted box', icon: '💡', category: 'layout', keywords: ['note', 'tip', 'warning'], action: () => insertBlock('callout') },
  { id: 'toggle', name: 'Toggle', description: 'Collapsible section', icon: '▶', category: 'layout', keywords: ['accordion', 'collapse'], action: () => insertBlock('toggle') },
  { id: 'table', name: 'Table', description: 'Data table', icon: '▦', category: 'layout', keywords: ['grid', 'data'], action: () => insertBlock('table') },

  // Advanced
  { id: 'toc', name: 'Table of Contents', description: 'Auto-generated TOC', icon: '📑', category: 'advanced', keywords: ['contents', 'navigation'], action: () => insertBlock('toc') },
  { id: 'footnote', name: 'Footnote', description: 'Add a footnote', icon: '¹', category: 'advanced', keywords: ['reference', 'note'], action: () => insertBlock('footnote') },
  { id: 'math', name: 'Math Equation', description: 'LaTeX math block', icon: '∑', category: 'advanced', keywords: ['latex', 'formula', 'equation'], action: () => insertBlock('math') },
  { id: 'mermaid', name: 'Diagram', description: 'Mermaid diagram', icon: '📊', category: 'advanced', keywords: ['chart', 'flowchart', 'graph'], action: () => insertBlock('mermaid') },

  // AI
  { id: 'aiWrite', name: 'AI Write', description: 'Generate content with AI', icon: '🤖', category: 'ai', keywords: ['generate', 'create'], action: () => insertBlock('ai', { type: 'write' }) },
  { id: 'aiSummarize', name: 'AI Summarize', description: 'Summarize selected text', icon: '📝', category: 'ai', keywords: ['shorten', 'tldr'], action: () => insertBlock('ai', { type: 'summarize' }) },
  { id: 'aiTranslate', name: 'AI Translate', description: 'Translate content', icon: '🌐', category: 'ai', keywords: ['language', 'convert'], action: () => insertBlock('ai', { type: 'translate' }) },
  { id: 'aiImage', name: 'AI Image', description: 'Generate image with AI', icon: '🎨', category: 'ai', keywords: ['generate', 'dall-e'], action: () => insertBlock('ai', { type: 'image' }) },
];

const defaultConfig: SlashCommandsConfig = {
  enabled: true,
  trigger: '/',
  showCategories: true,
  maxResults: 10,
  recentCommands: [],
  customCommands: [],
};

const SlashCommandsContext = createContext<SlashCommandsContextValue | null>(null);

// ============================================================================
// SLASH COMMANDS PROVIDER
// ============================================================================

interface SlashCommandsProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<SlashCommandsConfig>;
  onInsertBlock?: (type: string, data?: any) => void;
}

export const SlashCommandsProvider: React.FC<SlashCommandsProviderProps> = ({
  children,
  initialConfig,
  onInsertBlock,
}) => {
  const [config, setConfig] = useState<SlashCommandsConfig>({ ...defaultConfig, ...initialConfig });
  const [customCommands, setCustomCommands] = useState<SlashCommand[]>(initialConfig?.customCommands || []);

  const insertBlock = useCallback((type: string, data?: any) => {
    onInsertBlock?.(type, data);
  }, [onInsertBlock]);

  const defaultCommands = React.useMemo(() => createDefaultCommands(insertBlock), [insertBlock]);
  const allCommands = [...defaultCommands, ...customCommands];

  const updateConfig = useCallback((updates: Partial<SlashCommandsConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const registerCommand = useCallback((command: SlashCommand) => {
    setCustomCommands(prev => {
      const existing = prev.findIndex(c => c.id === command.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = command;
        return updated;
      }
      return [...prev, command];
    });
  }, []);

  const unregisterCommand = useCallback((id: string) => {
    setCustomCommands(prev => prev.filter(c => c.id !== id));
  }, []);

  const executeCommand = useCallback(async (id: string) => {
    const command = allCommands.find(c => c.id === id);
    if (command && !command.disabled) {
      await command.action();

      // Update recent commands
      setConfig(prev => ({
        ...prev,
        recentCommands: [id, ...prev.recentCommands.filter(r => r !== id)].slice(0, 5),
      }));
    }
  }, [allCommands]);

  const searchCommands = useCallback((query: string): SlashCommand[] => {
    if (!query.trim()) {
      // Return recent commands first, then all commands
      const recentIds = config.recentCommands;
      const recent = recentIds.map(id => allCommands.find(c => c.id === id)).filter(Boolean) as SlashCommand[];
      const others = allCommands.filter(c => !recentIds.includes(c.id));
      return [...recent, ...others].slice(0, config.maxResults);
    }

    const normalizedQuery = query.toLowerCase();
    return allCommands
      .filter(command => {
        if (command.disabled) return false;
        const nameMatch = command.name.toLowerCase().includes(normalizedQuery);
        const descMatch = command.description.toLowerCase().includes(normalizedQuery);
        const keywordMatch = command.keywords.some(k => k.toLowerCase().includes(normalizedQuery));
        return nameMatch || descMatch || keywordMatch;
      })
      .slice(0, config.maxResults);
  }, [allCommands, config.maxResults, config.recentCommands]);

  const value: SlashCommandsContextValue = {
    config,
    commands: allCommands,
    updateConfig,
    registerCommand,
    unregisterCommand,
    executeCommand,
    searchCommands,
  };

  return (
    <SlashCommandsContext.Provider value={value}>
      {children}
    </SlashCommandsContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSlashCommands = (): SlashCommandsContextValue => {
  const context = useContext(SlashCommandsContext);
  if (!context) {
    throw new Error('useSlashCommands must be used within a SlashCommandsProvider');
  }
  return context;
};

// ============================================================================
// COMMAND PALETTE
// ============================================================================

interface CommandPaletteProps {
  show: boolean;
  position: { x: number; y: number };
  query: string;
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  className?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  show,
  position,
  query,
  onSelect,
  onClose,
  className = '',
}) => {
  const { config, searchCommands } = useSlashCommands();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const results = searchCommands(query.replace(config.trigger, ''));

  const categoryLabels: Record<CommandCategory, string> = {
    basic: '📝 Basic Blocks',
    media: '📷 Media',
    embed: '🔗 Embeds',
    layout: '📐 Layout',
    advanced: '⚙️ Advanced',
    ai: '🤖 AI',
  };

  const categoryOrder: CommandCategory[] = ['basic', 'media', 'embed', 'layout', 'advanced', 'ai'];

  // Group commands by category
  const groupedResults = React.useMemo(() => {
    if (!config.showCategories) {
      return { all: results };
    }

    const groups: Record<string, SlashCommand[]> = {};
    results.forEach(cmd => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = [];
      }
      groups[cmd.category].push(cmd);
    });

    return groups;
  }, [results, config.showCategories]);

  // Flatten for keyboard navigation
  const flatResults = config.showCategories
    ? categoryOrder.flatMap(cat => groupedResults[cat] || [])
    : results;

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!show) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            onSelect(flatResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [show, flatResults, selectedIndex, onSelect, onClose]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  if (!show || flatResults.length === 0) return null;

  let globalIndex = -1;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={className}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: '320px',
        maxHeight: '400px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        zIndex: 1000,
      }}
    >
      <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {query ? `Results for "${query.replace(config.trigger, '')}"` : 'Type to search commands'}
        </span>
      </div>

      <div style={{ maxHeight: '350px', overflow: 'auto' }}>
        {config.showCategories ? (
          categoryOrder.map(category => {
            const commands = groupedResults[category];
            if (!commands || commands.length === 0) return null;

            return (
              <div key={category}>
                <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', backgroundColor: '#f9fafb' }}>
                  {categoryLabels[category]}
                </div>
                {commands.map(command => {
                  globalIndex++;
                  const index = globalIndex;
                  const isSelected = index === selectedIndex;

                  return (
                    <CommandItem
                      key={command.id}
                      command={command}
                      isSelected={isSelected}
                      onClick={() => onSelect(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    />
                  );
                })}
              </div>
            );
          })
        ) : (
          results.map((command, index) => (
            <CommandItem
              key={command.id}
              command={command}
              isSelected={index === selectedIndex}
              onClick={() => onSelect(command)}
              onMouseEnter={() => setSelectedIndex(index)}
            />
          ))
        )}
      </div>

      <div style={{ padding: '8px 12px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f9fafb', display: 'flex', gap: '16px', fontSize: '11px', color: '#9ca3af' }}>
        <span><kbd style={{ padding: '2px 4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>↑↓</kbd> Navigate</span>
        <span><kbd style={{ padding: '2px 4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>↵</kbd> Select</span>
        <span><kbd style={{ padding: '2px 4px', backgroundColor: '#e5e7eb', borderRadius: '2px' }}>Esc</kbd> Close</span>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMMAND ITEM
// ============================================================================

interface CommandItemProps {
  command: SlashCommand;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const CommandItem: React.FC<CommandItemProps> = ({
  command,
  isSelected,
  onClick,
  onMouseEnter,
}) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 12px',
        cursor: 'pointer',
        backgroundColor: isSelected ? '#f3f4f6' : 'transparent',
        transition: 'background-color 0.1s ease',
      }}
    >
      <span style={{
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: '6px',
        fontSize: '14px',
      }}>
        {command.icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>{command.name}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {command.description}
        </div>
      </div>
      {command.shortcut && (
        <kbd style={{
          padding: '2px 6px',
          backgroundColor: '#f3f4f6',
          border: '1px solid #e5e7eb',
          borderRadius: '4px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#9ca3af',
        }}>
          {command.shortcut}
        </kbd>
      )}
    </div>
  );
};

// ============================================================================
// SLASH COMMAND INPUT
// ============================================================================

interface SlashCommandInputProps {
  value: string;
  onChange: (value: string) => void;
  onInsert: (type: string, data?: any) => void;
  placeholder?: string;
  className?: string;
}

export const SlashCommandInput: React.FC<SlashCommandInputProps> = ({
  value,
  onChange,
  onInsert,
  placeholder = 'Type "/" for commands...',
  className = '',
}) => {
  const { config, executeCommand, searchCommands } = useSlashCommands();
  const [showPalette, setShowPalette] = useState(false);
  const [palettePosition, setPalettePosition] = useState({ x: 0, y: 0 });
  const [slashQuery, setSlashQuery] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check for slash trigger
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const slashIndex = textBeforeCursor.lastIndexOf(config.trigger);

    if (slashIndex >= 0) {
      const textAfterSlash = textBeforeCursor.substring(slashIndex + 1);
      // Only show palette if slash is at start of line or after whitespace
      const charBeforeSlash = slashIndex > 0 ? newValue[slashIndex - 1] : '\n';
      if ((charBeforeSlash === '\n' || charBeforeSlash === ' ') && !textAfterSlash.includes(' ')) {
        setSlashQuery(config.trigger + textAfterSlash);

        // Calculate position
        const textarea = inputRef.current;
        if (textarea) {
          const rect = textarea.getBoundingClientRect();
          // Approximate cursor position
          const lineHeight = 24;
          const lines = textBeforeCursor.split('\n');
          const lineNumber = lines.length - 1;
          setPalettePosition({
            x: rect.left + 16,
            y: rect.top + (lineNumber + 1) * lineHeight + 8,
          });
        }

        setShowPalette(true);
        return;
      }
    }

    setShowPalette(false);
    setSlashQuery('');
  };

  const handleCommandSelect = (command: SlashCommand) => {
    // Remove the slash query from text
    const cursorPos = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.substring(0, cursorPos);
    const slashIndex = textBeforeCursor.lastIndexOf(config.trigger);

    if (slashIndex >= 0) {
      const newValue = value.substring(0, slashIndex) + value.substring(cursorPos);
      onChange(newValue);
    }

    setShowPalette(false);
    setSlashQuery('');

    // Execute the command
    executeCommand(command.id);
  };

  return (
    <div className={className} style={{ position: 'relative' }}>
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px 16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
        }}
      />

      <AnimatePresence>
        {showPalette && (
          <CommandPalette
            show={showPalette}
            position={palettePosition}
            query={slashQuery}
            onSelect={handleCommandSelect}
            onClose={() => {
              setShowPalette(false);
              setSlashQuery('');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// COMMAND BROWSER
// ============================================================================

interface CommandBrowserProps {
  onSelect?: (command: SlashCommand) => void;
  className?: string;
  filter?: CommandCategory | null;
}

export const CommandBrowser: React.FC<CommandBrowserProps> = ({
  onSelect,
  className = '',
  filter = null,
}) => {
  const { commands, executeCommand } = useSlashCommands();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommandCategory | 'all'>('all');

  const categoryLabels: Record<CommandCategory | 'all', string> = {
    all: '📚 All',
    basic: '📝 Basic',
    media: '📷 Media',
    embed: '🔗 Embeds',
    layout: '📐 Layout',
    advanced: '⚙️ Advanced',
    ai: '🤖 AI',
  };

  const filteredCommands = commands.filter(cmd => {
    if (filter && cmd.category !== filter) return false;
    if (selectedCategory !== 'all' && cmd.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.keywords.some(k => k.includes(q))
      );
    }
    return true;
  });

  const handleSelect = (command: SlashCommand) => {
    if (onSelect) {
      onSelect(command);
    } else {
      executeCommand(command.id);
    }
  };

  return (
    <div className={className} style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="text"
          placeholder="Search commands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </div>

      {!filter && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(Object.keys(categoryLabels) as (CommandCategory | 'all')[]).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                border: selectedCategory === cat ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '20px',
                backgroundColor: selectedCategory === cat ? '#EFF6FF' : 'white',
                color: selectedCategory === cat ? '#3b82f6' : '#6b7280',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      )}

      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {filteredCommands.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>
            No commands found
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', padding: '12px' }}>
            {filteredCommands.map(command => (
              <button
                key={command.id}
                onClick={() => handleSelect(command)}
                disabled={command.disabled}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: command.disabled ? 'not-allowed' : 'pointer',
                  opacity: command.disabled ? 0.5 : 1,
                  textAlign: 'left',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  flexShrink: 0,
                }}>
                  {command.icon}
                </span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>
                    {command.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {command.description}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// QUICK INSERT MENU
// ============================================================================

interface QuickInsertMenuProps {
  show: boolean;
  position: { x: number; y: number };
  onSelect: (command: SlashCommand) => void;
  onClose: () => void;
  commands?: SlashCommand[];
}

export const QuickInsertMenu: React.FC<QuickInsertMenuProps> = ({
  show,
  position,
  onSelect,
  onClose,
  commands: customCommands,
}) => {
  const { commands, config } = useSlashCommands();
  const menuRef = useRef<HTMLDivElement>(null);

  // Quick commands - most commonly used
  const quickCommandIds = ['paragraph', 'heading2', 'bulletList', 'image', 'quote', 'code'];
  const displayCommands = customCommands ||
    quickCommandIds.map(id => commands.find(c => c.id === id)).filter(Boolean) as SlashCommand[];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '4px',
        padding: '8px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}
    >
      {displayCommands.map(command => (
        <button
          key={command.id}
          onClick={() => {
            onSelect(command);
            onClose();
          }}
          title={command.name}
          style={{
            width: '48px',
            height: '48px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <span style={{ fontSize: '20px' }}>{command.icon}</span>
          <span style={{ fontSize: '9px', color: '#6b7280' }}>{command.name.split(' ')[0]}</span>
        </button>
      ))}

      <button
        onClick={onClose}
        title="More commands"
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '20px' }}>...</span>
        <span style={{ fontSize: '9px', color: '#6b7280' }}>More</span>
      </button>
    </motion.div>
  );
};

// ============================================================================
// ADD BLOCK BUTTON
// ============================================================================

interface AddBlockButtonProps {
  onInsert: (type: string, data?: any) => void;
  className?: string;
}

export const AddBlockButton: React.FC<AddBlockButtonProps> = ({
  onInsert,
  className = '',
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { commands, executeCommand } = useSlashCommands();

  const handleClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ x: rect.left, y: rect.bottom + 8 });
      setShowMenu(true);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          color: '#9ca3af',
          fontSize: '20px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#3b82f6';
          e.currentTarget.style.color = '#3b82f6';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
          e.currentTarget.style.color = '#9ca3af';
        }}
      >
        +
      </button>

      <AnimatePresence>
        {showMenu && (
          <QuickInsertMenu
            show={showMenu}
            position={menuPosition}
            onSelect={(cmd) => executeCommand(cmd.id)}
            onClose={() => setShowMenu(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  CommandPalette as SlashCommands,
  createDefaultCommands,
};

export default SlashCommandsProvider;
