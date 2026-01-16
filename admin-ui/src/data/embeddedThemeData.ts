/**
 * Embedded Theme Data
 * Contains actual theme file contents for offline/development mode
 * This data mirrors the actual rustpress-enterprise theme folder structure
 */

import type { ThemeData } from '../services/themeService';

// Embedded layouts
const baseLayoutHtml = `<!DOCTYPE html>
<html lang="{{ site.language | default(value='en') }}" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">

  <title>{% block title %}{{ site.name }}{% endblock %}</title>
  <meta name="description" content="{% block description %}{{ site.description }}{% endblock %}">
  <meta name="keywords" content="{% block keywords %}SaaS, Enterprise, Cloud, Platform, API{% endblock %}">
  <meta name="author" content="{{ site.author | default(value='SaasNova') }}">

  {% if page.canonical %}
  <link rel="canonical" href="{{ page.canonical }}">
  {% endif %}

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="{{ site.name }}">
  <meta property="og:title" content="{% block og_title %}{{ page.title | default(value=site.name) }}{% endblock %}">
  <meta property="og:description" content="{% block og_description %}{{ page.description | default(value=site.description) }}{% endblock %}">
  <meta property="og:image" content="{% block og_image %}{{ site.default_image }}{% endblock %}">
  <meta property="og:url" content="{{ page.url }}">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@saasnova">
  <meta name="twitter:title" content="{% block twitter_title %}{{ page.title | default(value=site.name) }}{% endblock %}">
  <meta name="twitter:description" content="{% block twitter_description %}{{ page.description | default(value=site.description) }}{% endblock %}">

  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/themes/rustpress-enterprise/assets/images/favicon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/themes/rustpress-enterprise/assets/images/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">

  <!-- Styles -->
  <link rel="stylesheet" href="/themes/rustpress-enterprise/assets/css/style.css">
  <link rel="stylesheet" href="/themes/rustpress-enterprise/assets/css/animations.css">
  <link rel="stylesheet" href="/themes/rustpress-enterprise/assets/css/components.css">
  {% block styles %}{% endblock %}

  <!-- Preload critical resources -->
  <link rel="preload" href="/themes/rustpress-enterprise/assets/js/main.js" as="script">
</head>
<body class="{% block body_class %}{% endblock %}">
  <!-- Scroll Progress Bar -->
  <div class="scroll-progress" id="scroll-progress"></div>

  <!-- Cursor Effect -->
  <div class="cursor-glow" id="cursor-glow"></div>
  <div class="cursor-dot" id="cursor-dot"></div>

  <!-- Loading Screen -->
  <div class="loading-screen" id="loading-screen">
    <div class="loading-logo">
      <svg class="loading-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="url(#gradient)" stroke-width="4" stroke-linecap="round" class="loading-circle"/>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366F1"/>
            <stop offset="100%" style="stop-color:#06B6D4"/>
          </linearGradient>
        </defs>
      </svg>
      <span class="loading-text">SaasNova</span>
    </div>
  </div>

  <!-- Noise Texture Overlay -->
  <div class="noise-overlay"></div>

  <!-- Background Effects -->
  <div class="bg-effects">
    <div class="gradient-orb gradient-orb--1"></div>
    <div class="gradient-orb gradient-orb--2"></div>
    <div class="gradient-orb gradient-orb--3"></div>
    <div class="grid-pattern"></div>
  </div>

  <!-- Header -->
  {% include "partials/header.html" %}

  <!-- Main Content -->
  <main id="main-content" class="main-content">
    {% block content %}{% endblock %}
  </main>

  <!-- Footer -->
  {% include "partials/footer.html" %}

  <!-- Back to Top -->
  <button class="back-to-top" id="back-to-top" aria-label="Back to top">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
    <span class="btn-glow"></span>
  </button>

  <!-- Cookie Consent -->
  <div class="cookie-consent" id="cookie-consent">
    <div class="cookie-content">
      <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
      <div class="cookie-actions">
        <button class="btn btn--ghost btn--sm" id="cookie-decline">Decline</button>
        <button class="btn btn--primary btn--sm" id="cookie-accept">Accept All</button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu Overlay -->
  {% include "partials/mobile-menu.html" %}

  <!-- Scripts -->
  <script src="/themes/rustpress-enterprise/assets/js/main.js" defer></script>
  <script src="/themes/rustpress-enterprise/assets/js/animations.js" defer></script>
  {% block scripts %}{% endblock %}
</body>
</html>`;

