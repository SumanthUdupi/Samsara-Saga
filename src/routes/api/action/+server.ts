import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getPlayerId } from '$lib/user';



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
  const db = platform!.env.DB;
  const AI = platform!.env.AI; // Access the AI binding

  try {
    const { actionType, payload } = await request.json();

    // --- Get the Player ---
    const playerId = await getPlayerId(request, platform!);
    if (!playerId) return json({ error: 'User not authenticated.' }, { status: 401 });

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

        const response = await AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: [{ role: 'user', content: prompt }] });
        if (!response.response) {
          console.error('Unexpected Workers AI response structure:', response);
          return json({ error: 'Failed to generate narrative from AI (unexpected response).' }, { status: 500 });
        }
        const generatedText = response.response;
        return json({ success: true, narrative: generatedText.trim() });
      }

      case 'MEDITATE': {
        // 1. Update player's karma score in the database
        const updateResult = await db.prepare(
          'UPDATE PlayerState SET karma_score = karma_score + 1 WHERE player_id = ? RETURNING karma_score'
        ).bind(playerId).first<{ karma_score: number }>();

        if (!updateResult) {
          return json({ error: 'Failed to update player karma.' }, { status: 500 });
        }
        const newKarmaScore = updateResult.karma_score;

        // 2. Get player's Nakshatra for personalized meditation text
        const playerInfo = await db.prepare('SELECT nakshatra_id FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ nakshatra_id: number }>();
        if (!playerInfo) {
          return json({ error: 'Player Nakshatra information not found.' }, { status: 404 });
        }
        const nakshatra = nakshatras.find(n => n.id === playerInfo.nakshatra_id);

        // 3. Construct a new prompt for a meditative experience
        const prompt = MEDITATE_PROMPT_TEMPLATE(nakshatra?.name || 'Unknown', nakshatra?.nature || 'Unknown', newKarmaScore);

        const response = await AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: [{ role: 'user', content: prompt }] });
        if (!response.response) {
          console.error('Unexpected Workers AI response structure:', response);
          return json({ error: 'Failed to generate narrative from AI (unexpected response).' }, { status: 500 });
        }
        const generatedText = response.response;

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

      // NEW CASE for Gathering Items
      case 'GATHER_ITEM': {
        const itemId = payload.itemId;
        
        const playerLocation = await db.prepare('SELECT current_location_id FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ current_location_id: number }>();
        
        if (!playerLocation) {
          return json({ success: false, narrative: "Could not determine player location." });
        }

        const itemLocation = await db.prepare('SELECT item_id FROM LocationItems WHERE location_id = ? AND item_id = ?').bind(playerLocation.current_location_id, itemId).first();

        if (!itemLocation) {
          return json({ success: false, narrative: "That item is not here." });
        }

        // Add item to player inventory (or update quantity)
        await db.prepare(`
          INSERT INTO PlayerInventory (player_id, item_id, quantity) VALUES (?, ?, 1)
          ON CONFLICT(player_id, item_id) DO UPDATE SET quantity = quantity + 1
        `).bind(playerId, itemId).run();

        // Remove item from location
        await db.prepare('DELETE FROM LocationItems WHERE location_id = ? AND item_id = ?').bind(playerLocation.current_location_id, itemId).run();

        const itemInfo = await db.prepare('SELECT name FROM Items WHERE id = ?').bind(itemId).first<{ name: string }>();
        
        if (!itemInfo) {
          return json({ success: false, narrative: "Could not find item information." });
        }

        return json({ success: true, narrative: `You have acquired: ${itemInfo.name}.` });
      }

      // NEW CASE for Joining a Sangha
      case 'JOIN_SANGHA': {
        const sanghaId = payload.sanghaId;
        if (!sanghaId) return json({ error: 'Sangha ID not provided.' }, { status: 400 });

        await db.prepare('UPDATE PlayerState SET sangha_id = ? WHERE player_id = ?')
          .bind(sanghaId, player.id).run();
        
        return json({ success: true, message: 'You have joined the Sangha.' });
      }
      
      // NEW CASE for Creating a Sangha
      case 'CREATE_SANGHA': {
        const { sanghaName, marga } = payload;
        if (!sanghaName || !marga) return json({ error: 'Sangha name and marga are required.' }, { status: 400 });

        // Insert the new Sangha and get its ID
        const { results: insertResults } = await db.prepare('INSERT INTO Sanghas (name, marga, founder_id) VALUES (?, ?, ?) RETURNING id')
          .bind(sanghaName, marga, player.id).all();
        const newSanghaId = insertResults[0].id;

        // Update the player to be in their new Sangha
        await db.prepare('UPDATE PlayerState SET sangha_id = ? WHERE player_id = ?')
          .bind(newSanghaId, player.id).run();

        return json({ success: true, message: `You have founded the Sangha: ${sanghaName}` });
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

