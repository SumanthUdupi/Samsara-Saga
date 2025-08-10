-- db/schema.sql

DROP TABLE IF EXISTS Locations;
CREATE TABLE Locations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

-- Insert locations for all three realms based on the GDD
INSERT INTO Locations (id, name, description) VALUES

-- Bhūloka (The Earthly Realm)
(1, 'A Quiet Village Outskirts', 'The dust of a well-trod path settles around you. Before you lies a small, quiet village, nestled between a dense forest and a gently flowing river. The air is still, carrying the scent of woodsmoke and damp earth. This is where your journey begins.'),
(2, 'The Banks of the Ganges', 'The sacred river flows before you, its waters a shimmering ribbon of silver under the sun. The air hums with distant chants and the scent of marigold offerings. Pilgrims line the stone ghats, their faith a palpable presence.'),
(3, 'Himalayan Foothills', 'The air grows thin and crisp. Snow-dusted peaks loom like silent giants against the deep blue sky. A narrow path winds upwards towards a secluded cave, a place of profound silence and meditation.'),

-- Svarga (The Celestial Realm)
(101, 'Gardens of Svarga', 'You stand in a celestial garden where the grass chimes softly with every step. Wish-fulfilling Kalpavriksha trees shimmer with an inner light, and the air is thick with the intoxicating fragrance of divine lotuses.'),
(102, 'Indra\'s Court', 'Before you are the golden gates of Sudharma, the grand hall of Indra. The architecture defies mortal comprehension, built from solidified sunlight and cloud. Celestial music drifts from within, a melody of pure joy.'),

-- Patala (The Netherworld)
(201, 'A Gem-Studded Cavern', 'You are in a vast cavern deep beneath the earth, but it is far from dark. The walls are studded with enormous, glowing gems that bathe the space in a soft, multicolored light, revealing intricate carvings made by ancient hands.'),
(202, 'The Sunless Jungle', 'A dense, bioluminescent jungle thrives in the underworld\'s ambient light. Strange, beautiful flora pulse with soft colors, and the air is humid and alive with the chirps and calls of unseen creatures.'),
(203, 'Before the Naga City', 'A colossal gate carved in the likeness of a coiled serpent blocks your path. This is the entrance to a city of the wise and ancient Nāgas. The silence here is ancient, heavy with esoteric knowledge and secrets.');