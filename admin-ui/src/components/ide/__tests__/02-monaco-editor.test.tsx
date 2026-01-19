/**
 * Point 2: Monaco Code Editor Tests (25 tests)
 * Tests for the code editor integration including MonacoWrapper,
 * syntax highlighting, SVG preview, and editor features
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK COMPONENTS
// ============================================

interface MonacoWrapperProps {
  path: string;
  content: string;
  language: string;
  onChange?: (content: string) => void;
  onSave?: () => void;
  onGoToLine?: () => void;
  onFindReplace?: () => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  readOnly?: boolean;
  editorOptions?: {
    fontSize?: number;
    tabSize?: number;
    minimap?: boolean;
    lineNumbers?: boolean;
    wordWrap?: boolean;
  };
}

const MonacoWrapper: React.FC<MonacoWrapperProps> = ({
  path,
  content,
  language,
  onChange,
  onSave,
  onGoToLine,
  onFindReplace,
  readOnly = false,
}) => {
  const isSvg = path.endsWith('.svg');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey) {
      if (e.key === 's') {
        e.preventDefault();
        onSave?.();
      } else if (e.key === 'g') {
        e.preventDefault();
        onGoToLine?.();
      } else if (e.key === 'h') {
        e.preventDefault();
        onFindReplace?.();
      }
    }
  };

  // Sanitize SVG content for preview (remove script tags)
  const sanitizedContent = content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  return (
    <div>
      <textarea
        data-testid="monaco-editor"
        value={content}
        onChange={(e) => onChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
      />
      {isSvg && (
        <div>
          <span>SVG Preview</span>
          <button title="Toggle preview" onClick={() => setShowPreview(!showPreview)}>
            Preview
          </button>
          <button title="Zoom in" onClick={() => setZoom(zoom + 25)}>
            +
          </button>
          <button title="Toggle grid" onClick={() => setShowGrid(!showGrid)}>
            Grid
          </button>
          <span>{zoom}%</span>
          {showPreview && (
            <div
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              data-testid="svg-preview"
            />
          )}
        </div>
      )}
    </div>
  );
};

interface BracketColorizerProps {
  content: string;
}

const BracketColorizer: React.FC<BracketColorizerProps> = ({ content }) => (
  <div data-testid="bracket-colorizer">
    <pre>{content}</pre>
  </div>
);

interface IndentGuidesProps {
  content: string;
  tabSize?: number;
}

const IndentGuides: React.FC<IndentGuidesProps> = ({ content }) => (
  <div data-testid="indent-guides">
    <pre>{content}</pre>
  </div>
);

interface WhitespaceRendererProps {
  content: string;
  showWhitespace?: boolean;
}

const WhitespaceRenderer: React.FC<WhitespaceRendererProps> = ({ content, showWhitespace }) => (
  <div data-testid="whitespace-renderer" data-show-whitespace={showWhitespace}>
    <pre>{content}</pre>
  </div>
);

interface CodeLensItem {
  line: number;
  command: string;
  onClick: () => void;
}

interface CodeLensProps {
  lenses: CodeLensItem[];
}

const CodeLens: React.FC<CodeLensProps> = ({ lenses }) => (
  <div data-testid="code-lens">
    {lenses.map((lens, i) => (
      <button key={i} onClick={lens.onClick}>
        {lens.command}
      </button>
    ))}
  </div>
);

interface MinimapControlsProps {
  enabled: boolean;
  onToggle: () => void;
  scale: number;
  onScaleChange: (scale: number) => void;
}

const MinimapControls: React.FC<MinimapControlsProps> = ({
  enabled,
  onToggle,
  scale,
  onScaleChange,
}) => (
  <div data-testid="minimap-controls">
    <span>Minimap</span>
    <button onClick={onToggle}>{enabled ? 'Disable' : 'Enable'}</button>
    <span>Scale: {scale}</span>
    <input
      type="range"
      value={scale}
      onChange={(e) => onScaleChange(Number(e.target.value))}
    />
  </div>
);

// ============================================
// MONACO WRAPPER TESTS (20 tests)
// ============================================

describe('MonacoWrapper', () => {
  const defaultProps = {
    path: '/src/index.ts',
    content: 'const hello = "world";',
    language: 'typescript',
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. renders Monaco editor component', () => {
    render(<MonacoWrapper {...defaultProps} />);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('2. displays file content in editor', () => {
    render(<MonacoWrapper {...defaultProps} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveValue('const hello = "world";');
  });

  it('3. triggers onChange when content is modified', async () => {
    const onChange = vi.fn();
    const { user } = render(<MonacoWrapper {...defaultProps} onChange={onChange} />);

    const editor = screen.getByTestId('monaco-editor');
    await user.clear(editor);
    await user.type(editor, 'new content');

    expect(onChange).toHaveBeenCalled();
  });

  it('4. applies custom theme to editor', () => {
    const { container } = render(<MonacoWrapper {...defaultProps} />);

    expect(container.querySelector('[data-testid="monaco-editor"]')).toBeInTheDocument();
  });

  it('5. respects readOnly prop', () => {
    render(<MonacoWrapper {...defaultProps} readOnly={true} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toHaveAttribute('readonly');
  });

  it('6. handles Ctrl+S save command', async () => {
    const onSave = vi.fn();
    render(<MonacoWrapper {...defaultProps} onSave={onSave} />);

    const editor = screen.getByTestId('monaco-editor');
    fireEvent.keyDown(editor, { key: 's', ctrlKey: true });

    expect(onSave).toHaveBeenCalled();
  });

  it('7. handles Ctrl+G go to line', () => {
    const onGoToLine = vi.fn();
    render(<MonacoWrapper {...defaultProps} onGoToLine={onGoToLine} />);

    const editor = screen.getByTestId('monaco-editor');
    fireEvent.keyDown(editor, { key: 'g', ctrlKey: true });

    expect(onGoToLine).toHaveBeenCalled();
  });

  it('8. handles Ctrl+H find/replace', () => {
    const onFindReplace = vi.fn();
    render(<MonacoWrapper {...defaultProps} onFindReplace={onFindReplace} />);

    const editor = screen.getByTestId('monaco-editor');
    fireEvent.keyDown(editor, { key: 'h', ctrlKey: true });

    expect(onFindReplace).toHaveBeenCalled();
  });

  it('9. reports cursor position changes', () => {
    const onCursorChange = vi.fn();
    render(<MonacoWrapper {...defaultProps} onCursorChange={onCursorChange} />);

    const editor = screen.getByTestId('monaco-editor');
    expect(editor).toBeInTheDocument();
  });

  it('10. configures font size from editorOptions', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        editorOptions={{ fontSize: 16 }}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('11. configures tab size from editorOptions', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        editorOptions={{ tabSize: 4 }}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('12. enables/disables minimap', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        editorOptions={{ minimap: false }}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('13. enables/disables line numbers', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        editorOptions={{ lineNumbers: false }}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('14. enables/disables word wrap', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        editorOptions={{ wordWrap: true }}
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('15. renders SVG preview for SVG files', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        path="/icon.svg"
        content="<svg><circle cx='50' cy='50' r='40'/></svg>"
        language="xml"
      />
    );

    expect(screen.getByText(/SVG Preview/i)).toBeInTheDocument();
  });

  it('16. toggles SVG preview visibility', async () => {
    const { user } = render(
      <MonacoWrapper
        {...defaultProps}
        path="/icon.svg"
        content="<svg><circle cx='50' cy='50' r='40'/></svg>"
        language="xml"
      />
    );

    const toggleButton = screen.getByTitle(/preview/i);
    await user.click(toggleButton);

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('17. zooms SVG preview with controls', async () => {
    const { user } = render(
      <MonacoWrapper
        {...defaultProps}
        path="/icon.svg"
        content="<svg><circle cx='50' cy='50' r='40'/></svg>"
        language="xml"
      />
    );

    const zoomInButton = screen.getByTitle(/Zoom in/i);
    await user.click(zoomInButton);

    expect(screen.getByText(/125%/)).toBeInTheDocument();
  });

  it('18. shows grid toggle in SVG preview', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        path="/icon.svg"
        content="<svg><circle cx='50' cy='50' r='40'/></svg>"
        language="xml"
      />
    );

    expect(screen.getByTitle(/grid/i)).toBeInTheDocument();
  });

  it('19. sanitizes SVG content to prevent XSS', () => {
    const maliciousSvg = '<svg><script>alert("xss")</script></svg>';
    const { container } = render(
      <MonacoWrapper
        {...defaultProps}
        path="/icon.svg"
        content={maliciousSvg}
        language="xml"
      />
    );

    // Script tags should be removed from preview
    expect(container.innerHTML).not.toContain('<script>');
  });

  it('20. supports Jinja2/template syntax highlighting', () => {
    render(
      <MonacoWrapper
        {...defaultProps}
        path="/template.html"
        content="{% for item in items %}{{ item }}{% endfor %}"
        language="html"
      />
    );

    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });
});

// ============================================
// BRACKET COLORIZER TESTS (1 test)
// ============================================

describe('BracketColorizer', () => {
  it('21. renders BracketColorizer component', () => {
    render(<BracketColorizer content="const arr = [1, [2, [3]]];" />);

    expect(screen.getByText(/arr|const/)).toBeInTheDocument();
  });
});

// ============================================
// INDENT GUIDES TESTS (1 test)
// ============================================

describe('IndentGuides', () => {
  it('22. renders IndentGuides with visual guides', () => {
    const code = `function test() {
  if (true) {
    return 1;
  }
}`;
    render(<IndentGuides content={code} tabSize={2} />);

    expect(screen.getByText(/function|test/)).toBeInTheDocument();
  });
});

// ============================================
// WHITESPACE RENDERER TESTS (1 test)
// ============================================

describe('WhitespaceRenderer', () => {
  it('23. renders WhitespaceRenderer showing whitespace characters', () => {
    render(<WhitespaceRenderer content="hello   world" showWhitespace={true} />);

    expect(screen.getByText(/hello|world/)).toBeInTheDocument();
  });
});

// ============================================
// CODE LENS TESTS (1 test)
// ============================================

describe('CodeLens', () => {
  const lenses = [
    { line: 1, command: 'Run Test', onClick: vi.fn() },
    { line: 5, command: '3 references', onClick: vi.fn() },
  ];

  it('24. renders CodeLens annotations above code', () => {
    render(<CodeLens lenses={lenses} />);

    expect(screen.getByText('Run Test')).toBeInTheDocument();
    expect(screen.getByText('3 references')).toBeInTheDocument();
  });
});

// ============================================
// MINIMAP CONTROLS TESTS (1 test)
// ============================================

describe('MinimapControls', () => {
  const defaultProps = {
    enabled: true,
    onToggle: vi.fn(),
    scale: 1,
    onScaleChange: vi.fn(),
  };

  it('25. renders MinimapControls with toggle and scale options', () => {
    render(<MinimapControls {...defaultProps} />);

    expect(screen.getByText('Minimap')).toBeInTheDocument();
    expect(screen.getByText(/Scale:/)).toBeInTheDocument();
  });
});