// Embedded partials
const headerHtml = `<header class="site-header">
  <nav class="nav-container container">
    <a href="/" class="logo">
      <span class="logo-text">{{ site.name | default(value="RustPress") }}</span>
    </a>

    <div class="nav-menu" id="nav-menu">
      <ul class="nav-list">
        <li class="nav-item"><a href="/" class="nav-link">Home</a></li>
        <li class="nav-item"><a href="/blog" class="nav-link">Blog</a></li>
        <li class="nav-item"><a href="/about" class="nav-link">About</a></li>
        <li class="nav-item"><a href="/contact" class="nav-link">Contact</a></li>
      </ul>
    </div>

    <div class="nav-actions">
      <button class="btn btn--primary btn--sm" aria-label="Get Started">
        Get Started
      </button>
      <button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu">
        <span class="hamburger"></span>
      </button>
    </div>
  </nav>
</header>`;

const footerHtml = `<footer class="site-footer">
  <div class="footer-container container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="/" class="footer-logo">
          <span class="logo-text">{{ site.name | default(value="RustPress") }}</span>
        </a>
        <p class="footer-tagline">{{ site.description | default(value="A modern CMS built with Rust") }}</p>
        <div class="footer-social">
          <a href="#" class="social-link" aria-label="Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="GitHub">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
          </a>
          <a href="#" class="social-link" aria-label="LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
        </div>
      </div>

      <div class="footer-links">
        <div class="footer-col">
          <h4 class="footer-heading">Product</h4>
          <ul class="footer-list">
            <li><a href="/features" class="footer-link">Features</a></li>
            <li><a href="/pricing" class="footer-link">Pricing</a></li>
            <li><a href="/docs" class="footer-link">Documentation</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Company</h4>
          <ul class="footer-list">
            <li><a href="/about" class="footer-link">About</a></li>
            <li><a href="/blog" class="footer-link">Blog</a></li>
            <li><a href="/contact" class="footer-link">Contact</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4 class="footer-heading">Legal</h4>
          <ul class="footer-list">
            <li><a href="/privacy" class="footer-link">Privacy</a></li>
            <li><a href="/terms" class="footer-link">Terms</a></li>
          </ul>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copyright">&copy; 2025 {{ site.name | default(value="RustPress") }}. All rights reserved.</p>
      <p class="powered-by">Powered by RustPress</p>
    </div>
  </div>
</footer>`;

const mobileMenuHtml = `<div class="mobile-menu" id="mobile-menu" aria-hidden="true">
  <div class="mobile-menu-backdrop"></div>
  <div class="mobile-menu-content">
    <button class="mobile-menu-close" id="mobile-menu-close" aria-label="Close menu">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    </button>
    <nav class="mobile-nav">
      <ul class="mobile-nav-list">
        <li><a href="/" class="mobile-nav-link">Home</a></li>
        <li><a href="/features" class="mobile-nav-link">Features</a></li>
        <li><a href="/pricing" class="mobile-nav-link">Pricing</a></li>
        <li><a href="/about" class="mobile-nav-link">About</a></li>
        <li><a href="/contact" class="mobile-nav-link">Contact</a></li>
      </ul>
    </nav>
  </div>
</div>`;

