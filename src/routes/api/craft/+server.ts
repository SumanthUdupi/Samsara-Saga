import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform.env.DB;
  const { recipeId } = await request.json();

  if (!recipeId) {
    return json({ message: 'Recipe ID is required' }, { status: 400 });
  }

  try {
    // --- Get Player ID ---
    const playerResult = await db.prepare('SELECT id FROM Players ORDER BY created_at DESC LIMIT 1').first();
    if (!playerResult) return json({ message: 'Player not found' }, { status: 404 });
    const playerId = playerResult.id as string;

    // --- Get Recipe ---
    const recipeResult = await db.prepare('SELECT * FROM Recipes WHERE id = ?').bind(recipeId).first();
    if (!recipeResult) return json({ message: 'Recipe not found' }, { status: 404 });
    const recipe = recipeResult;

    const ingredients = JSON.parse(recipe.ingredients as string);

    // --- Get Player Inventory ---
    const inventoryResults = await db.prepare('SELECT item_id, quantity FROM PlayerInventory WHERE player_id = ?').bind(playerId).all();
    const inventory = new Map(inventoryResults.results.map((item: any) => [item.item_id, item.quantity]));

    // --- Check if player has ingredients ---
    for (const ingredient of ingredients) {
      if (!inventory.has(ingredient.item_id) || inventory.get(ingredient.item_id) < ingredient.quantity) {
        return json({ message: 'Insufficient ingredients.' }, { status: 400 });
      }
    }

    // --- Update Inventory (this should be a transaction) ---
    for (const ingredient of ingredients) {
      const newQuantity = inventory.get(ingredient.item_id) - ingredient.quantity;
      if (newQuantity === 0) {
        await db.prepare('DELETE FROM PlayerInventory WHERE player_id = ? AND item_id = ?').bind(playerId, ingredient.item_id).run();
      } else {
        await db.prepare('UPDATE PlayerInventory SET quantity = ? WHERE player_id = ? AND item_id = ?').bind(newQuantity, playerId, ingredient.item_id).run();
      }
    }

    // Add crafted item
    const product_item_id = recipe.product_item_id as number;
    const existingProduct = await db.prepare('SELECT quantity FROM PlayerInventory WHERE player_id = ? AND item_id = ?').bind(playerId, product_item_id).first();

    if (existingProduct) {
      await db.prepare('UPDATE PlayerInventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?').bind(recipe.product_quantity, playerId, product_item_id).run();
    } else {
      await db.prepare('INSERT INTO PlayerInventory (player_id, item_id, quantity) VALUES (?, ?, ?)').bind(playerId, product_item_id, recipe.product_quantity).run();
    }

    return json({ message: 'Crafting successful!' });

  } catch (error) {
    console.error('Crafting failed:', error);
    return json({ message: 'An internal error occurred.' }, { status: 500 });
  }
};