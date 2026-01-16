/**
 * Design Page - Color, Typography, Spacing Controls
 * Extracted from ThemeEditor
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Type,
  Maximize2,
  Save,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Download
} from 'lucide-react';
import clsx from 'clsx';

// ============================================
// TYPES
// ============================================

interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

interface DesignTokens {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: {
      sans: string;
      serif: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: string;
      normal: string;
      relaxed: string;
    };
  };
  spacing: {
    unit: number;
    scale: number[];
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// ============================================
// DEFAULT VALUES
// ============================================

const defaultTokens: DesignTokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
      950: '#172554'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617'
    },
    accent: {
      50: '#fdf4ff',
      100: '#fae8ff',
      200: '#f5d0fe',
      300: '#f0abfc',
      400: '#e879f9',
      500: '#d946ef',
      600: '#c026d3',
      700: '#a21caf',
      800: '#86198f',
      900: '#701a75',
      950: '#4a044e'
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
      950: '#09090b'
    },
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  },
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, sans-serif',
      serif: 'Georgia, serif',
      mono: 'JetBrains Mono, monospace'
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem'
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64]
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px'
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  }
};

// ============================================
// SECTION COMPONENT
// ============================================

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
      >
        {icon}
        <span className="font-semibold text-gray-900 dark:text-white flex-1 text-left">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-gray-200 dark:border-gray-700 p-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

// ============================================
// COLOR PICKER COMPONENT
// ============================================

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange }) => {
  const [copied, setCopied] = useState(false);

  const copyColor = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 flex-1">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border border-gray-200 dark:border-gray-600"
        />
        <span className="text-sm text-gray-600 dark:text-gray-300 w-16">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-24 px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
        />
        <button
          onClick={copyColor}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

// ============================================
// COLOR SCALE COMPONENT
// ============================================

interface ColorScaleEditorProps {
  name: string;
  scale: ColorScale;
  onChange: (scale: ColorScale) => void;
}

const ColorScaleEditor: React.FC<ColorScaleEditorProps> = ({ name, scale, onChange }) => {
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;

  const updateShade = (shade: keyof ColorScale, value: string) => {
    onChange({ ...scale, [shade]: value });
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 dark:text-gray-300 capitalize">{name}</h4>
      <div className="flex gap-1">
        {shades.map((shade) => (
          <div key={shade} className="flex-1">
            <input
              type="color"
              value={scale[shade]}
              onChange={(e) => updateShade(shade, e.target.value)}
              className="w-full h-10 rounded cursor-pointer border-0"
              title={`${name}-${shade}: ${scale[shade]}`}
            />
            <p className="text-[10px] text-center text-gray-400 mt-1">{shade}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const DesignPage: React.FC = () => {
  const [tokens, setTokens] = useState<DesignTokens>(defaultTokens);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const updateColorScale = (key: 'primary' | 'secondary' | 'accent' | 'neutral', scale: ColorScale) => {
    setTokens(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: scale }
    }));
    setHasChanges(true);
  };

  const updateColor = (key: 'success' | 'warning' | 'error' | 'info', value: string) => {
    setTokens(prev => ({
      ...prev,
      colors: { ...prev.colors, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateFontFamily = (key: 'sans' | 'serif' | 'mono', value: string) => {
    setTokens(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        fontFamily: { ...prev.typography.fontFamily, [key]: value }
      }
    }));
    setHasChanges(true);
  };

  const updateSpacingUnit = (value: number) => {
    setTokens(prev => ({
      ...prev,
      spacing: { ...prev.spacing, unit: value }
    }));
    setHasChanges(true);
  };

  const updateBorderRadius = (key: keyof DesignTokens['borderRadius'], value: string) => {
    setTokens(prev => ({
      ...prev,
      borderRadius: { ...prev.borderRadius, [key]: value }
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setTokens(defaultTokens);
    setHasChanges(false);
  };

  const handleSave = () => {
    console.log('Saving design tokens:', tokens);
    setHasChanges(false);
    // TODO: Integrate with theme store
  };

  const exportCSS = () => {
    const css = generateCSSVariables(tokens);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'design-tokens.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSSVariables = (t: DesignTokens): string => {
    let css = ':root {\n';

    // Colors
    Object.entries(t.colors).forEach(([name, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([shade, color]) => {
          css += `  --color-${name}-${shade}: ${color};\n`;
        });
      } else {
        css += `  --color-${name}: ${value};\n`;
      }
    });

    css += '\n';

    // Typography
    Object.entries(t.typography.fontFamily).forEach(([name, value]) => {
      css += `  --font-${name}: ${value};\n`;
    });
    Object.entries(t.typography.fontSize).forEach(([name, value]) => {
      css += `  --text-${name}: ${value};\n`;
    });

    css += '\n';

    // Spacing
    css += `  --spacing-unit: ${t.spacing.unit}px;\n`;
    t.spacing.scale.forEach((s, i) => {
      css += `  --spacing-${i}: ${s * t.spacing.unit}px;\n`;
    });

    css += '\n';

    // Border radius
    Object.entries(t.borderRadius).forEach(([name, value]) => {
      css += `  --radius-${name}: ${value};\n`;
    });

    css += '\n';

    // Shadows
    Object.entries(t.shadows).forEach(([name, value]) => {
      css += `  --shadow-${name}: ${value};\n`;
    });

    css += '}\n';
    return css;
  };

  return (
    <div className="h-full flex bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className={clsx('flex-1 overflow-auto p-6', showPreview ? 'mr-80' : '')}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Design System</h1>
            <p className="text-gray-500 dark:text-gray-400">Configure colors, typography, and spacing</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                showPreview ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <Eye className="w-5 h-5" />
            </button>
            <button
              onClick={exportCSS}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Download className="w-4 h-4" />
              Export CSS
            </button>
            <button
              onClick={resetToDefaults}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                hasChanges
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              )}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl">
          {/* Color Palette */}
          <Section
            title="Color Palette"
            icon={<Palette className="w-5 h-5 text-pink-500" />}
          >
            <div className="space-y-6">
              <ColorScaleEditor
                name="primary"
                scale={tokens.colors.primary}
                onChange={(scale) => updateColorScale('primary', scale)}
              />
              <ColorScaleEditor
                name="secondary"
                scale={tokens.colors.secondary}
                onChange={(scale) => updateColorScale('secondary', scale)}
              />
              <ColorScaleEditor
                name="accent"
                scale={tokens.colors.accent}
                onChange={(scale) => updateColorScale('accent', scale)}
              />
              <ColorScaleEditor
                name="neutral"
                scale={tokens.colors.neutral}
                onChange={(scale) => updateColorScale('neutral', scale)}
              />

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Semantic Colors</h4>
                <div className="grid grid-cols-2 gap-4">
                  <ColorPicker
                    label="Success"
                    value={tokens.colors.success}
                    onChange={(v) => updateColor('success', v)}
                  />
                  <ColorPicker
                    label="Warning"
                    value={tokens.colors.warning}
                    onChange={(v) => updateColor('warning', v)}
                  />
                  <ColorPicker
                    label="Error"
                    value={tokens.colors.error}
                    onChange={(v) => updateColor('error', v)}
                  />
                  <ColorPicker
                    label="Info"
                    value={tokens.colors.info}
                    onChange={(v) => updateColor('info', v)}
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Typography */}
          <Section
            title="Typography"
            icon={<Type className="w-5 h-5 text-blue-500" />}
          >
            <div className="space-y-6">
              {/* Font Families */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Font Families</h4>
                <div className="space-y-3">
                  {(['sans', 'serif', 'mono'] as const).map((key) => (
                    <div key={key} className="flex items-center gap-4">
                      <label className="text-sm text-gray-600 dark:text-gray-400 w-16 capitalize">{key}</label>
                      <input
                        type="text"
                        value={tokens.typography.fontFamily[key]}
                        onChange={(e) => updateFontFamily(key, e.target.value)}
                        className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Font Sizes Preview */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Font Sizes</h4>
                <div className="space-y-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  {Object.entries(tokens.typography.fontSize).map(([size, value]) => (
                    <div key={size} className="flex items-baseline gap-4">
                      <span className="text-xs text-gray-500 w-12">{size}</span>
                      <span style={{ fontSize: value }} className="text-gray-900 dark:text-white">
                        The quick brown fox
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>

          {/* Spacing */}
          <Section
            title="Spacing & Layout"
            icon={<Maximize2 className="w-5 h-5 text-green-500" />}
          >
            <div className="space-y-6">
              {/* Base Unit */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Base Unit: {tokens.spacing.unit}px
                </h4>
                <input
                  type="range"
                  min="2"
                  max="8"
                  step="1"
                  value={tokens.spacing.unit}
                  onChange={(e) => updateSpacingUnit(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>2px</span>
                  <span>4px</span>
                  <span>6px</span>
                  <span>8px</span>
                </div>
              </div>

              {/* Spacing Scale Preview */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Spacing Scale</h4>
                <div className="space-y-1">
                  {tokens.spacing.scale.slice(1, 12).map((multiplier, index) => {
                    const size = multiplier * tokens.spacing.unit;
                    return (
                      <div key={index} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-8">{index + 1}</span>
                        <div
                          className="bg-blue-500 h-4 rounded"
                          style={{ width: `${size}px` }}
                        />
                        <span className="text-xs text-gray-400">{size}px</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Border Radius */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Border Radius</h4>
                <div className="grid grid-cols-3 gap-4">
                  {(['sm', 'md', 'lg', 'xl'] as const).map((key) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-16 h-16 bg-blue-500 mx-auto mb-2"
                        style={{ borderRadius: tokens.borderRadius[key] }}
                      />
                      <input
                        type="text"
                        value={tokens.borderRadius[key]}
                        onChange={(e) => updateBorderRadius(key, e.target.value)}
                        className="w-full px-2 py-1 text-xs text-center bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded"
                      />
                      <span className="text-xs text-gray-400">{key}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shadows Preview */}
              <div>
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Shadows</h4>
                <div className="grid grid-cols-4 gap-4">
                  {Object.entries(tokens.shadows).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div
                        className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg mx-auto mb-2"
                        style={{ boxShadow: value }}
                      />
                      <span className="text-xs text-gray-400">{key}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Preview Panel */}
      {showPreview && (
        <div className="fixed right-0 top-0 w-80 h-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
          </div>
          <div className="p-4 space-y-6">
            {/* Buttons */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Buttons</h4>
              <div className="space-y-2">
                <button
                  className="w-full px-4 py-2 text-white text-sm font-medium rounded-lg"
                  style={{ backgroundColor: tokens.colors.primary[600], borderRadius: tokens.borderRadius.lg }}
                >
                  Primary Button
                </button>
                <button
                  className="w-full px-4 py-2 text-sm font-medium rounded-lg border-2"
                  style={{
                    borderColor: tokens.colors.primary[600],
                    color: tokens.colors.primary[600],
                    borderRadius: tokens.borderRadius.lg
                  }}
                >
                  Secondary Button
                </button>
              </div>
            </div>

            {/* Card */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Card</h4>
              <div
                className="p-4"
                style={{
                  backgroundColor: tokens.colors.neutral[50],
                  borderRadius: tokens.borderRadius.xl,
                  boxShadow: tokens.shadows.md
                }}
              >
                <h5
                  className="font-semibold mb-2"
                  style={{
                    fontFamily: tokens.typography.fontFamily.sans,
                    fontSize: tokens.typography.fontSize.lg,
                    color: tokens.colors.neutral[900]
                  }}
                >
                  Card Title
                </h5>
                <p
                  style={{
                    fontFamily: tokens.typography.fontFamily.sans,
                    fontSize: tokens.typography.fontSize.sm,
                    color: tokens.colors.neutral[600]
                  }}
                >
                  This is a sample card with your design tokens applied.
                </p>
              </div>
            </div>

            {/* Alerts */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Alerts</h4>
              <div className="space-y-2">
                {[
                  { key: 'success', label: 'Success message' },
                  { key: 'warning', label: 'Warning message' },
                  { key: 'error', label: 'Error message' },
                  { key: 'info', label: 'Info message' }
                ].map(({ key, label }) => (
                  <div
                    key={key}
                    className="px-3 py-2 text-sm rounded-lg"
                    style={{
                      backgroundColor: `${tokens.colors[key as keyof typeof tokens.colors]}20`,
                      color: tokens.colors[key as keyof typeof tokens.colors] as string,
                      borderRadius: tokens.borderRadius.md
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Typography</h4>
              <div className="space-y-1">
                <h1
                  style={{
                    fontFamily: tokens.typography.fontFamily.sans,
                    fontSize: tokens.typography.fontSize['2xl'],
                    fontWeight: tokens.typography.fontWeight.bold,
                    color: tokens.colors.neutral[900]
                  }}
                >
                  Heading
                </h1>
                <p
                  style={{
                    fontFamily: tokens.typography.fontFamily.sans,
                    fontSize: tokens.typography.fontSize.base,
                    color: tokens.colors.neutral[600]
                  }}
                >
                  Body text with your custom font settings applied.
                </p>
                <code
                  className="block text-sm"
                  style={{
                    fontFamily: tokens.typography.fontFamily.mono,
                    color: tokens.colors.accent[600]
                  }}
                >
                  const code = 'monospace';
                </code>
              </div>
            </div>

            {/* Color Swatches */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Primary Colors</h4>
              <div className="flex gap-1">
                {(['100', '300', '500', '700', '900'] as const).map((shade) => (
                  <div
                    key={shade}
                    className="flex-1 h-8 rounded"
                    style={{ backgroundColor: tokens.colors.primary[shade] }}
                    title={`primary-${shade}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DesignPage;
