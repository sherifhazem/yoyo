// ============================================================
// خدمة DeepSeek — اختيارية.
// الطلب بيروح لباك إند اللعبة (/api/captain-reply) اللي بدوره بيحمل
// مفتاح DeepSeek على السيرفر (متغير بيئة DEEPSEEK_API_KEY) ويعمل proxy.
// المفتاح ميوصلش للمتصفح خالص. لو الباك إند مش متاح أو حصل أي خطأ،
// بترجّع null والـ caller يستخدم الحوار الثابت من السيناريو.
// ============================================================

const API_URL = '/api/captain-reply'

// بنعتبر الخدمة "متاحة" دايماً من ناحية الفرونت إند؛ لو مفيش باك إند
// منشور أو مفيش مفتاح على السيرفر، الطلب هيفشل بصمت ونرجع للحوار الثابت.
export const isDeepSeekEnabled = true

/**
 * يطلب رد ديناميكي من كابتن شريف عبر باك إند اللعبة.
 * @param {string} context وصف الموقف الحالي (مثلاً "Yousef answered correctly...")
 * @returns {Promise<string|null>} الرد، أو null لو مش متاح / حصل خطأ.
 */
export async function getCaptainReply(context) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context }),
      signal: controller.signal,
    })

    clearTimeout(timeout)
    if (!res.ok) return null

    const data = await res.json()
    return data?.reply || null
  } catch {
    // أي خطأ شبكة أو timeout أو باك إند مش منشور → نرجع للحوار الثابت بصمت.
    return null
  }
}
