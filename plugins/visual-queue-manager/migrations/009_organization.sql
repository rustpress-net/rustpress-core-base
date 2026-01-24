-- =============================================================================
-- Migration 009: Organization (Tags, Groups, Saved Filters)
-- =============================================================================
-- Visual Queue Manager - Organization and management features
--
-- This migration creates tables for:
-- - Queue tags for categorization
-- - Queue groups/folders for hierarchy
-- - Saved filters for quick access
-- - User preferences
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tags Table
-- -----------------------------------------------------------------------------
-- Reusable tags for organizing queues and other entities

CREATE TABLE IF NOT EXISTS vqm_tags (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Tag identification
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Visual styling
    color VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT NULL,
    background_color VARCHAR(7) DEFAULT NULL,

    -- Usage tracking
    usage_count INTEGER NOT NULL DEFAULT 0,

    -- Status
    is_system BOOLEAN NOT NULL DEFAULT false,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT vqm_tags_name_unique UNIQUE (name),
    CONSTRAINT vqm_tags_slug_unique UNIQUE (slug),
    CONSTRAINT vqm_tags_valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- -----------------------------------------------------------------------------
-- Queue Tags Junction Table
-- -----------------------------------------------------------------------------
-- Many-to-many relationship between queues and tags

CREATE TABLE IF NOT EXISTS vqm_queue_tags (
    -- Composite primary key
    queue_id UUID NOT NULL REFERENCES vqm_queues(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES vqm_tags(id) ON DELETE CASCADE,

    -- Assignment metadata
    assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID DEFAULT NULL,

    -- Primary key
    PRIMARY KEY (queue_id, tag_id)
);

-- -----------------------------------------------------------------------------
-- Queue Groups Table
-- -----------------------------------------------------------------------------
-- Hierarchical folders/groups for organizing queues

CREATE TABLE IF NOT EXISTS vqm_queue_groups (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Group identification
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Hierarchy
    parent_id UUID REFERENCES vqm_queue_groups(id) ON DELETE CASCADE,
    path TEXT NOT NULL DEFAULT '/',
    depth INTEGER NOT NULL DEFAULT 0,

    -- Visual styling
    icon VARCHAR(50) DEFAULT NULL,
    color VARCHAR(7) DEFAULT NULL,

    -- Ordering
    display_order INTEGER NOT NULL DEFAULT 0,

    -- Status
    is_expanded BOOLEAN NOT NULL DEFAULT true,
    is_system BOOLEAN NOT NULL DEFAULT false,

    -- Statistics (cached)
    queue_count INTEGER NOT NULL DEFAULT 0,
    child_group_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Audit
    created_by UUID DEFAULT NULL,

    -- Constraints
    CONSTRAINT vqm_groups_slug_unique UNIQUE (parent_id, slug),
    CONSTRAINT vqm_groups_no_self_parent CHECK (id != parent_id),
    CONSTRAINT vqm_groups_valid_depth CHECK (depth >= 0 AND depth <= 10)
);

-- Add group_id to queues table if not exists (from migration 001)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vqm_queues' AND column_name = 'group_id'
    ) THEN
        ALTER TABLE vqm_queues ADD COLUMN group_id UUID REFERENCES vqm_queue_groups(id) ON DELETE SET NULL;
        CREATE INDEX idx_vqm_queues_group ON vqm_queues(group_id) WHERE group_id IS NOT NULL;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- Saved Filters Table
-- -----------------------------------------------------------------------------
-- Save and share filter configurations

CREATE TABLE IF NOT EXISTS vqm_saved_filters (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Filter identification
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Scope
    filter_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL DEFAULT 'message',

    -- Filter configuration
    filter_config JSONB NOT NULL,
    sort_config JSONB DEFAULT NULL,
    column_config JSONB DEFAULT NULL,

    -- Visibility
    is_public BOOLEAN NOT NULL DEFAULT false,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_pinned BOOLEAN NOT NULL DEFAULT false,

    -- Usage tracking
    usage_count BIGINT NOT NULL DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

    -- Ownership
    created_by UUID NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Constraints
    CONSTRAINT vqm_filters_valid_type CHECK (
        filter_type IN ('quick', 'advanced', 'saved_search', 'dashboard')
    ),
    CONSTRAINT vqm_filters_valid_entity CHECK (
        entity_type IN ('message', 'queue', 'worker', 'job', 'audit', 'handler')
    )
);

-- -----------------------------------------------------------------------------
-- User Preferences Table
-- -----------------------------------------------------------------------------
-- Store user-specific preferences and settings

CREATE TABLE IF NOT EXISTS vqm_user_preferences (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User reference
    user_id UUID NOT NULL,

    -- Preference category
    category VARCHAR(100) NOT NULL,
    preference_key VARCHAR(255) NOT NULL,

    -- Value
    preference_value JSONB NOT NULL,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT vqm_prefs_unique UNIQUE (user_id, category, preference_key)
);

-- -----------------------------------------------------------------------------
-- Dashboard Layouts Table
-- -----------------------------------------------------------------------------
-- Store custom dashboard configurations

CREATE TABLE IF NOT EXISTS vqm_dashboard_layouts (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Layout identification
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,

    -- Layout configuration
    layout_config JSONB NOT NULL,
    widgets JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Visibility
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT false,

    -- Ownership
    created_by UUID NOT NULL,

    -- Usage
    usage_count INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- -----------------------------------------------------------------------------
-- Recent Items Table
-- -----------------------------------------------------------------------------
-- Track recently accessed items for quick access

CREATE TABLE IF NOT EXISTS vqm_recent_items (
    -- Primary identifier
    id BIGSERIAL PRIMARY KEY,

    -- User reference
    user_id UUID NOT NULL,

    -- Item reference
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,
    item_name VARCHAR(255) DEFAULT NULL,

    -- Access tracking
    accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER NOT NULL DEFAULT 1,

    -- Constraints
    CONSTRAINT vqm_recent_valid_type CHECK (
        item_type IN ('queue', 'message', 'worker', 'scheduled_job', 'subscription', 'handler', 'filter', 'dashboard')
    )
);

-- -----------------------------------------------------------------------------
-- Favorites Table
-- -----------------------------------------------------------------------------
-- User favorites for quick access

CREATE TABLE IF NOT EXISTS vqm_favorites (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User reference
    user_id UUID NOT NULL,

    -- Item reference
    item_type VARCHAR(50) NOT NULL,
    item_id UUID NOT NULL,

    -- Display
    display_name VARCHAR(255) DEFAULT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT vqm_favorites_unique UNIQUE (user_id, item_type, item_id),
    CONSTRAINT vqm_favorites_valid_type CHECK (
        item_type IN ('queue', 'scheduled_job', 'subscription', 'handler', 'filter', 'dashboard', 'group')
    )
);

-- -----------------------------------------------------------------------------
-- Indexes for Tags
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_tags_name
    ON vqm_tags(name);

CREATE INDEX IF NOT EXISTS idx_vqm_tags_slug
    ON vqm_tags(slug);

CREATE INDEX IF NOT EXISTS idx_vqm_tags_usage
    ON vqm_tags(usage_count DESC);

-- -----------------------------------------------------------------------------
-- Indexes for Queue Tags
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_queue_tags_queue
    ON vqm_queue_tags(queue_id);

CREATE INDEX IF NOT EXISTS idx_vqm_queue_tags_tag
    ON vqm_queue_tags(tag_id);

-- -----------------------------------------------------------------------------
-- Indexes for Queue Groups
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_groups_parent
    ON vqm_queue_groups(parent_id);

CREATE INDEX IF NOT EXISTS idx_vqm_groups_path
    ON vqm_queue_groups(path);

CREATE INDEX IF NOT EXISTS idx_vqm_groups_order
    ON vqm_queue_groups(parent_id, display_order);

CREATE INDEX IF NOT EXISTS idx_vqm_groups_slug
    ON vqm_queue_groups(slug);

-- -----------------------------------------------------------------------------
-- Indexes for Saved Filters
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_filters_user
    ON vqm_saved_filters(created_by);

CREATE INDEX IF NOT EXISTS idx_vqm_filters_public
    ON vqm_saved_filters(is_public)
    WHERE is_public = true;

CREATE INDEX IF NOT EXISTS idx_vqm_filters_type
    ON vqm_saved_filters(entity_type, filter_type);

CREATE INDEX IF NOT EXISTS idx_vqm_filters_pinned
    ON vqm_saved_filters(created_by, is_pinned)
    WHERE is_pinned = true;

-- -----------------------------------------------------------------------------
-- Indexes for User Preferences
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_prefs_user
    ON vqm_user_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_vqm_prefs_category
    ON vqm_user_preferences(user_id, category);

-- -----------------------------------------------------------------------------
-- Indexes for Dashboard Layouts
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_layouts_user
    ON vqm_dashboard_layouts(created_by);

CREATE INDEX IF NOT EXISTS idx_vqm_layouts_default
    ON vqm_dashboard_layouts(is_default)
    WHERE is_default = true;

CREATE INDEX IF NOT EXISTS idx_vqm_layouts_public
    ON vqm_dashboard_layouts(is_public)
    WHERE is_public = true;

-- -----------------------------------------------------------------------------
-- Indexes for Recent Items
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_recent_user
    ON vqm_recent_items(user_id, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_vqm_recent_user_type
    ON vqm_recent_items(user_id, item_type, accessed_at DESC);

-- Clean up old entries (keep only recent 100 per user)
CREATE INDEX IF NOT EXISTS idx_vqm_recent_cleanup
    ON vqm_recent_items(user_id, accessed_at);

-- -----------------------------------------------------------------------------
-- Indexes for Favorites
-- -----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_vqm_favorites_user
    ON vqm_favorites(user_id, display_order);

CREATE INDEX IF NOT EXISTS idx_vqm_favorites_user_type
    ON vqm_favorites(user_id, item_type, display_order);

-- -----------------------------------------------------------------------------
-- Triggers
-- -----------------------------------------------------------------------------

CREATE TRIGGER vqm_tags_update_timestamp
    BEFORE UPDATE ON vqm_tags
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

CREATE TRIGGER vqm_groups_update_timestamp
    BEFORE UPDATE ON vqm_queue_groups
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

CREATE TRIGGER vqm_filters_update_timestamp
    BEFORE UPDATE ON vqm_saved_filters
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

CREATE TRIGGER vqm_prefs_update_timestamp
    BEFORE UPDATE ON vqm_user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

CREATE TRIGGER vqm_layouts_update_timestamp
    BEFORE UPDATE ON vqm_dashboard_layouts
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_timestamp();

-- Update tag usage count
CREATE OR REPLACE FUNCTION vqm_update_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE vqm_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE vqm_tags SET usage_count = GREATEST(0, usage_count - 1) WHERE id = OLD.tag_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_queue_tags_usage
    AFTER INSERT OR DELETE ON vqm_queue_tags
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_tag_usage();

-- Update group path and depth
CREATE OR REPLACE FUNCTION vqm_update_group_path()
RETURNS TRIGGER AS $$
DECLARE
    parent_path TEXT;
    parent_depth INTEGER;
BEGIN
    IF NEW.parent_id IS NULL THEN
        NEW.path = '/' || NEW.id::TEXT || '/';
        NEW.depth = 0;
    ELSE
        SELECT path, depth INTO parent_path, parent_depth
        FROM vqm_queue_groups WHERE id = NEW.parent_id;

        NEW.path = parent_path || NEW.id::TEXT || '/';
        NEW.depth = parent_depth + 1;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_groups_update_path
    BEFORE INSERT OR UPDATE OF parent_id ON vqm_queue_groups
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_group_path();

-- Update group statistics
CREATE OR REPLACE FUNCTION vqm_update_group_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update queue count for affected groups
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        IF NEW.group_id IS NOT NULL THEN
            UPDATE vqm_queue_groups
            SET queue_count = (SELECT COUNT(*) FROM vqm_queues WHERE group_id = NEW.group_id)
            WHERE id = NEW.group_id;
        END IF;
    END IF;

    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        IF OLD.group_id IS NOT NULL AND (TG_OP = 'DELETE' OR OLD.group_id != NEW.group_id) THEN
            UPDATE vqm_queue_groups
            SET queue_count = (SELECT COUNT(*) FROM vqm_queues WHERE group_id = OLD.group_id)
            WHERE id = OLD.group_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vqm_queues_update_group_stats
    AFTER INSERT OR UPDATE OF group_id OR DELETE ON vqm_queues
    FOR EACH ROW
    EXECUTE FUNCTION vqm_update_group_stats();

-- -----------------------------------------------------------------------------
-- Functions
-- -----------------------------------------------------------------------------

-- Get or create a tag by name
CREATE OR REPLACE FUNCTION vqm_get_or_create_tag(p_name VARCHAR(100), p_color VARCHAR(7) DEFAULT '#6366f1')
RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_slug VARCHAR(100);
BEGIN
    -- Generate slug
    v_slug := lower(regexp_replace(p_name, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);

    -- Try to find existing
    SELECT id INTO v_id FROM vqm_tags WHERE name = p_name OR slug = v_slug;

    IF v_id IS NULL THEN
        INSERT INTO vqm_tags (name, slug, color)
        VALUES (p_name, v_slug, p_color)
        RETURNING id INTO v_id;
    END IF;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Get group tree
CREATE OR REPLACE FUNCTION vqm_get_group_tree(p_parent_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    parent_id UUID,
    path TEXT,
    depth INTEGER,
    queue_count INTEGER,
    child_group_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE group_tree AS (
        -- Base case: root groups or specified parent's children
        SELECT
            g.id, g.name, g.parent_id, g.path, g.depth,
            g.queue_count, g.child_group_count, g.display_order
        FROM vqm_queue_groups g
        WHERE (p_parent_id IS NULL AND g.parent_id IS NULL)
           OR g.parent_id = p_parent_id

        UNION ALL

        -- Recursive case: children of current level
        SELECT
            g.id, g.name, g.parent_id, g.path, g.depth,
            g.queue_count, g.child_group_count, g.display_order
        FROM vqm_queue_groups g
        JOIN group_tree gt ON g.parent_id = gt.id
    )
    SELECT
        gt.id, gt.name, gt.parent_id, gt.path, gt.depth,
        gt.queue_count, gt.child_group_count
    FROM group_tree gt
    ORDER BY gt.path, gt.display_order;
END;
$$ LANGUAGE plpgsql;

-- Track recent item access
CREATE OR REPLACE FUNCTION vqm_track_recent_access(
    p_user_id UUID,
    p_item_type VARCHAR(50),
    p_item_id UUID,
    p_item_name VARCHAR(255) DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO vqm_recent_items (user_id, item_type, item_id, item_name, accessed_at, access_count)
    VALUES (p_user_id, p_item_type, p_item_id, p_item_name, CURRENT_TIMESTAMP, 1)
    ON CONFLICT (user_id, item_type, item_id) DO UPDATE
    SET
        accessed_at = CURRENT_TIMESTAMP,
        access_count = vqm_recent_items.access_count + 1,
        item_name = COALESCE(EXCLUDED.item_name, vqm_recent_items.item_name);

    -- Clean up old entries (keep only 100 most recent per user)
    DELETE FROM vqm_recent_items
    WHERE user_id = p_user_id
      AND id NOT IN (
          SELECT id FROM vqm_recent_items
          WHERE user_id = p_user_id
          ORDER BY accessed_at DESC
          LIMIT 100
      );
END;
$$ LANGUAGE plpgsql;

-- Get user preference
CREATE OR REPLACE FUNCTION vqm_get_preference(
    p_user_id UUID,
    p_category VARCHAR(100),
    p_key VARCHAR(255),
    p_default JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_value JSONB;
BEGIN
    SELECT preference_value INTO v_value
    FROM vqm_user_preferences
    WHERE user_id = p_user_id
      AND category = p_category
      AND preference_key = p_key;

    RETURN COALESCE(v_value, p_default);
END;
$$ LANGUAGE plpgsql;

-- Set user preference
CREATE OR REPLACE FUNCTION vqm_set_preference(
    p_user_id UUID,
    p_category VARCHAR(100),
    p_key VARCHAR(255),
    p_value JSONB
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO vqm_user_preferences (user_id, category, preference_key, preference_value)
    VALUES (p_user_id, p_category, p_key, p_value)
    ON CONFLICT (user_id, category, preference_key)
    DO UPDATE SET
        preference_value = EXCLUDED.preference_value,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- Default Data
-- -----------------------------------------------------------------------------

-- Insert default tags
INSERT INTO vqm_tags (name, slug, color, is_system) VALUES
    ('Production', 'production', '#EF4444', true),
    ('Staging', 'staging', '#F59E0B', true),
    ('Development', 'development', '#10B981', true),
    ('High Priority', 'high-priority', '#DC2626', true),
    ('Low Priority', 'low-priority', '#6B7280', true),
    ('Critical', 'critical', '#7C3AED', true),
    ('Batch', 'batch', '#3B82F6', true),
    ('Real-time', 'real-time', '#EC4899', true),
    ('Deprecated', 'deprecated', '#9CA3AF', true)
ON CONFLICT (name) DO NOTHING;

-- Insert default root group
INSERT INTO vqm_queue_groups (id, name, slug, description, is_system) VALUES
    ('00000000-0000-0000-0000-000000000001', 'All Queues', 'all-queues', 'Root group containing all queues', true)
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------

COMMENT ON TABLE vqm_tags IS 'Reusable tags for organizing queues and entities';
COMMENT ON TABLE vqm_queue_tags IS 'Many-to-many relationship between queues and tags';
COMMENT ON TABLE vqm_queue_groups IS 'Hierarchical groups for organizing queues';
COMMENT ON TABLE vqm_saved_filters IS 'User-saved filter configurations';
COMMENT ON TABLE vqm_user_preferences IS 'User-specific preferences and settings';
COMMENT ON TABLE vqm_dashboard_layouts IS 'Custom dashboard layout configurations';
COMMENT ON TABLE vqm_recent_items IS 'Track recently accessed items per user';
COMMENT ON TABLE vqm_favorites IS 'User favorites for quick access';
COMMENT ON FUNCTION vqm_get_or_create_tag IS 'Get existing tag by name or create a new one';
COMMENT ON FUNCTION vqm_get_group_tree IS 'Get hierarchical group structure as a tree';
COMMENT ON FUNCTION vqm_track_recent_access IS 'Track user access to items for recent items list';
COMMENT ON FUNCTION vqm_get_preference IS 'Get a user preference value with optional default';
COMMENT ON FUNCTION vqm_set_preference IS 'Set a user preference value (upsert)';
