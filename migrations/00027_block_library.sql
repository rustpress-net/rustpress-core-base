-- Block Library Migration
-- Adds tables for user block preferences and custom blocks

-- User Block Preferences table - stores user's recently used and favorite blocks
CREATE TABLE IF NOT EXISTS user_block_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recent_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    favorite_blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
    block_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_user_block_preferences_user_id ON user_block_preferences(user_id);

-- Custom Blocks table - stores user-created reusable blocks
CREATE TABLE IF NOT EXISTS custom_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'custom',
    icon VARCHAR(50) NOT NULL DEFAULT 'Box',
    content TEXT NOT NULL,
    preview_html TEXT,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_global BOOLEAN NOT NULL DEFAULT FALSE,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for custom blocks
CREATE INDEX IF NOT EXISTS idx_custom_blocks_user_id ON custom_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_category ON custom_blocks(category);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_is_global ON custom_blocks(is_global);
CREATE INDEX IF NOT EXISTS idx_custom_blocks_name ON custom_blocks(name);

-- Block Library Categories table - for organizing blocks
CREATE TABLE IF NOT EXISTS block_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_block_categories_slug ON block_categories(slug);
CREATE INDEX IF NOT EXISTS idx_block_categories_sort_order ON block_categories(sort_order);

-- Insert default block categories
INSERT INTO block_categories (name, slug, description, icon, sort_order, is_system) VALUES
    ('Text', 'text', 'Text-based content blocks', 'Type', 1, TRUE),
    ('Media', 'media', 'Image, video, and audio blocks', 'Image', 2, TRUE),
    ('Layout', 'layout', 'Layout and structure blocks', 'Layout', 3, TRUE),
    ('Embed', 'embed', 'Embedded content from external sources', 'ExternalLink', 4, TRUE),
    ('Interactive', 'interactive', 'Interactive and dynamic blocks', 'MousePointer', 5, TRUE),
    ('Custom', 'custom', 'User-created custom blocks', 'Box', 6, TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Block Usage Analytics table - tracks block usage for analytics
CREATE TABLE IF NOT EXISTS block_usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    block_id VARCHAR(100) NOT NULL,
    block_type VARCHAR(50) NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL DEFAULT 'insert',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_block_usage_user_id ON block_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_block_usage_block_id ON block_usage_analytics(block_id);
CREATE INDEX IF NOT EXISTS idx_block_usage_block_type ON block_usage_analytics(block_type);
CREATE INDEX IF NOT EXISTS idx_block_usage_created_at ON block_usage_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_block_usage_action ON block_usage_analytics(action);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_block_tables_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for auto-updating timestamps
DROP TRIGGER IF EXISTS trigger_user_block_preferences_updated_at ON user_block_preferences;
CREATE TRIGGER trigger_user_block_preferences_updated_at
    BEFORE UPDATE ON user_block_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_block_tables_timestamp();

DROP TRIGGER IF EXISTS trigger_custom_blocks_updated_at ON custom_blocks;
CREATE TRIGGER trigger_custom_blocks_updated_at
    BEFORE UPDATE ON custom_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_block_tables_timestamp();

DROP TRIGGER IF EXISTS trigger_block_categories_updated_at ON block_categories;
CREATE TRIGGER trigger_block_categories_updated_at
    BEFORE UPDATE ON block_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_block_tables_timestamp();
