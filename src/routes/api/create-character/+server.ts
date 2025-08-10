import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { createId } from '@paralleldrive/cuid2';

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform.env.DB;
  const { nakshatraId } = await request.json();

  if (!nakshatraId) {
    return json({ error: 'Nakshatra ID is required' }, { status: 400 });
  }

  const playerId = createId();
  const userEmail = `${playerId}@samsara-saga.com`; // Create a dummy email

  try {
    // Create a new player
    await db.prepare('INSERT INTO Players (id, email) VALUES (?, ?)')
      .bind(playerId, userEmail)
      .run();

    // Create the player's state
    await db.prepare('INSERT INTO PlayerState (player_id, nakshatra_id, current_location_id, karma_score) VALUES (?, ?, ?, ?)')
      .bind(playerId, nakshatraId, 1, 0) // Start at location 1 with 0 karma
      .run();

    return json({ success: true, playerId });
  } catch (error) {
    console.error('Character creation failed:', error);
    return json({ error: 'An internal error occurred.' }, { status: 500 });
  }
};