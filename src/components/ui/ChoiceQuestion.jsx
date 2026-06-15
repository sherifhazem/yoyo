import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ChoiceButton from './ChoiceButton'
import { playCorrect, playWrong } from '../../utils/sound'
import { useDeepSeek } from '../../hooks/useDeepSeek'

// ============================================================
// سؤال اختيار من متعدد قابل لإعادة الاستخدام.
// بيتعامل مع: الحالات صح/غلط، الأصوات، رد كابتن شريف،
// وإثراء اختياري من DeepSeek. كل غلطة = تشجيع وإعادة محاولة.
// ============================================================
export default function ChoiceQuestion({
  prompt,
  choices,
  correctReply,
  wrongReply,
  onCorrect,
  columns = 1,
  dsContext, // situation description for DeepSeek (optional)
  continueLabel = 'Next 👍',
}) {
  const [selected, setSelected] = useState(null)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState(null) // 'correct' | 'wrong' | null
  const { enriched, enrich, reset } = useDeepSeek()

  useEffect(() => {
    // إعادة الضبط لو اتغير السؤال
    setSelected(null)
    setSolved(false)
    setFeedback(null)
    reset()
  }, [prompt, reset])

  const handlePick = (choice) => {
    if (solved) return
    setSelected(choice.id)
    if (choice.correct) {
      setSolved(true)
      setFeedback('correct')
      playCorrect()
      if (dsContext) enrich(`${dsContext} Yousef answered correctly. Celebrate briefly in simple English.`)
    } else {
      setFeedback('wrong')
      playWrong()
    }
  }

  const reply = feedback === 'correct' ? enriched || correctReply : wrongReply

  return (
    <div className="w-full">
      <p className="mb-4 text-center text-xl font-extrabold leading-relaxed text-slate-800 drop-shadow-sm">
        {prompt}
      </p>

      <div className={`grid gap-3 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {choices.map((c) => {
          let state = 'idle'
          if (c.id === selected) state = c.correct ? 'correct' : 'wrong'
          else if (solved && c.correct) state = 'correct'
          return (
            <ChoiceButton key={c.id} state={state} disabled={solved} onClick={() => handlePick(c)}>
              {c.emoji ? `${c.label} ${c.emoji}` : c.label}
            </ChoiceButton>
          )
        })}
      </div>

      {feedback && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
          <div
            className={`rounded-2xl p-3 text-center font-bold shadow-md ${
              feedback === 'correct' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            🧭 {reply}
          </div>
          {feedback === 'wrong' && (
            <button
              type="button"
              onClick={() => { setSelected(null); setFeedback(null) }}
              className="w-full rounded-2xl bg-explorer-brown/90 py-2 text-base font-bold text-white shadow-md active:scale-95"
            >
              Try Again 🔄
            </button>
          )}
        </motion.div>
      )}

      {solved && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          type="button"
          onClick={onCorrect}
          className="mt-4 w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
        >
          {continueLabel}
        </motion.button>
      )}
    </div>
  )
}
