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

const TALK_TO_NPC_PROMPT_TEMPLATE = (npcPersona: string, playerNakshatraName: string, formattedConversationHistory: string, playerInput: string) => `You are a character in a text-based RPG, Samsara Saga. You must stay in character at all times.\n\n**Your Persona**: ${npcPersona}\n\n**Player Context**:\n- **Name**: Atman\n- **Nakshatra**: ${playerNakshatraName}\n\n**Conversation History (most recent turns)**:\n${formattedConversationHistory}\n\n**Task**: The player has just said the following to you. Generate a natural, in-character response that is consistent with your persona and the conversation history.\n\n**Player's latest input**: "${playerInput}"\n\n**Constraints**:\n- Keep your response concise (2-4 sentences).\n- Do not break character.\n- Your response must logically follow the conversation history.\n\n**Output**:\nYour Response:`;

const GENERATE_RIDDLE_PROMPT_TEMPLATE = (philosophicalConcept: string) => `You are an ancient, enlightened gatekeeper (a Rishi or a Naga King) in a text-based game. Your purpose is to test a soul's wisdom, not their knowledge of facts.\n\n**Task**: Generate a single, profound, koan-like riddle about the Hindu philosophical concept of **${philosophicalConcept}**.\n\n**Constraints**:\n- The riddle must be short (1-2 sentences) and highly metaphorical.\n- It must not use the name of the concept itself.\n- The answer should not be a single word, but should require the player to synthesize different ideas.\n\n**Output**:\nYour Riddle:`;

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
    const { actionType } = await request.json();

    // --- Get the Player ---
    const { results } = await db.prepare('SELECT id FROM Players ORDER BY created_at DESC LIMIT 1').all();
    if (!results || results.length === 0) return json({ error: 'No player found.' }, { status: 404 });
    const playerId = results[0].id as string;

    // --- Process the Action ---
    switch (actionType) {
      case 'LOOK_AROUND': {
        const locationInfo = await db.prepare(`
          SELECT Locations.description 
          FROM PlayerState JOIN Locations ON PlayerState.current_location_id = Locations.id
          WHERE PlayerState.player_id = ?
        `).bind(playerId).first<{ description: string }>();

        if (!locationInfo) return json({ error: "Could not find player's location." }, { status: 404 });

        const prompt = LOOK_AROUND_PROMPT_TEMPLATE.replace('[Location Name]', 'Current Location') // Placeholder for actual location name
                                            .replace('[Location Description]', locationInfo.description);

        const geminiData = await callGemini(prompt, geminiApiKey);
        const generatedText = geminiData.candidates[0].content.parts[0].text;
        return json({ success: true, narrative: generatedText.trim() });
      }

      // NEW CASE for Meditate action
      case 'MEDITATE': {
        // 1. Update player's karma score in the database
        const { results: updateResults } = await db.prepare(
          'UPDATE PlayerState SET karma_score = karma_score + 1 WHERE player_id = ? RETURNING karma_score'
        ).bind(playerId).all();
        const newKarmaScore = updateResults[0].karma_score;

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

      // NEW CASE for NPC Dialogue Generation
      case 'TALK_TO_NPC': {
        const { npcId, playerInput, conversationHistory } = await request.json();

        // --- Get Player's Nakshatra ---
        const playerInfo = await db.prepare('SELECT nakshatra_id FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ nakshatra_id: number }>();
        const playerNakshatra = nakshatras.find(n => n.id === playerInfo?.nakshatra_id);
        const playerNakshatraName = playerNakshatra?.name || 'Unknown';

        // --- Get NPC Persona (Placeholder) ---
        // In a real application, this would come from a database or a static data store
        // based on npcId. For now, we'll use a generic placeholder.
        const npcPersona = `You are a wise old sage who speaks in riddles and metaphors. You are patient and observant, always guiding the player towards deeper truths without giving direct answers.`;

        // --- Construct Conversation History (Placeholder) ---
        // This would typically be loaded from a database or session state.
        const formattedConversationHistory = conversationHistory ? conversationHistory.map((turn: { speaker: string, text: string }) => `${turn.speaker}: ${turn.text}`).join('\n') : 'No prior conversation.';

        const prompt = TALK_TO_NPC_PROMPT_TEMPLATE(npcPersona, playerNakshatraName, formattedConversationHistory, playerInput);

        const geminiData = await callGemini(prompt, geminiApiKey);
        const generatedText = geminiData.candidates[0].content.parts[0].text;

        // 4. Return the generated NPC response
        return json({ success: true, npcResponse: generatedText.trim() });
      }

      // NEW CASE for Upanishadic Riddle Generation
      case 'GENERATE_RIDDLE': {
        const { philosophicalConcept } = await request.json();

        const prompt = GENERATE_RIDDLE_PROMPT_TEMPLATE(philosophicalConcept);

        const geminiData = await callGemini(prompt, geminiApiKey);
        const generatedText = geminiData.candidates[0].content.parts[0].text;

        // 4. Return the generated riddle
        return json({ success: true, riddle: generatedText.trim() });
      }

      // NEW CASE for Check Inventory action
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
}``