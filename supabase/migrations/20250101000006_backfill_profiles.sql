-- Backfill profiles for existing users who don't have a profile
-- This fixes the foreign key constraint issue

-- Insert profiles for any auth.users that don't have a profile yet
INSERT INTO public.profiles (id, email, display_name)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'full_name',
    split_part(au.email, '@', 1)
  ) as display_name
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

