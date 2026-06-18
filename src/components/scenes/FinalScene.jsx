import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DialogSequence from '../ui/DialogSequence'
import ChoiceQuestion from '../ui/ChoiceQuestion'
import RewardScreen from '../ui/RewardScreen'
import { useStory } from '../../story/StoryContext'
import { playCelebrate } from '../../utils/sound'

// ============================================================
// مشهد 7 — المكافأة ودفتر المستكشف.
// حوار الفخر → الشارات → سؤال التأمل → إنهاء اليوم.
// ============================================================
export default function FinalScene({ onComplete, onBackToMap }) {
  const { final, id: dayId } = useStory()
  const [phase, setPhase] = useState('praise') // praise | notebook | reflection | done

  useEffect(() => {
    if (phase === 'notebook') playCelebrate()
  }, [phase])

  return (
    <div className="flex flex-1 flex-col justify-center">
      {phase === 'praise' && (
        <DialogSequence
          lines={final.intro}
          speaker="captain"
          expression="proud"
          onDone={() => setPhase('notebook')}
          lastLabel="Open the notebook! 📒"
        />
      )}

      {phase === 'notebook' && (
        <>
          <Confetti />
          <RewardScreen badges={final.badges} />
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + final.badges.length * 0.4 }}
            type="button"
            onClick={() => setPhase('reflection')}
            className="mt-4 w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
          >
            Last question 🤔
          </motion.button>
        </>
      )}

      {phase === 'reflection' && (
        <ChoiceQuestion
          prompt={final.reflection.question}
          choices={final.reflection.choices}
          correctReply={final.reflection.correctReply}
          wrongReply={final.reflection.wrongReply}
          dsContext="Yousef finished day 1 and reflects on what he learned."
          continueLabel={final.finishLabel}
          onCorrect={() => {
            onComplete()
            setPhase('done')
          }}
        />
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl bg-white/95 p-6 text-center shadow-2xl"
        >
          <Confetti />
          <div className="mb-2 text-6xl">🏆</div>
          <h2 className="mb-1 text-2xl font-black text-explorer-brown">Congrats, Yousef!</h2>
          <p className="mb-4 font-bold text-slate-700">You finished Day {dayId} of the adventure. You are a real explorer! 🧭</p>
          <button
            type="button"
            onClick={onBackToMap}
            className="w-full rounded-2xl bg-explorer-forest py-3 text-lg font-bold text-white shadow-md active:scale-95"
          >
            Back to the map 🗺️
          </button>
        </motion.div>
      )}
    </div>
  )
}

// كونفيتي بسيط
function Confetti() {
  const pieces = ['🎉', '⭐', '🎊', '✨', '🌟', '🎈']
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {Array.from({ length: 16 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl"
          style={{ left: `${(i * 6.5) % 100}%`, top: '-10%' }}
          initial={{ y: -40, rotate: 0, opacity: 1 }}
          animate={{ y: '110vh', rotate: 720, opacity: 0 }}
          transition={{ duration: 2.5 + (i % 4) * 0.5, repeat: Infinity, delay: (i % 6) * 0.3, ease: 'easeIn' }}
        >
          {pieces[i % pieces.length]}
        </motion.span>
      ))}
    </div>
  )
}
