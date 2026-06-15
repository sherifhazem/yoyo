import { motion } from 'framer-motion'
import { playClick } from '../../utils/sound'

// ============================================================
// زر اختيار باللمس، مع حالات: عادي / صح / غلط / معطّل.
// state: idle | correct | wrong
// ============================================================
export default function ChoiceButton({ children, onClick, state = 'idle', disabled = false, className = '' }) {
  const stateStyles = {
    idle: 'bg-white text-slate-800 ring-2 ring-slate-200 active:ring-explorer-sky',
    correct: 'bg-green-500 text-white ring-2 ring-green-600',
    wrong: 'bg-rose-100 text-rose-700 ring-2 ring-rose-300',
  }

  return (
    <motion.button
      type="button"
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={state === 'wrong' ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.4 }}
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        playClick()
        onClick?.()
      }}
      className={`min-h-[56px] w-full rounded-2xl px-5 py-3 text-lg font-bold shadow-md transition-colors disabled:opacity-90 ${stateStyles[state]} ${className}`}
    >
      {children}
    </motion.button>
  )
}
