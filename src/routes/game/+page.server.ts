import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ platform }) => {
  const db = platform.env.DB;

  const playerResult = await db.prepare(
    'SELECT id FROM Players ORDER BY created_at DESC LIMIT 1'
  ).first();

  if (!playerResult) {
    return { status: 404, error: new Error('Player not found') };
  }
  const playerId = playerResult.id as string;

  const playerState = await db.prepare(`
    SELECT 
      ps.*, 
      l.name as location_name,
      l.description as location_description
    FROM PlayerState ps
    JOIN Locations l ON ps.current_location_id = l.id
    WHERE ps.player_id = ?
  `).bind(playerId).first();

  if (!playerState) {
    return { status: 404, error: new Error('Player state not found') };
  }

  const exitsResult = await db.prepare(`
    SELECT
      lc.to_location_id,
      lc.description,
      l.name as to_location_name
    FROM LocationConnections lc
    JOIN Locations l ON lc.to_location_id = l.id
    WHERE lc.from_location_id = ?
  `).bind(playerState.current_location_id).all();

  const npcsResult = await db.prepare(`
    SELECT
      id,
      name,
      description
    FROM NPCs
    WHERE location_id = ?
  `).bind(playerState.current_location_id).all();

  return {
    playerState: playerState,
    exits: exitsResult.results,
    npcs: npcsResult.results
  };
};