PRAGMA foreign_keys = OFF;
PRAGMA defer_foreign_keys = ON;

INSERT INTO Recipes (id, product_item_id, product_quantity, ingredients) VALUES
(1, 401, 1, '[{"item_id": 101, "quantity": 1}, {"item_id": 103, "quantity": 1}]'),
(2, 402, 1, '[{"item_id": 1, "quantity": 1}, {"item_id": 2, "quantity": 1}]'),
(3, 203, 1, '[{"item_id": 106, "quantity": 1}, {"item_id": 3, "quantity": 2}]'),
(4, 403, 1, '[{"item_id": 107, "quantity": 3}, {"item_id": 103, "quantity": 1}]'),
(5, 404, 1, '[{"item_id": 108, "quantity": 1}, {"item_id": 103, "quantity": 1}]');