-- ============================================
-- Migration: 00025_collaboration_and_chat.sql
-- Description: Real-time collaboration and chat system
-- ============================================

-- ============================================
-- Collaboration: User Presence & Sessions
-- ============================================

-- Tracks active WebSocket sessions for collaboration
CREATE TABLE collaboration_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'online',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks which files each user has open and their cursor position
CREATE TABLE file_presence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES collaboration_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_path VARCHAR(1024) NOT NULL,
    cursor_line INTEGER,
    cursor_column INTEGER,
    selection_start_line INTEGER,
    selection_start_column INTEGER,
    selection_end_line INTEGER,
    selection_end_column INTEGER,
    user_color VARCHAR(7) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, file_path)
);

-- ============================================
-- Chat System: Conversations
-- ============================================

-- Chat conversations (direct messages, groups, channels)
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    title VARCHAR(255),
    type VARCHAR(50) NOT NULL DEFAULT 'direct',
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_archived BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Participants in each conversation
CREATE TABLE chat_conversation_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(conversation_id, user_id)
);

-- Tags for organizing conversations
CREATE TABLE chat_conversation_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    tag VARCHAR(100) NOT NULL,
    color VARCHAR(7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, tag)
);

-- ============================================
-- Chat System: Messages
-- ============================================

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_type VARCHAR(50) DEFAULT 'text',
    reply_to_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Reactions on messages (emoji)
CREATE TABLE chat_message_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emoji VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- Starred/bookmarked messages
CREATE TABLE chat_message_stars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Message reminders
CREATE TABLE chat_message_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    remind_at TIMESTAMPTZ NOT NULL,
    is_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================

-- Collaboration indexes
CREATE INDEX idx_collaboration_sessions_user ON collaboration_sessions(user_id);
CREATE INDEX idx_collaboration_sessions_status ON collaboration_sessions(status);
CREATE INDEX idx_collaboration_sessions_heartbeat ON collaboration_sessions(last_heartbeat);
CREATE INDEX idx_file_presence_file ON file_presence(file_path);
CREATE INDEX idx_file_presence_session ON file_presence(session_id);
CREATE INDEX idx_file_presence_user ON file_presence(user_id);

-- Chat indexes
CREATE INDEX idx_chat_conversations_site ON chat_conversations(site_id);
CREATE INDEX idx_chat_conversations_created_by ON chat_conversations(created_by);
CREATE INDEX idx_chat_conversations_type ON chat_conversations(type);
CREATE INDEX idx_chat_conversation_participants_user ON chat_conversation_participants(user_id);
CREATE INDEX idx_chat_conversation_participants_conversation ON chat_conversation_participants(conversation_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_pinned ON chat_messages(conversation_id) WHERE is_pinned = TRUE;
CREATE INDEX idx_chat_message_reactions_message ON chat_message_reactions(message_id);
CREATE INDEX idx_chat_message_stars_user ON chat_message_stars(user_id);
CREATE INDEX idx_chat_reminders_pending ON chat_message_reminders(remind_at) WHERE is_sent = FALSE;
CREATE INDEX idx_chat_reminders_user ON chat_message_reminders(user_id);

-- ============================================
-- Trigger for updating timestamps
-- ============================================

-- Update updated_at on chat_conversations
CREATE OR REPLACE FUNCTION update_chat_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_chat_conversation_timestamp
    BEFORE UPDATE ON chat_conversations
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_conversation_timestamp();

-- Update updated_at on file_presence
CREATE OR REPLACE FUNCTION update_file_presence_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_file_presence_timestamp
    BEFORE UPDATE ON file_presence
    FOR EACH ROW
    EXECUTE FUNCTION update_file_presence_timestamp();
