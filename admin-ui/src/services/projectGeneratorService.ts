/**
 * Project Generator Service
 * Generates project files from wizard configurations
 */

import { createFile, writeFile } from './fileSystemService';

// ============================================
// TYPES
// ============================================

export interface ThemeConfig {
  name: string;
  slug: string;
  description: string;
  author: string;
  version: string;
  template: 'blank' | 'starter' | 'blog' | 'portfolio' | 'landing' | 'ecommerce';
  colorScheme: 'light' | 'dark' | 'both';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  features: string[];
  responsive: boolean;
  includeAssets: boolean;
}

export interface PluginConfig {
  name: string;
  slug: string;
  description: string;
  author: string;
  authorUri: string;
  version: string;
  license: 'MIT' | 'GPL-2.0' | 'GPL-3.0' | 'Apache-2.0' | 'proprietary';
  category: string;
  minRustPressVersion: string;
  hasSettings: boolean;
  hasAdminPage: boolean;
  language: 'rust' | 'typescript' | 'both';
  hooks: string[];
  features: string[];
  apiEndpoints: boolean;
  databaseTables: boolean;
  cronJobs: boolean;
}

export interface FunctionConfig {
  name: string;
  slug: string;
  description: string;
  runtime: 'rust' | 'typescript' | 'python';
  trigger: 'http' | 'cron' | 'webhook' | 'event';
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'ANY';
  httpPath?: string;
  cronSchedule?: string;
  eventType?: string;
  timeout: number;
  memory: number;
  environment: { key: string; value: string }[];
  authentication: 'none' | 'api-key' | 'jwt' | 'oauth';
  cors: boolean;
  logging: boolean;
  retries: number;
}

export interface AppConfig {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  author: string;
  authorUrl: string;
  version: string;
  category: string;
  icon: string;
  pricing: {
    type: 'free' | 'membership' | 'one-time';
    price?: number;
  };
  permissions: string[];
  framework: 'react' | 'vue' | 'svelte' | 'vanilla';
  hasRustBackend: boolean;
  hasDatabaseTables: boolean;
  includeAuth: boolean;
  includeSettings: boolean;
  features: string[];
}

export interface GenerationResult {
  success: boolean;
  projectPath: string;
  filesCreated: string[];
  errors: string[];
}

// ============================================
// THEME GENERATOR
// ============================================

export async function generateThemeProject(config: ThemeConfig): Promise<GenerationResult> {
  const basePath = `themes/${config.slug}`;
  const filesCreated: string[] = [];
  const errors: string[] = [];

  try {
    // Create directory structure
    const directories = [
      basePath,
      `${basePath}/templates`,
      `${basePath}/partials`,
      `${basePath}/assets`,
      `${basePath}/assets/css`,
      `${basePath}/assets/js`,
      `${basePath}/assets/images`,
    ];

    for (const dir of directories) {
      await createFile(dir, 'folder');
    }

    // Generate theme.json
    const themeJson = {
      name: config.name,
      slug: config.slug,
      description: config.description,
      author: config.author,
      version: config.version,
      rustpressVersion: '>=1.0.0',
      template: config.template,
      colorScheme: config.colorScheme,
      colors: {
        primary: config.primaryColor,
        secondary: config.secondaryColor,
      },
      typography: {
        fontFamily: config.fontFamily,
      },
      features: config.features,
      responsive: config.responsive,
      templates: [
        'templates/base.html',
        'templates/home.html',
        'templates/post.html',
        'templates/page.html',
        'templates/archive.html',
        'templates/404.html',
      ],
      partials: [
        'partials/header.html',
        'partials/footer.html',
        'partials/sidebar.html',
        'partials/nav.html',
      ],
      assets: {
        css: ['assets/css/style.css', 'assets/css/variables.css'],
        js: ['assets/js/main.js'],
      },
    };

    await writeFile(`${basePath}/theme.json`, JSON.stringify(themeJson, null, 2));
    filesCreated.push(`${basePath}/theme.json`);

    // Generate CSS variables
    const variablesCss = generateThemeVariables(config);
    await writeFile(`${basePath}/assets/css/variables.css`, variablesCss);
    filesCreated.push(`${basePath}/assets/css/variables.css`);

    // Generate main stylesheet
    const styleCss = generateThemeStyles(config);
    await writeFile(`${basePath}/assets/css/style.css`, styleCss);
    filesCreated.push(`${basePath}/assets/css/style.css`);

    // Generate JavaScript
    const mainJs = generateThemeJs(config);
    await writeFile(`${basePath}/assets/js/main.js`, mainJs);
    filesCreated.push(`${basePath}/assets/js/main.js`);

    // Generate base template
    const baseHtml = generateBaseTemplate(config);
    await writeFile(`${basePath}/templates/base.html`, baseHtml);
    filesCreated.push(`${basePath}/templates/base.html`);

    // Generate home template
    const homeHtml = generateHomeTemplate(config);
    await writeFile(`${basePath}/templates/home.html`, homeHtml);
    filesCreated.push(`${basePath}/templates/home.html`);

    // Generate post template
    const postHtml = generatePostTemplate(config);
    await writeFile(`${basePath}/templates/post.html`, postHtml);
    filesCreated.push(`${basePath}/templates/post.html`);

    // Generate page template
    const pageHtml = generatePageTemplate(config);
    await writeFile(`${basePath}/templates/page.html`, pageHtml);
    filesCreated.push(`${basePath}/templates/page.html`);

    // Generate archive template
    const archiveHtml = generateArchiveTemplate(config);
    await writeFile(`${basePath}/templates/archive.html`, archiveHtml);
    filesCreated.push(`${basePath}/templates/archive.html`);

    // Generate 404 template
    const notFoundHtml = generate404Template(config);
    await writeFile(`${basePath}/templates/404.html`, notFoundHtml);
    filesCreated.push(`${basePath}/templates/404.html`);

    // Generate partials
    const headerHtml = generateHeaderPartial(config);
    await writeFile(`${basePath}/partials/header.html`, headerHtml);
    filesCreated.push(`${basePath}/partials/header.html`);

    const footerHtml = generateFooterPartial(config);
    await writeFile(`${basePath}/partials/footer.html`, footerHtml);
    filesCreated.push(`${basePath}/partials/footer.html`);

    const sidebarHtml = generateSidebarPartial(config);
    await writeFile(`${basePath}/partials/sidebar.html`, sidebarHtml);
    filesCreated.push(`${basePath}/partials/sidebar.html`);

    const navHtml = generateNavPartial(config);
    await writeFile(`${basePath}/partials/nav.html`, navHtml);
    filesCreated.push(`${basePath}/partials/nav.html`);

    return { success: true, projectPath: basePath, filesCreated, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, projectPath: basePath, filesCreated, errors };
  }
}

// Theme template generators
function generateThemeVariables(config: ThemeConfig): string {
  return `/* ${config.name} - CSS Variables */
/* Generated by RustPress IDE */

:root {
  /* Colors */
  --color-primary: ${config.primaryColor};
  --color-primary-light: ${lightenColor(config.primaryColor, 20)};
  --color-primary-dark: ${darkenColor(config.primaryColor, 20)};
  --color-secondary: ${config.secondaryColor};
  --color-secondary-light: ${lightenColor(config.secondaryColor, 20)};
  --color-secondary-dark: ${darkenColor(config.secondaryColor, 20)};

  /* Light theme */
  --color-background: #ffffff;
  --color-surface: #f8fafc;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;

  /* Typography */
  --font-family: '${config.fontFamily}', system-ui, -apple-system, sans-serif;
  --font-size-base: 16px;
  --font-size-sm: 0.875rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Border radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;
}

${config.colorScheme !== 'light' ? `
/* Dark theme */
[data-theme="dark"],
.dark {
  --color-background: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-border: #334155;
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-background: #0f172a;
    --color-surface: #1e293b;
    --color-text: #f1f5f9;
    --color-text-muted: #94a3b8;
    --color-border: #334155;
  }
}
` : ''}
`;
}

