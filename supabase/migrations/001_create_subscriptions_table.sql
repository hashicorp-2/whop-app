-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  whop_user_id TEXT,
  is_subscribed BOOLEAN DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_whop_user_id ON subscriptions(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_is_subscribed ON subscriptions(is_subscribed);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own subscription status
CREATE POLICY "Users can read their own subscription"
  ON subscriptions
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Create policy to allow service role to manage all subscriptions
CREATE POLICY "Service role can manage all subscriptions"
  ON subscriptions
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
