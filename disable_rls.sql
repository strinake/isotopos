-- DISABLE ROW LEVEL SECURITY ON MATCHES
-- This will turn off all policy checks for the matches table.
-- This allows ANYONE with the API key to read/write/delete.
-- Use this to solve the "violates row-level security policy" error definitively.

ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
