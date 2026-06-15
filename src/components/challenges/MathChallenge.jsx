import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Mom from '../characters/Mom'
import ChoiceButton from '../ui/ChoiceButton'
import { playCorrect, playWrong } from '../../utils/sound'

// ============================================================
// تحدي رياضيات عام — رسمة بصرية + اختيار و/أو كتابة.
// challenge: { prompt, visual, inputMode, choices, answer, correctReply, wrongReply }
// inputMode: 'choices' | 'both'
// ============================================================
export default function MathChallenge({ challenge, onSolved }) {
  const [typed, setTyped] = useState('')
  const [selected, setSelected] = useState(null)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong'
  const [solved, setSolved] = useState(false)

  useEffect(() => {
    setTyped('')
    setSelected(null)
    setFeedback(null)
    setSolved(false)
  }, [challenge])

  const succeed = () => {
    setSolved(true)
    setFeedback('correct')
    playCorrect()
  }
  const fail = () => {
    setFeedback('wrong')
    playWrong()
    setTimeout(() => setFeedback(null), 1200)
  }

  const checkTyped = () => {
    if (solved || !typed) return
    if (typed.trim() === String(challenge.answer)) succeed()
    else {
      fail()
      setTyped('')
    }
  }

  const checkChoice = (choice) => {
    if (solved) return
    setSelected(choice.id)
    if (choice.correct) succeed()
    else {
      fail()
      setTimeout(() => setSelected(null), 1200)
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-end justify-center gap-2">
        <Mom size={84} />
        <div className="mb-2 max-w-[70%] rounded-2xl rounded-br-sm bg-white/95 p-3 text-base font-bold text-slate-800 shadow-md">
          {challenge.prompt}
        </div>
      </div>

      <MathVisual visual={challenge.visual} />

      {/* الكتابة (لو متاحة) */}
      {challenge.inputMode === 'both' && (
        <div className="mb-3 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={solved}
            placeholder="اكتب الإجابة"
            className="h-14 flex-1 rounded-2xl bg-white px-4 text-center text-2xl font-black text-slate-800 shadow-inner ring-2 ring-slate-200 focus:ring-explorer-sky focus:outline-none"
          />
          <button
            type="button"
            onClick={checkTyped}
            disabled={solved || !typed}
            className="rounded-2xl bg-explorer-forest px-5 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
          >
            تأكيد
          </button>
        </div>
      )}

      {/* الاختيارات */}
      {challenge.inputMode === 'both' && (
        <p className="mb-2 text-center text-sm font-bold text-slate-600">أو اختار من دول:</p>
      )}
      <div className="grid grid-cols-3 gap-2">
        {challenge.choices.map((c) => {
          let state = 'idle'
          if (c.id === selected) state = c.correct ? 'correct' : 'wrong'
          else if (solved && c.correct) state = 'correct'
          return (
            <ChoiceButton key={c.id} state={state} disabled={solved} onClick={() => checkChoice(c)}>
              {c.label}
            </ChoiceButton>
          )
        })}
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 rounded-2xl p-3 text-center font-bold shadow-md ${
            feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
          }`}
        >
          👩 {feedback === 'correct' ? challenge.correctReply : challenge.wrongReply}
        </motion.div>
      )}

      {solved && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          type="button"
          onClick={onSolved}
          className="mt-3 w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
        >
          كمّل 👍
        </motion.button>
      )}
    </div>
  )
}

// رسمة بصرية بسيطة لكل نوع تحدي
function MathVisual({ visual }) {
  if (!visual) return null

  if (visual.type === 'eggs') {
    return (
      <div className="mb-3 flex flex-wrap justify-center gap-1 rounded-2xl bg-white/60 p-3">
        {Array.from({ length: visual.total }).map((_, i) => {
          const removed = i >= visual.total - visual.removed
          return (
            <motion.span
              key={i}
              animate={removed ? { opacity: 0.25, scale: 0.85 } : { opacity: 1 }}
              className="relative text-2xl"
            >
              🥚
              {removed && <span className="absolute inset-0 flex items-center justify-center text-rose-500">✖️</span>}
            </motion.span>
          )
        })}
      </div>
    )
  }

  if (visual.type === 'pancakes') {
    return (
      <div className="mb-3 flex flex-wrap justify-center gap-2 rounded-2xl bg-white/60 p-3">
        {Array.from({ length: visual.count }).map((_, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="text-2xl">🥞</span>
            <span className="text-xs">{'🥄'.repeat(visual.perItem)}</span>
          </div>
        ))}
      </div>
    )
  }

  if (visual.type === 'cup') {
    return (
      <div className="mb-3 flex items-center justify-center gap-3 rounded-2xl bg-white/60 p-3">
        <CupGlass fill={50} label="نص كوب" />
        <span className="text-2xl font-black text-slate-600">+</span>
        <CupGlass fill={50} label="نص كوب" />
        <span className="text-2xl font-black text-slate-600">=</span>
        <span className="text-3xl">❓</span>
      </div>
    )
  }

  return null
}

function CupGlass({ fill, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-16 w-12 overflow-hidden rounded-b-xl rounded-t-md border-2 border-slate-400 bg-white">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${fill}%` }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-0 w-full bg-explorer-water/80"
        />
      </div>
      <span className="mt-1 text-[10px] font-bold text-slate-600">{label}</span>
    </div>
  )
}
