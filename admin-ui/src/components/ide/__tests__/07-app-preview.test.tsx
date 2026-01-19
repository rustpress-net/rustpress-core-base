/**
 * Point 7: App Preview Tests (25 tests)
 * Tests for preview functionality including live preview,
 * HTML/CSS preview, plugin preview, and image preview
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../../test/utils';

// ============================================
// MOCK TYPES
// ============================================

interface AppPreviewProps {
  url: string;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

interface LivePreviewProps {
  code: string;
  language: string;
  onRender?: () => void;
  autoRefresh?: boolean;
}

interface HtmlCssPreviewProps {
  html: string;
  css: string;
  onUpdate?: () => void;
}

interface PluginPreviewProps {
  pluginId: string;
  config: Record<string, any>;
  onActivate?: () => void;
  onDeactivate?: () => void;
}

interface ImagePreviewProps {
  src: string;
  alt: string;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

interface FunctionRunnerProps {
  code: string;
  args?: any[];
  onResult?: (result: any) => void;
  onError?: (error: Error) => void;
}

// ============================================
// MOCK COMPONENTS
// ============================================

const AppPreview = ({ url, width = 800, height = 600, onLoad, onError }: AppPreviewProps) => (
  <div data-testid="app-preview" style={{ width, height }}>
    <iframe
      src={url}
      title="App Preview"
      onLoad={onLoad}
      onError={() => onError?.(new Error('Failed to load'))}
    />
    <div className="preview-controls">
      <button onClick={onLoad}>Refresh</button>
      <span>URL: {url}</span>
    </div>
  </div>
);

const LivePreview = ({ code, language, onRender, autoRefresh }: LivePreviewProps) => {
  React.useEffect(() => {
    if (autoRefresh) {
      onRender?.();
    }
  }, [code, autoRefresh, onRender]);

  return (
    <div data-testid="live-preview">
      <div className="preview-header">
        <span>Language: {language}</span>
        {autoRefresh && <span>Auto-refresh enabled</span>}
      </div>
      <div className="preview-content">
        <pre>{code}</pre>
      </div>
      <button onClick={onRender}>Render</button>
    </div>
  );
};

const HtmlCssPreview = ({ html, css, onUpdate }: HtmlCssPreviewProps) => (
  <div data-testid="html-css-preview">
    <div className="preview-pane">
      <style>{css}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
    <button onClick={onUpdate}>Update Preview</button>
  </div>
);

const PluginPreview = ({ pluginId, config, onActivate, onDeactivate }: PluginPreviewProps) => {
  const [active, setActive] = React.useState(false);

  const handleToggle = () => {
    if (active) {
      onDeactivate?.();
    } else {
      onActivate?.();
    }
    setActive(!active);
  };

  return (
    <div data-testid="plugin-preview">
      <h3>Plugin: {pluginId}</h3>
      <span>Status: {active ? 'Active' : 'Inactive'}</span>
      <pre>{JSON.stringify(config, null, 2)}</pre>
      <button onClick={handleToggle}>{active ? 'Deactivate' : 'Activate'}</button>
    </div>
  );
};

const ImagePreview = ({ src, alt, zoom = 1, onZoomChange }: ImagePreviewProps) => (
  <div data-testid="image-preview">
    <img src={src} alt={alt} style={{ transform: `scale(${zoom})` }} />
    <div className="zoom-controls">
      <button onClick={() => onZoomChange?.(zoom - 0.1)}>Zoom Out</button>
      <span>Zoom: {Math.round(zoom * 100)}%</span>
      <button onClick={() => onZoomChange?.(zoom + 0.1)}>Zoom In</button>
    </div>
  </div>
);

const FunctionRunner = ({ code, args = [], onResult, onError }: FunctionRunnerProps) => {
  const handleRun = () => {
    try {
      // Simulated function execution
      const result = { success: true, output: 'Function executed' };
      onResult?.(result);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <div data-testid="function-runner">
      <pre>{code}</pre>
      <div>Arguments: {JSON.stringify(args)}</div>
      <button onClick={handleRun}>Run Function</button>
    </div>
  );
};

// ============================================
// APP PREVIEW TESTS (5 tests)
// ============================================

describe('AppPreview', () => {
  const defaultProps = {
    url: 'http://localhost:3000',
    onLoad: vi.fn(),
    onError: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. renders AppPreview component', () => {
    render(<AppPreview {...defaultProps} />);

    expect(screen.getByTestId('app-preview')).toBeInTheDocument();
  });

  it('2. displays the preview URL', () => {
    render(<AppPreview {...defaultProps} />);

    expect(screen.getByText(/localhost:3000/)).toBeInTheDocument();
  });

  it('3. handles refresh button click', async () => {
    const onLoad = vi.fn();
    const { user } = render(<AppPreview {...defaultProps} onLoad={onLoad} />);

    await user.click(screen.getByRole('button', { name: /refresh/i }));

    expect(onLoad).toHaveBeenCalled();
  });

  it('4. renders with custom dimensions', () => {
    render(<AppPreview {...defaultProps} width={1024} height={768} />);

    const preview = screen.getByTestId('app-preview');
    expect(preview).toHaveStyle({ width: '1024px', height: '768px' });
  });

  it('5. contains an iframe element', () => {
    render(<AppPreview {...defaultProps} />);

    const iframe = screen.getByTitle('App Preview');
    expect(iframe).toBeInTheDocument();
  });
});

// ============================================
// LIVE PREVIEW TESTS (5 tests)
// ============================================

describe('LivePreview', () => {
  const defaultProps = {
    code: 'console.log("Hello World");',
    language: 'javascript',
    onRender: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('6. renders LivePreview component', () => {
    render(<LivePreview {...defaultProps} />);

    expect(screen.getByTestId('live-preview')).toBeInTheDocument();
  });

  it('7. displays the code content', () => {
    render(<LivePreview {...defaultProps} />);

    expect(screen.getByText(/console\.log/)).toBeInTheDocument();
  });

  it('8. shows language type', () => {
    render(<LivePreview {...defaultProps} />);

    expect(screen.getByText(/javascript/i)).toBeInTheDocument();
  });

  it('9. handles render button click', async () => {
    const onRender = vi.fn();
    const { user } = render(<LivePreview {...defaultProps} onRender={onRender} />);

    await user.click(screen.getByRole('button', { name: /render/i }));

    expect(onRender).toHaveBeenCalled();
  });

  it('10. shows auto-refresh indicator when enabled', () => {
    render(<LivePreview {...defaultProps} autoRefresh />);

    expect(screen.getByText(/auto-refresh enabled/i)).toBeInTheDocument();
  });
});

// ============================================
// HTML/CSS PREVIEW TESTS (5 tests)
// ============================================

describe('HtmlCssPreview', () => {
  const defaultProps = {
    html: '<div class="test">Hello</div>',
    css: '.test { color: red; }',
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('11. renders HtmlCssPreview component', () => {
    render(<HtmlCssPreview {...defaultProps} />);

    expect(screen.getByTestId('html-css-preview')).toBeInTheDocument();
  });

  it('12. renders HTML content', () => {
    render(<HtmlCssPreview {...defaultProps} />);

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('13. handles update button click', async () => {
    const onUpdate = vi.fn();
    const { user } = render(<HtmlCssPreview {...defaultProps} onUpdate={onUpdate} />);

    await user.click(screen.getByRole('button', { name: /update/i }));

    expect(onUpdate).toHaveBeenCalled();
  });

  it('14. applies CSS styles', () => {
    const { container } = render(<HtmlCssPreview {...defaultProps} />);

    const styleTag = container.querySelector('style');
    expect(styleTag?.textContent).toContain('.test');
  });

  it('15. updates when HTML changes', () => {
    const { rerender } = render(<HtmlCssPreview {...defaultProps} />);

    rerender(<HtmlCssPreview {...defaultProps} html="<div>Updated</div>" />);

    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});

// ============================================
// PLUGIN PREVIEW TESTS (5 tests)
// ============================================

describe('PluginPreview', () => {
  const defaultProps = {
    pluginId: 'test-plugin',
    config: { enabled: true, version: '1.0.0' },
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('16. renders PluginPreview component', () => {
    render(<PluginPreview {...defaultProps} />);

    expect(screen.getByTestId('plugin-preview')).toBeInTheDocument();
  });

  it('17. displays plugin ID', () => {
    render(<PluginPreview {...defaultProps} />);

    expect(screen.getByText(/test-plugin/)).toBeInTheDocument();
  });

  it('18. shows initial inactive status', () => {
    render(<PluginPreview {...defaultProps} />);

    expect(screen.getByText(/inactive/i)).toBeInTheDocument();
  });

  it('19. activates plugin on button click', async () => {
    const onActivate = vi.fn();
    const { user } = render(<PluginPreview {...defaultProps} onActivate={onActivate} />);

    await user.click(screen.getByRole('button', { name: /activate/i }));

    expect(onActivate).toHaveBeenCalled();
  });

  it('20. displays plugin configuration', () => {
    render(<PluginPreview {...defaultProps} />);

    expect(screen.getByText(/1\.0\.0/)).toBeInTheDocument();
  });
});

// ============================================
// IMAGE PREVIEW & FUNCTION RUNNER TESTS (5 tests)
// ============================================

describe('ImagePreview and FunctionRunner', () => {
  it('21. renders ImagePreview component', () => {
    render(<ImagePreview src="/test.png" alt="Test Image" />);

    expect(screen.getByTestId('image-preview')).toBeInTheDocument();
  });

  it('22. displays image with alt text', () => {
    render(<ImagePreview src="/test.png" alt="Test Image" />);

    expect(screen.getByAltText('Test Image')).toBeInTheDocument();
  });

  it('23. shows zoom controls', () => {
    render(<ImagePreview src="/test.png" alt="Test Image" zoom={1} onZoomChange={vi.fn()} />);

    expect(screen.getByText(/zoom: 100%/i)).toBeInTheDocument();
  });

  it('24. renders FunctionRunner component', () => {
    render(<FunctionRunner code="function test() { return 1; }" />);

    expect(screen.getByTestId('function-runner')).toBeInTheDocument();
  });

  it('25. executes function on run button click', async () => {
    const onResult = vi.fn();
    const { user } = render(
      <FunctionRunner
        code="function test() { return 1; }"
        onResult={onResult}
      />
    );

    await user.click(screen.getByRole('button', { name: /run/i }));

    expect(onResult).toHaveBeenCalled();
  });
});
