import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform }) => {
  const db = platform.env.DB;

  try {
    const { results } = await db.prepare(`
      SELECT
        r.id,
        i.name as product_name,
        i.description as product_description,
        r.ingredients
      FROM Recipes r
      JOIN Items i ON r.product_item_id = i.id
    `).all();

    return json({ recipes: results });
  } catch (error) {
    console.error('Failed to fetch recipes:', error);
    return json({ error: 'An internal error occurred.' }, { status: 500 });
  }
};