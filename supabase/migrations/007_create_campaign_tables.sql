-- Create blueprints table for tracking compiled blueprints
CREATE TABLE IF NOT EXISTS blueprints (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trend_id TEXT NOT NULL,
  blueprint_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feedback table for learning loop
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trend_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  feedback_text TEXT,
  blueprint_id TEXT,
  campaign_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blueprints_user_id ON blueprints(user_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_trend_id ON blueprints(trend_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_trend_id ON feedback(trend_id);
CREATE INDEX IF NOT EXISTS idx_feedback_score ON feedback(score);

-- Enable RLS
ALTER TABLE blueprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policies for blueprints
CREATE POLICY "Users can read their own blueprints"
  ON blueprints FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own blueprints"
  ON blueprints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policies for feedback
CREATE POLICY "Users can manage their own feedback"
  ON feedback FOR ALL
  USING (auth.uid() = user_id);

-- Service role can manage all
CREATE POLICY "Service role can manage all blueprints"
  ON blueprints FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage all feedback"
  ON feedback FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');
