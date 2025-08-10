import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent`;

// Prompt Templates
const LOOK_AROUND_PROMPT_TEMPLATE = `You are a master storyteller crafting immersive narratives for a text-based game inspired by Hindu philosophy. The player is a soul on a journey to moksha, their perception heightened to the subtle currents of the cosmos.

**Location Context**: The soul is currently in [Location Name], described as: "[Location Description]"

**Task**: Write a short, vivid, and poetic paragraph (2–3 sentences) revealing what the soul perceives upon closer inspection. Focus on a single, striking sensory detail—a sound, scent, texture, or metaphysical feeling—that unveils a hidden layer of the scene.

**Constraints**:
- Do not repeat or paraphrase the original location description.
- The tone must be evocative, mystical, and slightly surreal.
- The observation should hint at the location's deeper spiritual nature (e.g., the purity of Svarga, the ancient magic of Patala, the grounded reality of Bhūloka).

**Output**:
Your Observation:`;

const MEDITATE_PROMPT_TEMPLATE = (nakshatraName: string, nakshatraNature: string, karmaScore: number) => `You are a wise Guru guiding a soul's meditation in a text-based game about Hindu philosophy. The soul is reflecting inward to better understand its nature and its place in the cosmos.

**Player Context**:
- **Nakshatra**: ${nakshatraName}
- **Core Nature**: ${nakshatraNature} (e.g., Cruel, Gentle, Fixed, Movable)
- **Current Karma**: ${karmaScore}

**Task**: Generate a short, insightful, and calming meditative vignette (2 sentences). The reflection should connect the soul's core nature (from their Nakshatra) to a simple, metaphorical image.

**Constraints**:
- If the Karma is high, the tone should be encouraging and affirm their dharmic path.
- If the Karma is low, the tone should be gently cautionary, hinting at the challenges their nature presents.
- Do not use the words "karma," "Nakshatra," or the name of the nature itself. The feeling should be allegorical.

