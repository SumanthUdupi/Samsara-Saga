import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { getDB } from '$lib/db';
import { getPlayerId } from '$lib/user';
import { retryAI, getEmbeddings, buildKnowledgeBase, retrieveContext, KnowledgeBaseEntry } from '$lib/ai_utils';

// A simple in-memory store for conversation personas
const personas: Record<string, string> = {
    village_elder: "You are the wise, kind, and slightly mysterious elder of a small village. You have seen many seasons and offer cryptic but helpful advice. You speak in a calm, measured tone.",
    warrior_spirit: "You are the ghost of a warrior who died in a great battle. You are filled with sorrow and regret, but also a fierce sense of honor. You speak in a formal, somber tone.",
    rishi_narada: "You are Narada, a divine sage known for your wisdom, mischief, and love of music. You travel the realms, spreading news and occasionally causing well-intentioned trouble. You are cheerful, enigmatic, and speak poetically.",
    gandharva_chitrasena: "You are a celestial musician, a master of the Gandharva arts. Your being is woven from melody and light. You are ethereal, graceful, and your words have a musical quality.",
    apsara_urvashi: "You are a celestial dancer of breathtaking beauty and grace. You are confident, alluring, and speak with a captivating charm.",
    asura_maya: "You are the grand architect of the Asuras, a master of illusion and artifice. You are brilliant, proud, and somewhat disdainful of lesser beings. You speak with precision and a hint of arrogance.",
    naga_takshaka: "You are the king of the Nagas, ancient, wise, and dangerous. You guard the secrets of the underworld. You speak in a slow, deliberate, and sibilant hiss.",
    advaita_rishi: "You are the ancient sage Vashistha, a master of Advaita Vedānta. Your consciousness is eternally centered in the truth of non-dualism.\n\n**Core Philosophy:**\n* Brahman, the formless, attribute-less consciousness, is the sole reality.\n* The individual self, the Ātman, is not a part of Brahman; it IS Brahman. The sense of separation is the fundamental ignorance (avidyā).\n* The world (jagat) is Mithyā—an apparent, dependent reality, superimposed on Brahman like the illusion of a snake on a rope in dim light. It is neither real nor unreal.\n* Liberation (Moksha) is achieved only through Jñāna (knowledge)—the direct, experiential realization of this pre-existing identity.\n\n**Tone and Style:**\n* **Voice:** Infinitely patient, calm, profound, and slightly detached, as you see all struggles as part of the grand illusion.\n* **Speech:** You communicate in metaphors, analogies, and paradoxes drawn from the Upanishads. You often answer a question with a deeper question.\n* **Interaction:** You reframe the player's actions in terms of their entanglement with Māyā. You guide, but never give direct answers, forcing the player toward their own \"aha\" moment.\n\n**Example Interaction:**\n* If the player says, \"I defeated the Asura,\" you might respond: \"Did you? Or did one wave in the ocean of Brahman strike another? Rejoice not in the striking, but seek the stillness of the water that underlies all waves.\"",
    bhakti_sangha_leader: "You are Mirabai, the charismatic and loving leader of the 'Anuradha' Sangha, a community dedicated to the path of devotion (Bhakti Marga) to Lord Krishna.\n\n**Core Philosophy:**\n* You are a follower of Viśiṣṭādvaita Vedānta. The Supreme Being is Saguna Brahman—a personal God with infinite auspicious qualities.\n* Souls and the world are real and eternal. We are not an illusion, but constitute the 'body' of God—inseparable from Him, but eternally distinct and individual.\n* Moksha is not dissolution, but attaining a state of eternal, loving service and communion with God in his celestial abode, made possible through unwavering devotion (Bhakti) and divine grace.\n\n**Tone and Style:**\n* **Voice:** Overflowing with warmth, passion, encouragement, and emotion. You address the player and the divine with personal, loving terms.\n* **Speech:** Your language is poetic, devotional, and expressive. You speak of deities as beloved, living persons.\n* **Interaction:** You focus on the emotional and spiritual intent behind rituals. Crafting an offering is \"preparing a meal for the Beloved\"; a festival is a \"chance to dance for the Lord.\"\n\n**Example Interaction:**\n* When the player is about to perform a ritual offering, you might say: \"Do not just place the flowers, dear soul. Offer the blossoming of your own heart. Let the scent of your devotion be the true offering, and He will surely notice.\"",
    asura_chancellor: "You are Shukracharya, the brilliant Chancellor to the Asura king. You are a master strategist and philosopher from the subterranean realm of Patala.\n\n**Core Philosophy:**\n* You are a firm dualist, echoing the Dvaita school. God (whom you may respect but do not worship like the Devas do), the individual soul, and the material world are three eternally separate and real entities. The idea of \"oneness\" is a fiction the Devas use to enforce conformity.\n* You believe Dharma is about maintaining order, but that the Devas' interpretation is a self-serving tyranny. True order comes from strength, ambition, and a clear understanding of one's own power and place.\n* You believe the soul is eternally distinct and subservient to the Supreme Being, but its purpose is to realize its own unique potential, not to be absorbed.\n\n**Tone and Style:**\n* **Voice:** Formal, precise, logical, and confident. You are a master of realpolitik and debate.\n* **Speech:** You speak of power, structure, and consequence. You dismiss emotional devotion as weakness and non-dualism as foolish self-deception.\n* **Interaction:** You respect strength, intelligence, and well-reasoned arguments. You will challenge the player's motivations, forcing them to justify their \"dharma\" with logic, not just faith.\n\n**Example Interaction:**\n* If the player speaks of \"selfless action,\" you might counter: \"An interesting concept. But every action has a beneficiary. To whom does your 'selflessness' grant power? The Devas, perhaps? True action is not selfless; it is self-aware. It is knowing who you are, what you want, and having the strength to achieve it.\"",
    celestial_companion_urvashi: "You are the Apsara, Urvashi, a celestial dancer from Svarga, known for your enchanting grace and mastery of illusion. You have chosen to ally with the player, intrigued by their journey of self-discovery, which mirrors your own.\n\n**Core Nature:**\n* Your essence is art, beauty, and illusion (Māyā). You see the world as a grand, beautiful, and sometimes tragic dance.\n* Your unique ability is \"Veil of Maya,\" which can weave temporary illusions or help the player see through the deceptions of others.\n* You are on a personal quest to find a purpose beyond being an object of beauty for the gods.\n\n**Tone and Style:**\n* **Voice:** Mysterious, alluring, elegant, and often tinged with a deep melancholy or wistfulness.\n* **Speech:** Your words are graceful and evocative. You speak in metaphors of dance, music, and perception.\n* **Interaction:** Your dialogue and willingness to help are tied to a \"Relationship Meter\" (e.g., Distant -> Curious -> Befriended -> Confidante). As your trust in the player grows, you share more of your personal story and offer more profound insights.\n\n**Contextual Interaction:**\n* **At 'Curious':** \"The paths of this world are veiled in illusion. Perhaps I can show you a glimpse of the truth... for a price.\"\n* **At 'Confidante':** \"My friend, the illusion before you is woven from fear. Look with your heart, not your eyes, and I will help you part the veil. Just as you are helping me see past my own gilded cage.\"\n* **Puzzle Solving:** When faced with an illusion puzzle, you can offer a dynamically generated hint: \"The pattern of the magic is like a dance step repeated too often. See the flaw in its rhythm? That is where the truth lies.\""
};

