CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'moderator')),
  permissions TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
  last_login TIMESTAMP WITH TIME ZONE,
  password_reset_token TEXT,
  password_reset_expires TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin users can view their own profile" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update their own profile" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
DROP POLICY IF EXISTS "Allow user registration" ON admin_users;

-- Create RLS policies
CREATE POLICY "Admin users can view their own profile"
ON admin_users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admin users can update their own profile"
ON admin_users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admins can manage all admin users"
ON admin_users FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = auth.uid() AND role = 'super_admin' AND status = 'active'
  )
);

CREATE POLICY "Allow user registration"
ON admin_users FOR INSERT
WITH CHECK (true);

-- Insert default admin user
INSERT INTO admin_users (id, email, name, role, permissions, status, email_verified)
VALUES (
  gen_random_uuid(),
  'admin@roadside.com',
  'John Davis',
  'super_admin',
  ARRAY['all'],
  'active',
  true
) ON CONFLICT (email) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_admin_users_updated_at ON admin_users;
CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE admin_users;
