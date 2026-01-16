import React, { useState, useCallback, useEffect, useRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// MARKDOWN SHORTCUTS - COMPONENT 5 OF 10 (POST EDITOR ENHANCEMENTS)
// Keyboard shortcuts for formatting, lists, headings, and common patterns
// ============================================================================

// Types
export type MarkdownAction =
  | 'bold' | 'italic' | 'strikethrough' | 'code' | 'link' | 'image'
  | 'heading1' | 'heading2' | 'heading3' | 'heading4' | 'heading5' | 'heading6'
  | 'bulletList' | 'numberedList' | 'taskList' | 'blockquote' | 'codeBlock'
  | 'horizontalRule' | 'table' | 'undo' | 'redo';

export interface ShortcutDefinition {
  action: MarkdownAction;
  keys: string[];
  label: string;
  description: string;
  icon: string;
  markdown: {
    prefix?: string;
    suffix?: string;
    block?: boolean;
    placeholder?: string;
  };
}

export interface MarkdownShortcutsConfig {
  enabled: boolean;
  shortcuts: ShortcutDefinition[];
  autoConvert: boolean;
  showHints: boolean;
}

interface MarkdownContextValue {
  config: MarkdownShortcutsConfig;
  updateConfig: (config: Partial<MarkdownShortcutsConfig>) => void;
  applyShortcut: (action: MarkdownAction, text: string, selectionStart: number, selectionEnd: number) => {
    text: string;
    selectionStart: number;
    selectionEnd: number;
  };
  getShortcutForAction: (action: MarkdownAction) => ShortcutDefinition | undefined;
}

// Default shortcuts
const defaultShortcuts: ShortcutDefinition[] = [
  { action: 'bold', keys: ['Ctrl+B', 'Cmd+B'], label: 'Bold', description: 'Make text bold', icon: 'B', markdown: { prefix: '**', suffix: '**', placeholder: 'bold text' } },
  { action: 'italic', keys: ['Ctrl+I', 'Cmd+I'], label: 'Italic', description: 'Make text italic', icon: 'I', markdown: { prefix: '*', suffix: '*', placeholder: 'italic text' } },
  { action: 'strikethrough', keys: ['Ctrl+Shift+S', 'Cmd+Shift+S'], label: 'Strikethrough', description: 'Strike through text', icon: 'S', markdown: { prefix: '~~', suffix: '~~', placeholder: 'strikethrough' } },
  { action: 'code', keys: ['Ctrl+`', 'Cmd+`'], label: 'Inline Code', description: 'Format as code', icon: '<>', markdown: { prefix: '`', suffix: '`', placeholder: 'code' } },
  { action: 'link', keys: ['Ctrl+K', 'Cmd+K'], label: 'Link', description: 'Insert a link', icon: '🔗', markdown: { prefix: '[', suffix: '](url)', placeholder: 'link text' } },
  { action: 'image', keys: ['Ctrl+Shift+I', 'Cmd+Shift+I'], label: 'Image', description: 'Insert an image', icon: '🖼', markdown: { prefix: '![', suffix: '](url)', placeholder: 'alt text' } },
  { action: 'heading1', keys: ['Ctrl+1', 'Cmd+1'], label: 'Heading 1', description: 'Large heading', icon: 'H1', markdown: { prefix: '# ', block: true, placeholder: 'Heading' } },
  { action: 'heading2', keys: ['Ctrl+2', 'Cmd+2'], label: 'Heading 2', description: 'Medium heading', icon: 'H2', markdown: { prefix: '## ', block: true, placeholder: 'Heading' } },
  { action: 'heading3', keys: ['Ctrl+3', 'Cmd+3'], label: 'Heading 3', description: 'Small heading', icon: 'H3', markdown: { prefix: '### ', block: true, placeholder: 'Heading' } },
  { action: 'heading4', keys: ['Ctrl+4', 'Cmd+4'], label: 'Heading 4', description: 'Smaller heading', icon: 'H4', markdown: { prefix: '#### ', block: true, placeholder: 'Heading' } },
  { action: 'heading5', keys: ['Ctrl+5', 'Cmd+5'], label: 'Heading 5', description: 'Even smaller heading', icon: 'H5', markdown: { prefix: '##### ', block: true, placeholder: 'Heading' } },
  { action: 'heading6', keys: ['Ctrl+6', 'Cmd+6'], label: 'Heading 6', description: 'Smallest heading', icon: 'H6', markdown: { prefix: '###### ', block: true, placeholder: 'Heading' } },
  { action: 'bulletList', keys: ['Ctrl+Shift+8', 'Cmd+Shift+8'], label: 'Bullet List', description: 'Create bullet list', icon: '•', markdown: { prefix: '- ', block: true, placeholder: 'List item' } },
  { action: 'numberedList', keys: ['Ctrl+Shift+7', 'Cmd+Shift+7'], label: 'Numbered List', description: 'Create numbered list', icon: '1.', markdown: { prefix: '1. ', block: true, placeholder: 'List item' } },
  { action: 'taskList', keys: ['Ctrl+Shift+9', 'Cmd+Shift+9'], label: 'Task List', description: 'Create task list', icon: '☐', markdown: { prefix: '- [ ] ', block: true, placeholder: 'Task' } },
  { action: 'blockquote', keys: ['Ctrl+Shift+.', 'Cmd+Shift+.'], label: 'Quote', description: 'Add blockquote', icon: '"', markdown: { prefix: '> ', block: true, placeholder: 'Quote' } },
  { action: 'codeBlock', keys: ['Ctrl+Shift+`', 'Cmd+Shift+`'], label: 'Code Block', description: 'Add code block', icon: '{ }', markdown: { prefix: '```\n', suffix: '\n```', block: true, placeholder: 'code' } },
  { action: 'horizontalRule', keys: ['Ctrl+Shift+-', 'Cmd+Shift+-'], label: 'Divider', description: 'Insert horizontal rule', icon: '—', markdown: { prefix: '\n---\n', block: true } },
  { action: 'table', keys: ['Ctrl+Shift+T', 'Cmd+Shift+T'], label: 'Table', description: 'Insert table', icon: '▦', markdown: { prefix: '\n| Column 1 | Column 2 | Column 3 |\n|----------|----------|----------|\n| Cell 1   | Cell 2   | Cell 3   |\n', block: true } },
];

const defaultConfig: MarkdownShortcutsConfig = {
  enabled: true,
  shortcuts: defaultShortcuts,
  autoConvert: true,
  showHints: true,
};

const MarkdownContext = createContext<MarkdownContextValue | null>(null);

// ============================================================================
// MARKDOWN SHORTCUTS PROVIDER
// ============================================================================

interface MarkdownShortcutsProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<MarkdownShortcutsConfig>;
}

