-- Update mood_entries table to include new fields
ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS mood_category TEXT CHECK (mood_category IN ('positive', 'neutral', 'negative')),
ADD COLUMN IF NOT EXISTS mood_intensity INTEGER CHECK (mood_intensity >= 1 AND mood_intensity <= 5),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update existing records with default values
UPDATE mood_entries 
SET 
  mood_category = 'neutral',
  mood_intensity = 3,
  updated_at = NOW()
WHERE mood_category IS NULL OR mood_intensity IS NULL;

-- Make the new columns NOT NULL
ALTER TABLE mood_entries 
ALTER COLUMN mood_category SET NOT NULL,
ALTER COLUMN mood_intensity SET NOT NULL;

-- Create updated_at trigger for mood_entries
CREATE TRIGGER update_mood_entries_updated_at
  BEFORE UPDATE ON mood_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
