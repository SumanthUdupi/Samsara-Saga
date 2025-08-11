-- Migration to fix the schema by adding missing tables and data without failing if they already exist.

CREATE TABLE IF NOT EXISTS Companions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS PlayerCompanions (
    player_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'locked', 'unlocked', or 'active'
    PRIMARY KEY (player_id, companion_id),
    FOREIGN KEY (player_id) REFERENCES Players(id),
    FOREIGN KEY (companion_id) REFERENCES Companions(id)
);

-- This will fail if the column already exists, but it's the simplest approach for a dev environment.
-- A more robust solution would involve checking the schema first.
-- ALTER TABLE LocationConnections ADD COLUMN is_hidden BOOLEAN DEFAULT 0;


INSERT OR IGNORE INTO Companions (id, name, title, description) VALUES
('vanara_kavi', 'Kavi', 'the Vanara Scout', 'A loyal and agile scout who knows the secrets of the wild.'),
('naga_ananta', 'Ananta', 'the Naga Sage', 'An ancient serpent who speaks in riddles and understands the language of creation.'),
('gandharva_chitrasena', 'Chitrasena', 'the Gandharva Musician', 'A celestial performer whose melodies can soothe the most savage beasts.'),
('apsara_leela', 'Leela', 'the Apsara Dancer', 'A graceful nymph whose understanding of illusion is second to none.'),
('yakshini_vrikshaa', 'Vrikshaa', 'the Yakshini Guardian', 'A patient nature spirit who guards the hidden treasures of the earth.'),
('vetal_bhairava', 'Bhairava''s Vetal', 'the Vetal', 'A powerful, liminal spirit who knows the secrets of the dead.'),
('marut_spirit', 'Marut', 'the Wind-Spirit', 'An energetic storm-spirit who sees the connections that bind the world.'),
('asura_penitent', 'The Asura Penitent', 'A master architect who has turned from conflict to the art of creation.'),
('deva_vaidya', 'Dhanvantari''s Apprentice', 'A celestial physician who can diagnose and cure spiritual maladies.'),
('nyaya_atman', 'Gautama''s Atman', 'The disembodied spirit of a logician who analyzes the world through pure reason.'),
('brihaspati_pupil', 'Brihaspati''s Pupil', 'An eager scholar who knows the correct ritual for every occasion.'),
('carvaka_shade', 'The Cārvāka Shade', 'A witty, cynical heretic who questions everything.');