function generateThemeStyles(config: ThemeConfig): string {
  return `/* ${config.name} - Main Stylesheet */
/* Generated by RustPress IDE */

@import url('./variables.css');
${config.fontFamily !== 'system-ui' ? `@import url('https://fonts.googleapis.com/css2?family=${config.fontFamily.replace(/ /g, '+')}:wght@400;500;600;700&display=swap');` : ''}

/* Reset & Base */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: var(--font-size-base);
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family);
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
  min-height: 100vh;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600;
  line-height: 1.3;
  margin-bottom: var(--spacing-md);
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
  margin-bottom: var(--spacing-md);
}

a {
  color: var(--color-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--color-primary-dark);
}

/* Layout */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.main-content {
  min-height: calc(100vh - 200px);
  padding: var(--spacing-2xl) 0;
}

/* Components */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
}

.btn-secondary {
  background-color: var(--color-secondary);
  color: white;
}

.btn-secondary:hover {
  background-color: var(--color-secondary-dark);
}

.card {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
}

/* Utilities */
.text-center { text-align: center; }
.text-muted { color: var(--color-text-muted); }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.gap-sm { gap: var(--spacing-sm); }
.gap-md { gap: var(--spacing-md); }
.gap-lg { gap: var(--spacing-lg); }

${config.responsive ? `
/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: 0 var(--spacing-md);
  }

  h1 { font-size: var(--font-size-3xl); }
  h2 { font-size: var(--font-size-2xl); }
  h3 { font-size: var(--font-size-xl); }
}

@media (max-width: 480px) {
  h1 { font-size: var(--font-size-2xl); }
  h2 { font-size: var(--font-size-xl); }
}
` : ''}

${config.features.includes('animations') ? `
/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn var(--transition-normal) ease-out;
}

.animate-slide-up {
  animation: slideUp var(--transition-normal) ease-out;
}
` : ''}
`;
}

function generateThemeJs(config: ThemeConfig): string {
  return `/**
 * ${config.name} - Main JavaScript
 * Generated by RustPress IDE
 */

(function() {
  'use strict';

  // DOM Ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    console.log('${config.name} theme loaded');
    ${config.features.includes('dark-mode') ? `
    initDarkMode();` : ''}
    ${config.features.includes('animations') ? `
    initAnimations();` : ''}
    initMobileNav();
  }
${config.features.includes('dark-mode') ? `
  // Dark Mode Toggle
  function initDarkMode() {
    const toggle = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    // Set initial theme
    if (savedTheme) {
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else if (prefersDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (toggle) {
      toggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
      });
    }
  }
` : ''}
${config.features.includes('animations') ? `
  // Scroll Animations
  function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-slide-up');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }
` : ''}
  // Mobile Navigation
  function initMobileNav() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileNav = document.getElementById('mobile-nav');

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded',
          mobileNav.classList.contains('active').toString()
        );
      });
    }
  }
})();
`;
}

function generateBaseTemplate(config: ThemeConfig): string {
  return `<!DOCTYPE html>
<html lang="{{ site.language | default: 'en' }}"${config.colorScheme === 'both' ? ' data-theme="light"' : ''}>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}{{ page.title }} | {{ site.name }}{% endblock %}</title>
  <meta name="description" content="{{ page.description | default: site.description }}">
  ${config.features.includes('seo') ? `
  <!-- SEO Meta Tags -->
  <meta property="og:title" content="{{ page.title | default: site.name }}">
  <meta property="og:description" content="{{ page.description | default: site.description }}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="{{ page.url }}">
  <meta name="twitter:card" content="summary_large_image">` : ''}

  <!-- Styles -->
  <link rel="stylesheet" href="/themes/${config.slug}/assets/css/style.css">
  {% block styles %}{% endblock %}
</head>
<body>
  {% include "partials/header.html" %}

  <main class="main-content">
    {% block content %}{% endblock %}
  </main>

  {% include "partials/footer.html" %}

  <!-- Scripts -->
  <script src="/themes/${config.slug}/assets/js/main.js"></script>
  {% block scripts %}{% endblock %}
</body>
</html>
`;
}

function generateHomeTemplate(config: ThemeConfig): string {
  const heroSection = config.template === 'landing' ? `
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1 class="hero-title"${config.features.includes('animations') ? ' data-animate' : ''}>{{ site.name }}</h1>
      <p class="hero-subtitle text-muted"${config.features.includes('animations') ? ' data-animate' : ''}>{{ site.tagline }}</p>
      <div class="hero-actions"${config.features.includes('animations') ? ' data-animate' : ''}>
        <a href="#" class="btn btn-primary">Get Started</a>
        <a href="#" class="btn btn-secondary">Learn More</a>
      </div>
    </div>
  </section>` : '';

  const blogSection = config.template === 'blog' ? `
  <!-- Latest Posts -->
  <section class="latest-posts">
    <div class="container">
      <h2>Latest Posts</h2>
      <div class="posts-grid">
        {% for post in posts limit:6 %}
        <article class="card post-card"${config.features.includes('animations') ? ' data-animate' : ''}>
          {% if post.featured_image %}
          <img src="{{ post.featured_image }}" alt="{{ post.title }}" class="post-image">
          {% endif %}
          <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
          <p class="text-muted">{{ post.excerpt | truncate: 120 }}</p>
          <time class="text-muted">{{ post.date | date: "%B %d, %Y" }}</time>
        </article>
        {% endfor %}
      </div>
    </div>
  </section>` : '';

  return `{% extends "base.html" %}

{% block title %}Home | {{ site.name }}{% endblock %}

{% block content %}
${heroSection}
${blogSection}

<section class="content-section">
  <div class="container">
    {{ content }}
  </div>
</section>
{% endblock %}
`;
}

function generatePostTemplate(config: ThemeConfig): string {
  return `{% extends "base.html" %}

{% block title %}{{ post.title }} | {{ site.name }}{% endblock %}

{% block content %}
<article class="post">
  <div class="container">
    <header class="post-header">
      <h1 class="post-title"${config.features.includes('animations') ? ' data-animate' : ''}>{{ post.title }}</h1>
      <div class="post-meta text-muted">
        <span>By {{ post.author.name }}</span>
        <span>•</span>
        <time datetime="{{ post.date | date: '%Y-%m-%d' }}">{{ post.date | date: "%B %d, %Y" }}</time>
        {% if post.categories.size > 0 %}
        <span>•</span>
        <span>{{ post.categories | join: ", " }}</span>
        {% endif %}
      </div>
    </header>

    {% if post.featured_image %}
    <figure class="post-featured-image">
      <img src="{{ post.featured_image }}" alt="{{ post.title }}">
    </figure>
    {% endif %}

    <div class="post-content">
      {{ post.content }}
    </div>

    {% if post.tags.size > 0 %}
    <footer class="post-footer">
      <div class="post-tags">
        {% for tag in post.tags %}
        <a href="/tag/{{ tag | slugify }}" class="tag">{{ tag }}</a>
        {% endfor %}
      </div>
    </footer>
    {% endif %}
  </div>
</article>
{% endblock %}
`;
}

