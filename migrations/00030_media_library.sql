-- Migration: Media Library Enhancements
-- Tool 4: Enhanced Media Library with folders, optimization, and advanced features

-- ============================================
-- MEDIA FOLDERS TABLE
-- ============================================

-- Drop existing table if it exists (may have wrong schema from partial migration)
DROP TABLE IF EXISTS media_folders CASCADE;

CREATE TABLE media_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES media_folders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    color VARCHAR(7) DEFAULT '#6366f1',
    icon VARCHAR(50) DEFAULT 'folder',
    item_count INTEGER DEFAULT 0,
    total_size BIGINT DEFAULT 0,
    is_system BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(parent_id, slug)
);

-- ============================================
-- ENHANCE EXISTING MEDIA TABLE
-- ============================================

-- Add new columns to existing media table
ALTER TABLE media ADD COLUMN IF NOT EXISTS duration INTEGER;
ALTER TABLE media ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL;
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_optimized BOOLEAN DEFAULT FALSE;
ALTER TABLE media ADD COLUMN IF NOT EXISTS original_size BIGINT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS optimized_url TEXT;
ALTER TABLE media ADD COLUMN IF NOT EXISTS blurhash VARCHAR(100);
ALTER TABLE media ADD COLUMN IF NOT EXISTS dominant_color VARCHAR(7);
ALTER TABLE media ADD COLUMN IF NOT EXISTS focal_point_x DECIMAL(5,2) DEFAULT 50.00;
ALTER TABLE media ADD COLUMN IF NOT EXISTS focal_point_y DECIMAL(5,2) DEFAULT 50.00;
ALTER TABLE media ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE media ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE media ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE media ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- ============================================
-- MEDIA VARIANTS TABLE (for responsive images)
-- ============================================

CREATE TABLE IF NOT EXISTS media_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- 'thumbnail', 'small', 'medium', 'large', 'webp', 'avif'
    filename VARCHAR(500) NOT NULL,
    url TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size BIGINT,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MEDIA USAGE TRACKING TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS media_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL, -- 'post', 'page', 'comment', 'user_avatar', 'site_logo'
    entity_id UUID NOT NULL,
    context VARCHAR(100), -- 'content', 'featured_image', 'gallery', 'background'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(media_id, entity_type, entity_id, context)
);

