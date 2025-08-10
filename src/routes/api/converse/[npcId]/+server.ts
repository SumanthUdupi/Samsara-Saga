import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db';
import { getPlayerId } from '$lib/user';

// A simple in-memory store for conversation personas
const personas: Record<string, string> = {
    village_elder: "You are the wise, kind, and slightly mysterious elder of a small village. You have seen many seasons and offer cryptic but helpful advice. You speak in a calm, measured tone.",
    warrior_spirit: "You are the ghost of a warrior who died in a great battle. You are filled with sorrow and regret, but also a fierce sense of honor. You speak in a formal, somber tone.",
    rishi_narada: "You are Narada, a divine sage known for your wisdom, mischief, and love of music. You travel the realms, spreading news and occasionally causing well-intentioned trouble. You are cheerful, enigmatic, and speak poetically.",
    gandharva_chitrasena: "You are a celestial musician, a master of the Gandharva arts. Your being is woven from melody and light. You are ethereal, graceful, and your words have a musical quality.",
    apsara_urvashi: "You are a celestial dancer of breathtaking beauty and grace. You are confident, alluring, and speak with a captivating charm.",
    asura_maya: "You are the grand architect of the Asuras, a master of illusion and artifice. You are brilliant, proud, and somewhat disdainful of lesser beings. You speak with precision and a hint of arrogance.",
    naga_takshaka: "You are the king of the Nagas, ancient, wise, and dangerous. You guard the secrets of the underworld. You speak in a slow, deliberate, and sibilant hiss."
};

