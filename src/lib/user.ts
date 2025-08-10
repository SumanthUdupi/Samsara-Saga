import { getDB } from './db'; // Import getDB

export async function getPlayerId(request: Request, platform: App.Platform): Promise<string | null> {
    const db = getDB(platform); // Use getDB here
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
