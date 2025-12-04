-- Add role and status fields for admin functionality

-- Add role to profiles (for platform admins)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Add status to communities (for moderation)
ALTER TABLE communities ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'));

-- Create transactions table to track payments
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  amount_in_cents INTEGER NOT NULL,
  platform_fee_in_cents INTEGER NOT NULL DEFAULT 0,
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_community ON transactions(community_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(created_at);

