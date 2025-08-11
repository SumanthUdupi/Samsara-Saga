DROP TABLE IF EXISTS Players;
DROP TABLE IF EXISTS PlayerState;
DROP TABLE IF EXISTS PlayerInventory;
DROP TABLE IF EXISTS NPC_Conversations;
DROP TABLE IF EXISTS Locations;
DROP TABLE IF EXISTS Items;
DROP TABLE IF EXISTS Recipes;
DROP TABLE IF EXISTS LocationConnections;
DROP TABLE IF EXISTS NPCs;
DROP TABLE IF EXISTS Quests;
DROP TABLE IF EXISTS LocationItems;
DROP TABLE IF EXISTS Companions;
DROP TABLE IF EXISTS PlayerCompanions;

CREATE TABLE Players (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE TABLE PlayerState (
    player_id TEXT PRIMARY KEY,
    nakshatra_id INTEGER,
    karma_score INTEGER DEFAULT 0,
    current_location_id INTEGER,
    active_quests TEXT -- Storing as a JSON array string e.g., '["quest1", "quest2"]'
);

CREATE TABLE PlayerInventory (
    player_id TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (player_id, item_id),
    FOREIGN KEY (player_id) REFERENCES Players(id)
);

CREATE TABLE NPC_Conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id TEXT NOT NULL,
    npc_id TEXT NOT NULL,
    history TEXT, -- Storing as a JSON array of conversation turns
    UNIQUE (player_id, npc_id),
    FOREIGN KEY (player_id) REFERENCES Players(id)
);

-- #####################################################################
-- ## EXPANDED GAME WORLD DATA
-- #####################################################################

-- Game World Data Tables
CREATE TABLE Locations (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE Items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL -- e.g., 'offering', 'crafting', 'key', 'tool', 'artifact'
);

CREATE TABLE Recipes (
  id INTEGER PRIMARY KEY,
  product_item_id INTEGER NOT NULL,
  product_quantity INTEGER DEFAULT 1,
  ingredients TEXT NOT NULL, -- Stored as a JSON array string
  FOREIGN KEY (product_item_id) REFERENCES Items(id)
);

CREATE TABLE NPCs (
  id TEXT PRIMARY KEY, -- A unique string ID like 'village_elder'
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location_id INTEGER NOT NULL,
  FOREIGN KEY (location_id) REFERENCES Locations(id)
);

CREATE TABLE Quests (
    id TEXT PRIMARY KEY, -- A unique string ID like 'gather_lotus_petals'
    title TEXT NOT NULL,
    giver_npc_id TEXT NOT NULL,
    -- A template for the AI to use when describing the quest
    description_template TEXT NOT NULL,
    -- JSON defining the objectives: e.g., {"type": "FETCH", "item_id": 102, "quantity": 1}
    objectives TEXT NOT NULL,
    karma_reward INTEGER DEFAULT 0,
    FOREIGN KEY (giver_npc_id) REFERENCES NPCs(id)
);

CREATE TABLE LocationItems (
  location_id INTEGER NOT NULL,
  item_id INTEGER NOT NULL,
  PRIMARY KEY (location_id, item_id),
  FOREIGN KEY (location_id) REFERENCES Locations(id),
  FOREIGN KEY (item_id) REFERENCES Items(id)
);

-- NEW: A static table to define all companions
CREATE TABLE Companions (
    id TEXT PRIMARY KEY, -- e.g., 'vanara_kavi'
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL
);

-- NEW: A table to track the player's relationship with companions
CREATE TABLE PlayerCompanions (
    player_id TEXT NOT NULL,
    companion_id TEXT NOT NULL,
    status TEXT NOT NULL, -- 'locked', 'unlocked', or 'active'
    PRIMARY KEY (player_id, companion_id),
    FOREIGN KEY (player_id) REFERENCES Players(id),
    FOREIGN KEY (companion_id) REFERENCES Companions(id)
);

-- MODIFICATION: Add an 'is_hidden' flag to LocationConnections for Kavi's ability
CREATE TABLE LocationConnections (
  from_location_id INTEGER NOT NULL,
  to_location_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT 0, -- 0 for false, 1 for true
  PRIMARY KEY (from_location_id, to_location_id),
  FOREIGN KEY (from_location_id) REFERENCES Locations(id),
  FOREIGN KEY (to_location_id) REFERENCES Locations(id)
);

-- Now, all INSERT statements, ordered by dependency