function generatePageTemplate(config: ThemeConfig): string {
  return `{% extends "base.html" %}

{% block title %}{{ page.title }} | {{ site.name }}{% endblock %}

{% block content %}
<div class="page">
  <div class="container">
    <header class="page-header">
      <h1 class="page-title"${config.features.includes('animations') ? ' data-animate' : ''}>{{ page.title }}</h1>
    </header>

    <div class="page-content">
      {{ page.content }}
    </div>
  </div>
</div>
{% endblock %}
`;
}

function generateArchiveTemplate(config: ThemeConfig): string {
  return `{% extends "base.html" %}

{% block title %}{{ archive.title | default: "Archive" }} | {{ site.name }}{% endblock %}

{% block content %}
<div class="archive">
  <div class="container">
    <header class="archive-header">
      <h1 class="archive-title">{{ archive.title | default: "Archive" }}</h1>
      {% if archive.description %}
      <p class="archive-description text-muted">{{ archive.description }}</p>
      {% endif %}
    </header>

    <div class="posts-grid">
      {% for post in posts %}
      <article class="card post-card"${config.features.includes('animations') ? ' data-animate' : ''}>
        {% if post.featured_image %}
        <img src="{{ post.featured_image }}" alt="{{ post.title }}" class="post-image">
        {% endif %}
        <h3><a href="{{ post.url }}">{{ post.title }}</a></h3>
        <p class="text-muted">{{ post.excerpt | truncate: 120 }}</p>
        <time class="text-muted">{{ post.date | date: "%B %d, %Y" }}</time>
      </article>
      {% endfor %}
    </div>

    {% if paginator.total_pages > 1 %}
    <nav class="pagination">
      {% if paginator.previous_page %}
      <a href="{{ paginator.previous_page_path }}" class="btn">← Previous</a>
      {% endif %}
      <span class="text-muted">Page {{ paginator.page }} of {{ paginator.total_pages }}</span>
      {% if paginator.next_page %}
      <a href="{{ paginator.next_page_path }}" class="btn">Next →</a>
      {% endif %}
    </nav>
    {% endif %}
  </div>
</div>
{% endblock %}
`;
}

function generate404Template(config: ThemeConfig): string {
  return `{% extends "base.html" %}

{% block title %}Page Not Found | {{ site.name }}{% endblock %}

{% block content %}
<div class="error-page">
  <div class="container text-center">
    <h1 class="error-code"${config.features.includes('animations') ? ' data-animate' : ''}>404</h1>
    <h2 class="error-title"${config.features.includes('animations') ? ' data-animate' : ''}>Page Not Found</h2>
    <p class="error-message text-muted"${config.features.includes('animations') ? ' data-animate' : ''}>
      The page you're looking for doesn't exist or has been moved.
    </p>
    <a href="/" class="btn btn-primary">Go Home</a>
  </div>
</div>
{% endblock %}
`;
}

function generateHeaderPartial(config: ThemeConfig): string {
  return `<header class="site-header">
  <div class="container flex justify-between items-center">
    <a href="/" class="site-logo">
      {% if site.logo %}
      <img src="{{ site.logo }}" alt="{{ site.name }}">
      {% else %}
      <span>{{ site.name }}</span>
      {% endif %}
    </a>

    <button id="menu-toggle" class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false">
      <span></span>
      <span></span>
      <span></span>
    </button>

    {% include "partials/nav.html" %}
    ${config.features.includes('dark-mode') ? `
    <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">
      <svg class="sun-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>
      <svg class="moon-icon" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
    </button>` : ''}
  </div>
</header>
`;
}

function generateFooterPartial(config: ThemeConfig): string {
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-content">
      <div class="footer-info">
        <p>© {{ "now" | date: "%Y" }} {{ site.name }}. All rights reserved.</p>
      </div>
      <nav class="footer-nav">
        <a href="/privacy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
        <a href="/contact">Contact</a>
      </nav>
    </div>
  </div>
</footer>
`;
}

function generateSidebarPartial(config: ThemeConfig): string {
  return `<aside class="sidebar">
  {% if sidebar.widgets.size > 0 %}
    {% for widget in sidebar.widgets %}
    <div class="widget card">
      {% if widget.title %}
      <h4 class="widget-title">{{ widget.title }}</h4>
      {% endif %}
      {{ widget.content }}
    </div>
    {% endfor %}
  {% endif %}
</aside>
`;
}

function generateNavPartial(config: ThemeConfig): string {
  return `<nav class="main-nav" id="mobile-nav">
  <ul class="nav-list">
    {% for item in navigation.main %}
    <li class="nav-item{% if item.children.size > 0 %} has-children{% endif %}">
      <a href="{{ item.url }}"{% if item.url == page.url %} class="active"{% endif %}>
        {{ item.title }}
      </a>
      {% if item.children.size > 0 %}
      <ul class="nav-submenu">
        {% for child in item.children %}
        <li><a href="{{ child.url }}">{{ child.title }}</a></li>
        {% endfor %}
      </ul>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
</nav>
`;
}

// ============================================
// PLUGIN GENERATOR
// ============================================

export async function generatePluginProject(config: PluginConfig): Promise<GenerationResult> {
  const basePath = `plugins/${config.slug}`;
  const filesCreated: string[] = [];
  const errors: string[] = [];

  try {
    // Create directory structure
    const directories = [basePath];

    if (config.language === 'rust' || config.language === 'both') {
      directories.push(`${basePath}/src`);
    }
    if (config.language === 'typescript' || config.language === 'both') {
      directories.push(`${basePath}/src`);
    }
    if (config.hasAdminPage || config.hasSettings) {
      directories.push(`${basePath}/admin`);
    }
    if (config.apiEndpoints) {
      directories.push(`${basePath}/api`);
    }

    for (const dir of directories) {
      await createFile(dir, 'folder');
    }

    // Generate plugin.json
    const pluginJson = {
      name: config.name,
      slug: config.slug,
      description: config.description,
      version: config.version,
      author: config.author,
      authorUri: config.authorUri,
      license: config.license,
      category: config.category,
      minRustPressVersion: config.minRustPressVersion,
      language: config.language,
      hooks: config.hooks,
      features: {
        settings: config.hasSettings,
        adminPage: config.hasAdminPage,
        apiEndpoints: config.apiEndpoints,
        databaseTables: config.databaseTables,
        cronJobs: config.cronJobs,
      },
      entryPoints: {
        ...(config.language !== 'typescript' && { rust: 'src/lib.rs' }),
        ...(config.language !== 'rust' && { typescript: 'src/index.ts' }),
      },
    };

    await writeFile(`${basePath}/plugin.json`, JSON.stringify(pluginJson, null, 2));
    filesCreated.push(`${basePath}/plugin.json`);

    // Generate Rust code if needed
    if (config.language === 'rust' || config.language === 'both') {
      const cargoToml = generatePluginCargoToml(config);
      await writeFile(`${basePath}/Cargo.toml`, cargoToml);
      filesCreated.push(`${basePath}/Cargo.toml`);

      const libRs = generatePluginLibRs(config);
      await writeFile(`${basePath}/src/lib.rs`, libRs);
      filesCreated.push(`${basePath}/src/lib.rs`);
    }

    // Generate TypeScript code if needed
    if (config.language === 'typescript' || config.language === 'both') {
      const packageJson = generatePluginPackageJson(config);
      await writeFile(`${basePath}/package.json`, JSON.stringify(packageJson, null, 2));
      filesCreated.push(`${basePath}/package.json`);

      const indexTs = generatePluginIndexTs(config);
      await writeFile(`${basePath}/src/index.ts`, indexTs);
      filesCreated.push(`${basePath}/src/index.ts`);

      const tsconfigJson = generatePluginTsConfig();
      await writeFile(`${basePath}/tsconfig.json`, JSON.stringify(tsconfigJson, null, 2));
      filesCreated.push(`${basePath}/tsconfig.json`);
    }

    // Generate settings page if needed
    if (config.hasSettings) {
      const settingsTs = generatePluginSettings(config);
      await writeFile(`${basePath}/admin/settings.tsx`, settingsTs);
      filesCreated.push(`${basePath}/admin/settings.tsx`);
    }

    // Generate API endpoints if needed
    if (config.apiEndpoints) {
      const apiRs = generatePluginApi(config);
      await writeFile(`${basePath}/api/routes.rs`, apiRs);
      filesCreated.push(`${basePath}/api/routes.rs`);
    }

    // Generate README
    const readme = generatePluginReadme(config);
    await writeFile(`${basePath}/README.md`, readme);
    filesCreated.push(`${basePath}/README.md`);

    return { success: true, projectPath: basePath, filesCreated, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, projectPath: basePath, filesCreated, errors };
  }
}

function generatePluginCargoToml(config: PluginConfig): string {
  return `[package]
name = "${config.slug}"
version = "${config.version}"
edition = "2021"
authors = ["${config.author}"]
description = "${config.description}"
license = "${config.license}"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
rustpress-sdk = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
async-trait = "0.1"
${config.apiEndpoints ? 'axum = "0.7"\ntokio = { version = "1", features = ["full"] }' : ''}
${config.databaseTables ? 'sqlx = { version = "0.7", features = ["postgres", "runtime-tokio"] }' : ''}

[dev-dependencies]
tokio-test = "0.4"
`;
}

function generatePluginLibRs(config: PluginConfig): string {
  const hookImpls = config.hooks.map(hook => {
    switch (hook) {
      case 'init':
        return `    async fn on_init(&self, ctx: &mut PluginContext) -> Result<()> {
        tracing::info!("${config.name} initialized");
        Ok(())
    }`;
      case 'activate':
        return `    async fn on_activate(&self, ctx: &mut PluginContext) -> Result<()> {
        tracing::info!("${config.name} activated");
        Ok(())
    }`;
      case 'deactivate':
        return `    async fn on_deactivate(&self, ctx: &mut PluginContext) -> Result<()> {
        tracing::info!("${config.name} deactivated");
        Ok(())
    }`;
      case 'content_save':
        return `    async fn on_content_save(&self, content: &mut Content) -> Result<()> {
        // Process content before saving
        Ok(())
    }`;
      case 'content_render':
        return `    async fn on_content_render(&self, content: &Content, output: &mut String) -> Result<()> {
        // Modify rendered output
        Ok(())
    }`;
      default:
        return '';
    }
  }).filter(Boolean).join('\n\n');

  return `//! ${config.name}
//! ${config.description}
//!
//! Author: ${config.author}
//! Version: ${config.version}
//! License: ${config.license}

use rustpress_sdk::prelude::*;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};

