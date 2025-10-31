-- Fix RLS policy for premium_waitlist
-- Run this in Supabase SQL Editor to allow anonymous signups

-- Drop ALL existing policies first
DROP POLICY IF EXISTS "Anyone can join premium waitlist" ON premium_waitlist;
DROP POLICY IF EXISTS "Allow anon to insert waitlist" ON premium_waitlist;
DROP POLICY IF EXISTS "Allow authenticated to insert waitlist" ON premium_waitlist;
DROP POLICY IF EXISTS "Admin can view premium waitlist" ON premium_waitlist;
DROP POLICY IF EXISTS "Admin can update premium waitlist" ON premium_waitlist;

-- Create a new policy that explicitly allows anonymous role to INSERT
CREATE POLICY "Allow anon to insert waitlist"
  ON premium_waitlist
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users to insert (for logged-in users)
CREATE POLICY "Allow authenticated to insert waitlist"
  ON premium_waitlist
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Re-create admin policies
CREATE POLICY "Admin can view premium waitlist"
  ON premium_waitlist
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can update premium waitlist"
  ON premium_waitlist
  FOR UPDATE
  TO authenticated
  USING (true);
