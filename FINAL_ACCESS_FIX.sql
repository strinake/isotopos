-- FINAL PERMISSIONS FIX
-- Run this in Supabase SQL Editor to fix Error 42501
-- ==================================================

-- 1. Unconditionally DISABLE Row Level Security on the matches table.
-- This is the strongest fix. It turns off the checking engine for this table.
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- 2. Just in case RLS is re-enabled later, we drop old policies and add a permissive one.
DROP POLICY IF EXISTS "Public read matches" ON matches;
DROP POLICY IF EXISTS "Public insert matches" ON matches;
DROP POLICY IF EXISTS "Public update matches" ON matches;
DROP POLICY IF EXISTS "Public delete matches" ON matches;
DROP POLICY IF EXISTS "Enable access to all users" ON matches;

-- Create a single "ALLOW ALL" policy
CREATE POLICY "Enable access to all users" 
ON matches 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 3. Grant Explicit Permissions to the 'anon' and 'service_role' (just to be safe)
GRANT ALL ON TABLE matches TO anon;
GRANT ALL ON TABLE matches TO service_role;
GRANT ALL ON TABLE matches TO authenticated;

-- Confirmation
SELECT 'Permissions fixed. RLS is disabled and policies are set.' as Result;
