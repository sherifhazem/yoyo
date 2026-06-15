import { useState } from 'react'
import { motion } from 'framer-motion'
import { floatingSink } from '../../data/day1Story'
import { playClick, playCorrect, playCelebrate } from '../../utils/sound'

// ============================================================
// تجربة الطفو والغرق — تنبؤ لكل عنصر ثم أنيميشن النتيجة.
// بينادي onDone() بعد ما يشوف النتايج.
// ============================================================
export default function FloatingSink({ onDone }) {
  const { items, predictPrompt, floatLabel, sinkLabel, resultIntro } = floatingSink
  const [predictions, setPredictions] = useState({}) // itemId -> true(float)/false(sink)
  const [phase, setPhase] = useState('predict') // predict | result

  const allPredicted = items.every((it) => it.id in predictions)

  const predict = (itemId, floats) => {
    playClick()
    setPredictions((p) => ({ ...p, [itemId]: floats }))
  }

  const runExperiment = () => {
    playCelebrate()
    setPhase('result')
  }

  if (phase === 'result') {
    return (
      <div className="w-full">
        <p className="mb-3 text-center text-lg font-bold text-slate-800">{resultIntro}</p>
        <Pond items={items} predictions={predictions} />
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          type="button"
          onClick={onDone}
          className="mt-4 w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
        >
          إيه اللي لاحظناه؟ 🤔
        </motion.button>
      </div>
    )
  }

  return (
    <div className="w-full">
      <p className="mb-3 text-center text-lg font-extrabold text-slate-800">{predictPrompt}</p>
      <div className="space-y-2">
        {items.map((it) => {
          const pred = predictions[it.id]
          return (
            <div key={it.id} className="flex items-center gap-2 rounded-2xl bg-white/85 p-2 shadow">
              <span className="text-3xl">{it.emoji}</span>
              <span className="flex-1 text-sm font-bold text-slate-700">{it.label}</span>
              <button
                type="button"
                onClick={() => predict(it.id, true)}
                className={`rounded-xl px-3 py-2 text-sm font-bold ${
                  pred === true ? 'bg-explorer-water text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {floatLabel} ⬆️
              </button>
              <button
                type="button"
                onClick={() => predict(it.id, false)}
                className={`rounded-xl px-3 py-2 text-sm font-bold ${
                  pred === false ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {sinkLabel} ⬇️
              </button>
            </div>
          )
        })}
      </div>

      {allPredicted && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          type="button"
          onClick={runExperiment}
          className="mt-4 w-full rounded-2xl bg-explorer-forest py-3 text-lg font-bold text-white shadow-md active:scale-95"
        >
          نجرّب دلوقتي! 💦
        </motion.button>
      )}
    </div>
  )
}

// بركة المية مع أنيميشن طفو/غرق كل عنصر
function Pond({ items, predictions }) {
  return (
    <div className="relative h-56 overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-explorer-water/70 shadow-inner ring-2 ring-explorer-water">
      {/* سطح المية */}
      <div className="absolute left-0 right-0 top-1/3 h-[2px] bg-white/60" />
      <div className="absolute left-0 right-0 top-1/3 bottom-0 bg-explorer-water/30" />

      <div className="absolute inset-0 flex flex-wrap items-start justify-around p-2">
        {items.map((it, i) => {
          const correctPred = predictions[it.id] === it.floats
          return (
            <motion.div
              key={it.id}
              initial={{ y: -10 }}
              animate={{ y: it.floats ? 60 : 150 }}
              transition={{ delay: 0.2 + i * 0.18, type: 'spring', stiffness: 60, damping: 10 }}
              className="flex flex-col items-center"
              style={{ width: '18%' }}
            >
              <span className="text-3xl drop-shadow">{it.emoji}</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + i * 0.18 }}
                className="mt-1 text-[10px] font-bold text-slate-700"
              >
                {it.floats ? 'طافي ⬆️' : 'غارق ⬇️'} {correctPred ? '✅' : ''}
              </motion.span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
