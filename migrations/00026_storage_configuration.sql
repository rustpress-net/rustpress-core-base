-- Storage configuration tables for managing storage backends
-- Each content type (themes, assets, functions, plugins, apps) can have its own storage configuration

-- Storage configurations table
CREATE TABLE IF NOT EXISTS storage_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('themes', 'assets', 'functions', 'plugins', 'apps')),
    provider VARCHAR(50) NOT NULL DEFAULT 'local',
    config JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(site_id, category)
);

-- Storage migrations table for tracking media transfer jobs
CREATE TABLE IF NOT EXISTS storage_migrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    source_category VARCHAR(50) NOT NULL,
    target_provider VARCHAR(50) NOT NULL,
    target_config JSONB NOT NULL DEFAULT '{}',
    asset_types JSONB NOT NULL DEFAULT '["all"]',
    update_references BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed', 'cancelled')),
    total_files BIGINT NOT NULL DEFAULT 0,
    migrated_files BIGINT NOT NULL DEFAULT 0,
    failed_files BIGINT NOT NULL DEFAULT 0,
    current_file TEXT,
    error TEXT,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_storage_configurations_site ON storage_configurations(site_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_storage_configurations_category ON storage_configurations(category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_storage_migrations_site ON storage_migrations(site_id);
CREATE INDEX IF NOT EXISTS idx_storage_migrations_status ON storage_migrations(status) WHERE status IN ('pending', 'in_progress');

-- Insert default local configurations for each category
INSERT INTO storage_configurations (category, provider, config, is_active)
VALUES
    ('themes', 'local', '{"local_path": "/var/rustpress/themes"}', true),
    ('assets', 'local', '{"local_path": "/var/rustpress/assets"}', true),
    ('functions', 'local', '{"local_path": "/var/rustpress/functions"}', true),
    ('plugins', 'local', '{"local_path": "/var/rustpress/plugins"}', true),
    ('apps', 'local', '{"local_path": "/var/rustpress/apps"}', true)
ON CONFLICT (site_id, category) DO NOTHING;

-- Add storage_backend column to media table if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'media' AND column_name = 'storage_backend'
    ) THEN
        ALTER TABLE media ADD COLUMN storage_backend VARCHAR(50) DEFAULT 'local';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'media' AND column_name = 'storage_path'
    ) THEN
        ALTER TABLE media ADD COLUMN storage_path TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'media' AND column_name = 'cdn_url'
    ) THEN
        ALTER TABLE media ADD COLUMN cdn_url TEXT;
    END IF;
END $$;

-- Migration file tracking for checkpointing and recovery
CREATE TABLE IF NOT EXISTS storage_migration_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES storage_migrations(id) ON DELETE CASCADE,
    media_id UUID REFERENCES media(id) ON DELETE SET NULL,
    source_path TEXT NOT NULL,
    target_path TEXT,
    file_size BIGINT NOT NULL DEFAULT 0,
    checksum TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'transferring', 'verifying', 'completed', 'failed', 'skipped')),
    bytes_transferred BIGINT NOT NULL DEFAULT 0,
    attempt_count INT NOT NULL DEFAULT 0,
    last_error TEXT,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for efficient migration checkpoint queries
CREATE INDEX IF NOT EXISTS idx_migration_files_migration ON storage_migration_files(migration_id);
CREATE INDEX IF NOT EXISTS idx_migration_files_status ON storage_migration_files(migration_id, status);
CREATE INDEX IF NOT EXISTS idx_migration_files_pending ON storage_migration_files(migration_id)
    WHERE status IN ('pending', 'transferring', 'failed');

-- Migration checkpoints for resumable transfers
CREATE TABLE IF NOT EXISTS storage_migration_checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration_id UUID NOT NULL REFERENCES storage_migrations(id) ON DELETE CASCADE,
    checkpoint_type VARCHAR(20) NOT NULL CHECK (checkpoint_type IN ('progress', 'position', 'state')),
    data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Only keep latest checkpoint per migration/type
CREATE UNIQUE INDEX IF NOT EXISTS idx_migration_checkpoint_unique
    ON storage_migration_checkpoints(migration_id, checkpoint_type);

-- Add resume_from_file column to storage_migrations for recovery
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storage_migrations' AND column_name = 'last_processed_file_id'
    ) THEN
        ALTER TABLE storage_migrations ADD COLUMN last_processed_file_id UUID;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storage_migrations' AND column_name = 'can_resume'
    ) THEN
        ALTER TABLE storage_migrations ADD COLUMN can_resume BOOLEAN NOT NULL DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'storage_migrations' AND column_name = 'batch_size'
    ) THEN
        ALTER TABLE storage_migrations ADD COLUMN batch_size INT NOT NULL DEFAULT 10;
    END IF;
END $$;

-- Comment on tables
COMMENT ON TABLE storage_configurations IS 'Storage backend configurations for different content types (themes, assets, functions, plugins, apps)';
COMMENT ON TABLE storage_migrations IS 'Track media migration jobs between storage backends';
COMMENT ON TABLE storage_migration_files IS 'Track individual file transfers during migration for checkpointing and recovery';
COMMENT ON TABLE storage_migration_checkpoints IS 'Store checkpoints for resumable migrations';
