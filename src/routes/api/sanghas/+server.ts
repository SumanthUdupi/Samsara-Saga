import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ platform }) => {
  const db = platform.env.DB;
  try {
    const { results } = await db.prepare('SELECT id, name, marga, collective_karma FROM Sanghas').all();
    return json({ sanghas: results });
  } catch (e) {
    console.error('Failed to fetch sanghas', e);
    return json({ error: 'Failed to fetch sanghas' }, { status: 500 });
  }
};