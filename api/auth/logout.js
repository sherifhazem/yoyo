import { clearSessionCookie } from '../_auth.js'

// POST /api/auth/logout — بيمسح كوكي الجلسة عشان طفل تاني يدخل بحسابه على نفس الجهاز
export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  res.setHeader('Set-Cookie', clearSessionCookie())
  res.status(200).json({ ok: true })
}