/// Plugin metadata
pub const PLUGIN_INFO: PluginInfo = PluginInfo {
    name: "${config.name}",
    slug: "${config.slug}",
    version: "${config.version}",
    author: "${config.author}",
    description: "${config.description}",
};
${config.hasSettings ? `
/// Plugin settings
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Settings {
    pub enabled: bool,
    // Add your settings fields here
}
` : ''}
/// Main plugin struct
pub struct ${toPascalCase(config.slug)}Plugin {
    ${config.hasSettings ? 'settings: Settings,' : ''}
}

impl ${toPascalCase(config.slug)}Plugin {
    pub fn new() -> Self {
        Self {
            ${config.hasSettings ? 'settings: Settings::default(),' : ''}
        }
    }
}

#[async_trait]
impl Plugin for ${toPascalCase(config.slug)}Plugin {
    fn info(&self) -> &PluginInfo {
        &PLUGIN_INFO
    }

${hookImpls}
}

/// Plugin entry point
#[no_mangle]
pub extern "C" fn create_plugin() -> Box<dyn Plugin> {
    Box::new(${toPascalCase(config.slug)}Plugin::new())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_plugin_info() {
        let plugin = ${toPascalCase(config.slug)}Plugin::new();
        assert_eq!(plugin.info().name, "${config.name}");
    }
}
`;
}

function generatePluginPackageJson(config: PluginConfig): object {
  return {
    name: `@rustpress/${config.slug}`,
    version: config.version,
    description: config.description,
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch',
      test: 'jest',
    },
    author: config.author,
    license: config.license,
    dependencies: {
      '@rustpress/sdk': '^1.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      jest: '^29.0.0',
      '@types/jest': '^29.0.0',
      'ts-jest': '^29.0.0',
    },
  };
}

function generatePluginTsConfig(): object {
  return {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      lib: ['ES2022'],
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist'],
  };
}

function generatePluginIndexTs(config: PluginConfig): string {
  const hookTypes = config.hooks.map(hook => {
    switch (hook) {
      case 'init':
        return 'onInit';
      case 'activate':
        return 'onActivate';
      case 'deactivate':
        return 'onDeactivate';
      case 'content_save':
        return 'onContentSave';
      case 'content_render':
        return 'onContentRender';
      case 'user_login':
        return 'onUserLogin';
      case 'api_request':
        return 'onApiRequest';
      case 'admin_menu':
        return 'onAdminMenu';
      default:
        return null;
    }
  }).filter(Boolean);

  return `/**
 * ${config.name}
 * ${config.description}
 *
 * @author ${config.author}
 * @version ${config.version}
 * @license ${config.license}
 */

import { Plugin, PluginContext, PluginInfo } from '@rustpress/sdk';
${config.hasSettings ? `
export interface Settings {
  enabled: boolean;
  // Add your settings fields here
}

const defaultSettings: Settings = {
  enabled: true,
};
` : ''}
export const pluginInfo: PluginInfo = {
  name: '${config.name}',
  slug: '${config.slug}',
  version: '${config.version}',
  author: '${config.author}',
  description: '${config.description}',
};

export class ${toPascalCase(config.slug)}Plugin implements Plugin {
  ${config.hasSettings ? 'private settings: Settings = defaultSettings;' : ''}

  getInfo(): PluginInfo {
    return pluginInfo;
  }

${hookTypes.map(hook => `  async ${hook}(ctx: PluginContext): Promise<void> {
    console.log('${config.name}: ${hook} called');
    // Implement your logic here
  }`).join('\n\n')}
}

export default ${toPascalCase(config.slug)}Plugin;
`;
}

function generatePluginSettings(config: PluginConfig): string {
  return `/**
 * ${config.name} - Settings Page
 */

import React, { useState, useEffect } from 'react';
import { usePluginSettings, SettingsForm, Input, Toggle, Button } from '@rustpress/admin-sdk';

interface PluginSettings {
  enabled: boolean;
  // Add your settings fields here
}

export default function SettingsPage() {
  const { settings, saveSettings, loading } = usePluginSettings<PluginSettings>('${config.slug}');
  const [formData, setFormData] = useState<PluginSettings>(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveSettings(formData);
  };

  return (
    <SettingsForm onSubmit={handleSubmit}>
      <h2>${config.name} Settings</h2>

      <Toggle
        label="Enable Plugin"
        checked={formData.enabled}
        onChange={(enabled) => setFormData({ ...formData, enabled })}
      />

      {/* Add more settings fields here */}

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </SettingsForm>
  );
}
`;
}

function generatePluginApi(config: PluginConfig): string {
  return `//! ${config.name} - API Routes

use axum::{
    routing::{get, post},
    Router, Json, Extension,
};
use serde::{Deserialize, Serialize};
use rustpress_sdk::prelude::*;

/// Register plugin API routes
pub fn routes() -> Router {
    Router::new()
        .route("/api/plugins/${config.slug}/status", get(get_status))
        .route("/api/plugins/${config.slug}/action", post(perform_action))
}