export const MarkdownShortcutsProvider: React.FC<MarkdownShortcutsProviderProps> = ({
  children,
  initialConfig,
}) => {
  const [config, setConfig] = useState<MarkdownShortcutsConfig>({
    ...defaultConfig,
    ...initialConfig,
    shortcuts: initialConfig?.shortcuts || defaultShortcuts,
  });

  const updateConfig = useCallback((updates: Partial<MarkdownShortcutsConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const getShortcutForAction = useCallback((action: MarkdownAction): ShortcutDefinition | undefined => {
    return config.shortcuts.find(s => s.action === action);
  }, [config.shortcuts]);

  const applyShortcut = useCallback((
    action: MarkdownAction,
    text: string,
    selectionStart: number,
    selectionEnd: number
  ) => {
    const shortcut = getShortcutForAction(action);
    if (!shortcut) {
      return { text, selectionStart, selectionEnd };
    }

    const { prefix = '', suffix = '', block, placeholder = '' } = shortcut.markdown;
    const selectedText = text.substring(selectionStart, selectionEnd) || placeholder;

    let newText: string;
    let newSelectionStart: number;
    let newSelectionEnd: number;

    if (block) {
      // Block-level formatting: apply to start of line
      const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineEnd = text.indexOf('\n', selectionEnd);
      const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;
      const line = text.substring(lineStart, actualLineEnd);

      // Check if the line already has this formatting
      if (line.startsWith(prefix.trim())) {
        // Remove formatting
        const strippedLine = line.replace(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').trim()}\\s*`), '');
        newText = text.substring(0, lineStart) + strippedLine + text.substring(actualLineEnd);
        newSelectionStart = lineStart;
        newSelectionEnd = lineStart + strippedLine.length;
      } else {
        // Add formatting
        newText = text.substring(0, lineStart) + prefix + (selectedText || line) + (suffix || '') + text.substring(actualLineEnd);
        newSelectionStart = lineStart + prefix.length;
        newSelectionEnd = lineStart + prefix.length + (selectedText || line).length;
      }
    } else {
      // Inline formatting
      const beforeSelection = text.substring(0, selectionStart);
      const afterSelection = text.substring(selectionEnd);

      // Check if selection is already formatted
      const isAlreadyFormatted =
        beforeSelection.endsWith(prefix) && afterSelection.startsWith(suffix);

      if (isAlreadyFormatted && selectedText !== placeholder) {
        // Remove formatting
        newText = beforeSelection.slice(0, -prefix.length) + selectedText + afterSelection.slice(suffix.length);
        newSelectionStart = selectionStart - prefix.length;
        newSelectionEnd = newSelectionStart + selectedText.length;
      } else {
        // Add formatting
        newText = beforeSelection + prefix + selectedText + suffix + afterSelection;
        newSelectionStart = selectionStart + prefix.length;
        newSelectionEnd = newSelectionStart + selectedText.length;
      }
    }

    return { text: newText, selectionStart: newSelectionStart, selectionEnd: newSelectionEnd };
  }, [getShortcutForAction]);

  const value: MarkdownContextValue = {
    config,
    updateConfig,
    applyShortcut,
    getShortcutForAction,
  };

  return (
    <MarkdownContext.Provider value={value}>
      {children}
    </MarkdownContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useMarkdownShortcuts = (): MarkdownContextValue => {
  const context = useContext(MarkdownContext);
  if (!context) {
    throw new Error('useMarkdownShortcuts must be used within a MarkdownShortcutsProvider');
  }
  return context;
};

// ============================================================================
// MARKDOWN EDITOR WITH SHORTCUTS
// ============================================================================

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  showToolbar?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Start writing in Markdown...',
  className = '',
  minHeight = '300px',
  showToolbar = true,
  onKeyDown,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { config, applyShortcut, getShortcutForAction } = useMarkdownShortcuts();
  const [showHint, setShowHint] = useState<{ action: MarkdownAction; x: number; y: number } | null>(null);

  const handleFormat = useCallback((action: MarkdownAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd } = textarea;
    const result = applyShortcut(action, value, selectionStart, selectionEnd);

    onChange(result.text);

    // Restore cursor position after React updates
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  }, [value, onChange, applyShortcut]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!config.enabled) {
      onKeyDown?.(e);
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // Find matching shortcut
    for (const shortcut of config.shortcuts) {
      for (const keyCombo of shortcut.keys) {
        const parts = keyCombo.split('+');
        const key = parts[parts.length - 1].toLowerCase();
        const needsCtrl = parts.includes('Ctrl') || parts.includes('Cmd');
        const needsShift = parts.includes('Shift');
        const needsAlt = parts.includes('Alt');

        if (
          modifier === needsCtrl &&
          e.shiftKey === needsShift &&
          e.altKey === needsAlt &&
          e.key.toLowerCase() === key
        ) {
          e.preventDefault();
          handleFormat(shortcut.action);

          // Show hint
          if (config.showHints) {
            const textarea = textareaRef.current;
            if (textarea) {
              const rect = textarea.getBoundingClientRect();
              setShowHint({
                action: shortcut.action,
                x: rect.left + 20,
                y: rect.top + 20,
              });
              setTimeout(() => setShowHint(null), 1500);
            }
          }
          return;
        }
      }
    }

    // Auto-convert markdown patterns on Enter or Space
    if (config.autoConvert && (e.key === 'Enter' || e.key === ' ')) {
      const textarea = e.currentTarget;
      const { selectionStart } = textarea;
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineText = value.substring(lineStart, selectionStart);

      // Check for auto-convert patterns
      const patterns: { regex: RegExp; action: MarkdownAction }[] = [
        { regex: /^#{1,6}\s$/, action: 'heading1' }, // Headers (will be handled specially)
        { regex: /^-\s$/, action: 'bulletList' },
        { regex: /^\d+\.\s$/, action: 'numberedList' },
        { regex: /^>\s$/, action: 'blockquote' },
        { regex: /^-\s\[\s?\]\s$/, action: 'taskList' },
        { regex: /^```$/, action: 'codeBlock' },
        { regex: /^---$/, action: 'horizontalRule' },
      ];

      for (const { regex, action } of patterns) {
        if (regex.test(lineText + (e.key === ' ' ? ' ' : ''))) {
          // Pattern matched, convert it
          if (config.showHints) {
            const rect = textarea.getBoundingClientRect();
            setShowHint({ action, x: rect.left + 20, y: rect.top + 20 });
            setTimeout(() => setShowHint(null), 1500);
          }
          break;
        }
      }
    }

    // Handle Tab for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const { selectionStart, selectionEnd } = textarea;

      if (e.shiftKey) {
        // Outdent: remove leading spaces/tabs
        const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
        const lineText = value.substring(lineStart, selectionEnd);
        const outdentedText = lineText.replace(/^(\t|  )/, '');
        const newValue = value.substring(0, lineStart) + outdentedText + value.substring(selectionEnd);
        const diff = lineText.length - outdentedText.length;

        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(selectionStart - diff, selectionEnd - diff);
        });
      } else {
        // Indent: add spaces
        const newValue = value.substring(0, selectionStart) + '  ' + value.substring(selectionEnd);
        onChange(newValue);
        requestAnimationFrame(() => {
          textarea.setSelectionRange(selectionStart + 2, selectionStart + 2);
        });
      }
      return;
    }

    onKeyDown?.(e);
  }, [config, value, onChange, handleFormat, onKeyDown]);

  return (
    <div className={className}>
      {showToolbar && <FormattingToolbar onFormat={handleFormat} />}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={{
          width: '100%',
          minHeight,
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: showToolbar ? '0 0 8px 8px' : '8px',
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
          lineHeight: 1.6,
          resize: 'vertical',
          outline: 'none',
        }}
      />

      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              left: showHint.x,
              top: showHint.y,
              padding: '6px 12px',
              backgroundColor: '#1f2937',
              color: 'white',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 500,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              zIndex: 1000,
            }}
          >
            {getShortcutForAction(showHint.action)?.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// FORMATTING TOOLBAR
// ============================================================================

interface FormattingToolbarProps {
  onFormat: (action: MarkdownAction) => void;
  className?: string;
  compact?: boolean;
}

export const FormattingToolbar: React.FC<FormattingToolbarProps> = ({
  onFormat,
  className = '',
  compact = false,
}) => {
  const { config, getShortcutForAction } = useMarkdownShortcuts();
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const groups: { name: string; actions: MarkdownAction[] }[] = [
    { name: 'text', actions: ['bold', 'italic', 'strikethrough', 'code'] },
    { name: 'headings', actions: ['heading1', 'heading2', 'heading3'] },
    { name: 'lists', actions: ['bulletList', 'numberedList', 'taskList'] },
    { name: 'blocks', actions: ['blockquote', 'codeBlock', 'horizontalRule'] },
    { name: 'media', actions: ['link', 'image', 'table'] },
  ];

  const buttonStyle = (isActive: boolean = false): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: compact ? '28px' : '32px',
    height: compact ? '28px' : '32px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: isActive ? '#e5e7eb' : 'transparent',
    color: '#374151',
    fontSize: compact ? '12px' : '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  });

  const separatorStyle: React.CSSProperties = {
    width: '1px',
    height: '20px',
    backgroundColor: '#e5e7eb',
    margin: '0 4px',
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '2px',
        padding: compact ? '6px 8px' : '8px 12px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px 8px 0 0',
        border: '1px solid #e5e7eb',
        borderBottom: 'none',
      }}
    >
      {groups.map((group, groupIndex) => (
        <React.Fragment key={group.name}>
          {groupIndex > 0 && <div style={separatorStyle} />}
          {group.actions.map((action) => {
            const shortcut = getShortcutForAction(action);
            if (!shortcut) return null;

            return (
              <button
                key={action}
                onClick={() => onFormat(action)}
                title={`${shortcut.label} (${shortcut.keys[0]})`}
                style={buttonStyle()}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {shortcut.icon}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

// ============================================================================
// SHORTCUT HINTS PANEL
// ============================================================================

interface ShortcutHintsPanelProps {
  className?: string;
  filter?: 'all' | 'text' | 'blocks' | 'media';
}

export const ShortcutHintsPanel: React.FC<ShortcutHintsPanelProps> = ({
  className = '',
  filter = 'all',
}) => {
  const { config } = useMarkdownShortcuts();
  const [searchQuery, setSearchQuery] = useState('');

  const groupedShortcuts: Record<string, ShortcutDefinition[]> = {
    'Text Formatting': config.shortcuts.filter(s => ['bold', 'italic', 'strikethrough', 'code'].includes(s.action)),
    'Headings': config.shortcuts.filter(s => s.action.startsWith('heading')),
    'Lists': config.shortcuts.filter(s => ['bulletList', 'numberedList', 'taskList'].includes(s.action)),
    'Blocks': config.shortcuts.filter(s => ['blockquote', 'codeBlock', 'horizontalRule'].includes(s.action)),
    'Media & Links': config.shortcuts.filter(s => ['link', 'image', 'table'].includes(s.action)),
  };

  const filteredGroups = Object.entries(groupedShortcuts).filter(([name, shortcuts]) => {
    if (filter === 'all') return shortcuts.length > 0;
    if (filter === 'text') return name === 'Text Formatting';
    if (filter === 'blocks') return ['Headings', 'Lists', 'Blocks'].includes(name);
    if (filter === 'media') return name === 'Media & Links';
    return true;
  });

  const filteredBySearch = searchQuery
    ? filteredGroups.map(([name, shortcuts]) => [
        name,
        shortcuts.filter(s =>
          s.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.keys.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
        ),
      ] as [string, ShortcutDefinition[]])
    : filteredGroups;

  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const formatKey = (key: string): string => {
    return key
      .replace('Ctrl', isMac ? '⌃' : 'Ctrl')
      .replace('Cmd', '⌘')
      .replace('Shift', isMac ? '⇧' : 'Shift')
      .replace('Alt', isMac ? '⌥' : 'Alt')
      .replace('+', ' + ');
  };

  return (
    <div className={className} style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
          ⌨️ Keyboard Shortcuts
        </h3>
        <input
          type="text"
          placeholder="Search shortcuts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '13px',
            outline: 'none',
          }}
        />
      </div>

      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {filteredBySearch.map(([groupName, shortcuts]) => (
          shortcuts.length > 0 && (
            <div key={groupName} style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
                {groupName}
              </h4>
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '16px', width: '24px', textAlign: 'center' }}>{shortcut.icon}</span>
                    <span style={{ fontSize: '13px', color: '#374151' }}>{shortcut.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {shortcut.keys.slice(0, isMac ? 1 : 1).map((key, i) => (
                      <kbd
                        key={i}
                        style={{
                          padding: '2px 6px',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #e5e7eb',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontFamily: 'ui-monospace, monospace',
                          color: '#6b7280',
                        }}
                      >
                        {formatKey(key)}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// FLOATING FORMAT MENU
// ============================================================================

interface FloatingFormatMenuProps {
  show: boolean;
  position: { x: number; y: number };
  onFormat: (action: MarkdownAction) => void;
  onClose: () => void;
}

export const FloatingFormatMenu: React.FC<FloatingFormatMenuProps> = ({
  show,
  position,
  onFormat,
  onClose,
}) => {
  const { getShortcutForAction } = useMarkdownShortcuts();
  const menuRef = useRef<HTMLDivElement>(null);

  const quickActions: MarkdownAction[] = ['bold', 'italic', 'strikethrough', 'code', 'link'];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        display: 'flex',
        gap: '2px',
        padding: '4px',
        backgroundColor: '#1f2937',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
      }}
    >
      {quickActions.map((action) => {
        const shortcut = getShortcutForAction(action);
        if (!shortcut) return null;

        return (
          <button
            key={action}
            onClick={() => {
              onFormat(action);
              onClose();
            }}
            title={shortcut.label}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: 'white',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {shortcut.icon}
          </button>
        );
      })}
    </motion.div>
  );
};

// ============================================================================
// MARKDOWN CHEAT SHEET
// ============================================================================

interface MarkdownCheatSheetProps {
  className?: string;
  compact?: boolean;
}

export const MarkdownCheatSheet: React.FC<MarkdownCheatSheetProps> = ({
  className = '',
  compact = false,
}) => {
  const examples = [
    { syntax: '**bold**', result: 'bold', description: 'Bold text' },
    { syntax: '*italic*', result: 'italic', description: 'Italic text' },
    { syntax: '~~strike~~', result: 'strike', description: 'Strikethrough' },
    { syntax: '`code`', result: 'code', description: 'Inline code' },
    { syntax: '[link](url)', result: 'link', description: 'Hyperlink' },
    { syntax: '# Heading', result: 'Heading', description: 'Heading 1' },
    { syntax: '- item', result: '• item', description: 'Bullet list' },
    { syntax: '1. item', result: '1. item', description: 'Numbered list' },
    { syntax: '> quote', result: 'quote', description: 'Blockquote' },
    { syntax: '---', result: '———', description: 'Horizontal rule' },
  ];

  const displayExamples = compact ? examples.slice(0, 5) : examples;

  return (
    <div className={className} style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: compact ? '12px' : '16px' }}>
      <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: 600, color: '#374151' }}>
        Markdown Quick Reference
      </h4>
      <div style={{ display: 'grid', gap: '8px' }}>
        {displayExamples.map((ex, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
            <code style={{ flex: 1, padding: '2px 6px', backgroundColor: '#e5e7eb', borderRadius: '4px', fontFamily: 'monospace', color: '#6b7280' }}>
              {ex.syntax}
            </code>
            <span style={{ flex: 1, color: '#374151' }}>{ex.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// AUTO CONVERT SETTINGS
// ============================================================================

interface AutoConvertSettingsProps {
  className?: string;
}

export const AutoConvertSettings: React.FC<AutoConvertSettingsProps> = ({ className = '' }) => {
  const { config, updateConfig } = useMarkdownShortcuts();

  const toggleStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid #f3f4f6',
  };

  const switchStyle = (enabled: boolean): React.CSSProperties => ({
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    backgroundColor: enabled ? '#3b82f6' : '#d1d5db',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s ease',
  });

  const switchKnobStyle = (enabled: boolean): React.CSSProperties => ({
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'white',
    position: 'absolute',
    top: '2px',
    left: enabled ? '22px' : '2px',
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  });

  return (
    <div className={className} style={{ padding: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#111827' }}>
        Markdown Settings
      </h3>

      <div style={toggleStyle}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Enable Shortcuts</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Use keyboard shortcuts for formatting</div>
        </div>
        <div style={switchStyle(config.enabled)} onClick={() => updateConfig({ enabled: !config.enabled })}>
          <div style={switchKnobStyle(config.enabled)} />
        </div>
      </div>

      <div style={toggleStyle}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Auto-convert Patterns</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Convert markdown patterns automatically</div>
        </div>
        <div style={switchStyle(config.autoConvert)} onClick={() => updateConfig({ autoConvert: !config.autoConvert })}>
          <div style={switchKnobStyle(config.autoConvert)} />
        </div>
      </div>

      <div style={{ ...toggleStyle, borderBottom: 'none' }}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Show Hints</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Display hints when using shortcuts</div>
        </div>
        <div style={switchStyle(config.showHints)} onClick={() => updateConfig({ showHints: !config.showHints })}>
          <div style={switchKnobStyle(config.showHints)} />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  MarkdownEditor as MarkdownShortcuts,
  defaultShortcuts,
};

export default MarkdownShortcutsProvider;
