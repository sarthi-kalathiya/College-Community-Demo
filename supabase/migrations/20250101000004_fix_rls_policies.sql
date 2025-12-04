-- Fix infinite recursion in RLS policies
-- Version: 004

-- Drop problematic policies
DROP POLICY IF EXISTS "View memberships of joined communities" ON memberships;
DROP POLICY IF EXISTS "Public communities viewable by everyone" ON communities;

-- Simplified memberships SELECT policy - no self-reference
-- Memberships are viewable by: the member themselves, or if the community is public
CREATE POLICY "View memberships" ON memberships
  FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM communities c 
      WHERE c.id = memberships.community_id 
      AND (c.is_public = true OR c.creator_id = auth.uid())
    )
  );

-- Simplified communities SELECT policy - direct checks only, no membership subquery
CREATE POLICY "Communities viewable by everyone or members" ON communities
  FOR SELECT USING (
    is_public = true 
    OR creator_id = auth.uid()
  );

-- Add separate policy for private community access via membership
-- This uses SECURITY DEFINER function to avoid recursion
CREATE OR REPLACE FUNCTION is_community_member(community_uuid uuid, user_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships 
    WHERE community_id = community_uuid 
    AND user_id = user_uuid
  );
$$;

-- Add policy for private communities accessible to members
CREATE POLICY "Private communities viewable by members" ON communities
  FOR SELECT USING (
    is_public = false 
    AND is_community_member(id, auth.uid())
  );

