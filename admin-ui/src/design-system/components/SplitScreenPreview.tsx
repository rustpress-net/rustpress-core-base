import React, { useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// SPLIT SCREEN PREVIEW - COMPONENT 8 OF 10 (POST EDITOR ENHANCEMENTS)
// Live preview panel, side-by-side editor/preview, responsive preview modes
// ============================================================================

// Types
export type PreviewMode = 'desktop' | 'tablet' | 'mobile' | 'full';
export type LayoutMode = 'split' | 'preview' | 'editor' | 'overlay';
export type SplitOrientation = 'horizontal' | 'vertical';

export interface PreviewDevice {
  name: string;
  width: number;
  height: number;
  icon: string;
}

export interface SplitScreenConfig {
  defaultLayout: LayoutMode;
  defaultPreviewMode: PreviewMode;
  splitRatio: number;
  orientation: SplitOrientation;
  showDeviceFrame: boolean;
  livePreview: boolean;
  previewDelay: number;
  syncScroll: boolean;
}

interface SplitScreenContextValue {
  config: SplitScreenConfig;
  layout: LayoutMode;
  previewMode: PreviewMode;
  splitRatio: number;
  isScrollSynced: boolean;
  setLayout: (layout: LayoutMode) => void;
  setPreviewMode: (mode: PreviewMode) => void;
  setSplitRatio: (ratio: number) => void;
  toggleScrollSync: () => void;
  updateConfig: (config: Partial<SplitScreenConfig>) => void;
}

// Preset devices
export const previewDevices: Record<PreviewMode, PreviewDevice> = {
  desktop: { name: 'Desktop', width: 1440, height: 900, icon: '🖥️' },
  tablet: { name: 'Tablet', width: 768, height: 1024, icon: '📱' },
  mobile: { name: 'Mobile', width: 375, height: 812, icon: '📱' },
  full: { name: 'Full Width', width: 0, height: 0, icon: '⬜' },
};

const defaultConfig: SplitScreenConfig = {
  defaultLayout: 'split',
  defaultPreviewMode: 'desktop',
  splitRatio: 50,
  orientation: 'horizontal',
  showDeviceFrame: true,
  livePreview: true,
  previewDelay: 300,
  syncScroll: true,
};

const SplitScreenContext = createContext<SplitScreenContextValue | null>(null);

// ============================================================================
// SPLIT SCREEN PROVIDER
// ============================================================================

interface SplitScreenProviderProps {
  children: React.ReactNode;
  initialConfig?: Partial<SplitScreenConfig>;
}

export const SplitScreenProvider: React.FC<SplitScreenProviderProps> = ({
  children,
  initialConfig,
}) => {
  const [config, setConfig] = useState<SplitScreenConfig>({ ...defaultConfig, ...initialConfig });
  const [layout, setLayout] = useState<LayoutMode>(config.defaultLayout);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(config.defaultPreviewMode);
  const [splitRatio, setSplitRatio] = useState(config.splitRatio);
  const [isScrollSynced, setIsScrollSynced] = useState(config.syncScroll);

  const updateConfig = useCallback((updates: Partial<SplitScreenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleScrollSync = useCallback(() => {
    setIsScrollSynced(prev => !prev);
  }, []);

  const value: SplitScreenContextValue = {
    config,
    layout,
    previewMode,
    splitRatio,
    isScrollSynced,
    setLayout,
    setPreviewMode,
    setSplitRatio,
    toggleScrollSync,
    updateConfig,
  };

  return (
    <SplitScreenContext.Provider value={value}>
      {children}
    </SplitScreenContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useSplitScreen = (): SplitScreenContextValue => {
  const context = useContext(SplitScreenContext);
  if (!context) {
    throw new Error('useSplitScreen must be used within a SplitScreenProvider');
  }
  return context;
};

// ============================================================================
// SPLIT SCREEN LAYOUT
// ============================================================================

interface SplitScreenLayoutProps {
  editor: React.ReactNode;
  preview: React.ReactNode;
  className?: string;
}

export const SplitScreenLayout: React.FC<SplitScreenLayoutProps> = ({
  editor,
  preview,
  className = '',
}) => {
  const { layout, splitRatio, setSplitRatio, config, isScrollSynced } = useSplitScreen();
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorScrollRef = useRef<HTMLDivElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<'editor' | 'preview' | null>(null);

  const isHorizontal = config.orientation === 'horizontal';

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      let ratio: number;

      if (isHorizontal) {
        ratio = ((e.clientX - rect.left) / rect.width) * 100;
      } else {
        ratio = ((e.clientY - rect.top) / rect.height) * 100;
      }

      setSplitRatio(Math.max(20, Math.min(80, ratio)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isHorizontal, setSplitRatio]);

  // Scroll sync
  useEffect(() => {
    if (!isScrollSynced) return;

    const handleEditorScroll = () => {
      if (scrollingRef.current === 'preview') return;
      scrollingRef.current = 'editor';

      const editor = editorScrollRef.current;
      const preview = previewScrollRef.current;
      if (!editor || !preview) return;

      const scrollRatio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
      preview.scrollTop = scrollRatio * (preview.scrollHeight - preview.clientHeight);

      setTimeout(() => {
        scrollingRef.current = null;
      }, 50);
    };

    const handlePreviewScroll = () => {
      if (scrollingRef.current === 'editor') return;
      scrollingRef.current = 'preview';

      const editor = editorScrollRef.current;
      const preview = previewScrollRef.current;
      if (!editor || !preview) return;

      const scrollRatio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
      editor.scrollTop = scrollRatio * (editor.scrollHeight - editor.clientHeight);

      setTimeout(() => {
        scrollingRef.current = null;
      }, 50);
    };

    const editorEl = editorScrollRef.current;
    const previewEl = previewScrollRef.current;

    editorEl?.addEventListener('scroll', handleEditorScroll);
    previewEl?.addEventListener('scroll', handlePreviewScroll);

    return () => {
      editorEl?.removeEventListener('scroll', handleEditorScroll);
      previewEl?.removeEventListener('scroll', handlePreviewScroll);
    };
  }, [isScrollSynced]);

  if (layout === 'editor') {
    return (
      <div className={className} style={{ height: '100%' }}>
        {editor}
      </div>
    );
  }

  if (layout === 'preview') {
    return (
      <div className={className} style={{ height: '100%' }}>
        <PreviewPanel>{preview}</PreviewPanel>
      </div>
    );
  }

  if (layout === 'overlay') {
    return (
      <div className={className} style={{ position: 'relative', height: '100%' }}>
        {editor}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '400px',
            maxHeight: 'calc(100% - 32px)',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          }}
        >
          <PreviewPanel compact>{preview}</PreviewPanel>
        </motion.div>
      </div>
    );
  }

  // Split layout
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Editor Pane */}
      <div
        ref={editorScrollRef}
        style={{
          [isHorizontal ? 'width' : 'height']: `${splitRatio}%`,
          overflow: 'auto',
          borderRight: isHorizontal ? '1px solid #e5e7eb' : 'none',
          borderBottom: isHorizontal ? 'none' : '1px solid #e5e7eb',
        }}
      >
        {editor}
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        style={{
          [isHorizontal ? 'width' : 'height']: '8px',
          [isHorizontal ? 'height' : 'width']: '100%',
          backgroundColor: isDragging ? '#3b82f6' : 'transparent',
          cursor: isHorizontal ? 'col-resize' : 'row-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease',
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
        onMouseOut={(e) => {
          if (!isDragging) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <div style={{
          [isHorizontal ? 'width' : 'height']: '4px',
          [isHorizontal ? 'height' : 'width']: '40px',
          backgroundColor: '#d1d5db',
          borderRadius: '2px',
        }} />
      </div>

      {/* Preview Pane */}
      <div
        ref={previewScrollRef}
        style={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: '#f9fafb',
        }}
      >
        <PreviewPanel>{preview}</PreviewPanel>
      </div>
    </div>
  );
};

// ============================================================================
// PREVIEW PANEL
// ============================================================================

interface PreviewPanelProps {
  children: React.ReactNode;
  compact?: boolean;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ children, compact = false }) => {
  const { previewMode, config } = useSplitScreen();
  const device = previewDevices[previewMode];

  if (previewMode === 'full' || !config.showDeviceFrame) {
    return <div style={{ padding: compact ? '16px' : '24px' }}>{children}</div>;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: compact ? '16px' : '32px',
      minHeight: '100%',
    }}>
      <div style={{
        width: device.width,
        maxWidth: '100%',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '8px solid #1f2937',
      }}>
        {/* Device Header */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: '#1f2937',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }} />
          </div>
          <div style={{
            flex: 1,
            maxWidth: '200px',
            margin: '0 16px',
            padding: '4px 12px',
            backgroundColor: '#374151',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#9ca3af',
            textAlign: 'center',
          }}>
            preview.rustpress.io
          </div>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{device.width}px</span>
        </div>

        {/* Content */}
        <div style={{ padding: '16px', minHeight: previewMode === 'mobile' ? '600px' : '400px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PREVIEW TOOLBAR
// ============================================================================

interface PreviewToolbarProps {
  className?: string;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({ className = '' }) => {
  const {
    layout,
    setLayout,
    previewMode,
    setPreviewMode,
    isScrollSynced,
    toggleScrollSync,
    config,
    updateConfig,
  } = useSplitScreen();

  const layoutOptions: { value: LayoutMode; label: string; icon: string }[] = [
    { value: 'editor', label: 'Editor only', icon: '📝' },
    { value: 'split', label: 'Split view', icon: '◧' },
    { value: 'preview', label: 'Preview only', icon: '👁️' },
    { value: 'overlay', label: 'Overlay', icon: '⧉' },
  ];

  const deviceOptions: { value: PreviewMode; label: string; icon: string }[] = [
    { value: 'full', label: 'Full', icon: '⬜' },
    { value: 'desktop', label: 'Desktop', icon: '🖥️' },
    { value: 'tablet', label: 'Tablet', icon: '📱' },
    { value: 'mobile', label: 'Mobile', icon: '📱' },
  ];

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: isActive ? '#3b82f6' : 'transparent',
    color: isActive ? 'white' : '#6b7280',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.15s ease',
  });

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {/* Layout Options */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#e5e7eb', padding: '4px', borderRadius: '8px' }}>
        {layoutOptions.map(option => (
          <button
            key={option.value}
            onClick={() => setLayout(option.value)}
            title={option.label}
            style={buttonStyle(layout === option.value)}
          >
            <span>{option.icon}</span>
            <span style={{ display: layout === option.value ? 'inline' : 'none' }}>{option.label}</span>
          </button>
        ))}
      </div>

      {/* Device Options */}
      {(layout === 'split' || layout === 'preview' || layout === 'overlay') && (
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#e5e7eb', padding: '4px', borderRadius: '8px' }}>
          {deviceOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setPreviewMode(option.value)}
              title={option.label}
              style={buttonStyle(previewMode === option.value)}
            >
              <span>{option.icon}</span>
            </button>
          ))}
        </div>
      )}

      {/* Additional Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {layout === 'split' && (
          <button
            onClick={toggleScrollSync}
            title={isScrollSynced ? 'Disable scroll sync' : 'Enable scroll sync'}
            style={{
              ...buttonStyle(isScrollSynced),
              backgroundColor: isScrollSynced ? '#10B981' : 'transparent',
            }}
          >
            <span>🔗</span>
            <span>Sync</span>
          </button>
        )}

        <button
          onClick={() => updateConfig({ showDeviceFrame: !config.showDeviceFrame })}
          title={config.showDeviceFrame ? 'Hide device frame' : 'Show device frame'}
          style={buttonStyle(config.showDeviceFrame)}
        >
          <span>📱</span>
          <span>Frame</span>
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// LIVE PREVIEW
// ============================================================================

interface LivePreviewProps {
  content: string;
  renderContent: (content: string) => React.ReactNode;
  className?: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  content,
  renderContent,
  className = '',
}) => {
  const { config } = useSplitScreen();
  const [displayContent, setDisplayContent] = useState(content);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!config.livePreview) {
      setDisplayContent(content);
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDisplayContent(content);
    }, config.previewDelay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, config.livePreview, config.previewDelay]);

  return (
    <div className={className}>
      {renderContent(displayContent)}
    </div>
  );
};

// ============================================================================
// MARKDOWN PREVIEW
// ============================================================================

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {
  // Simple markdown to HTML conversion (basic implementation)
  const renderMarkdown = (md: string): string => {
    let html = md
      // Headers
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return html;
  };

  return (
    <div
      className={className}
      style={{
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#374151',
      }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

// ============================================================================
// RESPONSIVE PREVIEW
// ============================================================================

interface ResponsivePreviewProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  scale?: number;
  className?: string;
}

export const ResponsivePreview: React.FC<ResponsivePreviewProps> = ({
  children,
  width = 375,
  height = 812,
  scale = 0.75,
  className = '',
}) => {
  return (
    <div
      className={className}
      style={{
        width: width * scale,
        height: height * scale,
        overflow: 'hidden',
        borderRadius: '24px',
        border: '4px solid #1f2937',
        backgroundColor: 'white',
      }}
    >
      <div
        style={{
          width: width,
          height: height,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          overflow: 'auto',
        }}
      >
        {children}
      </div>
    </div>
  );
};

// ============================================================================
// PREVIEW REFRESH BUTTON
// ============================================================================

interface PreviewRefreshProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
  className?: string;
}

export const PreviewRefresh: React.FC<PreviewRefreshProps> = ({
  onRefresh,
  isRefreshing = false,
  className = '',
}) => {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        backgroundColor: 'white',
        color: '#374151',
        fontSize: '13px',
        cursor: isRefreshing ? 'wait' : 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <motion.span
        animate={{ rotate: isRefreshing ? 360 : 0 }}
        transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
      >
        🔄
      </motion.span>
      <span>{isRefreshing ? 'Refreshing...' : 'Refresh Preview'}</span>
    </button>
  );
};

// ============================================================================
// FULL SCREEN PREVIEW
// ============================================================================

interface FullScreenPreviewProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export const FullScreenPreview: React.FC<FullScreenPreviewProps> = ({
  children,
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'white',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            borderBottom: '1px solid #e5e7eb',
          }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              Full Screen Preview
            </span>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                color: '#374151',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Exit (Esc)
            </button>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// PREVIEW SETTINGS
// ============================================================================

interface PreviewSettingsProps {
  className?: string;
}

export const PreviewSettings: React.FC<PreviewSettingsProps> = ({ className = '' }) => {
  const { config, updateConfig } = useSplitScreen();

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
        Preview Settings
      </h3>

      <div style={toggleStyle}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Live Preview</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Update preview as you type</div>
        </div>
        <div style={switchStyle(config.livePreview)} onClick={() => updateConfig({ livePreview: !config.livePreview })}>
          <div style={switchKnobStyle(config.livePreview)} />
        </div>
      </div>

      <div style={toggleStyle}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Sync Scroll</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Synchronize scroll between editor and preview</div>
        </div>
        <div style={switchStyle(config.syncScroll)} onClick={() => updateConfig({ syncScroll: !config.syncScroll })}>
          <div style={switchKnobStyle(config.syncScroll)} />
        </div>
      </div>

      <div style={toggleStyle}>
        <div>
          <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151' }}>Device Frame</div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Show device frame around preview</div>
        </div>
        <div style={switchStyle(config.showDeviceFrame)} onClick={() => updateConfig({ showDeviceFrame: !config.showDeviceFrame })}>
          <div style={switchKnobStyle(config.showDeviceFrame)} />
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
          Preview Delay: {config.previewDelay}ms
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          step="100"
          value={config.previewDelay}
          onChange={(e) => updateConfig({ previewDelay: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <div style={{ fontWeight: 500, fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
          Orientation
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['horizontal', 'vertical'] as SplitOrientation[]).map(orientation => (
            <button
              key={orientation}
              onClick={() => updateConfig({ orientation })}
              style={{
                flex: 1,
                padding: '8px 16px',
                border: `2px solid ${config.orientation === orientation ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '8px',
                backgroundColor: config.orientation === orientation ? '#EFF6FF' : 'white',
                color: config.orientation === orientation ? '#3b82f6' : '#6b7280',
                fontSize: '13px',
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {orientation}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export {
  SplitScreenLayout as SplitScreenPreview,
};

export default SplitScreenProvider;
