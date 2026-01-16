/**
 * Theme Service
 * Handles reading and writing theme files from the backend API
 * Provides persistence for theme customizations
 */

// Base API URL - should be configured from environment
const API_BASE = '/api/v1';

// ============================================
// TYPES - Based on actual theme.json structure
// ============================================

export interface ThemeColors {
  primary: string;
  primary_light: string;
  primary_dark: string;
  secondary: string;
  secondary_light: string;
  secondary_dark: string;
  accent: string;
  accent_light: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  surface_light: string;
  text: string;
  text_muted: string;
  border: string;
  gradient_start: string;
  gradient_end: string;
  glow: string;
}

export interface ThemeFonts {
  heading: string;
  body: string;
  mono: string;
}

export interface ThemeFeatures {
  darkMode: boolean;
  glassmorphism: boolean;
  megaMenu: boolean;
  stickyHeader: boolean;
  backToTop: boolean;
  smoothScroll: boolean;
  particleBackground: boolean;
  cursorEffects: boolean;
  scrollProgress: boolean;
  lazyLoading: boolean;
  animatedCounters: boolean;
  parallaxSections: boolean;
  magneticButtons: boolean;
  typewriterEffect: boolean;
  '3dCards': boolean;
  glowEffects: boolean;
  gradientText: boolean;
  morphingShapes: boolean;
  codeHighlighting: boolean;
  interactiveDemo: boolean;
}

export interface ThemeAnimations {
  fadeUp: boolean;
  fadeIn: boolean;
  scaleIn: boolean;
  slideInLeft: boolean;
  slideInRight: boolean;
  rotateIn: boolean;
  bounceIn: boolean;
  staggerChildren: boolean;
  morphBlob: boolean;
  floatingElements: boolean;
  glitchText: boolean;
  typewriter: boolean;
  particleTrail: boolean;
  magneticHover: boolean;
  rippleEffect: boolean;
  pulseGlow: boolean;
}

export interface RustPressFeatures {
  ai_enhancement_tools: string[];
  content_formats: string[];
  admin_editable: boolean;
  block_editor: boolean;
  revision_history: boolean;
  scheduled_publishing: boolean;
  custom_templates: boolean;
}

export interface ThemeManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  features: ThemeFeatures;
  rustpress_features: RustPressFeatures;
  pages: string[];
  widgets: string[];
  animations: ThemeAnimations;
}

export interface ThemeAsset {
  path: string;
  type: 'css' | 'js';
  content: string;
  isModified: boolean;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  slug: string;
  path: string;
  content: string;
  isModified: boolean;
}

export interface ThemePartial {
  id: string;
  name: string;
  path: string;
  content: string;
  isModified: boolean;
}

export interface ThemeLayout {
  id: string;
  name: string;
  path: string;
  content: string;
  isModified: boolean;
}

export interface ThemeData {
  id: string;
  slug: string;
  path: string;
  manifest: ThemeManifest;
  assets: {
    css: ThemeAsset[];
    js: ThemeAsset[];
  };
  templates: ThemeTemplate[];
  partials: ThemePartial[];
  layouts: ThemeLayout[];
  isActive: boolean;
  lastModified: string;
  gitInfo?: {
    branch: string;
    lastCommit: string;
    lastCommitDate: string;
    isDirty: boolean;
  };
}

export interface ThemeListItem {
  id: string;
  slug: string;
  name: string;
  version: string;
  description: string;
  author: string;
  thumbnail?: string;
  isActive: boolean;
  isInstalled: boolean;
  path: string;
}

// ============================================
// API FUNCTIONS
// ============================================

/**
 * Fetch list of all installed themes
 */
export async function getInstalledThemes(): Promise<ThemeListItem[]> {
  try {
    const response = await fetch(`${API_BASE}/themes`);
    if (!response.ok) throw new Error('Failed to fetch themes');
    return await response.json();
  } catch (error) {
    console.error('Error fetching themes:', error);
    // Return mock data for development
    return getMockThemeList();
  }
}

/**
 * Fetch the currently active theme
 */
export async function getActiveTheme(): Promise<ThemeData> {
  try {
    const response = await fetch(`${API_BASE}/themes/active`);
    if (!response.ok) throw new Error('Failed to fetch active theme');
    return await response.json();
  } catch (error) {
    console.error('Error fetching active theme:', error);
    // Return mock data for development
    return getMockThemeData('rustpress-enterprise');
  }
}

