import { motion } from 'framer-motion'
import ProgressBar from '../ui/ProgressBar'

// ============================================================
// إطار اللعبة Mobile-First + خلفية البيئة + شريط التقدم.
// environment: room | kitchen | garden | reward
// ============================================================
const BACKGROUNDS = {
  room: 'from-sky-200 via-sky-100 to-amber-100',
  kitchen: 'from-emerald-100 via-lime-50 to-amber-50',
  garden: 'from-sky-300 via-emerald-200 to-lime-200',
  reward: 'from-indigo-400 via-purple-300 to-amber-200',
}

export default function GameLayout({ environment = 'room', current, total, showProgress = true, children }) {
  return (
    <div className="flex min-h-[100dvh] w-full justify-center bg-slate-900">
      {/* لوحة الموبايل */}
      <div className={`relative flex min-h-[100dvh] w-full max-w-md flex-col overflow-hidden bg-gradient-to-b ${BACKGROUNDS[environment]}`}>
        <EnvironmentDecor environment={environment} />

        {/* شريط التقدم */}
        {showProgress && (
          <div className="relative z-20 px-4 pt-4">
            <ProgressBar current={current} total={total} />
          </div>
        )}

        {/* محتوى المشهد */}
        <div className="no-scrollbar relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pb-6 pt-3">
          {children}
        </div>
      </div>
    </div>
  )
}

// زينة بسيطة لكل بيئة (CSS/إيموجي)
function EnvironmentDecor({ environment }) {
  if (environment === 'room') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="animate-sun-glow absolute right-6 top-16 h-16 w-16 rounded-full bg-yellow-300" />
        <div className="absolute bottom-0 h-24 w-full bg-amber-200/60" />
        <div className="absolute bottom-10 left-6 text-4xl">🛏️</div>
      </div>
    )
  }
  if (environment === 'kitchen') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute bottom-0 h-20 w-full bg-amber-700/30" />
        <div className="absolute bottom-4 left-4 text-3xl">🍳</div>
        <div className="absolute bottom-4 right-4 text-3xl">🥛</div>
        <div className="absolute top-12 right-8 text-2xl opacity-70">🪟</div>
      </div>
    )
  }
  if (environment === 'garden') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="animate-sun-glow absolute right-6 top-12 h-12 w-12 rounded-full bg-yellow-300" />
        <div className="absolute bottom-0 h-20 w-full bg-green-600/40" />
        <div className="absolute bottom-2 left-2 text-4xl">🌳</div>
        <div className="absolute bottom-2 right-2 text-4xl">🌲</div>
        <motion.div
          className="absolute top-20 left-8 text-2xl"
          animate={{ x: [0, 14, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          ☁️
        </motion.div>
      </div>
    )
  }
  // reward
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {['✨', '⭐', '🌟', '✨', '⭐'].map((s, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          style={{ left: `${12 + i * 18}%`, top: `${10 + (i % 3) * 12}%` }}
          animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {s}
        </motion.div>
      ))}
    </div>
  )
}
