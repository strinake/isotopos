-- 1. Alter table to add new columns
ALTER TABLE matches ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_date DATE;
ALTER TABLE matches ADD COLUMN IF NOT EXISTS match_time TEXT;

-- 2. Insert Jornada 6 Matches (Upcoming)
INSERT INTO matches (id, jornada, home_team_id, away_team_id, match_date, match_time, venue) VALUES
('m45', 6, 'isotopos', 'davidbarber', '2025-12-14', '10:00', 'Ramón y Cajal'),
('m46', 6, 'uddhdoctordaniels', 'artajofs', '2025-12-14', '10:00', 'Velódromo Pista 1'),
('m47', 6, 'pitingosfs', 'internacionalesfutsal', '2025-12-14', '11:00', 'Velódromo Pista 2'),
('m48', 6, 'losflojinos', 'lprfutsal', '2025-12-14', '11:00', 'Velódromo Pista 3'),
('m49', 6, '10codecantely', 'interqalat', '2025-12-14', '12:00', 'Ramón y Cajal'),
('m50', 6, 'sambafs', 'blfs', '2025-12-14', '12:00', 'Velódromo Pista 1'),
('m51', 6, 'fscididi', 'cdamparo', '2025-12-14', '13:00', 'Velódromo Pista 2'),
('m52', 6, 'yayosfutsal', 'siddhartavivuela', '2025-12-14', '13:00', 'Velódromo Pista 3'),
('m53', 6, 'losrococolos', 'standardeviejas', '2025-12-14', '10:00', 'Velódromo Pista 2');
