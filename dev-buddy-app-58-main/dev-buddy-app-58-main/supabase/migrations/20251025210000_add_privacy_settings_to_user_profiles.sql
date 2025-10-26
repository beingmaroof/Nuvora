-- Add privacy_settings column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS privacy_settings JSONB;

-- Add a comment to describe the column
COMMENT ON COLUMN user_profiles.privacy_settings IS 'User privacy preferences and settings';