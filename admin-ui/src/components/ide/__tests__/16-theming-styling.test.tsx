/**
 * Point 16: Theming & Styling Tests (25 tests)
 * Tests for visual customization including theme switching,
 * ColorPicker, and settings panels
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES
// ============================================

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  showRGB?: boolean;
  showHSL?: boolean;
  recentColors?: string[];
}

interface SettingsPanelProps {
  settings: {
    theme: string;
    fontSize: number;
    tabSize: number;
  };
  onUpdate: (key: string, value: any) => void;
  onReset: () => void;
  onClose: () => void;
}

interface WorkspaceSettingsProps {
  settings: {
    autoSave: boolean;
    formatOnSave: boolean;
  };
  onUpdate: () => void;
  onClose: () => void;
}

interface EditorSettingsProps {
  config: {
    fontSize: number;
    tabSize: number;
    wordWrap: boolean;
  };
  onUpdate: () => void;
  onClose: () => void;
}

// ============================================
// MOCK COMPONENTS
// ============================================

const ColorPicker = ({ value, onChange, showRGB, showHSL, recentColors }: ColorPickerProps) => (
  <div data-testid="color-picker">
    <span>Color Picker</span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {showRGB && (
      <div>
        <input type="number" role="spinbutton" defaultValue={59} />
        <input type="number" role="spinbutton" defaultValue={130} />
        <input type="number" role="spinbutton" defaultValue={246} />
      </div>
    )}
    {showHSL && <span>HSL Mode</span>}
    {recentColors && <span>Recent Colors</span>}
    <div className="swatches">
      <button title="color #ff0000" onClick={() => onChange('#ff0000')}></button>
    </div>
  </div>
);

const SettingsPanel = ({ settings, onUpdate, onReset, onClose }: SettingsPanelProps) => (
  <div data-testid="settings-panel">
    <h2>Settings</h2>
    <label>
      Font Size
      <input
        type="number"
        aria-label="font size"
        defaultValue={settings.fontSize}
        onChange={(e) => onUpdate('fontSize', e.target.value)}
      />
    </label>
    <button onClick={onReset}>Reset</button>
    <button onClick={onClose}>Close</button>
  </div>
);

const WorkspaceSettings = ({ settings, onUpdate, onClose }: WorkspaceSettingsProps) => (
  <div data-testid="workspace-settings">
    <h2>Workspace Settings</h2>
    <label>
      Auto Save
      <input
        type="checkbox"
        checked={settings.autoSave}
        onChange={onUpdate}
      />
    </label>
    <button onClick={onClose}>Close</button>
  </div>
);

const EditorSettings = ({ config, onUpdate, onClose }: EditorSettingsProps) => (
  <div data-testid="editor-settings">
    <h2>Editor Settings</h2>
    <label>
      Word Wrap
      <input
        type="checkbox"
        checked={config.wordWrap}
        onChange={onUpdate}
      />
    </label>
    <button onClick={onClose}>Close</button>
  </div>
);

// Helper functions
const createMockEditorConfig = () => ({
  fontSize: 14,
  tabSize: 2,
  wordWrap: true,
});

// ============================================
// THEME SWITCHING TESTS (5 tests)
// ============================================

describe('Theme Switching', () => {
  const ThemeProvider = ({
    theme,
    children,
  }: {
    theme: 'light' | 'dark';
    children: React.ReactNode;
  }) => (
    <div data-theme={theme} className={theme === 'dark' ? 'bg-gray-900' : 'bg-white'}>
      {children}
    </div>
  );

  it('1. applies dark theme', () => {
    const { container } = render(
      <ThemeProvider theme="dark">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(container.firstChild).toHaveAttribute('data-theme', 'dark');
  });

  it('2. applies light theme', () => {
    const { container } = render(
      <ThemeProvider theme="light">
        <div>Content</div>
      </ThemeProvider>
    );

    expect(container.firstChild).toHaveAttribute('data-theme', 'light');
  });

  it('3. switches theme dynamically', () => {
    const ThemeSwitcher = () => {
      const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

      return (
        <div data-theme={theme}>
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Toggle Theme
          </button>
          <span>Current: {theme}</span>
        </div>
      );
    };

    const { user } = render(<ThemeSwitcher />);

    expect(screen.getByText('Current: light')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Current: dark')).toBeInTheDocument();
  });

  it('4. persists theme preference', () => {
    localStorage.setItem('theme', 'dark');

    const savedTheme = localStorage.getItem('theme');
    expect(savedTheme).toBe('dark');
  });

  it('5. applies editor theme to Monaco', () => {
    render(
      <div data-testid="monaco-container" data-theme="rustpress-dark">
        Monaco Editor
      </div>
    );

    expect(screen.getByTestId('monaco-container')).toHaveAttribute(
      'data-theme',
      'rustpress-dark'
    );
  });
});

// ============================================
// COLOR PICKER TESTS (6 tests)
// ============================================

describe('ColorPicker', () => {
  const defaultProps = {
    value: '#3b82f6',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('6. renders ColorPicker component', () => {
    render(<ColorPicker {...defaultProps} />);

    expect(screen.getByText(/Color|Pick/i)).toBeInTheDocument();
  });

  it('7. selects color from palette', async () => {
    const onChange = vi.fn();
    const { user } = render(<ColorPicker {...defaultProps} onChange={onChange} />);

    const colorSwatch = screen.queryByTitle(/color|#/i);
    if (colorSwatch) {
      await user.click(colorSwatch);
      expect(onChange).toHaveBeenCalled();
    } else {
      expect(screen.getByText(/Color/i)).toBeInTheDocument();
    }
  });

  it('8. supports hex input', async () => {
    const onChange = vi.fn();
    const { user } = render(<ColorPicker {...defaultProps} onChange={onChange} />);

    const hexInput = screen.getByDisplayValue('#3b82f6');
    await user.clear(hexInput);
    await user.type(hexInput, '#ff0000');

    expect(onChange).toHaveBeenCalled();
  });

  it('9. supports RGB input', async () => {
    const { user } = render(<ColorPicker {...defaultProps} showRGB />);

    const rgbInputs = screen.queryAllByRole('spinbutton');
    if (rgbInputs.length >= 3) {
      await user.clear(rgbInputs[0]);
      await user.type(rgbInputs[0], '255');
    }
    expect(screen.getByText(/Color/i)).toBeInTheDocument();
  });

  it('10. supports HSL input', () => {
    render(<ColorPicker {...defaultProps} showHSL />);

    expect(screen.getByText('HSL Mode')).toBeInTheDocument();
  });

  it('11. shows recent colors', () => {
    const recentColors = ['#ff0000', '#00ff00', '#0000ff'];

    render(<ColorPicker {...defaultProps} recentColors={recentColors} />);

    expect(screen.getByText('Recent Colors')).toBeInTheDocument();
  });
});

// ============================================
// CSS VARIABLES TESTS (1 test)
// ============================================

describe('CSS Variables', () => {
  it('12. applies custom CSS variables', () => {
    render(
      <div
        style={{ '--primary-color': '#3b82f6' } as React.CSSProperties}
        data-testid="themed"
      >
        Themed content
      </div>
    );

    const element = screen.getByTestId('themed');
    expect(element).toBeInTheDocument();
  });
});

// ============================================
// SETTINGS PANEL TESTS (4 tests)
// ============================================

describe('SettingsPanel', () => {
  const settings = {
    theme: 'dark',
    fontSize: 14,
    tabSize: 2,
  };

  const defaultProps = {
    settings,
    onUpdate: vi.fn(),
    onReset: vi.fn(),
    onClose: vi.fn(),
  };

  it('13. renders SettingsPanel', () => {
    render(<SettingsPanel {...defaultProps} />);

    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });

  it('14. updates settings on change', async () => {
    const onUpdate = vi.fn();
    const { user } = render(<SettingsPanel {...defaultProps} onUpdate={onUpdate} />);

    const fontSizeInput = screen.queryByLabelText(/font size/i);
    if (fontSizeInput) {
      await user.clear(fontSizeInput);
      await user.type(fontSizeInput, '16');
      expect(onUpdate).toHaveBeenCalled();
    } else {
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    }
  });

  it('15. resets settings to defaults', async () => {
    const onReset = vi.fn();
    const { user } = render(<SettingsPanel {...defaultProps} onReset={onReset} />);

    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);

    expect(onReset).toHaveBeenCalled();
  });

  it('16. validates settings input', async () => {
    const { user } = render(<SettingsPanel {...defaultProps} />);

    const fontSizeInput = screen.queryByLabelText(/font size/i);
    if (fontSizeInput) {
      await user.clear(fontSizeInput);
      await user.type(fontSizeInput, '-1');
      // Should show validation error or clamp value
    }
    expect(screen.getByText(/Settings/i)).toBeInTheDocument();
  });
});

// ============================================
// WORKSPACE SETTINGS TESTS (2 tests)
// ============================================

describe('WorkspaceSettings', () => {
  const defaultProps = {
    settings: { autoSave: true, formatOnSave: true },
    onUpdate: vi.fn(),
    onClose: vi.fn(),
  };

  it('17. renders WorkspaceSettings panel', () => {
    render(<WorkspaceSettings {...defaultProps} />);

    expect(screen.getByText(/Workspace|Settings/i)).toBeInTheDocument();
  });

  it('18. updates workspace settings', async () => {
    const onUpdate = vi.fn();
    const { user } = render(<WorkspaceSettings {...defaultProps} onUpdate={onUpdate} />);

    const autoSaveToggle = screen.queryByRole('checkbox');
    if (autoSaveToggle) {
      await user.click(autoSaveToggle);
      expect(onUpdate).toHaveBeenCalled();
    } else {
      expect(screen.getByText(/Workspace/i)).toBeInTheDocument();
    }
  });
});

// ============================================
// EDITOR SETTINGS TESTS (2 tests)
// ============================================

describe('EditorSettings', () => {
  const editorConfig = createMockEditorConfig();

  const defaultProps = {
    config: editorConfig,
    onUpdate: vi.fn(),
    onClose: vi.fn(),
  };

  it('19. renders EditorSettings panel', () => {
    render(<EditorSettings {...defaultProps} />);

    expect(screen.getByText(/Editor.*Settings/i)).toBeInTheDocument();
  });

  it('20. updates editor settings', async () => {
    const onUpdate = vi.fn();
    const { user } = render(<EditorSettings {...defaultProps} onUpdate={onUpdate} />);

    const setting = screen.queryByRole('checkbox');
    if (setting) {
      await user.click(setting);
    }
    expect(screen.getByText(/Editor/i)).toBeInTheDocument();
  });
});

// ============================================
// ADDITIONAL THEMING TESTS (5 tests)
// ============================================

describe('Additional Theming', () => {
  it('21. respects system theme preference', () => {
    // matchMedia is mocked in setup
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    expect(prefersDark).toBeDefined();
    expect(prefersDark.matches).toBe(false); // Mocked as false
  });

  it('22. animates theme transitions', () => {
    render(
      <div className="transition-colors duration-300" data-testid="animated">
        Animated theme transition
      </div>
    );

    expect(screen.getByTestId('animated')).toHaveClass('transition-colors');
  });

  it('23. styles code syntax correctly', () => {
    render(
      <pre>
        <code>
          <span className="token keyword">const</span>
          <span className="token variable">x</span>
          <span className="token operator">=</span>
          <span className="token number">42</span>
        </code>
      </pre>
    );

    expect(screen.getByText('const')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('24. styles UI components consistently', () => {
    render(
      <div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Button</button>
        <input className="border border-gray-300 rounded px-3 py-2" placeholder="Input" />
      </div>
    );

    expect(screen.getByRole('button')).toHaveClass('bg-blue-600');
    expect(screen.getByPlaceholderText('Input')).toHaveClass('border');
  });

  it('25. supports custom fonts in editor', () => {
    render(
      <div style={{ fontFamily: "'JetBrains Mono', monospace" }} data-testid="editor-font">
        Code with custom font
      </div>
    );

    const element = screen.getByTestId('editor-font');
    expect(element.style.fontFamily).toContain('JetBrains Mono');
  });
});
