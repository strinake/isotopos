-- Enable RLS (Should already be enabled)
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users (or public if using anon key heavily without auth) to INSERT
-- WARNING: This allows anyone with the anon key (public) to insert/update. 
-- For a real app, you should use Supabase Auth and check for specific user UUIDs.
-- Since this is "easy mode" request:

CREATE POLICY "Public insert matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Public delete matches" ON matches FOR DELETE USING (true);
