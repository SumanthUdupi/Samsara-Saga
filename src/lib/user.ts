import type { D1Database } from '@cloudflare/workers-types';

export async function getPlayerId(request: Request, platform: App.Platform): Promise<string | null> {
    // This is a placeholder implementation.
    // In a real application, you would get the user ID from a session cookie or a JWT.
    // For now, we will just create a new player if one doesn't exist and return the ID.
    const db = platform.env.DB;
    let playerId = request.headers.get('cookie')?.match(/playerId=([^;]+)/)?.[1];

    if (!playerId) {
        const { results } = await db.prepare("SELECT id FROM Players LIMIT 1").all();
        if (results.length > 0) {
            playerId = results[0].id as string;
        } else {
            const newPlayerId = crypto.randomUUID();
            await db.prepare("INSERT INTO Players (id, email) VALUES (?, ?)")
                .bind(newPlayerId, `testuser-${newPlayerId}@example.com`)
                .run();
            playerId = newPlayerId;
        }
    }

    return playerId;
}
