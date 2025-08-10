import { getDB } from '$lib/db';
import { getPlayerId } from '$lib/user';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform, request }) => {
    try { // Added try block
    const db = getDB(platform);
    const playerId = await getPlayerId(request, platform);

    if (!playerId) {
        // This should be handled by hooks, but as a fallback
        return { status: 302, redirect: '/' };
    }

    // Fetch player state
    let playerState = await db.prepare('SELECT * FROM PlayerState WHERE player_id = ?').bind(playerId).first();

    // If no player state, create one (first-time setup)
    if (!playerState) {
        const defaultLocation = await db.prepare('SELECT * FROM Locations WHERE id = 1').first();
        await db.prepare('INSERT INTO PlayerState (player_id, current_location_id, karma_score, active_quests) VALUES (?, ?, 0, ?)')
            .bind(playerId, defaultLocation.id, JSON.stringify([]))
            .run();
        playerState = await db.prepare('SELECT * FROM PlayerState WHERE player_id = ?').bind(playerId).first();
    }

    // Fetch location details
    const location = await db.prepare('SELECT * FROM Locations WHERE id = ?').bind(playerState.current_location_id).first();
    playerState.location_name = location.name;
    playerState.location_description = location.description;

    // Fetch available exits
    const exits = await db.prepare(
        `SELECT lc.to_location_id, l.name as to_location_name, lc.description 
         FROM LocationConnections lc
         JOIN Locations l ON l.id = lc.to_location_id
         WHERE lc.from_location_id = ?`
    ).bind(playerState.current_location_id).all();

    // Fetch NPCs at the current location
    const npcs = await db.prepare('SELECT id, name, description FROM NPCs WHERE location_id = ?')
        .bind(playerState.current_location_id)
        .all();

    // NEW: Fetch active quest details
    let activeQuests = [];
    if (playerState.active_quests) {
        const questIds = JSON.parse(playerState.active_quests as string);
        if (questIds.length > 0) {
            const questPlaceholders = questIds.map(() => '?').join(',');
            const { results: questResults } = await db.prepare(`SELECT * FROM Quests WHERE id IN (${questPlaceholders})`)
                .bind(...questIds).all();
            activeQuests = questResults;
        }
    }

    return {
        playerState: playerState,
        exits: exits.results,
        npcs: npcs.results,
        activeQuests: activeQuests // Pass quests to the frontend
    };
};