#[derive(Serialize)]
struct StatusResponse {
    active: bool,
    version: &'static str,
}

async fn get_status() -> Json<StatusResponse> {
    Json(StatusResponse {
        active: true,
        version: "${config.version}",
    })
}

#[derive(Deserialize)]
struct ActionRequest {
    action: String,
}

#[derive(Serialize)]
struct ActionResponse {
    success: bool,
    message: String,
}

async fn perform_action(
    Json(payload): Json<ActionRequest>,
) -> Json<ActionResponse> {
    // Implement your action logic here
    Json(ActionResponse {
        success: true,
        message: format!("Action '{}' completed", payload.action),
    })
}
`;
}

function generatePluginReadme(config: PluginConfig): string {
  return `# ${config.name}

${config.description}

## Installation

1. Download the plugin from the RustPress marketplace
2. Upload to your \`plugins/\` directory
3. Activate from the admin panel

## Configuration

${config.hasSettings ? 'Navigate to Settings > ' + config.name + ' to configure the plugin.' : 'This plugin requires no configuration.'}

## Features

${config.features.map(f => `- ${f}`).join('\n')}

## Hooks

This plugin uses the following hooks:
${config.hooks.map(h => `- \`${h}\``).join('\n')}

## API Endpoints

${config.apiEndpoints ? `
- \`GET /api/plugins/${config.slug}/status\` - Get plugin status
- \`POST /api/plugins/${config.slug}/action\` - Perform plugin action
` : 'This plugin does not expose any API endpoints.'}

## License

${config.license}

## Author

${config.author}
${config.authorUri ? `\n[${config.authorUri}](${config.authorUri})` : ''}
`;
}

// ============================================
// FUNCTION GENERATOR
// ============================================

export async function generateFunctionProject(config: FunctionConfig): Promise<GenerationResult> {
  const basePath = `functions/${config.slug}`;
  const filesCreated: string[] = [];
  const errors: string[] = [];

  try {
    // Create directory structure
    await createFile(basePath, 'folder');

    // Generate function.json
    const functionJson = {
      name: config.name,
      slug: config.slug,
      description: config.description,
      runtime: config.runtime,
      trigger: {
        type: config.trigger,
        ...(config.trigger === 'http' && {
          method: config.httpMethod,
          path: config.httpPath,
        }),
        ...(config.trigger === 'cron' && {
          schedule: config.cronSchedule,
        }),
        ...(config.trigger === 'event' && {
          eventType: config.eventType,
        }),
      },
      config: {
        timeout: config.timeout,
        memory: config.memory,
        retries: config.retries,
      },
      authentication: config.authentication,
      cors: config.cors,
      logging: config.logging,
      environment: Object.fromEntries(config.environment.map(e => [e.key, e.value])),
    };

    await writeFile(`${basePath}/function.json`, JSON.stringify(functionJson, null, 2));
    filesCreated.push(`${basePath}/function.json`);

    // Generate function code based on runtime
    switch (config.runtime) {
      case 'rust':
        const cargoToml = generateFunctionCargoToml(config);
        await writeFile(`${basePath}/Cargo.toml`, cargoToml);
        filesCreated.push(`${basePath}/Cargo.toml`);

        await createFile(`${basePath}/src`, 'folder');
        const mainRs = generateFunctionRust(config);
        await writeFile(`${basePath}/src/main.rs`, mainRs);
        filesCreated.push(`${basePath}/src/main.rs`);
        break;

      case 'typescript':
        const packageJson = generateFunctionPackageJson(config);
        await writeFile(`${basePath}/package.json`, JSON.stringify(packageJson, null, 2));
        filesCreated.push(`${basePath}/package.json`);

        const indexTs = generateFunctionTypeScript(config);
        await writeFile(`${basePath}/index.ts`, indexTs);
        filesCreated.push(`${basePath}/index.ts`);

        const tsconfig = generateFunctionTsConfig();
        await writeFile(`${basePath}/tsconfig.json`, JSON.stringify(tsconfig, null, 2));
        filesCreated.push(`${basePath}/tsconfig.json`);
        break;

      case 'python':
        const requirements = generateFunctionRequirements(config);
        await writeFile(`${basePath}/requirements.txt`, requirements);
        filesCreated.push(`${basePath}/requirements.txt`);

        const mainPy = generateFunctionPython(config);
        await writeFile(`${basePath}/main.py`, mainPy);
        filesCreated.push(`${basePath}/main.py`);
        break;
    }

    return { success: true, projectPath: basePath, filesCreated, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, projectPath: basePath, filesCreated, errors };
  }
}

function generateFunctionCargoToml(config: FunctionConfig): string {
  return `[package]
name = "${config.slug}"
version = "0.1.0"
edition = "2021"

[dependencies]
rustpress-functions = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
tracing = "0.1"
${config.trigger === 'http' ? 'axum = "0.7"' : ''}
${config.authentication !== 'none' ? 'jsonwebtoken = "9.0"' : ''}
`;
}

function generateFunctionRust(config: FunctionConfig): string {
  if (config.trigger === 'http') {
    return `//! ${config.name}
//! ${config.description}

use rustpress_functions::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize)]
struct Response {
    success: bool,
    message: String,
    data: Option<serde_json::Value>,
}

${config.httpMethod === 'POST' || config.httpMethod === 'PUT' ? `
#[derive(Debug, Deserialize)]
struct RequestBody {
    // Add your request fields here
}
` : ''}
#[rustpress_function(
    trigger = "http",
    method = "${config.httpMethod || 'GET'}",
    path = "${config.httpPath || '/api/function'}",
    ${config.authentication !== 'none' ? `auth = "${config.authentication}",` : ''}
    ${config.cors ? 'cors = true,' : ''}
    timeout = ${config.timeout}
)]
pub async fn handler(${config.httpMethod === 'POST' || config.httpMethod === 'PUT' ? 'body: Json<RequestBody>' : ''}) -> Json<Response> {
    tracing::info!("${config.name} called");

    // Your function logic here

    Json(Response {
        success: true,
        message: "Function executed successfully".to_string(),
        data: None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_handler() {
        // Add your tests here
    }
}
`;
  } else if (config.trigger === 'cron') {
    return `//! ${config.name}
//! ${config.description}

use rustpress_functions::prelude::*;

#[rustpress_function(
    trigger = "cron",
    schedule = "${config.cronSchedule}",
    timeout = ${config.timeout}
)]
pub async fn handler() -> Result<(), FunctionError> {
    tracing::info!("${config.name} scheduled task running");

    // Your scheduled task logic here

    Ok(())
}
`;
  } else {
    return `//! ${config.name}
//! ${config.description}

use rustpress_functions::prelude::*;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct EventPayload {
    // Add your event payload fields here
}

#[rustpress_function(
    trigger = "${config.trigger}",
    ${config.trigger === 'event' ? `event_type = "${config.eventType}",` : ''}
    timeout = ${config.timeout}
)]
pub async fn handler(event: Event<EventPayload>) -> Result<(), FunctionError> {
    tracing::info!("${config.name} triggered by ${config.trigger}");

    // Your event handler logic here

    Ok(())
}
`;
  }
}

function generateFunctionPackageJson(config: FunctionConfig): object {
  return {
    name: config.slug,
    version: '0.1.0',
    description: config.description,
    main: 'dist/index.js',
    scripts: {
      build: 'tsc',
      dev: 'ts-node index.ts',
      test: 'jest',
    },
    dependencies: {
      '@rustpress/functions-sdk': '^1.0.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      'ts-node': '^10.0.0',
    },
  };
}

function generateFunctionTsConfig(): object {
  return {
    compilerOptions: {
      target: 'ES2022',
      module: 'commonjs',
      outDir: './dist',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
    },
    include: ['*.ts'],
    exclude: ['node_modules'],
  };
}

function generateFunctionTypeScript(config: FunctionConfig): string {
  if (config.trigger === 'http') {
    return `/**
 * ${config.name}
 * ${config.description}
 */

