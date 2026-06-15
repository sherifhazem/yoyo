import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ChoiceButton from '../ui/ChoiceButton'
import { playCorrect, playWrong } from '../../utils/sound'

// ============================================================
// لغز إنجليزي واحد — ورقة ملصوقة بنص LTR + اختيارات + كشف مفردة.
// riddle: { lines, vocab[], choices, correctReply, wrongReply }
// ============================================================
export default function EnglishRiddle({ riddle, index, total, onSolved }) {
  const [selected, setSelected] = useState(null)
  const [solved, setSolved] = useState(false)
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setSelected(null)
    setSolved(false)
    setFeedback(null)
  }, [riddle])

  const pick = (choice) => {
    if (solved) return
    setSelected(choice.id)
    if (choice.correct) {
      setSolved(true)
      setFeedback('correct')
      playCorrect()
    } else {
      setFeedback('wrong')
      playWrong()
      setTimeout(() => {
        setSelected(null)
        setFeedback(null)
      }, 1200)
    }
  }

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-sm font-bold text-explorer-brown">
        📜 ورقة {index + 1} من {total}
      </p>

      {/* الورقة الملصوقة على الشجرة */}
      <motion.div
        initial={{ rotate: -2, scale: 0.95, opacity: 0 }}
        animate={{ rotate: -1.5, scale: 1, opacity: 1 }}
        className="ltr relative mx-auto mb-4 max-w-xs rounded-md bg-amber-50 p-4 shadow-lg ring-1 ring-amber-200"
        style={{ fontFamily: 'Tajawal, system-ui' }}
      >
        {/* دبوس الورقة */}
        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-rose-400 shadow" />
        {riddle.lines.map((line, i) => (
          <p key={i} className="text-base font-semibold leading-relaxed text-slate-700">
            {line}
          </p>
        ))}
      </motion.div>

      <div className="grid grid-cols-3 gap-2">
        {riddle.choices.map((c) => {
          let state = 'idle'
          if (c.id === selected) state = c.correct ? 'correct' : 'wrong'
          else if (solved && c.correct) state = 'correct'
          return (
            <ChoiceButton key={c.id} state={state} disabled={solved} onClick={() => pick(c)}>
              <span className="flex flex-col items-center">
                <span className="text-2xl">{c.emoji}</span>
                <span className="ltr text-sm">{c.label}</span>
              </span>
            </ChoiceButton>
          )
        })}
      </div>

      {feedback === 'wrong' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="ltr mt-3 rounded-2xl bg-amber-100 p-3 text-center font-bold text-amber-800 shadow"
        >
          {riddle.wrongReply}
        </motion.div>
      )}

      {solved && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
          <div className="ltr rounded-2xl bg-green-100 p-3 text-center font-bold text-green-800 shadow">
            {riddle.correctReply}
          </div>

          {/* كشف المفردات الجديدة */}
          <div className="mt-3 space-y-2">
            {riddle.vocab.map((v) => (
              <motion.div
                key={v.word}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white p-2 shadow ring-2 ring-explorer-sky/40"
              >
                <span className="text-lg">📖</span>
                <span className="ltr font-black text-explorer-brown">{v.word}</span>
                <span className="font-bold text-slate-500">=</span>
                <span className="font-bold text-slate-700">{v.meaning}</span>
              </motion.div>
            ))}
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            type="button"
            onClick={onSolved}
            className="mt-4 w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
          >
            {index < total - 1 ? 'الورقة اللي بعدها 📜' : 'خلصنا الألغاز! ✓'}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