// Embedded template - home page
const homeTemplateHtml = `{% extends "layouts/base.html" %}

{% block title %}{{ site.name }} - The Modern CMS Built in Rust{% endblock %}
{% block description %}RustPress: The fastest, most secure content management system. 10x faster than WordPress with AI-powered content tools, block editor, and enterprise-grade features.{% endblock %}

{% block body_class %}page-home{% endblock %}

{% block content %}
<!-- Hero Section -->
<section class="hero hero--center">
  <div class="hero-glow hero-glow--primary"></div>
  <div class="hero-glow hero-glow--secondary"></div>
  <div class="hero-particles"></div>

  <div class="container">
    <div class="hero-content" data-animate="fade-up">
      <div class="hero-badge">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        <span>New: AI Enhancement Tools Now Available</span>
      </div>

      <h1 class="heading-display">
        The CMS Built for<br>
        <span class="text-gradient">Speed & Security</span>
      </h1>

      <p class="hero-description lead-lg">
        RustPress is the next-generation content management system built in Rust.
        10x faster than WordPress, with AI-powered content tools and a modern block editor.
        <strong>Every page is fully editable through the admin panel.</strong>
      </p>

      <div class="hero-actions">
        <a href="/admin" class="btn btn--primary btn--xl btn--glow">
          Open Admin Panel
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
        <a href="/features" class="btn btn--outline btn--xl">
          Explore Features
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Features Section -->
<section class="section section--lg">
  <div class="container">
    <div class="section-header text-center" data-animate="fade-up">
      <span class="section-label">Features</span>
      <h2 class="heading-xl">Everything You Need</h2>
      <p class="lead">A complete CMS with modern features built-in</p>
    </div>

    <div class="grid grid-3" data-stagger>
      <div class="feature-card" data-animate="fade-up">
        <div class="feature-icon icon--gradient">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </div>
        <h3 class="feature-title">Lightning Fast</h3>
        <p class="feature-text">Built in Rust for maximum performance. 10x faster than PHP-based CMS platforms.</p>
      </div>

      <div class="feature-card" data-animate="fade-up" data-delay="100">
        <div class="feature-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <h3 class="feature-title">Memory Safe</h3>
        <p class="feature-text">Rust's memory safety guarantees protect against common security vulnerabilities.</p>
      </div>

      <div class="feature-card" data-animate="fade-up" data-delay="200">
        <div class="feature-icon icon--cyan">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        </div>
        <h3 class="feature-title">AI-Powered</h3>
        <p class="feature-text">10 built-in AI tools for content creation, SEO optimization, and more.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA Section -->
<section class="section section--lg">
  <div class="container">
    <div class="cta" data-animate="scale">
      <div class="cta-content">
        <h2 class="heading-xl cta-title">Ready to try RustPress?</h2>
        <p class="cta-text">Experience the fastest, most secure CMS available.</p>
        <div class="cta-actions">
          <a href="/admin" class="btn btn--white btn--xl">Get Started</a>
          <a href="/features" class="btn btn--outline btn--xl">Learn More</a>
        </div>
      </div>
    </div>
  </div>
</section>
{% endblock %}`;

