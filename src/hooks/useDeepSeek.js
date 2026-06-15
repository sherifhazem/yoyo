import { useState, useCallback } from 'react'
import { getCaptainReply, isDeepSeekEnabled } from '../services/deepseekService'

// ============================================================
// useDeepSeek
// بيرجّع نص كابتن شريف. الحوار الثابت (fallback) بيظهر فوراً،
// ولو فيه مفتاح DeepSeek بيستبدله برد ذكي لما يوصل.
// ============================================================
export function useDeepSeek() {
  const [enriched, setEnriched] = useState(null)
  const [loading, setLoading] = useState(false)

  // يطلب رد ذكي للسياق المعطى. fallback بيظهر دلوقتي،
  // والرد الذكي (لو موجود) بيستبدله من غير ما يوقف اللعب.
  const enrich = useCallback(async (context) => {
    if (!isDeepSeekEnabled || !context) return
    setLoading(true)
    const reply = await getCaptainReply(context)
    if (reply) setEnriched(reply)
    setLoading(false)
  }, [])

  const reset = useCallback(() => setEnriched(null), [])

  return { enriched, loading, enrich, reset, enabled: isDeepSeekEnabled }
}
