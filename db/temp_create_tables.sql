PRAGMA foreign_keys = OFF;
PRAGMA defer_foreign_keys = ON;

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