// Embedded CSS (truncated for brevity - first 200 lines)
const mainCss = `/* ==========================================================================
   SaasNova Enterprise Theme - Main Stylesheet
   A hi-tech, enterprise SaaS theme with glassmorphism and advanced effects
   ========================================================================== */

/* --------------------------------------------------------------------------
   CSS Custom Properties (Variables)
   -------------------------------------------------------------------------- */
:root {
  /* Brand Colors */
  --color-primary: #6366F1;
  --color-primary-light: #818CF8;
  --color-primary-dark: #4F46E5;
  --color-primary-rgb: 99, 102, 241;

  --color-secondary: #06B6D4;
  --color-secondary-light: #22D3EE;
  --color-secondary-dark: #0891B2;
  --color-secondary-rgb: 6, 182, 212;

  --color-accent: #F59E0B;
  --color-accent-light: #FBBF24;

  /* Semantic Colors */
  --color-success: #10B981;
  --color-success-light: #34D399;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-error-light: #F87171;
  --color-info: #3B82F6;

  /* Dark Theme Colors */
  --color-bg-primary: #0A0A0F;
  --color-bg-secondary: #0F0F1A;
  --color-bg-tertiary: #1A1A2E;
  --color-bg-elevated: #252542;
  --color-bg-overlay: rgba(10, 10, 15, 0.8);

  --color-surface: #1A1A2E;
  --color-surface-light: #252542;
  --color-surface-border: #2D2D4A;

  /* Text Colors */
  --color-text-primary: #F8FAFC;
  --color-text-secondary: #CBD5E1;
  --color-text-muted: #94A3B8;
  --color-text-disabled: #64748B;

  /* Border Colors */
  --color-border: #2D2D4A;
  --color-border-light: #3D3D5C;
  --color-border-focus: var(--color-primary);

  /* Typography */
  --font-heading: 'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;

  /* Font Sizes */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
  --text-7xl: 4.5rem;
  --text-8xl: 6rem;

  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
}

/* Reset & Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  -webkit-font-smoothing: antialiased;
  font-size: 16px;
}

body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--color-text-primary);
  background-color: var(--color-bg-primary);
  min-height: 100vh;
}

/* Container */
.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-text-primary);
}

.heading-display {
  font-size: clamp(3rem, 8vw, var(--text-8xl));
  font-weight: 800;
  letter-spacing: -0.05em;
  line-height: 1.1;
}

.heading-xl {
  font-size: var(--text-5xl);
}

.text-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn--primary {
  background: var(--color-primary);
  color: white;
}

.btn--primary:hover {
  background: var(--color-primary-dark);
}

.btn--outline {
  border: 2px solid var(--color-border);
  color: var(--color-text-primary);
}

.btn--outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* Grid */
.grid {
  display: grid;
  gap: var(--space-8);
}

.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.feature-card {
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
}

.glass-card {
  background: rgba(26, 26, 46, 0.7);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
}

/* Sections */
.section {
  padding: var(--space-20) 0;
}

.section--lg {
  padding: var(--space-24) 0;
}

.section--dark {
  background: var(--color-bg-secondary);
}

.section-header {
  margin-bottom: var(--space-12);
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-primary-light);
  margin-bottom: var(--space-4);
}

/* Hero */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: var(--space-24) 0;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  max-width: 900px;
  margin: 0 auto;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(var(--color-primary-rgb), 0.1);
  border: 1px solid rgba(var(--color-primary-rgb), 0.2);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  margin-bottom: var(--space-6);
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-8);
}

/* CTA */
.cta {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  border-radius: var(--radius-2xl);
  padding: var(--space-16);
  text-align: center;
}

.cta-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  margin-top: var(--space-8);
}

.btn--white {
  background: white;
  color: var(--color-primary);
}`;

// Embedded JS (truncated for brevity)
const mainJs = `/**
 * SaasNova Enterprise Theme - Main JavaScript
 * Core functionality and interactions
 */

(function() {
  'use strict';

  // DOM Ready
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initLoadingScreen();
    initHeader();
    initMobileMenu();
    initScrollProgress();
    initBackToTop();
    initSmoothScroll();
    initCounters();
  }

  // Loading Screen
  function initLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
        document.body.classList.add('loaded');
        setTimeout(() => loadingScreen.remove(), 500);
      }, 500);
    });
  }

  // Header
  function initHeader() {
    const header = document.getElementById('site-header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // Mobile Menu
  function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuToggle || !mobileMenu) return;

    menuToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
    });
  }

  // Scroll Progress
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      progressBar.style.transform = \`scaleX(\${progress / 100})\`;
    }, { passive: true });
  }

  // Back to Top
  function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 500) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }, { passive: true });

    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth Scroll
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  // Animated Counters
  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));

    function animateCounter(el) {
      const target = parseInt(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      const duration = 2000;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * target);
        el.textContent = current + suffix;
        if (progress < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }
  }
})();`;

const animationsCss = `/* ==========================================================================
   Animations & Effects
   ========================================================================== */

/* Fade Up Animation */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

[data-animate="fade-up"] {
  opacity: 0;
  animation: fadeUp 0.6s ease forwards;
}

/* Fade In Animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

[data-animate="fade-in"] {
  opacity: 0;
  animation: fadeIn 0.6s ease forwards;
}

/* Scale Animation */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

[data-animate="scale"] {
  opacity: 0;
  animation: scaleIn 0.6s ease forwards;
}

/* Slide Animations */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

[data-animate="fade-left"] {
  opacity: 0;
  animation: slideInRight 0.6s ease forwards;
}

[data-animate="fade-right"] {
  opacity: 0;
  animation: slideInLeft 0.6s ease forwards;
}

/* Loading Animation */
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg-primary);
  transition: opacity 0.5s ease;
}

.loading-screen.hidden {
  opacity: 0;
  pointer-events: none;
}

.loading-circle {
  animation: rotate 1.5s linear infinite;
  stroke-dasharray: 283;
  stroke-dashoffset: 75;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Glow Pulse */
@keyframes glowPulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.hero-glow {
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  filter: blur(100px);
  animation: glowPulse 4s ease-in-out infinite;
}

.hero-glow--primary {
  background: var(--color-primary);
  top: -200px;
  left: -200px;
}

.hero-glow--secondary {
  background: var(--color-secondary);
  bottom: -200px;
  right: -200px;
  animation-delay: 2s;
}

/* Scroll Progress */
.scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--color-primary);
  transform-origin: left;
  transform: scaleX(0);
  z-index: 1000;
}

/* Back to Top */
.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  transition: all 0.3s ease;
  z-index: 100;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  background: var(--color-primary-dark);
  transform: translateY(-3px);
}`;