INSERT INTO Locations (id, name, description) VALUES
(1, 'A Quiet Village Outskirts', 'The dust of a well-trod path settles around you. Before you lies a small, quiet village, nestled between a dense forest and a gently flowing river. The air is still, carrying the scent of woodsmoke and damp earth. This is where your journey begins.'),
(2, 'The Banks of the Ganges', 'The sacred river flows before you, its waters a shimmering ribbon of silver under the sun. The air hums with distant chants and the scent of marigold offerings. Pilgrims line the stone ghats, their faith a palpable presence.'),
(3, 'Himalayan Foothills', 'The air grows thin and crisp. Snow-dusted peaks loom like silent giants against the deep blue sky. A narrow path winds upwards towards a secluded cave, a place of profound silence and meditation.'),
(4, 'Ancient Banyan Grove', 'You stand amidst a grove of ancient Banyan trees, whose aerial roots have created a labyrinth of woody columns. The canopy is so dense that sunlight dabbles the floor in shifting patterns, and a deep, peaceful silence reigns.'),
(5, 'Forgotten Kurukshetra Field', 'A vast, windswept plain stretches before you, unnaturally silent. Rusted arrowheads and broken chariot wheels lie half-buried in the soil. A profound sorrow hangs in the air, an echo of a dharma-defining war fought eons ago.'),
(6, 'Rishi''s Ashram', 'Tucked away in a forest clearing is a humble ashram. Small huts made of mud and thatch surround a central fire pit. The air is clean, filled with the scent of burning herbs and the low murmur of mantras.'),
(101, 'Gardens of Nandanvan', 'You are in a celestial garden where the grass chimes softly with every step. Wish-fulfilling Kalpavriksha trees shimmer with an inner light, and the air is thick with the intoxicating fragrance of divine Parijata flowers.'),
(102, 'Indra''s Court (Sudharma)', 'Before you are the golden gates of Sudharma, the grand hall of Indra. The architecture defies mortal comprehension, built from solidified sunlight and cloud. Celestial music drifts from within, a melody of pure joy.'),
(103, 'Airavata''s Stable', 'A structure of woven moonlight and mist serves as the stable for Airavata, the divine white elephant. The air crackles with celestial energy and the scent of storms, the beast''s native element.'),
(104, 'The Lake of Celestial Lotuses', 'A perfectly still lake reflects a sky you cannot see. Upon its surface float enormous lotuses, their petals glowing with a soft, internal light. Each bloom is a universe of color and scent.'),
(105, 'Apsara''s Rehearsal Hall', 'A pavilion of polished moonstone stands open to the celestial winds. Here, the Apsaras, celestial dancers of unmatched grace, practice their art. The very air seems to move in time with their silent rhythm.'),
(201, 'A Gem-Studded Cavern', 'You are in a vast cavern deep beneath the earth, but it is far from dark. The walls are studded with enormous, glowing gems that bathe the space in a soft, multicolored light, revealing intricate carvings made by ancient hands.'),
(202, 'The Sunless Jungle', 'A dense, bioluminescent jungle thrives in the underworld''s ambient light. Strange, beautiful flora pulse with soft colors, and the air is humid and alive with the chirps and calls of unseen creatures.'),
(203, 'Before the Naga City', 'A colossal gate carved in the likeness of a coiled serpent blocks your path. This is the entrance to Bhogavati, a city of the wise Nāgas. The silence here is ancient, heavy with esoteric knowledge.'),
(204, 'The Asura Forges', 'The air is hot and tastes of metal and ozone. In a vast, volcanic cavern, Asura smiths hammer away at impossible metals, crafting weapons that sing with contained power. The rhythmic clang is the realm''s heartbeat.'),
(205, 'Subterranean River of Souls', 'A silent, black river flows through a massive cavern. On its surface float dim lights, said to be the reflections of souls passing between worlds. To gaze into its depths is to gaze into the abyss of time itself.'),
(7, 'Village Market', 'The heart of the village, bustling with activity. Stalls overflow with colorful fabrics, fragrant spices, and handcrafted goods. The air is filled with the chatter of merchants and the aroma of exotic foods.'),
(8, 'Whispering Glade', 'A secluded glade where ancient trees whisper secrets in the breeze. Rare flora thrives here, bathed in a soft, ethereal light.');

