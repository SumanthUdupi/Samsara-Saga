PRAGMA foreign_keys = OFF;
PRAGMA defer_foreign_keys = ON;

INSERT INTO Quests (id, title, giver_npc_id, description_template, objectives, karma_reward) VALUES
('eternal_bloom', 'The Eternal Bloom', 'village_elder', 'The celestial lotuses that bloom in Svarga are a sight to behold. They say a single petal can bring clarity to a troubled mind. If you are to begin your journey, you must see this for yourself. Travel to the celestial gardens and bring me back a petal.', '{"type": "FETCH", "item_id": 102, "quantity": 1}', 10),
('soma_herb_quest', 'The Luminous Herb', 'village_merchant', 'I seek a rare herb, the Soma Herb, said to glow with an inner light. It is vital for a special blend I am preparing. Bring me one, and I shall reward your efforts.', '{"type": "FETCH", "item_id": 108, "quantity": 1}', 5),
('chieftains_illness', 'The Chieftain''s Illness', 'vanara_chieftain', 'My strength fades... a strange lethargy grips my spirit. The Vaidya says only a Spiritual Poultice can cure me. Please, create one and bring it to me.', '{"type": "GIVE_ITEM", "item_id": 404, "quantity": 1}', 25);