const componentsCss = `/* ==========================================================================
   Component Styles
   ========================================================================== */

/* Feature Icon */
.feature-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-light);
  border-radius: var(--radius-xl);
  margin-bottom: var(--space-4);
}

.feature-icon--gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  color: white;
}

.feature-icon--cyan {
  background: var(--color-secondary);
  color: white;
}

.feature-title {
  font-size: var(--text-xl);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.feature-text {
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Badge */
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  background: var(--color-surface-light);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

/* Terminal */
.terminal {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.terminal-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-light);
  border-bottom: 1px solid var(--color-border);
}

.terminal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.terminal-dot--red { background: #EF4444; }
.terminal-dot--yellow { background: #F59E0B; }
.terminal-dot--green { background: #10B981; }

.terminal-title {
  margin-left: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.terminal-body {
  padding: var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.8;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-8);
  text-align: center;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.stat-item {
  padding: var(--space-8);
}

.stat-number {
  font-size: var(--text-5xl);
  font-weight: 800;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
}

/* Lead Text */
.lead {
  font-size: var(--text-lg);
  color: var(--color-text-secondary);
  line-height: 1.7;
}

.lead-lg {
  font-size: var(--text-xl);
  max-width: 800px;
  margin: var(--space-6) auto 0;
}

/* Text Center */
.text-center {
  text-align: center;
}

/* Header Styles */
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 300;
  padding: var(--space-4) 0;
  transition: all 0.3s ease;
}

.site-header.scrolled {
  background: rgba(10, 10, 15, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--color-border);
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-text {
  font-family: var(--font-heading);
  font-size: var(--text-xl);
  font-weight: 700;
}

.nav-list {
  display: flex;
  gap: var(--space-8);
}

.nav-link {
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.nav-toggle {
  display: none;
}

@media (max-width: 768px) {
  .nav-menu { display: none; }
  .nav-toggle { display: block; }
}

/* Footer */
.site-footer {
  background: var(--color-bg-secondary);
  padding: var(--space-16) 0 var(--space-8);
  border-top: 1px solid var(--color-border);
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 2fr;
  gap: var(--space-16);
  margin-bottom: var(--space-12);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}

.footer-tagline {
  color: var(--color-text-muted);
  margin-top: var(--space-4);
}

.footer-social {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.social-link {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface);
  border-radius: 50%;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--color-primary);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-8);
}

.footer-heading {
  font-size: var(--text-sm);
  font-weight: 600;
  margin-bottom: var(--space-4);
  color: var(--color-text-primary);
}

.footer-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.footer-link {
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  transition: color 0.3s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  padding-top: var(--space-8);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}`;

const animationsJs = `/**
 * Animations JavaScript
 * Advanced animations and scroll effects
 */

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', initAnimations);

  function initAnimations() {
    initScrollAnimations();
    initStaggerAnimations();
    initParallax();
  }

  // Scroll-triggered animations
  function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('animated');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => observer.observe(el));
  }

  // Stagger animations for groups
  function initStaggerAnimations() {
    const staggerContainers = document.querySelectorAll('[data-stagger]');

    staggerContainers.forEach(container => {
      const children = container.querySelectorAll('[data-animate]');
      children.forEach((child, index) => {
        if (!child.dataset.delay) {
          child.dataset.delay = index * 100;
        }
      });
    });
  }

  // Parallax effects
  function initParallax() {
    const parallaxElements = document.querySelectorAll('[data-parallax]');
    if (!parallaxElements.length) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.pageYOffset;

      parallaxElements.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.5;
        const yPos = -(scrollY * speed);
        el.style.transform = \`translateY(\${yPos}px)\`;
      });
    }, { passive: true });
  }
})();`;