**Output**:
Your Insight:`;

// We need this data on the server to give the AI context about the player's Nakshatra
const nakshatras = [
    { id: 1, name: 'Ashwini', nature: 'Short', deity: 'Ashwini Kumaras' },
    { id: 2, name: 'Bharani', nature: 'Cruel', deity: 'Yama' },
    { id: 3, name: 'Krittika', nature: 'Ordinary', deity: 'Agni' },
    { id: 4, name: 'Rohini', nature: 'Fixed', deity: 'Brahma/Prajapati' },
    { id: 5, name: 'Mrigashira', nature: 'Gentle', deity: 'Soma/Chandra' },
    { id: 6, name: 'Ardra', nature: 'Ferocious', deity: 'Rudra' },
    { id: 7, name: 'Punarvasu', nature: 'Movable', deity: 'Aditi' },
    { id: 8, name: 'Pushya', nature: 'Short', deity: 'Brihaspati' },
    { id: 9, name: 'Ashlesha', nature: 'Ferocious', deity: 'Nagas/Sarpas' },
    { id: 10, name: 'Magha', nature: 'Cruel', deity: 'Pitris (Ancestors)' },
    { id: 11, name: 'Purva Phalguni', nature: 'Cruel', deity: 'Bhaga' },
    { id: 12, name: 'Uttara Phalguni', nature: 'Fixed', deity: 'Aryaman' },
    { id: 13, name: 'Hasta', nature: 'Short', deity: 'Savitr/Surya' },
    { id: 14, name: 'Chitra', nature: 'Gentle', deity: 'Tvashtar/Vishvakarma' },
    { id: 15, name: 'Swati', nature: 'Movable', deity: 'Vayu' },
    { id: 16, name: 'Vishakha', nature: 'Ordinary', deity: 'Indra & Agni' },
    { id: 17, name: 'Anuradha', nature: 'Gentle', deity: 'Mitra' },
    { id: 18, name: 'Jyeshtha', nature: 'Ferocious', deity: 'Indra' },
    { id: 19, name: 'Mula', nature: 'Ferocious', deity: 'Nirriti' },
    { id: 20, name: 'Purva Ashadha', nature: 'Cruel', deity: 'Apah (Water)' },
    { id: 21, name: 'Uttara Ashadha', nature: 'Fixed', deity: 'Vishvadevas' },
    { id: 22, name: 'Shravana', nature: 'Movable', deity: 'Vishnu' },
    { id: 23, name: 'Dhanishtha', nature: 'Movable', deity: 'The Eight Vasus' },
    { id: 24, name: 'Shatabhisha', nature: 'Movable', deity: 'Varuna' },
    { id: 25, name: 'Purva Bhadrapada', nature: 'Cruel', deity: 'Aja Ekapada' },
    { id: 26, name: 'Uttara Bhadrapada', nature: 'Fixed', deity: 'Ahirbudhnya' },
    { id: 27, name: 'Revati', nature: 'Gentle', deity: 'Pushan' }
];

export const POST: RequestHandler = async ({ request, platform }) => {
  const db = platform.env.DB;
  const geminiApiKey = platform.env.GEMINI_API_KEY;

  try {
    const { actionType, payload } = await request.json();

    // --- Get the Player ---
    const playerResult = await db.prepare('SELECT id FROM Players ORDER BY created_at DESC LIMIT 1').first();
    if (!playerResult) return json({ error: 'No player found.' }, { status: 404 });
    const playerId = playerResult.id as string;

    // --- Process the Action ---
    switch (actionType) {
      case 'LOOK_AROUND': {
        const locationInfo = await db.prepare(`
          SELECT Locations.name, Locations.description 
          FROM PlayerState JOIN Locations ON PlayerState.current_location_id = Locations.id
          WHERE PlayerState.player_id = ?
        `).bind(playerId).first<{ name: string, description: string }>();

        if (!locationInfo) return json({ error: "Could not find player's location." }, { status: 404 });

        const prompt = LOOK_AROUND_PROMPT_TEMPLATE.replace('[Location Name]', locationInfo.name)
                                            .replace('[Location Description]', locationInfo.description);

        const geminiData = await callGemini(prompt, geminiApiKey);
        const generatedText = geminiData.candidates[0].content.parts[0].text;
        return json({ success: true, narrative: generatedText.trim() });
      }

      case 'MEDITATE': {
        // 1. Update player's karma score in the database
        const updateResult = await db.prepare(
          'UPDATE PlayerState SET karma_score = karma_score + 1 WHERE player_id = ? RETURNING karma_score'
        ).bind(playerId).first();
        const newKarmaScore = updateResult.karma_score;

        // 2. Get player's Nakshatra for personalized meditation text
        const playerInfo = await db.prepare('SELECT nakshatra_id FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ nakshatra_id: number }>();
        const nakshatra = nakshatras.find(n => n.id === playerInfo?.nakshatra_id);

        // 3. Construct a new prompt for a meditative experience
        const prompt = MEDITATE_PROMPT_TEMPLATE(nakshatra?.name || 'Unknown', nakshatra?.nature || 'Unknown', newKarmaScore);

        const geminiData = await callGemini(prompt, geminiApiKey);
        const generatedText = geminiData.candidates[0].content.parts[0].text;

        // 4. Return the new karma score and the narrative
        return json({ success: true, narrative: generatedText.trim(), newKarmaScore: newKarmaScore });
      }

      case 'CHECK_INVENTORY': {
        const inventoryResults = await db.prepare(`
          SELECT
            i.name,
            i.description,
            pi.quantity
          FROM PlayerInventory pi
          JOIN Items i ON pi.item_id = i.id
          WHERE pi.player_id = ?
        `).bind(playerId).all();

        return json({ success: true, inventory: inventoryResults.results });
      }
      
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

// Helper function to call the Gemini API
async function callGemini(prompt: string, apiKey: string) {
  const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });
  if (!response.ok) {
    console.error('Gemini API Error:', await response.text());
    throw new Error('Failed to get response from AI.');
  }
  return await response.json();
}
