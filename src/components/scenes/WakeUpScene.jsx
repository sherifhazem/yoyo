import { useState } from 'react'
import { motion } from 'framer-motion'
import DialogBox from '../ui/DialogBox'
import ChoiceButton from '../ui/ChoiceButton'
import { useStory } from '../../story/StoryContext'
import { playCelebrate } from '../../utils/sound'

// ============================================================
// مشهد 1 — الاستيقاظ. حوار تعريفي + اختيار البدء.
// ============================================================
export default function WakeUpScene({ onComplete }) {
  const { wakeUp } = useStory()
  const [step, setStep] = useState(0) // فهرس جُملة المقدمة
  const [phase, setPhase] = useState('intro') // intro | choice | waiting | starting
  const isLastIntro = step >= wakeUp.intro.length - 1

  const handleIntroContinue = () => {
    if (isLastIntro) setPhase('choice')
    else setStep((s) => s + 1)
  }

  const handleChoice = (choice) => {
    if (choice.correct) {
      playCelebrate()
      setPhase('starting')
    } else {
      setPhase('waiting')
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      {phase === 'intro' && (
        <DialogBox
          speaker="captain"
          expression={step === 0 ? 'excited' : 'normal'}
          text={wakeUp.intro[step]}
          onContinue={handleIntroContinue}
          continueLabel={isLastIntro ? 'Listen 👂' : 'Next 👍'}
        />
      )}

      {phase === 'choice' && (
        <>
          <DialogBox speaker="captain" expression="explaining" text={wakeUp.intro[wakeUp.intro.length - 1]} />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 space-y-3"
          >
            {wakeUp.choices.map((c) => (
              <ChoiceButton key={c.id} onClick={() => handleChoice(c)}>
                {c.label}
              </ChoiceButton>
            ))}
          </motion.div>
        </>
      )}

      {phase === 'waiting' && (
        <DialogBox
          speaker="captain"
          expression="normal"
          text={wakeUp.waitReply}
          onContinue={() => setPhase('choice')}
          continueLabel="I am ready now! ✓"
        />
      )}

      {phase === 'starting' && (
        <DialogBox
          speaker="captain"
          expression="excited"
          text={wakeUp.startReply}
          onContinue={onComplete}
          continueLabel="Let's go! 🚀"
        />
      )}
    </div>
  )
}
