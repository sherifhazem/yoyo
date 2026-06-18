import { createContext, useContext } from 'react'

// ============================================================
// StoryContext — يوفّر بيانات اليوم النشط (story bundle) لكل المكوّنات.
// كل يوم له نفس الشكل: wakeUp / animalSort / breakfast / floatingSink
// / englishRiddles / evidence / final + meta (id, title, emoji...).
// ============================================================
const StoryContext = createContext(null)

export function StoryProvider({ day, children }) {
  return <StoryContext.Provider value={day}>{children}</StoryContext.Provider>
}

export function useStory() {
  const ctx = useContext(StoryContext)
  if (!ctx) throw new Error('useStory must be used inside <StoryProvider>')
  return ctx
}
