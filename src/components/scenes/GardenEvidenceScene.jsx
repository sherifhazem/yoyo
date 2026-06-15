import { useState } from 'react'
import DialogBox from '../ui/DialogBox'
import ChoiceQuestion from '../ui/ChoiceQuestion'
import EvidenceChallenge from '../challenges/EvidenceChallenge'
import { evidence } from '../../data/day1Story'

// ============================================================
// مشهد 6 — تحليل الأدلة (منطق).
// مقدمة → اختيار المشتبهين والتحقق → سؤال ختامي.
// ============================================================
export default function GardenEvidenceScene({ onComplete, addScore, awardBadge }) {
  const [phase, setPhase] = useState('intro') // intro | evidence | final

  return (
    <div className="flex flex-1 flex-col justify-center">
      {phase === 'intro' && (
        <DialogBox
          speaker="captain"
          expression="explaining"
          text={evidence.intro}
          onContinue={() => setPhase('evidence')}
          continueLabel="Let's check the clues! 🔍"
        />
      )}

      {phase === 'evidence' && (
        <EvidenceChallenge
          onSolved={() => {
            addScore('logic', 3)
            setPhase('final')
          }}
        />
      )}

      {phase === 'final' && (
        <ChoiceQuestion
          prompt={evidence.finalQuestion.question}
          choices={evidence.finalQuestion.choices}
          correctReply={evidence.finalQuestion.correctReply}
          wrongReply={evidence.finalQuestion.wrongReply}
          dsContext="Yousef solved a mystery and reasons why the lion and bear are not suspects."
          onCorrect={() => {
            addScore('logic', 1)
            awardBadge('detective')
            onComplete()
          }}
        />
      )}
    </div>
  )
}