INSERT INTO Items (id, name, description, type) VALUES
(1, 'A Simple Offering Bowl', 'A humble clay bowl, suitable for presenting flowers or water to a deity. It feels cool and grounding to the touch.', 'offering'),
(2, 'Modak Sweet', 'A sweet rice flour dumpling filled with coconut and jaggery. It is known to be a favorite offering for Lord Ganesha.', 'offering'),
(3, 'Vibhuti', 'A pinch of sacred ash from a ritual fire (yajña). It represents the temporary nature of the physical body and is a symbol of detachment.', 'offering'),
(4, 'Bilva Leaf', 'A trifoliate leaf from the sacred Bael tree, deeply associated with Lord Shiva. Offering it is said to soothe the fiercest of deities.', 'offering'),
(5, 'Garland of Parijata Flowers', 'Flowers from the celestial Nandanvan gardens that never wilt. Their fragrance is said to calm even the most troubled heart.', 'offering'),
(101, 'Handful of Samidhā Wood', 'A small bundle of dried twigs from a sacred Banyan tree, traditionally used as fuel for ritual fires. It smells of ancient earth.', 'crafting'),
(102, 'Celestial Lotus Petal', 'A single, iridescent petal from a lotus that grows only in the tranquil gardens of Svarga. It hums with a faint, calming energy.', 'crafting'),
(103, 'Vial of Celestial Ganges Water', 'A crystalline vial containing pure, shimmering water drawn from the celestial river that flows through Svarga. It is said to wash away spiritual impurities.', 'crafting'),
(104, 'Himalayan Shilajit Stone', 'A dark, resinous stone found only at the highest altitudes. It contains the compressed essence of ancient medicinal herbs and cosmic energy.', 'crafting'),
(105, 'Unforged Panch-dhatu', 'A rough ingot of the five sacred metals: gold, silver, copper, iron, and lead. It is spiritually potent but requires a master artisan to shape.', 'crafting'),
(106, 'Asura-Forged Iron Shard', 'A fragment of dark metal from the forges of Patala. It is unnaturally hard and seems to absorb light.', 'crafting'),
(107, 'Powdered Moonstone', 'Moonstone from a celestial peak, ground into a fine, shimmering powder. It is cool to the touch and glows faintly.', 'crafting'),
(201, 'Rudraksha Japamala', 'A string of 108 beads made from the seeds of the Rudraksha tree, used for counting mantras. Each bead feels alive with spiritual vibrations.', 'tool'),
(202, 'Small Ritual Conch', 'The shell of a small sea creature, polished to a pearlescent sheen. When blown, its tone is said to dispel negative energy.', 'tool'),
(203, 'Yantra of Warding', 'A small copper plate inscribed with a complex geometric diagram. It offers minor protection against malevolent spirits.', 'tool'),
(301, 'Faded Temple Map', 'A brittle piece of parchment showing the layout of a forgotten temple. The ink has faded, and only a few key landmarks are still visible.', 'key'),
(302, 'Naga''s Scale', 'A single, jewel-like scale, shed by a wise Naga from the depths of Patala. It shimmers with an otherworldly light and feels unnaturally smooth.', 'key'),
(303, 'Rishi''s Lost Manuscript', 'A bundle of palm leaves tied with a simple cord, covered in esoteric script. It seems to detail a powerful, long-forgotten ritual.', 'key'),
(401, 'Purified Offering Components', 'Samidhā wood blessed with celestial water. It is now ready for a sacred ritual, humming with potential.', 'crafting'),
(402, 'Ganesha''s Modak Offering', 'A perfectly crafted Modak sweet, presented in a humble offering bowl. This act of devotion is sure to please the remover of obstacles.', 'offering'),
(403, 'Talisman of Clarity', 'A polished moonstone pendant, consecrated with sacred water. It is said to help the wearer see through minor illusions.', 'tool'),
(901, 'Panchajanya (Fragment)', 'A shard from the legendary conch of Vishnu. It reverberates with the primordial sound of creation, Om. Even this small piece holds immense power.', 'artifact'),
(108, 'Giri-Karnika Root', 'A tough, gnarled root that grows only on sun-facing cliffs. It has powerful curative properties.', 'crafting'),
(404, 'Spiritual Poultice', 'A fragrant paste made from sacred herbs and water. It is said to cure ailments that are spiritual in origin.', 'key');

