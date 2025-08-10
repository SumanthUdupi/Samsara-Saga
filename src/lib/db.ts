import type { D1Database } from '@cloudflare/workers-types';

export function getDB(platform: App.Platform): D1Database {
    if (platform.env.DB) {
        return platform.env.DB;
    }
    throw new Error('Database not found.');
}
