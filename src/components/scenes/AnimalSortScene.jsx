import { useState } from 'react'
import { motion } from 'framer-motion'
import DialogBox from '../ui/DialogBox'
import ChoiceQuestion from '../ui/ChoiceQuestion'
import AnimalSort from '../challenges/AnimalSort'
import { useStory } from '../../story/StoryContext'

// ============================================================
// مشهد 2 — تصنيف الحيوانات (منطق).
// مقدمة → لوحة السحب والإفلات → سؤال متابعة.
// ============================================================
export default function AnimalSortScene({ onComplete, addScore, awardBadge }) {
  const { animalSort } = useStory()
  const [phase, setPhase] = useState('intro') // intro | sort | success | followup

  const handleSorted = () => {
    addScore('logic', 3)
    setPhase('success')
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      {phase === 'intro' && (
        <DialogBox
          speaker="captain"
          expression="explaining"
          text={animalSort.intro}
          onContinue={() => setPhase('sort')}
          continueLabel="Let's sort! 🐾"
        />
      )}

      {phase === 'sort' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AnimalSort onSolved={handleSorted} />
        </motion.div>
      )}

      {phase === 'success' && (
        <DialogBox
          speaker="captain"
          expression="proud"
          text={animalSort.successReply}
          onContinue={() => setPhase('followup')}
          continueLabel="One more question 🤔"
        />
      )}

      {phase === 'followup' && (
        <ChoiceQuestion
          prompt={animalSort.followUp.question}
          choices={animalSort.followUp.choices}
          correctReply={animalSort.followUp.correctReply}
          wrongReply={animalSort.followUp.wrongReply}
          dsContext="In a learning game, Yousef sorted animals and answered why water animals are similar."
          onCorrect={() => {
            addScore('logic', 1)
            awardBadge('animals')
            onComplete()
          }}
        />
      )}
    </div>
  )
}