INSERT INTO NPCs (id, name, description, location_id) VALUES
('village_elder', 'The Village Elder', 'An old woman with kind, knowing eyes sits under the shade of a large Banyan tree, weaving a simple basket. She seems to be a permanent fixture of this tranquil place.', 1),
('warrior_spirit', 'A Restless Spirit', 'A translucent, armored figure hovers over the soil of the ancient battlefield, clutching a spectral bow. A deep sorrow emanates from it.', 5),
('rishi_narada', 'Narada the Sage', 'A cheerful Rishi with a mischievous twinkle in his eye rests here, a simple veena across his lap. His presence feels both ancient and full of vibrant energy.', 6),
('gandharva_chitrasena', 'Chitrasena, the Musician', 'A Gandharva with a divinely resonant voice stands overlooking the celestial gardens, composing a melody on a flute made of pure light. His music seems to make the very air shimmer.', 101),
('apsara_urvashi', 'Urvashi, the Dancer', 'The legendary Apsara, Urvashi, practices a complex dance within the moonstone hall. Her movements are impossibly graceful, each one a story in itself.', 105),
('asura_maya', 'Maya, the Architect', 'The great Asura architect, Maya, stands before a massive forge, his eyes scrutinizing a complex blueprint etched in glowing lines upon a basalt slab. He radiates an aura of intense, creative genius.', 204),
('naga_takshaka', 'Takshaka of the Nagas', 'The Naga King, Takshaka, watches you from the entrance to his city. His scales shimmer like a thousand emeralds, and his ancient eyes hold the vast, deep secrets of the underworld.', 203),
('village_merchant', 'The Spice Merchant', 'A jovial merchant with a neatly trimmed beard, surrounded by sacks of aromatic spices. He greets passersby with a warm smile and a keen eye for trade.', 7),
('vanara_chieftain', 'The Vanara Chieftain', 'The proud leader of the Vanara tribe sits leaning against a tree, his breathing shallow. He is clearly suffering from a strange illness.', 4);

INSERT INTO Quests (id, title, giver_npc_id, description_template, objectives, karma_reward) VALUES
('eternal_bloom', 'The Eternal Bloom', 'village_elder', 'The celestial lotuses that bloom in Svarga are a sight to behold. They say a single petal can bring clarity to a troubled mind. If you are to begin your journey, you must see this for yourself. Travel to the celestial gardens and bring me back a petal.', '{"type": "FETCH", "item_id": 102, "quantity": 1}', 10),
('soma_herb_quest', 'The Luminous Herb', 'village_merchant', 'I seek a rare herb, the Soma Herb, said to glow with an inner light. It is vital for a special blend I am preparing. Bring me one, and I shall reward your efforts.', '{"type": "FETCH", "item_id": 108, "quantity": 1}', 5),
('chieftains_illness', 'The Chieftain''s Illness', 'vanara_chieftain', 'My strength fades... a strange lethargy grips my spirit. The Vaidya says only a Spiritual Poultice can cure me. Please, create one and bring it to me.', '{"type": "GIVE_ITEM", "item_id": 404, "quantity": 1}', 25);

INSERT INTO Recipes (id, product_item_id, product_quantity, ingredients) VALUES
(1, 401, 1, '[{"item_id": 101, "quantity": 1}, {"item_id": 103, "quantity": 1}]'),
(2, 402, 1, '[{"item_id": 1, "quantity": 1}, {"item_id": 2, "quantity": 1}]'),
(3, 203, 1, '[{"item_id": 106, "quantity": 1}, {"item_id": 3, "quantity": 2}]'),
(4, 403, 1, '[{"item_id": 107, "quantity": 3}, {"item_id": 103, "quantity": 1}]'),
(5, 404, 1, '[{"item_id": 108, "quantity": 1}, {"item_id": 103, "quantity": 1}]');

INSERT INTO LocationConnections (from_location_id, to_location_id, description, is_hidden) VALUES
(1, 2, 'A well-trod path leads towards the sound of flowing water.', 0),
(1, 4, 'A shadowy trail disappears into a dense grove of trees.', 0),
(1, 6, 'A faint plume of smoke rises from a clearing deep in the forest.', 0),
(2, 1, 'The path leads back to the village outskirts.', 0),
(2, 3, 'A steep, winding path ascends into the mountains.', 0),
(3, 2, 'The path descends back towards the sacred river.', 0),
(4, 1, 'A familiar path leads back to the village.', 0),
(101, 102, 'A bridge of pure light leads towards a golden palace.', 0),
(102, 101, 'A path of light returns to the celestial gardens.', 0),
(201, 202, 'A low tunnel opens into a humid, glowing jungle.', 0),
(202, 201, 'A path through the glowing flora leads back to the gem-studded cavern.', 0),
(202, 203, 'An ancient, paved road leads to a colossal serpent gate.', 0),
(3, 101, 'A hidden path seems to ascend not just the mountain, but the very fabric of reality, leading to a celestial place.', 0),
(1, 7, 'A well-worn path leads into the lively village market.', 0),
(7, 1, 'The path leads back to the quiet outskirts of the village.', 0),
(4, 8, 'A barely visible path leads deeper into the ancient grove, towards a whispering glade.', 0),
(8, 4, 'The path winds back to the ancient banyan grove.', 0),
(4, 3, 'A series of ancient, overgrown handholds lead up the cliff face.', 1);

INSERT INTO LocationItems (location_id, item_id) VALUES
(101, 102);

INSERT INTO Companions (id, name, title, description) VALUES
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