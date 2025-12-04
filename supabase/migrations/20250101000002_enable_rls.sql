-- Enable Row Level Security on all tables
-- Version: 002

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (on sign up)
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- COMMUNITIES POLICIES
-- Public communities are viewable by everyone, private only by members
CREATE POLICY "Public communities viewable by everyone" ON communities
  FOR SELECT USING (
    is_public = true 
    OR creator_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM memberships WHERE community_id = communities.id AND user_id = auth.uid()
    )
  );

-- Authenticated users can create communities
CREATE POLICY "Authenticated users can create communities" ON communities
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

-- Creators can update their communities
CREATE POLICY "Creators can update their communities" ON communities
  FOR UPDATE USING (auth.uid() = creator_id);

-- Creators can delete their communities
CREATE POLICY "Creators can delete their communities" ON communities
  FOR DELETE USING (auth.uid() = creator_id);

-- MEMBERSHIPS POLICIES
-- Users can view memberships of communities they belong to
CREATE POLICY "View memberships of joined communities" ON memberships
  FOR SELECT USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM memberships m WHERE m.community_id = memberships.community_id AND m.user_id = auth.uid()
    )
  );

-- Users can join communities (insert their own membership)
CREATE POLICY "Users can join communities" ON memberships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can leave communities (delete their own membership)
CREATE POLICY "Users can leave communities" ON memberships
  FOR DELETE USING (auth.uid() = user_id);

-- POSTS POLICIES
-- Members can view posts in their communities
CREATE POLICY "Members can view community posts" ON posts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships WHERE community_id = posts.community_id AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM communities WHERE id = posts.community_id AND creator_id = auth.uid()
    )
  );

-- Members can create posts in their communities
CREATE POLICY "Members can create posts" ON posts
  FOR INSERT WITH CHECK (
    auth.uid() = author_id 
    AND (
      EXISTS (SELECT 1 FROM memberships WHERE community_id = posts.community_id AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM communities WHERE id = posts.community_id AND creator_id = auth.uid())
    )
  );

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors and community creators can delete posts
CREATE POLICY "Authors and creators can delete posts" ON posts
  FOR DELETE USING (
    auth.uid() = author_id 
    OR EXISTS (SELECT 1 FROM communities WHERE id = posts.community_id AND creator_id = auth.uid())
  );

-- COMMENTS POLICIES
-- Members can view comments on posts they can see
CREATE POLICY "Members can view comments" ON comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      JOIN memberships m ON m.community_id = p.community_id 
      WHERE p.id = comments.post_id AND m.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM posts p 
      JOIN communities c ON c.id = p.community_id 
      WHERE p.id = comments.post_id AND c.creator_id = auth.uid()
    )
  );

-- Members can create comments
CREATE POLICY "Members can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() = author_id 
    AND EXISTS (
      SELECT 1 FROM posts p 
      JOIN memberships m ON m.community_id = p.community_id 
      WHERE p.id = comments.post_id AND m.user_id = auth.uid()
    )
  );

-- Authors can update their own comments
CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = author_id);

-- Authors and community creators can delete comments
CREATE POLICY "Authors and creators can delete comments" ON comments
  FOR DELETE USING (
    auth.uid() = author_id 
    OR EXISTS (
      SELECT 1 FROM posts p 
      JOIN communities c ON c.id = p.community_id 
      WHERE p.id = comments.post_id AND c.creator_id = auth.uid()
    )
  );

-- LIKES POLICIES
-- Members can view likes
CREATE POLICY "Members can view likes" ON likes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM posts p 
      JOIN memberships m ON m.community_id = p.community_id 
      WHERE p.id = likes.post_id AND m.user_id = auth.uid()
    )
  );

-- Members can like posts
CREATE POLICY "Members can like posts" ON likes
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
      SELECT 1 FROM posts p 
      JOIN memberships m ON m.community_id = p.community_id 
      WHERE p.id = likes.post_id AND m.user_id = auth.uid()
    )
  );

-- Users can unlike (delete their own likes)
CREATE POLICY "Users can unlike posts" ON likes
  FOR DELETE USING (auth.uid() = user_id);

-- JOURNAL ENTRIES POLICIES
-- Users can only see their own journal entries
CREATE POLICY "Users can view own journal" ON journal_entries
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own journal entries
CREATE POLICY "Users can create journal entries" ON journal_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own journal entries
CREATE POLICY "Users can update own journal" ON journal_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own journal entries
CREATE POLICY "Users can delete own journal" ON journal_entries
  FOR DELETE USING (auth.uid() = user_id);

