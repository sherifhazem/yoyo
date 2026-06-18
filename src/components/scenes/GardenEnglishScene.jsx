import { useState } from 'react'
import { motion } from 'framer-motion'
import DialogBox from '../ui/DialogBox'
import EnglishRiddle from '../challenges/EnglishRiddle'
import { useStory } from '../../story/StoryContext'

// ============================================================
// مشهد 5 — ألغاز الإنجليزي (إنجليزي).
// مقدمة → 3 ألغاز ورا بعض.
// ============================================================
export default function GardenEnglishScene({ onComplete, addScore, awardBadge }) {
  const { englishRiddles } = useStory()
  const [phase, setPhase] = useState('intro') // intro | riddles
  const [index, setIndex] = useState(0)
  const riddles = englishRiddles.riddles

  const handleSolved = () => {
    addScore('english', 1)
    if (index < riddles.length - 1) {
      setIndex((i) => i + 1)
    } else {
      awardBadge('riddles')
      onComplete()
    }
  }

  if (phase === 'intro') {
    return (
      <div className="flex flex-1 flex-col justify-center">
        <DialogBox
          speaker="captain"
          expression="excited"
          text={englishRiddles.intro}
          onContinue={() => setPhase('riddles')}
          continueLabel="Let's read the riddles! 📜"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <motion.div key={riddles[index].id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <EnglishRiddle riddle={riddles[index]} index={index} total={riddles.length} onSolved={handleSolved} />
      </motion.div>
    </div>
  )
}
