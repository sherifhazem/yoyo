import { useState } from 'react'
import DialogBox from './DialogBox'
import { playClick } from '../../utils/sound'

// ============================================================
// يعرض مجموعة جُمل واحدة ورا التانية، وفي الآخر بينادي onDone.
// ============================================================
export default function DialogSequence({
  lines,
  speaker = 'captain',
  expression = 'normal',
  onDone,
  lastLabel = 'يلا نبدأ! 🚀',
}) {
  const [index, setIndex] = useState(0)
  const isLast = index >= lines.length - 1

  const handleContinue = () => {
    playClick()
    if (isLast) {
      onDone?.()
    } else {
      setIndex((i) => i + 1)
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <DialogBox
        speaker={speaker}
        expression={expression}
        text={lines[index]}
        onContinue={handleContinue}
        continueLabel={isLast ? lastLabel : 'كمّل 👍'}
      />
    </div>
  )
}
