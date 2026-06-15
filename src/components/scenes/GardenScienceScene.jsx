import { useState } from 'react'
import DialogBox from '../ui/DialogBox'
import ChoiceQuestion from '../ui/ChoiceQuestion'
import FloatingSink from '../challenges/FloatingSink'
import { floatingSink } from '../../data/day1Story'

// ============================================================
// مشهد 4 — العلوم (الطفو والغرق).
// مقدمة → تجربة → استنتاج → سؤال تفكير.
// ============================================================
export default function GardenScienceScene({ onComplete, addScore, awardBadge }) {
  const [phase, setPhase] = useState('intro') // intro | experiment | conclusion | thinking

  return (
    <div className="flex flex-1 flex-col justify-center">
      {phase === 'intro' && (
        <DialogBox
          speaker="captain"
          expression="explaining"
          text={floatingSink.intro}
          onContinue={() => setPhase('experiment')}
          continueLabel="يلا نجرّب! 🔬"
        />
      )}

      {phase === 'experiment' && <FloatingSink onDone={() => setPhase('conclusion')} />}

      {phase === 'conclusion' && (
        <ChoiceQuestion
          prompt={floatingSink.conclusion.question}
          choices={floatingSink.conclusion.choices}
          correctReply={floatingSink.conclusion.correctReply}
          wrongReply={floatingSink.conclusion.wrongReply}
          dsContext="Yousef did a floating/sinking experiment and concluded that light things float."
          onCorrect={() => {
            addScore('science', 1)
            setPhase('thinking')
          }}
        />
      )}

      {phase === 'thinking' && (
        <ChoiceQuestion
          prompt={floatingSink.thinking.question}
          choices={floatingSink.thinking.choices}
          correctReply={floatingSink.thinking.correctReply}
          wrongReply={floatingSink.thinking.wrongReply}
          dsContext="Yousef reasons why wood floats and stone sinks."
          onCorrect={() => {
            addScore('science', 1)
            awardBadge('float')
            onComplete()
          }}
        />
      )}
    </div>
  )
}