import { HttpFunction, Request, Response } from '@rustpress/functions-sdk';

interface ResponseData {
  success: boolean;
  message: string;
  data?: unknown;
}

export const handler: HttpFunction = async (req: Request, res: Response) => {
  console.log('${config.name} called');

  try {
    // Your function logic here
    ${config.httpMethod === 'POST' || config.httpMethod === 'PUT' ? `
    const body = req.body;
    console.log('Request body:', body);
    ` : ''}
    const response: ResponseData = {
      success: true,
      message: 'Function executed successfully',
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Function error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export default handler;
`;
  } else if (config.trigger === 'cron') {
    return `/**
 * ${config.name}
 * ${config.description}
 *
 * Schedule: ${config.cronSchedule}
 */

import { ScheduledFunction, ScheduledEvent } from '@rustpress/functions-sdk';

export const handler: ScheduledFunction = async (event: ScheduledEvent) => {
  console.log('${config.name} scheduled task running');
  console.log('Scheduled time:', event.scheduledTime);

  try {
    // Your scheduled task logic here

    console.log('Task completed successfully');
  } catch (error) {
    console.error('Task error:', error);
    throw error;
  }
};

export default handler;
`;
  } else {
    return `/**
 * ${config.name}
 * ${config.description}
 */

import { EventFunction, Event } from '@rustpress/functions-sdk';

interface EventPayload {
  // Add your event payload fields here
}

export const handler: EventFunction<EventPayload> = async (event: Event<EventPayload>) => {
  console.log('${config.name} triggered');
  console.log('Event type:', event.type);
  console.log('Event data:', event.data);

  try {
    // Your event handler logic here

    console.log('Event processed successfully');
  } catch (error) {
    console.error('Event processing error:', error);
    throw error;
  }
};

export default handler;
`;
  }
}

function generateFunctionRequirements(config: FunctionConfig): string {
  return `# ${config.name} dependencies
rustpress-functions-sdk>=1.0.0
${config.trigger === 'http' ? 'fastapi>=0.100.0\nuvicorn>=0.23.0' : ''}
${config.authentication !== 'none' ? 'pyjwt>=2.8.0' : ''}
`;
}

function generateFunctionPython(config: FunctionConfig): string {
  if (config.trigger === 'http') {
    return `"""
${config.name}
${config.description}
"""

from rustpress_functions import http_function, Request, Response
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@http_function(
    method="${config.httpMethod || 'GET'}",
    path="${config.httpPath || '/api/function'}",
    ${config.authentication !== 'none' ? `auth="${config.authentication}",` : ''}
    ${config.cors ? 'cors=True,' : ''}
    timeout=${config.timeout}
)
async def handler(request: Request) -> Response:
    """Handle HTTP request."""
    logger.info("${config.name} called")

    try:
        # Your function logic here
        ${config.httpMethod === 'POST' || config.httpMethod === 'PUT' ? `
        body = await request.json()
        logger.info(f"Request body: {body}")
        ` : ''}
        return Response(
            status_code=200,
            body={
                "success": True,
                "message": "Function executed successfully"
            }
        )
    except Exception as e:
        logger.error(f"Function error: {e}")
        return Response(
            status_code=500,
            body={
                "success": False,
                "message": str(e)
            }
        )


if __name__ == "__main__":
    # For local testing
    import asyncio
    asyncio.run(handler(Request()))
`;
  } else if (config.trigger === 'cron') {
    return `"""
${config.name}
${config.description}

Schedule: ${config.cronSchedule}
"""

from rustpress_functions import scheduled_function, ScheduledEvent
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@scheduled_function(
    schedule="${config.cronSchedule}",
    timeout=${config.timeout}
)
async def handler(event: ScheduledEvent) -> None:
    """Handle scheduled task."""
    logger.info("${config.name} scheduled task running")
    logger.info(f"Scheduled time: {event.scheduled_time}")

    try:
        # Your scheduled task logic here

        logger.info("Task completed successfully")
    except Exception as e:
        logger.error(f"Task error: {e}")
        raise


if __name__ == "__main__":
    # For local testing
    import asyncio
    asyncio.run(handler(ScheduledEvent()))
`;
  } else {
    return `"""
${config.name}
${config.description}
"""

from rustpress_functions import event_function, Event
from typing import Any, Dict
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@event_function(
    event_type="${config.eventType || 'custom.event'}",
    timeout=${config.timeout}
)
async def handler(event: Event[Dict[str, Any]]) -> None:
    """Handle event."""
    logger.info("${config.name} triggered")
    logger.info(f"Event type: {event.type}")
    logger.info(f"Event data: {event.data}")

    try:
        # Your event handler logic here

        logger.info("Event processed successfully")
    except Exception as e:
        logger.error(f"Event processing error: {e}")
        raise


if __name__ == "__main__":
    # For local testing
    import asyncio
    asyncio.run(handler(Event(type="${config.eventType}", data={})))
`;
  }
}

// ============================================
// APP GENERATOR
// ============================================

export async function generateAppProject(config: AppConfig): Promise<GenerationResult> {
  const basePath = `apps/${config.slug}`;
  const filesCreated: string[] = [];
  const errors: string[] = [];

  try {
    // Create directory structure
    const directories = [
      basePath,
      `${basePath}/src`,
      `${basePath}/src/components`,
      `${basePath}/src/hooks`,
      `${basePath}/src/utils`,
      `${basePath}/public`,
    ];

    if (config.hasRustBackend) {
      directories.push(`${basePath}/backend`);
      directories.push(`${basePath}/backend/src`);
    }

    for (const dir of directories) {
      await createFile(dir, 'folder');
    }

    // Generate app.json
    const appJson = {
      name: config.name,
      slug: config.slug,
      description: config.description,
      shortDescription: config.shortDescription,
      version: config.version,
      author: config.author,
      authorUrl: config.authorUrl,
      category: config.category,
      icon: config.icon,
      pricing: config.pricing,
      permissions: config.permissions,
      framework: config.framework,
      features: config.features,
      hasRustBackend: config.hasRustBackend,
      hasDatabaseTables: config.hasDatabaseTables,
      entryPoint: config.framework === 'vanilla' ? 'src/index.js' : 'src/App.tsx',
    };

    await writeFile(`${basePath}/app.json`, JSON.stringify(appJson, null, 2));
    filesCreated.push(`${basePath}/app.json`);

    // Generate package.json
    const packageJson = generateAppPackageJson(config);
    await writeFile(`${basePath}/package.json`, JSON.stringify(packageJson, null, 2));
    filesCreated.push(`${basePath}/package.json`);

    // Generate framework-specific files
    switch (config.framework) {
      case 'react':
        const appTsx = generateReactApp(config);
        await writeFile(`${basePath}/src/App.tsx`, appTsx);
        filesCreated.push(`${basePath}/src/App.tsx`);

        const indexTsx = generateReactIndex(config);
        await writeFile(`${basePath}/src/index.tsx`, indexTsx);
        filesCreated.push(`${basePath}/src/index.tsx`);

        const tsconfig = generateAppTsConfig();
        await writeFile(`${basePath}/tsconfig.json`, JSON.stringify(tsconfig, null, 2));
        filesCreated.push(`${basePath}/tsconfig.json`);
        break;

      case 'vue':
        const appVue = generateVueApp(config);
        await writeFile(`${basePath}/src/App.vue`, appVue);
        filesCreated.push(`${basePath}/src/App.vue`);

        const mainTs = generateVueMain(config);
        await writeFile(`${basePath}/src/main.ts`, mainTs);
        filesCreated.push(`${basePath}/src/main.ts`);
        break;

      case 'svelte':
        const appSvelte = generateSvelteApp(config);
        await writeFile(`${basePath}/src/App.svelte`, appSvelte);
        filesCreated.push(`${basePath}/src/App.svelte`);

        const mainSvelte = generateSvelteMain(config);
        await writeFile(`${basePath}/src/main.ts`, mainSvelte);
        filesCreated.push(`${basePath}/src/main.ts`);
        break;

      case 'vanilla':
        const indexJs = generateVanillaApp(config);
        await writeFile(`${basePath}/src/index.js`, indexJs);
        filesCreated.push(`${basePath}/src/index.js`);

        const indexHtml = generateVanillaHtml(config);
        await writeFile(`${basePath}/public/index.html`, indexHtml);
        filesCreated.push(`${basePath}/public/index.html`);
        break;
    }

    // Generate styles
    const stylesCss = generateAppStyles(config);
    await writeFile(`${basePath}/src/styles.css`, stylesCss);
    filesCreated.push(`${basePath}/src/styles.css`);

    // Generate Rust backend if needed
    if (config.hasRustBackend) {
      const backendCargo = generateAppBackendCargo(config);
      await writeFile(`${basePath}/backend/Cargo.toml`, backendCargo);
      filesCreated.push(`${basePath}/backend/Cargo.toml`);

      const backendLib = generateAppBackendLib(config);
      await writeFile(`${basePath}/backend/src/lib.rs`, backendLib);
      filesCreated.push(`${basePath}/backend/src/lib.rs`);
    }

    // Generate settings component if needed
    if (config.includeSettings) {
      const settingsComponent = generateAppSettings(config);
      await writeFile(`${basePath}/src/components/Settings.tsx`, settingsComponent);
      filesCreated.push(`${basePath}/src/components/Settings.tsx`);
    }

    return { success: true, projectPath: basePath, filesCreated, errors };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, projectPath: basePath, filesCreated, errors };
  }
}

function generateAppPackageJson(config: AppConfig): object {
  const base: Record<string, unknown> = {
    name: `@rustpress-apps/${config.slug}`,
    version: config.version,
    description: config.description,
    private: true,
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview',
    },
    devDependencies: {
      vite: '^5.0.0',
    },
  };

  switch (config.framework) {
    case 'react':
      base.dependencies = {
        react: '^18.2.0',
        'react-dom': '^18.2.0',
        '@rustpress/app-sdk': '^1.0.0',
      };
      base.devDependencies = {
        ...base.devDependencies as object,
        '@vitejs/plugin-react': '^4.0.0',
        typescript: '^5.0.0',
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0',
      };
      break;

    case 'vue':
      base.dependencies = {
        vue: '^3.3.0',
        '@rustpress/app-sdk': '^1.0.0',
      };
      base.devDependencies = {
        ...base.devDependencies as object,
        '@vitejs/plugin-vue': '^4.0.0',
        typescript: '^5.0.0',
        'vue-tsc': '^1.8.0',
      };
      break;

    case 'svelte':
      base.dependencies = {
        '@rustpress/app-sdk': '^1.0.0',
      };
      base.devDependencies = {
        ...base.devDependencies as object,
        '@sveltejs/vite-plugin-svelte': '^3.0.0',
        svelte: '^4.0.0',
        typescript: '^5.0.0',
      };
      break;

    case 'vanilla':
      base.dependencies = {
        '@rustpress/app-sdk': '^1.0.0',
      };
      break;
  }

  return base;
}

function generateAppTsConfig(): object {
  return {
    compilerOptions: {
      target: 'ES2022',
      useDefineForClassFields: true,
      lib: ['ES2022', 'DOM', 'DOM.Iterable'],
      module: 'ESNext',
      skipLibCheck: true,
      moduleResolution: 'bundler',
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      jsx: 'react-jsx',
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ['src'],
  };
}

function generateReactApp(config: AppConfig): string {
  return `/**
 * ${config.name}
 * ${config.description}
 */

import React, { useState, useEffect } from 'react';
import { useRustPress } from '@rustpress/app-sdk';
import './styles.css';
${config.includeSettings ? "import Settings from './components/Settings';" : ''}

interface AppState {
  loading: boolean;
  error: string | null;
  data: unknown;
}

export default function App() {
  const { api, user, permissions } = useRustPress();
  const [state, setState] = useState<AppState>({
    loading: true,
    error: null,
    data: null,
  });
  ${config.includeSettings ? "const [showSettings, setShowSettings] = useState(false);" : ''}

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      // Load your app data here
      setState(prev => ({ ...prev, loading: false, data: {} }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  };

  if (state.loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading ${config.name}...</p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="app-error">
        <h2>Error</h2>
        <p>{state.error}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>${config.icon} ${config.name}</h1>
        ${config.includeSettings ? `<button onClick={() => setShowSettings(true)} className="settings-btn">
          Settings
        </button>` : ''}
      </header>

      <main className="app-main">
        <div className="app-content">
          <h2>Welcome to ${config.name}</h2>
          <p>${config.description}</p>

          {/* Your app content here */}
        </div>
      </main>
      ${config.includeSettings ? `
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}` : ''}
    </div>
  );
}
`;
}

function generateReactIndex(config: AppConfig): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import { RustPressProvider } from '@rustpress/app-sdk';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <RustPressProvider appSlug="${config.slug}">
      <App />
    </RustPressProvider>
  </React.StrictMode>
);
`;
}

function generateVueApp(config: AppConfig): string {
  return `<template>
  <div class="app-container">
    <header class="app-header">
      <h1>${config.icon} ${config.name}</h1>
      ${config.includeSettings ? `<button @click="showSettings = true" class="settings-btn">
        Settings
      </button>` : ''}
    </header>

    <main class="app-main">
      <div v-if="loading" class="app-loading">
        <div class="spinner"></div>
        <p>Loading ${config.name}...</p>
      </div>

      <div v-else-if="error" class="app-error">
        <h2>Error</h2>
        <p>{{ error }}</p>
        <button @click="loadData">Retry</button>
      </div>

      <div v-else class="app-content">
        <h2>Welcome to ${config.name}</h2>
        <p>${config.description}</p>

        <!-- Your app content here -->
      </div>
    </main>
    ${config.includeSettings ? `
    <Settings v-if="showSettings" @close="showSettings = false" />` : ''}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRustPress } from '@rustpress/app-sdk';
${config.includeSettings ? "import Settings from './components/Settings.vue';" : ''}

const { api, user, permissions } = useRustPress();

const loading = ref(true);
const error = ref<string | null>(null);
const data = ref<unknown>(null);
${config.includeSettings ? 'const showSettings = ref(false);' : ''}

const loadData = async () => {
  try {
    loading.value = true;
    error.value = null;
    // Load your app data here
    data.value = {};
    loading.value = false;
  } catch (e) {
    loading.value = false;
    error.value = e instanceof Error ? e.message : 'Unknown error';
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
@import './styles.css';
</style>
`;
}

function generateVueMain(config: AppConfig): string {
  return `import { createApp } from 'vue';
import { createRustPressPlugin } from '@rustpress/app-sdk';
import App from './App.vue';

const app = createApp(App);

app.use(createRustPressPlugin({
  appSlug: '${config.slug}',
}));

app.mount('#app');
`;
}

function generateSvelteApp(config: AppConfig): string {
  return `<script lang="ts">
  import { onMount } from 'svelte';
  import { rustpress } from '@rustpress/app-sdk';
  ${config.includeSettings ? "import Settings from './components/Settings.svelte';" : ''}

  let loading = true;
  let error: string | null = null;
  let data: unknown = null;
  ${config.includeSettings ? 'let showSettings = false;' : ''}

  const { api, user, permissions } = rustpress;

  async function loadData() {
    try {
      loading = true;
      error = null;
      // Load your app data here
      data = {};
      loading = false;
    } catch (e) {
      loading = false;
      error = e instanceof Error ? e.message : 'Unknown error';
    }
  }

  onMount(() => {
    loadData();
  });
</script>

<div class="app-container">
  <header class="app-header">
    <h1>${config.icon} ${config.name}</h1>
    ${config.includeSettings ? `<button on:click={() => showSettings = true} class="settings-btn">
      Settings
    </button>` : ''}
  </header>

  <main class="app-main">
    {#if loading}
      <div class="app-loading">
        <div class="spinner"></div>
        <p>Loading ${config.name}...</p>
      </div>
    {:else if error}
      <div class="app-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button on:click={loadData}>Retry</button>
      </div>
    {:else}
      <div class="app-content">
        <h2>Welcome to ${config.name}</h2>
        <p>${config.description}</p>

        <!-- Your app content here -->
      </div>
    {/if}
  </main>
  ${config.includeSettings ? `
  {#if showSettings}
    <Settings on:close={() => showSettings = false} />
  {/if}` : ''}
</div>

<style>
  @import './styles.css';
</style>
`;
}

function generateSvelteMain(config: AppConfig): string {
  return `import { initRustPress } from '@rustpress/app-sdk';
import App from './App.svelte';

initRustPress({
  appSlug: '${config.slug}',
});

const app = new App({
  target: document.getElementById('app')!,
});

export default app;
`;
}

function generateVanillaApp(config: AppConfig): string {
  return `/**
 * ${config.name}
 * ${config.description}
 */

import { initRustPress } from '@rustpress/app-sdk';

const { api, user, permissions } = initRustPress({
  appSlug: '${config.slug}',
});

class ${toPascalCase(config.slug)}App {
  constructor() {
    this.loading = true;
    this.error = null;
    this.data = null;
    this.init();
  }

  async init() {
    this.render();
    await this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      this.error = null;
      this.render();

      // Load your app data here
      this.data = {};

      this.loading = false;
      this.render();
    } catch (e) {
      this.loading = false;
      this.error = e.message || 'Unknown error';
      this.render();
    }
  }

  render() {
    const container = document.getElementById('app');

    if (this.loading) {
      container.innerHTML = \`
        <div class="app-loading">
          <div class="spinner"></div>
          <p>Loading ${config.name}...</p>
        </div>
      \`;
      return;
    }

    if (this.error) {
      container.innerHTML = \`
        <div class="app-error">
          <h2>Error</h2>
          <p>\${this.error}</p>
          <button id="retry-btn">Retry</button>
        </div>
      \`;
      document.getElementById('retry-btn').addEventListener('click', () => this.loadData());
      return;
    }

    container.innerHTML = \`
      <div class="app-container">
        <header class="app-header">
          <h1>${config.icon} ${config.name}</h1>
        </header>
        <main class="app-main">
          <div class="app-content">
            <h2>Welcome to ${config.name}</h2>
            <p>${config.description}</p>
          </div>
        </main>
      </div>
    \`;
  }
}

new ${toPascalCase(config.slug)}App();
`;
}

function generateVanillaHtml(config: AppConfig): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.name}</title>
  <link rel="stylesheet" href="../src/styles.css">
</head>
<body>
  <div id="app"></div>
  <script type="module" src="../src/index.js"></script>
</body>
</html>
`;
}

function generateAppStyles(config: AppConfig): string {
  return `/* ${config.name} - Styles */

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: system-ui, -apple-system, sans-serif;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: #1e293b;
  color: white;
  border-bottom: 1px solid #334155;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.settings-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.settings-btn:hover {
  background: #2563eb;
}

.app-main {
  flex: 1;
  padding: 2rem;
  background: #0f172a;
  color: #e2e8f0;
}

.app-content {
  max-width: 1200px;
  margin: 0 auto;
}

.app-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.app-error {
  text-align: center;
  padding: 2rem;
  background: #7f1d1d;
  border-radius: 0.5rem;
  margin: 2rem auto;
  max-width: 500px;
}

.app-error button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #dc2626;
  color: white;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
}

${config.features.includes('dark-mode') ? `
/* Dark mode toggle support */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
}
` : ''}

${config.features.includes('responsive') ? `
/* Responsive styles */
@media (max-width: 768px) {
  .app-header {
    padding: 1rem;
  }

  .app-main {
    padding: 1rem;
  }

  .app-header h1 {
    font-size: 1.25rem;
  }
}
` : ''}
`;
}

function generateAppBackendCargo(config: AppConfig): string {
  return `[package]
name = "${config.slug}-backend"
version = "${config.version}"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
rustpress-app-sdk = "1.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
async-trait = "0.1"
axum = "0.7"
tokio = { version = "1", features = ["full"] }
${config.hasDatabaseTables ? 'sqlx = { version = "0.7", features = ["postgres", "runtime-tokio"] }' : ''}
`;
}

function generateAppBackendLib(config: AppConfig): string {
  return `//! ${config.name} - Backend
//! ${config.description}

use rustpress_app_sdk::prelude::*;
use axum::{routing::get, Router, Json};
use serde::Serialize;

#[derive(Serialize)]
struct StatusResponse {
    app: &'static str,
    version: &'static str,
    status: &'static str,
}

/// Register app routes
pub fn routes() -> Router {
    Router::new()
        .route("/api/apps/${config.slug}/status", get(status))
}

async fn status() -> Json<StatusResponse> {
    Json(StatusResponse {
        app: "${config.name}",
        version: "${config.version}",
        status: "running",
    })
}
${config.hasDatabaseTables ? `
/// Database migrations
pub async fn migrate(pool: &sqlx::PgPool) -> Result<(), sqlx::Error> {
    sqlx::query(r#"
        CREATE TABLE IF NOT EXISTS ${config.slug.replace(/-/g, '_')}_data (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            data JSONB DEFAULT '{}',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        )
    "#)
    .execute(pool)
    .await?;

    Ok(())
}
` : ''}
`;
}

function generateAppSettings(config: AppConfig): string {
  if (config.framework === 'react') {
    return `import React, { useState, useEffect } from 'react';
import { useRustPress } from '@rustpress/app-sdk';

interface SettingsProps {
  onClose: () => void;
}

interface AppSettings {
  // Add your settings fields here
  enabled: boolean;
}

export default function Settings({ onClose }: SettingsProps) {
  const { api } = useRustPress();
  const [settings, setSettings] = useState<AppSettings>({
    enabled: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await api.get('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/settings', settings);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-overlay" onClick={onClose} />
      <div className="settings-content">
        <header className="settings-header">
          <h2>Settings</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </header>

        <div className="settings-body">
          <label className="setting-item">
            <span>Enable Feature</span>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
            />
          </label>

          {/* Add more settings fields here */}
        </div>

        <footer className="settings-footer">
          <button onClick={onClose} className="btn-cancel">Cancel</button>
          <button onClick={saveSettings} disabled={saving} className="btn-save">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  );
}
`;
  }
  return '';
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00ff) + amt);
  const B = Math.min(255, (num & 0x0000ff) + amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

// ============================================
// EXPORTS
// ============================================

export default {
  generateThemeProject,
  generatePluginProject,
  generateFunctionProject,
  generateAppProject,
};
