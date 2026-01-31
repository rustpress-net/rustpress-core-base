-- Animations Migration
-- Adds tables for animation library, user animations, and preferences

-- Animation library - system-provided animations
CREATE TABLE IF NOT EXISTS animations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL DEFAULT 500,
    preview_description TEXT,
    css_keyframes TEXT NOT NULL,
    css_class VARCHAR(100) NOT NULL,
    is_pro BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animations_category ON animations(category);
CREATE INDEX IF NOT EXISTS idx_animations_sort_order ON animations(sort_order);

-- Custom user animations
CREATE TABLE IF NOT EXISTS user_animations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'custom',
    duration INTEGER NOT NULL DEFAULT 500,
    css_keyframes TEXT NOT NULL,
    css_class VARCHAR(100) NOT NULL,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_animations_user_id ON user_animations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_animations_category ON user_animations(category);
CREATE INDEX IF NOT EXISTS idx_user_animations_is_public ON user_animations(is_public);

-- User animation preferences
CREATE TABLE IF NOT EXISTS user_animation_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    favorite_animations JSONB NOT NULL DEFAULT '[]'::jsonb,
    recent_animations JSONB NOT NULL DEFAULT '[]'::jsonb,
    default_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_animation_preferences_user_id ON user_animation_preferences(user_id);

-- Animation presets (combinations of animations)
CREATE TABLE IF NOT EXISTS animation_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL,
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animation_presets_is_system ON animation_presets(is_system);
CREATE INDEX IF NOT EXISTS idx_animation_presets_user_id ON animation_presets(user_id);

-- Animation usage analytics
CREATE TABLE IF NOT EXISTS animation_usage_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    animation_id VARCHAR(100) NOT NULL,
    animation_type VARCHAR(50) NOT NULL DEFAULT 'builtin',
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL DEFAULT 'apply',
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_animation_usage_user_id ON animation_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_animation_usage_animation_id ON animation_usage_analytics(animation_id);
CREATE INDEX IF NOT EXISTS idx_animation_usage_created_at ON animation_usage_analytics(created_at);

-- Triggers for auto-updating timestamps
CREATE OR REPLACE FUNCTION update_animation_tables_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_animations_updated_at ON user_animations;
CREATE TRIGGER trigger_user_animations_updated_at
    BEFORE UPDATE ON user_animations
    FOR EACH ROW
    EXECUTE FUNCTION update_animation_tables_timestamp();

DROP TRIGGER IF EXISTS trigger_user_animation_preferences_updated_at ON user_animation_preferences;
CREATE TRIGGER trigger_user_animation_preferences_updated_at
    BEFORE UPDATE ON user_animation_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_animation_tables_timestamp();

DROP TRIGGER IF EXISTS trigger_animation_presets_updated_at ON animation_presets;
CREATE TRIGGER trigger_animation_presets_updated_at
    BEFORE UPDATE ON animation_presets
    FOR EACH ROW
    EXECUTE FUNCTION update_animation_tables_timestamp();

