import React, { useState, useCallback, createContext, useContext, useRef, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

// ============================================================================
// BLOCK EDITOR - COMPONENT 7 OF 10 (POST EDITOR ENHANCEMENTS)
// Block-based content editing with drag-and-drop, various block types
// ============================================================================

// Types
export type BlockType =
  | 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'divider'
  | 'image' | 'video' | 'audio' | 'file' | 'gallery'
  | 'embed' | 'table' | 'callout' | 'toggle' | 'columns';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  data?: Record<string, any>;
  children?: Block[];
}

export interface BlockEditorConfig {
  allowedBlocks: BlockType[];
  showBlockMenu: boolean;
  enableDragDrop: boolean;
  enableKeyboardNav: boolean;
  placeholder: string;
  maxBlocks?: number;
}

interface BlockEditorContextValue {
  blocks: Block[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  config: BlockEditorConfig;
  addBlock: (type: BlockType, afterId?: string, data?: Record<string, any>) => string;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (id: string, newIndex: number) => void;
  duplicateBlock: (id: string) => void;
  selectBlock: (id: string | null) => void;
  setHoveredBlock: (id: string | null) => void;
  reorderBlocks: (newOrder: Block[]) => void;
  transformBlock: (id: string, newType: BlockType) => void;
  getBlockIndex: (id: string) => number;
}

const defaultConfig: BlockEditorConfig = {
  allowedBlocks: ['paragraph', 'heading', 'list', 'quote', 'code', 'divider', 'image', 'callout', 'toggle'],
  showBlockMenu: true,
  enableDragDrop: true,
  enableKeyboardNav: true,
  placeholder: 'Start writing or type "/" for commands...',
};

const BlockEditorContext = createContext<BlockEditorContextValue | null>(null);

// Helper to generate unique IDs
const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================================================
// BLOCK EDITOR PROVIDER
// ============================================================================

interface BlockEditorProviderProps {
  children: React.ReactNode;
  initialBlocks?: Block[];
  initialConfig?: Partial<BlockEditorConfig>;
  onChange?: (blocks: Block[]) => void;
}

export const BlockEditorProvider: React.FC<BlockEditorProviderProps> = ({
  children,
  initialBlocks,
  initialConfig,
  onChange,
}) => {
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks || [{ id: generateId(), type: 'paragraph', content: '' }]
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [hoveredBlockId, setHoveredBlockId] = useState<string | null>(null);
  const [config] = useState<BlockEditorConfig>({ ...defaultConfig, ...initialConfig });

  useEffect(() => {
    onChange?.(blocks);
  }, [blocks, onChange]);

  const addBlock = useCallback((type: BlockType, afterId?: string, data?: Record<string, any>) => {
    const newId = generateId();
    const newBlock: Block = { id: newId, type, content: '', data };

    setBlocks(prev => {
      if (config.maxBlocks && prev.length >= config.maxBlocks) {
        return prev;
      }

      if (!afterId) {
        return [...prev, newBlock];
      }

      const index = prev.findIndex(b => b.id === afterId);
      if (index === -1) {
        return [...prev, newBlock];
      }

      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });

    setSelectedBlockId(newId);
    return newId;
  }, [config.maxBlocks]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const deleteBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const newBlocks = prev.filter(b => b.id !== id);
      // Ensure at least one block exists
      if (newBlocks.length === 0) {
        return [{ id: generateId(), type: 'paragraph', content: '' }];
      }
      return newBlocks;
    });
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
  }, [selectedBlockId]);

  const moveBlock = useCallback((id: string, newIndex: number) => {
    setBlocks(prev => {
      const currentIndex = prev.findIndex(b => b.id === id);
      if (currentIndex === -1 || newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }

      const updated = [...prev];
      const [block] = updated.splice(currentIndex, 1);
      updated.splice(newIndex, 0, block);
      return updated;
    });
  }, []);

  const duplicateBlock = useCallback((id: string) => {
    setBlocks(prev => {
      const index = prev.findIndex(b => b.id === id);
      if (index === -1) return prev;

      const block = prev[index];
      const newBlock: Block = {
        ...block,
        id: generateId(),
        content: block.content,
        data: block.data ? { ...block.data } : undefined,
      };

      const updated = [...prev];
      updated.splice(index + 1, 0, newBlock);
      return updated;
    });
  }, []);

  const reorderBlocks = useCallback((newOrder: Block[]) => {
    setBlocks(newOrder);
  }, []);

  const transformBlock = useCallback((id: string, newType: BlockType) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== id) return b;
      return { ...b, type: newType, data: undefined };
    }));
  }, []);

  const getBlockIndex = useCallback((id: string): number => {
    return blocks.findIndex(b => b.id === id);
  }, [blocks]);

  const value: BlockEditorContextValue = {
    blocks,
    selectedBlockId,
    hoveredBlockId,
    config,
    addBlock,
    updateBlock,
    deleteBlock,
    moveBlock,
    duplicateBlock,
    selectBlock: setSelectedBlockId,
    setHoveredBlock: setHoveredBlockId,
    reorderBlocks,
    transformBlock,
    getBlockIndex,
  };

  return (
    <BlockEditorContext.Provider value={value}>
      {children}
    </BlockEditorContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useBlockEditor = (): BlockEditorContextValue => {
  const context = useContext(BlockEditorContext);
  if (!context) {
    throw new Error('useBlockEditor must be used within a BlockEditorProvider');
  }
  return context;
};

// ============================================================================
// BLOCK EDITOR MAIN COMPONENT
// ============================================================================

interface BlockEditorProps {
  className?: string;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ className = '' }) => {
  const { blocks, config, reorderBlocks } = useBlockEditor();

  if (config.enableDragDrop) {
    return (
      <div className={className} style={{ padding: '16px 0' }}>
        <Reorder.Group axis="y" values={blocks} onReorder={reorderBlocks} style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {blocks.map((block) => (
            <Reorder.Item key={block.id} value={block} style={{ listStyle: 'none' }}>
              <BlockWrapper block={block} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <AddBlockLine />
      </div>
    );
  }

  return (
    <div className={className} style={{ padding: '16px 0' }}>
      {blocks.map((block) => (
        <BlockWrapper key={block.id} block={block} />
      ))}
      <AddBlockLine />
    </div>
  );
};

// ============================================================================
// BLOCK WRAPPER
// ============================================================================

interface BlockWrapperProps {
  block: Block;
}

const BlockWrapper: React.FC<BlockWrapperProps> = ({ block }) => {
  const {
    selectedBlockId,
    hoveredBlockId,
    selectBlock,
    setHoveredBlock,
    deleteBlock,
    duplicateBlock,
    moveBlock,
    getBlockIndex,
    blocks,
    config,
  } = useBlockEditor();

  const isSelected = selectedBlockId === block.id;
  const isHovered = hoveredBlockId === block.id;
  const blockIndex = getBlockIndex(block.id);

  return (
    <div
      style={{
        position: 'relative',
        marginBottom: '4px',
      }}
      onMouseEnter={() => setHoveredBlock(block.id)}
      onMouseLeave={() => setHoveredBlock(null)}
      onClick={() => selectBlock(block.id)}
    >
      {/* Block Controls */}
      <AnimatePresence>
        {(isHovered || isSelected) && config.showBlockMenu && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            style={{
              position: 'absolute',
              left: '-48px',
              top: '4px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {config.enableDragDrop && (
              <button
                title="Drag to reorder"
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  cursor: 'grab',
                  fontSize: '12px',
                }}
              >
                ⋮⋮
              </button>
            )}
            <BlockMenu
              block={block}
              onDelete={() => deleteBlock(block.id)}
              onDuplicate={() => duplicateBlock(block.id)}
              onMoveUp={() => blockIndex > 0 && moveBlock(block.id, blockIndex - 1)}
              onMoveDown={() => blockIndex < blocks.length - 1 && moveBlock(block.id, blockIndex + 1)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Block Content */}
      <div
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: `2px solid ${isSelected ? '#3b82f6' : 'transparent'}`,
          backgroundColor: isSelected ? '#fafbfc' : 'transparent',
          transition: 'all 0.15s ease',
        }}
      >
        <BlockContent block={block} />
      </div>
    </div>
  );
};

