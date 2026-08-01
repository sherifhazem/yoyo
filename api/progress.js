import { getSql } from './_db.js'
import { verifySession } from './_auth.js'

const DEFAULT_PROGRESS = {
  view: 'map',
  activeDay: null,
  currentScene: 0,
  scores: { logic: 0, math: 0, science: 0, english: 0 },
  badges: [],
  completedDays: [],
}

function isValidProgress(body) {
  return Boolean(
    body &&
      typeof body === 'object' &&
      body.scores &&
      typeof body.scores === 'object' &&
      Array.isArray(body.badges) &&
      Array.isArray(body.completedDays)
  )
}

// GET  /api/progress — يرجّع تقدم اللاعب المسجل دخوله
// PUT  /api/progress — يحفظ تقدم جديد (كامل الـ object)
export default async function handler(req, res) {
  const session = verifySession(req)
  if (!session) {
    res.status(401).json({ error: 'not_authenticated' })
    return
  }

  try {
    const sql = getSql()

    if (req.method === 'GET') {
      const { rows } = await sql`SELECT progress FROM players WHERE id = ${session.playerId} LIMIT 1`
      res.status(200).json({ name: session.name, progress: rows[0]?.progress || DEFAULT_PROGRESS })
      return
    }

    if (req.method === 'PUT') {
      if (!isValidProgress(req.body)) {
        res.status(400).json({ error: 'invalid_body' })
        return
      }
      await sql`
        UPDATE players SET progress = ${JSON.stringify(req.body)}::jsonb, updated_at = now()
        WHERE id = ${session.playerId}
      `
      res.status(200).json({ ok: true, updatedAt: new Date().toISOString() })
      return
    }

    res.status(405).json({ error: 'method_not_allowed' })
  } catch (err) {
    console.error('progress handler error:', err)
    res.status(500).json({ error: 'server_error', message: err.message })
  }
}
