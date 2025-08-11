-- Add Nakshatras Table
CREATE TABLE IF NOT EXISTS Nakshatras (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    deity TEXT NOT NULL,
    symbol TEXT NOT NULL
);

-- Recreate PlayerState table with foreign key constraints
DROP TABLE IF EXISTS PlayerState;
CREATE TABLE PlayerState (
    player_id TEXT PRIMARY KEY,
    nakshatra_id INTEGER,
    karma_score INTEGER DEFAULT 0,
    current_location_id INTEGER,
    active_quests TEXT, -- Storing as a JSON array string e.g., '["quest1", "quest2"]
    FOREIGN KEY (player_id) REFERENCES Players(id),
    FOREIGN KEY (nakshatra_id) REFERENCES Nakshatras(id),
    FOREIGN KEY (current_location_id) REFERENCES Locations(id)
);

-- Recreate PlayerInventory table with foreign key constraints
DROP TABLE IF EXISTS PlayerInventory;
CREATE TABLE PlayerInventory (
    player_id TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (player_id, item_id),
    FOREIGN KEY (player_id) REFERENCES Players(id),
    FOREIGN KEY (item_id) REFERENCES Items(id)
);

-- Populate Nakshatras Table
INSERT OR IGNORE INTO Nakshatras (id, name, deity, symbol) VALUES
(1, 'Ashwini', 'Ashwini Kumaras', 'Horse''s head'),
(2, 'Bharani', 'Yama', 'Yoni, the female organ of reproduction'),
(3, 'Krittika', 'Agni', 'Knife or spear'),
(4, 'Rohini', 'Brahma', 'Cart or chariot'),
(5, 'Mrigashira', 'Chandra', 'Deer''s head'),
(6, 'Ardra', 'Rudra', 'Teardrop, diamond, a human head'),
(7, 'Punarvasu', 'Aditi', 'Bow and quiver'),
(8, 'Pushya', 'Brihaspati', 'Cow''s udder, lotus, arrow and circle'),
(9, 'Ashlesha', 'Sarpas or Nagas', 'Serpent'),
(10, 'Magha', 'Pitris', 'Royal Throne'),
(11, 'Purva Phalguni', 'Bhaga', 'Front legs of a bed, hammock'),
(12, 'Uttara Phalguni', 'Aryaman', 'Four legs of a bed, hammock'),
(13, 'Hasta', 'Savitar', 'Hand or fist'),
(14, 'Chitra', 'Vishvakarma', 'Bright jewel or pearl'),
(15, 'Swati', 'Vayu', 'Shoot of a plant, coral'),
(16, 'Vishakha', 'Indra and Agni', 'Triumphal arch, potter''s wheel'),
(17, 'Anuradha', 'Mitra', 'Triumphal archway, lotus'),
(18, 'Jyeshtha', 'Indra', 'Circular amulet, umbrella, earring'),
(19, 'Mula', 'Nirriti', 'Bunch of roots tied together, elephant goad'),
(20, 'Purva Ashadha', 'Apah', 'Elephant tusk, fan, winnowing basket'),
(21, 'Uttara Ashadha', 'Vishvadevas', 'Elephant tusk, small bed'),
(22, 'Shravana', 'Vishnu', 'Ear or three footprints'),
(23, 'Dhanishtha', 'Vasus', 'Drum or flute'),
(24, 'Shatabhisha', 'Varuna', 'Empty circle, 100 flowers or stars'),
(25, 'Purva Bhadrapada', 'Aja Ekapada', 'Swords or two front legs of a funeral cot, man with two faces'),
(26, 'Uttara Bhadrapada', 'Ahir Budhyana', 'Twins, back legs of a funeral cot, snake in the water'),
(27, 'Revati', 'Pushan', 'Fish or a pair of fish, drum');