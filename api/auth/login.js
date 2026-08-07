import bcrypt from 'bcryptjs'
import { getSql } from '../_db.js'
import { signSession, sessionCookie, normalizeName, isValidPin } from '../_auth.js'

// POST /api/auth/login  { name, pin }
// اسم جديد → بيتعمل له حساب. اسم موجود → لازم الـ PIN يتطابق.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const name = normalizeName(req.body?.name)
  const pin = req.body?.pin

  if (!name || !isValidPin(pin)) {
    res.status(400).json({ error: 'invalid_input' })
    return
  }

  try {
    const sql = getSql()
    const { rows } = await sql`SELECT id, name, pin_hash, progress FROM players WHERE lower(name) = lower(${name}) LIMIT 1`

    if (rows.length === 0) {
      const pinHash = await bcrypt.hash(pin, 10)
      const { rows: inserted } = await sql`
        INSERT INTO players (name, pin_hash)
        VALUES (${name}, ${pinHash})
        RETURNING id, name, progress
      `
      const player = inserted[0]
      res.setHeader('Set-Cookie', sessionCookie(signSession(player)))
      res.status(201).json({ player: { id: player.id, name: player.name }, progress: player.progress })
      return
    }

    const existing = rows[0]
    const matches = await bcrypt.compare(pin, existing.pin_hash)
    if (!matches) {
      res.status(401).json({ error: 'wrong_pin' })
      return
    }

    res.setHeader('Set-Cookie', sessionCookie(signSession(existing)))
    res.status(200).json({ player: { id: existing.id, name: existing.name }, progress: existing.progress })
  } catch (err) {
    console.error('login handler error:', err)
    res.status(500).json({ error: 'server_error', message: err.message })
  }
}