-- Insert default animations (55+ animations)
INSERT INTO animations (id, name, category, duration, preview_description, css_keyframes, css_class, sort_order) VALUES
('fade-in', 'Fade In', 'entrance', 500, 'Smoothly fade in from transparent', '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }', 'animate-fade-in', 1),
('fade-in-up', 'Fade In Up', 'entrance', 500, 'Fade in while moving up', '@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }', 'animate-fade-in-up', 2),
('fade-in-down', 'Fade In Down', 'entrance', 500, 'Fade in while moving down', '@keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }', 'animate-fade-in-down', 3),
('fade-in-left', 'Fade In Left', 'entrance', 500, 'Fade in while moving from left', '@keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }', 'animate-fade-in-left', 4),
('fade-in-right', 'Fade In Right', 'entrance', 500, 'Fade in while moving from right', '@keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }', 'animate-fade-in-right', 5),
('slide-in-up', 'Slide In Up', 'entrance', 400, 'Slide in from bottom', '@keyframes slideInUp { from { transform: translateY(100%); } to { transform: translateY(0); } }', 'animate-slide-in-up', 6),
('slide-in-down', 'Slide In Down', 'entrance', 400, 'Slide in from top', '@keyframes slideInDown { from { transform: translateY(-100%); } to { transform: translateY(0); } }', 'animate-slide-in-down', 7),
('slide-in-left', 'Slide In Left', 'entrance', 400, 'Slide in from left', '@keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }', 'animate-slide-in-left', 8),
('slide-in-right', 'Slide In Right', 'entrance', 400, 'Slide in from right', '@keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }', 'animate-slide-in-right', 9),
('zoom-in', 'Zoom In', 'entrance', 400, 'Scale up from small to normal', '@keyframes zoomIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }', 'animate-zoom-in', 10),
('zoom-in-up', 'Zoom In Up', 'entrance', 400, 'Zoom in while moving up', '@keyframes zoomInUp { from { opacity: 0; transform: scale(0.5) translateY(20px); } to { opacity: 1; transform: scale(1) translateY(0); } }', 'animate-zoom-in-up', 11),
('zoom-in-down', 'Zoom In Down', 'entrance', 400, 'Zoom in while moving down', '@keyframes zoomInDown { from { opacity: 0; transform: scale(0.5) translateY(-20px); } to { opacity: 1; transform: scale(1) translateY(0); } }', 'animate-zoom-in-down', 12),
('bounce-in', 'Bounce In', 'entrance', 750, 'Bounce in with elastic effect', '@keyframes bounceIn { 0% { opacity: 0; transform: scale(0.3); } 50% { transform: scale(1.05); } 70% { transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }', 'animate-bounce-in', 13),
('bounce-in-up', 'Bounce In Up', 'entrance', 750, 'Bounce in from bottom', '@keyframes bounceInUp { 0% { opacity: 0; transform: translateY(100px); } 60% { transform: translateY(-10px); } 80% { transform: translateY(5px); } 100% { opacity: 1; transform: translateY(0); } }', 'animate-bounce-in-up', 14),
('bounce-in-down', 'Bounce In Down', 'entrance', 750, 'Bounce in from top', '@keyframes bounceInDown { 0% { opacity: 0; transform: translateY(-100px); } 60% { transform: translateY(10px); } 80% { transform: translateY(-5px); } 100% { opacity: 1; transform: translateY(0); } }', 'animate-bounce-in-down', 15),
('flip-in-x', 'Flip In X', 'entrance', 600, 'Flip in around X axis', '@keyframes flipInX { from { transform: perspective(400px) rotateX(90deg); opacity: 0; } to { transform: perspective(400px) rotateX(0deg); opacity: 1; } }', 'animate-flip-in-x', 16),
('flip-in-y', 'Flip In Y', 'entrance', 600, 'Flip in around Y axis', '@keyframes flipInY { from { transform: perspective(400px) rotateY(90deg); opacity: 0; } to { transform: perspective(400px) rotateY(0deg); opacity: 1; } }', 'animate-flip-in-y', 17),
('rotate-in', 'Rotate In', 'entrance', 500, 'Rotate in from angle', '@keyframes rotateIn { from { transform: rotate(-180deg); opacity: 0; } to { transform: rotate(0deg); opacity: 1; } }', 'animate-rotate-in', 18),
('rotate-in-up-left', 'Rotate In Up Left', 'entrance', 500, 'Rotate in from bottom left', '@keyframes rotateInUpLeft { from { transform-origin: left bottom; transform: rotate(90deg); opacity: 0; } to { transform-origin: left bottom; transform: rotate(0deg); opacity: 1; } }', 'animate-rotate-in-up-left', 19),
('rotate-in-up-right', 'Rotate In Up Right', 'entrance', 500, 'Rotate in from bottom right', '@keyframes rotateInUpRight { from { transform-origin: right bottom; transform: rotate(-90deg); opacity: 0; } to { transform-origin: right bottom; transform: rotate(0deg); opacity: 1; } }', 'animate-rotate-in-up-right', 20),
('fade-out', 'Fade Out', 'exit', 500, 'Smoothly fade out to transparent', '@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }', 'animate-fade-out', 21),
('fade-out-up', 'Fade Out Up', 'exit', 500, 'Fade out while moving up', '@keyframes fadeOutUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }', 'animate-fade-out-up', 22),
('fade-out-down', 'Fade Out Down', 'exit', 500, 'Fade out while moving down', '@keyframes fadeOutDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }', 'animate-fade-out-down', 23),
('fade-out-left', 'Fade Out Left', 'exit', 500, 'Fade out while moving left', '@keyframes fadeOutLeft { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-20px); } }', 'animate-fade-out-left', 24),
('fade-out-right', 'Fade Out Right', 'exit', 500, 'Fade out while moving right', '@keyframes fadeOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(20px); } }', 'animate-fade-out-right', 25),
('zoom-out', 'Zoom Out', 'exit', 400, 'Scale down and fade out', '@keyframes zoomOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.5); } }', 'animate-zoom-out', 26),
('slide-out-up', 'Slide Out Up', 'exit', 400, 'Slide out to top', '@keyframes slideOutUp { from { transform: translateY(0); } to { transform: translateY(-100%); } }', 'animate-slide-out-up', 27),
('slide-out-down', 'Slide Out Down', 'exit', 400, 'Slide out to bottom', '@keyframes slideOutDown { from { transform: translateY(0); } to { transform: translateY(100%); } }', 'animate-slide-out-down', 28),
('pulse', 'Pulse', 'emphasis', 1000, 'Pulsing scale animation', '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }', 'animate-pulse', 29),
('bounce', 'Bounce', 'emphasis', 1000, 'Bouncing up and down', '@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }', 'animate-bounce', 30),
('shake', 'Shake', 'emphasis', 500, 'Horizontal shaking motion', '@keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }', 'animate-shake', 31),
('swing', 'Swing', 'emphasis', 800, 'Pendulum swing motion', '@keyframes swing { 20% { transform: rotate(15deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-5deg); } 100% { transform: rotate(0deg); } }', 'animate-swing', 32),
('wobble', 'Wobble', 'emphasis', 800, 'Wobbly motion side to side', '@keyframes wobble { 0%, 100% { transform: translateX(0) rotate(0); } 15% { transform: translateX(-10px) rotate(-5deg); } 30% { transform: translateX(8px) rotate(3deg); } 45% { transform: translateX(-6px) rotate(-3deg); } 60% { transform: translateX(4px) rotate(2deg); } 75% { transform: translateX(-2px) rotate(-1deg); } }', 'animate-wobble', 33),
('jello', 'Jello', 'emphasis', 900, 'Jelly-like wiggle effect', '@keyframes jello { 0%, 100% { transform: skewX(0) skewY(0); } 11.1% { transform: skewX(-12.5deg) skewY(-12.5deg); } 22.2% { transform: skewX(6.25deg) skewY(6.25deg); } 33.3% { transform: skewX(-3.125deg) skewY(-3.125deg); } 44.4% { transform: skewX(1.5625deg) skewY(1.5625deg); } 55.5% { transform: skewX(-0.78125deg) skewY(-0.78125deg); } 66.6% { transform: skewX(0.390625deg) skewY(0.390625deg); } 77.7% { transform: skewX(-0.1953125deg) skewY(-0.1953125deg); } }', 'animate-jello', 34),
('heartbeat', 'Heartbeat', 'emphasis', 1400, 'Double beat like a heart', '@keyframes heartbeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.3); } 28% { transform: scale(1); } 42% { transform: scale(1.3); } 70% { transform: scale(1); } }', 'animate-heartbeat', 35),
('flash', 'Flash', 'emphasis', 1000, 'Quick flash effect', '@keyframes flash { 0%, 50%, 100% { opacity: 1; } 25%, 75% { opacity: 0; } }', 'animate-flash', 36),
('rubber-band', 'Rubber Band', 'emphasis', 800, 'Stretchy rubber band effect', '@keyframes rubberBand { 0%, 100% { transform: scaleX(1); } 30% { transform: scaleX(1.25) scaleY(0.75); } 40% { transform: scaleX(0.75) scaleY(1.25); } 50% { transform: scaleX(1.15) scaleY(0.85); } 65% { transform: scaleX(0.95) scaleY(1.05); } 75% { transform: scaleX(1.05) scaleY(0.95); } }', 'animate-rubber-band', 37),
('tada', 'Tada', 'emphasis', 1000, 'Attention-grabbing tada effect', '@keyframes tada { 0%, 100% { transform: scale(1) rotate(0); } 10%, 20% { transform: scale(0.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } }', 'animate-tada', 38),
('spin', 'Spin', 'emphasis', 1000, 'Continuous 360 rotation', '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }', 'animate-spin', 39),
('scroll-fade-in', 'Scroll Fade In', 'scroll', 600, 'Fade in when scrolled into view', '@keyframes scrollFadeIn { from { opacity: 0; } to { opacity: 1; } }', 'animate-scroll-fade-in', 40),
('scroll-slide-up', 'Scroll Slide Up', 'scroll', 600, 'Slide up when scrolled into view', '@keyframes scrollSlideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }', 'animate-scroll-slide-up', 41),
('scroll-slide-left', 'Scroll Slide Left', 'scroll', 600, 'Slide from right when scrolled into view', '@keyframes scrollSlideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }', 'animate-scroll-slide-left', 42),
('scroll-slide-right', 'Scroll Slide Right', 'scroll', 600, 'Slide from left when scrolled into view', '@keyframes scrollSlideRight { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }', 'animate-scroll-slide-right', 43),
('scroll-zoom-in', 'Scroll Zoom In', 'scroll', 600, 'Zoom in when scrolled into view', '@keyframes scrollZoomIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }', 'animate-scroll-zoom-in', 44),
('scroll-flip', 'Scroll Flip', 'scroll', 800, 'Flip in when scrolled into view', '@keyframes scrollFlip { from { opacity: 0; transform: perspective(400px) rotateX(-90deg); } to { opacity: 1; transform: perspective(400px) rotateX(0deg); } }', 'animate-scroll-flip', 45),
('rotate-90', 'Rotate 90°', 'rotation', 400, 'Rotate 90 degrees clockwise', '@keyframes rotate90 { from { transform: rotate(0deg); } to { transform: rotate(90deg); } }', 'animate-rotate-90', 46),
('rotate-180', 'Rotate 180°', 'rotation', 400, 'Rotate 180 degrees', '@keyframes rotate180 { from { transform: rotate(0deg); } to { transform: rotate(180deg); } }', 'animate-rotate-180', 47),
('rotate-360', 'Rotate 360°', 'rotation', 600, 'Full 360 degree rotation', '@keyframes rotate360 { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }', 'animate-rotate-360', 48),
('rotate-counter', 'Rotate Counter', 'rotation', 400, 'Rotate counter-clockwise', '@keyframes rotateCounter { from { transform: rotate(0deg); } to { transform: rotate(-90deg); } }', 'animate-rotate-counter', 49),
('scale-up', 'Scale Up', 'scale', 300, 'Scale from normal to larger', '@keyframes scaleUp { from { transform: scale(1); } to { transform: scale(1.2); } }', 'animate-scale-up', 50),
('scale-down', 'Scale Down', 'scale', 300, 'Scale from normal to smaller', '@keyframes scaleDown { from { transform: scale(1); } to { transform: scale(0.8); } }', 'animate-scale-down', 51),
('scale-x', 'Scale X', 'scale', 300, 'Scale horizontally', '@keyframes scaleX { from { transform: scaleX(1); } to { transform: scaleX(1.2); } }', 'animate-scale-x', 52),
('scale-y', 'Scale Y', 'scale', 300, 'Scale vertically', '@keyframes scaleY { from { transform: scaleY(1); } to { transform: scaleY(1.2); } }', 'animate-scale-y', 53),
('float', 'Float', 'motion', 3000, 'Gentle floating motion', '@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }', 'animate-float', 54),
('wave', 'Wave', 'motion', 2000, 'Wave-like motion', '@keyframes wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }', 'animate-wave', 55),
('bob', 'Bob', 'motion', 2000, 'Bobbing up and down', '@keyframes bob { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(-5px) rotate(-2deg); } 75% { transform: translateY(-5px) rotate(2deg); } }', 'animate-bob', 56)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    duration = EXCLUDED.duration,
    preview_description = EXCLUDED.preview_description,
    css_keyframes = EXCLUDED.css_keyframes,
    css_class = EXCLUDED.css_class,
    sort_order = EXCLUDED.sort_order;
