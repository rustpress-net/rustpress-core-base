-- Migration: 00029_templates
-- Description: Template library system for pre-built content templates
-- Created: 2024-01-15

-- Template categories
CREATE TABLE IF NOT EXISTS template_categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    category_id VARCHAR(50) REFERENCES template_categories(id) ON DELETE SET NULL,
    thumbnail_url TEXT,
    html_content TEXT NOT NULL,
    css_content TEXT,
    variables JSONB DEFAULT '[]',
    is_pro BOOLEAN DEFAULT FALSE,
    is_system BOOLEAN DEFAULT FALSE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    downloads INTEGER DEFAULT 0,
    rating_sum INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template ratings
CREATE TABLE IF NOT EXISTS template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_id, user_id)
);

-- Template usage tracking
CREATE TABLE IF NOT EXISTS template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL DEFAULT 'insert', -- insert, preview, download
    variables_used JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User saved templates (favorites)
CREATE TABLE IF NOT EXISTS user_template_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_templates_category ON templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_author ON templates(author_id);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_is_system ON templates(is_system);
CREATE INDEX IF NOT EXISTS idx_templates_downloads ON templates(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_template_ratings_template ON template_ratings(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_template ON template_usage(template_id);
CREATE INDEX IF NOT EXISTS idx_template_usage_user ON template_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_template_favorites_user ON user_template_favorites(user_id);

-- Insert default template categories
INSERT INTO template_categories (id, name, description, icon, sort_order) VALUES
    ('hero', 'Hero Sections', 'Eye-catching hero sections for page headers', 'star', 1),
    ('features', 'Feature Sections', 'Showcase product or service features', 'grid', 2),
    ('pricing', 'Pricing Tables', 'Pricing plans and comparison tables', 'dollar-sign', 3),
    ('testimonials', 'Testimonials', 'Customer reviews and testimonials', 'message-circle', 4),
    ('cta', 'Call to Action', 'Conversion-focused call to action sections', 'zap', 5),
    ('about', 'About Sections', 'About us and team sections', 'users', 6),
    ('contact', 'Contact Forms', 'Contact forms and information sections', 'mail', 7),
    ('footer', 'Footer Sections', 'Page footers with links and info', 'layout', 8),
    ('blog', 'Blog Layouts', 'Blog post layouts and article templates', 'file-text', 9),
    ('gallery', 'Image Galleries', 'Photo galleries and portfolios', 'image', 10),
    ('faq', 'FAQ Sections', 'Frequently asked questions layouts', 'help-circle', 11),
    ('stats', 'Statistics', 'Numbers and statistics displays', 'bar-chart', 12),
    ('newsletter', 'Newsletter Signup', 'Email subscription forms', 'send', 13),
    ('social', 'Social Proof', 'Social media and trust badges', 'share-2', 14),
    ('custom', 'Custom Templates', 'User-created custom templates', 'edit', 99)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    sort_order = EXCLUDED.sort_order;

-- Insert system templates

-- Hero Templates
INSERT INTO templates (name, slug, description, category_id, html_content, css_content, variables, is_system, is_public, tags) VALUES
(
    'Simple Hero',
    'simple-hero',
    'Clean and simple hero section with title, subtitle and CTA button',
    'hero',
    '<section class="hero-simple">
  <div class="hero-content">
    <h1>{{title}}</h1>
    <p class="hero-subtitle">{{subtitle}}</p>
    <a href="{{cta_link}}" class="hero-cta">{{cta_text}}</a>
  </div>
</section>',
    '.hero-simple { padding: 80px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.hero-simple h1 { font-size: 3rem; margin-bottom: 1rem; font-weight: 700; }
.hero-subtitle { font-size: 1.25rem; opacity: 0.9; margin-bottom: 2rem; max-width: 600px; margin-left: auto; margin-right: auto; }
.hero-cta { display: inline-block; padding: 14px 32px; background: white; color: #667eea; text-decoration: none; border-radius: 8px; font-weight: 600; transition: transform 0.2s; }
.hero-cta:hover { transform: translateY(-2px); }',
    '[{"name": "title", "type": "text", "defaultValue": "Welcome to Our Site", "placeholder": "Enter your headline"},
     {"name": "subtitle", "type": "text", "defaultValue": "Discover amazing features that will transform your workflow", "placeholder": "Enter your subtitle"},
     {"name": "cta_link", "type": "link", "defaultValue": "#signup", "placeholder": "Button URL"},
     {"name": "cta_text", "type": "text", "defaultValue": "Get Started", "placeholder": "Button text"}]',
    TRUE, TRUE, ARRAY['hero', 'simple', 'gradient', 'cta']
),
(
    'Hero with Image',
    'hero-with-image',
    'Two-column hero with text on left and image on right',
    'hero',
    '<section class="hero-image">
  <div class="hero-grid">
    <div class="hero-text">
      <h1>{{title}}</h1>
      <p>{{description}}</p>
      <div class="hero-buttons">
        <a href="{{primary_link}}" class="btn-primary">{{primary_text}}</a>
        <a href="{{secondary_link}}" class="btn-secondary">{{secondary_text}}</a>
      </div>
    </div>
    <div class="hero-image-container">
      <img src="{{image_url}}" alt="{{image_alt}}">
    </div>
  </div>
</section>',
    '.hero-image { padding: 60px 20px; }
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; max-width: 1200px; margin: 0 auto; }
.hero-text h1 { font-size: 2.5rem; margin-bottom: 1rem; color: #1a1a2e; }
.hero-text p { font-size: 1.1rem; color: #666; margin-bottom: 2rem; line-height: 1.7; }
.hero-buttons { display: flex; gap: 16px; }
.btn-primary { padding: 12px 28px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; font-weight: 500; }
.btn-secondary { padding: 12px 28px; border: 2px solid #4f46e5; color: #4f46e5; text-decoration: none; border-radius: 6px; font-weight: 500; }
.hero-image-container img { width: 100%; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
@media (max-width: 768px) { .hero-grid { grid-template-columns: 1fr; } }',
    '[{"name": "title", "type": "text", "defaultValue": "Build Something Amazing", "placeholder": "Main headline"},
     {"name": "description", "type": "text", "defaultValue": "Our platform helps you create, launch, and grow your projects with powerful tools and seamless integrations.", "placeholder": "Description"},
     {"name": "primary_link", "type": "link", "defaultValue": "#start", "placeholder": "Primary button URL"},
     {"name": "primary_text", "type": "text", "defaultValue": "Start Free Trial", "placeholder": "Primary button text"},
     {"name": "secondary_link", "type": "link", "defaultValue": "#learn", "placeholder": "Secondary button URL"},
     {"name": "secondary_text", "type": "text", "defaultValue": "Learn More", "placeholder": "Secondary button text"},
     {"name": "image_url", "type": "image", "defaultValue": "/images/placeholder-hero.jpg", "placeholder": "Hero image URL"},
     {"name": "image_alt", "type": "text", "defaultValue": "Product screenshot", "placeholder": "Image alt text"}]',
    TRUE, TRUE, ARRAY['hero', 'image', 'two-column', 'buttons']
),
(
    'Video Hero',
    'video-hero',
    'Hero section with background video and overlay text',
    'hero',
    '<section class="hero-video">
  <video autoplay muted loop playsinline class="hero-bg-video">
    <source src="{{video_url}}" type="video/mp4">
  </video>
  <div class="hero-overlay">
    <h1>{{title}}</h1>
    <p>{{subtitle}}</p>
    <a href="{{cta_link}}" class="hero-btn">{{cta_text}}</a>
  </div>
</section>',
    '.hero-video { position: relative; height: 100vh; min-height: 600px; overflow: hidden; }
.hero-bg-video { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); min-width: 100%; min-height: 100%; object-fit: cover; }
.hero-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: white; padding: 20px; }
.hero-overlay h1 { font-size: 3.5rem; margin-bottom: 1rem; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
.hero-overlay p { font-size: 1.25rem; max-width: 600px; margin-bottom: 2rem; }
.hero-btn { padding: 16px 40px; background: white; color: #1a1a2e; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 1.1rem; }',
    '[{"name": "video_url", "type": "text", "defaultValue": "/videos/hero-bg.mp4", "placeholder": "Video URL (MP4)"},
     {"name": "title", "type": "text", "defaultValue": "Experience the Future", "placeholder": "Main headline"},
     {"name": "subtitle", "type": "text", "defaultValue": "Innovative solutions for modern challenges", "placeholder": "Subtitle"},
     {"name": "cta_link", "type": "link", "defaultValue": "#explore", "placeholder": "Button URL"},
     {"name": "cta_text", "type": "text", "defaultValue": "Explore Now", "placeholder": "Button text"}]',
    TRUE, TRUE, ARRAY['hero', 'video', 'fullscreen', 'overlay']
),

-- Feature Templates
(
    'Three Column Features',
    'three-column-features',
    'Display three features in a clean grid layout',
    'features',
    '<section class="features-three">
  <div class="features-header">
    <h2>{{section_title}}</h2>
    <p>{{section_subtitle}}</p>
  </div>
  <div class="features-grid">
    <div class="feature-card">
      <div class="feature-icon">{{icon_1}}</div>
      <h3>{{title_1}}</h3>
      <p>{{description_1}}</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">{{icon_2}}</div>
      <h3>{{title_2}}</h3>
      <p>{{description_2}}</p>
    </div>
    <div class="feature-card">
      <div class="feature-icon">{{icon_3}}</div>
      <h3>{{title_3}}</h3>
      <p>{{description_3}}</p>
    </div>
  </div>
</section>',
    '.features-three { padding: 80px 20px; background: #f8fafc; }
.features-header { text-align: center; margin-bottom: 60px; }
.features-header h2 { font-size: 2.25rem; color: #1a1a2e; margin-bottom: 1rem; }
.features-header p { color: #64748b; max-width: 600px; margin: 0 auto; }
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1100px; margin: 0 auto; }
.feature-card { background: white; padding: 32px; border-radius: 12px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.feature-icon { font-size: 2.5rem; margin-bottom: 1rem; }
.feature-card h3 { font-size: 1.25rem; color: #1a1a2e; margin-bottom: 0.75rem; }
.feature-card p { color: #64748b; line-height: 1.6; }
@media (max-width: 768px) { .features-grid { grid-template-columns: 1fr; } }',
    '[{"name": "section_title", "type": "text", "defaultValue": "Why Choose Us", "placeholder": "Section title"},
     {"name": "section_subtitle", "type": "text", "defaultValue": "Everything you need to succeed", "placeholder": "Section subtitle"},
     {"name": "icon_1", "type": "text", "defaultValue": "🚀", "placeholder": "Icon 1 (emoji or HTML)"},
     {"name": "title_1", "type": "text", "defaultValue": "Lightning Fast", "placeholder": "Feature 1 title"},
     {"name": "description_1", "type": "text", "defaultValue": "Optimized performance for the best user experience", "placeholder": "Feature 1 description"},
     {"name": "icon_2", "type": "text", "defaultValue": "🔒", "placeholder": "Icon 2"},
     {"name": "title_2", "type": "text", "defaultValue": "Secure by Default", "placeholder": "Feature 2 title"},
     {"name": "description_2", "type": "text", "defaultValue": "Enterprise-grade security built into every layer", "placeholder": "Feature 2 description"},
     {"name": "icon_3", "type": "text", "defaultValue": "💡", "placeholder": "Icon 3"},
     {"name": "title_3", "type": "text", "defaultValue": "Easy to Use", "placeholder": "Feature 3 title"},
     {"name": "description_3", "type": "text", "defaultValue": "Intuitive interface that anyone can master", "placeholder": "Feature 3 description"}]',
    TRUE, TRUE, ARRAY['features', 'grid', 'cards', 'icons']
),

-- Pricing Templates
(
    'Three Tier Pricing',
    'three-tier-pricing',
    'Classic three-column pricing table with featured middle tier',
    'pricing',
    '<section class="pricing-section">
  <div class="pricing-header">
    <h2>{{section_title}}</h2>
    <p>{{section_subtitle}}</p>
  </div>
  <div class="pricing-grid">
    <div class="pricing-card">
      <h3>{{tier1_name}}</h3>
      <div class="price"><span class="currency">$</span>{{tier1_price}}<span class="period">/mo</span></div>
      <p class="price-desc">{{tier1_description}}</p>
      <ul class="features-list">{{tier1_features}}</ul>
      <a href="{{tier1_link}}" class="pricing-btn">Get Started</a>
    </div>
    <div class="pricing-card featured">
      <div class="popular-badge">Most Popular</div>
      <h3>{{tier2_name}}</h3>
      <div class="price"><span class="currency">$</span>{{tier2_price}}<span class="period">/mo</span></div>
      <p class="price-desc">{{tier2_description}}</p>
      <ul class="features-list">{{tier2_features}}</ul>
      <a href="{{tier2_link}}" class="pricing-btn">Get Started</a>
    </div>
    <div class="pricing-card">
      <h3>{{tier3_name}}</h3>
      <div class="price"><span class="currency">$</span>{{tier3_price}}<span class="period">/mo</span></div>
      <p class="price-desc">{{tier3_description}}</p>
      <ul class="features-list">{{tier3_features}}</ul>
      <a href="{{tier3_link}}" class="pricing-btn">Get Started</a>
    </div>
  </div>
</section>',
    '.pricing-section { padding: 80px 20px; }
.pricing-header { text-align: center; margin-bottom: 60px; }
.pricing-header h2 { font-size: 2.25rem; color: #1a1a2e; }
.pricing-header p { color: #64748b; margin-top: 1rem; }
.pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; align-items: start; }
.pricing-card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; text-align: center; position: relative; }
.pricing-card.featured { border-color: #4f46e5; transform: scale(1.05); box-shadow: 0 20px 40px rgba(79,70,229,0.15); }
.popular-badge { position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: #4f46e5; color: white; padding: 6px 20px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
.pricing-card h3 { font-size: 1.5rem; color: #1a1a2e; margin-bottom: 1rem; }
.price { font-size: 3rem; font-weight: 700; color: #1a1a2e; }
.currency { font-size: 1.5rem; vertical-align: super; }
.period { font-size: 1rem; color: #64748b; font-weight: 400; }
.price-desc { color: #64748b; margin: 1rem 0; }
.features-list { list-style: none; padding: 0; margin: 24px 0; text-align: left; }
.features-list li { padding: 8px 0; color: #475569; border-bottom: 1px solid #f1f5f9; }
.pricing-btn { display: block; padding: 14px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
.pricing-card:not(.featured) .pricing-btn { background: white; color: #4f46e5; border: 2px solid #4f46e5; }
@media (max-width: 768px) { .pricing-grid { grid-template-columns: 1fr; } .pricing-card.featured { transform: none; } }',
    '[{"name": "section_title", "type": "text", "defaultValue": "Simple, Transparent Pricing", "placeholder": "Section title"},
     {"name": "section_subtitle", "type": "text", "defaultValue": "Choose the plan that works for you", "placeholder": "Section subtitle"},
     {"name": "tier1_name", "type": "text", "defaultValue": "Starter", "placeholder": "Tier 1 name"},
     {"name": "tier1_price", "type": "text", "defaultValue": "9", "placeholder": "Tier 1 price"},
     {"name": "tier1_description", "type": "text", "defaultValue": "Perfect for individuals", "placeholder": "Tier 1 description"},
     {"name": "tier1_features", "type": "text", "defaultValue": "<li>5 Projects</li><li>10GB Storage</li><li>Email Support</li>", "placeholder": "Tier 1 features (HTML list items)"},
     {"name": "tier1_link", "type": "link", "defaultValue": "#starter", "placeholder": "Tier 1 button URL"},
     {"name": "tier2_name", "type": "text", "defaultValue": "Professional", "placeholder": "Tier 2 name"},
     {"name": "tier2_price", "type": "text", "defaultValue": "29", "placeholder": "Tier 2 price"},
     {"name": "tier2_description", "type": "text", "defaultValue": "For growing teams", "placeholder": "Tier 2 description"},
     {"name": "tier2_features", "type": "text", "defaultValue": "<li>Unlimited Projects</li><li>100GB Storage</li><li>Priority Support</li><li>Analytics</li>", "placeholder": "Tier 2 features"},
     {"name": "tier2_link", "type": "link", "defaultValue": "#pro", "placeholder": "Tier 2 button URL"},
     {"name": "tier3_name", "type": "text", "defaultValue": "Enterprise", "placeholder": "Tier 3 name"},
     {"name": "tier3_price", "type": "text", "defaultValue": "99", "placeholder": "Tier 3 price"},
     {"name": "tier3_description", "type": "text", "defaultValue": "For large organizations", "placeholder": "Tier 3 description"},
     {"name": "tier3_features", "type": "text", "defaultValue": "<li>Everything in Pro</li><li>Unlimited Storage</li><li>Dedicated Support</li><li>Custom Integrations</li><li>SLA</li>", "placeholder": "Tier 3 features"},
     {"name": "tier3_link", "type": "link", "defaultValue": "#enterprise", "placeholder": "Tier 3 button URL"}]',
    TRUE, TRUE, ARRAY['pricing', 'table', 'tiers', 'plans']
),

-- Testimonial Templates
(
    'Testimonial Cards',
    'testimonial-cards',
    'Three testimonial cards with avatars and quotes',
    'testimonials',
    '<section class="testimonials-section">
  <h2>{{section_title}}</h2>
  <div class="testimonials-grid">
    <div class="testimonial-card">
      <p class="quote">"{{quote_1}}"</p>
      <div class="author">
        <img src="{{avatar_1}}" alt="{{name_1}}">
        <div>
          <strong>{{name_1}}</strong>
          <span>{{title_1}}</span>
        </div>
      </div>
    </div>
    <div class="testimonial-card">
      <p class="quote">"{{quote_2}}"</p>
      <div class="author">
        <img src="{{avatar_2}}" alt="{{name_2}}">
        <div>
          <strong>{{name_2}}</strong>
          <span>{{title_2}}</span>
        </div>
      </div>
    </div>
    <div class="testimonial-card">
      <p class="quote">"{{quote_3}}"</p>
      <div class="author">
        <img src="{{avatar_3}}" alt="{{name_3}}">
        <div>
          <strong>{{name_3}}</strong>
          <span>{{title_3}}</span>
        </div>
      </div>
    </div>
  </div>
</section>',
    '.testimonials-section { padding: 80px 20px; background: #f8fafc; text-align: center; }
.testimonials-section h2 { font-size: 2.25rem; color: #1a1a2e; margin-bottom: 48px; }
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
.testimonial-card { background: white; padding: 32px; border-radius: 12px; text-align: left; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
.quote { font-size: 1.1rem; color: #475569; line-height: 1.7; margin-bottom: 24px; font-style: italic; }
.author { display: flex; align-items: center; gap: 12px; }
.author img { width: 48px; height: 48px; border-radius: 50%; object-fit: cover; }
.author strong { display: block; color: #1a1a2e; }
.author span { color: #64748b; font-size: 0.9rem; }
@media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr; } }',
    '[{"name": "section_title", "type": "text", "defaultValue": "What Our Customers Say", "placeholder": "Section title"},
     {"name": "quote_1", "type": "text", "defaultValue": "This product has completely transformed how we work. Highly recommended!", "placeholder": "First quote"},
     {"name": "avatar_1", "type": "image", "defaultValue": "/images/avatar-1.jpg", "placeholder": "Avatar 1 URL"},
     {"name": "name_1", "type": "text", "defaultValue": "Sarah Johnson", "placeholder": "Name 1"},
     {"name": "title_1", "type": "text", "defaultValue": "CEO, TechCorp", "placeholder": "Title 1"},
     {"name": "quote_2", "type": "text", "defaultValue": "The best investment we have made for our team productivity.", "placeholder": "Second quote"},
     {"name": "avatar_2", "type": "image", "defaultValue": "/images/avatar-2.jpg", "placeholder": "Avatar 2 URL"},
     {"name": "name_2", "type": "text", "defaultValue": "Michael Chen", "placeholder": "Name 2"},
     {"name": "title_2", "type": "text", "defaultValue": "CTO, StartupXYZ", "placeholder": "Title 2"},
     {"name": "quote_3", "type": "text", "defaultValue": "Exceptional support and an incredibly intuitive interface.", "placeholder": "Third quote"},
     {"name": "avatar_3", "type": "image", "defaultValue": "/images/avatar-3.jpg", "placeholder": "Avatar 3 URL"},
     {"name": "name_3", "type": "text", "defaultValue": "Emily Davis", "placeholder": "Name 3"},
     {"name": "title_3", "type": "text", "defaultValue": "Product Manager, BigCo", "placeholder": "Title 3"}]',
    TRUE, TRUE, ARRAY['testimonials', 'reviews', 'quotes', 'social-proof']
),

-- CTA Templates
(
    'Simple CTA Banner',
    'simple-cta-banner',
    'Clean call-to-action banner with headline and button',
    'cta',
    '<section class="cta-banner">
  <div class="cta-content">
    <h2>{{headline}}</h2>
    <p>{{subheadline}}</p>
    <a href="{{cta_link}}" class="cta-button">{{cta_text}}</a>
  </div>
</section>',
    '.cta-banner { padding: 80px 20px; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); text-align: center; }
.cta-content { max-width: 700px; margin: 0 auto; color: white; }
.cta-content h2 { font-size: 2.5rem; margin-bottom: 1rem; }
.cta-content p { font-size: 1.2rem; opacity: 0.9; margin-bottom: 2rem; }
.cta-button { display: inline-block; padding: 16px 40px; background: white; color: #4f46e5; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 1.1rem; transition: transform 0.2s, box-shadow 0.2s; }
.cta-button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }',
    '[{"name": "headline", "type": "text", "defaultValue": "Ready to Get Started?", "placeholder": "Main headline"},
     {"name": "subheadline", "type": "text", "defaultValue": "Join thousands of satisfied customers and transform your business today.", "placeholder": "Supporting text"},
     {"name": "cta_link", "type": "link", "defaultValue": "#signup", "placeholder": "Button URL"},
     {"name": "cta_text", "type": "text", "defaultValue": "Start Your Free Trial", "placeholder": "Button text"}]',
    TRUE, TRUE, ARRAY['cta', 'banner', 'conversion', 'gradient']
),

-- Contact Templates
(
    'Contact Form Section',
    'contact-form-section',
    'Contact section with form and contact information',
    'contact',
    '<section class="contact-section">
  <div class="contact-grid">
    <div class="contact-info">
      <h2>{{section_title}}</h2>
      <p>{{section_description}}</p>
      <div class="contact-details">
        <div class="contact-item">
          <span class="icon">📧</span>
          <span>{{email}}</span>
        </div>
        <div class="contact-item">
          <span class="icon">📞</span>
          <span>{{phone}}</span>
        </div>
        <div class="contact-item">
          <span class="icon">📍</span>
          <span>{{address}}</span>
        </div>
      </div>
    </div>
    <div class="contact-form">
      <form action="{{form_action}}" method="POST">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
        <div class="form-group">
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="5" required></textarea>
        </div>
        <button type="submit">{{submit_text}}</button>
      </form>
    </div>
  </div>
</section>',
    '.contact-section { padding: 80px 20px; }
.contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; max-width: 1100px; margin: 0 auto; }
.contact-info h2 { font-size: 2rem; color: #1a1a2e; margin-bottom: 1rem; }
.contact-info > p { color: #64748b; margin-bottom: 2rem; line-height: 1.7; }
.contact-details { display: flex; flex-direction: column; gap: 16px; }
.contact-item { display: flex; align-items: center; gap: 12px; color: #475569; }
.contact-item .icon { font-size: 1.5rem; }
.contact-form form { display: flex; flex-direction: column; gap: 20px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-weight: 500; color: #475569; }
.form-group input, .form-group textarea { padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 1rem; }
.form-group input:focus, .form-group textarea:focus { outline: none; border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,0.1); }
.contact-form button { padding: 14px 28px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; }
@media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }',
    '[{"name": "section_title", "type": "text", "defaultValue": "Get in Touch", "placeholder": "Section title"},
     {"name": "section_description", "type": "text", "defaultValue": "Have questions? Wed love to hear from you. Send us a message and well respond as soon as possible.", "placeholder": "Description"},
     {"name": "email", "type": "text", "defaultValue": "hello@example.com", "placeholder": "Contact email"},
     {"name": "phone", "type": "text", "defaultValue": "+1 (555) 123-4567", "placeholder": "Contact phone"},
     {"name": "address", "type": "text", "defaultValue": "123 Main Street, City, State 12345", "placeholder": "Address"},
     {"name": "form_action", "type": "link", "defaultValue": "/api/contact", "placeholder": "Form action URL"},
     {"name": "submit_text", "type": "text", "defaultValue": "Send Message", "placeholder": "Submit button text"}]',
    TRUE, TRUE, ARRAY['contact', 'form', 'information', 'two-column']
),

-- Newsletter Templates
(
    'Newsletter Signup',
    'newsletter-signup',
    'Simple newsletter signup section with email input',
    'newsletter',
    '<section class="newsletter-section">
  <div class="newsletter-content">
    <h2>{{title}}</h2>
    <p>{{description}}</p>
    <form class="newsletter-form" action="{{form_action}}" method="POST">
      <input type="email" name="email" placeholder="{{placeholder}}" required>
      <button type="submit">{{button_text}}</button>
    </form>
    <p class="privacy-note">{{privacy_text}}</p>
  </div>
</section>',
    '.newsletter-section { padding: 60px 20px; background: #1a1a2e; text-align: center; }
.newsletter-content { max-width: 500px; margin: 0 auto; color: white; }
.newsletter-content h2 { font-size: 1.75rem; margin-bottom: 0.75rem; }
.newsletter-content > p { opacity: 0.8; margin-bottom: 1.5rem; }
.newsletter-form { display: flex; gap: 12px; }
.newsletter-form input { flex: 1; padding: 14px 18px; border: none; border-radius: 8px; font-size: 1rem; }
.newsletter-form button { padding: 14px 24px; background: #4f46e5; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.privacy-note { font-size: 0.85rem; opacity: 0.6; margin-top: 1rem; }
@media (max-width: 480px) { .newsletter-form { flex-direction: column; } }',
    '[{"name": "title", "type": "text", "defaultValue": "Stay Updated", "placeholder": "Section title"},
     {"name": "description", "type": "text", "defaultValue": "Subscribe to our newsletter for the latest updates and insights.", "placeholder": "Description"},
     {"name": "form_action", "type": "link", "defaultValue": "/api/subscribe", "placeholder": "Form action URL"},
     {"name": "placeholder", "type": "text", "defaultValue": "Enter your email", "placeholder": "Input placeholder"},
     {"name": "button_text", "type": "text", "defaultValue": "Subscribe", "placeholder": "Button text"},
     {"name": "privacy_text", "type": "text", "defaultValue": "We respect your privacy. Unsubscribe at any time.", "placeholder": "Privacy note"}]',
    TRUE, TRUE, ARRAY['newsletter', 'email', 'subscription', 'signup']
),

-- FAQ Templates
(
    'FAQ Accordion',
    'faq-accordion',
    'Expandable FAQ section with accordion items',
    'faq',
    '<section class="faq-section">
  <h2>{{section_title}}</h2>
  <div class="faq-list">
    <details class="faq-item">
      <summary>{{question_1}}</summary>
      <p>{{answer_1}}</p>
    </details>
    <details class="faq-item">
      <summary>{{question_2}}</summary>
      <p>{{answer_2}}</p>
    </details>
    <details class="faq-item">
      <summary>{{question_3}}</summary>
      <p>{{answer_3}}</p>
    </details>
    <details class="faq-item">
      <summary>{{question_4}}</summary>
      <p>{{answer_4}}</p>
    </details>
  </div>
</section>',
    '.faq-section { padding: 80px 20px; max-width: 800px; margin: 0 auto; }
.faq-section h2 { text-align: center; font-size: 2.25rem; color: #1a1a2e; margin-bottom: 48px; }
.faq-list { display: flex; flex-direction: column; gap: 12px; }
.faq-item { background: white; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.faq-item summary { padding: 20px 24px; font-weight: 600; color: #1a1a2e; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: "+"; font-size: 1.5rem; color: #4f46e5; }
.faq-item[open] summary::after { content: "-"; }
.faq-item p { padding: 0 24px 20px; color: #64748b; line-height: 1.7; margin: 0; }',
    '[{"name": "section_title", "type": "text", "defaultValue": "Frequently Asked Questions", "placeholder": "Section title"},
     {"name": "question_1", "type": "text", "defaultValue": "What is your refund policy?", "placeholder": "Question 1"},
     {"name": "answer_1", "type": "text", "defaultValue": "We offer a 30-day money-back guarantee. If you are not satisfied, contact our support team for a full refund.", "placeholder": "Answer 1"},
     {"name": "question_2", "type": "text", "defaultValue": "How do I get started?", "placeholder": "Question 2"},
     {"name": "answer_2", "type": "text", "defaultValue": "Simply sign up for an account, choose your plan, and follow the onboarding steps. You will be up and running in minutes.", "placeholder": "Answer 2"},
     {"name": "question_3", "type": "text", "defaultValue": "Do you offer customer support?", "placeholder": "Question 3"},
     {"name": "answer_3", "type": "text", "defaultValue": "Yes! We offer 24/7 customer support via email and live chat. Premium plans include priority phone support.", "placeholder": "Answer 3"},
     {"name": "question_4", "type": "text", "defaultValue": "Can I upgrade my plan later?", "placeholder": "Question 4"},
     {"name": "answer_4", "type": "text", "defaultValue": "Absolutely! You can upgrade or downgrade your plan at any time from your account settings.", "placeholder": "Answer 4"}]',
    TRUE, TRUE, ARRAY['faq', 'accordion', 'questions', 'support']
),

-- Footer Templates
(
    'Multi-Column Footer',
    'multi-column-footer',
    'Footer with logo, links columns, and social media',
    'footer',
    '<footer class="site-footer">
  <div class="footer-grid">
    <div class="footer-brand">
      <h3>{{company_name}}</h3>
      <p>{{company_description}}</p>
      <div class="social-links">
        <a href="{{twitter_link}}" aria-label="Twitter">🐦</a>
        <a href="{{facebook_link}}" aria-label="Facebook">📘</a>
        <a href="{{linkedin_link}}" aria-label="LinkedIn">💼</a>
        <a href="{{instagram_link}}" aria-label="Instagram">📷</a>
      </div>
    </div>
    <div class="footer-links">
      <h4>Product</h4>
      <ul>
        <li><a href="{{link_features}}">Features</a></li>
        <li><a href="{{link_pricing}}">Pricing</a></li>
        <li><a href="{{link_integrations}}">Integrations</a></li>
        <li><a href="{{link_changelog}}">Changelog</a></li>
      </ul>
    </div>
    <div class="footer-links">
      <h4>Company</h4>
      <ul>
        <li><a href="{{link_about}}">About</a></li>
        <li><a href="{{link_blog}}">Blog</a></li>
        <li><a href="{{link_careers}}">Careers</a></li>
        <li><a href="{{link_contact}}">Contact</a></li>
      </ul>
    </div>
    <div class="footer-links">
      <h4>Legal</h4>
      <ul>
        <li><a href="{{link_privacy}}">Privacy Policy</a></li>
        <li><a href="{{link_terms}}">Terms of Service</a></li>
        <li><a href="{{link_cookies}}">Cookie Policy</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <p>{{copyright}}</p>
  </div>
</footer>',
    '.site-footer { background: #1a1a2e; color: white; padding: 60px 20px 30px; }
.footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 40px; max-width: 1100px; margin: 0 auto; }
.footer-brand h3 { font-size: 1.5rem; margin-bottom: 1rem; }
.footer-brand p { opacity: 0.7; line-height: 1.6; margin-bottom: 1.5rem; }
.social-links { display: flex; gap: 12px; }
.social-links a { font-size: 1.25rem; opacity: 0.8; text-decoration: none; }
.social-links a:hover { opacity: 1; }
.footer-links h4 { font-size: 1rem; margin-bottom: 1rem; color: white; }
.footer-links ul { list-style: none; padding: 0; margin: 0; }
.footer-links li { margin-bottom: 8px; }
.footer-links a { color: rgba(255,255,255,0.7); text-decoration: none; }
.footer-links a:hover { color: white; }
.footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); margin-top: 40px; padding-top: 20px; text-align: center; max-width: 1100px; margin-left: auto; margin-right: auto; }
.footer-bottom p { opacity: 0.6; font-size: 0.9rem; }
@media (max-width: 768px) { .footer-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 480px) { .footer-grid { grid-template-columns: 1fr; } }',
    '[{"name": "company_name", "type": "text", "defaultValue": "Company Name", "placeholder": "Your company name"},
     {"name": "company_description", "type": "text", "defaultValue": "Building the future of digital experiences with innovative solutions.", "placeholder": "Company description"},
     {"name": "twitter_link", "type": "link", "defaultValue": "https://twitter.com", "placeholder": "Twitter URL"},
     {"name": "facebook_link", "type": "link", "defaultValue": "https://facebook.com", "placeholder": "Facebook URL"},
     {"name": "linkedin_link", "type": "link", "defaultValue": "https://linkedin.com", "placeholder": "LinkedIn URL"},
     {"name": "instagram_link", "type": "link", "defaultValue": "https://instagram.com", "placeholder": "Instagram URL"},
     {"name": "link_features", "type": "link", "defaultValue": "/features", "placeholder": "Features link"},
     {"name": "link_pricing", "type": "link", "defaultValue": "/pricing", "placeholder": "Pricing link"},
     {"name": "link_integrations", "type": "link", "defaultValue": "/integrations", "placeholder": "Integrations link"},
     {"name": "link_changelog", "type": "link", "defaultValue": "/changelog", "placeholder": "Changelog link"},
     {"name": "link_about", "type": "link", "defaultValue": "/about", "placeholder": "About link"},
     {"name": "link_blog", "type": "link", "defaultValue": "/blog", "placeholder": "Blog link"},
     {"name": "link_careers", "type": "link", "defaultValue": "/careers", "placeholder": "Careers link"},
     {"name": "link_contact", "type": "link", "defaultValue": "/contact", "placeholder": "Contact link"},
     {"name": "link_privacy", "type": "link", "defaultValue": "/privacy", "placeholder": "Privacy link"},
     {"name": "link_terms", "type": "link", "defaultValue": "/terms", "placeholder": "Terms link"},
     {"name": "link_cookies", "type": "link", "defaultValue": "/cookies", "placeholder": "Cookies link"},
     {"name": "copyright", "type": "text", "defaultValue": "© 2024 Company Name. All rights reserved.", "placeholder": "Copyright text"}]',
    TRUE, TRUE, ARRAY['footer', 'links', 'social', 'multi-column']
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    html_content = EXCLUDED.html_content,
    css_content = EXCLUDED.css_content,
    variables = EXCLUDED.variables,
    updated_at = NOW();

-- Create function to update template rating
CREATE OR REPLACE FUNCTION update_template_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE templates
        SET rating_sum = rating_sum + NEW.rating,
            rating_count = rating_count + 1,
            updated_at = NOW()
        WHERE id = NEW.template_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE templates
        SET rating_sum = rating_sum - OLD.rating + NEW.rating,
            updated_at = NOW()
        WHERE id = NEW.template_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE templates
        SET rating_sum = rating_sum - OLD.rating,
            rating_count = rating_count - 1,
            updated_at = NOW()
        WHERE id = OLD.template_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_template_rating ON template_ratings;
CREATE TRIGGER trigger_update_template_rating
    AFTER INSERT OR UPDATE OR DELETE ON template_ratings
    FOR EACH ROW EXECUTE FUNCTION update_template_rating();

-- Create function to increment download count
CREATE OR REPLACE FUNCTION increment_template_downloads()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.action = 'insert' OR NEW.action = 'download' THEN
        UPDATE templates
        SET downloads = downloads + 1,
            updated_at = NOW()
        WHERE id = NEW.template_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for download tracking
DROP TRIGGER IF EXISTS trigger_increment_template_downloads ON template_usage;
CREATE TRIGGER trigger_increment_template_downloads
    AFTER INSERT ON template_usage
    FOR EACH ROW EXECUTE FUNCTION increment_template_downloads();
