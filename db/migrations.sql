-- db/migrations.sql

-- Add a connection from Bhūloka to Svarga
INSERT INTO LocationConnections (from_location_id, to_location_id, description) VALUES
(3, 101, 'A hidden path seems to ascend not just the mountain, but the very fabric of reality, leading to a celestial place.');

-- Create the Quests table
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

-- Insert our first quest
INSERT INTO Quests (id, title, giver_npc_id, description_template, objectives, karma_reward) VALUES
('eternal_bloom', 'The Eternal Bloom', 'village_elder', 'The celestial lotuses that bloom in Svarga are a sight to behold. They say a single petal can bring clarity to a troubled mind. If you are to begin your journey, you must see this for yourself. Travel to the celestial gardens and bring me back a petal.', '{"type": "FETCH", "item_id": 102, "quantity": 1}', 10);