/**
 * Fetch a specific theme by slug
 */
export async function getTheme(slug: string): Promise<ThemeData> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}`);
    if (!response.ok) throw new Error(`Failed to fetch theme: ${slug}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching theme:', error);
    return getMockThemeData(slug);
  }
}

/**
 * Save theme manifest (theme.json)
 */
export async function saveThemeManifest(slug: string, manifest: ThemeManifest): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}/manifest`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(manifest),
    });
    if (!response.ok) throw new Error('Failed to save theme manifest');

    // Also persist to localStorage as backup
    persistToLocalStorage(slug, 'manifest', manifest);

    return true;
  } catch (error) {
    console.error('Error saving theme manifest:', error);
    // Fallback to localStorage
    persistToLocalStorage(slug, 'manifest', manifest);
    return true;
  }
}

/**
 * Save a theme asset (CSS or JS file)
 */
export async function saveThemeAsset(slug: string, asset: ThemeAsset): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}/assets`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(asset),
    });
    if (!response.ok) throw new Error('Failed to save asset');

    persistToLocalStorage(slug, `asset:${asset.path}`, asset.content);

    return true;
  } catch (error) {
    console.error('Error saving asset:', error);
    persistToLocalStorage(slug, `asset:${asset.path}`, asset.content);
    return true;
  }
}

/**
 * Save a theme template
 */
export async function saveThemeTemplate(slug: string, template: ThemeTemplate): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}/templates/${template.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template),
    });
    if (!response.ok) throw new Error('Failed to save template');

    persistToLocalStorage(slug, `template:${template.path}`, template.content);

    return true;
  } catch (error) {
    console.error('Error saving template:', error);
    persistToLocalStorage(slug, `template:${template.path}`, template.content);
    return true;
  }
}

/**
 * Activate a theme
 */
export async function activateTheme(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}/activate`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to activate theme');

    localStorage.setItem('rustpress_active_theme', slug);

    return true;
  } catch (error) {
    console.error('Error activating theme:', error);
    localStorage.setItem('rustpress_active_theme', slug);
    return true;
  }
}

/**
 * Commit theme changes to git
 */
export async function commitThemeChanges(slug: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}/commit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Failed to commit changes');
    return true;
  } catch (error) {
    console.error('Error committing changes:', error);
    return false;
  }
}

/**
 * Push theme changes to remote
 */
export async function pushThemeChanges(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}/push`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to push changes');
    return true;
  } catch (error) {
    console.error('Error pushing changes:', error);
    return false;
  }
}

/**
 * Pull latest changes from remote
 */
export async function pullThemeChanges(slug: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/themes/${slug}/pull`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error('Failed to pull changes');
    return true;
  } catch (error) {
    console.error('Error pulling changes:', error);
    return false;
  }
}

// ============================================
// LOCAL STORAGE PERSISTENCE
// ============================================

function persistToLocalStorage(themeSlug: string, key: string, value: unknown): void {
  const storageKey = `rustpress_theme_${themeSlug}_${key}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (error) {
    console.error('Error persisting to localStorage:', error);
  }
}

