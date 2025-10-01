-- Add category column to songs table
ALTER TABLE songs ADD COLUMN category VARCHAR(20) DEFAULT 'tumu';

-- Update existing songs to have 'tumu' category
UPDATE songs SET category = 'tumu' WHERE category IS NULL;

-- Add constraint to ensure valid categories
ALTER TABLE songs ADD CONSTRAINT songs_category_check 
CHECK (category IN ('tumu', 'hareketli', 'sakin', 'klasik', 'romantik', 'nostaljik'));

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_songs_category ON songs(category);
