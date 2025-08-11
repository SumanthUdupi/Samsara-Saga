PRAGMA foreign_keys = OFF;
PRAGMA defer_foreign_keys = ON;

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