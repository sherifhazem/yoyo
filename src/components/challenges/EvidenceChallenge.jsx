import { useState } from 'react'
import { motion } from 'framer-motion'
import { evidence } from '../../data/day1Story'
import { playWrong, playCelebrate } from '../../utils/sound'

// ============================================================
// تحليل الأدلة — عرض الأدلة، اختيار 3 مشتبهين، تحقق منطقي.
// بينادي onSolved() بعد التحقق الصح.
// ============================================================
export default function EvidenceChallenge({ onSolved }) {
  const { clues, question, suspects, wrongReply, verification, successReply } = evidence
  const [picked, setPicked] = useState([]) // ids
  const [feedback, setFeedback] = useState(null) // 'wrong' | null
  const [solved, setSolved] = useState(false)

  const toggle = (id) => {
    if (solved) return
    setFeedback(null)
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id)
      if (cur.length >= 3) return cur // أقصى 3
      return [...cur, id]
    })
  }

  const submit = () => {
    if (picked.length !== 3 || solved) return
    const guilty = suspects.filter((s) => s.guilty).map((s) => s.id)
    const correct = guilty.length === picked.length && guilty.every((id) => picked.includes(id))
    if (correct) {
      setSolved(true)
      playCelebrate()
    } else {
      setFeedback('wrong')
      playWrong()
      setTimeout(() => {
        setPicked([])
        setFeedback(null)
      }, 1600)
    }
  }

  return (
    <div className="w-full">
      {/* الأدلة */}
      <div className="mb-3 rounded-2xl bg-white/85 p-3 shadow">
        <h3 className="mb-2 text-center text-sm font-black text-explorer-brown">🔍 The clues we found</h3>
        <ul className="grid grid-cols-2 gap-2">
          {clues.map((c) => (
            <li key={c.id} className="flex items-center gap-2 rounded-xl bg-slate-50 p-2 text-xs font-bold text-slate-700">
              <span className="text-xl">{c.emoji}</span>
              {c.label}
            </li>
          ))}
        </ul>
      </div>

      <p className="mb-3 text-center text-lg font-extrabold text-slate-800">
        {question} <span className="text-sm font-bold text-slate-600">({picked.length}/3)</span>
      </p>

      {/* المشتبهين */}
      <div className="grid grid-cols-3 gap-2">
        {suspects.map((s) => {
          const isPicked = picked.includes(s.id)
          const showGuilt = solved && s.guilty
          return (
            <motion.button
              key={s.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => toggle(s.id)}
              disabled={solved}
              className={`flex min-h-[84px] flex-col items-center justify-center rounded-2xl p-2 shadow-md ring-2 transition-colors ${
                showGuilt
                  ? 'bg-green-500 text-white ring-green-600'
                  : isPicked
                    ? 'bg-explorer-sky text-white ring-explorer-sky'
                    : 'bg-white text-slate-700 ring-slate-200'
              }`}
            >
              <span className="text-3xl">{s.emoji}</span>
              <span className="text-xs font-bold">{s.label}</span>
              {isPicked && !solved && <span className="text-xs">✓</span>}
            </motion.button>
          )
        })}
      </div>

      {feedback === 'wrong' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 rounded-2xl bg-amber-100 p-3 text-center font-bold text-amber-800 shadow"
        >
          🧭 {wrongReply}
        </motion.div>
      )}

      {!solved && (
        <button
          type="button"
          onClick={submit}
          disabled={picked.length !== 3}
          className="mt-4 w-full rounded-2xl bg-explorer-forest py-3 text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
        >
          Check my answer 🔍
        </button>
      )}

      {/* التحقق المنطقي */}
      {solved && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <div className="rounded-2xl bg-green-100 p-3 text-center font-bold text-green-800 shadow">🧭 {successReply}</div>
          <div className="mt-3 space-y-2">
            {verification.map((line, i) => (
              <motion.div
                key={i}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.4 }}
                className="rounded-xl bg-white p-2 text-center text-sm font-bold text-slate-700 shadow"
              >
                {line}
              </motion.div>
            ))}
          </div>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 + verification.length * 0.4 }}
            type="button"
            onClick={onSolved}
            className="mt-4 w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
          >
            Last question 🤔
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
