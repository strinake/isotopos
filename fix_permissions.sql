-- FIX RLS POLICIES FOR MATCHES
-- Run this script in the Supabase SQL Editor

-- 1. Ensure RLS is enabled
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts or confusion
DROP POLICY IF EXISTS "Public read matches" ON matches;
DROP POLICY IF EXISTS "Public insert matches" ON matches;
DROP POLICY IF EXISTS "Public update matches" ON matches;
DROP POLICY IF EXISTS "Public delete matches" ON matches;

-- 3. Re-create policies allowing FULL PUBLIC ACCESS (Read + Write)

-- Allow READING (SELECT) for everyone
CREATE POLICY "Public read matches" 
ON matches FOR SELECT 
USING (true);

-- Allow INSERTING for everyone
CREATE POLICY "Public insert matches" 
ON matches FOR INSERT 
WITH CHECK (true);

-- Allow UPDATING for everyone
CREATE POLICY "Public update matches" 
ON matches FOR UPDATE 
USING (true);

-- Allow DELETING for everyone
CREATE POLICY "Public delete matches" 
ON matches FOR DELETE 
USING (true);
