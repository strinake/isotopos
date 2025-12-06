-- 1. Create Tables
CREATE TABLE IF NOT EXISTS teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT
);

CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    jornada INTEGER NOT NULL,
    home_team_id TEXT REFERENCES teams(id),
    away_team_id TEXT REFERENCES teams(id),
    home_score INTEGER,
    away_score INTEGER
);

CREATE TABLE IF NOT EXISTS scorers (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    team_id TEXT REFERENCES teams(id),
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mvp (
    player_id TEXT PRIMARY KEY,
    player_name TEXT NOT NULL,
    team_id TEXT REFERENCES teams(id),
    points INTEGER DEFAULT 0
);

-- 2. Enable Public Read Access (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);

ALTER TABLE scorers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read scorers" ON scorers FOR SELECT USING (true);

ALTER TABLE mvp ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read mvp" ON mvp FOR SELECT USING (true);

-- 3. Insert Data
-- Teams
INSERT INTO teams (id, name, short_name) VALUES
('davidbarber', 'David Barber', 'David Barber'),
('uddhdoctordaniels', 'UDDH Doctor Daniels', 'Doctor Daniels'),
('artajofs', 'AR Tajo F.S.', 'AR Tajo'),
('pitingosfs', 'Pitingos F.S.', 'Pitingos'),
('internacionalesfutsal', 'Internacionales Futsal', 'Internacionales'),
('losflojinos', 'Los Flojiños', 'Los Flojiños'),
('lprfutsal', 'LPR Futsal', 'LPR Futsal'),
('10codecantely', '10Code Cantely', '10Code'),
('interqalat', 'Inter Qalat', 'Inter Qalat'),
('sambafs', 'Samba FS', 'Samba'),
('blfs', 'B&L FS', 'B&L FS'),
('fscididi', 'FS Cididi', 'FS Cididi'),
('cdamparo', 'C.D. Amparo', 'Amparo'),
('isotopos', 'Isótopos Guadaíra', 'Isótopos'),
('yayosfutsal', 'Yayos Futsal', 'Yayos'),
('siddhartavivuela', 'Siddharta Vivuela', 'Siddharta'),
('losrococolos', 'Los Rococolos', 'Los Rococolos'),
('standardeviejas', 'Standar de Viejas', 'Standar de Viejas');

-- Matches
INSERT INTO matches (id, jornada, home_team_id, away_team_id, home_score, away_score) VALUES
('m1', 1, 'isotopos', 'fscididi', 4, 4),
('m2', 1, 'cdamparo', 'davidbarber', 5, 8),
('m3', 1, 'lprfutsal', 'standardeviejas', 8, 2),
('m4', 1, 'internacionalesfutsal', 'losrococolos', 5, 0),
('m5', 1, 'pitingosfs', 'interqalat', 6, 4),
('m6', 1, 'sambafs', 'uddhdoctordaniels', 2, 6),
('m7', 1, '10codecantely', 'siddhartavivuela', 4, 3),
('m8', 2, 'losrococolos', 'yayosfutsal', 2, 3),
('m9', 2, 'interqalat', 'sambafs', 7, 7),
('m10', 2, 'blfs', 'pitingosfs', 4, 5),
('m11', 2, 'artajofs', 'internacionalesfutsal', 3, 2),
('m12', 2, 'standardeviejas', '10codecantely', 2, 5),
('m13', 2, 'uddhdoctordaniels', 'isotopos', 4, 2),
('m14', 2, 'siddhartavivuela', 'losflojinos', 0, 3),
('m15', 2, 'davidbarber', 'lprfutsal', 5, 2),
('m16', 2, 'fscididi', 'cdamparo', 4, 5),
('m17', 3, 'isotopos', 'interqalat', 3, 3),
('m18', 3, 'cdamparo', 'uddhdoctordaniels', 3, 4),
('m19', 3, 'lprfutsal', 'fscididi', 6, 2),
('m20', 3, 'internacionalesfutsal', 'yayosfutsal', 4, 1),
('m21', 3, 'artajofs', 'siddhartavivuela', 5, 0),
('m22', 3, 'sambafs', 'blfs', 1, 2),
('m23', 3, 'pitingosfs', 'losrococolos', 1, 0),
('m24', 3, 'losflojinos', 'standardeviejas', 7, 0),
('m25', 3, '10codecantely', 'davidbarber', 1, 4),
('m26', 4, 'siddhartavivuela', 'internacionalesfutsal', 2, 3),
('m27', 4, 'standardeviejas', 'artajofs', 2, 4),
('m28', 4, 'interqalat', 'cdamparo', 7, 3),
('m29', 4, 'blfs', 'isotopos', 5, 5),
('m30', 4, 'losrococolos', 'sambafs', 1, 8),
('m31', 4, 'uddhdoctordaniels', 'lprfutsal', 4, 2),
('m32', 4, 'davidbarber', 'losflojinos', 7, 6),
('m33', 4, 'yayosfutsal', 'pitingosfs', 0, 2),
('m34', 4, 'fscididi', '10codecantely', 4, 2),
('m35', 5, 'lprfutsal', 'interqalat', 7, 4),
('m36', 5, 'artajofs', 'davidbarber', 5, 1),
('m37', 5, 'siddhartavivuela', 'standardeviejas', 2, 2),
('m38', 5, 'internacionalesfutsal', 'pitingosfs', 4, 4),
('m39', 5, 'sambafs', 'yayosfutsal', 3, 3),
('m40', 5, 'isotopos', 'losrococolos', 4, 0),
('m41', 5, 'cdamparo', 'blfs', 3, 5),
('m42', 5, '10codecantely', 'uddhdoctordaniels', 2, 4),
('m43', 5, 'losflojinos', 'fscididi', 4, 7),
('m44', 1, 'artajofs', 'losflojinos', 2, 1);

-- Scorers
INSERT INTO scorers (player_id, player_name, team_id, goals, assists) VALUES
('p1', 'Ricardo', 'isotopos', 6, 2),
('p2', 'Dani', 'isotopos', 3, 2),
('p3', 'Chamorro', 'isotopos', 3, 0),
('p4', 'Samu', 'isotopos', 1, 2),
('p5', 'Bascón', 'isotopos', 1, 1),
('p6', 'Oli', 'isotopos', 1, 1),
('p7', 'Gonzalo', 'isotopos', 2, 0),
('p8', 'Pablo', 'isotopos', 1, 0),
('p9', 'Carlos', 'isotopos', 0, 1),
('p10', 'Rafa', 'isotopos', 0, 1),
('p11', 'Josemi', 'isotopos', 1, 1);

-- MVP
INSERT INTO mvp (player_id, player_name, team_id, points) VALUES
('p8', 'Pablo', 'isotopos', 21),
('p11', 'Josemi', 'isotopos', 21),
('p2', 'Dani', 'isotopos', 16),
('p1', 'Ricardo', 'isotopos', 14),
('p10', 'Rafa', 'isotopos', 10),
('p6', 'Oli', 'isotopos', 9),
('p3', 'Chamorro', 'isotopos', 4),
('p7', 'Gonzalo', 'isotopos', 3),
('p5', 'Bascón', 'isotopos', 2),
('p4', 'Samu', 'isotopos', 2);
