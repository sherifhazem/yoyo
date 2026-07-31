import jwt from 'jsonwebtoken'
import { parse, serialize } from 'cookie'

const COOKIE_NAME = 'yousef_session'
const ONE_YEAR = 60 * 60 * 24 * 365

function secret() {
  const value = process.env.SESSION_SECRET
  if (!value) throw new Error('SESSION_SECRET env var is not set')
  return value
}

export function signSession(player) {
  return jwt.sign({ playerId: player.id, name: player.name }, secret(), { expiresIn: '365d' })
}

export function verifySession(req) {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  try {
    const payload = jwt.verify(token, secret())
    return { playerId: payload.playerId, name: payload.name }
  } catch {
    return null
  }
}

export function sessionCookie(token) {
  return serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR,
  })
}

export function clearSessionCookie() {
  return serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
}

// اسم اللاعب: اتشيل المسافات الزيادة بس، PIN: لازم يكون 4 أرقام بالظبط
export function normalizeName(name) {
  return typeof name === 'string' ? name.trim() : ''
}

export function isValidPin(pin) {
  return typeof pin === 'string' && /^\d{4}$/.test(pin)
}
