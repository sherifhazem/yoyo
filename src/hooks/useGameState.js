import { useState, useCallback, useEffect, useRef } from 'react'

const STORAGE_KEY = 'yousef-explorer-save'
// بيتسجل مرة واحدة أول ما حد يعمل login أونلاين ناجح، عشان لو أخ/أخت
// تاني عمل حساب جديد على نفس الجهاز، ما ياخدش تلقائي تقدم حد قبله.
const CLAIMED_KEY = 'yousef-explorer-claimed'
const SYNC_DEBOUNCE_MS = 2500
const FETCH_TIMEOUT_MS = 5000

const defaultProgress = {
  view: 'map', // map | day
  activeDay: null,
  currentScene: 0,
  scores: { logic: 0, math: 0, science: 0, english: 0 },
  badges: [],
  completedDays: [],
}

const defaultState = {
  authStatus: 'checking', // checking | login | guest | online
  playerName: null,
  ...defaultProgress,
}

function loadLocalProgress() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return {
      ...defaultProgress,
      ...parsed,
      scores: { ...defaultProgress.scores, ...(parsed.scores || {}) },
      badges: parsed.badges || [],
      completedDays: parsed.completedDays || [],
    }
  } catch {
    return null
  }
}

function saveLocalProgress(progress) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // تجاهل لو localStorage مش متاح
  }
}

function hasClaimedLocalSave() {
  try {
    return window.localStorage.getItem(CLAIMED_KEY) === '1'
  } catch {
    return false
  }
}

function markLocalSaveClaimed() {
  try {
    window.localStorage.setItem(CLAIMED_KEY, '1')
  } catch {
    // تجاهل
  }
}

// نفس شكل التقدم دايماً بيبدأ من الخريطة لما نرجع نفتح اللعبة
function freshView(progress) {
  return { ...defaultProgress, ...progress, view: 'map', activeDay: null, currentScene: 0 }
}

function extractProgress(state) {
  const { authStatus, playerName, ...progress } = state
  return progress
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
}

// ============================================================
// useGameState — حالة اللعبة، محفوظة محلياً فوراً (localStorage)
// ومتزامنة في الخلفية مع السيرفر لو فيه جلسة دخول أونلاين.
// لو مفيش باك إند منشور أو حصل أي خطأ شبكة، اللعبة بتكمل محلياً
// بصمت من غير ما توقف الطفل عن اللعب.
// ============================================================
export function useGameState() {
  const [state, setState] = useState(() => ({ ...defaultState }))
  const syncTimer = useRef(null)

  // أول ما التطبيق يفتح: نحاول نستعيد جلسة أونلاين موجودة (كوكي).
  // لو الباك إند مش منشور خالص (فشل الطلب) بنكمل أوفلاين من غير ما نعرض شاشة دخول.
  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const res = await fetchWithTimeout('/api/progress', { credentials: 'include' })
        if (cancelled) return

        if (res.ok) {
          const data = await res.json()
          setState({ authStatus: 'online', playerName: data.name, ...freshView(data.progress) })
          return
        }
        if (res.status === 401) {
          setState((s) => ({ ...s, authStatus: 'login' }))
          return
        }
        throw new Error('unexpected_response')
      } catch {
        if (cancelled) return
        const local = loadLocalProgress()
        setState({ authStatus: 'guest', playerName: null, ...freshView(local || defaultProgress) })
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  // حفظ محلي فوري عند أي تغيير — المصدر اللي اللعب بيعتمد عليه دايماً
  useEffect(() => {
    if (state.authStatus === 'checking' || state.authStatus === 'login') return
    saveLocalProgress(extractProgress(state))
  }, [state])

  // مزامنة في الخلفية مع السيرفر لو فيه جلسة أونلاين فعلاً
  useEffect(() => {
    if (state.authStatus !== 'online') return
    clearTimeout(syncTimer.current)
    syncTimer.current = setTimeout(() => {
      fetchWithTimeout('/api/progress', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(extractProgress(state)),
      }).catch(() => {
        // فشل الشبكة → التقدم محفوظ محلياً بالفعل، هنحاول تاني عند أي تغيير جديد
      })
    }, SYNC_DEBOUNCE_MS)
    return () => clearTimeout(syncTimer.current)
  }, [state])

  // تسجيل الدخول (اسم + PIN). لو الباك إند مش متاح خالص، نكمل أوفلاين بصمت.
  const login = useCallback(async (name, pin) => {
    try {
      const res = await fetchWithTimeout('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, pin }),
      })

      if (res.status === 401) return { ok: false, error: 'wrong_pin' }
      if (!res.ok) return { ok: false, error: 'invalid_input' }

      const data = await res.json()
      const isNewAccount = res.status === 201
      const local = loadLocalProgress()
      const canMigrate = isNewAccount && local && !hasClaimedLocalSave()

      markLocalSaveClaimed()
      setState({
        authStatus: 'online',
        playerName: data.player.name,
        ...freshView(canMigrate ? local : data.progress),
      })
      return { ok: true }
    } catch {
      const local = loadLocalProgress()
      setState({ authStatus: 'guest', playerName: name, ...freshView(local || defaultProgress) })
      return { ok: true, offline: true }
    }
  }, [])

  const logout = useCallback(() => {
    if (state.authStatus === 'online') {
      fetchWithTimeout('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {})
    }
    setState({ ...defaultState, authStatus: 'login' })
  }, [state.authStatus])

  // فتح يوم معيّن والبدء من أول مشهد فيه
  const startDay = useCallback((dayId) => {
    setState((s) => ({ ...s, view: 'day', activeDay: dayId, currentScene: 0 }))
  }, [])

  // الرجوع لخريطة الأيام
  const goToMap = useCallback(() => {
    setState((s) => ({ ...s, view: 'map', activeDay: null, currentScene: 0 }))
  }, [])

  const nextScene = useCallback(() => {
    setState((s) => ({ ...s, currentScene: s.currentScene + 1 }))
  }, [])

  const goToScene = useCallback((index) => {
    setState((s) => ({ ...s, currentScene: index }))
  }, [])

  const addScore = useCallback((category, points = 1) => {
    setState((s) => ({
      ...s,
      scores: { ...s.scores, [category]: (s.scores[category] || 0) + points },
    }))
  }, [])

  const awardBadge = useCallback((badgeId) => {
    setState((s) => (s.badges.includes(badgeId) ? s : { ...s, badges: [...s.badges, badgeId] }))
  }, [])

  const completeDay = useCallback((day) => {
    setState((s) => (s.completedDays.includes(day) ? s : { ...s, completedDays: [...s.completedDays, day] }))
  }, [])

  const resetGame = useCallback(() => {
    setState((s) => ({ ...defaultState, authStatus: s.authStatus, playerName: s.playerName }))
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // تجاهل
    }
  }, [])

  return {
    state,
    login,
    logout,
    startDay,
    goToMap,
    nextScene,
    goToScene,
    addScore,
    awardBadge,
    completeDay,
    resetGame,
  }
}
