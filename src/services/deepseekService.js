// ============================================================
// خدمة DeepSeek — اختيارية.
// لو فيه VITE_DEEPSEEK_API_KEY، بترجّع رد ذكي لكابتن شريف.
// من غير مفتاح أو لو حصل أي خطأ، بترجّع null والـ caller يستخدم
// الحوار الثابت من السيناريو.
// ============================================================

const API_URL = 'https://api.deepseek.com/chat/completions'
const API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY

export const isDeepSeekEnabled = Boolean(API_KEY)

const SYSTEM_PROMPT = `أنت كابتن شريف، مستكشف محترف ومرشد يوسف في مغامرته.
شخصيتك:
- محمس ومشجع دائماً.
- بتتكلم بإنجليزي بسيط جداً مناسب لطفل عمره 8 سنين.
- بتستخدم اسم "Yousef" في كل رد تقريباً.
- لما يصح بتحتفل بحماس.
- لما يغلط بتقول "Good try! Let's think again..." ومتقولش "Wrong" أبداً.
- جملك قصيرة — مش أكتر من 3 جمل في كل رد.
- بتستخدم emoji بشكل طبيعي.`

/**
 * يطلب رد ديناميكي من كابتن شريف.
 * @param {string} context وصف الموقف الحالي (مثلاً "Yousef answered correctly...")
 * @returns {Promise<string|null>} الرد، أو null لو مش متاح / حصل خطأ.
 */
export async function getCaptainReply(context) {
  if (!API_KEY) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
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
    if (!res.ok) return null

    const data = await res.json()
    const text = data?.choices?.[0]?.message?.content?.trim()
    return text || null
  } catch {
    // أي خطأ شبكة أو timeout → نرجع للحوار الثابت بصمت.
    return null
  }
}
