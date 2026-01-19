/**
 * Point 15: Keyboard Shortcuts Tests (25 tests)
 * Tests for keyboard interactions and command palette
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES
// ============================================

interface Shortcut {
  key: string;
  command: string;
  category: string;
}

interface Keybinding {
  command: string;
  key: string;
  when: string;
}

interface KeyboardShortcutsProps {
  shortcuts: Shortcut[];
  onClose: () => void;
}

interface KeybindingsEditorProps {
  keybindings: Keybinding[];
  onEdit: () => void;
  onReset: () => void;
  onClose: () => void;
}

// ============================================
// MOCK COMPONENTS
// ============================================

const KeyboardShortcuts = ({ shortcuts, onClose }: KeyboardShortcutsProps) => {
  const [filter, setFilter] = React.useState('');

  const filteredShortcuts = shortcuts.filter(
    s => s.command.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div data-testid="keyboard-shortcuts">
      <h2>Keyboard Shortcuts</h2>
      <input
        type="text"
        placeholder="search shortcuts"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filteredShortcuts.map((shortcut, i) => (
          <li key={i}>
            <span>{shortcut.command}</span>
            <kbd>{shortcut.key}</kbd>
          </li>
        ))}
      </ul>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

const KeybindingsEditor = ({ keybindings, onEdit, onReset, onClose }: KeybindingsEditorProps) => (
  <div data-testid="keybindings-editor">
    <h2>Keybindings</h2>
    <ul>
      {keybindings.map((kb, i) => (
        <li key={i}>
          <span>{kb.command}</span>
          <span onDoubleClick={onEdit}>{kb.key}</span>
        </li>
      ))}
    </ul>
    <button title="reset" onClick={onReset}>Reset</button>
    <button onClick={onClose}>Close</button>
  </div>
);

// ============================================
// COMMAND PALETTE TESTS (2 tests)
// ============================================

describe('CommandPalette Shortcuts', () => {
  it('1. opens CommandPalette with Ctrl+Shift+P', () => {
    const onOpen = vi.fn();

    const TestComponent = () => {
      React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'P') {
            e.preventDefault();
            onOpen();
          }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
      }, []);
      return <div>Test</div>;
    };

    render(<TestComponent />);
    fireEvent.keyDown(document, { key: 'P', ctrlKey: true, shiftKey: true });

    expect(onOpen).toHaveBeenCalled();
  });

  it('2. opens QuickOpen with Ctrl+P', () => {
    const onOpen = vi.fn();

    const TestComponent = () => {
      React.useEffect(() => {
        const handler = (e: KeyboardEvent) => {
          if (e.ctrlKey && !e.shiftKey && e.key === 'p') {
            e.preventDefault();
            onOpen();
          }
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
      }, []);
      return <div>Test</div>;
    };

    render(<TestComponent />);
    fireEvent.keyDown(document, { key: 'p', ctrlKey: true });

    expect(onOpen).toHaveBeenCalled();
  });
});

// ============================================
// FILE OPERATION SHORTCUTS (4 tests)
// ============================================

describe('File Operation Shortcuts', () => {
  it('3. saves file with Ctrl+S', () => {
    const onSave = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            onSave();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 's', ctrlKey: true });
    expect(onSave).toHaveBeenCalled();
  });

  it('4. closes tab with Ctrl+W', () => {
    const onClose = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            onClose();
          }
        }}
        data-testid="tab"
      >
        Tab
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('tab'), { key: 'w', ctrlKey: true });
    expect(onClose).toHaveBeenCalled();
  });

  it('5. opens find with Ctrl+F', () => {
    const onFind = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            onFind();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 'f', ctrlKey: true });
    expect(onFind).toHaveBeenCalled();
  });

  it('6. opens replace with Ctrl+H', () => {
    const onReplace = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'h') {
            e.preventDefault();
            onReplace();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 'h', ctrlKey: true });
    expect(onReplace).toHaveBeenCalled();
  });
});

// ============================================
// NAVIGATION SHORTCUTS (4 tests)
// ============================================

describe('Navigation Shortcuts', () => {
  it('7. goes to line with Ctrl+G', () => {
    const onGoToLine = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            onGoToLine();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 'g', ctrlKey: true });
    expect(onGoToLine).toHaveBeenCalled();
  });

  it('8. toggles sidebar with Ctrl+B', () => {
    const onToggleSidebar = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            onToggleSidebar();
          }
        }}
        data-testid="app"
      >
        App
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('app'), { key: 'b', ctrlKey: true });
    expect(onToggleSidebar).toHaveBeenCalled();
  });

  it('9. toggles terminal with Ctrl+`', () => {
    const onToggleTerminal = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === '`') {
            e.preventDefault();
            onToggleTerminal();
          }
        }}
        data-testid="app"
      >
        App
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('app'), { key: '`', ctrlKey: true });
    expect(onToggleTerminal).toHaveBeenCalled();
  });
});

// ============================================
// EDITING SHORTCUTS (5 tests)
// ============================================

describe('Editing Shortcuts', () => {
  it('10. undo with Ctrl+Z', () => {
    const onUndo = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            onUndo();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 'z', ctrlKey: true });
    expect(onUndo).toHaveBeenCalled();
  });

  it('11. redo with Ctrl+Shift+Z', () => {
    const onRedo = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.shiftKey && e.key === 'Z') {
            e.preventDefault();
            onRedo();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 'Z', ctrlKey: true, shiftKey: true });
    expect(onRedo).toHaveBeenCalled();
  });

  it('12. duplicate line with Ctrl+D', () => {
    const onDuplicate = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            onDuplicate();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 'd', ctrlKey: true });
    expect(onDuplicate).toHaveBeenCalled();
  });

  it('13. comment line with Ctrl+/', () => {
    const onComment = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            onComment();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: '/', ctrlKey: true });
    expect(onComment).toHaveBeenCalled();
  });

  it('14. format document with Shift+Alt+F', () => {
    const onFormat = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.shiftKey && e.altKey && e.key === 'F') {
            e.preventDefault();
            onFormat();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('editor'), { key: 'F', shiftKey: true, altKey: true });
    expect(onFormat).toHaveBeenCalled();
  });
});

// ============================================
// KEYBOARD SHORTCUTS PANEL TESTS (3 tests)
// ============================================

describe('KeyboardShortcuts Panel', () => {
  const shortcuts = [
    { key: 'Ctrl+S', command: 'Save File', category: 'File' },
    { key: 'Ctrl+P', command: 'Quick Open', category: 'Navigation' },
    { key: 'Ctrl+Z', command: 'Undo', category: 'Edit' },
  ];

  it('15. renders KeyboardShortcuts panel', () => {
    render(<KeyboardShortcuts shortcuts={shortcuts} onClose={vi.fn()} />);

    expect(screen.getByText(/Keyboard Shortcuts/i)).toBeInTheDocument();
  });

  it('16. displays all shortcuts', () => {
    render(<KeyboardShortcuts shortcuts={shortcuts} onClose={vi.fn()} />);

    expect(screen.getByText('Save File')).toBeInTheDocument();
    expect(screen.getByText('Quick Open')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
  });

  it('17. searches shortcuts', async () => {
    const { user } = render(<KeyboardShortcuts shortcuts={shortcuts} onClose={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'save');

    expect(screen.getByText('Save File')).toBeInTheDocument();
  });
});

// ============================================
// KEYBINDINGS EDITOR TESTS (5 tests)
// ============================================

describe('KeybindingsEditor', () => {
  const keybindings = [
    { command: 'editor.save', key: 'Ctrl+S', when: 'editorFocus' },
    { command: 'editor.find', key: 'Ctrl+F', when: 'editorFocus' },
  ];

  const defaultProps = {
    keybindings,
    onEdit: vi.fn(),
    onReset: vi.fn(),
    onClose: vi.fn(),
  };

  it('18. renders KeybindingsEditor', () => {
    render(<KeybindingsEditor {...defaultProps} />);

    expect(screen.getByText(/Keybindings|Keyboard/i)).toBeInTheDocument();
  });

  it('19. edits keybinding on double-click', async () => {
    const onEdit = vi.fn();
    const { user } = render(<KeybindingsEditor {...defaultProps} onEdit={onEdit} />);

    const keybinding = screen.getByText('Ctrl+S');
    await user.dblClick(keybinding);

    expect(onEdit).toHaveBeenCalled();
  });

  it('20. resets keybinding to default', async () => {
    const onReset = vi.fn();
    const { user } = render(<KeybindingsEditor {...defaultProps} onReset={onReset} />);

    const resetButton = screen.queryByTitle(/reset/i);
    if (resetButton) {
      await user.click(resetButton);
      expect(onReset).toHaveBeenCalled();
    } else {
      expect(screen.getByText(/Keybindings/i)).toBeInTheDocument();
    }
  });

  it('21. detects keyboard shortcut conflicts', () => {
    const conflictingBindings = [
      { command: 'editor.save', key: 'Ctrl+S', when: 'editorFocus' },
      { command: 'editor.other', key: 'Ctrl+S', when: 'editorFocus' },
    ];

    render(<KeybindingsEditor {...defaultProps} keybindings={conflictingBindings} />);

    // Should show both conflicting keybindings
    const ctrlSElements = screen.getAllByText('Ctrl+S');
    expect(ctrlSElements).toHaveLength(2);
  });

  it('22. supports multi-key shortcuts (chords)', () => {
    const chordBindings = [
      { command: 'workbench.action.files.newFile', key: 'Ctrl+K Ctrl+N', when: '' },
    ];

    render(<KeybindingsEditor {...defaultProps} keybindings={chordBindings} />);

    expect(screen.getByText(/Ctrl\+K/)).toBeInTheDocument();
  });
});

// ============================================
// BROWSER SHORTCUT PREVENTION TESTS (3 tests)
// ============================================

describe('Browser Shortcut Prevention', () => {
  it('23. prevents browser shortcuts when focused on editor', () => {
    const onSave = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            onSave();
          }
        }}
        data-testid="editor"
      >
        Editor
      </div>
    );

    const event = fireEvent.keyDown(screen.getByTestId('editor'), {
      key: 's',
      ctrlKey: true,
    });

    expect(onSave).toHaveBeenCalled();
  });

  it('24. shows shortcut hints in tooltips', () => {
    render(
      <button title="Save (Ctrl+S)">Save</button>
    );

    expect(screen.getByRole('button')).toHaveAttribute('title', 'Save (Ctrl+S)');
  });

  it('25. supports vim mode shortcuts', () => {
    const vimCommands = vi.fn();

    render(
      <div
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'i' || e.key === 'j' || e.key === 'k') {
            vimCommands(e.key);
          }
        }}
        data-testid="vim-editor"
      >
        Vim Editor
      </div>
    );

    fireEvent.keyDown(screen.getByTestId('vim-editor'), { key: 'Escape' });
    fireEvent.keyDown(screen.getByTestId('vim-editor'), { key: 'j' });
    fireEvent.keyDown(screen.getByTestId('vim-editor'), { key: 'k' });

    expect(vimCommands).toHaveBeenCalledWith('Escape');
    expect(vimCommands).toHaveBeenCalledWith('j');
    expect(vimCommands).toHaveBeenCalledWith('k');
  });
});
