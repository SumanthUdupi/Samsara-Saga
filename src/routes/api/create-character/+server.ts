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

    // --- Create a New Player ---
    // NOTE: In a real app, this ID would come from an authentication provider
    // after the user logs in. For now, we create a simple unique ID.
    const playerId = crypto.randomUUID();
    const playerEmail = `${playerId}@samsara.saga`; // Placeholder email

    await db.prepare('INSERT INTO Players (id, email) VALUES (?, ?)')
      .bind(playerId, playerEmail)
      .run();

    // --- Create the Player's Initial State ---
    // The player's journey begins in Bhūloka (let's say location_id 1)
    const initialLocationId = 1;

    await db.prepare(
        'INSERT INTO PlayerState (player_id, nakshatra_id, current_location_id, karma_score) VALUES (?, ?, ?, ?)'
      )
      .bind(playerId, nakshatraId, initialLocationId, 0)
      .run();

    // Respond with success and the new player's ID
    return json({ success: true, playerId: playerId }, { status: 201 });

  } catch (error) {
    console.error('Failed to create character:', error);
    return json({ error: 'An internal error occurred.' }, { status: 500 });
  }
};