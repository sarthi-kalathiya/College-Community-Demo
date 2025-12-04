-- Create or update admin user
-- This migration allows you to create an admin user or promote an existing user to admin

-- Option 1: Promote an existing user to admin (replace with actual user email)
-- Uncomment and update the email below:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'your-admin-email@example.com';

-- Option 2: Create a new admin user via Supabase Auth first, then run:
-- UPDATE profiles 
-- SET role = 'admin' 
-- WHERE email = 'admin@example.com';

-- Option 3: Create a function to easily promote users to admin
CREATE OR REPLACE FUNCTION promote_to_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET role = 'admin'
  WHERE email = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
END;
$$;

-- Example: Promote a user to admin (replace with your email)
-- SELECT promote_to_admin('your-email@example.com');

-- If you want to create a default admin user, you can:
-- 1. Sign up a user through the app with your email
-- 2. Then run: SELECT promote_to_admin('your-email@example.com');