-- ============================================
-- MEDIA OPTIMIZATION QUEUE TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS media_optimization_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    options JSONB DEFAULT '{}',
    result JSONB,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- USER MEDIA PREFERENCES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS user_media_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    default_folder_id UUID REFERENCES media_folders(id) ON DELETE SET NULL,
    view_mode VARCHAR(20) DEFAULT 'grid', -- 'grid', 'list'
    sort_by VARCHAR(50) DEFAULT 'created_at',
    sort_order VARCHAR(10) DEFAULT 'desc',
    items_per_page INTEGER DEFAULT 24,
    auto_optimize BOOLEAN DEFAULT TRUE,
    default_quality INTEGER DEFAULT 85,
    generate_thumbnails BOOLEAN DEFAULT TRUE,
    generate_webp BOOLEAN DEFAULT TRUE,
    max_upload_size BIGINT DEFAULT 10485760, -- 10MB default
    allowed_types TEXT[] DEFAULT ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'audio/mp3', 'audio/wav', 'application/pdf'],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_media_folders_parent_id ON media_folders(parent_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_user_id ON media_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_slug ON media_folders(slug);
CREATE INDEX IF NOT EXISTS idx_media_folder_id ON media(folder_id);
CREATE INDEX IF NOT EXISTS idx_media_tags ON media USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_is_favorite ON media(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_media_mime_type ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_variants_media_id ON media_variants(media_id);
CREATE INDEX IF NOT EXISTS idx_media_variants_type ON media_variants(variant_type);
CREATE INDEX IF NOT EXISTS idx_media_usage_media_id ON media_usage(media_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_entity ON media_usage(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_optimization_queue_status ON media_optimization_queue(status);
CREATE INDEX IF NOT EXISTS idx_media_optimization_queue_media_id ON media_optimization_queue(media_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update folder item count
CREATE OR REPLACE FUNCTION update_folder_item_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.folder_id IS NOT NULL THEN
            UPDATE media_folders
            SET item_count = item_count + 1,
                total_size = total_size + COALESCE(NEW.file_size, 0),
                updated_at = NOW()
            WHERE id = NEW.folder_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.folder_id IS DISTINCT FROM NEW.folder_id THEN
            -- Remove from old folder
            IF OLD.folder_id IS NOT NULL THEN
                UPDATE media_folders
                SET item_count = GREATEST(0, item_count - 1),
                    total_size = GREATEST(0, total_size - COALESCE(OLD.file_size, 0)),
                    updated_at = NOW()
                WHERE id = OLD.folder_id;
            END IF;
            -- Add to new folder
            IF NEW.folder_id IS NOT NULL THEN
                UPDATE media_folders
                SET item_count = item_count + 1,
                    total_size = total_size + COALESCE(NEW.file_size, 0),
                    updated_at = NOW()
                WHERE id = NEW.folder_id;
            END IF;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.folder_id IS NOT NULL THEN
            UPDATE media_folders
            SET item_count = GREATEST(0, item_count - 1),
                total_size = GREATEST(0, total_size - COALESCE(OLD.file_size, 0)),
                updated_at = NOW()
            WHERE id = OLD.folder_id;
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for folder item count
DROP TRIGGER IF EXISTS trigger_update_folder_item_count ON media;
CREATE TRIGGER trigger_update_folder_item_count
    AFTER INSERT OR UPDATE OF folder_id OR DELETE ON media
    FOR EACH ROW
    EXECUTE FUNCTION update_folder_item_count();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_media_folders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_media_folders_updated_at ON media_folders;
CREATE TRIGGER trigger_media_folders_updated_at
    BEFORE UPDATE ON media_folders
    FOR EACH ROW
    EXECUTE FUNCTION update_media_folders_updated_at();

-- ============================================
-- SEED DATA: DEFAULT FOLDERS
-- ============================================

INSERT INTO media_folders (id, name, slug, description, is_system, color, icon, sort_order) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Images', 'images', 'All image files', TRUE, '#10b981', 'image', 1),
    ('00000000-0000-0000-0000-000000000002', 'Videos', 'videos', 'All video files', TRUE, '#f59e0b', 'video', 2),
    ('00000000-0000-0000-0000-000000000003', 'Audio', 'audio', 'All audio files', TRUE, '#8b5cf6', 'music', 3),
    ('00000000-0000-0000-0000-000000000004', 'Documents', 'documents', 'PDF and document files', TRUE, '#ef4444', 'file-text', 4),
    ('00000000-0000-0000-0000-000000000005', 'Uploads', 'uploads', 'User uploaded files', TRUE, '#6366f1', 'upload', 5)
ON CONFLICT DO NOTHING;

-- Add some common sub-folders
INSERT INTO media_folders (name, slug, description, parent_id, is_system, color, icon, sort_order) VALUES
    ('Thumbnails', 'thumbnails', 'Generated thumbnails', '00000000-0000-0000-0000-000000000001', TRUE, '#10b981', 'image', 1),
    ('Gallery', 'gallery', 'Gallery images', '00000000-0000-0000-0000-000000000001', TRUE, '#10b981', 'images', 2),
    ('Avatars', 'avatars', 'User avatar images', '00000000-0000-0000-0000-000000000001', TRUE, '#10b981', 'user', 3),
    ('Backgrounds', 'backgrounds', 'Background images', '00000000-0000-0000-0000-000000000001', TRUE, '#10b981', 'layout', 4),
    ('Featured', 'featured', 'Featured post images', '00000000-0000-0000-0000-000000000001', TRUE, '#10b981', 'star', 5)
ON CONFLICT DO NOTHING;
