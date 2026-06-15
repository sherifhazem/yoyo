import { useState } from 'react'
import { motion } from 'framer-motion'
import DialogBox from '../ui/DialogBox'
import MathChallenge from '../challenges/MathChallenge'
import { breakfast } from '../../data/day1Story'

// ============================================================
// مشهد 3 — الإفطار والرياضيات (رياضيات).
// مقدمة من ماما → 3 تحديات (طرح، ضرب، كسور).
// ============================================================
export default function BreakfastScene({ onComplete, addScore }) {
  const [phase, setPhase] = useState('intro') // intro | challenge
  const [index, setIndex] = useState(0)
  const challenge = breakfast.challenges[index]

  const handleSolved = () => {
    addScore('math', 1)
    if (index < breakfast.challenges.length - 1) {
      setIndex((i) => i + 1)
    } else {
      onComplete()
    }
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <DialogBox
          speaker="mom"
          text={breakfast.intro}
          onContinue={() => setPhase('challenge')}
          continueLabel="يلا نطبخ! 🍳"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <motion.div key={challenge.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <MathChallenge challenge={challenge} onSolved={handleSolved} />
      </motion.div>
    </div>
  )
}
