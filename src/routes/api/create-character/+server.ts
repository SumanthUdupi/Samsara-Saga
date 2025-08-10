import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform.env.DB;
  const geminiApiKey = platform.env.GEMINI_API_KEY;

  try {
    const { actionType } = await request.json();

    // --- Get the Player ---
    // IMPORTANT: Temporarily grabbing the most recent player.
    // This will be replaced by a real authentication system later.
    const { results } = await db.prepare('SELECT id FROM Players ORDER BY created_at DESC LIMIT 1').all();
    if (!results || results.length === 0) {
      return json({ error: 'No player found.' }, { status: 404 });
    }
    const playerId = results[0].id;

    // --- Process the Action ---
    switch (actionType) {
      case 'LOOK_AROUND': {
        // 1. Get current location context from DB
        const stmt = db.prepare(`
          SELECT Locations.description 
          FROM PlayerState 
          JOIN Locations ON PlayerState.current_location_id = Locations.id
          WHERE PlayerState.player_id = ?
        `);
        const locationInfo = await stmt.bind(playerId).first<{ description: string }>();

        if (!locationInfo) {
          return json({ error: "Could not find player's location." }, { status: 404 });
        }

        // 2. Construct a prompt for the Gemini API
        const prompt = `You are a master storyteller crafting immersive narratives for a text-based game inspired by Hindu philosophy and metaphysics. Given the following location description, write a short, vivid, and poetic paragraph (2–3 sentences) that reveals what a wandering soul might perceive upon closer inspection. Focus on a single, striking sensory detail—such as a subtle sound, an ancient scent, or a metaphysical feeling—that unveils a hidden layer of the scene. Do not repeat or paraphrase the original description. Instead, channel the soul’s heightened awareness and spiritual intuition to uncover something ephemeral, sacred, or surreal.
Location:"${locationInfo.description}"

Your Observation:`;

        // 3. Call the Gemini API
        const geminiResponse = await fetch(`${GEMINI_API_ENDPOINT}?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        if (!geminiResponse.ok) {
          console.error('Gemini API Error:', await geminiResponse.text());
          throw new Error('Failed to get response from AI.');
        }

        const geminiData = await geminiResponse.json();
        const generatedText = geminiData.candidates[0].content.parts[0].text;
        
        // 4. Return the generated text
        return json({ success: true, narrative: generatedText.trim() });
      }

      default:
        return json({ error: 'Unknown action type.' }, { status: 400 });
    }

  } catch (error) {
    console.error('Action processing failed:', error);
    return json({ error: 'An internal error occurred.' }, { status: 500 });
  }
};