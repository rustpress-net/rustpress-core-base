import React from 'react';

// Import actual components
import * as NavigationComponents from './navigation';
import * as ContentComponents from './content';
import * as InteractiveComponents from './interactive';
import * as MediaComponents from './media';
import * as SocialComponents from './social';
import * as FormComponents from './forms';
import * as UserComponents from './user';
import * as CommerceComponents from './commerce';
import * as UtilityComponents from './utility';

// ==================== COMPONENT REGISTRY ====================
// This file contains metadata about all available components for the theme editor

export type ComponentCategory =
  | 'navigation'
  | 'content'
  | 'interactive'
  | 'media'
  | 'social'
  | 'forms'
  | 'user'
  | 'commerce'
  | 'utility';

export interface PropTypeDefinition {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'select' | 'color' | 'icon';
  required?: boolean;
  default?: unknown;
  options?: { value: string; label: string }[];
  description?: string;
  placeholder?: string;
  min?: number;
  max?: number;
}

// HTML Generator function type for generating theme HTML
export type HtmlGenerator = (props: Record<string, unknown>) => string;

export interface ComponentMeta {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  icon: string;
  defaultProps?: Record<string, unknown>;
  propTypes?: Record<string, PropTypeDefinition>;
  usageExample?: string;
  usageTips?: string[];
  // Actual React component reference for preview
  component?: React.ComponentType<any>;
  // HTML generator for theme output
  generateHtml?: HtmlGenerator;
}

// ==================== HTML GENERATORS ====================
// These functions generate actual HTML/Jinja2 templates for the theme

const generateMenuHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const items = props.items as Array<{label: string; href: string}> || [];
  const itemsHtml = items.length > 0
    ? items.map(item => `<li><a href="${item.href || '#'}">${item.label || 'Link'}</a></li>`).join('\n    ')
    : `{% for item in menu_items %}
    <li class="{% if item.active %}active{% endif %}">
      <a href="{{ item.url }}">{{ item.label }}</a>
    </li>
    {% endfor %}`;
  return `<nav class="menu menu--${variant}">
  <ul class="menu__list">
    ${itemsHtml}
  </ul>
</nav>`;
};

const generateBreadcrumbHtml = (props: Record<string, unknown>): string => {
  const separator = props.separator || '/';
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">
  <ol class="breadcrumbs__list">
    {% for crumb in breadcrumbs %}
    <li class="breadcrumbs__item">
      {% if not loop.last %}
      <a href="{{ crumb.url }}">{{ crumb.label }}</a>
      <span class="breadcrumbs__separator">${separator}</span>
      {% else %}
      <span aria-current="page">{{ crumb.label }}</span>
      {% endif %}
    </li>
    {% endfor %}
  </ol>
</nav>`;
};

const generateCardHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const showImage = props.showImage !== false;
  const showFooter = props.showFooter !== false;
  return `<article class="card card--${variant}">
  ${showImage ? `<div class="card__image">
    <img src="{{ image_url | default('/placeholder.jpg') }}" alt="{{ title }}" loading="lazy">
  </div>` : ''}
  <div class="card__content">
    <h3 class="card__title">{{ title | default('Card Title') }}</h3>
    <p class="card__description">{{ description | default('Card description goes here.') }}</p>
  </div>
  ${showFooter ? `<div class="card__footer">
    <a href="{{ link_url | default('#') }}" class="card__link">Read More</a>
  </div>` : ''}
</article>`;
};

const generateButtonHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'primary';
  const size = props.size || 'md';
  const text = props.text || props.label || 'Button';
  return `<button class="btn btn--${variant} btn--${size}" type="button">
  ${text}
</button>`;
};

const generateImageHtml = (props: Record<string, unknown>): string => {
  const alt = props.alt || 'Image';
  const aspectRatio = props.aspectRatio || 'auto';
  return `<figure class="image-wrapper" style="aspect-ratio: ${aspectRatio}">
  <img
    src="{{ image_url | default('/placeholder.jpg') }}"
    alt="${alt}"
    class="image"
    loading="lazy"
  >
  {% if caption %}
  <figcaption class="image__caption">{{ caption }}</figcaption>
  {% endif %}
</figure>`;
};

const generateGalleryHtml = (props: Record<string, unknown>): string => {
  const columns = props.columns || 3;
  const gap = props.gap || '1rem';
  return `<div class="gallery" style="--gallery-columns: ${columns}; --gallery-gap: ${gap}">
  {% for image in gallery_images %}
  <figure class="gallery__item">
    <img src="{{ image.url }}" alt="{{ image.alt }}" loading="lazy">
    {% if image.caption %}<figcaption>{{ image.caption }}</figcaption>{% endif %}
  </figure>
  {% endfor %}
</div>`;
};

const generateSocialLinksHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const showLabels = props.showLabels || false;
  return `<div class="social-links social-links--${variant}">
  {% for social in social_links %}
  <a href="{{ social.url }}" class="social-links__item" target="_blank" rel="noopener noreferrer" aria-label="{{ social.name }}">
    <span class="social-links__icon">{{ social.icon }}</span>
    ${showLabels ? '<span class="social-links__label">{{ social.name }}</span>' : ''}
  </a>
  {% endfor %}
</div>`;
};

const generateFormHtml = (props: Record<string, unknown>): string => {
  const action = props.action || '#';
  const method = props.method || 'post';
  return `<form class="form" action="${action}" method="${method}">
  {% csrf_token %}
  <div class="form__group">
    <label for="name" class="form__label">Name</label>
    <input type="text" id="name" name="name" class="form__input" required>
  </div>
  <div class="form__group">
    <label for="email" class="form__label">Email</label>
    <input type="email" id="email" name="email" class="form__input" required>
  </div>
  <div class="form__group">
    <label for="message" class="form__label">Message</label>
    <textarea id="message" name="message" class="form__textarea" rows="4"></textarea>
  </div>
  <button type="submit" class="btn btn--primary">Submit</button>
</form>`;
};

const generateInputHtml = (props: Record<string, unknown>): string => {
  const type = props.type || 'text';
  const placeholder = props.placeholder || '';
  const label = props.label || 'Input';
  const name = props.name || 'input';
  const required = props.required ? 'required' : '';
  return `<div class="form-group">
  <label for="${name}" class="form-label">${label}</label>
  <input
    type="${type}"
    id="${name}"
    name="${name}"
    class="form-input"
    placeholder="${placeholder}"
    ${required}
  >
</div>`;
};

const generateAvatarHtml = (props: Record<string, unknown>): string => {
  const size = props.size || 'md';
  const shape = props.shape || 'circle';
  return `<div class="avatar avatar--${size} avatar--${shape}">
  <img src="{{ user.avatar | default('/default-avatar.png') }}" alt="{{ user.name }}">
</div>`;
};

const generatePriceHtml = (props: Record<string, unknown>): string => {
  const currency = props.currency || '$';
  const showOriginal = props.showOriginal !== false;
  return `<div class="price">
  ${showOriginal ? '<span class="price__original">{{ original_price }}</span>' : ''}
  <span class="price__current">${currency}{{ current_price }}</span>
</div>`;
};

const generateSpinnerHtml = (props: Record<string, unknown>): string => {
  const size = props.size || 'md';
  const color = props.color || 'currentColor';
  return `<div class="spinner spinner--${size}" role="status" aria-label="Loading">
  <svg class="spinner__svg" viewBox="0 0 24 24" fill="none">
    <circle class="spinner__track" cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.25" stroke-width="3"/>
    <path class="spinner__indicator" fill="${color}" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
</div>`;
};

const generateDividerHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'solid';
  const label = props.label || '';
  return label
    ? `<div class="divider divider--${variant} divider--with-label">
  <span class="divider__label">${label}</span>
</div>`
    : `<hr class="divider divider--${variant}">`;
};

const generateAlertHtml = (props: Record<string, unknown>): string => {
  const type = props.type || 'info';
  const dismissible = props.dismissible !== false;
  return `<div class="alert alert--${type}" role="alert">
  <div class="alert__content">
    <span class="alert__icon"></span>
    <span class="alert__message">{{ message | default('Alert message') }}</span>
  </div>
  ${dismissible ? '<button type="button" class="alert__close" aria-label="Close">&times;</button>' : ''}
</div>`;
};

const generateBadgeHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const size = props.size || 'md';
  const text = props.text || 'Badge';
  return `<span class="badge badge--${variant} badge--${size}">${text}</span>`;
};

const generateTabsHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  return `<div class="tabs tabs--${variant}">
  <div class="tabs__list" role="tablist">
    {% for tab in tabs %}
    <button
      class="tabs__tab {% if loop.first %}tabs__tab--active{% endif %}"
      role="tab"
      aria-selected="{% if loop.first %}true{% else %}false{% endif %}"
      data-tab="{{ tab.id }}"
    >
      {{ tab.label }}
    </button>
    {% endfor %}
  </div>
  <div class="tabs__panels">
    {% for tab in tabs %}
    <div
      class="tabs__panel {% if loop.first %}tabs__panel--active{% endif %}"
      role="tabpanel"
      id="panel-{{ tab.id }}"
    >
      {{ tab.content | safe }}
    </div>
    {% endfor %}
  </div>
</div>`;
};

const generateAccordionHtml = (props: Record<string, unknown>): string => {
  const allowMultiple = props.allowMultiple || false;
  return `<div class="accordion" data-allow-multiple="${allowMultiple}">
  {% for item in accordion_items %}
  <div class="accordion__item">
    <button class="accordion__header" aria-expanded="false">
      <span>{{ item.title }}</span>
      <span class="accordion__icon"></span>
    </button>
    <div class="accordion__content">
      <div class="accordion__body">{{ item.content | safe }}</div>
    </div>
  </div>
  {% endfor %}
</div>`;
};

const generateModalHtml = (props: Record<string, unknown>): string => {
  const size = props.size || 'md';
  const showClose = props.showClose !== false;
  return `<div class="modal modal--${size}" role="dialog" aria-modal="true" aria-hidden="true">
  <div class="modal__backdrop"></div>
  <div class="modal__container">
    <div class="modal__header">
      <h2 class="modal__title">{{ modal_title | default('Modal Title') }}</h2>
      ${showClose ? '<button class="modal__close" aria-label="Close">&times;</button>' : ''}
    </div>
    <div class="modal__body">
      {{ modal_content | safe }}
    </div>
    <div class="modal__footer">
      <button class="btn btn--secondary" data-modal-close>Cancel</button>
      <button class="btn btn--primary">Confirm</button>
    </div>
  </div>
</div>`;
};

const generateVideoHtml = (props: Record<string, unknown>): string => {
  const autoplay = props.autoplay || false;
  const controls = props.controls !== false;
  const aspectRatio = props.aspectRatio || '16/9';
  return `<div class="video-wrapper" style="aspect-ratio: ${aspectRatio}">
  <video
    class="video"
    ${controls ? 'controls' : ''}
    ${autoplay ? 'autoplay muted' : ''}
    poster="{{ poster_url }}"
  >
    <source src="{{ video_url }}" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>`;
};

const generatePaginationHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const showPrevNext = props.showPrevNext !== false;
  return `<nav class="pagination pagination--${variant}" aria-label="Pagination">
  ${showPrevNext ? '<a href="{{ prev_url }}" class="pagination__prev" {% if not has_prev %}disabled{% endif %}>Previous</a>' : ''}
  <ul class="pagination__list">
    {% for page in pages %}
    <li>
      <a href="{{ page.url }}" class="pagination__item {% if page.current %}pagination__item--active{% endif %}">
        {{ page.number }}
      </a>
    </li>
    {% endfor %}
  </ul>
  ${showPrevNext ? '<a href="{{ next_url }}" class="pagination__next" {% if not has_next %}disabled{% endif %}>Next</a>' : ''}
</nav>`;
};

const generateSearchHtml = (props: Record<string, unknown>): string => {
  const placeholder = props.placeholder || 'Search...';
  const showButton = props.showButton !== false;
  return `<form class="search-form" action="/search" method="get">
  <div class="search-form__wrapper">
    <input
      type="search"
      name="q"
      class="search-form__input"
      placeholder="${placeholder}"
      value="{{ search_query }}"
    >
    ${showButton ? '<button type="submit" class="search-form__button">Search</button>' : ''}
  </div>
</form>`;
};

const generateProgressHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const showLabel = props.showLabel !== false;
  return `<div class="progress progress--${variant}">
  ${showLabel ? '<span class="progress__label">{{ progress_label }}</span>' : ''}
  <div class="progress__bar">
    <div class="progress__fill" style="width: {{ progress_value | default(0) }}%"></div>
  </div>
  ${showLabel ? '<span class="progress__value">{{ progress_value | default(0) }}%</span>' : ''}
</div>`;
};

const generateTooltipHtml = (props: Record<string, unknown>): string => {
  const position = props.position || 'top';
  const content = props.content || 'Tooltip text';
  return `<span class="tooltip" data-tooltip="${content}" data-tooltip-position="${position}">
  {{ slot_content }}
</span>`;
};

const generateDropdownHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  return `<div class="dropdown dropdown--${variant}">
  <button class="dropdown__trigger" aria-haspopup="true" aria-expanded="false">
    {{ dropdown_label | default('Select') }}
    <span class="dropdown__arrow"></span>
  </button>
  <ul class="dropdown__menu" role="menu">
    {% for item in dropdown_items %}
    <li role="menuitem">
      <a href="{{ item.url | default('#') }}">{{ item.label }}</a>
    </li>
    {% endfor %}
  </ul>
</div>`;
};

const generateListHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const ordered = props.ordered || false;
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag} class="list list--${variant}">
  {% for item in list_items %}
  <li class="list__item">{{ item }}</li>
  {% endfor %}
</${tag}>`;
};

const generateTableHtml = (props: Record<string, unknown>): string => {
  const striped = props.striped !== false;
  const hoverable = props.hoverable !== false;
  return `<div class="table-wrapper">
  <table class="table ${striped ? 'table--striped' : ''} ${hoverable ? 'table--hoverable' : ''}">
    <thead>
      <tr>
        {% for header in table_headers %}
        <th>{{ header }}</th>
        {% endfor %}
      </tr>
    </thead>
    <tbody>
      {% for row in table_rows %}
      <tr>
        {% for cell in row %}
        <td>{{ cell }}</td>
        {% endfor %}
      </tr>
      {% endfor %}
    </tbody>
  </table>
</div>`;
};

const generateQuoteHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  return `<blockquote class="quote quote--${variant}">
  <p class="quote__text">{{ quote_text | default('Quote text goes here.') }}</p>
  <footer class="quote__footer">
    <cite class="quote__author">{{ quote_author | default('Author') }}</cite>
    {% if quote_source %}<span class="quote__source">{{ quote_source }}</span>{% endif %}
  </footer>
</blockquote>`;
};

const generateTestimonialHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const showRating = props.showRating !== false;
  return `<div class="testimonial testimonial--${variant}">
  <div class="testimonial__content">
    <p class="testimonial__text">{{ testimonial_text }}</p>
  </div>
  <div class="testimonial__author">
    <img src="{{ author_avatar }}" alt="{{ author_name }}" class="testimonial__avatar">
    <div class="testimonial__info">
      <cite class="testimonial__name">{{ author_name }}</cite>
      <span class="testimonial__role">{{ author_role }}</span>
    </div>
  </div>
  ${showRating ? `<div class="testimonial__rating">
    {% for i in range(5) %}
    <span class="star {% if i < rating %}star--filled{% endif %}"></span>
    {% endfor %}
  </div>` : ''}
</div>`;
};

const generateNewsletterHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const placeholder = props.placeholder || 'Enter your email';
  return `<div class="newsletter newsletter--${variant}">
  <h3 class="newsletter__title">{{ newsletter_title | default('Subscribe to our newsletter') }}</h3>
  <p class="newsletter__description">{{ newsletter_description }}</p>
  <form class="newsletter__form" action="/subscribe" method="post">
    <input type="email" name="email" class="newsletter__input" placeholder="${placeholder}" required>
    <button type="submit" class="newsletter__button">Subscribe</button>
  </form>
</div>`;
};

