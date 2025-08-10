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

DROP TABLE IF EXISTS Items;
CREATE TABLE Items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL -- e.g., 'offering', 'crafting', 'key', 'tool', 'artifact'
);

-- Insert a rich variety of intricate items
INSERT INTO Items (id, name, description, type) VALUES

-- Ritual & Offering Items
(1, 'A Simple Offering Bowl', 'A humble clay bowl, suitable for presenting flowers or water to a deity. It feels cool and grounding to the touch.', 'offering'),
(2, 'Modak Sweet', 'A sweet rice flour dumpling filled with coconut and jaggery. It is known to be a favorite offering for Lord Ganesha.', 'offering'),
(3, 'Vibhuti', 'A pinch of sacred ash from a ritual fire (yajña). It represents the temporary nature of the physical body and is a symbol of detachment.', 'offering'),
(4, 'Bilva Leaf', 'A trifoliate leaf from the sacred Bael tree, deeply associated with Lord Shiva. Offering it is said to soothe the fiercest of deities.', 'offering'),

-- Crafting Materials
(101, 'Handful of Samidhā Wood', 'A small bundle of dried twigs from a sacred Banyan tree, traditionally used as fuel for ritual fires. It smells of ancient earth.', 'crafting'),
(102, 'Celestial Lotus Petal', 'A single, iridescent petal from a lotus that grows only in the tranquil gardens of Svarga. It hums with a faint, calming energy.', 'crafting'),
(103, 'Vial of Celestial Ganges Water', 'A crystalline vial containing pure, shimmering water drawn from the celestial river that flows through Svarga. It is said to wash away spiritual impurities.', 'crafting'),
(104, 'Himalayan Shilajit Stone', 'A dark, resinous stone found only at the highest altitudes of the Himalayas. It contains the compressed essence of ancient medicinal herbs and cosmic energy.', 'crafting'),
(105, 'Unforged Panch-dhatu', 'A rough ingot of the five sacred metals: gold, silver, copper, iron, and lead. It is spiritually potent but requires a master artisan to shape.', 'crafting'),

-- Spiritual Tools
(201, 'Rudraksha Japamala', 'A string of 108 beads made from the seeds of the Rudraksha tree, used for counting mantras during meditation. Each bead feels alive with spiritual vibrations.', 'tool'),
(202, 'Small Ritual Conch', 'The shell of a small sea creature, polished to a pearlescent sheen. When blown, it produces a clear, resonant tone said to dispel negative energy.', 'tool'),

-- Quest & Key Items
(301, 'Faded Temple Map', 'A brittle piece of parchment showing the layout of a forgotten temple. The ink has faded, and only a few key landmarks are still visible.', 'key'),
(302, 'Naga''s Scale', 'A single, jewel-like scale, shed by a wise Naga from the depths of Patala. It shimmers with an otherworldly light and feels unnaturally smooth.', 'key'),

-- Legendary Artifacts (for future epic quests)
(901, 'Panchajanya (Fragment)', 'A shard from the legendary conch of Vishnu. It reverberates with the primordial sound of creation, Om. Even this small piece holds immense power.', 'artifact');