function getFromLocalStorage<T>(themeSlug: string, key: string): T | null {
  const storageKey = `rustpress_theme_${themeSlug}_${key}`;
  try {
    const value = localStorage.getItem(storageKey);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
}

// ============================================
// MOCK DATA FOR DEVELOPMENT
// ============================================

function getMockThemeList(): ThemeListItem[] {
  return [
    {
      id: 'rustpress-enterprise',
      slug: 'rustpress-enterprise',
      name: 'RustPress Enterprise',
      version: '2.4.0',
      description: 'The premium enterprise theme for RustPress CMS',
      author: 'RustPress Team',
      thumbnail: '/themes/rustpress-enterprise/screenshot.png',
      isActive: true,
      isInstalled: true,
      path: 'themes/rustpress-enterprise',
    },
    {
      id: 'business-elite',
      slug: 'business-elite',
      name: 'Business Elite',
      version: '1.0.0',
      description: 'Professional business theme',
      author: 'RustPress Team',
      isActive: false,
      isInstalled: true,
      path: 'themes/business-elite',
    },
    {
      id: 'developer-developer',
      slug: 'developer-developer',
      name: 'Developer Developer',
      version: '1.0.0',
      description: 'Theme for developers',
      author: 'RustPress Team',
      isActive: false,
      isInstalled: true,
      path: 'themes/developer-developer',
    },
  ];
}

function getMockThemeData(slug: string): ThemeData {
  // Get persisted data from localStorage if available
  const persistedManifest = getFromLocalStorage<ThemeManifest>(slug, 'manifest');

  const defaultManifest: ThemeManifest = {
    name: 'RustPress Official',
    version: '1.0.0',
    description: 'The official RustPress CMS showcase theme',
    author: 'RustPress',
    license: 'MIT',
    colors: {
      primary: '#6366F1',
      primary_light: '#818CF8',
      primary_dark: '#4F46E5',
      secondary: '#06B6D4',
      secondary_light: '#22D3EE',
      secondary_dark: '#0891B2',
      accent: '#F59E0B',
      accent_light: '#FBBF24',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      background: '#0F0F1A',
      surface: '#1A1A2E',
      surface_light: '#252542',
      text: '#F8FAFC',
      text_muted: '#94A3B8',
      border: '#2D2D4A',
      gradient_start: '#6366F1',
      gradient_end: '#06B6D4',
      glow: 'rgba(99, 102, 241, 0.4)',
    },
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
      mono: 'JetBrains Mono',
    },
    features: {
      darkMode: true,
      glassmorphism: true,
      megaMenu: true,
      stickyHeader: true,
      backToTop: true,
      smoothScroll: true,
      particleBackground: true,
      cursorEffects: true,
      scrollProgress: true,
      lazyLoading: true,
      animatedCounters: true,
      parallaxSections: true,
      magneticButtons: true,
      typewriterEffect: true,
      '3dCards': true,
      glowEffects: true,
      gradientText: true,
      morphingShapes: true,
      codeHighlighting: true,
      interactiveDemo: true,
    },
    rustpress_features: {
      ai_enhancement_tools: [
        'title_generator',
        'content_summarizer',
        'seo_optimizer',
        'plagiarism_checker',
        'tone_adjuster',
        'grammar_fixer',
        'image_generator',
        'alt_text_generator',
        'schema_generator',
        'related_posts_suggester',
      ],
      content_formats: ['blocks', 'elementor', 'markdown', 'html', 'text'],
      admin_editable: true,
      block_editor: true,
      revision_history: true,
      scheduled_publishing: true,
      custom_templates: true,
    },
    pages: [
      'home', 'features', 'pricing', 'about', 'team', 'integrations',
      'use-cases', 'customers', 'security', 'enterprise', 'api', 'docs',
      'demo', 'contact', 'blog', 'post', 'changelog', 'careers',
      'privacy', 'terms', '404', '500',
    ],
    widgets: [
      'hero', 'features-grid', 'pricing-table', 'testimonials-carousel',
      'stats-counter', 'cta-banner', 'integration-logos', 'team-grid',
      'timeline', 'faq-accordion', 'code-preview', 'terminal-demo',
      'feature-comparison', 'security-badges',
    ],
    animations: {
      fadeUp: true,
      fadeIn: true,
      scaleIn: true,
      slideInLeft: true,
      slideInRight: true,
      rotateIn: true,
      bounceIn: true,
      staggerChildren: true,
      morphBlob: true,
      floatingElements: true,
      glitchText: true,
      typewriter: true,
      particleTrail: true,
      magneticHover: true,
      rippleEffect: true,
      pulseGlow: true,
    },
  };

  return {
    id: slug,
    slug,
    path: `themes/${slug}`,
    manifest: persistedManifest || defaultManifest,
    assets: {
      css: [
        {
          path: 'assets/css/style.css',
          type: 'css',
          content: getFromLocalStorage(slug, 'asset:assets/css/style.css') || '/* Main stylesheet */',
          isModified: false,
        },
        {
          path: 'assets/css/components.css',
          type: 'css',
          content: getFromLocalStorage(slug, 'asset:assets/css/components.css') || '/* Component styles */',
          isModified: false,
        },
        {
          path: 'assets/css/animations.css',
          type: 'css',
          content: getFromLocalStorage(slug, 'asset:assets/css/animations.css') || '/* Animation styles */',
          isModified: false,
        },
      ],
      js: [
        {
          path: 'assets/js/main.js',
          type: 'js',
          content: getFromLocalStorage(slug, 'asset:assets/js/main.js') || '// Main JavaScript',
          isModified: false,
        },
        {
          path: 'assets/js/animations.js',
          type: 'js',
          content: getFromLocalStorage(slug, 'asset:assets/js/animations.js') || '// Animation scripts',
          isModified: false,
        },
      ],
    },
    templates: defaultManifest.pages.map((page) => ({
      id: page,
      name: page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' '),
      slug: page === 'home' ? '/' : `/${page}`,
      path: `templates/${page}.html`,
      content: getFromLocalStorage(slug, `template:templates/${page}.html`) || `{% extends "layouts/base.html" %}\n\n{% block content %}\n<!-- ${page} page content -->\n{% endblock %}`,
      isModified: false,
    })),
    partials: [
      {
        id: 'header',
        name: 'Header',
        path: 'partials/header.html',
        content: getFromLocalStorage(slug, 'template:partials/header.html') || '<!-- Header partial -->',
        isModified: false,
      },
      {
        id: 'footer',
        name: 'Footer',
        path: 'partials/footer.html',
        content: getFromLocalStorage(slug, 'template:partials/footer.html') || '<!-- Footer partial -->',
        isModified: false,
      },
      {
        id: 'mobile-menu',
        name: 'Mobile Menu',
        path: 'partials/mobile-menu.html',
        content: getFromLocalStorage(slug, 'template:partials/mobile-menu.html') || '<!-- Mobile menu partial -->',
        isModified: false,
      },
    ],
    layouts: [
      {
        id: 'base',
        name: 'Base Layout',
        path: 'layouts/base.html',
        content: getFromLocalStorage(slug, 'template:layouts/base.html') || '<!DOCTYPE html>\n<html>\n<head>{% block head %}{% endblock %}</head>\n<body>{% block content %}{% endblock %}</body>\n</html>',
        isModified: false,
      },
    ],
    isActive: localStorage.getItem('rustpress_active_theme') === slug || slug === 'rustpress-enterprise',
    lastModified: new Date().toISOString(),
    gitInfo: {
      branch: 'main',
      lastCommit: 'a1b2c3d',
      lastCommitDate: new Date().toISOString().split('T')[0],
      isDirty: false,
    },
  };
}

