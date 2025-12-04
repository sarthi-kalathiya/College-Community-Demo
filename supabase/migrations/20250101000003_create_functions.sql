-- Database functions and triggers
-- Version: 003

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to automatically add creator as a member when they create a community
CREATE OR REPLACE FUNCTION public.handle_new_community()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.memberships (user_id, community_id, role)
  VALUES (NEW.creator_id, NEW.id, 'creator');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new community is created
DROP TRIGGER IF EXISTS on_community_created ON communities;
CREATE TRIGGER on_community_created
  AFTER INSERT ON communities
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_community();

-- Function to get leaderboard (most active members by post + comment count)
CREATE OR REPLACE FUNCTION get_community_leaderboard(community_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  post_count BIGINT,
  comment_count BIGINT,
  total_activity BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.display_name,
    p.avatar_url,
    COALESCE(posts_count.count, 0) as post_count,
    COALESCE(comments_count.count, 0) as comment_count,
    COALESCE(posts_count.count, 0) + COALESCE(comments_count.count, 0) as total_activity
  FROM profiles p
  INNER JOIN memberships m ON m.user_id = p.id
  LEFT JOIN (
    SELECT author_id, COUNT(*) as count
    FROM posts
    WHERE community_id = community_uuid
    GROUP BY author_id
  ) posts_count ON posts_count.author_id = p.id
  LEFT JOIN (
    SELECT c.author_id, COUNT(*) as count
    FROM comments c
    INNER JOIN posts po ON po.id = c.post_id
    WHERE po.community_id = community_uuid
    GROUP BY c.author_id
  ) comments_count ON comments_count.author_id = p.id
  WHERE m.community_id = community_uuid
  ORDER BY total_activity DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime for posts, comments, and likes
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE likes;

