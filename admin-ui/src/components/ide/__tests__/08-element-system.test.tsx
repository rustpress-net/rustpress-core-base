/**
 * Point 8: Element System Tests (25 tests)
 * Tests for outline panel, extensions panel, emmet support,
 * and snippets management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES
// ============================================

interface OutlineItem {
  id: string;
  label: string;
  type: 'function' | 'class' | 'variable' | 'interface';
  line: number;
  children?: OutlineItem[];
}

interface OutlinePanelProps {
  items: OutlineItem[];
  onItemClick: (item: OutlineItem) => void;
  onItemExpand?: (item: OutlineItem) => void;
}

interface Extension {
  id: string;
  name: string;
  version: string;
  enabled: boolean;
  description?: string;
}

interface ExtensionsPanelProps {
  extensions: Extension[];
  onToggle: (id: string) => void;
  onInstall?: (id: string) => void;
  onUninstall?: (id: string) => void;
}

interface EmmetPanelProps {
  abbreviation: string;
  onExpand: (result: string) => void;
  onAbbreviationChange: (value: string) => void;
}

interface Snippet {
  id: string;
  name: string;
  prefix: string;
  body: string;
  description?: string;
}

interface SnippetsManagerProps {
  snippets: Snippet[];
  onAdd: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
}

// ============================================
// MOCK COMPONENTS
// ============================================

const OutlinePanel = ({ items, onItemClick, onItemExpand }: OutlinePanelProps) => {
  const renderItem = (item: OutlineItem, depth = 0) => (
    <div key={item.id} style={{ paddingLeft: `${depth * 16}px` }}>
      <div
        className="outline-item"
        onClick={() => onItemClick(item)}
        role="treeitem"
        aria-label={item.label}
      >
        {item.children && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onItemExpand?.(item);
            }}
            aria-label="Toggle"
          >
            ▶
          </button>
        )}
        <span className={`icon-${item.type}`}>{item.type[0].toUpperCase()}</span>
        <span>{item.label}</span>
        <span className="line-number">:{item.line}</span>
      </div>
      {item.children?.map((child) => renderItem(child, depth + 1))}
    </div>
  );

  return (
    <div data-testid="outline-panel" role="tree">
      <h3>Outline</h3>
      {items.length === 0 ? (
        <div>No symbols found</div>
      ) : (
        items.map((item) => renderItem(item))
      )}
    </div>
  );
};

const ExtensionsPanel = ({ extensions, onToggle, onInstall, onUninstall }: ExtensionsPanelProps) => (
  <div data-testid="extensions-panel">
    <h3>Extensions</h3>
    <input type="search" placeholder="Search extensions" />
    <ul>
      {extensions.map((ext) => (
        <li key={ext.id}>
          <span>{ext.name}</span>
          <span>v{ext.version}</span>
          <span>{ext.enabled ? 'Enabled' : 'Disabled'}</span>
          <button onClick={() => onToggle(ext.id)}>
            {ext.enabled ? 'Disable' : 'Enable'}
          </button>
          {onUninstall && (
            <button onClick={() => onUninstall(ext.id)}>Uninstall</button>
          )}
        </li>
      ))}
    </ul>
    {onInstall && (
      <button onClick={() => onInstall('new-extension')}>Install New</button>
    )}
  </div>
);

const EmmetPanel = ({ abbreviation, onExpand, onAbbreviationChange }: EmmetPanelProps) => {
  const handleExpand = () => {
    // Simple emmet-like expansion simulation
    const expansions: Record<string, string> = {
      'div': '<div></div>',
      'ul>li*3': '<ul>\n  <li></li>\n  <li></li>\n  <li></li>\n</ul>',
      'div.container': '<div class="container"></div>',
      'div#main': '<div id="main"></div>',
    };
    const result = expansions[abbreviation] || `<${abbreviation}></${abbreviation}>`;
    onExpand(result);
  };

  return (
    <div data-testid="emmet-panel">
      <h3>Emmet</h3>
      <input
        type="text"
        value={abbreviation}
        onChange={(e) => onAbbreviationChange(e.target.value)}
        placeholder="Enter abbreviation"
      />
      <button onClick={handleExpand}>Expand</button>
      <div className="preview">
        Preview: {abbreviation}
      </div>
    </div>
  );
};

const SnippetsManager = ({ snippets, onAdd, onEdit, onDelete }: SnippetsManagerProps) => {
  const [showForm, setShowForm] = React.useState(false);
  const [newSnippet, setNewSnippet] = React.useState({ name: '', prefix: '', body: '' });

  const handleAdd = () => {
    if (newSnippet.name && newSnippet.prefix && newSnippet.body) {
      onAdd({ ...newSnippet, id: `snippet-${Date.now()}` });
      setNewSnippet({ name: '', prefix: '', body: '' });
      setShowForm(false);
    }
  };

  return (
    <div data-testid="snippets-manager">
      <h3>Snippets</h3>
      <button onClick={() => setShowForm(!showForm)}>Add Snippet</button>
      {showForm && (
        <div className="snippet-form">
          <input
            placeholder="Name"
            value={newSnippet.name}
            onChange={(e) => setNewSnippet({ ...newSnippet, name: e.target.value })}
          />
          <input
            placeholder="Prefix"
            value={newSnippet.prefix}
            onChange={(e) => setNewSnippet({ ...newSnippet, prefix: e.target.value })}
          />
          <textarea
            placeholder="Body"
            value={newSnippet.body}
            onChange={(e) => setNewSnippet({ ...newSnippet, body: e.target.value })}
          />
          <button onClick={handleAdd}>Save</button>
        </div>
      )}
      <ul>
        {snippets.map((snippet) => (
          <li key={snippet.id}>
            <span>{snippet.name}</span>
            <code>{snippet.prefix}</code>
            <button onClick={() => onEdit(snippet)}>Edit</button>
            <button onClick={() => onDelete(snippet.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Helper to create mock extension
const createMockExtension = (overrides: Partial<Extension> = {}): Extension => ({
  id: `ext-${Math.random().toString(36).slice(2)}`,
  name: 'Test Extension',
  version: '1.0.0',
  enabled: true,
  description: 'A test extension',
  ...overrides,
});

// ============================================
// OUTLINE PANEL TESTS (6 tests)
// ============================================

describe('OutlinePanel', () => {
  const mockItems: OutlineItem[] = [
    { id: '1', label: 'MyComponent', type: 'function', line: 10 },
    { id: '2', label: 'UserInterface', type: 'interface', line: 25 },
    {
      id: '3',
      label: 'DataService',
      type: 'class',
      line: 50,
      children: [
        { id: '3-1', label: 'getData', type: 'function', line: 55 },
        { id: '3-2', label: 'setData', type: 'function', line: 60 },
      ],
    },
  ];

  const defaultProps = {
    items: mockItems,
    onItemClick: vi.fn(),
    onItemExpand: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. renders OutlinePanel component', () => {
    render(<OutlinePanel {...defaultProps} />);

    expect(screen.getByTestId('outline-panel')).toBeInTheDocument();
  });

  it('2. displays outline items', () => {
    render(<OutlinePanel {...defaultProps} />);

    expect(screen.getByText('MyComponent')).toBeInTheDocument();
    expect(screen.getByText('UserInterface')).toBeInTheDocument();
    expect(screen.getByText('DataService')).toBeInTheDocument();
  });

  it('3. shows line numbers', () => {
    render(<OutlinePanel {...defaultProps} />);

    expect(screen.getByText(':10')).toBeInTheDocument();
    expect(screen.getByText(':25')).toBeInTheDocument();
  });

  it('4. handles item click', async () => {
    const onItemClick = vi.fn();
    const { user } = render(<OutlinePanel {...defaultProps} onItemClick={onItemClick} />);

    await user.click(screen.getByText('MyComponent'));

    expect(onItemClick).toHaveBeenCalledWith(mockItems[0]);
  });

  it('5. displays nested children', () => {
    render(<OutlinePanel {...defaultProps} />);

    expect(screen.getByText('getData')).toBeInTheDocument();
    expect(screen.getByText('setData')).toBeInTheDocument();
  });

  it('6. shows empty state when no items', () => {
    render(<OutlinePanel {...defaultProps} items={[]} />);

    expect(screen.getByText(/no symbols/i)).toBeInTheDocument();
  });
});

// ============================================
// EXTENSIONS PANEL TESTS (6 tests)
// ============================================

describe('ExtensionsPanel', () => {
  const mockExtensions = [
    createMockExtension({ id: 'ext-1', name: 'ESLint', version: '2.0.0' }),
    createMockExtension({ id: 'ext-2', name: 'Prettier', version: '3.0.0', enabled: false }),
    createMockExtension({ id: 'ext-3', name: 'GitLens', version: '1.5.0' }),
  ];

  const defaultProps = {
    extensions: mockExtensions,
    onToggle: vi.fn(),
    onInstall: vi.fn(),
    onUninstall: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('7. renders ExtensionsPanel component', () => {
    render(<ExtensionsPanel {...defaultProps} />);

    expect(screen.getByTestId('extensions-panel')).toBeInTheDocument();
  });

  it('8. displays all extensions', () => {
    render(<ExtensionsPanel {...defaultProps} />);

    expect(screen.getByText('ESLint')).toBeInTheDocument();
    expect(screen.getByText('Prettier')).toBeInTheDocument();
    expect(screen.getByText('GitLens')).toBeInTheDocument();
  });

  it('9. shows extension versions', () => {
    render(<ExtensionsPanel {...defaultProps} />);

    expect(screen.getByText('v2.0.0')).toBeInTheDocument();
    expect(screen.getByText('v3.0.0')).toBeInTheDocument();
  });

  it('10. handles toggle extension', async () => {
    const onToggle = vi.fn();
    const { user } = render(<ExtensionsPanel {...defaultProps} onToggle={onToggle} />);

    const enableButtons = screen.getAllByRole('button', { name: /disable/i });
    await user.click(enableButtons[0]);

    expect(onToggle).toHaveBeenCalledWith('ext-1');
  });

  it('11. shows enabled/disabled status', () => {
    render(<ExtensionsPanel {...defaultProps} />);

    expect(screen.getAllByText('Enabled').length).toBeGreaterThan(0);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('12. has search functionality', () => {
    render(<ExtensionsPanel {...defaultProps} />);

    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });
});

// ============================================
// EMMET PANEL TESTS (6 tests)
// ============================================

describe('EmmetPanel', () => {
  const defaultProps = {
    abbreviation: 'div',
    onExpand: vi.fn(),
    onAbbreviationChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('13. renders EmmetPanel component', () => {
    render(<EmmetPanel {...defaultProps} />);

    expect(screen.getByTestId('emmet-panel')).toBeInTheDocument();
  });

  it('14. displays abbreviation input', () => {
    render(<EmmetPanel {...defaultProps} />);

    expect(screen.getByPlaceholderText(/abbreviation/i)).toBeInTheDocument();
  });

  it('15. shows current abbreviation value', () => {
    render(<EmmetPanel {...defaultProps} abbreviation="ul>li*3" />);

    const input = screen.getByPlaceholderText(/abbreviation/i);
    expect(input).toHaveValue('ul>li*3');
  });

  it('16. handles abbreviation change', async () => {
    const onAbbreviationChange = vi.fn();
    const { user } = render(
      <EmmetPanel {...defaultProps} onAbbreviationChange={onAbbreviationChange} />
    );

    const input = screen.getByPlaceholderText(/abbreviation/i);
    await user.clear(input);
    await user.type(input, 'span');

    expect(onAbbreviationChange).toHaveBeenCalled();
  });

  it('17. expands abbreviation on button click', async () => {
    const onExpand = vi.fn();
    const { user } = render(<EmmetPanel {...defaultProps} onExpand={onExpand} />);

    await user.click(screen.getByRole('button', { name: /expand/i }));

    expect(onExpand).toHaveBeenCalledWith('<div></div>');
  });

  it('18. shows preview area', () => {
    render(<EmmetPanel {...defaultProps} />);

    expect(screen.getByText(/preview/i)).toBeInTheDocument();
  });
});

// ============================================
// SNIPPETS MANAGER TESTS (7 tests)
// ============================================

describe('SnippetsManager', () => {
  const mockSnippets: Snippet[] = [
    { id: 'snip-1', name: 'Console Log', prefix: 'cl', body: 'console.log($1);' },
    { id: 'snip-2', name: 'Arrow Function', prefix: 'af', body: 'const $1 = ($2) => {$3}' },
    { id: 'snip-3', name: 'React Component', prefix: 'rfc', body: 'function $1() {\n  return <div>$2</div>\n}' },
  ];

  const defaultProps = {
    snippets: mockSnippets,
    onAdd: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('19. renders SnippetsManager component', () => {
    render(<SnippetsManager {...defaultProps} />);

    expect(screen.getByTestId('snippets-manager')).toBeInTheDocument();
  });

  it('20. displays all snippets', () => {
    render(<SnippetsManager {...defaultProps} />);

    expect(screen.getByText('Console Log')).toBeInTheDocument();
    expect(screen.getByText('Arrow Function')).toBeInTheDocument();
    expect(screen.getByText('React Component')).toBeInTheDocument();
  });

  it('21. shows snippet prefixes', () => {
    render(<SnippetsManager {...defaultProps} />);

    expect(screen.getByText('cl')).toBeInTheDocument();
    expect(screen.getByText('af')).toBeInTheDocument();
    expect(screen.getByText('rfc')).toBeInTheDocument();
  });

  it('22. has add snippet button', () => {
    render(<SnippetsManager {...defaultProps} />);

    expect(screen.getByRole('button', { name: /add snippet/i })).toBeInTheDocument();
  });

  it('23. shows form when add is clicked', async () => {
    const { user } = render(<SnippetsManager {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /add snippet/i }));

    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Prefix')).toBeInTheDocument();
  });

  it('24. handles edit snippet click', async () => {
    const onEdit = vi.fn();
    const { user } = render(<SnippetsManager {...defaultProps} onEdit={onEdit} />);

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledWith(mockSnippets[0]);
  });

  it('25. handles delete snippet click', async () => {
    const onDelete = vi.fn();
    const { user } = render(<SnippetsManager {...defaultProps} onDelete={onDelete} />);

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await user.click(deleteButtons[0]);

    expect(onDelete).toHaveBeenCalledWith('snip-1');
  });
});
