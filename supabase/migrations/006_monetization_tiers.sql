-- Update profiles table for new monetization tiers
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('trial', 'pro', 'agency'));

-- Add usage tracking columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blueprints_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS campaigns_used INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS media_generations INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS whop_subscription_id TEXT;

-- Update default tier to trial
ALTER TABLE profiles ALTER COLUMN subscription_tier SET DEFAULT 'trial';

-- Update trigger to set trial expiry (7 days)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    launches_remaining, 
    subscription_tier,
    trial_expires_at
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    3, -- 3 Blueprints for trial
    'trial',
    NOW() + INTERVAL '7 days'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN ('blueprint', 'campaign', 'media', 'launch')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_feature_type ON usage_logs(feature_type);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);

ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own usage logs"
  ON usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all usage logs"
  ON usage_logs FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
