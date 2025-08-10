import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, platform }) => {
  try {
    const db = platform.env.DB;
    const body = await request.json();
    const { nakshatraId } = body;

    if (!nakshatraId || typeof nakshatraId !== 'number' || nakshatraId < 1 || nakshatraId > 27) {
      return json({ error: 'Invalid Nakshatra ID provided.' }, { status: 400 });
    }

    const playerId = crypto.randomUUID();
    const playerEmail = `${playerId}@samsara.saga`; // Placeholder

    await db.prepare('INSERT INTO Players (id, email) VALUES (?, ?)')
      .bind(playerId, playerEmail)
      .run();

    const initialLocationId = 1;
    await db.prepare(
        'INSERT INTO PlayerState (player_id, nakshatra_id, current_location_id, karma_score) VALUES (?, ?, ?, ?)'
      )
      .bind(playerId, nakshatraId, initialLocationId, 0)
      .run();

    await db.prepare('INSERT INTO PlayerInventory (player_id, item_id, quantity) VALUES (?, ?, ?)')
      .bind(playerId, 1, 1) // Give starting item: Offering Bowl
      .run();

    return json({ success: true, playerId: playerId }, { status: 201 });
  } catch (error: any) {
    console.error('Failed to create character:', error);
    // IMPORTANT CHANGE: We are now sending the specific error message back.
    // This is great for debugging but should be changed to a generic message
    // before a public launch for security reasons.
    return json({ error: error.message }, { status: 500 });
  }
};