// Create default page template
function createPageTemplate(pageName: string): string {
  const title = pageName.charAt(0).toUpperCase() + pageName.slice(1).replace(/-/g, ' ');
  return `{% extends "layouts/base.html" %}

{% block title %}${title} - {{ site.name }}{% endblock %}
{% block description %}${title} page for {{ site.name }}.{% endblock %}

{% block body_class %}page-${pageName}{% endblock %}

{% block content %}
<section class="section section--lg">
  <div class="container">
    <div class="section-header text-center" data-animate="fade-up">
      <h1 class="heading-xl">${title}</h1>
      <p class="lead">This is the ${pageName} page. Edit this content in the admin panel.</p>
    </div>

    <div class="content" data-animate="fade-up">
      <!-- Add your page content here -->
    </div>
  </div>
</section>
{% endblock %}`;
}

// Theme manifest matching theme.json
const themeManifest = {
  name: 'RustPress Official',
  version: '1.0.0',
  description: 'The official RustPress CMS showcase theme - demonstrating the power of the fastest, most secure content management system built in Rust. Features AI enhancement tools, block editor, and fully editable pages.',
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
      'title_generator', 'content_summarizer', 'seo_optimizer',
      'plagiarism_checker', 'tone_adjuster', 'grammar_fixer',
      'image_generator', 'alt_text_generator', 'schema_generator',
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

// Export the complete embedded theme data
export function getEmbeddedThemeData(slug: string = 'rustpress-enterprise'): ThemeData {
  return {
    id: slug,
    slug,
    path: `themes/${slug}`,
    manifest: themeManifest,
    assets: {
      css: [
        {
          path: 'assets/css/style.css',
          type: 'css',
          content: mainCss,
          isModified: false,
        },
        {
          path: 'assets/css/animations.css',
          type: 'css',
          content: animationsCss,
          isModified: false,
        },
        {
          path: 'assets/css/components.css',
          type: 'css',
          content: componentsCss,
          isModified: false,
        },
      ],
      js: [
        {
          path: 'assets/js/main.js',
          type: 'js',
          content: mainJs,
          isModified: false,
        },
        {
          path: 'assets/js/animations.js',
          type: 'js',
          content: animationsJs,
          isModified: false,
        },
      ],
    },
    templates: [
      {
        id: 'home',
        name: 'Home',
        slug: '/',
        path: 'templates/home.html',
        content: homeTemplateHtml,
        isModified: false,
      },
      ...themeManifest.pages.filter(p => p !== 'home').map((page) => ({
        id: page,
        name: page.charAt(0).toUpperCase() + page.slice(1).replace(/-/g, ' '),
        slug: `/${page}`,
        path: `templates/${page}.html`,
        content: createPageTemplate(page),
        isModified: false,
      })),
    ],
    partials: [
      {
        id: 'header',
        name: 'Header',
        path: 'partials/header.html',
        content: headerHtml,
        isModified: false,
      },
      {
        id: 'footer',
        name: 'Footer',
        path: 'partials/footer.html',
        content: footerHtml,
        isModified: false,
      },
      {
        id: 'mobile-menu',
        name: 'Mobile Menu',
        path: 'partials/mobile-menu.html',
        content: mobileMenuHtml,
        isModified: false,
      },
    ],
    layouts: [
      {
        id: 'base',
        name: 'Base Layout',
        path: 'layouts/base.html',
        content: baseLayoutHtml,
        isModified: false,
      },
    ],
    isActive: true,
    lastModified: new Date().toISOString(),
    gitInfo: {
      branch: 'master',
      lastCommit: 'a1b2c3d',
      lastCommitDate: new Date().toISOString().split('T')[0],
      isDirty: false,
    },
  };
}

export default getEmbeddedThemeData;
