import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getPlayerId } from '$lib/user';

interface Recipe {
    id: number; // Assuming recipe IDs are numbers
    product_item_id: number;
    product_quantity: number;
    ingredients: string; // JSON string
}

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform!.env.DB;
  const { recipeId } = await request.json();

  if (!recipeId) {
    return json({ message: 'Recipe ID is required' }, { status: 400 });
  }

  try {
    // --- Get Player ID ---
    const playerId = await getPlayerId(request, platform!);
    if (!playerId) return json({ message: 'Player not found' }, { status: 404 });

    // --- Get Recipe ---
    const recipeResult = await db.prepare('SELECT * FROM Recipes WHERE id = ?').bind(recipeId).first<Recipe>();
    if (!recipeResult) return json({ message: 'Recipe not found' }, { status: 404 });
    const recipe = recipeResult;

    let ingredients: any[];
    try {
      ingredients = JSON.parse(recipe.ingredients as string);
    } catch (e) {
      console.error('Error parsing recipe ingredients:', e);
      return json({ message: 'Invalid recipe data.' }, { status: 500 });
    }

    // --- Get Player Inventory ---
    const inventoryResults = await db.prepare('SELECT item_id, quantity FROM PlayerInventory WHERE player_id = ?').bind(playerId).all();
    const inventory = new Map<string, number>((inventoryResults.results as { item_id: string, quantity: number }[]).map(item => [item.item_id, item.quantity]));

    // --- Check if player has ingredients ---
    for (const ingredient of ingredients) {
      if (!inventory.has(ingredient.item_id) || (inventory.get(ingredient.item_id) ?? 0) < ingredient.quantity) {
        return json({ message: 'Insufficient ingredients.' }, { status: 400 });
      }
    }

    // --- Update Inventory (this should be a transaction) ---
    const statements = [];
    for (const ingredient of ingredients) {
      const newQuantity = (inventory.get(ingredient.item_id) ?? 0) - ingredient.quantity;
      if (newQuantity === 0) {
        statements.push(db.prepare('DELETE FROM PlayerInventory WHERE player_id = ? AND item_id = ?').bind(playerId, ingredient.item_id));
      } else {
        statements.push(db.prepare('UPDATE PlayerInventory SET quantity = ? WHERE player_id = ? AND item_id = ?').bind(newQuantity, playerId, ingredient.item_id));
      }
    }

    // Add crafted item
    const product_item_id = recipe.product_item_id as number;
    const existingProduct = await db.prepare('SELECT quantity FROM PlayerInventory WHERE player_id = ? AND item_id = ?').bind(playerId, product_item_id).first();

    if (existingProduct) {
      statements.push(db.prepare('UPDATE PlayerInventory SET quantity = quantity + ? WHERE player_id = ? AND item_id = ?').bind(recipe.product_quantity, playerId, product_item_id));
    } else {
      statements.push(db.prepare('INSERT INTO PlayerInventory (player_id, item_id, quantity) VALUES (?, ?, ?)').bind(playerId, product_item_id, recipe.product_quantity));
    }

    await db.batch(statements);

    await db.batch(statements);

    return json({ message: 'Crafting successful!' });

  } catch (error) {
    console.error('Crafting failed:', error);
    return json({ message: 'An internal error occurred.' }, { status: 500 });
  }
};