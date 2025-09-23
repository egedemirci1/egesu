-- Disable RLS for this project since we're using service role key
-- and all operations are server-side only

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    cover_media_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create memories table
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT,
    taken_at DATE NOT NULL DEFAULT CURRENT_DATE,
    city_code INTEGER CHECK (city_code >= 1 AND city_code <= 81),
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create media table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('image', 'video')),
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create letters table
CREATE TABLE IF NOT EXISTS letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create anniversaries table
CREATE TABLE IF NOT EXISTS anniversaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date DATE NOT NULL,
    repeat BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memories_city_code ON memories(city_code);
CREATE INDEX IF NOT EXISTS idx_memories_taken_at ON memories(taken_at);
CREATE INDEX IF NOT EXISTS idx_memories_album_id ON memories(album_id);
CREATE INDEX IF NOT EXISTS idx_media_memory_id ON media(memory_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media(type);
CREATE INDEX IF NOT EXISTS idx_anniversaries_date ON anniversaries(date);

-- Insert default profile
INSERT INTO profiles (id, display_name) 
VALUES ('00000000-0000-0000-0000-000000000000', 'EgeSu')
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for media files
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for media bucket (service role only)
CREATE POLICY "Service role can manage media" ON storage.objects
FOR ALL USING (bucket_id = 'media');
