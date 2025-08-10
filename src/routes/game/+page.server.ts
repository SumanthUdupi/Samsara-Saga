import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform.env.DB;

  const { results: playerResults } = await db.prepare(
    'SELECT id FROM Players ORDER BY created_at DESC LIMIT 1'
  ).all();

  const player = playerResults?.[0];

  if (!player) {
    return { status: 404, error: new Error('Player not found') };
  }
  const playerId = player.id;

  const playerStateStmt = db.prepare(`
    SELECT 
      PlayerState.*, 
      Locations.name as location_name,
      Locations.description as location_description
    FROM PlayerState
    JOIN Locations ON PlayerState.current_location_id = Locations.id
    WHERE PlayerState.player_id = ?
  `).bind(playerId);

  const playerState = await playerStateStmt.first();
  if (!playerState) {
    return { status: 404, error: new Error('Player state not found') };
  }

  // NEW: Fetch available exits from the new table
  const exitsStmt = db.prepare(`
    SELECT
      lc.to_location_id,
      lc.description,
      l.name as to_location_name
    FROM LocationConnections lc
    JOIN Locations l ON lc.to_location_id = l.id
    WHERE lc.from_location_id = ?
  `).bind(playerState.current_location_id);

  const exits = await exitsStmt.all();
  
  return {
    playerState: playerState,
    exits: exits.results
  };
};