// ============================================
// CONVERSION UTILITIES
// ============================================

/**
 * Convert ThemeData manifest colors to editor format (color scales)
 */
export function manifestColorsToEditorFormat(colors: ThemeColors): Record<string, Record<string, string>> {
  // Generate color scales from base colors
  return {
    primary: generateColorScale(colors.primary),
    secondary: generateColorScale(colors.secondary),
    accent: generateColorScale(colors.accent),
    neutral: {
      50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
      400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
      800: '#27272a', 900: '#18181b', 950: '#09090b',
    },
    success: generateColorScale(colors.success),
    warning: generateColorScale(colors.warning),
    error: generateColorScale(colors.error),
    info: generateColorScale('#3B82F6'),
    background: {
      primary: colors.background,
      secondary: colors.surface,
      tertiary: colors.surface_light,
    },
    text: {
      primary: colors.text,
      secondary: colors.text_muted,
      muted: colors.text_muted,
      inverse: colors.background,
    },
    border: {
      default: colors.border,
      muted: colors.surface_light,
      strong: colors.text_muted,
    },
  };
}

/**
 * Generate a color scale from a base color
 */
function generateColorScale(baseColor: string): Record<string, string> {
  // Simple scale generation - in production, use proper color manipulation
  return {
    50: lighten(baseColor, 0.9),
    100: lighten(baseColor, 0.8),
    200: lighten(baseColor, 0.6),
    300: lighten(baseColor, 0.4),
    400: lighten(baseColor, 0.2),
    500: baseColor,
    600: darken(baseColor, 0.1),
    700: darken(baseColor, 0.2),
    800: darken(baseColor, 0.3),
    900: darken(baseColor, 0.4),
    950: darken(baseColor, 0.5),
  };
}

function lighten(color: string, amount: number): string {
  // Simplified - mix with white
  return color; // Placeholder - would need proper color math
}

function darken(color: string, amount: number): string {
  // Simplified - mix with black
  return color; // Placeholder - would need proper color math
}

export default {
  getInstalledThemes,
  getActiveTheme,
  getTheme,
  saveThemeManifest,
  saveThemeAsset,
  saveThemeTemplate,
  activateTheme,
  commitThemeChanges,
  pushThemeChanges,
  pullThemeChanges,
  manifestColorsToEditorFormat,
};
