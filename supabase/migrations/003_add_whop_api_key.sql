-- Add Whop API key storage to users table
-- Note: In production, this should be encrypted at the application level
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS whop_api_key_encrypted TEXT;

-- Add store_id for the user's Whop store
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS whop_store_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_whop_store_id ON users(whop_store_id);

-- Create a table to track published products
CREATE TABLE IF NOT EXISTS published_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generation_id UUID REFERENCES generations(id) ON DELETE SET NULL,
  whop_product_id TEXT,
  whop_product_url TEXT,
  whop_draft_post_id TEXT,
  whop_draft_post_url TEXT,
  product_name TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'published'
);

CREATE INDEX IF NOT EXISTS idx_published_products_user_id ON published_products(user_id);
CREATE INDEX IF NOT EXISTS idx_published_products_whop_product_id ON published_products(whop_product_id);

ALTER TABLE published_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own published products"
  ON published_products
  FOR SELECT
  USING (auth.uid()::text = user_id::text);
