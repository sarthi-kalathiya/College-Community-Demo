-- Add admin policies for community management
-- Version: 008

-- Allow admins to update communities (for status changes like suspend/activate)
CREATE POLICY "Admins can update communities" ON communities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to view all communities (including private ones)
CREATE POLICY "Admins can view all communities" ON communities
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to delete communities
CREATE POLICY "Admins can delete communities" ON communities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to delete profiles (for user management)
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'admin'
    )
  );

