-- Performance optimization indexes
-- These indexes will significantly improve query performance

-- Index for media queries (most frequently accessed)
CREATE INDEX IF NOT EXISTS idx_media_memory_id ON media(memory_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- Composite indexes for complex queries
CREATE INDEX IF NOT EXISTS idx_memories_taken_at_city ON memories(taken_at, city_code);
CREATE INDEX IF NOT EXISTS idx_memories_album_taken ON memories(album_id, taken_at);

-- Index for letters and anniversaries
CREATE INDEX IF NOT EXISTS idx_letters_created_at ON letters(created_at);
CREATE INDEX IF NOT EXISTS idx_anniversaries_date ON anniversaries(date);
CREATE INDEX IF NOT EXISTS idx_anniversaries_repeat ON anniversaries(repeat);

-- Index for albums
CREATE INDEX IF NOT EXISTS idx_albums_created_at ON albums(created_at);

-- Partial indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_with_media ON memories(id) WHERE id IN (SELECT DISTINCT memory_id FROM media);
CREATE INDEX IF NOT EXISTS idx_active_anniversaries ON anniversaries(date) WHERE repeat = true;

-- Statistics update for better query planning
ANALYZE;
