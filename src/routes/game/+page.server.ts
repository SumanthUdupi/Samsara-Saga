import { getDB } from '$lib/db';
import { getPlayerId } from '$lib/user';
import type { PageServerLoad } from './$types';

interface Quest {
    id: string;
    title: string;
    description_template: string;
    // Add other properties as they appear in the Quests table
}

interface PlayerState {
    player_id: string;
    current_location_id: number;
    karma_score: number;
    active_quests: string; // JSON string of quest IDs
    // Add other properties from PlayerState table
    location_name: string; // Added dynamically
    location_description: string; // Added dynamically
}

export const load: PageServerLoad = async ({ platform, request }) => {
    try { // Added try block
    const db = getDB(platform!);
    const playerId = await getPlayerId(request, platform!);
    console.log('Server: Player ID from getPlayerId:', playerId);

    if (!playerId) {
        console.log('Server: Player ID is null, redirecting to /.');
        // This should be handled by hooks, but as a fallback
        return { status: 302, redirect: '/' };
    }

    // Fetch player state
    let playerState: PlayerState | null = await db.prepare('SELECT * FROM PlayerState WHERE player_id = ?').bind(playerId).first<PlayerState>();
    console.log('Server: PlayerState after initial fetch:', playerState);

    // If no player state, create one (first-time setup)
    if (!playerState) {
        const defaultLocation = await db.prepare('SELECT * FROM Locations WHERE id = 1').first();
        if (!defaultLocation) {
            throw new Error('Default location not found. Database might be uninitialized.');
        }
        await db.prepare('INSERT INTO PlayerState (player_id, current_location_id, karma_score, active_quests) VALUES (?, ?, 0, ?)')
            .bind(playerId, defaultLocation.id, JSON.stringify([]))
            .run();
        playerState = await db.prepare('SELECT * FROM PlayerState WHERE player_id = ?').bind(playerId).first<PlayerState>();
        if (!playerState) {
            throw new Error('Failed to create player state.');
        }
        console.log('Server: PlayerState created:', playerState);
    }

    // Ensure playerState is not null after creation attempt
    if (!playerState) {
        throw new Error('Player state could not be loaded or created.');
    }

    // Ensure karma_score is a number
    if (typeof playerState.karma_score !== 'number') {
        playerState.karma_score = 0; // Default to 0 if not a number
    }

    // Fetch location details
    const location = await db.prepare('SELECT * FROM Locations WHERE id = ?').bind(playerState.current_location_id).first<{ name: string, description: string }>();
    if (!location) {
        throw new Error('Player current location not found.');
    }
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
    let activeQuests: Quest[] = [];
    if (playerState.active_quests) {
        const questIds = JSON.parse(playerState.active_quests as string);
        if (questIds.length > 0) {
            const questPlaceholders = questIds.map(() => '?').join(',');
            const { results: questResults } = await db.prepare(`SELECT * FROM Quests WHERE id IN (${questPlaceholders})`)
                .bind(...questIds).all();
            activeQuests = questResults as unknown as Quest[];
        }
    }

    // NEW: Fetch gatherable items at the current location
    const itemsStmt = db.prepare(`
        SELECT i.id, i.name, i.description
        FROM LocationItems li
        JOIN Items i ON li.item_id = i.id
        WHERE li.location_id = ?
    `).bind(playerState.current_location_id);

    const itemsInLocation = await itemsStmt.all();

    // Debugging: Check if exits are found
    if (!exits.results || exits.results.length === 0) {
        console.warn(`No exits found for location ID: ${playerState.current_location_id}`);
    }

    const returnData = {
        playerState: playerState,
        exits: exits.results,
        npcs: npcs.results,
        activeQuests: activeQuests,
        itemsInLocation: itemsInLocation.results // Pass items to the frontend
    };
    console.log('Server: Data returned from load function:', returnData);
    return returnData;
} catch (error) {
    console.error('Error loading game data:', error);
    return { status: 500, error: 'Failed to load game data.' };
}};
