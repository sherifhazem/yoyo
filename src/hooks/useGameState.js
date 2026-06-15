import { useState, useCallback, useEffect } from 'react'
import { PLAYER_NAME } from '../data/day1Story'

const STORAGE_KEY = 'yousef-explorer-save'

const defaultState = {
  playerName: PLAYER_NAME,
  currentDay: 1,
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

  return { state, nextScene, goToScene, addScore, awardBadge, completeDay, resetGame }
}
