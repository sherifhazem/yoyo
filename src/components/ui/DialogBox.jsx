import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import CaptainShareef from '../characters/CaptainShareef'
import Mom from '../characters/Mom'

// ============================================================
// صندوق الحوار — شخصية + نص بتأثير كتابة + زر متابعة اختياري.
// speaker: 'captain' | 'mom'
// expression: تعبير كابتن شريف
// onContinue: لو موجود يظهر زر "تمام"
// ============================================================
export default function DialogBox({
  speaker = 'captain',
  expression = 'normal',
  text = '',
  onContinue,
  continueLabel = 'OK 👍',
  loading = false,
}) {
  const displayed = useTypewriter(text)
  const done = displayed === text

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-center">
        {speaker === 'mom' ? <Mom size={104} /> : <CaptainShareef expression={expression} size={120} />}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl bg-white/95 p-4 shadow-xl ring-2 ring-white"
      >
        {/* مثلث الفقاعة */}
        <div className="absolute -top-3 left-1/2 h-5 w-5 -translate-x-1/2 rotate-45 bg-white/95" />

        <div className="mb-1 text-sm font-extrabold text-explorer-brown">
          {speaker === 'mom' ? '👩 Mom' : '🧭 Captain Shareef'}
          {loading && <span className="mr-2 inline-block animate-pulse text-explorer-sky">…</span>}
        </div>

        <p className="min-h-[3.5rem] text-lg font-semibold leading-relaxed text-slate-800">{displayed}</p>

        {onContinue && done && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            type="button"
            onClick={onContinue}
            className="mt-3 w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
          >
            {continueLabel}
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

// تأثير الكتابة حرف حرف
function useTypewriter(text, speed = 24) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    if (!text) return
    const timer = setInterval(() => {
      indexRef.current += 1
      setDisplayed(text.slice(0, indexRef.current))
      if (indexRef.current >= text.length) clearInterval(timer)
    }, speed)
    return () => clearInterval(timer)
  }, [text, speed])

  return displayed
}
