import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

// (Keep the GEMINI_API_ENDPOINT and nakshatras array from the previous version here)
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;
const nakshatras = [ /* The full list of 27 nakshatras */ ];

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform.env.DB;
  const geminiApiKey = platform.env.GEMINI_API_KEY;

  try {
    const { actionType, payload } = await request.json(); // Payload can carry extra data
    const { results } = await db.prepare('SELECT id FROM Players ORDER BY created_at DESC LIMIT 1').all();
    if (!results || results.length === 0) return json({ error: 'No player found.' }, { status: 404 });
    const playerId = results[0].id as string;
    
    switch (actionType) {
      // (Keep LOOK_AROUND, MEDITATE, CHECK_INVENTORY cases from the previous version here)
      
      // NEW CASE for Movement
      case 'MOVE': {
        const targetLocationId = payload.targetLocationId;
        if (!targetLocationId) return json({ error: 'No target location specified.' }, { status: 400 });

        // Verify the move is valid
        const validMove = await db.prepare(
          `SELECT from_location_id FROM LocationConnections 
           WHERE from_location_id = (SELECT current_location_id FROM PlayerState WHERE player_id = ?) 
           AND to_location_id = ?`
        ).bind(playerId, targetLocationId).first();

        if (!validMove) {
          return json({ success: false, narrative: "You can't go that way." });
        }

        // Update player's location
        await db.prepare('UPDATE PlayerState SET current_location_id = ? WHERE player_id = ?')
          .bind(targetLocationId, playerId).run();
        
        return json({ success: true, message: 'You have moved.' });
      }

      default:
        return json({ error: 'Unknown action type.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Action processing failed:', error);
    return json({ error: 'An internal error occurred.' }, { status: 500 });
  }
};

async function callGemini(prompt: string, apiKey: string) { /* ... existing helper function ... */ }