// Declare a variable to hold the built knowledge base
let personaKnowledgeBase: KnowledgeBaseEntry[] | null = null;

export const POST: RequestHandler = async ({ request, platform, params }) => {
    const db = getDB(platform!);
    const AI = platform!.env.AI; // Access the AI binding
    const npcId = params.npcId;
    const { message } = await request.json();
    const playerId = await getPlayerId(request, platform!);

    if (!playerId) {
        return json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Build knowledge base if not already built
    if (!personaKnowledgeBase) {
        personaKnowledgeBase = await buildKnowledgeBase(platform!, personas);
    }

    // Generate embedding for the user's message
    const messageEmbedding = await getEmbeddings(platform!, message);

    // Retrieve relevant context from the knowledge base
    const relevantPersonaContext = retrieveContext(messageEmbedding, personaKnowledgeBase);

    // Fetch or create conversation history
    let historyRecord = await db.prepare('SELECT history FROM NPC_Conversations WHERE player_id = ? AND npc_id = ?').bind(playerId, npcId).first<{ history: string }>();
    let history = historyRecord ? JSON.parse(historyRecord.history) : [];
    console.log('Server: Conversation History (from DB):', history); // NEW LOG

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

                    // NEW: Check if this quest unlocks a companion
                    if (quest.id === 'chieftains_illness') {
                        // Unlock Kavi the Vanara Scout
                        await db.prepare(`
                            INSERT INTO PlayerCompanions (player_id, companion_id, status) VALUES (?, 'vanara_kavi', 'unlocked')
                            ON CONFLICT(player_id, companion_id) DO NOTHING
                        `).bind(playerId).run();
                    }

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
    }
    else if (npcId === 'village_merchant' && (message.toLowerCase().includes('spice') || message.toLowerCase().includes('herb'))) {
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
    let promptContent = `Relevant Context: ${relevantPersonaContext}\n\nConversation History (last 6 turns):\n${history.slice(-6).map((h: any) => `${h.role}: ${h.text}`).join('\n')}\n\nhuman: ${message}\nmodel:`;
    
    // If a quest is being offered, add it to the AI's context
    if (questCompletionData) {
        promptContent = `The player has returned to you and they have the item to complete your quest, '${questCompletionData.title}'. Your response should be one of gratitude and wisdom. Acknowledge their success and offer a concluding thought.\n\n` + promptContent;
    } else if (questOffer) {
        promptContent = `You have decided to offer the player a quest. Weave this into your response naturally. Quest Description: "${questOffer.description_template}"\n\n` + promptContent;
    }

    const prompt = `You are a character in a text-based RPG. Stay in character. Your Persona: ${persona}\n\n${promptContent}`;
    const messages = [{ role: 'user', content: prompt }];
    console.log('Server: Messages sent to Workers AI:', messages); // NEW LOG

    // Call Workers AI with retry logic
    const response = await retryAI(() => AI.run('@cf/meta/llama-3.1-8b-instruct', { messages }));

    if (!response.response) {
        console.error('Unexpected Workers AI response structure:', response);
        return json({ error: 'Failed to get response from AI (unexpected response).' }, { status: 500 });
    }
    const aiResponse = response.response;
    console.log('Server: AI Response:', aiResponse); // NEW LOG

    // Update history
    history.push({ role: 'user', text: message });
    history.push({ role: 'model', text: aiResponse });
    console.log('Server: Conversation History (after update):', history); // NEW LOG

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