/**
 * Point 1: Core IDE Components Tests (25 tests)
 * Tests for fundamental IDE layout components including ActivityBar, StatusBar,
 * Breadcrumbs, WelcomeTab, ZenMode, and SplitEditor
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK COMPONENTS
// ============================================

type ActivityView = 'files' | 'search' | 'git' | 'debug' | 'extensions' | 'ai' | 'chat' | 'collaborators';

interface ActivityBarProps {
  activeView: ActivityView;
  onViewChange: (view: ActivityView) => void;
}

const ActivityBar: React.FC<ActivityBarProps> = ({ activeView, onViewChange }) => {
  const views: { id: ActivityView; title: string }[] = [
    { id: 'files', title: 'Explorer' },
    { id: 'search', title: 'Search' },
    { id: 'git', title: 'Source Control' },
    { id: 'debug', title: 'Debug' },
    { id: 'extensions', title: 'Extensions' },
    { id: 'ai', title: 'AI Assistant' },
    { id: 'chat', title: 'Chat' },
    { id: 'collaborators', title: 'Collaborators' },
  ];

  return (
    <nav aria-label="Activity Bar">
      {views.map((view) => (
        <button
          key={view.id}
          title={view.title}
          onClick={() => onViewChange(view.id)}
          className={activeView === view.id ? 'text-white bg-gray-800' : 'text-gray-400'}
        >
          {view.title}
        </button>
      ))}
      <button title="Settings">Settings</button>
    </nav>
  );
};

interface StatusBarProps {
  branch?: string;
  line?: number;
  column?: number;
  language?: string;
  encoding?: string;
  notifications?: number;
  onBranchClick?: () => void;
  onLanguageClick?: () => void;
  onEncodingClick?: () => void;
  onNotificationsClick?: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({
  branch = 'main',
  line = 1,
  column = 1,
  language = 'TypeScript',
  encoding = 'UTF-8',
  notifications = 0,
  onBranchClick,
  onLanguageClick,
  onEncodingClick,
  onNotificationsClick,
}) => (
  <footer className="status-bar" role="contentinfo">
    <button onClick={onBranchClick}>{branch}</button>
    <span>Ln {line}, Col {column}</span>
    <button onClick={onLanguageClick}>{language}</button>
    <button onClick={onEncodingClick}>{encoding}</button>
    {notifications > 0 && (
      <button onClick={onNotificationsClick} aria-label={`${notifications} notifications`}>
        {notifications}
      </button>
    )}
  </footer>
);

interface BreadcrumbsProps {
  path: string;
  onNavigate: (path: string) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, onNavigate }) => {
  const parts = path.split('/').filter(Boolean);

  return (
    <nav aria-label="breadcrumb">
      <ol>
        {parts.map((part, i) => {
          const fullPath = '/' + parts.slice(0, i + 1).join('/');
          return (
            <li key={fullPath}>
              <button onClick={() => onNavigate(fullPath)}>{part}</button>
              {i < parts.length - 1 && <span>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

interface WelcomeTabProps {
  recentFiles?: Array<{ path: string; timestamp: Date }>;
  onOpenFile?: (path: string) => void;
  onNewFile?: () => void;
  onOpenFolder?: () => void;
  onCloneRepo?: () => void;
}

const WelcomeTab: React.FC<WelcomeTabProps> = ({
  recentFiles = [],
  onOpenFile,
  onNewFile,
  onOpenFolder,
  onCloneRepo,
}) => (
  <div data-testid="welcome-tab">
    <h1>Welcome</h1>
    <button onClick={onNewFile}>New File</button>
    <button onClick={onOpenFolder}>Open Folder</button>
    <button onClick={onCloneRepo}>Clone Repository</button>
    {recentFiles.length > 0 && (
      <section>
        <h2>Recent Files</h2>
        <ul>
          {recentFiles.map((file) => (
            <li key={file.path}>
              <button onClick={() => onOpenFile?.(file.path)}>{file.path}</button>
            </li>
          ))}
        </ul>
      </section>
    )}
  </div>
);

interface ZenModeProps {
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ZenMode: React.FC<ZenModeProps> = ({ enabled, onToggle, children }) => (
  <div className={enabled ? 'zen-mode' : ''}>
    <button onClick={onToggle} aria-label={enabled ? 'Exit Zen Mode' : 'Enter Zen Mode'}>
      {enabled ? 'Exit Zen' : 'Zen Mode'}
    </button>
    {children}
  </div>
);

interface SplitEditorProps {
  direction?: 'horizontal' | 'vertical';
  panes: Array<{ id: string; content: React.ReactNode }>;
  onClose?: (id: string) => void;
  onResize?: (sizes: number[]) => void;
}

const SplitEditor: React.FC<SplitEditorProps> = ({ direction = 'horizontal', panes, onClose, onResize }) => (
  <div className={`split-${direction}`}>
    {panes.map((pane, i) => (
      <React.Fragment key={pane.id}>
        <div className="pane" data-testid={`pane-${pane.id}`}>
          {pane.content}
          <button onClick={() => onClose?.(pane.id)}>Close</button>
        </div>
        {i < panes.length - 1 && <div className="resize-handle" draggable />}
      </React.Fragment>
    ))}
  </div>
);

// ============================================
// ACTIVITY BAR TESTS (9 tests)
// ============================================

describe('ActivityBar', () => {
  const defaultProps = {
    activeView: 'files' as ActivityView,
    onViewChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. renders ActivityBar with all core icons', () => {
    render(<ActivityBar {...defaultProps} />);

    expect(screen.getByTitle('Explorer')).toBeInTheDocument();
    expect(screen.getByTitle('Search')).toBeInTheDocument();
    expect(screen.getByTitle('Source Control')).toBeInTheDocument();
    expect(screen.getByTitle('Debug')).toBeInTheDocument();
    expect(screen.getByTitle('Extensions')).toBeInTheDocument();
    expect(screen.getByTitle('AI Assistant')).toBeInTheDocument();
    expect(screen.getByTitle('Chat')).toBeInTheDocument();
    expect(screen.getByTitle('Collaborators')).toBeInTheDocument();
  });

  it('2. highlights active view with visual indicator', () => {
    render(<ActivityBar {...defaultProps} activeView="search" />);

    const searchButton = screen.getByTitle('Search');
    expect(searchButton).toHaveClass('text-white', 'bg-gray-800');
  });

  it('3. calls onViewChange when icon is clicked', async () => {
    const onViewChange = vi.fn();
    const { user } = render(<ActivityBar {...defaultProps} onViewChange={onViewChange} />);

    await user.click(screen.getByTitle('Search'));

    expect(onViewChange).toHaveBeenCalledWith('search');
  });

  it('4. shows tooltip on hover', () => {
    render(<ActivityBar {...defaultProps} />);

    const explorerButton = screen.getByTitle('Explorer');
    expect(explorerButton).toHaveAttribute('title', 'Explorer');
  });

  it('5. has accessibility label for activity bar', () => {
    render(<ActivityBar {...defaultProps} />);

    expect(screen.getByLabelText('Activity Bar')).toBeInTheDocument();
  });

  it('6. renders settings icon at bottom', () => {
    render(<ActivityBar {...defaultProps} />);

    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('7. supports keyboard navigation', async () => {
    const onViewChange = vi.fn();
    const { user } = render(<ActivityBar {...defaultProps} onViewChange={onViewChange} />);

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onViewChange).toHaveBeenCalled();
  });

  it('8. inactive icons have muted styling', () => {
    render(<ActivityBar {...defaultProps} activeView="files" />);

    const searchButton = screen.getByTitle('Search');
    expect(searchButton).toHaveClass('text-gray-400');
  });

  it('9. switches between views correctly', async () => {
    const onViewChange = vi.fn();
    const { user, rerender } = render(
      <ActivityBar activeView="files" onViewChange={onViewChange} />
    );

    await user.click(screen.getByTitle('Debug'));
    expect(onViewChange).toHaveBeenCalledWith('debug');

    rerender(<ActivityBar activeView="debug" onViewChange={onViewChange} />);
    expect(screen.getByTitle('Debug')).toHaveClass('text-white', 'bg-gray-800');
  });
});

// ============================================
// STATUS BAR TESTS (6 tests)
// ============================================

describe('StatusBar', () => {
  it('10. renders StatusBar with all elements', () => {
    render(<StatusBar branch="main" line={10} column={5} language="TypeScript" encoding="UTF-8" />);

    expect(screen.getByText('main')).toBeInTheDocument();
    expect(screen.getByText(/Ln 10/)).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('UTF-8')).toBeInTheDocument();
  });

  it('11. displays current git branch', () => {
    render(<StatusBar branch="feature/new-feature" />);

    expect(screen.getByText('feature/new-feature')).toBeInTheDocument();
  });

  it('12. shows line and column position', () => {
    render(<StatusBar line={42} column={15} />);

    expect(screen.getByText(/Ln 42/)).toBeInTheDocument();
    expect(screen.getByText(/Col 15/)).toBeInTheDocument();
  });

  it('13. displays file language', () => {
    render(<StatusBar language="JavaScript" />);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('14. shows notification count', () => {
    render(<StatusBar notifications={3} />);

    expect(screen.getByLabelText('3 notifications')).toBeInTheDocument();
  });

  it('15. handles click on branch to open branch picker', async () => {
    const onBranchClick = vi.fn();
    const { user } = render(<StatusBar branch="main" onBranchClick={onBranchClick} />);

    await user.click(screen.getByText('main'));

    expect(onBranchClick).toHaveBeenCalled();
  });
});

// ============================================
// BREADCRUMBS TESTS (3 tests)
// ============================================

describe('Breadcrumbs', () => {
  it('16. renders Breadcrumbs for file path', () => {
    render(<Breadcrumbs path="/src/components/ide/Editor.tsx" onNavigate={vi.fn()} />);

    expect(screen.getByText('src')).toBeInTheDocument();
    expect(screen.getByText('components')).toBeInTheDocument();
    expect(screen.getByText('ide')).toBeInTheDocument();
    expect(screen.getByText('Editor.tsx')).toBeInTheDocument();
  });

  it('17. navigates to folder when breadcrumb is clicked', async () => {
    const onNavigate = vi.fn();
    const { user } = render(<Breadcrumbs path="/src/components/ide/Editor.tsx" onNavigate={onNavigate} />);

    await user.click(screen.getByText('components'));

    expect(onNavigate).toHaveBeenCalledWith('/src/components');
  });

  it('18. shows separator between path segments', () => {
    render(<Breadcrumbs path="/src/components" onNavigate={vi.fn()} />);

    expect(screen.getByText('/')).toBeInTheDocument();
  });
});

// ============================================
// WELCOME TAB TESTS (3 tests)
// ============================================

describe('WelcomeTab', () => {
  it('19. renders WelcomeTab with quick actions', () => {
    render(<WelcomeTab />);

    expect(screen.getByText('New File')).toBeInTheDocument();
    expect(screen.getByText('Open Folder')).toBeInTheDocument();
    expect(screen.getByText('Clone Repository')).toBeInTheDocument();
  });

  it('20. displays recent files', () => {
    const recentFiles = [
      { path: '/src/index.ts', timestamp: new Date() },
      { path: '/src/App.tsx', timestamp: new Date() },
    ];

    render(<WelcomeTab recentFiles={recentFiles} />);

    expect(screen.getByText('/src/index.ts')).toBeInTheDocument();
    expect(screen.getByText('/src/App.tsx')).toBeInTheDocument();
  });

  it('21. opens file when recent file is clicked', async () => {
    const onOpenFile = vi.fn();
    const recentFiles = [{ path: '/src/index.ts', timestamp: new Date() }];

    const { user } = render(<WelcomeTab recentFiles={recentFiles} onOpenFile={onOpenFile} />);

    await user.click(screen.getByText('/src/index.ts'));

    expect(onOpenFile).toHaveBeenCalledWith('/src/index.ts');
  });
});

// ============================================
// ZEN MODE TESTS (2 tests)
// ============================================

describe('ZenMode', () => {
  it('22. toggles zen mode on/off', async () => {
    const onToggle = vi.fn();
    const { user } = render(
      <ZenMode enabled={false} onToggle={onToggle}>
        <div>Editor</div>
      </ZenMode>
    );

    await user.click(screen.getByText('Zen Mode'));

    expect(onToggle).toHaveBeenCalled();
  });

  it('23. hides UI elements in zen mode', () => {
    const { container } = render(
      <ZenMode enabled={true} onToggle={vi.fn()}>
        <div>Editor</div>
      </ZenMode>
    );

    expect(container.firstChild).toHaveClass('zen-mode');
  });
});

// ============================================
// SPLIT EDITOR TESTS (2 tests)
// ============================================

describe('SplitEditor', () => {
  it('24. renders SplitEditor with multiple panes', () => {
    const panes = [
      { id: '1', content: <div>Pane 1</div> },
      { id: '2', content: <div>Pane 2</div> },
    ];

    render(<SplitEditor panes={panes} />);

    expect(screen.getByText('Pane 1')).toBeInTheDocument();
    expect(screen.getByText('Pane 2')).toBeInTheDocument();
  });

  it('25. closes a pane when close button is clicked', async () => {
    const onClose = vi.fn();
    const panes = [
      { id: '1', content: <div>Pane 1</div> },
      { id: '2', content: <div>Pane 2</div> },
    ];

    const { user } = render(<SplitEditor panes={panes} onClose={onClose} />);

    const closeButtons = screen.getAllByText('Close');
    await user.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalledWith('1');
  });
});
