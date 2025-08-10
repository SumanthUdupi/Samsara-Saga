import { getDB } from './db'; // Import getDB

export async function getPlayerId(request: Request, platform: App.Platform): Promise<string | null> {
    const db = getDB(platform); // Use getDB here
    let playerId = request.headers.get('cookie')?.match(/playerId=([^;]+)/)?.[1];

    if (!playerId) {
        // If no player ID in cookie, and no existing player, return null.
        // Player creation should happen explicitly via the /api/create-character endpoint.
        return null;
    }

    // Verify player exists in DB (optional, but good for robustness)
    const playerExists = await db.prepare("SELECT id FROM Players WHERE id = ?").bind(playerId).first();
    if (!playerExists) {
        return null; // Player ID from cookie does not exist in DB
    }

    return playerId;
}
