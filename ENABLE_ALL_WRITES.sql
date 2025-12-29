-- Enable writes for ALL tables (matches, scorers, mvp)
-- This script effectively disables RLS or grants wide permissions for ease of use in this project context.

-- 1. Matches (Reinforce)
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- 2. Scorers
ALTER TABLE scorers DISABLE ROW LEVEL SECURITY;

-- 3. MVP
ALTER TABLE mvp DISABLE ROW LEVEL SECURITY;

-- Grant permissions just in case
GRANT ALL ON TABLE matches TO anon, authenticated, service_role;
GRANT ALL ON TABLE scorers TO anon, authenticated, service_role;
GRANT ALL ON TABLE mvp TO anon, authenticated, service_role;
