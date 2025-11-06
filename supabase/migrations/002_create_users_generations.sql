-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_status TEXT DEFAULT 'expired',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  whop_user_id TEXT,
  monthly_generations INTEGER DEFAULT 0,
  total_generations INTEGER DEFAULT 0
);

-- Create generations table
CREATE TABLE IF NOT EXISTS generations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trend TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'success'
);

-- Update subscriptions table to match new schema
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS whop_subscription_id TEXT UNIQUE;

ALTER TABLE subscriptions
  ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- Add constraint for subscription status
ALTER TABLE subscriptions
  ADD CONSTRAINT check_status CHECK (status IN ('active', 'cancelled', 'expired'));

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_whop_user_id ON users(whop_user_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at);
CREATE INDEX IF NOT EXISTS idx_generations_status ON generations(status);

CREATE INDEX IF NOT EXISTS idx_subscriptions_whop_subscription_id ON subscriptions(whop_subscription_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own data
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Create policy for users to read their own generations
CREATE POLICY "Users can read their own generations"
  ON generations
  FOR SELECT
  USING (auth.uid()::text = user_id::text);

-- Create policy for users to insert their own generations
CREATE POLICY "Users can insert their own generations"
  ON generations
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

-- Allow service role to manage all data
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all generations"
  ON generations
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to auto-create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to increment generation counts
CREATE OR REPLACE FUNCTION increment_user_generations(user_uuid UUID, monthly_inc INTEGER DEFAULT 1, total_inc INTEGER DEFAULT 1)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET
    monthly_generations = monthly_generations + monthly_inc,
    total_generations = total_generations + total_inc
  WHERE id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
