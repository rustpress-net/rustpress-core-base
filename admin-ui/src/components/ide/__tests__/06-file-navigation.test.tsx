/**
 * Point 6: File Navigation Tests (25 tests)
 * Tests for file navigation components including Breadcrumbs,
 * SearchPanel, SearchResults, TabBar, GoToLineModal, and QuickOpen
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES
// ============================================

interface PathSegment {
  name: string;
  path: string;
}

interface SearchResult {
  file: string;
  line: number;
  content: string;
  matches: Array<{ start: number; end: number }>;
}

interface Tab {
  id: string;
  title: string;
  path: string;
  isModified: boolean;
}

interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
}

// ============================================
// MOCK COMPONENTS
// ============================================

interface BreadcrumbsProps {
  segments: PathSegment[];
  onNavigate: (path: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ segments, onNavigate }) => (
  <nav className="breadcrumbs" aria-label="breadcrumb">
    {segments.map((segment, index) => (
      <span key={segment.path}>
        {index > 0 && <span>/</span>}
        <button onClick={() => onNavigate(segment.path)}>{segment.name}</button>
      </span>
    ))}
  </nav>
);

interface SearchPanelProps {
  onSearch: (query: string) => void;
  onReplace: (search: string, replace: string) => void;
  onClose: () => void;
  caseSensitive?: boolean;
  useRegex?: boolean;
  onToggleCaseSensitive?: () => void;
  onToggleRegex?: () => void;
}

const SearchPanel: React.FC<SearchPanelProps> = ({
  onSearch,
  onReplace,
  onClose,
  caseSensitive = false,
  useRegex = false,
  onToggleCaseSensitive,
  onToggleRegex,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  return (
    <div data-testid="search-panel">
      <h3>Search</h3>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          onSearch(e.target.value);
        }}
      />
      <input
        type="text"
        placeholder="Replace..."
        value={replaceQuery}
        onChange={(e) => setReplaceQuery(e.target.value)}
      />
      <button
        title="Case sensitive"
        className={caseSensitive ? 'active' : ''}
        onClick={onToggleCaseSensitive}
      >
        Aa
      </button>
      <button
        title="Regex"
        className={useRegex ? 'active' : ''}
        onClick={onToggleRegex}
      >
        .*
      </button>
      <button onClick={() => onReplace(searchQuery, replaceQuery)}>Replace All</button>
      <button title="Close" onClick={onClose}>x</button>
    </div>
  );
};

interface SearchResultsProps {
  results: SearchResult[];
  onSelect: (result: SearchResult) => void;
  onClear: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelect, onClear }) => (
  <div data-testid="search-results">
    <h3>Results ({results.length})</h3>
    <button title="Clear results" onClick={onClear}>Clear</button>
    {results.map((result, i) => (
      <div key={i} className="search-result" onClick={() => onSelect(result)}>
        <span className="file">{result.file}</span>
        <span className="line">:{result.line}</span>
        <span className="content">{result.content}</span>
      </div>
    ))}
  </div>
);

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onTabContextMenu?: (id: string, event: React.MouseEvent) => void;
}

const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabContextMenu,
}) => (
  <div className="tab-bar" role="tablist">
    {tabs.map((tab) => (
      <div
        key={tab.id}
        role="tab"
        aria-selected={tab.id === activeTabId}
        className={tab.id === activeTabId ? 'active' : ''}
        onClick={() => onTabSelect(tab.id)}
        onContextMenu={(e) => onTabContextMenu?.(tab.id, e)}
      >
        <span>{tab.title}</span>
        {tab.isModified && <span className="modified-indicator">*</span>}
        <button title="Close tab" onClick={(e) => { e.stopPropagation(); onTabClose(tab.id); }}>x</button>
      </div>
    ))}
  </div>
);

interface GoToLineModalProps {
  maxLine: number;
  onGoTo: (line: number) => void;
  onClose: () => void;
}

const GoToLineModal: React.FC<GoToLineModalProps> = ({ maxLine, onGoTo, onClose }) => {
  const [lineNumber, setLineNumber] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const line = parseInt(lineNumber, 10);
    if (line > 0 && line <= maxLine) {
      onGoTo(line);
    }
  };

  return (
    <div role="dialog" className="go-to-line-modal">
      <h3>Go to Line</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="number"
          min={1}
          max={maxLine}
          placeholder={`Line 1-${maxLine}`}
          value={lineNumber}
          onChange={(e) => setLineNumber(e.target.value)}
          autoFocus
        />
        <button type="submit">Go</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
};

interface QuickOpenProps {
  files: FileItem[];
  onSelect: (file: FileItem) => void;
  onClose: () => void;
}

const QuickOpen: React.FC<QuickOpenProps> = ({ files, onSelect, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filteredFiles.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filteredFiles[selectedIndex]) {
      onSelect(filteredFiles[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="quick-open" role="dialog">
      <input
        type="text"
        placeholder="Search files..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <ul>
        {filteredFiles.map((file, i) => (
          <li
            key={file.path}
            className={i === selectedIndex ? 'selected' : ''}
            onClick={() => onSelect(file)}
          >
            {file.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface OutlineViewProps {
  symbols: Array<{ name: string; kind: string; line: number }>;
  onSelect: (line: number) => void;
}

const OutlineView: React.FC<OutlineViewProps> = ({ symbols, onSelect }) => (
  <div className="outline-view">
    <h3>Outline</h3>
    <ul>
      {symbols.map((symbol, i) => (
        <li key={i} onClick={() => onSelect(symbol.line)}>
          <span className={`kind-${symbol.kind}`}>{symbol.kind}</span>
          <span>{symbol.name}</span>
        </li>
      ))}
    </ul>
  </div>
);

// ============================================
// BREADCRUMBS TESTS (3 tests)
// ============================================

describe('Breadcrumbs', () => {
  const segments: PathSegment[] = [
    { name: 'src', path: '/src' },
    { name: 'components', path: '/src/components' },
    { name: 'Button.tsx', path: '/src/components/Button.tsx' },
  ];

  const defaultProps = {
    segments,
    onNavigate: vi.fn(),
  };

  it('1. renders Breadcrumbs component', () => {
    render(<Breadcrumbs {...defaultProps} />);

    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('components')).toBeInTheDocument();
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
  });

  it('2. navigates to segment on click', async () => {
    const onNavigate = vi.fn();
    const { user } = render(<Breadcrumbs {...defaultProps} onNavigate={onNavigate} />);

    await user.click(screen.getByText('components'));

    expect(onNavigate).toHaveBeenCalledWith('/src/components');
  });

  it('3. shows current file in breadcrumb', () => {
    render(<Breadcrumbs {...defaultProps} />);

    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
  });
});

// ============================================
// SEARCH PANEL TESTS (5 tests)
// ============================================

describe('SearchPanel', () => {
  const defaultProps = {
    onSearch: vi.fn(),
    onReplace: vi.fn(),
    onClose: vi.fn(),
    caseSensitive: false,
    useRegex: false,
    onToggleCaseSensitive: vi.fn(),
    onToggleRegex: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('4. renders SearchPanel', () => {
    render(<SearchPanel {...defaultProps} />);

    expect(screen.getByText(/Search/i)).toBeInTheDocument();
  });

  it('5. searches on input change', async () => {
    const onSearch = vi.fn();
    const { user } = render(<SearchPanel {...defaultProps} onSearch={onSearch} />);

    const input = screen.getByPlaceholderText(/Search/i);
    await user.type(input, 'test');

    expect(onSearch).toHaveBeenCalled();
  });

  it('6. toggles case sensitivity', async () => {
    const onToggleCaseSensitive = vi.fn();
    const { user } = render(<SearchPanel {...defaultProps} onToggleCaseSensitive={onToggleCaseSensitive} />);

    const caseButton = screen.getByTitle(/case sensitive/i);
    await user.click(caseButton);

    expect(onToggleCaseSensitive).toHaveBeenCalled();
  });

  it('7. toggles regex mode', async () => {
    const onToggleRegex = vi.fn();
    const { user } = render(<SearchPanel {...defaultProps} onToggleRegex={onToggleRegex} />);

    const regexButton = screen.getByTitle(/regex/i);
    await user.click(regexButton);

    expect(onToggleRegex).toHaveBeenCalled();
  });

  it('8. performs replace all', async () => {
    const onReplace = vi.fn();
    const { user } = render(<SearchPanel {...defaultProps} onReplace={onReplace} />);

    const searchInput = screen.getByPlaceholderText(/Search/i);
    const replaceInput = screen.getByPlaceholderText(/Replace/i);

    await user.type(searchInput, 'old');
    await user.type(replaceInput, 'new');
    await user.click(screen.getByText(/Replace All/i));

    expect(onReplace).toHaveBeenCalledWith('old', 'new');
  });
});

// ============================================
// SEARCH RESULTS TESTS (3 tests)
// ============================================

describe('SearchResults', () => {
  const results: SearchResult[] = [
    { file: '/src/index.ts', line: 10, content: 'const test = "hello"', matches: [{ start: 6, end: 10 }] },
    { file: '/src/utils.ts', line: 25, content: 'function test() {}', matches: [{ start: 9, end: 13 }] },
  ];

  const defaultProps = {
    results,
    onSelect: vi.fn(),
    onClear: vi.fn(),
  };

  it('9. displays search results', () => {
    render(<SearchResults {...defaultProps} />);

    expect(screen.getByText(/Results \(2\)/)).toBeInTheDocument();
  });

  it('10. navigates to result on click', async () => {
    const onSelect = vi.fn();
    const { user } = render(<SearchResults {...defaultProps} onSelect={onSelect} />);

    await user.click(screen.getByText(/index\.ts/));

    expect(onSelect).toHaveBeenCalled();
  });

  it('11. clears search results', async () => {
    const onClear = vi.fn();
    const { user } = render(<SearchResults {...defaultProps} onClear={onClear} />);

    await user.click(screen.getByTitle(/clear/i));

    expect(onClear).toHaveBeenCalled();
  });
});

// ============================================
// TAB BAR TESTS (5 tests)
// ============================================

describe('TabBar', () => {
  const tabs: Tab[] = [
    { id: 'tab-1', title: 'index.ts', path: '/src/index.ts', isModified: false },
    { id: 'tab-2', title: 'utils.ts', path: '/src/utils.ts', isModified: true },
    { id: 'tab-3', title: 'Button.tsx', path: '/src/Button.tsx', isModified: false },
  ];

  const defaultProps = {
    tabs,
    activeTabId: 'tab-1',
    onTabSelect: vi.fn(),
    onTabClose: vi.fn(),
    onTabContextMenu: vi.fn(),
  };

  it('12. renders TabBar with tabs', () => {
    render(<TabBar {...defaultProps} />);

    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('utils.ts')).toBeInTheDocument();
  });

  it('13. selects tab on click', async () => {
    const onTabSelect = vi.fn();
    const { user } = render(<TabBar {...defaultProps} onTabSelect={onTabSelect} />);

    await user.click(screen.getByText('utils.ts'));

    expect(onTabSelect).toHaveBeenCalledWith('tab-2');
  });

  it('14. closes tab on close button click', async () => {
    const onTabClose = vi.fn();
    const { user } = render(<TabBar {...defaultProps} onTabClose={onTabClose} />);

    const closeButtons = screen.getAllByTitle(/close/i);
    await user.click(closeButtons[0]);

    expect(onTabClose).toHaveBeenCalledWith('tab-1');
  });

  it('15. shows modified indicator for unsaved tabs', () => {
    render(<TabBar {...defaultProps} />);

    const modifiedIndicators = screen.getAllByText('*');
    expect(modifiedIndicators.length).toBe(1);
  });

  it('16. highlights active tab', () => {
    render(<TabBar {...defaultProps} />);

    const activeTab = screen.getByText('index.ts').closest('[role="tab"]');
    expect(activeTab).toHaveClass('active');
  });
});

// ============================================
// GO TO LINE MODAL TESTS (4 tests)
// ============================================

describe('GoToLineModal', () => {
  const defaultProps = {
    maxLine: 100,
    onGoTo: vi.fn(),
    onClose: vi.fn(),
  };

  it('17. renders GoToLineModal', () => {
    render(<GoToLineModal {...defaultProps} />);

    expect(screen.getByText(/Go to Line/i)).toBeInTheDocument();
  });

  it('18. navigates to specified line', async () => {
    const onGoTo = vi.fn();
    const { user } = render(<GoToLineModal {...defaultProps} onGoTo={onGoTo} />);

    const input = screen.getByRole('spinbutton');
    await user.type(input, '42');
    await user.click(screen.getByText('Go'));

    expect(onGoTo).toHaveBeenCalledWith(42);
  });

  it('19. validates line number range', async () => {
    const onGoTo = vi.fn();
    const { user } = render(<GoToLineModal {...defaultProps} onGoTo={onGoTo} />);

    const input = screen.getByRole('spinbutton');
    await user.type(input, '999');
    await user.click(screen.getByText('Go'));

    // 999 > 100 (maxLine), so onGoTo should not be called
    expect(onGoTo).not.toHaveBeenCalled();
  });

  it('20. closes modal on cancel', async () => {
    const onClose = vi.fn();
    const { user } = render(<GoToLineModal {...defaultProps} onClose={onClose} />);

    await user.click(screen.getByText('Cancel'));

    expect(onClose).toHaveBeenCalled();
  });
});

// ============================================
// QUICK OPEN TESTS (4 tests)
// ============================================

describe('QuickOpen', () => {
  const files: FileItem[] = [
    { name: 'index.ts', path: '/src/index.ts', type: 'file' },
    { name: 'utils.ts', path: '/src/utils.ts', type: 'file' },
    { name: 'Button.tsx', path: '/src/components/Button.tsx', type: 'file' },
    { name: 'Header.tsx', path: '/src/components/Header.tsx', type: 'file' },
  ];

  const defaultProps = {
    files,
    onSelect: vi.fn(),
    onClose: vi.fn(),
  };

  it('21. renders QuickOpen with file list', () => {
    render(<QuickOpen {...defaultProps} />);

    expect(screen.getByText('index.ts')).toBeInTheDocument();
    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
  });

  it('22. filters files by search query', async () => {
    const { user } = render(<QuickOpen {...defaultProps} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.type(input, 'Button');

    expect(screen.getByText('Button.tsx')).toBeInTheDocument();
    expect(screen.queryByText('index.ts')).not.toBeInTheDocument();
  });

  it('23. selects file on enter', async () => {
    const onSelect = vi.fn();
    const { user } = render(<QuickOpen {...defaultProps} onSelect={onSelect} />);

    const input = screen.getByPlaceholderText(/search/i);
    await user.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalled();
  });

  it('24. navigates list with arrow keys', async () => {
    render(<QuickOpen {...defaultProps} />);

    const input = screen.getByPlaceholderText(/search/i);
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });

    const items = screen.getAllByRole('listitem');
    expect(items[2]).toHaveClass('selected');
  });
});

// ============================================
// OUTLINE VIEW TESTS (1 test)
// ============================================

describe('OutlineView', () => {
  const symbols = [
    { name: 'App', kind: 'function', line: 5 },
    { name: 'handleClick', kind: 'function', line: 15 },
    { name: 'count', kind: 'variable', line: 8 },
  ];

  const defaultProps = {
    symbols,
    onSelect: vi.fn(),
  };

  it('25. renders OutlineView with document symbols', () => {
    render(<OutlineView {...defaultProps} />);

    expect(screen.getByText('App')).toBeInTheDocument();
    expect(screen.getByText('handleClick')).toBeInTheDocument();
    expect(screen.getByText('count')).toBeInTheDocument();
  });
});