const generateCarouselHtml = (props: Record<string, unknown>): string => {
  const autoplay = props.autoplay || false;
  const showDots = props.showDots !== false;
  const showArrows = props.showArrows !== false;
  return `<div class="carousel" data-autoplay="${autoplay}">
  <div class="carousel__container">
    {% for slide in carousel_slides %}
    <div class="carousel__slide">
      <img src="{{ slide.image }}" alt="{{ slide.alt }}">
      {% if slide.caption %}<div class="carousel__caption">{{ slide.caption }}</div>{% endif %}
    </div>
    {% endfor %}
  </div>
  ${showArrows ? `<button class="carousel__prev" aria-label="Previous">&#10094;</button>
  <button class="carousel__next" aria-label="Next">&#10095;</button>` : ''}
  ${showDots ? `<div class="carousel__dots">
    {% for slide in carousel_slides %}
    <button class="carousel__dot" aria-label="Slide {{ loop.index }}"></button>
    {% endfor %}
  </div>` : ''}
</div>`;
};

const generateHeroHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const showCta = props.showCta !== false;
  return `<section class="hero hero--${variant}">
  <div class="hero__background" style="background-image: url('{{ hero_image }}')"></div>
  <div class="hero__content">
    <h1 class="hero__title">{{ hero_title | default('Welcome') }}</h1>
    <p class="hero__subtitle">{{ hero_subtitle }}</p>
    ${showCta ? `<div class="hero__cta">
      <a href="{{ cta_url | default('#') }}" class="btn btn--primary btn--lg">{{ cta_text | default('Get Started') }}</a>
    </div>` : ''}
  </div>
</section>`;
};

const generateFooterHtml = (props: Record<string, unknown>): string => {
  const columns = props.columns || 4;
  return `<footer class="site-footer">
  <div class="footer__main" style="--footer-columns: ${columns}">
    {% for column in footer_columns %}
    <div class="footer__column">
      <h4 class="footer__title">{{ column.title }}</h4>
      <ul class="footer__links">
        {% for link in column.links %}
        <li><a href="{{ link.url }}">{{ link.label }}</a></li>
        {% endfor %}
      </ul>
    </div>
    {% endfor %}
  </div>
  <div class="footer__bottom">
    <p class="footer__copyright">&copy; {{ current_year }} {{ site_name }}. All rights reserved.</p>
  </div>
</footer>`;
};

const generateHeaderHtml = (props: Record<string, unknown>): string => {
  const variant = props.variant || 'default';
  const sticky = props.sticky !== false;
  return `<header class="site-header site-header--${variant} ${sticky ? 'site-header--sticky' : ''}">
  <div class="header__container">
    <div class="header__logo">
      <a href="/">
        <img src="{{ logo_url }}" alt="{{ site_name }}">
      </a>
    </div>
    <nav class="header__nav">
      {% for item in main_menu %}
      <a href="{{ item.url }}" class="header__nav-item {% if item.active %}active{% endif %}">
        {{ item.label }}
      </a>
      {% endfor %}
    </nav>
    <div class="header__actions">
      {{ header_actions | safe }}
    </div>
  </div>
</header>`;
};

// Default HTML generator for components without specific generators
const generateDefaultHtml = (component: ComponentMeta, props: Record<string, unknown>): string => {
  const className = component.id.replace(/-/g, '-');
  const propsComment = Object.entries(props)
    .filter(([_, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');
  return `<!-- ${component.name} -->
<div class="component component--${className}" data-component="${component.id}"${propsComment ? ` ${propsComment}` : ''}>
  {# ${component.description} #}
  {# Configure this component in your template or via CMS settings #}
</div>`;
};

// Navigation Components
export const navigationComponents: ComponentMeta[] = [
  {
    id: 'vertical-menu',
    name: 'Vertical Menu',
    category: 'navigation',
    description: 'Vertical navigation menu with collapsible items',
    icon: '☰',
    defaultProps: { items: [], collapsed: false, showIcons: true },
    propTypes: {
      items: { type: 'array', description: 'Menu items array with {label, href, icon?, children?}', required: true },
      collapsed: { type: 'boolean', default: false, description: 'Start with menu collapsed' },
      showIcons: { type: 'boolean', default: true, description: 'Show icons next to menu items' },
      activeColor: { type: 'color', default: '#3b82f6', description: 'Active item highlight color' }
    },
    usageExample: '<VerticalMenu items={[{label: "Home", href: "/"}]} />',
    usageTips: ['Best for sidebar navigation', 'Supports nested items for submenus', 'Add icons for visual clarity'],
    component: NavigationComponents.VerticalMenu,
    generateHtml: (props) => generateMenuHtml({ ...props, variant: 'vertical' }),
  },
  {
    id: 'horizontal-menu',
    name: 'Horizontal Menu',
    category: 'navigation',
    description: 'Horizontal navigation bar',
    icon: '━',
    defaultProps: { items: [], centered: false, showDropdownArrow: true },
    propTypes: {
      items: { type: 'array', description: 'Menu items array with {label, href, children?}', required: true },
      centered: { type: 'boolean', default: false, description: 'Center menu items' },
      showDropdownArrow: { type: 'boolean', default: true, description: 'Show arrow for dropdown items' },
      spacing: { type: 'select', options: [{ value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }], default: 'normal' }
    },
    usageExample: '<HorizontalMenu items={[{label: "Home", href: "/"}]} />',
    usageTips: ['Ideal for header navigation', 'Supports dropdown submenus', 'Use with sticky header for always-visible nav'],
    component: NavigationComponents.HorizontalMenu,
    generateHtml: (props) => generateMenuHtml({ ...props, variant: 'horizontal' }),
  },
  {
    id: 'mega-menu',
    name: 'Mega Menu',
    category: 'navigation',
    description: 'Large dropdown menu with columns',
    icon: '▦',
    defaultProps: { items: [], columns: 3, showImages: false },
    propTypes: {
      items: { type: 'array', description: 'Mega menu sections with columns', required: true },
      columns: { type: 'number', default: 3, min: 2, max: 6, description: 'Number of columns' },
      showImages: { type: 'boolean', default: false, description: 'Show images in menu' },
      fullWidth: { type: 'boolean', default: true, description: 'Full-width mega menu' }
    },
    usageExample: '<MegaMenu items={[{title: "Products", links: [...]}]} />',
    usageTips: ['Great for e-commerce sites', 'Group related links in columns', 'Can include featured images or promotions'],
    component: NavigationComponents.MegaMenu,
    generateHtml: (props) => generateMenuHtml({ ...props, variant: 'mega' }),
  },
  {
    id: 'breadcrumbs',
    name: 'Breadcrumbs',
    category: 'navigation',
    description: 'Breadcrumb navigation trail',
    icon: '›',
    defaultProps: { items: [], separator: '/', showHomeIcon: true },
    propTypes: {
      items: { type: 'array', description: 'Breadcrumb items [{label, href}]', required: true },
      separator: { type: 'select', options: [{ value: '/', label: '/' }, { value: '>', label: '>' }, { value: '»', label: '»' }, { value: '→', label: '→' }], default: '/' },
      showHomeIcon: { type: 'boolean', default: true, description: 'Show home icon for first item' },
      maxItems: { type: 'number', default: 5, min: 2, max: 10, description: 'Max visible items before truncation' }
    },
    usageExample: '<Breadcrumbs items={[{label: "Home", href: "/"}, {label: "Products", href: "/products"}]} />',
    usageTips: ['Helps users understand their location', 'Keep labels short and clear', 'Last item should be current page (not clickable)'],
    component: NavigationComponents.Breadcrumbs,
    generateHtml: generateBreadcrumbHtml,
  },
  {
    id: 'pagination',
    name: 'Pagination',
    category: 'navigation',
    description: 'Page navigation controls',
    icon: '⋯',
    defaultProps: { currentPage: 1, totalPages: 10, showFirstLast: true },
    propTypes: {
      currentPage: { type: 'number', default: 1, min: 1, description: 'Current active page', required: true },
      totalPages: { type: 'number', default: 10, min: 1, description: 'Total number of pages', required: true },
      showFirstLast: { type: 'boolean', default: true, description: 'Show first/last page buttons' },
      siblingCount: { type: 'number', default: 1, min: 0, max: 3, description: 'Pages shown on each side of current' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'simple', label: 'Simple' }, { value: 'compact', label: 'Compact' }], default: 'default' }
    },
    usageExample: '<Pagination currentPage={1} totalPages={10} onPageChange={(p) => setPage(p)} />',
    usageTips: ['Essential for long content lists', 'Consider adding page size selector', 'Show total items count for context'],
    component: NavigationComponents.Pagination,
    generateHtml: generatePaginationHtml,
  },
  {
    id: 'tab-navigation',
    name: 'Tab Navigation',
    category: 'navigation',
    description: 'Tabbed interface navigation',
    icon: '▭',
    defaultProps: { tabs: [], variant: 'underline', size: 'md' },
    propTypes: {
      tabs: { type: 'array', description: 'Tab items [{label, id, icon?, disabled?}]', required: true },
      variant: { type: 'select', options: [{ value: 'underline', label: 'Underline' }, { value: 'pills', label: 'Pills' }, { value: 'enclosed', label: 'Enclosed' }], default: 'underline' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      fullWidth: { type: 'boolean', default: false, description: 'Tabs fill container width' }
    },
    usageExample: '<TabNavigation tabs={[{label: "Overview", id: "overview"}]} activeTab="overview" />',
    usageTips: ['Use for content switching without page reload', 'Keep tab labels short (1-2 words)', 'Consider icons for visual distinction'],
    component: NavigationComponents.TabNavigation,
    generateHtml: generateTabsHtml,
  },
  {
    id: 'sidebar-section',
    name: 'Sidebar Section',
    category: 'navigation',
    description: 'Collapsible sidebar section',
    icon: '▤',
    defaultProps: { title: 'Section', items: [], defaultOpen: true },
    propTypes: {
      title: { type: 'string', default: 'Section', description: 'Section header title', required: true },
      items: { type: 'array', description: 'Section items [{label, href}]', required: true },
      defaultOpen: { type: 'boolean', default: true, description: 'Start expanded' },
      collapsible: { type: 'boolean', default: true, description: 'Allow collapse/expand' }
    },
    usageExample: '<SidebarSection title="Categories" items={[...]} />',
    usageTips: ['Group related navigation items', 'Use in sidebar or mobile menu', 'Consider default state based on importance']
  },
  {
    id: 'link-list',
    name: 'Link List',
    category: 'navigation',
    description: 'Simple list of links',
    icon: '≡',
    defaultProps: { links: [], variant: 'default', showArrow: false },
    propTypes: {
      links: { type: 'array', description: 'Links [{label, href, description?}]', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'underline', label: 'Underline' }, { value: 'muted', label: 'Muted' }], default: 'default' },
      showArrow: { type: 'boolean', default: false, description: 'Show arrow icon on hover' },
      spacing: { type: 'select', options: [{ value: 'tight', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'relaxed', label: 'Relaxed' }], default: 'normal' }
    },
    usageExample: '<LinkList links={[{label: "Privacy Policy", href: "/privacy"}]} />',
    usageTips: ['Perfect for footer links', 'Add descriptions for more context', 'Keep link labels descriptive but concise']
  },
  {
    id: 'quick-links',
    name: 'Quick Links',
    category: 'navigation',
    description: 'Quick access link buttons',
    icon: '⚡',
    defaultProps: { links: [], columns: 2, showIcons: true },
    propTypes: {
      links: { type: 'array', description: 'Quick links [{label, href, icon, description?}]', required: true },
      columns: { type: 'number', default: 2, min: 1, max: 4, description: 'Number of columns' },
      showIcons: { type: 'boolean', default: true, description: 'Display icons' },
      variant: { type: 'select', options: [{ value: 'card', label: 'Card' }, { value: 'button', label: 'Button' }, { value: 'minimal', label: 'Minimal' }], default: 'card' }
    },
    usageExample: '<QuickLinks links={[{label: "Dashboard", href: "/dashboard", icon: "home"}]} />',
    usageTips: ['Great for homepage or dashboard', 'Use meaningful icons', 'Limit to 4-8 most important links']
  },
  {
    id: 'step-navigation',
    name: 'Step Navigation',
    category: 'navigation',
    description: 'Multi-step progress navigation',
    icon: '→',
    defaultProps: { steps: [], currentStep: 0, variant: 'default' },
    propTypes: {
      steps: { type: 'array', description: 'Steps [{label, description?}]', required: true },
      currentStep: { type: 'number', default: 0, min: 0, description: 'Current active step (0-indexed)' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'arrows', label: 'Arrows' }, { value: 'circles', label: 'Circles' }], default: 'default' },
      showDescription: { type: 'boolean', default: true, description: 'Show step descriptions' }
    },
    usageExample: '<StepNavigation steps={[{label: "Cart"}, {label: "Checkout"}]} currentStep={0} />',
    usageTips: ['Use for checkout or onboarding flows', 'Keep step labels short', 'Show completed steps as clickable']
  },
  {
    id: 'anchor-nav',
    name: 'Anchor Navigation',
    category: 'navigation',
    description: 'In-page anchor links',
    icon: '⚓',
    defaultProps: { anchors: [], sticky: true, offset: 80 },
    propTypes: {
      anchors: { type: 'array', description: 'Anchor links [{label, id}]', required: true },
      sticky: { type: 'boolean', default: true, description: 'Stick to top when scrolling' },
      offset: { type: 'number', default: 80, description: 'Scroll offset in pixels' },
      highlightActive: { type: 'boolean', default: true, description: 'Highlight current section' }
    },
    usageExample: '<AnchorNav anchors={[{label: "Overview", id: "overview"}]} />',
    usageTips: ['Great for long documentation pages', 'IDs must match section headings', 'Consider smooth scroll behavior']
  },
  {
    id: 'mobile-menu',
    name: 'Mobile Menu',
    category: 'navigation',
    description: 'Mobile-friendly hamburger menu',
    icon: '☰',
    defaultProps: { items: [], position: 'left', overlay: true },
    propTypes: {
      items: { type: 'array', description: 'Menu items [{label, href, children?}]', required: true },
      position: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'left' },
      overlay: { type: 'boolean', default: true, description: 'Show overlay when open' },
      showCloseButton: { type: 'boolean', default: true, description: 'Show close button' }
    },
    usageExample: '<MobileMenu items={[{label: "Home", href: "/"}]} isOpen={isOpen} />',
    usageTips: ['Shows automatically on mobile', 'Include all important navigation', 'Consider adding search and user menu']
  },
  {
    id: 'dropdown-menu',
    name: 'Dropdown Menu',
    category: 'navigation',
    description: 'Dropdown navigation menu',
    icon: '▼',
    defaultProps: { items: [], trigger: 'hover', position: 'bottom' },
    propTypes: {
      items: { type: 'array', description: 'Dropdown items [{label, href, divider?}]', required: true },
      trigger: { type: 'select', options: [{ value: 'hover', label: 'Hover' }, { value: 'click', label: 'Click' }], default: 'hover' },
      position: { type: 'select', options: [{ value: 'bottom', label: 'Bottom' }, { value: 'right', label: 'Right' }], default: 'bottom' },
      showArrow: { type: 'boolean', default: true, description: 'Show dropdown arrow' }
    },
    usageExample: '<DropdownMenu label="Options" items={[{label: "Edit", href: "#"}]} />',
    usageTips: ['Use for secondary navigation options', 'Add dividers to group items', 'Consider keyboard navigation']
  },
  {
    id: 'tree-navigation',
    name: 'Tree Navigation',
    category: 'navigation',
    description: 'Hierarchical tree menu',
    icon: '🌳',
    defaultProps: { items: [], expandable: true, showCheckboxes: false },
    propTypes: {
      items: { type: 'array', description: 'Tree items with nested children', required: true },
      expandable: { type: 'boolean', default: true, description: 'Allow expand/collapse' },
      showCheckboxes: { type: 'boolean', default: false, description: 'Show selection checkboxes' },
      defaultExpandAll: { type: 'boolean', default: false, description: 'Expand all by default' }
    },
    usageExample: '<TreeNavigation items={[{label: "Docs", children: [...]}]} />',
    usageTips: ['Ideal for file explorers or docs', 'Keep nesting levels manageable', 'Use icons to indicate item types']
  },
  {
    id: 'language-selector',
    name: 'Language Selector',
    category: 'navigation',
    description: 'Language/locale selector',
    icon: '🌐',
    defaultProps: { languages: [], currentLanguage: 'en', showFlags: true },
    propTypes: {
      languages: { type: 'array', description: 'Languages [{code, label, flag?}]', required: true },
      currentLanguage: { type: 'string', default: 'en', description: 'Current language code' },
      showFlags: { type: 'boolean', default: true, description: 'Show country flags' },
      variant: { type: 'select', options: [{ value: 'dropdown', label: 'Dropdown' }, { value: 'buttons', label: 'Buttons' }], default: 'dropdown' }
    },
    usageExample: '<LanguageSelector languages={[{code: "en", label: "English"}]} />',
    usageTips: ['Place in header for visibility', 'Use native language names', 'Consider auto-detection option']
  }
];

// Content Components
export const contentComponents: ComponentMeta[] = [
  {
    id: 'card',
    name: 'Card',
    category: 'content',
    description: 'Basic content card',
    icon: '▢',
    defaultProps: { title: 'Card Title', showImage: false, variant: 'default' },
    propTypes: {
      title: { type: 'string', default: 'Card Title', description: 'Card title text', required: true },
      description: { type: 'string', description: 'Card description text' },
      showImage: { type: 'boolean', default: false, description: 'Show header image' },
      imageUrl: { type: 'string', description: 'Header image URL' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'outlined', label: 'Outlined' }, { value: 'elevated', label: 'Elevated' }], default: 'default' },
      padding: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' }
    },
    usageExample: '<Card title="My Card" description="Card content here" />',
    usageTips: ['Use for grouping related content', 'Keep titles concise', 'Consider hover effects for interactive cards']
  },
  {
    id: 'post-card',
    name: 'Post Card',
    category: 'content',
    description: 'Blog post card with image',
    icon: '📰',
    defaultProps: { title: 'Post Title', showAuthor: true, showDate: true },
    propTypes: {
      title: { type: 'string', default: 'Post Title', description: 'Post title', required: true },
      excerpt: { type: 'string', description: 'Post excerpt/summary' },
      imageUrl: { type: 'string', description: 'Featured image URL' },
      author: { type: 'string', description: 'Author name' },
      date: { type: 'string', description: 'Publication date' },
      showAuthor: { type: 'boolean', default: true, description: 'Display author info' },
      showDate: { type: 'boolean', default: true, description: 'Display date' },
      variant: { type: 'select', options: [{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }], default: 'vertical' }
    },
    usageExample: '<PostCard title="My Post" excerpt="..." author="John" />',
    usageTips: ['Great for blog listings', 'Use consistent image sizes', 'Show reading time for longer posts']
  },
  {
    id: 'stat-card',
    name: 'Stat Card',
    category: 'content',
    description: 'Statistics display card',
    icon: '📊',
    defaultProps: { value: '0', label: 'Stat', showTrend: false },
    propTypes: {
      value: { type: 'string', default: '0', description: 'Main statistic value', required: true },
      label: { type: 'string', default: 'Stat', description: 'Statistic label', required: true },
      icon: { type: 'icon', description: 'Icon to display' },
      trend: { type: 'number', description: 'Trend percentage (+/-)' },
      showTrend: { type: 'boolean', default: false, description: 'Show trend indicator' },
      color: { type: 'color', default: '#3b82f6', description: 'Accent color' }
    },
    usageExample: '<StatCard value="1,234" label="Users" trend={12.5} />',
    usageTips: ['Use for dashboards and analytics', 'Format large numbers (1.2K)', 'Color-code positive/negative trends']
  },
  {
    id: 'list-item',
    name: 'List Item',
    category: 'content',
    description: 'List item with icon',
    icon: '•',
    defaultProps: { title: 'List Item', showIcon: true },
    propTypes: {
      title: { type: 'string', default: 'List Item', description: 'Item title', required: true },
      description: { type: 'string', description: 'Item description' },
      icon: { type: 'icon', description: 'Leading icon' },
      showIcon: { type: 'boolean', default: true, description: 'Display icon' },
      showArrow: { type: 'boolean', default: false, description: 'Show trailing arrow' },
      clickable: { type: 'boolean', default: false, description: 'Make item clickable' }
    },
    usageExample: '<ListItem title="Settings" icon="settings" />',
    usageTips: ['Use consistent icon styles', 'Add hover states for clickable items', 'Group related items together']
  },
  {
    id: 'feature-card',
    name: 'Feature Card',
    category: 'content',
    description: 'Feature highlight card',
    icon: '⭐',
    defaultProps: { title: 'Feature', centered: true },
    propTypes: {
      title: { type: 'string', default: 'Feature', description: 'Feature title', required: true },
      description: { type: 'string', description: 'Feature description' },
      icon: { type: 'icon', description: 'Feature icon' },
      centered: { type: 'boolean', default: true, description: 'Center content' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'bordered', label: 'Bordered' }, { value: 'gradient', label: 'Gradient' }], default: 'default' }
    },
    usageExample: '<FeatureCard title="Fast" description="Lightning quick" icon="zap" />',
    usageTips: ['Use for landing page features', 'Keep descriptions brief', 'Use relevant icons']
  },
  {
    id: 'testimonial-card',
    name: 'Testimonial Card',
    category: 'content',
    description: 'Customer testimonial',
    icon: '💬',
    defaultProps: { quote: 'Testimonial text', showRating: true },
    propTypes: {
      quote: { type: 'string', default: 'Testimonial text', description: 'Testimonial quote', required: true },
      author: { type: 'string', description: 'Author name' },
      role: { type: 'string', description: 'Author role/company' },
      avatarUrl: { type: 'string', description: 'Author avatar URL' },
      rating: { type: 'number', min: 1, max: 5, default: 5, description: 'Star rating (1-5)' },
      showRating: { type: 'boolean', default: true, description: 'Display star rating' }
    },
    usageExample: '<TestimonialCard quote="Great product!" author="Jane" rating={5} />',
    usageTips: ['Use real testimonials when possible', 'Include company names for B2B', 'Photos increase credibility']
  },
  {
    id: 'timeline',
    name: 'Timeline',
    category: 'content',
    description: 'Vertical timeline display',
    icon: '📅',
    defaultProps: { items: [], variant: 'default' },
    propTypes: {
      items: { type: 'array', description: 'Timeline items [{date, title, description}]', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'alternating', label: 'Alternating' }, { value: 'compact', label: 'Compact' }], default: 'default' },
      showConnector: { type: 'boolean', default: true, description: 'Show connecting line' },
      color: { type: 'color', default: '#3b82f6', description: 'Timeline accent color' }
    },
    usageExample: '<Timeline items={[{date: "2024", title: "Launch"}]} />',
    usageTips: ['Great for company history', 'Order chronologically', 'Keep entries concise']
  },
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'content',
    description: 'Expandable content sections',
    icon: '▽',
    defaultProps: { items: [], allowMultiple: false },
    propTypes: {
      items: { type: 'array', description: 'Accordion items [{title, content}]', required: true },
      allowMultiple: { type: 'boolean', default: false, description: 'Allow multiple open sections' },
      defaultOpenIndex: { type: 'number', default: 0, description: 'Initially open item index' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'bordered', label: 'Bordered' }, { value: 'separated', label: 'Separated' }], default: 'default' }
    },
    usageExample: '<Accordion items={[{title: "FAQ 1", content: "Answer..."}]} />',
    usageTips: ['Perfect for FAQs', 'Keep titles as questions', 'Consider search for many items']
  },
  {
    id: 'tag-cloud',
    name: 'Tag Cloud',
    category: 'content',
    description: 'Collection of tags',
    icon: '🏷',
    defaultProps: { tags: [], clickable: true },
    propTypes: {
      tags: { type: 'array', description: 'Tags [{label, count?, href?}]', required: true },
      clickable: { type: 'boolean', default: true, description: 'Tags are clickable' },
      showCount: { type: 'boolean', default: false, description: 'Show tag counts' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'outlined', label: 'Outlined' }, { value: 'colored', label: 'Colored' }], default: 'default' }
    },
    usageExample: '<TagCloud tags={[{label: "React"}, {label: "TypeScript"}]} />',
    usageTips: ['Use for content categorization', 'Limit visible tags', 'Consider tag frequency sizing']
  },
  {
    id: 'price-card',
    name: 'Price Card',
    category: 'content',
    description: 'Pricing plan card',
    icon: '💰',
    defaultProps: { price: '$0', period: 'month', featured: false },
    propTypes: {
      name: { type: 'string', description: 'Plan name', required: true },
      price: { type: 'string', default: '$0', description: 'Price value', required: true },
      period: { type: 'select', options: [{ value: 'month', label: 'Per Month' }, { value: 'year', label: 'Per Year' }, { value: 'once', label: 'One Time' }], default: 'month' },
      features: { type: 'array', description: 'List of features' },
      featured: { type: 'boolean', default: false, description: 'Highlight as featured' },
      ctaText: { type: 'string', default: 'Get Started', description: 'Button text' }
    },
    usageExample: '<PriceCard name="Pro" price="$29" features={["Feature 1"]} />',
    usageTips: ['Highlight recommended plan', 'Show annual savings', 'List key features first']
  },
  {
    id: 'alert',
    name: 'Alert',
    category: 'content',
    description: 'Alert/notification banner',
    icon: '⚠',
    defaultProps: { message: 'Alert message', type: 'info', dismissible: true },
    propTypes: {
      message: { type: 'string', default: 'Alert message', description: 'Alert message text', required: true },
      title: { type: 'string', description: 'Alert title' },
      type: { type: 'select', options: [{ value: 'info', label: 'Info' }, { value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }], default: 'info' },
      dismissible: { type: 'boolean', default: true, description: 'Can be dismissed' },
      showIcon: { type: 'boolean', default: true, description: 'Show type icon' }
    },
    usageExample: '<Alert type="success" message="Changes saved!" />',
    usageTips: ['Use appropriate type for context', 'Keep messages concise', 'Add action buttons when needed']
  },
  {
    id: 'empty-state',
    name: 'Empty State',
    category: 'content',
    description: 'Empty content placeholder',
    icon: '○',
    defaultProps: { message: 'No items', showIcon: true },
    propTypes: {
      title: { type: 'string', description: 'Empty state title' },
      message: { type: 'string', default: 'No items', description: 'Empty state message', required: true },
      icon: { type: 'icon', description: 'Illustration icon' },
      showIcon: { type: 'boolean', default: true, description: 'Show illustration' },
      actionLabel: { type: 'string', description: 'Action button text' }
    },
    usageExample: '<EmptyState title="No results" message="Try a different search" />',
    usageTips: ['Provide helpful guidance', 'Include action to resolve', 'Use friendly illustrations']
  },
  {
    id: 'data-table-row',
    name: 'Data Table Row',
    category: 'content',
    description: 'Table row component',
    icon: '▭',
    defaultProps: { cells: [], selectable: false },
    propTypes: {
      cells: { type: 'array', description: 'Cell values array', required: true },
      selectable: { type: 'boolean', default: false, description: 'Show checkbox' },
      clickable: { type: 'boolean', default: false, description: 'Row is clickable' },
      highlighted: { type: 'boolean', default: false, description: 'Highlight row' }
    },
    usageExample: '<DataTableRow cells={["John", "john@email.com", "Admin"]} />',
    usageTips: ['Align data consistently', 'Use alternating row colors', 'Support row actions']
  },
  {
    id: 'callout',
    name: 'Callout',
    category: 'content',
    description: 'Highlighted callout box',
    icon: '📌',
    defaultProps: { content: 'Callout text', variant: 'info' },
    propTypes: {
      content: { type: 'string', default: 'Callout text', description: 'Callout content', required: true },
      title: { type: 'string', description: 'Callout title' },
      variant: { type: 'select', options: [{ value: 'info', label: 'Info' }, { value: 'tip', label: 'Tip' }, { value: 'warning', label: 'Warning' }, { value: 'note', label: 'Note' }], default: 'info' },
      showIcon: { type: 'boolean', default: true, description: 'Show variant icon' }
    },
    usageExample: '<Callout variant="tip" content="Pro tip: ..." />',
    usageTips: ['Use in documentation', 'Highlight important info', 'Keep content focused']
  },
  {
    id: 'counter',
    name: 'Counter',
    category: 'content',
    description: 'Animated counter display',
    icon: '🔢',
    defaultProps: { value: 100, animated: true },
    propTypes: {
      value: { type: 'number', default: 100, description: 'Counter end value', required: true },
      prefix: { type: 'string', description: 'Value prefix (e.g., $)' },
      suffix: { type: 'string', description: 'Value suffix (e.g., +)' },
      animated: { type: 'boolean', default: true, description: 'Animate on scroll' },
      duration: { type: 'number', default: 2000, description: 'Animation duration (ms)' }
    },
    usageExample: '<Counter value={1000} suffix="+" animated />',
    usageTips: ['Great for statistics sections', 'Trigger on scroll into view', 'Use meaningful numbers']
  },
  {
    id: 'quote',
    name: 'Quote',
    category: 'content',
    description: 'Block quote display',
    icon: '❝',
    defaultProps: { text: 'Quote text', showQuoteMarks: true },
    propTypes: {
      text: { type: 'string', default: 'Quote text', description: 'Quote text', required: true },
      author: { type: 'string', description: 'Quote author' },
      source: { type: 'string', description: 'Quote source' },
      showQuoteMarks: { type: 'boolean', default: true, description: 'Display quote marks' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'bordered', label: 'Bordered' }, { value: 'large', label: 'Large' }], default: 'default' }
    },
    usageExample: '<Quote text="To be or not to be" author="Shakespeare" />',
    usageTips: ['Cite sources when applicable', 'Use for testimonials too', 'Style consistently']
  },
  {
    id: 'category-list',
    name: 'Category List',
    category: 'content',
    description: 'Category navigation list',
    icon: '📁',
    defaultProps: { categories: [], showCount: true },
    propTypes: {
      categories: { type: 'array', description: 'Categories [{name, count, href}]', required: true },
      showCount: { type: 'boolean', default: true, description: 'Show item counts' },
      showIcon: { type: 'boolean', default: false, description: 'Show category icons' },
      variant: { type: 'select', options: [{ value: 'list', label: 'List' }, { value: 'grid', label: 'Grid' }], default: 'list' }
    },
    usageExample: '<CategoryList categories={[{name: "Tech", count: 42}]} />',
    usageTips: ['Show post counts', 'Order by popularity or alphabetically', 'Support nested categories']
  },
  {
    id: 'progress-card',
    name: 'Progress Card',
    category: 'content',
    description: 'Progress indicator card',
    icon: '📈',
    defaultProps: { progress: 50, showPercentage: true },
    propTypes: {
      title: { type: 'string', description: 'Progress title' },
      progress: { type: 'number', default: 50, min: 0, max: 100, description: 'Progress percentage (0-100)', required: true },
      showPercentage: { type: 'boolean', default: true, description: 'Display percentage' },
      color: { type: 'color', default: '#3b82f6', description: 'Progress bar color' },
      variant: { type: 'select', options: [{ value: 'bar', label: 'Bar' }, { value: 'circle', label: 'Circle' }], default: 'bar' }
    },
    usageExample: '<ProgressCard title="Project" progress={75} />',
    usageTips: ['Use for goals or progress tracking', 'Color-code completion levels', 'Add milestone markers']
  },
  {
    id: 'info-row',
    name: 'Info Row',
    category: 'content',
    description: 'Label-value info row',
    icon: 'ℹ',
    defaultProps: { label: 'Label', value: 'Value' },
    propTypes: {
      label: { type: 'string', default: 'Label', description: 'Row label', required: true },
      value: { type: 'string', default: 'Value', description: 'Row value', required: true },
      copyable: { type: 'boolean', default: false, description: 'Allow value copy' },
      icon: { type: 'icon', description: 'Leading icon' }
    },
    usageExample: '<InfoRow label="Email" value="user@example.com" />',
    usageTips: ['Use for details/profile pages', 'Support copy for relevant values', 'Group related rows']
  },
  {
    id: 'notification-item',
    name: 'Notification Item',
    category: 'content',
    description: 'Notification list item',
    icon: '🔔',
    defaultProps: { title: 'Notification', unread: true },
    propTypes: {
      title: { type: 'string', default: 'Notification', description: 'Notification title', required: true },
      message: { type: 'string', description: 'Notification message' },
      time: { type: 'string', description: 'Time/date string' },
      unread: { type: 'boolean', default: true, description: 'Mark as unread' },
      type: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }], default: 'default' }
    },
    usageExample: '<NotificationItem title="New message" time="5m ago" unread />',
    usageTips: ['Show relative times', 'Indicate unread status clearly', 'Support mark as read action']
  },
  {
    id: 'comparison-row',
    name: 'Comparison Row',
    category: 'content',
    description: 'Feature comparison row',
    icon: '⚖',
    defaultProps: { feature: 'Feature', values: [] },
    propTypes: {
      feature: { type: 'string', default: 'Feature', description: 'Feature name', required: true },
      values: { type: 'array', description: 'Comparison values per plan', required: true },
      showCheckmarks: { type: 'boolean', default: true, description: 'Use checkmarks for booleans' },
      highlighted: { type: 'boolean', default: false, description: 'Highlight this row' }
    },
    usageExample: '<ComparisonRow feature="Storage" values={["10GB", "100GB", "Unlimited"]} />',
    usageTips: ['Use in pricing comparison tables', 'Group features by category', 'Highlight key differences']
  }
];

// Interactive Components
export const interactiveComponents: ComponentMeta[] = [
  {
    id: 'button',
    name: 'Button',
    category: 'interactive',
    description: 'Clickable button',
    icon: '▢',
    defaultProps: { label: 'Button', variant: 'primary', size: 'md' },
    propTypes: {
      label: { type: 'string', default: 'Button', description: 'Button text', required: true },
      variant: { type: 'select', options: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'outline', label: 'Outline' }, { value: 'ghost', label: 'Ghost' }, { value: 'danger', label: 'Danger' }], default: 'primary' },
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      icon: { type: 'icon', description: 'Icon to display' },
      iconPosition: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'left' },
      disabled: { type: 'boolean', default: false, description: 'Disable button' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' },
      fullWidth: { type: 'boolean', default: false, description: 'Full width button' }
    },
    usageExample: '<Button label="Click Me" variant="primary" size="md" />',
    usageTips: ['Use primary for main actions', 'Use danger for destructive actions', 'Add loading state for async operations']
  },
  {
    id: 'icon-button',
    name: 'Icon Button',
    category: 'interactive',
    description: 'Button with icon only',
    icon: '●',
    defaultProps: { icon: 'settings', size: 'md', variant: 'ghost' },
    propTypes: {
      icon: { type: 'icon', description: 'Icon to display', required: true },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'solid', label: 'Solid' }, { value: 'outline', label: 'Outline' }, { value: 'ghost', label: 'Ghost' }], default: 'ghost' },
      tooltip: { type: 'string', description: 'Tooltip text on hover' },
      color: { type: 'color', default: '#6b7280', description: 'Icon color' },
      rounded: { type: 'boolean', default: true, description: 'Fully rounded button' }
    },
    usageExample: '<IconButton icon="settings" tooltip="Settings" />',
    usageTips: ['Always add a tooltip for accessibility', 'Use for toolbar actions', 'Keep consistent sizes in groups']
  },
  {
    id: 'toggle-switch',
    name: 'Toggle Switch',
    category: 'interactive',
    description: 'On/off toggle switch',
    icon: '⊙',
    defaultProps: { checked: false, size: 'md' },
    propTypes: {
      checked: { type: 'boolean', default: false, description: 'Toggle state' },
      label: { type: 'string', description: 'Label text' },
      labelPosition: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'right' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      disabled: { type: 'boolean', default: false, description: 'Disable toggle' },
      color: { type: 'color', default: '#3b82f6', description: 'Active color' }
    },
    usageExample: '<ToggleSwitch checked={isEnabled} onChange={setIsEnabled} label="Enable feature" />',
    usageTips: ['Use for binary on/off settings', 'Provide clear labels', 'Consider immediate effect feedback']
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    category: 'interactive',
    description: 'Checkbox input',
    icon: '☑',
    defaultProps: { label: 'Checkbox', checked: false },
    propTypes: {
      label: { type: 'string', default: 'Checkbox', description: 'Checkbox label', required: true },
      checked: { type: 'boolean', default: false, description: 'Checked state' },
      indeterminate: { type: 'boolean', default: false, description: 'Indeterminate state' },
      disabled: { type: 'boolean', default: false, description: 'Disable checkbox' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      color: { type: 'color', default: '#3b82f6', description: 'Check color' }
    },
    usageExample: '<Checkbox label="Accept terms" checked={accepted} onChange={setAccepted} />',
    usageTips: ['Use for multiple selections', 'Keep labels concise', 'Use indeterminate for partial selection']
  },
  {
    id: 'radio-group',
    name: 'Radio Group',
    category: 'interactive',
    description: 'Radio button group',
    icon: '◉',
    defaultProps: { options: [], orientation: 'vertical' },
    propTypes: {
      options: { type: 'array', description: 'Radio options [{value, label, disabled?}]', required: true },
      value: { type: 'string', description: 'Selected value' },
      orientation: { type: 'select', options: [{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }], default: 'vertical' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      color: { type: 'color', default: '#3b82f6', description: 'Selected color' }
    },
    usageExample: '<RadioGroup options={[{value: "a", label: "Option A"}]} value={selected} />',
    usageTips: ['Use for single selection from few options', 'Limit to 5-7 options max', 'Consider dropdown for more options']
  },
  {
    id: 'modal',
    name: 'Modal',
    category: 'interactive',
    description: 'Modal dialog overlay',
    icon: '▣',
    defaultProps: { title: 'Modal', size: 'md', closeOnOverlay: true },
    propTypes: {
      title: { type: 'string', default: 'Modal', description: 'Modal title', required: true },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }, { value: 'full', label: 'Full Screen' }], default: 'md' },
      closeOnOverlay: { type: 'boolean', default: true, description: 'Close on backdrop click' },
      showCloseButton: { type: 'boolean', default: true, description: 'Show close X button' },
      centered: { type: 'boolean', default: true, description: 'Center modal vertically' },
      scrollBehavior: { type: 'select', options: [{ value: 'inside', label: 'Scroll Inside' }, { value: 'outside', label: 'Scroll Outside' }], default: 'inside' }
    },
    usageExample: '<Modal isOpen={isOpen} onClose={close} title="My Modal">Content</Modal>',
    usageTips: ['Focus on one task per modal', 'Provide clear close action', 'Use appropriate size for content']
  },
  {
    id: 'drawer',
    name: 'Drawer',
    category: 'interactive',
    description: 'Sliding drawer panel',
    icon: '◧',
    defaultProps: { position: 'right', size: 'md' },
    propTypes: {
      position: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }], default: 'right' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'full', label: 'Full' }], default: 'md' },
      overlay: { type: 'boolean', default: true, description: 'Show overlay backdrop' },
      closeOnOverlay: { type: 'boolean', default: true, description: 'Close on backdrop click' },
      showCloseButton: { type: 'boolean', default: true, description: 'Show close button' }
    },
    usageExample: '<Drawer isOpen={isOpen} onClose={close} position="right">Content</Drawer>',
    usageTips: ['Use for secondary content', 'Great for filters and settings', 'Consider responsive behavior']
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'interactive',
    description: 'Hover tooltip',
    icon: '💭',
    defaultProps: { content: 'Tooltip text', position: 'top', delay: 200 },
    propTypes: {
      content: { type: 'string', default: 'Tooltip text', description: 'Tooltip content', required: true },
      position: { type: 'select', options: [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'top' },
      delay: { type: 'number', default: 200, min: 0, max: 1000, description: 'Delay before showing (ms)' },
      arrow: { type: 'boolean', default: true, description: 'Show arrow pointer' },
      maxWidth: { type: 'number', default: 200, description: 'Max width in pixels' }
    },
    usageExample: '<Tooltip content="More info" position="top"><button>?</button></Tooltip>',
    usageTips: ['Keep text short and helpful', 'Use for icon-only buttons', 'Avoid essential information']
  },
  {
    id: 'popover',
    name: 'Popover',
    category: 'interactive',
    description: 'Click popover',
    icon: '🗨',
    defaultProps: { position: 'bottom', trigger: 'click' },
    propTypes: {
      position: { type: 'select', options: [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'bottom' },
      trigger: { type: 'select', options: [{ value: 'click', label: 'Click' }, { value: 'hover', label: 'Hover' }], default: 'click' },
      closeOnClickOutside: { type: 'boolean', default: true, description: 'Close when clicking outside' },
      showArrow: { type: 'boolean', default: true, description: 'Show arrow pointer' },
      offset: { type: 'number', default: 8, description: 'Offset from trigger' }
    },
    usageExample: '<Popover content={<Menu />}><Button>Options</Button></Popover>',
    usageTips: ['Use for contextual menus', 'Keep content focused', 'Consider mobile interactions']
  },
  {
    id: 'copy-button',
    name: 'Copy Button',
    category: 'interactive',
    description: 'Copy to clipboard button',
    icon: '📋',
    defaultProps: { text: 'Text to copy', showFeedback: true },
    propTypes: {
      text: { type: 'string', default: 'Text to copy', description: 'Text to copy', required: true },
      label: { type: 'string', default: 'Copy', description: 'Button label' },
      successLabel: { type: 'string', default: 'Copied!', description: 'Success message' },
      showFeedback: { type: 'boolean', default: true, description: 'Show success feedback' },
      variant: { type: 'select', options: [{ value: 'button', label: 'Button' }, { value: 'icon', label: 'Icon Only' }], default: 'button' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }], default: 'md' }
    },
    usageExample: '<CopyButton text="Hello World" label="Copy Code" />',
    usageTips: ['Show clear success feedback', 'Use for code snippets', 'Consider security implications']
  },
  {
    id: 'action-menu',
    name: 'Action Menu',
    category: 'interactive',
    description: 'Dropdown action menu',
    icon: '⋮',
    defaultProps: { actions: [], trigger: 'click' },
    propTypes: {
      actions: { type: 'array', description: 'Menu actions [{label, icon?, onClick, danger?}]', required: true },
      trigger: { type: 'select', options: [{ value: 'click', label: 'Click' }, { value: 'hover', label: 'Hover' }], default: 'click' },
      position: { type: 'select', options: [{ value: 'bottom-end', label: 'Bottom End' }, { value: 'bottom-start', label: 'Bottom Start' }], default: 'bottom-end' },
      icon: { type: 'icon', default: 'more-vertical', description: 'Trigger icon' },
      showDividers: { type: 'boolean', default: false, description: 'Show dividers between items' }
    },
    usageExample: '<ActionMenu actions={[{label: "Edit", icon: "edit", onClick: handleEdit}]} />',
    usageTips: ['Group related actions', 'Highlight destructive actions', 'Keep menu items focused']
  },
  {
    id: 'like-button',
    name: 'Like Button',
    category: 'interactive',
    description: 'Like/favorite button',
    icon: '♡',
    defaultProps: { count: 0, liked: false },
    propTypes: {
      count: { type: 'number', default: 0, description: 'Like count' },
      liked: { type: 'boolean', default: false, description: 'Current like state' },
      showCount: { type: 'boolean', default: true, description: 'Display count' },
      animated: { type: 'boolean', default: true, description: 'Animate on click' },
      color: { type: 'color', default: '#ef4444', description: 'Liked color' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' }
    },
    usageExample: '<LikeButton count={42} liked={isLiked} onToggle={toggleLike} />',
    usageTips: ['Add animation for engagement', 'Show count for social proof', 'Consider optimistic updates']
  },
  {
    id: 'bookmark-button',
    name: 'Bookmark Button',
    category: 'interactive',
    description: 'Bookmark/save button',
    icon: '🔖',
    defaultProps: { bookmarked: false, showLabel: false },
    propTypes: {
      bookmarked: { type: 'boolean', default: false, description: 'Bookmarked state' },
      showLabel: { type: 'boolean', default: false, description: 'Show text label' },
      label: { type: 'string', default: 'Save', description: 'Button label' },
      color: { type: 'color', default: '#f59e0b', description: 'Active color' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' }
    },
    usageExample: '<BookmarkButton bookmarked={isSaved} onToggle={toggleSave} />',
    usageTips: ['Use for save/favorite actions', 'Show clear active state', 'Consider adding to collections']
  },
  {
    id: 'counter-input',
    name: 'Counter Input',
    category: 'interactive',
    description: 'Number increment/decrement',
    icon: '±',
    defaultProps: { value: 0, min: 0, max: 100, step: 1 },
    propTypes: {
      value: { type: 'number', default: 0, description: 'Current value', required: true },
      min: { type: 'number', default: 0, description: 'Minimum value' },
      max: { type: 'number', default: 100, description: 'Maximum value' },
      step: { type: 'number', default: 1, description: 'Increment step' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' }
    },
    usageExample: '<CounterInput value={quantity} min={1} max={10} onChange={setQuantity} />',
    usageTips: ['Use for quantity selection', 'Set sensible min/max values', 'Consider keyboard input']
  },
  {
    id: 'password-input',
    name: 'Password Input',
    category: 'interactive',
    description: 'Password with visibility toggle',
    icon: '🔒',
    defaultProps: { showToggle: true, showStrength: false },
    propTypes: {
      placeholder: { type: 'string', default: 'Enter password', description: 'Placeholder text' },
      showToggle: { type: 'boolean', default: true, description: 'Show visibility toggle' },
      showStrength: { type: 'boolean', default: false, description: 'Show strength meter' },
      minLength: { type: 'number', default: 8, description: 'Minimum length' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' }
    },
    usageExample: '<PasswordInput showStrength placeholder="Enter password" />',
    usageTips: ['Always allow visibility toggle', 'Show strength indicator for signup', 'Clear password on submit']
  },
  {
    id: 'expandable-section',
    name: 'Expandable Section',
    category: 'interactive',
    description: 'Expand/collapse section',
    icon: '⌃',
    defaultProps: { title: 'Section', defaultExpanded: false },
    propTypes: {
      title: { type: 'string', default: 'Section', description: 'Section title', required: true },
      defaultExpanded: { type: 'boolean', default: false, description: 'Initially expanded' },
      icon: { type: 'icon', description: 'Title icon' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'bordered', label: 'Bordered' }, { value: 'filled', label: 'Filled' }], default: 'default' },
      animationDuration: { type: 'number', default: 200, description: 'Animation duration (ms)' }
    },
    usageExample: '<ExpandableSection title="Details">Content here</ExpandableSection>',
    usageTips: ['Use for optional content', 'Group related information', 'Consider initial state']
  },
  {
    id: 'fab',
    name: 'Floating Action Button',
    category: 'interactive',
    description: 'Floating action button',
    icon: '+',
    defaultProps: { position: 'bottom-right', icon: 'plus' },
    propTypes: {
      icon: { type: 'icon', default: 'plus', description: 'Button icon', required: true },
      position: { type: 'select', options: [{ value: 'bottom-right', label: 'Bottom Right' }, { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-center', label: 'Bottom Center' }], default: 'bottom-right' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      color: { type: 'color', default: '#3b82f6', description: 'Button color' },
      extended: { type: 'boolean', default: false, description: 'Show with label' },
      label: { type: 'string', description: 'Extended button label' }
    },
    usageExample: '<FAB icon="plus" position="bottom-right" onClick={handleAdd} />',
    usageTips: ['Use for primary page action', 'Hide on scroll if needed', 'Consider speed dial for multiple actions']
  },
  {
    id: 'chip-input',
    name: 'Chip Input',
    category: 'interactive',
    description: 'Tag/chip input field',
    icon: '🏷',
    defaultProps: { chips: [], placeholder: 'Add tags...' },
    propTypes: {
      chips: { type: 'array', description: 'Current chip values', required: true },
      placeholder: { type: 'string', default: 'Add tags...', description: 'Input placeholder' },
      maxChips: { type: 'number', description: 'Maximum number of chips' },
      allowDuplicates: { type: 'boolean', default: false, description: 'Allow duplicate values' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }], default: 'md' }
    },
    usageExample: '<ChipInput chips={tags} onChange={setTags} placeholder="Add tags..." />',
    usageTips: ['Use Enter to add chips', 'Allow backspace to remove', 'Show suggestions if available']
  },
  {
    id: 'confirm-dialog',
    name: 'Confirm Dialog',
    category: 'interactive',
    description: 'Confirmation dialog',
    icon: '❓',
    defaultProps: { title: 'Confirm', type: 'warning' },
    propTypes: {
      title: { type: 'string', default: 'Confirm', description: 'Dialog title', required: true },
      message: { type: 'string', description: 'Confirmation message', required: true },
      type: { type: 'select', options: [{ value: 'info', label: 'Info' }, { value: 'warning', label: 'Warning' }, { value: 'danger', label: 'Danger' }], default: 'warning' },
      confirmLabel: { type: 'string', default: 'Confirm', description: 'Confirm button text' },
      cancelLabel: { type: 'string', default: 'Cancel', description: 'Cancel button text' },
      showIcon: { type: 'boolean', default: true, description: 'Show type icon' }
    },
    usageExample: '<ConfirmDialog title="Delete?" message="This cannot be undone" onConfirm={del} />',
    usageTips: ['Use for destructive actions', 'Be specific about consequences', 'Make cancel the easy option']
  },
  {
    id: 'speed-dial',
    name: 'Speed Dial',
    category: 'interactive',
    description: 'Speed dial action menu',
    icon: '⊕',
    defaultProps: { actions: [], direction: 'up' },
    propTypes: {
      actions: { type: 'array', description: 'Speed dial actions [{icon, label, onClick}]', required: true },
      direction: { type: 'select', options: [{ value: 'up', label: 'Up' }, { value: 'down', label: 'Down' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'up' },
      icon: { type: 'icon', default: 'plus', description: 'Main button icon' },
      closeIcon: { type: 'icon', default: 'x', description: 'Close button icon' },
      color: { type: 'color', default: '#3b82f6', description: 'Button color' },
      showLabels: { type: 'boolean', default: true, description: 'Show action labels' }
    },
    usageExample: '<SpeedDial actions={[{icon: "edit", label: "Edit", onClick: ...}]} />',
    usageTips: ['Limit to 4-6 actions', 'Use meaningful icons', 'Consider accessibility']
  }
];

// Media Components
export const mediaComponents: ComponentMeta[] = [
  {
    id: 'responsive-image',
    name: 'Responsive Image',
    category: 'media',
    description: 'Responsive image container',
    icon: '🖼',
    defaultProps: { src: '', alt: '', objectFit: 'cover' },
    propTypes: {
      src: { type: 'string', description: 'Image source URL', required: true },
      alt: { type: 'string', description: 'Alt text for accessibility', required: true },
      objectFit: { type: 'select', options: [{ value: 'cover', label: 'Cover' }, { value: 'contain', label: 'Contain' }, { value: 'fill', label: 'Fill' }, { value: 'none', label: 'None' }], default: 'cover' },
      aspectRatio: { type: 'select', options: [{ value: '1/1', label: 'Square (1:1)' }, { value: '16/9', label: 'Widescreen (16:9)' }, { value: '4/3', label: 'Standard (4:3)' }, { value: '3/2', label: 'Photo (3:2)' }, { value: 'auto', label: 'Auto' }], default: 'auto' },
      lazy: { type: 'boolean', default: true, description: 'Enable lazy loading' },
      placeholder: { type: 'select', options: [{ value: 'blur', label: 'Blur' }, { value: 'skeleton', label: 'Skeleton' }, { value: 'none', label: 'None' }], default: 'skeleton' },
      rounded: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'full', label: 'Full' }], default: 'none' },
      shadow: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'none' },
      border: { type: 'boolean', default: false, description: 'Show border' },
      hoverEffect: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'zoom', label: 'Zoom' }, { value: 'brightness', label: 'Brightness' }, { value: 'grayscale', label: 'Grayscale' }], default: 'none' }
    },
    usageExample: '<ResponsiveImage src="/image.jpg" alt="Description" aspectRatio="16/9" />',
    usageTips: ['Always provide alt text', 'Use lazy loading for performance', 'Choose appropriate aspect ratio']
  },
  {
    id: 'avatar',
    name: 'Avatar',
    category: 'media',
    description: 'User avatar image',
    icon: '👤',
    defaultProps: { size: 'md', shape: 'circle' },
    propTypes: {
      src: { type: 'string', description: 'Avatar image URL' },
      name: { type: 'string', description: 'User name for initials fallback' },
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small (24px)' }, { value: 'sm', label: 'Small (32px)' }, { value: 'md', label: 'Medium (40px)' }, { value: 'lg', label: 'Large (48px)' }, { value: 'xl', label: 'Extra Large (64px)' }, { value: '2xl', label: '2X Large (96px)' }], default: 'md' },
      shape: { type: 'select', options: [{ value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' }, { value: 'rounded', label: 'Rounded Square' }], default: 'circle' },
      status: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }, { value: 'busy', label: 'Busy' }, { value: 'away', label: 'Away' }], default: 'none' },
      statusPosition: { type: 'select', options: [{ value: 'bottom-right', label: 'Bottom Right' }, { value: 'top-right', label: 'Top Right' }], default: 'bottom-right' },
      backgroundColor: { type: 'color', default: '#3b82f6', description: 'Background color for initials' },
      border: { type: 'boolean', default: false, description: 'Show white border' },
      borderWidth: { type: 'number', default: 2, min: 1, max: 4, description: 'Border width in pixels' }
    },
    usageExample: '<Avatar src="/user.jpg" name="John Doe" size="lg" status="online" />',
    usageTips: ['Provide name for initials fallback', 'Use status indicator for presence', 'Consider consistent sizes']
  },
  {
    id: 'avatar-group',
    name: 'Avatar Group',
    category: 'media',
    description: 'Stacked avatar group',
    icon: '👥',
    defaultProps: { avatars: [], max: 5, size: 'md' },
    propTypes: {
      avatars: { type: 'array', description: 'Array of avatar data [{src, name}]', required: true },
      max: { type: 'number', default: 5, min: 2, max: 10, description: 'Maximum visible avatars' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      overlap: { type: 'number', default: -8, min: -16, max: 0, description: 'Overlap in pixels' },
      showOverflow: { type: 'boolean', default: true, description: 'Show +N count' },
      overflowStyle: { type: 'select', options: [{ value: 'count', label: 'Show Count' }, { value: 'tooltip', label: 'Tooltip on Hover' }], default: 'count' },
      direction: { type: 'select', options: [{ value: 'ltr', label: 'Left to Right' }, { value: 'rtl', label: 'Right to Left' }], default: 'ltr' }
    },
    usageExample: '<AvatarGroup avatars={users} max={4} size="md" />',
    usageTips: ['Limit visible avatars for cleanliness', 'Show tooltip for hidden users', 'Use consistent sizing']
  },
  {
    id: 'image-gallery',
    name: 'Image Gallery',
    category: 'media',
    description: 'Image gallery grid',
    icon: '🖼',
    defaultProps: { images: [], columns: 3, gap: 'md' },
    propTypes: {
      images: { type: 'array', description: 'Gallery images [{src, alt, caption?}]', required: true },
      columns: { type: 'number', default: 3, min: 1, max: 6, description: 'Number of columns' },
      gap: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      layout: { type: 'select', options: [{ value: 'grid', label: 'Grid' }, { value: 'masonry', label: 'Masonry' }, { value: 'justified', label: 'Justified' }], default: 'grid' },
      lightbox: { type: 'boolean', default: true, description: 'Open in lightbox on click' },
      showCaptions: { type: 'boolean', default: false, description: 'Show image captions' },
      hoverEffect: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'zoom', label: 'Zoom' }, { value: 'overlay', label: 'Overlay' }], default: 'zoom' },
      aspectRatio: { type: 'select', options: [{ value: '1/1', label: 'Square' }, { value: '4/3', label: 'Standard' }, { value: 'auto', label: 'Auto' }], default: '1/1' }
    },
    usageExample: '<ImageGallery images={photos} columns={4} lightbox layout="masonry" />',
    usageTips: ['Use masonry for varied image sizes', 'Enable lightbox for full view', 'Optimize images for web']
  },
  {
    id: 'video-player',
    name: 'Video Player',
    category: 'media',
    description: 'Video player component',
    icon: '▶',
    defaultProps: { src: '', autoplay: false, controls: true },
    propTypes: {
      src: { type: 'string', description: 'Video source URL', required: true },
      poster: { type: 'string', description: 'Poster image URL' },
      autoplay: { type: 'boolean', default: false, description: 'Autoplay video' },
      muted: { type: 'boolean', default: false, description: 'Start muted' },
      loop: { type: 'boolean', default: false, description: 'Loop video' },
      controls: { type: 'boolean', default: true, description: 'Show controls' },
      controlsList: { type: 'select', options: [{ value: 'all', label: 'All Controls' }, { value: 'minimal', label: 'Minimal' }, { value: 'custom', label: 'Custom' }], default: 'all' },
      aspectRatio: { type: 'select', options: [{ value: '16/9', label: '16:9' }, { value: '4/3', label: '4:3' }, { value: '1/1', label: '1:1' }], default: '16/9' },
      playsinline: { type: 'boolean', default: true, description: 'Play inline on mobile' },
      preload: { type: 'select', options: [{ value: 'auto', label: 'Auto' }, { value: 'metadata', label: 'Metadata Only' }, { value: 'none', label: 'None' }], default: 'metadata' }
    },
    usageExample: '<VideoPlayer src="/video.mp4" poster="/poster.jpg" controls />',
    usageTips: ['Provide poster for loading state', 'Use muted autoplay sparingly', 'Consider mobile playback']
  },
  {
    id: 'audio-player',
    name: 'Audio Player',
    category: 'media',
    description: 'Audio player component',
    icon: '🔊',
    defaultProps: { src: '', showWaveform: false },
    propTypes: {
      src: { type: 'string', description: 'Audio source URL', required: true },
      title: { type: 'string', description: 'Track title' },
      artist: { type: 'string', description: 'Artist name' },
      coverImage: { type: 'string', description: 'Album art URL' },
      autoplay: { type: 'boolean', default: false, description: 'Autoplay audio' },
      loop: { type: 'boolean', default: false, description: 'Loop audio' },
      showWaveform: { type: 'boolean', default: false, description: 'Show waveform visualization' },
      variant: { type: 'select', options: [{ value: 'minimal', label: 'Minimal' }, { value: 'compact', label: 'Compact' }, { value: 'full', label: 'Full' }], default: 'compact' },
      showDownload: { type: 'boolean', default: false, description: 'Show download button' },
      color: { type: 'color', default: '#3b82f6', description: 'Player accent color' }
    },
    usageExample: '<AudioPlayer src="/audio.mp3" title="Track Name" artist="Artist" />',
    usageTips: ['Show track info when available', 'Consider playlist support', 'Use appropriate variant']
  },
  {
    id: 'file-preview',
    name: 'File Preview',
    category: 'media',
    description: 'File preview card',
    icon: '📄',
    defaultProps: { filename: '', showSize: true },
    propTypes: {
      filename: { type: 'string', description: 'File name', required: true },
      filesize: { type: 'number', description: 'File size in bytes' },
      fileType: { type: 'string', description: 'File MIME type' },
      previewUrl: { type: 'string', description: 'Preview image URL' },
      showSize: { type: 'boolean', default: true, description: 'Show file size' },
      showType: { type: 'boolean', default: true, description: 'Show file type icon' },
      showDownload: { type: 'boolean', default: true, description: 'Show download button' },
      showDelete: { type: 'boolean', default: false, description: 'Show delete button' },
      variant: { type: 'select', options: [{ value: 'card', label: 'Card' }, { value: 'compact', label: 'Compact' }, { value: 'list', label: 'List Item' }], default: 'card' }
    },
    usageExample: '<FilePreview filename="document.pdf" filesize={1024000} />',
    usageTips: ['Show file type icons', 'Format file sizes nicely', 'Provide download action']
  },
  {
    id: 'zoomable-image',
    name: 'Zoomable Image',
    category: 'media',
    description: 'Image with zoom capability',
    icon: '🔍',
    defaultProps: { src: '', zoomScale: 2 },
    propTypes: {
      src: { type: 'string', description: 'Image source URL', required: true },
      alt: { type: 'string', description: 'Alt text', required: true },
      zoomScale: { type: 'number', default: 2, min: 1.5, max: 5, description: 'Zoom magnification' },
      zoomType: { type: 'select', options: [{ value: 'hover', label: 'Hover Zoom' }, { value: 'click', label: 'Click Zoom' }, { value: 'lens', label: 'Lens Zoom' }], default: 'hover' },
      lensSize: { type: 'number', default: 150, description: 'Lens size in pixels' },
      showHint: { type: 'boolean', default: true, description: 'Show zoom hint icon' },
      zoomPosition: { type: 'select', options: [{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }, { value: 'top', label: 'Top' }, { value: 'overlay', label: 'Overlay' }], default: 'right' }
    },
    usageExample: '<ZoomableImage src="/product.jpg" alt="Product" zoomScale={3} />',
    usageTips: ['Great for product images', 'Consider mobile touch zoom', 'Provide high-res source']
  },
  {
    id: 'carousel',
    name: 'Carousel',
    category: 'media',
    description: 'Image/content carousel',
    icon: '◀▶',
    defaultProps: { items: [], autoplay: false, showDots: true },
    propTypes: {
      items: { type: 'array', description: 'Carousel items [{src, alt, caption?}]', required: true },
      autoplay: { type: 'boolean', default: false, description: 'Auto-rotate slides' },
      autoplayInterval: { type: 'number', default: 5000, min: 1000, max: 10000, description: 'Autoplay interval (ms)' },
      showDots: { type: 'boolean', default: true, description: 'Show navigation dots' },
      showArrows: { type: 'boolean', default: true, description: 'Show prev/next arrows' },
      loop: { type: 'boolean', default: true, description: 'Loop slides infinitely' },
      slidesPerView: { type: 'number', default: 1, min: 1, max: 5, description: 'Visible slides' },
      spaceBetween: { type: 'number', default: 0, description: 'Gap between slides' },
      effect: { type: 'select', options: [{ value: 'slide', label: 'Slide' }, { value: 'fade', label: 'Fade' }, { value: 'cube', label: 'Cube' }, { value: 'coverflow', label: 'Coverflow' }], default: 'slide' },
      pauseOnHover: { type: 'boolean', default: true, description: 'Pause autoplay on hover' }
    },
    usageExample: '<Carousel items={slides} autoplay showDots effect="slide" />',
    usageTips: ['Limit autoplay speed', 'Ensure touch/swipe support', 'Consider lazy loading slides']
  },
  {
    id: 'logo',
    name: 'Logo',
    category: 'media',
    description: 'Logo display component',
    icon: '®',
    defaultProps: { src: '', variant: 'default' },
    propTypes: {
      src: { type: 'string', description: 'Logo image URL', required: true },
      darkSrc: { type: 'string', description: 'Dark mode logo URL' },
      alt: { type: 'string', default: 'Logo', description: 'Alt text' },
      href: { type: 'string', description: 'Link URL (usually home)' },
      width: { type: 'number', default: 150, description: 'Logo width' },
      height: { type: 'number', description: 'Logo height' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'icon-only', label: 'Icon Only' }, { value: 'text-only', label: 'Text Only' }], default: 'default' },
      showText: { type: 'boolean', default: false, description: 'Show brand text' },
      brandText: { type: 'string', description: 'Brand name text' }
    },
    usageExample: '<Logo src="/logo.svg" darkSrc="/logo-white.svg" href="/" />',
    usageTips: ['Provide dark mode variant', 'Use SVG for scalability', 'Link to homepage']
  },
  {
    id: 'icon-box',
    name: 'Icon Box',
    category: 'media',
    description: 'Icon container box',
    icon: '◆',
    defaultProps: { icon: 'star', variant: 'default', size: 'md' },
    propTypes: {
      icon: { type: 'icon', description: 'Icon to display', required: true },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }, { value: 'ghost', label: 'Ghost' }], default: 'default' },
      color: { type: 'color', default: '#3b82f6', description: 'Icon color' },
      backgroundColor: { type: 'color', default: '#eff6ff', description: 'Background color' },
      rounded: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'full', label: 'Circle' }], default: 'md' },
      animated: { type: 'boolean', default: false, description: 'Enable hover animation' }
    },
    usageExample: '<IconBox icon="star" variant="filled" color="#f59e0b" />',
    usageTips: ['Use consistent sizes', 'Match brand colors', 'Consider animation for features']
  },
  {
    id: 'thumbnail',
    name: 'Thumbnail',
    category: 'media',
    description: 'Thumbnail image preview',
    icon: '▪',
    defaultProps: { src: '', size: 'md' },
    propTypes: {
      src: { type: 'string', description: 'Image source URL', required: true },
      alt: { type: 'string', description: 'Alt text' },
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small (32px)' }, { value: 'sm', label: 'Small (48px)' }, { value: 'md', label: 'Medium (64px)' }, { value: 'lg', label: 'Large (96px)' }], default: 'md' },
      aspectRatio: { type: 'select', options: [{ value: '1/1', label: 'Square' }, { value: '16/9', label: 'Widescreen' }, { value: '4/3', label: 'Standard' }], default: '1/1' },
      rounded: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'full', label: 'Circle' }], default: 'sm' },
      overlay: { type: 'boolean', default: false, description: 'Show overlay on hover' },
      playIcon: { type: 'boolean', default: false, description: 'Show play icon for videos' }
    },
    usageExample: '<Thumbnail src="/thumb.jpg" size="lg" playIcon />',
    usageTips: ['Use for lists and grids', 'Show play icon for video', 'Maintain consistent sizes']
  }
];

// Social Components
export const socialComponents: ComponentMeta[] = [
  {
    id: 'social-share-buttons',
    name: 'Social Share Buttons',
    category: 'social',
    description: 'Social media share buttons',
    icon: '📤',
    defaultProps: { url: '', platforms: ['facebook', 'twitter', 'linkedin'], size: 'md' },
    propTypes: {
      url: { type: 'string', description: 'URL to share', required: true, placeholder: 'https://yoursite.com/page' },
      title: { type: 'string', description: 'Share title/text' },
      platforms: { type: 'array', description: 'Social platforms to show', default: ['facebook', 'twitter', 'linkedin'] },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }, { value: 'minimal', label: 'Minimal' }], default: 'filled' },
      showLabels: { type: 'boolean', default: false, description: 'Show platform names' },
      showCounts: { type: 'boolean', default: false, description: 'Show share counts' },
      rounded: { type: 'boolean', default: true, description: 'Round button corners' },
      spacing: { type: 'select', options: [{ value: 'tight', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'loose', label: 'Loose' }], default: 'normal' },
      alignment: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }], default: 'left' }
    },
    usageExample: '<SocialShareButtons url="https://example.com" platforms={["facebook", "twitter"]} showCounts />',
    usageTips: ['Include popular platforms for your audience', 'Show counts to encourage sharing', 'Use consistent sizing with other UI']
  },
  {
    id: 'follow-button',
    name: 'Follow Button',
    category: 'social',
    description: 'Follow/unfollow button',
    icon: '👤+',
    defaultProps: { userId: '', isFollowing: false, size: 'md' },
    propTypes: {
      userId: { type: 'string', description: 'User ID to follow', required: true },
      isFollowing: { type: 'boolean', default: false, description: 'Current follow state' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'outline', label: 'Outline' }, { value: 'ghost', label: 'Ghost' }], default: 'default' },
      followText: { type: 'string', default: 'Follow', description: 'Text when not following' },
      followingText: { type: 'string', default: 'Following', description: 'Text when following' },
      unfollowText: { type: 'string', default: 'Unfollow', description: 'Text on hover when following' },
      showIcon: { type: 'boolean', default: true, description: 'Show follow icon' },
      showCount: { type: 'boolean', default: false, description: 'Show follower count' },
      followerCount: { type: 'number', description: 'Current follower count' },
      disabled: { type: 'boolean', default: false, description: 'Disable button' }
    },
    usageExample: '<FollowButton userId="user123" isFollowing={false} showCount followerCount={1234} />',
    usageTips: ['Show hover state for unfollow', 'Update count optimistically', 'Handle loading states']
  },
  {
    id: 'social-links',
    name: 'Social Links',
    category: 'social',
    description: 'Social media profile links',
    icon: '🔗',
    defaultProps: { links: [], size: 'md', variant: 'filled' },
    propTypes: {
      links: { type: 'array', description: 'Array of {platform, url} objects', required: true },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }, { value: 'ghost', label: 'Ghost' }, { value: 'minimal', label: 'Minimal' }], default: 'filled' },
      color: { type: 'select', options: [{ value: 'brand', label: 'Brand Colors' }, { value: 'mono', label: 'Monochrome' }, { value: 'custom', label: 'Custom' }], default: 'brand' },
      customColor: { type: 'color', description: 'Custom icon color' },
      layout: { type: 'select', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }], default: 'horizontal' },
      spacing: { type: 'select', options: [{ value: 'tight', label: 'Tight' }, { value: 'normal', label: 'Normal' }, { value: 'loose', label: 'Loose' }], default: 'normal' },
      showLabels: { type: 'boolean', default: false, description: 'Show platform labels' },
      openInNewTab: { type: 'boolean', default: true, description: 'Open links in new tab' }
    },
    usageExample: '<SocialLinks links={[{platform: "twitter", url: "https://twitter.com/..."}, {platform: "github", url: "..."}]} />',
    usageTips: ['Use brand colors for recognition', 'Open external links in new tab', 'Order by importance']
  },
  {
    id: 'reaction-buttons',
    name: 'Reaction Buttons',
    category: 'social',
    description: 'Emoji reaction buttons',
    icon: '😀',
    defaultProps: { reactions: ['👍', '❤️', '😂', '😮', '😢'], selected: null },
    propTypes: {
      reactions: { type: 'array', description: 'Available reaction emojis', default: ['👍', '❤️', '😂', '😮', '😢'] },
      selected: { type: 'string', description: 'Currently selected reaction' },
      counts: { type: 'object', description: 'Reaction counts {emoji: count}' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showCounts: { type: 'boolean', default: true, description: 'Show reaction counts' },
      animated: { type: 'boolean', default: true, description: 'Animate on hover/select' },
      variant: { type: 'select', options: [{ value: 'inline', label: 'Inline' }, { value: 'popup', label: 'Popup' }, { value: 'bar', label: 'Bar' }], default: 'inline' },
      allowMultiple: { type: 'boolean', default: false, description: 'Allow multiple reactions' },
      disabled: { type: 'boolean', default: false, description: 'Disable reactions' }
    },
    usageExample: '<ReactionButtons reactions={["👍", "❤️", "😂"]} counts={{\"👍\": 42, \"❤️\": 15}} />',
    usageTips: ['Limit to 5-7 reactions', 'Animate for engagement', 'Show counts to encourage participation']
  },
  {
    id: 'comment-input',
    name: 'Comment Input',
    category: 'social',
    description: 'Comment input field',
    icon: '💬',
    defaultProps: { placeholder: 'Write a comment...', variant: 'default' },
    propTypes: {
      placeholder: { type: 'string', default: 'Write a comment...', description: 'Placeholder text' },
      value: { type: 'string', description: 'Input value' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      maxLength: { type: 'number', description: 'Maximum character limit' },
      showCharCount: { type: 'boolean', default: false, description: 'Show character count' },
      showAvatar: { type: 'boolean', default: true, description: 'Show user avatar' },
      avatarUrl: { type: 'string', description: 'User avatar URL' },
      autoFocus: { type: 'boolean', default: false, description: 'Auto focus on mount' },
      submitOnEnter: { type: 'boolean', default: false, description: 'Submit on Enter key' },
      allowAttachments: { type: 'boolean', default: false, description: 'Allow file attachments' },
      allowEmoji: { type: 'boolean', default: true, description: 'Show emoji picker' },
      submitLabel: { type: 'string', default: 'Post', description: 'Submit button text' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' }
    },
    usageExample: '<CommentInput placeholder="Share your thoughts..." showAvatar avatarUrl="/avatar.jpg" allowEmoji />',
    usageTips: ['Show character limit for long comments', 'Include emoji picker for expression', 'Show user avatar for context']
  },
  {
    id: 'comment-item',
    name: 'Comment Item',
    category: 'social',
    description: 'Comment display item',
    icon: '🗨',
    defaultProps: { content: '', authorName: '', timestamp: '' },
    propTypes: {
      content: { type: 'string', description: 'Comment text content', required: true },
      authorName: { type: 'string', description: 'Author display name', required: true },
      authorAvatar: { type: 'string', description: 'Author avatar URL' },
      authorBadge: { type: 'string', description: 'Author badge (e.g., "Admin", "Verified")' },
      timestamp: { type: 'string', description: 'Comment timestamp', required: true },
      likes: { type: 'number', default: 0, description: 'Like count' },
      isLiked: { type: 'boolean', default: false, description: 'User has liked' },
      replies: { type: 'number', default: 0, description: 'Reply count' },
      showReplies: { type: 'boolean', default: true, description: 'Show reply button' },
      showLikes: { type: 'boolean', default: true, description: 'Show like button' },
      showMenu: { type: 'boolean', default: true, description: 'Show action menu' },
      isEdited: { type: 'boolean', default: false, description: 'Show edited indicator' },
      highlighted: { type: 'boolean', default: false, description: 'Highlight comment' },
      nested: { type: 'boolean', default: false, description: 'Is a nested reply' }
    },
    usageExample: '<CommentItem content="Great article!" authorName="John Doe" timestamp="2 hours ago" likes={5} />',
    usageTips: ['Use relative timestamps', 'Show author badges for credibility', 'Support nested replies']
  },
  {
    id: 'share-modal',
    name: 'Share Modal',
    category: 'social',
    description: 'Content share modal',
    icon: '📤',
    defaultProps: { url: '', title: '', isOpen: false },
    propTypes: {
      isOpen: { type: 'boolean', default: false, description: 'Modal open state', required: true },
      url: { type: 'string', description: 'URL to share', required: true },
      title: { type: 'string', description: 'Content title' },
      description: { type: 'string', description: 'Content description' },
      image: { type: 'string', description: 'Share image URL' },
      platforms: { type: 'array', description: 'Platforms to show', default: ['facebook', 'twitter', 'linkedin', 'email', 'copy'] },
      showCopyLink: { type: 'boolean', default: true, description: 'Show copy link option' },
      showQRCode: { type: 'boolean', default: false, description: 'Show QR code' },
      showEmbed: { type: 'boolean', default: false, description: 'Show embed code' },
      embedCode: { type: 'string', description: 'Embed HTML code' },
      modalTitle: { type: 'string', default: 'Share', description: 'Modal title text' }
    },
    usageExample: '<ShareModal isOpen={showShare} url={pageUrl} title="Check out this article" showQRCode />',
    usageTips: ['Include copy link option', 'Show QR for mobile sharing', 'Provide embed code for content']
  },
  {
    id: 'social-stats',
    name: 'Social Stats',
    category: 'social',
    description: 'Social engagement stats',
    icon: '📊',
    defaultProps: { likes: 0, comments: 0, shares: 0, layout: 'horizontal' },
    propTypes: {
      likes: { type: 'number', default: 0, description: 'Like count' },
      comments: { type: 'number', default: 0, description: 'Comment count' },
      shares: { type: 'number', default: 0, description: 'Share count' },
      views: { type: 'number', description: 'View count' },
      bookmarks: { type: 'number', description: 'Bookmark count' },
      layout: { type: 'select', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }, { value: 'compact', label: 'Compact' }], default: 'horizontal' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showLabels: { type: 'boolean', default: true, description: 'Show stat labels' },
      showIcons: { type: 'boolean', default: true, description: 'Show stat icons' },
      formatNumbers: { type: 'boolean', default: true, description: 'Format large numbers (1.2K)' },
      animated: { type: 'boolean', default: false, description: 'Animate count changes' }
    },
    usageExample: '<SocialStats likes={1234} comments={56} shares={78} views={10500} formatNumbers />',
    usageTips: ['Format large numbers for readability', 'Show relevant stats only', 'Animate changes for feedback']
  },
  {
    id: 'hashtag',
    name: 'Hashtag',
    category: 'social',
    description: 'Clickable hashtag',
    icon: '#',
    defaultProps: { tag: '', variant: 'link' },
    propTypes: {
      tag: { type: 'string', description: 'Hashtag text (without #)', required: true, placeholder: 'trending' },
      href: { type: 'string', description: 'Link URL' },
      variant: { type: 'select', options: [{ value: 'link', label: 'Link' }, { value: 'badge', label: 'Badge' }, { value: 'pill', label: 'Pill' }], default: 'link' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      color: { type: 'color', description: 'Tag color' },
      showCount: { type: 'boolean', default: false, description: 'Show usage count' },
      count: { type: 'number', description: 'Usage count' },
      trending: { type: 'boolean', default: false, description: 'Show trending indicator' },
      interactive: { type: 'boolean', default: true, description: 'Enable click/hover' }
    },
    usageExample: '<Hashtag tag="webdev" variant="pill" trending showCount count={1234} />',
    usageTips: ['Link to search/filter results', 'Show trending for popular tags', 'Use consistent styling']
  },
  {
    id: 'mention',
    name: 'Mention',
    category: 'social',
    description: 'User mention link',
    icon: '@',
    defaultProps: { username: '', displayName: '' },
    propTypes: {
      username: { type: 'string', description: 'Username (without @)', required: true, placeholder: 'johndoe' },
      displayName: { type: 'string', description: 'Display name override' },
      href: { type: 'string', description: 'Profile link URL' },
      variant: { type: 'select', options: [{ value: 'link', label: 'Link' }, { value: 'badge', label: 'Badge' }, { value: 'chip', label: 'Chip' }], default: 'link' },
      showAvatar: { type: 'boolean', default: false, description: 'Show user avatar' },
      avatarUrl: { type: 'string', description: 'Avatar image URL' },
      showPreview: { type: 'boolean', default: false, description: 'Show hover preview' },
      verified: { type: 'boolean', default: false, description: 'Show verified badge' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      color: { type: 'color', default: '#3b82f6', description: 'Mention color' }
    },
    usageExample: '<Mention username="johndoe" displayName="John Doe" showAvatar verified />',
    usageTips: ['Link to user profile', 'Show avatar for recognition', 'Include verified badge']
  },
  {
    id: 'engagement-bar',
    name: 'Engagement Bar',
    category: 'social',
    description: 'Like/comment/share bar',
    icon: '♡💬📤',
    defaultProps: { likes: 0, comments: 0, shares: 0, variant: 'default' },
    propTypes: {
      likes: { type: 'number', default: 0, description: 'Like count' },
      comments: { type: 'number', default: 0, description: 'Comment count' },
      shares: { type: 'number', default: 0, description: 'Share count' },
      isLiked: { type: 'boolean', default: false, description: 'User has liked' },
      isBookmarked: { type: 'boolean', default: false, description: 'User has bookmarked' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' }, { value: 'expanded', label: 'Expanded' }], default: 'default' },
      showBookmark: { type: 'boolean', default: true, description: 'Show bookmark button' },
      showShare: { type: 'boolean', default: true, description: 'Show share button' },
      showCounts: { type: 'boolean', default: true, description: 'Show engagement counts' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      animated: { type: 'boolean', default: true, description: 'Animate interactions' },
      disabled: { type: 'boolean', default: false, description: 'Disable interactions' }
    },
    usageExample: '<EngagementBar likes={42} comments={5} shares={3} isLiked showBookmark />',
    usageTips: ['Animate like for feedback', 'Show counts for social proof', 'Include bookmark for save']
  },
  {
    id: 'follower-count',
    name: 'Follower Count',
    category: 'social',
    description: 'Follower count display',
    icon: '👥',
    defaultProps: { count: 0, label: 'Followers', size: 'md' },
    propTypes: {
      count: { type: 'number', description: 'Follower count', required: true },
      label: { type: 'string', default: 'Followers', description: 'Count label' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'card', label: 'Card' }, { value: 'inline', label: 'Inline' }], default: 'default' },
      formatNumber: { type: 'boolean', default: true, description: 'Format large numbers' },
      showGrowth: { type: 'boolean', default: false, description: 'Show growth indicator' },
      growthValue: { type: 'number', description: 'Growth percentage' },
      showAvatars: { type: 'boolean', default: false, description: 'Show follower avatars' },
      avatars: { type: 'array', description: 'Follower avatar URLs' },
      maxAvatars: { type: 'number', default: 5, description: 'Max avatars to show' }
    },
    usageExample: '<FollowerCount count={12500} showGrowth growthValue={5.2} showAvatars />',
    usageTips: ['Format large numbers (12.5K)', 'Show growth for trends', 'Display sample avatars']
  }
];

// Form Components
export const formComponents: ComponentMeta[] = [
  {
    id: 'text-input',
    name: 'Text Input',
    category: 'forms',
    description: 'Text input field',
    icon: '▭',
    defaultProps: { placeholder: '', type: 'text', size: 'md' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      type: { type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'email', label: 'Email' }, { value: 'password', label: 'Password' }, { value: 'tel', label: 'Phone' }, { value: 'url', label: 'URL' }, { value: 'number', label: 'Number' }], default: 'text' },
      placeholder: { type: 'string', description: 'Placeholder text', placeholder: 'Enter text...' },
      value: { type: 'string', description: 'Input value' },
      label: { type: 'string', description: 'Field label' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }, { value: 'underlined', label: 'Underlined' }], default: 'default' },
      required: { type: 'boolean', default: false, description: 'Mark as required' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' },
      readOnly: { type: 'boolean', default: false, description: 'Read-only mode' },
      error: { type: 'string', description: 'Error message' },
      helperText: { type: 'string', description: 'Helper text below input' },
      maxLength: { type: 'number', description: 'Maximum characters' },
      icon: { type: 'icon', description: 'Leading icon' },
      iconPosition: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'left' },
      clearable: { type: 'boolean', default: false, description: 'Show clear button' },
      autoComplete: { type: 'string', description: 'Autocomplete attribute' }
    },
    usageExample: '<TextInput name="email" type="email" label="Email" placeholder="you@example.com" required />',
    usageTips: ['Use appropriate type for validation', 'Show error states clearly', 'Add helper text for complex fields']
  },
  {
    id: 'search-input',
    name: 'Search Input',
    category: 'forms',
    description: 'Search input with icon',
    icon: '🔍',
    defaultProps: { placeholder: 'Search...', size: 'md' },
    propTypes: {
      placeholder: { type: 'string', default: 'Search...', description: 'Placeholder text' },
      value: { type: 'string', description: 'Search value' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'pill', label: 'Pill' }], default: 'default' },
      showClearButton: { type: 'boolean', default: true, description: 'Show clear button' },
      showSubmitButton: { type: 'boolean', default: false, description: 'Show submit button' },
      submitButtonText: { type: 'string', default: 'Search', description: 'Submit button text' },
      instantSearch: { type: 'boolean', default: true, description: 'Search on type' },
      debounceMs: { type: 'number', default: 300, description: 'Debounce delay (ms)' },
      showHistory: { type: 'boolean', default: false, description: 'Show search history' },
      showSuggestions: { type: 'boolean', default: false, description: 'Show suggestions dropdown' },
      suggestions: { type: 'array', description: 'Suggestion items' },
      autoFocus: { type: 'boolean', default: false, description: 'Auto focus on mount' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' }
    },
    usageExample: '<SearchInput placeholder="Search products..." instantSearch debounceMs={300} showSuggestions />',
    usageTips: ['Debounce for performance', 'Show suggestions for UX', 'Include clear button']
  },
  {
    id: 'textarea',
    name: 'Textarea',
    category: 'forms',
    description: 'Multi-line text input',
    icon: '▤',
    defaultProps: { placeholder: '', rows: 4 },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      placeholder: { type: 'string', description: 'Placeholder text' },
      value: { type: 'string', description: 'Textarea value' },
      label: { type: 'string', description: 'Field label' },
      rows: { type: 'number', default: 4, min: 2, max: 20, description: 'Number of rows' },
      minRows: { type: 'number', description: 'Minimum rows (auto-resize)' },
      maxRows: { type: 'number', description: 'Maximum rows (auto-resize)' },
      autoResize: { type: 'boolean', default: false, description: 'Auto-resize height' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      required: { type: 'boolean', default: false, description: 'Mark as required' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' },
      readOnly: { type: 'boolean', default: false, description: 'Read-only mode' },
      error: { type: 'string', description: 'Error message' },
      helperText: { type: 'string', description: 'Helper text' },
      maxLength: { type: 'number', description: 'Maximum characters' },
      showCharCount: { type: 'boolean', default: false, description: 'Show character count' },
      resize: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }, { value: 'both', label: 'Both' }], default: 'vertical' }
    },
    usageExample: '<Textarea name="bio" label="Bio" rows={4} maxLength={500} showCharCount autoResize />',
    usageTips: ['Use auto-resize for better UX', 'Show character count for limits', 'Set reasonable max length']
  },
  {
    id: 'select',
    name: 'Select',
    category: 'forms',
    description: 'Dropdown select input',
    icon: '▼',
    defaultProps: { options: [], placeholder: 'Select an option...' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      options: { type: 'array', description: 'Array of {value, label} objects', required: true },
      value: { type: 'string', description: 'Selected value' },
      placeholder: { type: 'string', default: 'Select an option...', description: 'Placeholder text' },
      label: { type: 'string', description: 'Field label' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      multiple: { type: 'boolean', default: false, description: 'Allow multiple selection' },
      searchable: { type: 'boolean', default: false, description: 'Enable search/filter' },
      clearable: { type: 'boolean', default: false, description: 'Allow clearing selection' },
      required: { type: 'boolean', default: false, description: 'Mark as required' },
      disabled: { type: 'boolean', default: false, description: 'Disable select' },
      error: { type: 'string', description: 'Error message' },
      helperText: { type: 'string', description: 'Helper text' },
      groupBy: { type: 'string', description: 'Group options by field' },
      maxSelections: { type: 'number', description: 'Max selections (multiple)' }
    },
    usageExample: '<Select name="country" label="Country" options={countries} searchable clearable />',
    usageTips: ['Enable search for long lists', 'Group related options', 'Use clear labels']
  },
  {
    id: 'file-upload',
    name: 'File Upload',
    category: 'forms',
    description: 'File upload dropzone',
    icon: '📁',
    defaultProps: { accept: '*/*', multiple: false },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      accept: { type: 'string', default: '*/*', description: 'Accepted file types', placeholder: 'image/*,.pdf' },
      multiple: { type: 'boolean', default: false, description: 'Allow multiple files' },
      maxFiles: { type: 'number', default: 10, description: 'Maximum files' },
      maxSize: { type: 'number', description: 'Max file size in bytes' },
      variant: { type: 'select', options: [{ value: 'dropzone', label: 'Dropzone' }, { value: 'button', label: 'Button' }, { value: 'inline', label: 'Inline' }], default: 'dropzone' },
      showPreview: { type: 'boolean', default: true, description: 'Show file previews' },
      showProgress: { type: 'boolean', default: true, description: 'Show upload progress' },
      dragActiveText: { type: 'string', default: 'Drop files here', description: 'Drag active text' },
      idleText: { type: 'string', default: 'Drag files or click to upload', description: 'Idle state text' },
      helperText: { type: 'string', description: 'Helper text' },
      disabled: { type: 'boolean', default: false, description: 'Disable upload' },
      required: { type: 'boolean', default: false, description: 'Mark as required' },
      error: { type: 'string', description: 'Error message' },
      autoUpload: { type: 'boolean', default: false, description: 'Upload immediately on select' }
    },
    usageExample: '<FileUpload name="documents" accept=".pdf,.doc" multiple maxFiles={5} showPreview />',
    usageTips: ['Specify accepted types', 'Set reasonable size limits', 'Show upload progress']
  },
  {
    id: 'date-input',
    name: 'Date Input',
    category: 'forms',
    description: 'Date picker input',
    icon: '📅',
    defaultProps: { format: 'MM/DD/YYYY' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      value: { type: 'string', description: 'Selected date value' },
      label: { type: 'string', description: 'Field label' },
      placeholder: { type: 'string', default: 'Select date', description: 'Placeholder text' },
      format: { type: 'select', options: [{ value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' }, { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' }, { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }], default: 'MM/DD/YYYY' },
      minDate: { type: 'string', description: 'Minimum selectable date' },
      maxDate: { type: 'string', description: 'Maximum selectable date' },
      disabledDates: { type: 'array', description: 'Array of disabled dates' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      showWeekNumbers: { type: 'boolean', default: false, description: 'Show week numbers' },
      startWeekOn: { type: 'select', options: [{ value: 'sunday', label: 'Sunday' }, { value: 'monday', label: 'Monday' }], default: 'sunday' },
      required: { type: 'boolean', default: false, description: 'Mark as required' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' },
      clearable: { type: 'boolean', default: true, description: 'Allow clearing' },
      error: { type: 'string', description: 'Error message' }
    },
    usageExample: '<DateInput name="birthdate" label="Birth Date" format="MM/DD/YYYY" maxDate="2024-01-01" />',
    usageTips: ['Set appropriate min/max dates', 'Use locale-aware format', 'Disable invalid dates']
  },
  {
    id: 'time-input',
    name: 'Time Input',
    category: 'forms',
    description: 'Time picker input',
    icon: '🕐',
    defaultProps: { format: '12h' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      value: { type: 'string', description: 'Selected time value' },
      label: { type: 'string', description: 'Field label' },
      placeholder: { type: 'string', default: 'Select time', description: 'Placeholder text' },
      format: { type: 'select', options: [{ value: '12h', label: '12-hour' }, { value: '24h', label: '24-hour' }], default: '12h' },
      minuteStep: { type: 'select', options: [{ value: '1', label: '1 minute' }, { value: '5', label: '5 minutes' }, { value: '15', label: '15 minutes' }, { value: '30', label: '30 minutes' }], default: '15' },
      minTime: { type: 'string', description: 'Minimum time', placeholder: '09:00' },
      maxTime: { type: 'string', description: 'Maximum time', placeholder: '17:00' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      showSeconds: { type: 'boolean', default: false, description: 'Show seconds picker' },
      required: { type: 'boolean', default: false, description: 'Mark as required' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' },
      clearable: { type: 'boolean', default: true, description: 'Allow clearing' },
      error: { type: 'string', description: 'Error message' }
    },
    usageExample: '<TimeInput name="meeting" label="Meeting Time" format="12h" minuteStep="15" />',
    usageTips: ['Use appropriate minute steps', 'Set business hour limits', 'Consider timezone']
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'forms',
    description: 'Range slider input',
    icon: '━●━',
    defaultProps: { min: 0, max: 100, value: 50 },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      value: { type: 'number', default: 50, description: 'Current value' },
      min: { type: 'number', default: 0, description: 'Minimum value' },
      max: { type: 'number', default: 100, description: 'Maximum value' },
      step: { type: 'number', default: 1, description: 'Step increment' },
      label: { type: 'string', description: 'Field label' },
      showValue: { type: 'boolean', default: true, description: 'Show current value' },
      showMinMax: { type: 'boolean', default: false, description: 'Show min/max labels' },
      showTicks: { type: 'boolean', default: false, description: 'Show tick marks' },
      tickInterval: { type: 'number', description: 'Tick mark interval' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }], default: 'default' },
      color: { type: 'color', default: '#3b82f6', description: 'Slider color' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      range: { type: 'boolean', default: false, description: 'Range slider mode' },
      disabled: { type: 'boolean', default: false, description: 'Disable slider' },
      valueFormat: { type: 'string', description: 'Value format (e.g., "${value}%")' }
    },
    usageExample: '<Slider name="volume" min={0} max={100} step={5} showValue showTicks />',
    usageTips: ['Show current value', 'Use appropriate step size', 'Consider tick marks for key values']
  },
  {
    id: 'color-picker',
    name: 'Color Picker',
    category: 'forms',
    description: 'Color selection input',
    icon: '🎨',
    defaultProps: { value: '#3b82f6', format: 'hex' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      value: { type: 'color', default: '#3b82f6', description: 'Selected color' },
      label: { type: 'string', description: 'Field label' },
      format: { type: 'select', options: [{ value: 'hex', label: 'HEX' }, { value: 'rgb', label: 'RGB' }, { value: 'hsl', label: 'HSL' }], default: 'hex' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'inline', label: 'Inline' }, { value: 'popover', label: 'Popover' }], default: 'popover' },
      showInput: { type: 'boolean', default: true, description: 'Show color input field' },
      showPreview: { type: 'boolean', default: true, description: 'Show color preview' },
      showSwatches: { type: 'boolean', default: true, description: 'Show preset swatches' },
      swatches: { type: 'array', description: 'Custom swatch colors' },
      showAlpha: { type: 'boolean', default: false, description: 'Show alpha/opacity' },
      showEyedropper: { type: 'boolean', default: false, description: 'Show eyedropper tool' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      disabled: { type: 'boolean', default: false, description: 'Disable picker' },
      required: { type: 'boolean', default: false, description: 'Mark as required' }
    },
    usageExample: '<ColorPicker name="brandColor" label="Brand Color" showSwatches showAlpha />',
    usageTips: ['Provide brand swatches', 'Use appropriate format', 'Consider alpha for overlays']
  },
  {
    id: 'newsletter-signup',
    name: 'Newsletter Signup',
    category: 'forms',
    description: 'Email signup form',
    icon: '✉',
    defaultProps: { buttonText: 'Subscribe', variant: 'inline' },
    propTypes: {
      buttonText: { type: 'string', default: 'Subscribe', description: 'Submit button text' },
      placeholder: { type: 'string', default: 'Enter your email', description: 'Email placeholder' },
      variant: { type: 'select', options: [{ value: 'inline', label: 'Inline' }, { value: 'stacked', label: 'Stacked' }, { value: 'card', label: 'Card' }], default: 'inline' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      title: { type: 'string', description: 'Form title' },
      description: { type: 'string', description: 'Form description' },
      showName: { type: 'boolean', default: false, description: 'Show name field' },
      showPrivacyLink: { type: 'boolean', default: false, description: 'Show privacy policy link' },
      privacyUrl: { type: 'string', description: 'Privacy policy URL' },
      successMessage: { type: 'string', default: 'Thanks for subscribing!', description: 'Success message' },
      buttonColor: { type: 'color', description: 'Button background color' },
      buttonVariant: { type: 'select', options: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }], default: 'primary' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' }
    },
    usageExample: '<NewsletterSignup title="Stay Updated" buttonText="Join Now" variant="card" showPrivacyLink />',
    usageTips: ['Show clear value proposition', 'Link to privacy policy', 'Confirm successful signup']
  },
  {
    id: 'otp-input',
    name: 'OTP Input',
    category: 'forms',
    description: 'One-time password input',
    icon: '🔢',
    defaultProps: { length: 6, type: 'number' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      length: { type: 'number', default: 6, min: 4, max: 8, description: 'Code length' },
      value: { type: 'string', description: 'Current OTP value' },
      type: { type: 'select', options: [{ value: 'number', label: 'Numbers Only' }, { value: 'alphanumeric', label: 'Alphanumeric' }], default: 'number' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'outlined', label: 'Outlined' }, { value: 'underlined', label: 'Underlined' }], default: 'default' },
      autoFocus: { type: 'boolean', default: true, description: 'Auto focus first input' },
      autoSubmit: { type: 'boolean', default: false, description: 'Submit when complete' },
      masked: { type: 'boolean', default: false, description: 'Mask input values' },
      separator: { type: 'boolean', default: false, description: 'Show separator' },
      separatorPosition: { type: 'number', description: 'Separator position (e.g., 3 for XXX-XXX)' },
      error: { type: 'string', description: 'Error message' },
      disabled: { type: 'boolean', default: false, description: 'Disable inputs' },
      resendButton: { type: 'boolean', default: false, description: 'Show resend button' },
      resendTimeout: { type: 'number', default: 60, description: 'Resend timeout (seconds)' }
    },
    usageExample: '<OTPInput name="code" length={6} autoFocus autoSubmit resendButton />',
    usageTips: ['Auto-focus first field', 'Auto-submit when complete', 'Show resend option']
  },
  {
    id: 'input-with-actions',
    name: 'Input with Actions',
    category: 'forms',
    description: 'Input with action buttons',
    icon: '▭▢',
    defaultProps: { placeholder: '', buttonText: 'Submit' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      placeholder: { type: 'string', description: 'Placeholder text' },
      value: { type: 'string', description: 'Input value' },
      buttonText: { type: 'string', default: 'Submit', description: 'Action button text' },
      buttonIcon: { type: 'icon', description: 'Button icon' },
      buttonPosition: { type: 'select', options: [{ value: 'right', label: 'Right' }, { value: 'left', label: 'Left' }], default: 'right' },
      buttonVariant: { type: 'select', options: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'ghost', label: 'Ghost' }], default: 'primary' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'attached', label: 'Attached' }, { value: 'separated', label: 'Separated' }], default: 'attached' },
      showSecondaryAction: { type: 'boolean', default: false, description: 'Show secondary action' },
      secondaryButtonText: { type: 'string', description: 'Secondary button text' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' },
      error: { type: 'string', description: 'Error message' }
    },
    usageExample: '<InputWithActions name="invite" placeholder="Enter email" buttonText="Invite" buttonVariant="primary" />',
    usageTips: ['Use clear action text', 'Show loading during submission', 'Consider attached variant']
  },
  {
    id: 'form-field',
    name: 'Form Field',
    category: 'forms',
    description: 'Labeled form field wrapper',
    icon: '▭',
    defaultProps: { label: 'Field' },
    propTypes: {
      label: { type: 'string', description: 'Field label', required: true },
      htmlFor: { type: 'string', description: 'Input ID for label' },
      required: { type: 'boolean', default: false, description: 'Show required indicator' },
      optional: { type: 'boolean', default: false, description: 'Show optional indicator' },
      description: { type: 'string', description: 'Field description' },
      helperText: { type: 'string', description: 'Helper text below field' },
      error: { type: 'string', description: 'Error message' },
      errorPosition: { type: 'select', options: [{ value: 'bottom', label: 'Bottom' }, { value: 'tooltip', label: 'Tooltip' }], default: 'bottom' },
      layout: { type: 'select', options: [{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }], default: 'vertical' },
      labelWidth: { type: 'string', description: 'Label width (horizontal layout)' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      tooltip: { type: 'string', description: 'Info tooltip content' },
      disabled: { type: 'boolean', default: false, description: 'Mark field as disabled' }
    },
    usageExample: '<FormField label="Username" required helperText="Choose a unique username"><TextInput /></FormField>',
    usageTips: ['Use consistent label positioning', 'Show required/optional indicators', 'Provide helpful descriptions']
  },
  {
    id: 'prefix-suffix-input',
    name: 'Prefix/Suffix Input',
    category: 'forms',
    description: 'Input with prefix/suffix',
    icon: '$▭.00',
    defaultProps: { placeholder: '0.00' },
    propTypes: {
      name: { type: 'string', description: 'Input name attribute', required: true },
      placeholder: { type: 'string', description: 'Placeholder text' },
      value: { type: 'string', description: 'Input value' },
      label: { type: 'string', description: 'Field label' },
      prefix: { type: 'string', description: 'Prefix text', placeholder: '$' },
      suffix: { type: 'string', description: 'Suffix text', placeholder: 'USD' },
      prefixIcon: { type: 'icon', description: 'Prefix icon' },
      suffixIcon: { type: 'icon', description: 'Suffix icon' },
      type: { type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'number', label: 'Number' }], default: 'text' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'filled', label: 'Filled' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      prefixBg: { type: 'boolean', default: true, description: 'Prefix background' },
      suffixBg: { type: 'boolean', default: true, description: 'Suffix background' },
      required: { type: 'boolean', default: false, description: 'Mark as required' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' },
      error: { type: 'string', description: 'Error message' }
    },
    usageExample: '<PrefixSuffixInput name="price" prefix="$" suffix="USD" type="number" placeholder="0.00" />',
    usageTips: ['Use for currency/units', 'Keep prefix/suffix short', 'Consider icon alternatives']
  },
  {
    id: 'inline-edit',
    name: 'Inline Edit',
    category: 'forms',
    description: 'Click to edit field',
    icon: '✏',
    defaultProps: { value: '', placeholder: 'Click to edit' },
    propTypes: {
      value: { type: 'string', description: 'Display/edit value', required: true },
      placeholder: { type: 'string', default: 'Click to edit', description: 'Empty state text' },
      type: { type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'textarea', label: 'Textarea' }, { value: 'number', label: 'Number' }], default: 'text' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'underlined', label: 'Underlined' }, { value: 'bordered', label: 'Bordered' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showEditIcon: { type: 'boolean', default: true, description: 'Show edit icon on hover' },
      showConfirmButtons: { type: 'boolean', default: true, description: 'Show save/cancel buttons' },
      saveOnBlur: { type: 'boolean', default: true, description: 'Save when focus lost' },
      saveOnEnter: { type: 'boolean', default: true, description: 'Save on Enter key' },
      cancelOnEscape: { type: 'boolean', default: true, description: 'Cancel on Escape key' },
      maxLength: { type: 'number', description: 'Maximum characters' },
      required: { type: 'boolean', default: false, description: 'Require value' },
      disabled: { type: 'boolean', default: false, description: 'Disable editing' },
      loading: { type: 'boolean', default: false, description: 'Show saving state' }
    },
    usageExample: '<InlineEdit value={title} placeholder="Enter title" showEditIcon saveOnBlur />',
    usageTips: ['Show edit icon on hover', 'Save on blur for quick edits', 'Handle loading states']
  }
];

// User Components
export const userComponents: ComponentMeta[] = [
  {
    id: 'user-card',
    name: 'User Card',
    category: 'user',
    description: 'User profile card',
    icon: '👤',
    defaultProps: { name: '', variant: 'default', size: 'md' },
    propTypes: {
      name: { type: 'string', description: 'User display name', required: true },
      avatar: { type: 'string', description: 'Avatar image URL' },
      email: { type: 'string', description: 'User email address' },
      role: { type: 'string', description: 'User role/title' },
      bio: { type: 'string', description: 'Short bio/description' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'detailed', label: 'Detailed' }, { value: 'horizontal', label: 'Horizontal' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showEmail: { type: 'boolean', default: false, description: 'Display email' },
      showRole: { type: 'boolean', default: true, description: 'Display role' },
      showBio: { type: 'boolean', default: false, description: 'Display bio' },
      showSocialLinks: { type: 'boolean', default: false, description: 'Show social links' },
      socialLinks: { type: 'array', description: 'Social media links' },
      showFollowButton: { type: 'boolean', default: false, description: 'Show follow button' },
      showMessageButton: { type: 'boolean', default: false, description: 'Show message button' },
      verified: { type: 'boolean', default: false, description: 'Show verified badge' },
      online: { type: 'boolean', default: false, description: 'Show online status' },
      clickable: { type: 'boolean', default: true, description: 'Enable card click' },
      profileUrl: { type: 'string', description: 'Profile page URL' }
    },
    usageExample: '<UserCard name="John Doe" avatar="/avatar.jpg" role="Designer" verified showFollowButton />',
    usageTips: ['Use verified badge for credibility', 'Show online status for real-time', 'Include relevant actions']
  },
  {
    id: 'author-box',
    name: 'Author Box',
    category: 'user',
    description: 'Author info box',
    icon: '✍',
    defaultProps: { name: '', variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'Author name', required: true },
      avatar: { type: 'string', description: 'Author avatar URL' },
      bio: { type: 'string', description: 'Author biography' },
      role: { type: 'string', description: 'Author title/role' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' }, { value: 'featured', label: 'Featured' }, { value: 'inline', label: 'Inline' }], default: 'default' },
      showBio: { type: 'boolean', default: true, description: 'Show biography' },
      bioMaxLines: { type: 'number', default: 3, description: 'Max bio lines' },
      showSocialLinks: { type: 'boolean', default: true, description: 'Show social links' },
      socialLinks: { type: 'array', description: 'Social media links' },
      showPostCount: { type: 'boolean', default: false, description: 'Show post count' },
      postCount: { type: 'number', description: 'Number of posts' },
      showFollowButton: { type: 'boolean', default: false, description: 'Show follow button' },
      showWebsite: { type: 'boolean', default: false, description: 'Show website link' },
      websiteUrl: { type: 'string', description: 'Website URL' },
      profileUrl: { type: 'string', description: 'Author profile URL' },
      backgroundColor: { type: 'color', description: 'Box background color' }
    },
    usageExample: '<AuthorBox name="Jane Smith" avatar="/jane.jpg" bio="Tech writer..." showSocialLinks showFollowButton />',
    usageTips: ['Include relevant social links', 'Keep bio concise', 'Link to author page']
  },
  {
    id: 'profile-header',
    name: 'Profile Header',
    category: 'user',
    description: 'Profile page header',
    icon: '👤',
    defaultProps: { variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'User display name', required: true },
      username: { type: 'string', description: 'Username/handle' },
      avatar: { type: 'string', description: 'Avatar image URL' },
      coverImage: { type: 'string', description: 'Cover/banner image URL' },
      bio: { type: 'string', description: 'User biography' },
      location: { type: 'string', description: 'User location' },
      website: { type: 'string', description: 'Website URL' },
      joinDate: { type: 'string', description: 'Join date' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'full', label: 'Full Width' }], default: 'default' },
      showCover: { type: 'boolean', default: true, description: 'Show cover image' },
      coverHeight: { type: 'number', default: 200, description: 'Cover height (px)' },
      showStats: { type: 'boolean', default: true, description: 'Show follower stats' },
      followers: { type: 'number', description: 'Follower count' },
      following: { type: 'number', description: 'Following count' },
      posts: { type: 'number', description: 'Post count' },
      showEditButton: { type: 'boolean', default: false, description: 'Show edit profile button' },
      showFollowButton: { type: 'boolean', default: true, description: 'Show follow button' },
      showMessageButton: { type: 'boolean', default: false, description: 'Show message button' },
      verified: { type: 'boolean', default: false, description: 'Show verified badge' },
      isOwnProfile: { type: 'boolean', default: false, description: 'Viewing own profile' }
    },
    usageExample: '<ProfileHeader name="John Doe" username="johndoe" coverImage="/cover.jpg" followers={1234} showStats />',
    usageTips: ['Use high-quality cover images', 'Show relevant stats', 'Adapt buttons for own profile']
  },
  {
    id: 'user-list-item',
    name: 'User List Item',
    category: 'user',
    description: 'User in list format',
    icon: '👤',
    defaultProps: { name: '', variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'User display name', required: true },
      avatar: { type: 'string', description: 'Avatar image URL' },
      subtitle: { type: 'string', description: 'Subtitle/description' },
      role: { type: 'string', description: 'User role' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'detailed', label: 'Detailed' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showAction: { type: 'boolean', default: false, description: 'Show action button' },
      actionLabel: { type: 'string', default: 'View', description: 'Action button text' },
      showStatus: { type: 'boolean', default: false, description: 'Show online status' },
      online: { type: 'boolean', default: false, description: 'Online status' },
      showCheckbox: { type: 'boolean', default: false, description: 'Show selection checkbox' },
      selected: { type: 'boolean', default: false, description: 'Selection state' },
      verified: { type: 'boolean', default: false, description: 'Show verified badge' },
      clickable: { type: 'boolean', default: true, description: 'Enable row click' },
      href: { type: 'string', description: 'Link URL on click' }
    },
    usageExample: '<UserListItem name="Jane Doe" avatar="/jane.jpg" subtitle="Designer" showStatus online />',
    usageTips: ['Show status for real-time lists', 'Use checkbox for bulk actions', 'Keep subtitle brief']
  },
  {
    id: 'team-member-card',
    name: 'Team Member Card',
    category: 'user',
    description: 'Team member display',
    icon: '👥',
    defaultProps: { name: '', role: '', variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'Member name', required: true },
      role: { type: 'string', description: 'Job title/role', required: true },
      avatar: { type: 'string', description: 'Photo URL' },
      bio: { type: 'string', description: 'Short biography' },
      email: { type: 'string', description: 'Email address' },
      phone: { type: 'string', description: 'Phone number' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' }, { value: 'detailed', label: 'Detailed' }, { value: 'horizontal', label: 'Horizontal' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showBio: { type: 'boolean', default: false, description: 'Show biography' },
      showEmail: { type: 'boolean', default: false, description: 'Show email' },
      showPhone: { type: 'boolean', default: false, description: 'Show phone' },
      showSocialLinks: { type: 'boolean', default: true, description: 'Show social links' },
      socialLinks: { type: 'array', description: 'Social media links' },
      imageStyle: { type: 'select', options: [{ value: 'circle', label: 'Circle' }, { value: 'square', label: 'Square' }, { value: 'rounded', label: 'Rounded' }], default: 'circle' },
      hoverEffect: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'lift', label: 'Lift' }, { value: 'overlay', label: 'Overlay' }], default: 'lift' }
    },
    usageExample: '<TeamMemberCard name="John Smith" role="CEO" avatar="/john.jpg" showSocialLinks showBio />',
    usageTips: ['Use consistent photo styles', 'Include relevant social links', 'Keep bios brief']
  },
  {
    id: 'user-badge',
    name: 'User Badge',
    category: 'user',
    description: 'User badge/tag',
    icon: '🏅',
    defaultProps: { label: '', variant: 'default' },
    propTypes: {
      label: { type: 'string', description: 'Badge label', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'admin', label: 'Admin' }, { value: 'moderator', label: 'Moderator' }, { value: 'verified', label: 'Verified' }, { value: 'premium', label: 'Premium' }, { value: 'new', label: 'New' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }], default: 'sm' },
      color: { type: 'color', description: 'Custom badge color' },
      icon: { type: 'icon', description: 'Badge icon' },
      showIcon: { type: 'boolean', default: true, description: 'Display icon' },
      tooltip: { type: 'string', description: 'Tooltip on hover' },
      rounded: { type: 'boolean', default: true, description: 'Rounded corners' },
      outlined: { type: 'boolean', default: false, description: 'Outline style' },
      animated: { type: 'boolean', default: false, description: 'Animated effects' }
    },
    usageExample: '<UserBadge label="Premium" variant="premium" showIcon animated />',
    usageTips: ['Use consistent badge styles', 'Add tooltips for clarity', 'Limit badges per user']
  },
  {
    id: 'activity-item',
    name: 'Activity Item',
    category: 'user',
    description: 'User activity log item',
    icon: '📝',
    defaultProps: { action: '', timestamp: '', variant: 'default' },
    propTypes: {
      action: { type: 'string', description: 'Activity description', required: true },
      timestamp: { type: 'string', description: 'Activity time', required: true },
      user: { type: 'string', description: 'User who performed action' },
      userAvatar: { type: 'string', description: 'User avatar URL' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'detailed', label: 'Detailed' }, { value: 'timeline', label: 'Timeline' }], default: 'default' },
      icon: { type: 'icon', description: 'Activity type icon' },
      iconColor: { type: 'color', description: 'Icon color' },
      type: { type: 'select', options: [{ value: 'create', label: 'Create' }, { value: 'update', label: 'Update' }, { value: 'delete', label: 'Delete' }, { value: 'comment', label: 'Comment' }, { value: 'other', label: 'Other' }], default: 'other' },
      target: { type: 'string', description: 'Target of action' },
      targetUrl: { type: 'string', description: 'Link to target' },
      showUser: { type: 'boolean', default: true, description: 'Show user info' },
      showTimestamp: { type: 'boolean', default: true, description: 'Show timestamp' },
      relativeTime: { type: 'boolean', default: true, description: 'Use relative time' }
    },
    usageExample: '<ActivityItem action="Published new article" timestamp="2 hours ago" user="John" type="create" />',
    usageTips: ['Use relative timestamps', 'Color-code by action type', 'Link to relevant content']
  },
  {
    id: 'contact-card',
    name: 'Contact Card',
    category: 'user',
    description: 'Contact information card',
    icon: '📇',
    defaultProps: { name: '', variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'Contact name', required: true },
      avatar: { type: 'string', description: 'Contact photo URL' },
      email: { type: 'string', description: 'Email address' },
      phone: { type: 'string', description: 'Phone number' },
      company: { type: 'string', description: 'Company name' },
      title: { type: 'string', description: 'Job title' },
      address: { type: 'string', description: 'Address' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'detailed', label: 'Detailed' }, { value: 'horizontal', label: 'Horizontal' }], default: 'default' },
      showEmail: { type: 'boolean', default: true, description: 'Show email' },
      showPhone: { type: 'boolean', default: true, description: 'Show phone' },
      showCompany: { type: 'boolean', default: true, description: 'Show company' },
      showAddress: { type: 'boolean', default: false, description: 'Show address' },
      showActions: { type: 'boolean', default: true, description: 'Show action buttons' },
      actions: { type: 'array', description: 'Action buttons (email, call, etc)' },
      socialLinks: { type: 'array', description: 'Social media links' },
      showSocialLinks: { type: 'boolean', default: false, description: 'Show social links' }
    },
    usageExample: '<ContactCard name="Jane Doe" email="jane@example.com" phone="+1234567890" showActions />',
    usageTips: ['Include quick action buttons', 'Show relevant contact methods', 'Use consistent layout']
  },
  {
    id: 'user-menu',
    name: 'User Menu',
    category: 'user',
    description: 'User dropdown menu',
    icon: '👤▼',
    defaultProps: { variant: 'default' },
    propTypes: {
      userName: { type: 'string', description: 'User display name' },
      userEmail: { type: 'string', description: 'User email' },
      userAvatar: { type: 'string', description: 'User avatar URL' },
      userRole: { type: 'string', description: 'User role/plan' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' }, { value: 'detailed', label: 'Detailed' }], default: 'default' },
      menuItems: { type: 'array', description: 'Menu items array' },
      showProfile: { type: 'boolean', default: true, description: 'Show profile link' },
      showSettings: { type: 'boolean', default: true, description: 'Show settings link' },
      showLogout: { type: 'boolean', default: true, description: 'Show logout option' },
      showDividers: { type: 'boolean', default: true, description: 'Show menu dividers' },
      showThemeToggle: { type: 'boolean', default: false, description: 'Show theme toggle' },
      showNotificationBadge: { type: 'boolean', default: false, description: 'Show notification badge' },
      notificationCount: { type: 'number', description: 'Notification count' },
      position: { type: 'select', options: [{ value: 'bottom-right', label: 'Bottom Right' }, { value: 'bottom-left', label: 'Bottom Left' }], default: 'bottom-right' },
      triggerVariant: { type: 'select', options: [{ value: 'avatar', label: 'Avatar Only' }, { value: 'name', label: 'With Name' }, { value: 'full', label: 'Full Details' }], default: 'avatar' }
    },
    usageExample: '<UserMenu userName="John" userAvatar="/avatar.jpg" showThemeToggle showNotificationBadge />',
    usageTips: ['Include essential links', 'Show notification badge', 'Add theme toggle']
  },
  {
    id: 'online-users-list',
    name: 'Online Users List',
    category: 'user',
    description: 'List of online users',
    icon: '🟢',
    defaultProps: { users: [], variant: 'default' },
    propTypes: {
      users: { type: 'array', description: 'Array of online users', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'avatars-only', label: 'Avatars Only' }], default: 'default' },
      maxVisible: { type: 'number', default: 10, description: 'Max users to display' },
      showCount: { type: 'boolean', default: true, description: 'Show total count' },
      showStatus: { type: 'boolean', default: true, description: 'Show status indicator' },
      showActivity: { type: 'boolean', default: false, description: 'Show current activity' },
      groupByActivity: { type: 'boolean', default: false, description: 'Group by activity' },
      sortBy: { type: 'select', options: [{ value: 'name', label: 'Name' }, { value: 'activity', label: 'Activity' }, { value: 'recent', label: 'Recently Active' }], default: 'recent' },
      emptyMessage: { type: 'string', default: 'No users online', description: 'Empty state message' },
      showSearch: { type: 'boolean', default: false, description: 'Show search filter' },
      clickable: { type: 'boolean', default: true, description: 'Enable user click' },
      showOverflow: { type: 'boolean', default: true, description: 'Show +N more indicator' }
    },
    usageExample: '<OnlineUsersList users={onlineUsers} maxVisible={5} showActivity groupByActivity />',
    usageTips: ['Limit visible users', 'Show overflow count', 'Update in real-time']
  }
];

// Commerce Components
export const commerceComponents: ComponentMeta[] = [
  {
    id: 'product-card',
    name: 'Product Card',
    category: 'commerce',
    description: 'Product display card',
    icon: '🛍',
    defaultProps: { name: '', price: '', variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'Product name', required: true },
      price: { type: 'string', description: 'Product price', required: true },
      originalPrice: { type: 'string', description: 'Original price (for sale)' },
      image: { type: 'string', description: 'Product image URL' },
      images: { type: 'array', description: 'Multiple product images' },
      description: { type: 'string', description: 'Short description' },
      category: { type: 'string', description: 'Product category' },
      rating: { type: 'number', min: 0, max: 5, description: 'Average rating' },
      reviewCount: { type: 'number', description: 'Number of reviews' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'detailed', label: 'Detailed' }, { value: 'horizontal', label: 'Horizontal' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showRating: { type: 'boolean', default: true, description: 'Show star rating' },
      showQuickView: { type: 'boolean', default: false, description: 'Show quick view button' },
      showAddToCart: { type: 'boolean', default: true, description: 'Show add to cart button' },
      showWishlist: { type: 'boolean', default: false, description: 'Show wishlist button' },
      showBadge: { type: 'boolean', default: true, description: 'Show sale/new badge' },
      badge: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sale', label: 'Sale' }, { value: 'new', label: 'New' }, { value: 'hot', label: 'Hot' }, { value: 'soldout', label: 'Sold Out' }], default: 'none' },
      inStock: { type: 'boolean', default: true, description: 'Product in stock' },
      href: { type: 'string', description: 'Product page URL' }
    },
    usageExample: '<ProductCard name="iPhone 15" price="$999" image="/iphone.jpg" rating={4.5} showAddToCart badge="new" />',
    usageTips: ['Use high-quality images', 'Show ratings for trust', 'Highlight discounts clearly']
  },
  {
    id: 'cart-item',
    name: 'Cart Item',
    category: 'commerce',
    description: 'Shopping cart item',
    icon: '🛒',
    defaultProps: { name: '', price: '', quantity: 1, variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'Product name', required: true },
      price: { type: 'string', description: 'Unit price', required: true },
      quantity: { type: 'number', default: 1, min: 1, description: 'Item quantity' },
      image: { type: 'string', description: 'Product image URL' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'detailed', label: 'Detailed' }], default: 'default' },
      options: { type: 'array', description: 'Selected options (size, color, etc)' },
      maxQuantity: { type: 'number', default: 99, description: 'Maximum quantity' },
      showQuantityControls: { type: 'boolean', default: true, description: 'Show +/- buttons' },
      showRemove: { type: 'boolean', default: true, description: 'Show remove button' },
      showSaveForLater: { type: 'boolean', default: false, description: 'Show save for later' },
      showSubtotal: { type: 'boolean', default: true, description: 'Show line subtotal' },
      editable: { type: 'boolean', default: true, description: 'Allow editing' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' },
      error: { type: 'string', description: 'Error message' }
    },
    usageExample: '<CartItem name="T-Shirt" price="$29.99" quantity={2} image="/shirt.jpg" showQuantityControls />',
    usageTips: ['Show subtotal per line', 'Allow quantity adjustment', 'Include remove option']
  },
  {
    id: 'cart-summary',
    name: 'Cart Summary',
    category: 'commerce',
    description: 'Cart total summary',
    icon: '💳',
    defaultProps: { subtotal: '$0.00', total: '$0.00', variant: 'default' },
    propTypes: {
      subtotal: { type: 'string', description: 'Cart subtotal', required: true },
      shipping: { type: 'string', description: 'Shipping cost' },
      tax: { type: 'string', description: 'Tax amount' },
      discount: { type: 'string', description: 'Discount amount' },
      discountCode: { type: 'string', description: 'Applied discount code' },
      total: { type: 'string', description: 'Order total', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'detailed', label: 'Detailed' }], default: 'default' },
      showCouponInput: { type: 'boolean', default: true, description: 'Show coupon field' },
      showShipping: { type: 'boolean', default: true, description: 'Show shipping cost' },
      showTax: { type: 'boolean', default: true, description: 'Show tax amount' },
      showItemCount: { type: 'boolean', default: true, description: 'Show item count' },
      itemCount: { type: 'number', description: 'Number of items' },
      checkoutButtonText: { type: 'string', default: 'Proceed to Checkout', description: 'Checkout button text' },
      showSecurePayment: { type: 'boolean', default: true, description: 'Show secure payment icons' },
      showEstimatedDelivery: { type: 'boolean', default: false, description: 'Show delivery estimate' },
      estimatedDelivery: { type: 'string', description: 'Delivery date estimate' }
    },
    usageExample: '<CartSummary subtotal="$99.00" shipping="$5.00" tax="$8.00" total="$112.00" showCouponInput />',
    usageTips: ['Break down all costs', 'Show security badges', 'Include coupon input']
  },
  {
    id: 'pricing-tier',
    name: 'Pricing Tier',
    category: 'commerce',
    description: 'Pricing plan tier',
    icon: '💰',
    defaultProps: { name: '', price: '', period: 'month', variant: 'default' },
    propTypes: {
      name: { type: 'string', description: 'Plan name', required: true },
      price: { type: 'string', description: 'Plan price', required: true },
      period: { type: 'select', options: [{ value: 'month', label: 'Monthly' }, { value: 'year', label: 'Yearly' }, { value: 'once', label: 'One-time' }], default: 'month' },
      description: { type: 'string', description: 'Plan description' },
      features: { type: 'array', description: 'Feature list' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'featured', label: 'Featured' }, { value: 'compact', label: 'Compact' }], default: 'default' },
      featured: { type: 'boolean', default: false, description: 'Highlight as featured' },
      featuredLabel: { type: 'string', default: 'Most Popular', description: 'Featured badge text' },
      buttonText: { type: 'string', default: 'Get Started', description: 'CTA button text' },
      buttonVariant: { type: 'select', options: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'outline', label: 'Outline' }], default: 'primary' },
      originalPrice: { type: 'string', description: 'Original price (for discount)' },
      showAnnualSavings: { type: 'boolean', default: false, description: 'Show annual savings' },
      annualSavings: { type: 'string', description: 'Annual savings amount' },
      trialDays: { type: 'number', description: 'Free trial days' },
      showTrial: { type: 'boolean', default: false, description: 'Show trial info' },
      disabled: { type: 'boolean', default: false, description: 'Disable selection' }
    },
    usageExample: '<PricingTier name="Pro" price="$29" period="month" features={features} featured />',
    usageTips: ['Highlight recommended plan', 'Show annual savings', 'List key features clearly']
  },
  {
    id: 'coupon-card',
    name: 'Coupon Card',
    category: 'commerce',
    description: 'Discount coupon card',
    icon: '🎟',
    defaultProps: { code: '', discount: '', variant: 'default' },
    propTypes: {
      code: { type: 'string', description: 'Coupon code', required: true },
      discount: { type: 'string', description: 'Discount amount/percentage', required: true },
      description: { type: 'string', description: 'Coupon description' },
      expiryDate: { type: 'string', description: 'Expiration date' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'ticket', label: 'Ticket Style' }], default: 'default' },
      showCopyButton: { type: 'boolean', default: true, description: 'Show copy code button' },
      showExpiry: { type: 'boolean', default: true, description: 'Show expiration date' },
      showTerms: { type: 'boolean', default: false, description: 'Show terms/conditions' },
      terms: { type: 'string', description: 'Terms and conditions' },
      minimumOrder: { type: 'string', description: 'Minimum order amount' },
      showMinimum: { type: 'boolean', default: false, description: 'Show minimum order' },
      backgroundColor: { type: 'color', description: 'Card background color' },
      brandColor: { type: 'color', description: 'Brand accent color' },
      applied: { type: 'boolean', default: false, description: 'Coupon is applied' },
      disabled: { type: 'boolean', default: false, description: 'Coupon is disabled' }
    },
    usageExample: '<CouponCard code="SAVE20" discount="20% OFF" expiryDate="Dec 31, 2024" showCopyButton />',
    usageTips: ['Make code easy to copy', 'Show expiry prominently', 'Clarify restrictions']
  },
  {
    id: 'order-status',
    name: 'Order Status',
    category: 'commerce',
    description: 'Order tracking status',
    icon: '📦',
    defaultProps: { status: 'processing', orderNumber: '' },
    propTypes: {
      orderNumber: { type: 'string', description: 'Order number', required: true },
      status: { type: 'select', options: [{ value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'shipped', label: 'Shipped' }, { value: 'delivered', label: 'Delivered' }, { value: 'cancelled', label: 'Cancelled' }], default: 'processing', required: true },
      orderDate: { type: 'string', description: 'Order date' },
      estimatedDelivery: { type: 'string', description: 'Estimated delivery date' },
      trackingNumber: { type: 'string', description: 'Tracking number' },
      carrier: { type: 'string', description: 'Shipping carrier' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'timeline', label: 'Timeline' }, { value: 'compact', label: 'Compact' }], default: 'default' },
      showTimeline: { type: 'boolean', default: true, description: 'Show status timeline' },
      showTracking: { type: 'boolean', default: true, description: 'Show tracking info' },
      showDetails: { type: 'boolean', default: true, description: 'Show order details' },
      steps: { type: 'array', description: 'Timeline steps' },
      currentStep: { type: 'number', description: 'Current step index' }
    },
    usageExample: '<OrderStatus orderNumber="ORD-12345" status="shipped" trackingNumber="1Z999..." showTimeline />',
    usageTips: ['Show clear progress', 'Provide tracking link', 'Display estimated delivery']
  },
  {
    id: 'rating-input',
    name: 'Rating Input',
    category: 'commerce',
    description: 'Star rating input',
    icon: '⭐',
    defaultProps: { value: 0, maxRating: 5, size: 'md' },
    propTypes: {
      value: { type: 'number', default: 0, min: 0, max: 5, description: 'Current rating' },
      maxRating: { type: 'number', default: 5, description: 'Maximum rating' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'stars', label: 'Stars' }, { value: 'hearts', label: 'Hearts' }, { value: 'circles', label: 'Circles' }], default: 'stars' },
      allowHalf: { type: 'boolean', default: true, description: 'Allow half ratings' },
      readOnly: { type: 'boolean', default: false, description: 'Read-only display' },
      showValue: { type: 'boolean', default: false, description: 'Show numeric value' },
      showLabel: { type: 'boolean', default: false, description: 'Show rating label' },
      labels: { type: 'array', description: 'Rating labels (e.g., Poor, Good, Excellent)' },
      activeColor: { type: 'color', default: '#fbbf24', description: 'Active star color' },
      inactiveColor: { type: 'color', default: '#d1d5db', description: 'Inactive star color' },
      hoverPreview: { type: 'boolean', default: true, description: 'Show hover preview' },
      disabled: { type: 'boolean', default: false, description: 'Disable input' }
    },
    usageExample: '<RatingInput value={4} maxRating={5} allowHalf showValue showLabel />',
    usageTips: ['Allow half stars for precision', 'Show hover preview', 'Use recognizable icons']
  },
  {
    id: 'product-gallery',
    name: 'Product Gallery',
    category: 'commerce',
    description: 'Product image gallery',
    icon: '🖼',
    defaultProps: { images: [], variant: 'default' },
    propTypes: {
      images: { type: 'array', description: 'Array of image URLs', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'grid', label: 'Grid' }, { value: 'carousel', label: 'Carousel' }], default: 'default' },
      thumbnailPosition: { type: 'select', options: [{ value: 'bottom', label: 'Bottom' }, { value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'bottom' },
      showThumbnails: { type: 'boolean', default: true, description: 'Show thumbnail strip' },
      showArrows: { type: 'boolean', default: true, description: 'Show navigation arrows' },
      showDots: { type: 'boolean', default: false, description: 'Show pagination dots' },
      showZoom: { type: 'boolean', default: true, description: 'Enable zoom on hover' },
      showFullscreen: { type: 'boolean', default: true, description: 'Show fullscreen button' },
      autoPlay: { type: 'boolean', default: false, description: 'Auto-advance slides' },
      autoPlayInterval: { type: 'number', default: 3000, description: 'Auto-play interval (ms)' },
      aspectRatio: { type: 'select', options: [{ value: '1/1', label: 'Square' }, { value: '4/3', label: '4:3' }, { value: '16/9', label: '16:9' }], default: '1/1' },
      maxThumbnails: { type: 'number', default: 5, description: 'Max visible thumbnails' }
    },
    usageExample: '<ProductGallery images={productImages} showZoom showFullscreen thumbnailPosition="left" />',
    usageTips: ['Enable zoom for details', 'Use consistent aspect ratios', 'Limit visible thumbnails']
  },
  {
    id: 'special-offer',
    name: 'Special Offer',
    category: 'commerce',
    description: 'Special offer banner',
    icon: '🏷',
    defaultProps: { title: '', discount: '', variant: 'banner' },
    propTypes: {
      title: { type: 'string', description: 'Offer title', required: true },
      discount: { type: 'string', description: 'Discount amount/text', required: true },
      description: { type: 'string', description: 'Offer description' },
      code: { type: 'string', description: 'Promo code' },
      expiryDate: { type: 'string', description: 'Offer expiration' },
      variant: { type: 'select', options: [{ value: 'banner', label: 'Banner' }, { value: 'card', label: 'Card' }, { value: 'popup', label: 'Popup' }, { value: 'inline', label: 'Inline' }], default: 'banner' },
      showCountdown: { type: 'boolean', default: false, description: 'Show countdown timer' },
      showCode: { type: 'boolean', default: true, description: 'Show promo code' },
      showCTA: { type: 'boolean', default: true, description: 'Show CTA button' },
      ctaText: { type: 'string', default: 'Shop Now', description: 'CTA button text' },
      ctaUrl: { type: 'string', description: 'CTA link URL' },
      backgroundColor: { type: 'color', description: 'Background color' },
      textColor: { type: 'color', description: 'Text color' },
      image: { type: 'string', description: 'Background/promo image' },
      dismissible: { type: 'boolean', default: false, description: 'Can be dismissed' }
    },
    usageExample: '<SpecialOffer title="Flash Sale!" discount="50% OFF" code="FLASH50" showCountdown expiryDate="2024-12-31" />',
    usageTips: ['Create urgency with countdown', 'Make code prominent', 'Use contrasting colors']
  },
  {
    id: 'shipping-options',
    name: 'Shipping Options',
    category: 'commerce',
    description: 'Shipping method selector',
    icon: '🚚',
    defaultProps: { options: [], selected: '' },
    propTypes: {
      options: { type: 'array', description: 'Array of shipping options', required: true },
      selected: { type: 'string', description: 'Selected option ID' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'cards', label: 'Cards' }, { value: 'compact', label: 'Compact' }], default: 'default' },
      showEstimate: { type: 'boolean', default: true, description: 'Show delivery estimate' },
      showDescription: { type: 'boolean', default: true, description: 'Show option descriptions' },
      showIcons: { type: 'boolean', default: true, description: 'Show shipping icons' },
      highlightFastest: { type: 'boolean', default: false, description: 'Highlight fastest option' },
      highlightCheapest: { type: 'boolean', default: false, description: 'Highlight cheapest option' },
      showFreeThreshold: { type: 'boolean', default: false, description: 'Show free shipping threshold' },
      freeThreshold: { type: 'string', description: 'Free shipping minimum' },
      amountToFree: { type: 'string', description: 'Amount needed for free shipping' },
      disabled: { type: 'boolean', default: false, description: 'Disable selection' },
      loading: { type: 'boolean', default: false, description: 'Show loading state' }
    },
    usageExample: '<ShippingOptions options={shippingMethods} selected="standard" showEstimate highlightFastest />',
    usageTips: ['Show clear delivery estimates', 'Highlight best value', 'Show progress to free shipping']
  }
];

// Utility Components
export const utilityComponents: ComponentMeta[] = [
  {
    id: 'divider',
    name: 'Divider',
    category: 'utility',
    description: 'Section divider line',
    icon: '─',
    defaultProps: { variant: 'solid', orientation: 'horizontal' },
    propTypes: {
      variant: { type: 'select', options: [{ value: 'solid', label: 'Solid' }, { value: 'dashed', label: 'Dashed' }, { value: 'dotted', label: 'Dotted' }], default: 'solid' },
      orientation: { type: 'select', options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }], default: 'horizontal' },
      thickness: { type: 'select', options: [{ value: 'thin', label: 'Thin (1px)' }, { value: 'medium', label: 'Medium (2px)' }, { value: 'thick', label: 'Thick (4px)' }], default: 'thin' },
      color: { type: 'color', default: '#e5e7eb', description: 'Divider color' },
      spacing: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      label: { type: 'string', description: 'Center label text' },
      labelPosition: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' }], default: 'center' },
      fullWidth: { type: 'boolean', default: true, description: 'Full width divider' }
    },
    usageExample: '<Divider variant="solid" spacing="md" label="OR" />',
    usageTips: ['Use consistent spacing', 'Add labels for section breaks', 'Match theme colors']
  },
  {
    id: 'spacer',
    name: 'Spacer',
    category: 'utility',
    description: 'Vertical spacer',
    icon: '↕',
    defaultProps: { size: 'md', axis: 'vertical' },
    propTypes: {
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small (4px)' }, { value: 'sm', label: 'Small (8px)' }, { value: 'md', label: 'Medium (16px)' }, { value: 'lg', label: 'Large (24px)' }, { value: 'xl', label: 'Extra Large (32px)' }, { value: '2xl', label: '2X Large (48px)' }], default: 'md' },
      axis: { type: 'select', options: [{ value: 'vertical', label: 'Vertical' }, { value: 'horizontal', label: 'Horizontal' }], default: 'vertical' },
      customSize: { type: 'number', description: 'Custom size in pixels' },
      responsive: { type: 'boolean', default: false, description: 'Responsive sizing' },
      showInEditor: { type: 'boolean', default: true, description: 'Show outline in editor' }
    },
    usageExample: '<Spacer size="lg" axis="vertical" />',
    usageTips: ['Use consistent spacing scale', 'Consider responsive sizing', 'Avoid excessive spacers']
  },
  {
    id: 'badge',
    name: 'Badge',
    category: 'utility',
    description: 'Status badge',
    icon: '●',
    defaultProps: { label: '', variant: 'default', size: 'md' },
    propTypes: {
      label: { type: 'string', description: 'Badge text', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'primary', label: 'Primary' }, { value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'danger', label: 'Danger' }, { value: 'info', label: 'Info' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      color: { type: 'color', description: 'Custom badge color' },
      icon: { type: 'icon', description: 'Badge icon' },
      showIcon: { type: 'boolean', default: false, description: 'Show icon' },
      rounded: { type: 'boolean', default: true, description: 'Rounded corners' },
      pill: { type: 'boolean', default: false, description: 'Pill shape' },
      outlined: { type: 'boolean', default: false, description: 'Outline style' },
      dot: { type: 'boolean', default: false, description: 'Show as dot only' },
      pulsing: { type: 'boolean', default: false, description: 'Pulsing animation' }
    },
    usageExample: '<Badge label="New" variant="success" pill showIcon pulsing />',
    usageTips: ['Use semantic colors', 'Keep labels short', 'Use pulsing for attention']
  },
  {
    id: 'skeleton',
    name: 'Skeleton',
    category: 'utility',
    description: 'Loading skeleton',
    icon: '▭',
    defaultProps: { variant: 'text', animated: true },
    propTypes: {
      variant: { type: 'select', options: [{ value: 'text', label: 'Text' }, { value: 'circular', label: 'Circular' }, { value: 'rectangular', label: 'Rectangular' }, { value: 'rounded', label: 'Rounded' }], default: 'text' },
      width: { type: 'string', default: '100%', description: 'Skeleton width' },
      height: { type: 'string', description: 'Skeleton height' },
      lines: { type: 'number', default: 1, description: 'Number of text lines' },
      animated: { type: 'boolean', default: true, description: 'Show shimmer animation' },
      animationType: { type: 'select', options: [{ value: 'pulse', label: 'Pulse' }, { value: 'wave', label: 'Wave' }], default: 'wave' },
      baseColor: { type: 'color', default: '#e5e7eb', description: 'Base color' },
      highlightColor: { type: 'color', default: '#f3f4f6', description: 'Highlight color' },
      borderRadius: { type: 'string', description: 'Border radius' },
      spacing: { type: 'string', default: '8px', description: 'Line spacing' }
    },
    usageExample: '<Skeleton variant="text" lines={3} animated animationType="wave" />',
    usageTips: ['Match actual content layout', 'Use consistent animation', 'Limit skeleton duration']
  },
  {
    id: 'loading-spinner',
    name: 'Loading Spinner',
    category: 'utility',
    description: 'Loading spinner animation',
    icon: '◌',
    defaultProps: { size: 'md', variant: 'circular' },
    propTypes: {
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }], default: 'md' },
      variant: { type: 'select', options: [{ value: 'circular', label: 'Circular' }, { value: 'dots', label: 'Dots' }, { value: 'bars', label: 'Bars' }, { value: 'pulse', label: 'Pulse' }], default: 'circular' },
      color: { type: 'color', default: '#3b82f6', description: 'Spinner color' },
      secondaryColor: { type: 'color', description: 'Secondary color' },
      speed: { type: 'select', options: [{ value: 'slow', label: 'Slow' }, { value: 'normal', label: 'Normal' }, { value: 'fast', label: 'Fast' }], default: 'normal' },
      label: { type: 'string', description: 'Loading text' },
      labelPosition: { type: 'select', options: [{ value: 'bottom', label: 'Bottom' }, { value: 'right', label: 'Right' }], default: 'bottom' },
      overlay: { type: 'boolean', default: false, description: 'Full-screen overlay' },
      overlayOpacity: { type: 'number', default: 0.5, description: 'Overlay opacity' }
    },
    usageExample: '<LoadingSpinner size="lg" variant="dots" label="Loading..." />',
    usageTips: ['Use appropriate size', 'Match brand colors', 'Add context with label']
  },
  {
    id: 'progress-bar',
    name: 'Progress Bar',
    category: 'utility',
    description: 'Progress indicator bar',
    icon: '▰▰▱',
    defaultProps: { value: 0, max: 100, variant: 'default' },
    propTypes: {
      value: { type: 'number', default: 0, min: 0, description: 'Current value' },
      max: { type: 'number', default: 100, description: 'Maximum value' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'striped', label: 'Striped' }, { value: 'animated', label: 'Animated' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      color: { type: 'color', default: '#3b82f6', description: 'Progress color' },
      backgroundColor: { type: 'color', default: '#e5e7eb', description: 'Track color' },
      showValue: { type: 'boolean', default: false, description: 'Show percentage' },
      valuePosition: { type: 'select', options: [{ value: 'inside', label: 'Inside' }, { value: 'outside', label: 'Outside' }, { value: 'tooltip', label: 'Tooltip' }], default: 'outside' },
      label: { type: 'string', description: 'Progress label' },
      rounded: { type: 'boolean', default: true, description: 'Rounded corners' },
      indeterminate: { type: 'boolean', default: false, description: 'Indeterminate mode' }
    },
    usageExample: '<ProgressBar value={75} max={100} showValue variant="striped" />',
    usageTips: ['Show percentage for clarity', 'Use semantic colors', 'Consider indeterminate for unknown duration']
  },
  {
    id: 'keyboard-shortcut',
    name: 'Keyboard Shortcut',
    category: 'utility',
    description: 'Keyboard shortcut display',
    icon: '⌨',
    defaultProps: { keys: [], variant: 'default' },
    propTypes: {
      keys: { type: 'array', description: 'Array of key names', required: true },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' }, { value: 'outlined', label: 'Outlined' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      separator: { type: 'string', default: '+', description: 'Key separator' },
      showPlus: { type: 'boolean', default: true, description: 'Show + separator' },
      platform: { type: 'select', options: [{ value: 'auto', label: 'Auto-detect' }, { value: 'mac', label: 'macOS' }, { value: 'windows', label: 'Windows' }], default: 'auto' },
      backgroundColor: { type: 'color', description: 'Key background color' },
      borderColor: { type: 'color', description: 'Key border color' }
    },
    usageExample: '<KeyboardShortcut keys={["Cmd", "K"]} platform="auto" />',
    usageTips: ['Auto-detect platform', 'Use standard key names', 'Keep shortcuts simple']
  },
  {
    id: 'status-indicator',
    name: 'Status Indicator',
    category: 'utility',
    description: 'Online/offline status',
    icon: '●',
    defaultProps: { status: 'online', size: 'md' },
    propTypes: {
      status: { type: 'select', options: [{ value: 'online', label: 'Online' }, { value: 'offline', label: 'Offline' }, { value: 'away', label: 'Away' }, { value: 'busy', label: 'Busy' }, { value: 'dnd', label: 'Do Not Disturb' }], default: 'online', required: true },
      size: { type: 'select', options: [{ value: 'xs', label: 'Extra Small' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showLabel: { type: 'boolean', default: false, description: 'Show status text' },
      label: { type: 'string', description: 'Custom label text' },
      pulsing: { type: 'boolean', default: false, description: 'Pulsing animation' },
      bordered: { type: 'boolean', default: true, description: 'Show border' },
      onlineColor: { type: 'color', default: '#22c55e', description: 'Online color' },
      offlineColor: { type: 'color', default: '#9ca3af', description: 'Offline color' },
      awayColor: { type: 'color', default: '#f59e0b', description: 'Away color' },
      busyColor: { type: 'color', default: '#ef4444', description: 'Busy color' }
    },
    usageExample: '<StatusIndicator status="online" showLabel pulsing />',
    usageTips: ['Use recognizable colors', 'Add pulse for active states', 'Show label for clarity']
  },
  {
    id: 'countdown-timer',
    name: 'Countdown Timer',
    category: 'utility',
    description: 'Countdown timer display',
    icon: '⏱',
    defaultProps: { targetDate: '', variant: 'default' },
    propTypes: {
      targetDate: { type: 'string', description: 'Target date/time', required: true, placeholder: '2024-12-31T23:59:59' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'cards', label: 'Cards' }, { value: 'minimal', label: 'Minimal' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }], default: 'md' },
      showDays: { type: 'boolean', default: true, description: 'Show days' },
      showHours: { type: 'boolean', default: true, description: 'Show hours' },
      showMinutes: { type: 'boolean', default: true, description: 'Show minutes' },
      showSeconds: { type: 'boolean', default: true, description: 'Show seconds' },
      showLabels: { type: 'boolean', default: true, description: 'Show unit labels' },
      separator: { type: 'string', default: ':', description: 'Time separator' },
      onComplete: { type: 'string', description: 'Action on complete' },
      completedText: { type: 'string', default: 'Time\'s up!', description: 'Completion message' },
      animated: { type: 'boolean', default: true, description: 'Animate changes' }
    },
    usageExample: '<CountdownTimer targetDate="2024-12-31T23:59:59" variant="cards" showLabels />',
    usageTips: ['Use cards for prominent display', 'Hide unnecessary units', 'Animate for engagement']
  },
  {
    id: 'copy-to-clipboard',
    name: 'Copy to Clipboard',
    category: 'utility',
    description: 'Copy text button',
    icon: '📋',
    defaultProps: { text: '', variant: 'button' },
    propTypes: {
      text: { type: 'string', description: 'Text to copy', required: true },
      variant: { type: 'select', options: [{ value: 'button', label: 'Button' }, { value: 'icon', label: 'Icon Only' }, { value: 'inline', label: 'Inline' }], default: 'button' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      label: { type: 'string', default: 'Copy', description: 'Button label' },
      copiedLabel: { type: 'string', default: 'Copied!', description: 'Success label' },
      showText: { type: 'boolean', default: false, description: 'Show text preview' },
      textMaxLength: { type: 'number', default: 50, description: 'Max preview length' },
      successDuration: { type: 'number', default: 2000, description: 'Success state duration (ms)' },
      showTooltip: { type: 'boolean', default: true, description: 'Show tooltip' },
      disabled: { type: 'boolean', default: false, description: 'Disable button' }
    },
    usageExample: '<CopyToClipboard text="npm install package" label="Copy command" showTooltip />',
    usageTips: ['Show success feedback', 'Use clear labels', 'Consider showing text preview']
  },
  {
    id: 'back-to-top',
    name: 'Back to Top',
    category: 'utility',
    description: 'Scroll to top button',
    icon: '↑',
    defaultProps: { variant: 'default', showAfter: 300 },
    propTypes: {
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'minimal', label: 'Minimal' }, { value: 'labeled', label: 'With Label' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      position: { type: 'select', options: [{ value: 'bottom-right', label: 'Bottom Right' }, { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-center', label: 'Bottom Center' }], default: 'bottom-right' },
      showAfter: { type: 'number', default: 300, description: 'Show after scroll (px)' },
      smooth: { type: 'boolean', default: true, description: 'Smooth scroll' },
      label: { type: 'string', default: 'Back to top', description: 'Button label' },
      showLabel: { type: 'boolean', default: false, description: 'Show label' },
      icon: { type: 'icon', description: 'Custom icon' },
      backgroundColor: { type: 'color', description: 'Button background' },
      offset: { type: 'number', default: 20, description: 'Edge offset (px)' }
    },
    usageExample: '<BackToTop showAfter={400} position="bottom-right" smooth />',
    usageTips: ['Set appropriate scroll threshold', 'Use smooth scrolling', 'Position consistently']
  },
  {
    id: 'sticky-container',
    name: 'Sticky Container',
    category: 'utility',
    description: 'Sticky position wrapper',
    icon: '📌',
    defaultProps: { position: 'top', offset: 0 },
    propTypes: {
      position: { type: 'select', options: [{ value: 'top', label: 'Top' }, { value: 'bottom', label: 'Bottom' }], default: 'top' },
      offset: { type: 'number', default: 0, description: 'Offset from edge (px)' },
      zIndex: { type: 'number', default: 100, description: 'Z-index level' },
      showShadow: { type: 'boolean', default: true, description: 'Show shadow when stuck' },
      backgroundColor: { type: 'color', description: 'Container background' },
      disabled: { type: 'boolean', default: false, description: 'Disable sticky' },
      onStick: { type: 'string', description: 'Callback when stuck' },
      onUnstick: { type: 'string', description: 'Callback when unstuck' }
    },
    usageExample: '<StickyContainer position="top" offset={60} showShadow>{children}</StickyContainer>',
    usageTips: ['Account for header height', 'Add shadow for depth', 'Test on various scroll positions']
  },
  {
    id: 'truncated-text',
    name: 'Truncated Text',
    category: 'utility',
    description: 'Text with read more',
    icon: '...',
    defaultProps: { text: '', maxLength: 150, variant: 'default' },
    propTypes: {
      text: { type: 'string', description: 'Full text content', required: true },
      maxLength: { type: 'number', default: 150, description: 'Max visible characters' },
      maxLines: { type: 'number', description: 'Max visible lines' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'fade', label: 'Fade Out' }, { value: 'inline', label: 'Inline' }], default: 'default' },
      expandLabel: { type: 'string', default: 'Read more', description: 'Expand button text' },
      collapseLabel: { type: 'string', default: 'Show less', description: 'Collapse button text' },
      showToggle: { type: 'boolean', default: true, description: 'Show expand/collapse' },
      expandable: { type: 'boolean', default: true, description: 'Allow expansion' },
      animated: { type: 'boolean', default: true, description: 'Animate expansion' }
    },
    usageExample: '<TruncatedText text={longText} maxLength={200} expandLabel="Read more" animated />',
    usageTips: ['Use appropriate length', 'Make toggle obvious', 'Consider mobile screens']
  },
  {
    id: 'highlight-text',
    name: 'Highlight Text',
    category: 'utility',
    description: 'Text with highlight',
    icon: '🖍',
    defaultProps: { text: '', highlight: '' },
    propTypes: {
      text: { type: 'string', description: 'Full text content', required: true },
      highlight: { type: 'string', description: 'Text to highlight', required: true },
      highlightColor: { type: 'color', default: '#fef08a', description: 'Highlight background' },
      textColor: { type: 'color', description: 'Highlighted text color' },
      caseSensitive: { type: 'boolean', default: false, description: 'Case-sensitive match' },
      matchAll: { type: 'boolean', default: true, description: 'Highlight all matches' },
      variant: { type: 'select', options: [{ value: 'background', label: 'Background' }, { value: 'underline', label: 'Underline' }, { value: 'bold', label: 'Bold' }], default: 'background' },
      animated: { type: 'boolean', default: false, description: 'Animate highlight' }
    },
    usageExample: '<HighlightText text="Search results here" highlight="results" highlightColor="#fef08a" />',
    usageTips: ['Use for search results', 'Choose visible colors', 'Consider accessibility']
  },
  {
    id: 'responsive-grid',
    name: 'Responsive Grid',
    category: 'utility',
    description: 'Responsive grid layout',
    icon: '▦',
    defaultProps: { columns: 3, gap: 'md' },
    propTypes: {
      columns: { type: 'number', default: 3, min: 1, max: 12, description: 'Number of columns' },
      columnsSm: { type: 'number', description: 'Columns on small screens' },
      columnsMd: { type: 'number', description: 'Columns on medium screens' },
      columnsLg: { type: 'number', description: 'Columns on large screens' },
      gap: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }, { value: 'xl', label: 'Extra Large' }], default: 'md' },
      rowGap: { type: 'select', options: [{ value: 'none', label: 'None' }, { value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      alignItems: { type: 'select', options: [{ value: 'start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'end', label: 'End' }, { value: 'stretch', label: 'Stretch' }], default: 'stretch' },
      justifyItems: { type: 'select', options: [{ value: 'start', label: 'Start' }, { value: 'center', label: 'Center' }, { value: 'end', label: 'End' }, { value: 'stretch', label: 'Stretch' }], default: 'stretch' },
      minChildWidth: { type: 'string', description: 'Min child width (auto-fit)' }
    },
    usageExample: '<ResponsiveGrid columns={4} columnsSm={1} columnsMd={2} gap="lg">{items}</ResponsiveGrid>',
    usageTips: ['Set mobile-first columns', 'Use consistent gaps', 'Consider content size']
  },
  {
    id: 'collapsible-section',
    name: 'Collapsible Section',
    category: 'utility',
    description: 'Collapsible content section',
    icon: '▽',
    defaultProps: { title: 'Section', defaultOpen: false },
    propTypes: {
      title: { type: 'string', description: 'Section title', required: true },
      defaultOpen: { type: 'boolean', default: false, description: 'Initially expanded' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'bordered', label: 'Bordered' }, { value: 'filled', label: 'Filled' }], default: 'default' },
      icon: { type: 'icon', description: 'Custom expand icon' },
      iconPosition: { type: 'select', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], default: 'right' },
      animated: { type: 'boolean', default: true, description: 'Animate expand/collapse' },
      disabled: { type: 'boolean', default: false, description: 'Disable toggle' },
      headerClassName: { type: 'string', description: 'Header CSS class' },
      contentClassName: { type: 'string', description: 'Content CSS class' },
      showDivider: { type: 'boolean', default: false, description: 'Show divider' }
    },
    usageExample: '<CollapsibleSection title="Details" defaultOpen animated>{content}</CollapsibleSection>',
    usageTips: ['Use clear titles', 'Animate for polish', 'Consider default state']
  },
  {
    id: 'infinite-scroll-trigger',
    name: 'Infinite Scroll Trigger',
    category: 'utility',
    description: 'Infinite scroll loader',
    icon: '↻',
    defaultProps: { threshold: 100, loading: false },
    propTypes: {
      threshold: { type: 'number', default: 100, description: 'Trigger distance (px)' },
      loading: { type: 'boolean', default: false, description: 'Loading state' },
      hasMore: { type: 'boolean', default: true, description: 'More content available' },
      loadingText: { type: 'string', default: 'Loading more...', description: 'Loading message' },
      endText: { type: 'string', default: 'No more items', description: 'End of list message' },
      variant: { type: 'select', options: [{ value: 'spinner', label: 'Spinner' }, { value: 'text', label: 'Text Only' }, { value: 'button', label: 'Load More Button' }], default: 'spinner' },
      buttonText: { type: 'string', default: 'Load More', description: 'Button text (button variant)' },
      showEndMessage: { type: 'boolean', default: true, description: 'Show end message' },
      disabled: { type: 'boolean', default: false, description: 'Disable trigger' }
    },
    usageExample: '<InfiniteScrollTrigger threshold={200} loading={isLoading} hasMore={hasMore} />',
    usageTips: ['Set appropriate threshold', 'Show loading feedback', 'Handle end of content']
  },
  {
    id: 'empty-state-placeholder',
    name: 'Empty State Placeholder',
    category: 'utility',
    description: 'Empty content state',
    icon: '○',
    defaultProps: { title: 'No items', variant: 'default' },
    propTypes: {
      title: { type: 'string', description: 'Empty state title', required: true },
      description: { type: 'string', description: 'Descriptive text' },
      icon: { type: 'icon', description: 'Illustration/icon' },
      variant: { type: 'select', options: [{ value: 'default', label: 'Default' }, { value: 'compact', label: 'Compact' }, { value: 'illustrated', label: 'Illustrated' }], default: 'default' },
      size: { type: 'select', options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], default: 'md' },
      showAction: { type: 'boolean', default: false, description: 'Show action button' },
      actionLabel: { type: 'string', default: 'Get Started', description: 'Action button text' },
      actionUrl: { type: 'string', description: 'Action button URL' },
      image: { type: 'string', description: 'Illustration image URL' },
      imageSize: { type: 'number', default: 200, description: 'Image size (px)' }
    },
    usageExample: '<EmptyStatePlaceholder title="No results" description="Try different filters" showAction actionLabel="Clear filters" />',
    usageTips: ['Provide helpful message', 'Include action when possible', 'Use relevant illustration']
  },
  {
    id: 'overlay',
    name: 'Overlay',
    category: 'utility',
    description: 'Modal overlay backdrop',
    icon: '▣',
    defaultProps: { visible: false, opacity: 0.5 },
    propTypes: {
      visible: { type: 'boolean', default: false, description: 'Overlay visibility', required: true },
      opacity: { type: 'number', default: 0.5, min: 0, max: 1, description: 'Background opacity' },
      color: { type: 'color', default: '#000000', description: 'Overlay color' },
      blur: { type: 'boolean', default: false, description: 'Blur background' },
      blurAmount: { type: 'number', default: 4, description: 'Blur amount (px)' },
      clickToClose: { type: 'boolean', default: true, description: 'Close on click' },
      animated: { type: 'boolean', default: true, description: 'Fade animation' },
      animationDuration: { type: 'number', default: 200, description: 'Animation duration (ms)' },
      zIndex: { type: 'number', default: 1000, description: 'Z-index level' },
      fixed: { type: 'boolean', default: true, description: 'Fixed positioning' }
    },
    usageExample: '<Overlay visible={isOpen} opacity={0.6} blur clickToClose />',
    usageTips: ['Use with modals', 'Enable click to close', 'Consider blur for modern look']
  },
  {
    id: 'notification-toast',
    name: 'Notification Toast',
    category: 'utility',
    description: 'Toast notification',
    icon: '🔔',
    defaultProps: { message: '', type: 'info', position: 'top-right' },
    propTypes: {
      message: { type: 'string', description: 'Notification message', required: true },
      title: { type: 'string', description: 'Notification title' },
      type: { type: 'select', options: [{ value: 'info', label: 'Info' }, { value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }], default: 'info' },
      position: { type: 'select', options: [{ value: 'top-right', label: 'Top Right' }, { value: 'top-left', label: 'Top Left' }, { value: 'top-center', label: 'Top Center' }, { value: 'bottom-right', label: 'Bottom Right' }, { value: 'bottom-left', label: 'Bottom Left' }, { value: 'bottom-center', label: 'Bottom Center' }], default: 'top-right' },
      duration: { type: 'number', default: 5000, description: 'Auto-dismiss time (ms)' },
      dismissible: { type: 'boolean', default: true, description: 'Show close button' },
      showIcon: { type: 'boolean', default: true, description: 'Show type icon' },
      showProgress: { type: 'boolean', default: false, description: 'Show progress bar' },
      action: { type: 'string', description: 'Action button text' },
      actionUrl: { type: 'string', description: 'Action button URL' },
      persistent: { type: 'boolean', default: false, description: 'Disable auto-dismiss' }
    },
    usageExample: '<NotificationToast message="Changes saved!" type="success" duration={3000} showProgress />',
    usageTips: ['Use semantic types', 'Set appropriate duration', 'Allow dismissal']
  }
];

// Complete registry of all components
export const componentRegistry: ComponentMeta[] = [
  ...navigationComponents,
  ...contentComponents,
  ...interactiveComponents,
  ...mediaComponents,
  ...socialComponents,
  ...formComponents,
  ...userComponents,
  ...commerceComponents,
  ...utilityComponents
];

// Get components by category
export const getComponentsByCategory = (category: ComponentCategory): ComponentMeta[] => {
  return componentRegistry.filter(c => c.category === category);
};

// Get component by ID
export const getComponentById = (id: string): ComponentMeta | undefined => {
  return componentRegistry.find(c => c.id === id);
};

// Search components
export const searchComponents = (query: string): ComponentMeta[] => {
  const lowerQuery = query.toLowerCase();
  return componentRegistry.filter(
    c =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.category.toLowerCase().includes(lowerQuery)
  );
};

// Category labels and icons
export const categoryInfo: Record<ComponentCategory, { label: string; icon: string; description: string }> = {
  navigation: {
    label: 'Navigation',
    icon: '☰',
    description: 'Menus, breadcrumbs, and navigation elements'
  },
  content: {
    label: 'Content',
    icon: '▢',
    description: 'Cards, lists, and content display elements'
  },
  interactive: {
    label: 'Interactive',
    icon: '◉',
    description: 'Buttons, inputs, and interactive elements'
  },
  media: {
    label: 'Media',
    icon: '🖼',
    description: 'Images, videos, and media elements'
  },
  social: {
    label: 'Social',
    icon: '💬',
    description: 'Social sharing and engagement elements'
  },
  forms: {
    label: 'Forms',
    icon: '▭',
    description: 'Form inputs and controls'
  },
  user: {
    label: 'User/Profile',
    icon: '👤',
    description: 'User profiles and account elements'
  },
  commerce: {
    label: 'Commerce',
    icon: '🛒',
    description: 'Shopping and e-commerce elements'
  },
  utility: {
    label: 'Utility',
    icon: '⚙',
    description: 'Layout, loading, and utility elements'
  }
};

// Total component count
export const totalComponentCount = componentRegistry.length;

// Export summary for documentation
export const componentSummary = {
  total: totalComponentCount,
  byCategory: {
    navigation: navigationComponents.length,
    content: contentComponents.length,
    interactive: interactiveComponents.length,
    media: mediaComponents.length,
    social: socialComponents.length,
    forms: formComponents.length,
    user: userComponents.length,
    commerce: commerceComponents.length,
    utility: utilityComponents.length
  }
};

// ==================== HTML GENERATION ====================
// Main function to generate HTML for any component

/**
 * Generate HTML output for a component with the given props
 * Uses the component's generateHtml function if available, otherwise generates default HTML
 */
export const getHtmlForComponent = (componentId: string, props: Record<string, unknown>): string => {
  const component = getComponentById(componentId);
  if (!component) {
    return `<!-- Unknown component: ${componentId} -->`;
  }

  // Use the component's custom HTML generator if available
  if (component.generateHtml) {
    return component.generateHtml(props);
  }

  // Check the componentHtmlGenerators map for a fallback
  const mapGenerator = componentHtmlGenerators[componentId];
  if (mapGenerator) {
    return mapGenerator(props);
  }

  // Fall back to default HTML generator
  return generateDefaultHtml(component, props);
};

/**
 * Generate HTML for a component using its ComponentMeta
 */
export const generateComponentHtml = (component: ComponentMeta, props: Record<string, unknown>): string => {
  // Use the component's custom HTML generator if available
  if (component.generateHtml) {
    return component.generateHtml(props);
  }

  // Check the componentHtmlGenerators map for a fallback
  const mapGenerator = componentHtmlGenerators[component.id];
  if (mapGenerator) {
    return mapGenerator(props);
  }

  // Fall back to default HTML generator
  return generateDefaultHtml(component, props);
};

// Map of component IDs to their HTML generators (for components without explicit generateHtml)
const componentHtmlGenerators: Record<string, HtmlGenerator> = {
  // Navigation
  'vertical-menu': (props) => generateMenuHtml({ ...props, variant: 'vertical' }),
  'horizontal-menu': (props) => generateMenuHtml({ ...props, variant: 'horizontal' }),
  'mega-menu': (props) => generateMenuHtml({ ...props, variant: 'mega' }),
  'breadcrumbs': generateBreadcrumbHtml,
  'pagination': generatePaginationHtml,
  'tab-navigation': generateTabsHtml,

  // Content
  'card': generateCardHtml,
  'content-card': generateCardHtml,
  'article-card': generateCardHtml,
  'feature-card': generateCardHtml,
  'info-card': generateCardHtml,
  'stat-card': (props) => `<div class="stat-card">
  <div class="stat-card__value">{{ stat_value | default('0') }}</div>
  <div class="stat-card__label">{{ stat_label | default('Stat') }}</div>
</div>`,
  'testimonial-card': generateTestimonialHtml,
  'quote-block': generateQuoteHtml,
  'blockquote': generateQuoteHtml,
  'hero-section': generateHeroHtml,
  'hero': generateHeroHtml,
  'cta-section': (props) => generateHeroHtml({ ...props, variant: 'cta' }),
  'feature-list': (props) => generateListHtml({ ...props, variant: 'features' }),
  'accordion': generateAccordionHtml,
  'tabs': generateTabsHtml,
  'data-table': generateTableHtml,
  'table': generateTableHtml,

  // Interactive
  'button': generateButtonHtml,
  'primary-button': (props) => generateButtonHtml({ ...props, variant: 'primary' }),
  'secondary-button': (props) => generateButtonHtml({ ...props, variant: 'secondary' }),
  'icon-button': (props) => generateButtonHtml({ ...props, variant: 'icon' }),
  'dropdown': generateDropdownHtml,
  'dropdown-menu': generateDropdownHtml,
  'modal': generateModalHtml,
  'modal-dialog': generateModalHtml,
  'tooltip': generateTooltipHtml,
  'alert': generateAlertHtml,
  'notification': generateAlertHtml,
  'progress-bar': generateProgressHtml,
  'progress': generateProgressHtml,
  'badge': generateBadgeHtml,
  'tag': generateBadgeHtml,
  'chip': generateBadgeHtml,
  'divider': generateDividerHtml,
  'separator': generateDividerHtml,
  'carousel': generateCarouselHtml,
  'slider': generateCarouselHtml,

  // Media
  'image': generateImageHtml,
  'responsive-image': generateImageHtml,
  'image-gallery': generateGalleryHtml,
  'gallery': generateGalleryHtml,
  'video-player': generateVideoHtml,
  'video': generateVideoHtml,

  // Social
  'social-links': generateSocialLinksHtml,
  'social-icons': generateSocialLinksHtml,
  'share-buttons': (props) => `<div class="share-buttons">
  <button class="share-btn share-btn--twitter" data-share="twitter">Share on Twitter</button>
  <button class="share-btn share-btn--facebook" data-share="facebook">Share on Facebook</button>
  <button class="share-btn share-btn--linkedin" data-share="linkedin">Share on LinkedIn</button>
</div>`,

  // Forms
  'contact-form': generateFormHtml,
  'form': generateFormHtml,
  'input': generateInputHtml,
  'text-input': generateInputHtml,
  'email-input': (props) => generateInputHtml({ ...props, type: 'email' }),
  'password-input': (props) => generateInputHtml({ ...props, type: 'password' }),
  'textarea': (props) => `<div class="form-group">
  <label for="${props.name || 'textarea'}" class="form-label">${props.label || 'Message'}</label>
  <textarea
    id="${props.name || 'textarea'}"
    name="${props.name || 'textarea'}"
    class="form-textarea"
    rows="${props.rows || 4}"
    placeholder="${props.placeholder || ''}"
  ></textarea>
</div>`,
  'search-input': generateSearchHtml,
  'search': generateSearchHtml,
  'newsletter': generateNewsletterHtml,
  'newsletter-signup': generateNewsletterHtml,

  // User
  'avatar': generateAvatarHtml,
  'user-avatar': generateAvatarHtml,
  'author-bio': (props) => `<div class="author-bio">
  <img src="{{ author.avatar }}" alt="{{ author.name }}" class="author-bio__avatar">
  <div class="author-bio__content">
    <h4 class="author-bio__name">{{ author.name }}</h4>
    <p class="author-bio__description">{{ author.bio }}</p>
  </div>
</div>`,

  // Commerce
  'price': generatePriceHtml,
  'price-display': generatePriceHtml,
  'product-card': (props) => `<article class="product-card">
  <div class="product-card__image">
    <img src="{{ product.image }}" alt="{{ product.name }}" loading="lazy">
  </div>
  <div class="product-card__content">
    <h3 class="product-card__title">{{ product.name }}</h3>
    <div class="product-card__price">
      {% if product.sale_price %}
      <span class="product-card__original-price">{{ product.price }}</span>
      <span class="product-card__sale-price">{{ product.sale_price }}</span>
      {% else %}
      <span>{{ product.price }}</span>
      {% endif %}
    </div>
    <button class="btn btn--primary">Add to Cart</button>
  </div>
</article>`,
  'add-to-cart': (props) => `<button class="btn btn--primary add-to-cart" data-product-id="{{ product.id }}">
  Add to Cart
</button>`,

  // Utility
  'spinner': generateSpinnerHtml,
  'loading-spinner': generateSpinnerHtml,
  'skeleton': (props) => `<div class="skeleton skeleton--${props.variant || 'text'}" style="width: ${props.width || '100%'}; height: ${props.height || '1rem'}"></div>`,
  'spacer': (props) => `<div class="spacer" style="height: ${props.size || '1rem'}"></div>`,
  'container': (props) => `<div class="container container--${props.size || 'default'}">
  {{ slot_content | safe }}
</div>`,
  'grid': (props) => `<div class="grid" style="--grid-columns: ${props.columns || 3}; --grid-gap: ${props.gap || '1rem'}">
  {{ slot_content | safe }}
</div>`,
  'flex': (props) => `<div class="flex" style="justify-content: ${props.justify || 'flex-start'}; align-items: ${props.align || 'stretch'}; gap: ${props.gap || '1rem'}">
  {{ slot_content | safe }}
</div>`,
  'header': generateHeaderHtml,
  'site-header': generateHeaderHtml,
  'footer': generateFooterHtml,
  'site-footer': generateFooterHtml,
};

/**
 * Get HTML generator for a component by ID
 */
export const getHtmlGenerator = (componentId: string): HtmlGenerator | undefined => {
  return componentHtmlGenerators[componentId];
};