// ============================================================================
// BLOCK CONTENT
// ============================================================================

interface BlockContentProps {
  block: Block;
}

const BlockContent: React.FC<BlockContentProps> = ({ block }) => {
  const { updateBlock, config } = useBlockEditor();

  const handleContentChange = (content: string) => {
    updateBlock(block.id, { content });
  };

  const commonInputStyle: React.CSSProperties = {
    width: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    resize: 'none',
    fontFamily: 'inherit',
  };

  switch (block.type) {
    case 'paragraph':
      return (
        <textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={config.placeholder}
          style={{
            ...commonInputStyle,
            fontSize: '16px',
            lineHeight: 1.6,
            minHeight: '24px',
          }}
          rows={1}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
      );

    case 'heading':
      const level = block.data?.level || 1;
      const headingSizes: Record<number, string> = {
        1: '32px',
        2: '24px',
        3: '20px',
        4: '18px',
        5: '16px',
        6: '14px',
      };
      return (
        <input
          type="text"
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={`Heading ${level}`}
          style={{
            ...commonInputStyle,
            fontSize: headingSizes[level],
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        />
      );

    case 'quote':
      return (
        <div style={{ borderLeft: '4px solid #3b82f6', paddingLeft: '16px' }}>
          <textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="Type a quote..."
            style={{
              ...commonInputStyle,
              fontSize: '18px',
              fontStyle: 'italic',
              color: '#4b5563',
              lineHeight: 1.6,
            }}
          />
        </div>
      );

    case 'code':
      return (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', padding: '16px' }}>
          <textarea
            value={block.content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder="// Write code here..."
            style={{
              ...commonInputStyle,
              fontFamily: 'ui-monospace, SFMono-Regular, monospace',
              fontSize: '14px',
              color: '#e5e7eb',
              lineHeight: 1.5,
              minHeight: '100px',
            }}
          />
        </div>
      );

    case 'divider':
      return <hr style={{ border: 'none', borderTop: '2px solid #e5e7eb', margin: '16px 0' }} />;

    case 'image':
      return (
        <ImageBlock
          url={block.data?.url}
          alt={block.data?.alt || ''}
          caption={block.content}
          onUpdate={(updates) => updateBlock(block.id, {
            content: updates.caption || block.content,
            data: { ...block.data, ...updates },
          })}
        />
      );

    case 'callout':
      return (
        <CalloutBlock
          content={block.content}
          emoji={block.data?.emoji || '💡'}
          type={block.data?.type || 'info'}
          onChange={handleContentChange}
          onEmojiChange={(emoji) => updateBlock(block.id, { data: { ...block.data, emoji } })}
        />
      );

    case 'toggle':
      return (
        <ToggleBlock
          title={block.content}
          content={block.data?.content || ''}
          isOpen={block.data?.isOpen || false}
          onTitleChange={handleContentChange}
          onContentChange={(content) => updateBlock(block.id, { data: { ...block.data, content } })}
          onToggle={(isOpen) => updateBlock(block.id, { data: { ...block.data, isOpen } })}
        />
      );

    case 'list':
      return (
        <ListBlock
          items={block.content ? block.content.split('\n') : ['']}
          type={block.data?.type || 'bullet'}
          onChange={(items) => handleContentChange(items.join('\n'))}
        />
      );

    default:
      return (
        <textarea
          value={block.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Type something..."
          style={commonInputStyle}
        />
      );
  }
};

// ============================================================================
// SPECIALIZED BLOCK COMPONENTS
// ============================================================================

interface ImageBlockProps {
  url?: string;
  alt: string;
  caption?: string;
  onUpdate: (updates: { url?: string; alt?: string; caption?: string }) => void;
}

const ImageBlock: React.FC<ImageBlockProps> = ({ url, alt, caption, onUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Simulate upload - in production, upload to server
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({ url: reader.result as string });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (!url) {
    return (
      <div style={{
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        backgroundColor: '#f9fafb',
      }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: '32px' }}>🖼️</span>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>
            {isUploading ? 'Uploading...' : 'Click to upload an image'}
          </span>
        </label>
      </div>
    );
  }

  return (
    <figure style={{ margin: 0 }}>
      <img
        src={url}
        alt={alt}
        style={{
          width: '100%',
          maxHeight: '400px',
          objectFit: 'cover',
          borderRadius: '8px',
        }}
      />
      <input
        type="text"
        value={caption || ''}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        placeholder="Add a caption..."
        style={{
          width: '100%',
          marginTop: '8px',
          padding: '8px',
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontSize: '14px',
          color: '#6b7280',
          textAlign: 'center',
        }}
      />
    </figure>
  );
};

interface CalloutBlockProps {
  content: string;
  emoji: string;
  type: 'info' | 'warning' | 'error' | 'success';
  onChange: (content: string) => void;
  onEmojiChange: (emoji: string) => void;
}

const CalloutBlock: React.FC<CalloutBlockProps> = ({ content, emoji, type, onChange, onEmojiChange }) => {
  const typeColors: Record<string, { bg: string; border: string }> = {
    info: { bg: '#EFF6FF', border: '#3B82F6' },
    warning: { bg: '#FFFBEB', border: '#F59E0B' },
    error: { bg: '#FEF2F2', border: '#EF4444' },
    success: { bg: '#F0FDF4', border: '#10B981' },
  };

  const colors = typeColors[type] || typeColors.info;

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      padding: '16px',
      backgroundColor: colors.bg,
      borderLeft: `4px solid ${colors.border}`,
      borderRadius: '0 8px 8px 0',
    }}>
      <span
        style={{ fontSize: '24px', cursor: 'pointer' }}
        onClick={() => {
          const emojis = ['💡', '⚠️', '❌', '✅', '📌', '🔥', '💭', '📝'];
          const currentIndex = emojis.indexOf(emoji);
          onEmojiChange(emojis[(currentIndex + 1) % emojis.length]);
        }}
      >
        {emoji}
      </span>
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your callout content..."
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          fontSize: '14px',
          lineHeight: 1.6,
          resize: 'none',
        }}
      />
    </div>
  );
};

