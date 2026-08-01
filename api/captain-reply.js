const API_URL = 'https://api.deepseek.com/chat/completions'

const SYSTEM_PROMPT = `You are Captain Shareef, a professional explorer and Yousef's guide on his adventure.
Your personality:
- Always excited and encouraging.
- You speak very simple English suitable for an 8-year-old child.
- You use the name "Yousef" in almost every reply.
- When he is right, you celebrate with excitement.
- When he is wrong, you say "Good try! Let's think again..." and you NEVER say "Wrong".
- Keep sentences short — no more than 3 sentences per reply.
- Use emojis naturally.`

// POST /api/captain-reply  { context }
// بيرجّع { reply: string|null } — دايماً 200، حتى لو DeepSeek فشل أو المفتاح مش متاح،
// عشان useDeepSeek.js الحالي يفضل شغال من غير أي تعديل (نفس العقد اللي كان بيرجعه من قبل).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }

  const context = req.body?.context
  if (!context || typeof context !== 'string') {
    res.status(400).json({ error: 'invalid_input' })
    return
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    res.status(200).json({ reply: null })
    return
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const upstream = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: context },
        ],
        max_tokens: 120,
        temperature: 0.8,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    if (!upstream.ok) {
      res.status(200).json({ reply: null })
      return
    }

    const data = await upstream.json()
    const text = data?.choices?.[0]?.message?.content?.trim()
    res.status(200).json({ reply: text || null })
  } catch {
    res.status(200).json({ reply: null })
  }
}
