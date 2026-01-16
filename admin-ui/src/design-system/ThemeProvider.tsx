/**
 * RustPress Theme Provider
 * Enterprise-grade theme management with system preference detection
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Theme, ThemeMode, lightTheme, darkTheme, colors, typography, spacing, radii, shadows, animation, breakpoints, zIndex } from './tokens';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  tokens: {
    colors: typeof colors;
    typography: typeof typography;
    spacing: typeof spacing;
    radii: typeof radii;
    shadows: typeof shadows;
    animation: typeof animation;
    breakpoints: typeof breakpoints;
    zIndex: typeof zIndex;
  };
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Generate CSS custom properties from tokens
function generateCSSVariables(theme: Theme): string {
  const vars: string[] = [];

  // Background colors
  Object.entries(theme.colors.bg).forEach(([key, value]) => {
    vars.push(`--bg-${key}: ${value}`);
  });

  // Foreground colors
  Object.entries(theme.colors.fg).forEach(([key, value]) => {
    vars.push(`--fg-${key}: ${value}`);
  });

  // Border colors
  Object.entries(theme.colors.border).forEach(([key, value]) => {
    vars.push(`--border-${key}: ${value}`);
  });

  // Surface colors
  Object.entries(theme.colors.surface).forEach(([key, value]) => {
    vars.push(`--surface-${key}: ${value}`);
  });

  // Brand colors
  Object.entries(theme.colors.brand).forEach(([key, value]) => {
    vars.push(`--brand-${key}: ${value}`);
  });

  // Semantic colors
  Object.entries(theme.colors.semantic).forEach(([key, value]) => {
    vars.push(`--semantic-${key}: ${value}`);
  });

  // Raw color scales
  Object.entries(colors).forEach(([colorName, scale]) => {
    if (typeof scale === 'object') {
      Object.entries(scale).forEach(([step, value]) => {
        vars.push(`--color-${colorName}-${step}: ${value}`);
      });
    }
  });

  // Typography
  Object.entries(typography.fonts).forEach(([key, value]) => {
    vars.push(`--font-${key}: ${value}`);
  });
  Object.entries(typography.sizes).forEach(([key, value]) => {
    vars.push(`--text-${key}: ${value}`);
  });
  Object.entries(typography.weights).forEach(([key, value]) => {
    vars.push(`--font-weight-${key}: ${value}`);
  });
  Object.entries(typography.lineHeights).forEach(([key, value]) => {
    vars.push(`--leading-${key}: ${value}`);
  });
  Object.entries(typography.letterSpacing).forEach(([key, value]) => {
    vars.push(`--tracking-${key}: ${value}`);
  });

  // Spacing
  Object.entries(spacing).forEach(([key, value]) => {
    vars.push(`--space-${key}: ${value}`);
  });

  // Border radius
  Object.entries(radii).forEach(([key, value]) => {
    vars.push(`--radius-${key}: ${value}`);
  });

  // Shadows
  Object.entries(shadows).forEach(([key, value]) => {
    if (typeof value === 'string') {
      vars.push(`--shadow-${key}: ${value}`);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([glowKey, glowValue]) => {
        vars.push(`--shadow-${key}-${glowKey}: ${glowValue}`);
      });
    }
  });

  // Animation
  Object.entries(animation.durations).forEach(([key, value]) => {
    vars.push(`--duration-${key}: ${value}`);
  });
  Object.entries(animation.easings).forEach(([key, value]) => {
    vars.push(`--ease-${key}: ${value}`);
  });
  Object.entries(animation.transitions).forEach(([key, value]) => {
    vars.push(`--transition-${key}: ${value}`);
  });

  // Breakpoints
  Object.entries(breakpoints).forEach(([key, value]) => {
    vars.push(`--breakpoint-${key}: ${value}`);
  });

  // Z-index
  Object.entries(zIndex).forEach(([key, value]) => {
    vars.push(`--z-${key}: ${value}`);
  });

  return vars.join(';\n  ');
}

// Detect system color scheme preference
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

// Get stored theme preference
function getStoredTheme(): ThemeMode | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('rustpress-theme-mode') as ThemeMode | null;
  }
  return null;
}

// Store theme preference
function storeTheme(mode: ThemeMode): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('rustpress-theme-mode', mode);
  }
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultMode?: ThemeMode;
}

export function ThemeProvider({ children, defaultMode = 'system' }: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = getStoredTheme();
    return stored || defaultMode;
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() => {
    if (mode === 'system') {
      return getSystemTheme();
    }
    return mode;
  });

  // Update resolved mode when mode changes or system preference changes
  useEffect(() => {
    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedMode(e.matches ? 'dark' : 'light');
      };

      setResolvedMode(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedMode(mode);
    }
  }, [mode]);

  // Apply CSS variables to document
  useEffect(() => {
    const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;
    const cssVars = generateCSSVariables(theme);

    // Create or update style element
    let styleEl = document.getElementById('rustpress-theme-vars');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'rustpress-theme-vars';
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `:root {\n  ${cssVars};\n}`;

    // Update document class for Tailwind dark mode
    document.documentElement.classList.toggle('dark', resolvedMode === 'dark');
    document.documentElement.setAttribute('data-theme', resolvedMode);
  }, [resolvedMode]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    storeTheme(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = resolvedMode === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [resolvedMode, setMode]);

  const theme = resolvedMode === 'dark' ? darkTheme : lightTheme;

  const value: ThemeContextValue = {
    theme,
    mode,
    setMode,
    toggleTheme,
    isDark: resolvedMode === 'dark',
    tokens: {
      colors,
      typography,
      spacing,
      radii,
      shadows,
      animation,
      breakpoints,
      zIndex,
    },
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to access theme context
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Hook for responsive design
export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('xs');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width >= 1536) setCurrentBreakpoint('2xl');
      else if (width >= 1280) setCurrentBreakpoint('xl');
      else if (width >= 1024) setCurrentBreakpoint('lg');
      else if (width >= 768) setCurrentBreakpoint('md');
      else if (width >= 640) setCurrentBreakpoint('sm');
      else if (width >= 480) setCurrentBreakpoint('xs');
      else setCurrentBreakpoint('xs');
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint: currentBreakpoint,
    isXs: currentBreakpoint === 'xs',
    isSm: currentBreakpoint === 'sm' || currentBreakpoint === 'xs',
    isMd: ['xs', 'sm', 'md'].includes(currentBreakpoint),
    isLg: ['xs', 'sm', 'md', 'lg'].includes(currentBreakpoint),
    isXl: ['xs', 'sm', 'md', 'lg', 'xl'].includes(currentBreakpoint),
    is2xl: true,
    isMobile: ['xs', 'sm'].includes(currentBreakpoint),
    isTablet: currentBreakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(currentBreakpoint),
  };
}

// Hook for reduced motion preference
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

export default ThemeProvider;