interface ToggleBlockProps {
  title: string;
  content: string;
  isOpen: boolean;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onToggle: (isOpen: boolean) => void;
}

const ToggleBlock: React.FC<ToggleBlockProps> = ({ title, content, isOpen, onTitleChange, onContentChange, onToggle }) => {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#f9fafb',
          cursor: 'pointer',
        }}
        onClick={() => onToggle(!isOpen)}
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          style={{ fontSize: '12px', color: '#6b7280' }}
        >
          ▶
        </motion.span>
        <input
          type="text"
          value={title}
          onChange={(e) => {
            e.stopPropagation();
            onTitleChange(e.target.value);
          }}
          onClick={(e) => e.stopPropagation()}
          placeholder="Toggle title..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: '14px',
            fontWeight: 500,
          }}
        />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Toggle content..."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                outline: 'none',
                fontSize: '14px',
                lineHeight: 1.6,
                resize: 'none',
                minHeight: '80px',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface ListBlockProps {
  items: string[];
  type: 'bullet' | 'numbered' | 'todo';
  onChange: (items: string[]) => void;
}

const ListBlock: React.FC<ListBlockProps> = ({ items, type, onChange }) => {
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    onChange(newItems);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newItems = [...items];
      newItems.splice(index + 1, 0, '');
      onChange(newItems);
    } else if (e.key === 'Backspace' && items[index] === '' && items.length > 1) {
      e.preventDefault();
      const newItems = items.filter((_, i) => i !== index);
      onChange(newItems);
    }
  };

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div style={{ paddingLeft: type === 'numbered' ? '0' : '8px' }}>
      {items.map((item, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
          {type === 'bullet' && (
            <span style={{ color: '#6b7280', fontSize: '16px', lineHeight: '24px' }}>•</span>
          )}
          {type === 'numbered' && (
            <span style={{ color: '#6b7280', fontSize: '14px', lineHeight: '24px', minWidth: '20px' }}>{index + 1}.</span>
          )}
          {type === 'todo' && (
            <input
              type="checkbox"
              checked={checkedItems.has(index)}
              onChange={() => toggleCheck(index)}
              style={{ marginTop: '6px' }}
            />
          )}
          <input
            type="text"
            value={item}
            onChange={(e) => handleItemChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            placeholder="List item..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              fontSize: '14px',
              lineHeight: '24px',
              textDecoration: type === 'todo' && checkedItems.has(index) ? 'line-through' : 'none',
              color: type === 'todo' && checkedItems.has(index) ? '#9ca3af' : 'inherit',
            }}
          />
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// BLOCK MENU
// ============================================================================

interface BlockMenuProps {
  block: Block;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const BlockMenu: React.FC<BlockMenuProps> = ({ block, onDelete, onDuplicate, onMoveUp, onMoveDown }) => {
  const [showMenu, setShowMenu] = useState(false);
  const { transformBlock, config } = useBlockEditor();

  const blockTypes: { type: BlockType; label: string; icon: string }[] = [
    { type: 'paragraph', label: 'Text', icon: '¶' },
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'list', label: 'List', icon: '•' },
    { type: 'quote', label: 'Quote', icon: '"' },
    { type: 'code', label: 'Code', icon: '</>' },
    { type: 'callout', label: 'Callout', icon: '💡' },
    { type: 'toggle', label: 'Toggle', icon: '▶' },
    { type: 'image', label: 'Image', icon: '🖼' },
  ].filter(bt => config.allowedBlocks.includes(bt.type));

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        title="Block options"
        style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: 'transparent',
          color: '#9ca3af',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        +
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              position: 'absolute',
              left: '32px',
              top: 0,
              width: '200px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100,
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase' }}>
              Turn into
            </div>
            <div style={{ maxHeight: '200px', overflow: 'auto' }}>
              {blockTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    transformBlock(block.id, type);
                    setShowMenu(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: block.type === type ? '#f3f4f6' : 'white',
                    color: '#374151',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ width: '20px', textAlign: 'center' }}>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', padding: '4px' }}>
              <button
                onClick={() => { onDuplicate(); setShowMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', backgroundColor: 'white', color: '#374151', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ width: '20px', textAlign: 'center' }}>📋</span>
                <span>Duplicate</span>
              </button>
              <button
                onClick={() => { onMoveUp(); setShowMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', backgroundColor: 'white', color: '#374151', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ width: '20px', textAlign: 'center' }}>⬆️</span>
                <span>Move up</span>
              </button>
              <button
                onClick={() => { onMoveDown(); setShowMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', backgroundColor: 'white', color: '#374151', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ width: '20px', textAlign: 'center' }}>⬇️</span>
                <span>Move down</span>
              </button>
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 12px', border: 'none', backgroundColor: 'white', color: '#EF4444', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
              >
                <span style={{ width: '20px', textAlign: 'center' }}>🗑️</span>
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// ADD BLOCK LINE
// ============================================================================

const AddBlockLine: React.FC = () => {
  const { addBlock, blocks, config } = useBlockEditor();
  const [showOptions, setShowOptions] = useState(false);

  const lastBlockId = blocks[blocks.length - 1]?.id;

  const blockTypes: { type: BlockType; label: string; icon: string }[] = [
    { type: 'paragraph', label: 'Text', icon: '¶' },
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'list', label: 'List', icon: '•' },
    { type: 'quote', label: 'Quote', icon: '"' },
    { type: 'code', label: 'Code', icon: '</>' },
    { type: 'divider', label: 'Divider', icon: '—' },
    { type: 'image', label: 'Image', icon: '🖼' },
    { type: 'callout', label: 'Callout', icon: '💡' },
    { type: 'toggle', label: 'Toggle', icon: '▶' },
  ].filter(bt => config.allowedBlocks.includes(bt.type));

  return (
    <div style={{ position: 'relative', padding: '16px 0' }}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          border: '2px dashed #d1d5db',
          borderRadius: '8px',
          backgroundColor: 'transparent',
          color: '#9ca3af',
          fontSize: '14px',
          cursor: 'pointer',
          width: '100%',
          transition: 'all 0.15s ease',
        }}
      >
        <span>+</span>
        <span>Add block</span>
      </button>

      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              padding: '12px',
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100,
            }}
          >
            {blockTypes.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => {
                  addBlock(type, lastBlockId);
                  setShowOptions(false);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  minWidth: '70px',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ fontSize: '20px' }}>{icon}</span>
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// BLOCK COUNT
// ============================================================================

interface BlockCountProps {
  className?: string;
}

export const BlockCount: React.FC<BlockCountProps> = ({ className = '' }) => {
  const { blocks } = useBlockEditor();

  const typeCounts = blocks.reduce((acc, block) => {
    acc[block.type] = (acc[block.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={className} style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#6b7280' }}>
      <span>{blocks.length} block{blocks.length !== 1 ? 's' : ''}</span>
      {Object.entries(typeCounts).slice(0, 3).map(([type, count]) => (
        <span key={type}>{count} {type}</span>
      ))}
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export default BlockEditorProvider;
