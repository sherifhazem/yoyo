import { useState, useCallback, useEffect } from 'react'
import { PLAYER_NAME } from '../data/days'

const STORAGE_KEY = 'yousef-explorer-save'

const defaultState = {
  playerName: PLAYER_NAME,
  view: 'map', // map | day
  activeDay: null, // اليوم اللي بنلعبه دلوقتي
  currentScene: 0,
  scores: { logic: 0, math: 0, science: 0, english: 0 },
  badges: [],
  completedDays: [],
}

function loadState() {
  if (typeof window === 'undefined') return defaultState
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw)
    // دمج آمن مع الافتراضي عشان أي حقل ناقص
    return {
      ...defaultState,
      ...parsed,
      // نبدأ دايماً من الخريطة عند فتح اللعبة
      view: 'map',
      activeDay: null,
      scores: { ...defaultState.scores, ...(parsed.scores || {}) },
      badges: parsed.badges || [],
      completedDays: parsed.completedDays || [],
    }
  } catch {
    return defaultState
  }
}

// ============================================================
// useGameState — حالة اللعبة + الحفظ في localStorage
// ============================================================
export function useGameState() {
  const [state, setState] = useState(loadState)

  // حفظ تلقائي عند أي تغيير
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // تجاهل لو localStorage مش متاح
    }
  }, [state])

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
    setState(defaultState)
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // تجاهل
    }
  }, [])

  return { state, startDay, goToMap, nextScene, goToScene, addScore, awardBadge, completeDay, resetGame }
}
