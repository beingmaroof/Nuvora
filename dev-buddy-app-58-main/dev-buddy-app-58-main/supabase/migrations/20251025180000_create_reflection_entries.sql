-- Create reflection_entries table
CREATE TABLE IF NOT EXISTS reflection_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_id TEXT NOT NULL,
  prompt_text TEXT NOT NULL,
  prompt_category TEXT NOT NULL CHECK (prompt_category IN ('gratitude', 'growth', 'challenges', 'emotions', 'relationships', 'goals', 'mindfulness', 'creativity')),
  content TEXT NOT NULL,
  word_count INTEGER NOT NULL DEFAULT 0,
  mood_before TEXT,
  mood_after TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create updated_at trigger
CREATE TRIGGER update_reflection_entries_updated_at
  BEFORE UPDATE ON reflection_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE reflection_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own reflections" ON reflection_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections" ON reflection_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections" ON reflection_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections" ON reflection_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_reflection_entries_user_id ON reflection_entries(user_id);
CREATE INDEX idx_reflection_entries_category ON reflection_entries(prompt_category);
CREATE INDEX idx_reflection_entries_created_at ON reflection_entries(created_at);
CREATE INDEX idx_reflection_entries_completed ON reflection_entries(is_completed);

