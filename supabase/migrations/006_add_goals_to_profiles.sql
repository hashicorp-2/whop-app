-- Add goals columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS primary_goal TEXT;

-- Create index for primary goal queries
CREATE INDEX IF NOT EXISTS idx_profiles_primary_goal ON profiles(primary_goal);

COMMENT ON COLUMN profiles.goals IS 'Array of user goals: Build App, Create Content, Sell Knowledge, Run Agency';
COMMENT ON COLUMN profiles.primary_goal IS 'User''s primary goal for product generation';
