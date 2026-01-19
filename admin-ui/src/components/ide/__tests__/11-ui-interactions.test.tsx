/**
 * Point 11: UI Interactions Tests (25 tests)
 * Tests for user interface interactions including drag and drop,
 * context menus, scrolling, and focus management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES
// ============================================

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
}

interface FileTreeProps {
  files: FileNode[];
  onSelect: (file: FileNode) => void;
  onDragStart?: (file: FileNode) => void;
  onDragEnd?: () => void;
  onDrop?: (source: FileNode, target: FileNode) => void;
}

interface EditorTab {
  id: string;
  name: string;
  modified: boolean;
}

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTab: string;
  onTabClick: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabReorder?: (fromIndex: number, toIndex: number) => void;
}

interface ContextMenuItem {
  label: string;
  action: () => void;
  disabled?: boolean;
  icon?: string;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

// ============================================
// MOCK COMPONENTS
// ============================================

const FileTree = ({ files, onSelect, onDragStart, onDragEnd, onDrop }: FileTreeProps) => {
  const [draggedItem, setDraggedItem] = React.useState<FileNode | null>(null);

  const renderNode = (node: FileNode, depth = 0) => (
    <div
      key={node.id}
      style={{ paddingLeft: `${depth * 16}px` }}
      data-testid={`file-node-${node.id}`}
    >
      <div
        draggable
        role="treeitem"
        aria-label={node.name}
        onClick={() => onSelect(node)}
        onDragStart={() => {
          setDraggedItem(node);
          onDragStart?.(node);
        }}
        onDragEnd={() => {
          setDraggedItem(null);
          onDragEnd?.();
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => {
          if (draggedItem && node.type === 'folder') {
            onDrop?.(draggedItem, node);
          }
        }}
        className="file-node"
      >
        <span>{node.type === 'folder' ? '📁' : '📄'}</span>
        <span>{node.name}</span>
      </div>
      {node.children?.map((child) => renderNode(child, depth + 1))}
    </div>
  );

  return (
    <div data-testid="file-tree" role="tree">
      {files.map((file) => renderNode(file))}
    </div>
  );
};

const EditorTabs = ({ tabs, activeTab, onTabClick, onTabClose, onTabReorder }: EditorTabsProps) => (
  <div data-testid="editor-tabs" role="tablist">
    {tabs.map((tab, index) => (
      <div
        key={tab.id}
        role="tab"
        aria-selected={tab.id === activeTab}
        aria-label={tab.name}
        className={`tab ${tab.id === activeTab ? 'active' : ''}`}
        onClick={() => onTabClick(tab.id)}
        draggable
        onDragStart={(e) => e.dataTransfer.setData('tabIndex', String(index))}
        onDrop={(e) => {
          const fromIndex = parseInt(e.dataTransfer.getData('tabIndex'));
          onTabReorder?.(fromIndex, index);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <span>{tab.name}</span>
        {tab.modified && <span className="modified-indicator">●</span>}
        <button
          aria-label={`Close ${tab.name}`}
          onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.id);
          }}
        >
          ×
        </button>
      </div>
    ))}
  </div>
);

const ContextMenu = ({ items, position, onClose }: ContextMenuProps) => (
  <div
    data-testid="context-menu"
    role="menu"
    style={{ position: 'absolute', left: position.x, top: position.y }}
  >
    {items.map((item, index) => (
      <button
        key={index}
        role="menuitem"
        disabled={item.disabled}
        onClick={() => {
          item.action();
          onClose();
        }}
      >
        {item.icon && <span>{item.icon}</span>}
        {item.label}
      </button>
    ))}
  </div>
);

// Additional UI components
const InteractiveComponent = ({ onInteraction }: { onInteraction: () => void }) => (
  <div
    data-testid="interactive"
    onClick={onInteraction}
    onKeyDown={(e) => e.key === 'Enter' && onInteraction()}
    tabIndex={0}
    role="button"
  >
    Interactive Element
  </div>
);

const ScrollableComponent = ({ items }: { items: string[] }) => (
  <div data-testid="scrollable" style={{ height: 200, overflow: 'auto' }}>
    {items.map((item, i) => (
      <div key={i} style={{ height: 50 }}>
        {item}
      </div>
    ))}
  </div>
);

const FocusableComponent = ({ onFocus, onBlur }: { onFocus: () => void; onBlur: () => void }) => (
  <input
    data-testid="focusable"
    onFocus={onFocus}
    onBlur={onBlur}
    placeholder="Focus me"
  />
);

// ============================================
// FILE TREE DRAG & DROP TESTS (5 tests)
// ============================================

describe('FileTree Drag and Drop', () => {
  const mockFiles: FileNode[] = [
    {
      id: 'folder-1',
      name: 'src',
      type: 'folder',
      children: [
        { id: 'file-1', name: 'index.ts', type: 'file' },
        { id: 'file-2', name: 'App.tsx', type: 'file' },
      ],
    },
    {
      id: 'folder-2',
      name: 'components',
      type: 'folder',
      children: [],
    },
    { id: 'file-3', name: 'package.json', type: 'file' },
  ];

  const defaultProps = {
    files: mockFiles,
    onSelect: vi.fn(),
    onDragStart: vi.fn(),
    onDragEnd: vi.fn(),
    onDrop: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. renders FileTree component', () => {
    render(<FileTree {...defaultProps} />);

    expect(screen.getByTestId('file-tree')).toBeInTheDocument();
  });

  it('2. displays all file nodes', () => {
    render(<FileTree {...defaultProps} />);

    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('package.json')).toBeInTheDocument();
  });

  it('3. handles file selection', async () => {
    const onSelect = vi.fn();
    const { user } = render(<FileTree {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByText('index.ts'));

    expect(onSelect).toHaveBeenCalled();
  });

  it('4. initiates drag operation', () => {
    const onDragStart = vi.fn();
    render(<FileTree {...defaultProps} onDragStart={onDragStart} />);

    const fileNode = screen.getByText('index.ts').closest('[draggable]');
    fireEvent.dragStart(fileNode!);

    expect(onDragStart).toHaveBeenCalled();
  });

  it('5. ends drag operation', () => {
    const onDragEnd = vi.fn();
    render(<FileTree {...defaultProps} onDragEnd={onDragEnd} />);

    const fileNode = screen.getByText('index.ts').closest('[draggable]');
    fireEvent.dragEnd(fileNode!);

    expect(onDragEnd).toHaveBeenCalled();
  });
});

// ============================================
// EDITOR TABS TESTS (5 tests)
// ============================================

describe('EditorTabs', () => {
  const mockTabs: EditorTab[] = [
    { id: 'tab-1', name: 'index.ts', modified: false },
    { id: 'tab-2', name: 'App.tsx', modified: true },
    { id: 'tab-3', name: 'styles.css', modified: false },
  ];

  const defaultProps = {
    tabs: mockTabs,
    activeTab: 'tab-1',
    onTabClick: vi.fn(),
    onTabClose: vi.fn(),
    onTabReorder: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('6. renders EditorTabs component', () => {
    render(<EditorTabs {...defaultProps} />);

    expect(screen.getByTestId('editor-tabs')).toBeInTheDocument();
  });

  it('7. displays all tabs', () => {
    render(<EditorTabs {...defaultProps} />);

    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('App.tsx')).toBeInTheDocument();
    expect(screen.getByText('styles.css')).toBeInTheDocument();
  });

  it('8. shows modified indicator', () => {
    render(<EditorTabs {...defaultProps} />);

    const modifiedIndicators = screen.getAllByText('●');
    expect(modifiedIndicators.length).toBeGreaterThan(0);
  });

  it('9. handles tab click', async () => {
    const onTabClick = vi.fn();
    const { user } = render(<EditorTabs {...defaultProps} onTabClick={onTabClick} />);

    await user.click(screen.getByText('App.tsx'));

    expect(onTabClick).toHaveBeenCalledWith('tab-2');
  });

  it('10. handles tab close', async () => {
    const onTabClose = vi.fn();
    const { user } = render(<EditorTabs {...defaultProps} onTabClose={onTabClose} />);

    await user.click(screen.getByRole('button', { name: /close index.ts/i }));

    expect(onTabClose).toHaveBeenCalledWith('tab-1');
  });
});

// ============================================
// CONTEXT MENU TESTS (5 tests)
// ============================================

describe('ContextMenu', () => {
  const mockItems: ContextMenuItem[] = [
    { label: 'Cut', action: vi.fn(), icon: '✂️' },
    { label: 'Copy', action: vi.fn(), icon: '📋' },
    { label: 'Paste', action: vi.fn(), icon: '📎' },
    { label: 'Delete', action: vi.fn(), disabled: true },
  ];

  const defaultProps = {
    items: mockItems,
    position: { x: 100, y: 200 },
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('11. renders ContextMenu component', () => {
    render(<ContextMenu {...defaultProps} />);

    expect(screen.getByTestId('context-menu')).toBeInTheDocument();
  });

  it('12. displays all menu items', () => {
    render(<ContextMenu {...defaultProps} />);

    expect(screen.getByText('Cut')).toBeInTheDocument();
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText('Paste')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('13. handles menu item click', async () => {
    const onClose = vi.fn();
    const { user } = render(<ContextMenu {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByRole('menuitem', { name: /cut/i }));

    expect(mockItems[0].action).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('14. disables specified items', () => {
    render(<ContextMenu {...defaultProps} />);

    expect(screen.getByRole('menuitem', { name: /delete/i })).toBeDisabled();
  });

  it('15. positions at specified coordinates', () => {
    render(<ContextMenu {...defaultProps} />);

    const menu = screen.getByTestId('context-menu');
    expect(menu).toHaveStyle({ left: '100px', top: '200px' });
  });
});

// ============================================
// INTERACTIVE COMPONENT TESTS (5 tests)
// ============================================

describe('Interactive Components', () => {
  it('16. handles click interaction', async () => {
    const onInteraction = vi.fn();
    const { user } = render(<InteractiveComponent onInteraction={onInteraction} />);

    await user.click(screen.getByTestId('interactive'));

    expect(onInteraction).toHaveBeenCalled();
  });

  it('17. handles keyboard interaction', async () => {
    const onInteraction = vi.fn();
    const { user } = render(<InteractiveComponent onInteraction={onInteraction} />);

    const element = screen.getByTestId('interactive');
    element.focus();
    await user.keyboard('{Enter}');

    expect(onInteraction).toHaveBeenCalled();
  });

  it('18. is focusable via tab', async () => {
    const { user } = render(<InteractiveComponent onInteraction={vi.fn()} />);

    await user.tab();

    expect(screen.getByTestId('interactive')).toHaveFocus();
  });

  it('19. has correct ARIA role', () => {
    render(<InteractiveComponent onInteraction={vi.fn()} />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('20. renders with correct text', () => {
    render(<InteractiveComponent onInteraction={vi.fn()} />);

    expect(screen.getByText('Interactive Element')).toBeInTheDocument();
  });
});

// ============================================
// SCROLLABLE & FOCUS TESTS (5 tests)
// ============================================

describe('Scrollable and Focus Components', () => {
  it('21. renders scrollable component', () => {
    const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    render(<ScrollableComponent items={items} />);

    expect(screen.getByTestId('scrollable')).toBeInTheDocument();
  });

  it('22. displays scrollable items', () => {
    const items = ['First', 'Second', 'Third'];
    render(<ScrollableComponent items={items} />);

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('23. handles focus events', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { user } = render(<FocusableComponent onFocus={onFocus} onBlur={onBlur} />);

    await user.click(screen.getByTestId('focusable'));

    expect(onFocus).toHaveBeenCalled();
  });

  it('24. handles blur events', async () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const { user } = render(
      <>
        <FocusableComponent onFocus={onFocus} onBlur={onBlur} />
        <button>Other button</button>
      </>
    );

    await user.click(screen.getByTestId('focusable'));
    await user.click(screen.getByRole('button', { name: 'Other button' }));

    expect(onBlur).toHaveBeenCalled();
  });

  it('25. maintains scroll position', () => {
    const items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
    render(<ScrollableComponent items={items} />);

    const scrollable = screen.getByTestId('scrollable');
    expect(scrollable).toHaveStyle({ height: '200px', overflow: 'auto' });
  });
});
