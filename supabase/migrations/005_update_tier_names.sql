-- Update subscription tier names from free/pro/agency to spark/pro/apex
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_subscription_tier_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_tier_check 
  CHECK (subscription_tier IN ('spark', 'pro', 'apex'));

-- Update existing 'free' to 'spark'
UPDATE profiles SET subscription_tier = 'spark' WHERE subscription_tier = 'free';

-- Update default value
ALTER TABLE profiles ALTER COLUMN subscription_tier SET DEFAULT 'spark';

-- Update trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, launches_remaining, subscription_tier)
  VALUES (NEW.id, NEW.email, 1, 'spark');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