const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export const POST: RequestHandler = async ({ request, platform, params }) => {
    const db = getDB(platform!);
    const apiKey = platform!.env.GEMINI_API_KEY;
    console.log('Server: Gemini API Key (first 5 chars):', apiKey ? apiKey.substring(0, 5) + '...' : 'Not set'); // Log first few chars for security
    const npcId = params.npcId;
    const { message } = await request.json();
    const playerId = await getPlayerId(request, platform!);

    if (!playerId) {
        return json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Fetch or create conversation history
    let historyRecord = await db.prepare('SELECT history FROM NPC_Conversations WHERE player_id = ? AND npc_id = ?').bind(playerId, npcId).first<{ history: string }>();
    let history = historyRecord ? JSON.parse(historyRecord.history) : [];

    // NEW: Quest Completion Check
    const playerState = await db.prepare('SELECT active_quests, karma_score FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ active_quests: string, karma_score: number }>();
    const activeQuests = playerState?.active_quests ? JSON.parse(playerState.active_quests) : [];
    let questCompletionData = null;

    if (activeQuests.length > 0) {
        // Check inventory against quest objectives
        const inventory = await db.prepare('SELECT item_id, quantity FROM PlayerInventory WHERE player_id = ?').bind(playerId).all();
        const inventoryMap = new Map(inventory.results.map(i => [i.item_id, i.quantity]));
        
        for (const questId of activeQuests) {
            const quest = await db.prepare('SELECT * FROM Quests WHERE id = ? AND giver_npc_id = ?').bind(questId, npcId).first();
            if (quest) {
                const objectives = JSON.parse(quest.objectives as string);
                if (objectives.type === 'FETCH' && (inventoryMap.get(objectives.item_id) || 0) >= objectives.quantity) {
                    // Player has the item! Prepare completion.
                    const remainingQuests = activeQuests.filter((id: string) => id !== questId);
                    const newKarma = playerState.karma_score + (quest.karma_reward as number);

                    // Database transaction for completion
                    await db.batch([
                        db.prepare('UPDATE PlayerState SET active_quests = ?, karma_score = ? WHERE player_id = ?').bind(JSON.stringify(remainingQuests), newKarma, playerId),
                        db.prepare('DELETE FROM PlayerInventory WHERE player_id = ? AND item_id = ?').bind(playerId, objectives.item_id)
                    ]);
                    questCompletionData = { title: quest.title, karma: quest.karma_reward };
                    break; 
                }
            }
        }
    }

    // Quest Trigger Logic
    let questOffer = null;
    if (npcId === 'village_elder' && (message.toLowerCase().includes('task') || message.toLowerCase().includes('help'))) {
        // Check if player already has the quest
        const playerStateAfterCompletion = await db.prepare('SELECT active_quests FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ active_quests: string }>();
        const activeQuestsAfterCompletion = playerStateAfterCompletion?.active_quests ? JSON.parse(playerStateAfterCompletion.active_quests) : [];
        
        if (!activeQuestsAfterCompletion.includes('eternal_bloom')) {
            const questData = await db.prepare('SELECT * FROM Quests WHERE id = ?').bind('eternal_bloom').first();
            questOffer = questData;
        }
    } else if (npcId === 'village_merchant' && (message.toLowerCase().includes('spice') || message.toLowerCase().includes('herb'))) {
        // Check if player already has the quest
        const playerStateAfterCompletion = await db.prepare('SELECT active_quests FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ active_quests: string }>();
        const activeQuestsAfterCompletion = playerStateAfterCompletion?.active_quests ? JSON.parse(playerStateAfterCompletion.active_quests) : [];
        
        if (!activeQuestsAfterCompletion.includes('soma_herb_quest')) {
            const questData = await db.prepare('SELECT * FROM Quests WHERE id = ?').bind('soma_herb_quest').first();
            questOffer = questData;
        }
    }

    // DYNAMICALLY SELECT THE PERSONA
    const persona = personas[npcId ?? ''] || "You are a generic character.";
    let promptContent = `Conversation History (last 6 turns):\n${history.slice(-6).map((h: any) => `${h.role}: ${h.text}`).join('\n')}\n\nhuman: ${message}\nmodel:`;
    
    // If a quest is being offered, add it to the AI's context
    if (questCompletionData) {
        promptContent = `The player has returned to you and they have the item to complete your quest, '${questCompletionData.title}'. Your response should be one of gratitude and wisdom. Acknowledge their success and offer a concluding thought.\n\n` + promptContent;
    } else if (questOffer) {
        promptContent = `You have decided to offer the player a quest. Weave this into your response naturally. Quest Description: "${questOffer.description_template}"\n\n` + promptContent;
    }

    const prompt = `You are a character in a text-based RPG. Stay in character. Your Persona: ${persona}\n\n${promptContent}`;
    
    // Call Gemini API
    const geminiResponse = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!geminiResponse.ok) {
        return json({ error: 'Gemini API request failed' }, { status: 500 });
    }

    const geminiData = await geminiResponse.json();
    if (!geminiData.candidates || geminiData.candidates.length === 0 ||
        !geminiData.candidates[0].content || !geminiData.candidates[0].content.parts ||
        geminiData.candidates[0].content.parts.length === 0 || !geminiData.candidates[0].content.parts[0].text) {
        console.error('Unexpected Gemini API response structure:', geminiData);
        return json({ error: 'Failed to get response from AI (unexpected response).' }, { status: 500 });
    }
    const aiResponse = geminiData.candidates[0].content.parts[0].text;

    // Update history
    history.push({ role: 'user', text: message });
    history.push({ role: 'model', text: aiResponse });

    await db.prepare('INSERT OR REPLACE INTO NPC_Conversations (player_id, npc_id, history) VALUES (?, ?, ?)')
        .bind(playerId, npcId, JSON.stringify(history))
        .run();

    // NEW: If a quest was offered, add it to the player's state
    if (questOffer) {
        const playerStateAfterOffer = await db.prepare('SELECT active_quests FROM PlayerState WHERE player_id = ?').bind(playerId).first<{ active_quests: string }>();
        const activeQuestsAfterOffer = playerStateAfterOffer?.active_quests ? JSON.parse(playerStateAfterOffer.active_quests) : [];
        if (!activeQuestsAfterOffer.includes(questOffer.id)) {
            activeQuestsAfterOffer.push(questOffer.id);
            await db.prepare('UPDATE PlayerState SET active_quests = ? WHERE player_id = ?').bind(JSON.stringify(activeQuestsAfterOffer), playerId).run();
        }
    }

    return json({ response: aiResponse, quest_offered: questOffer, quest_completed: questCompletionData });
};