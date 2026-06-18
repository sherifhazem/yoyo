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
  map: 'from-sky-300 via-indigo-200 to-amber-100',
  beach: 'from-sky-300 via-cyan-100 to-amber-100',
  ocean: 'from-cyan-300 via-sky-400 to-blue-700',
  space: 'from-indigo-900 via-purple-800 to-slate-900',
  farm: 'from-sky-300 via-lime-200 to-amber-200',
  jungle: 'from-emerald-300 via-green-400 to-green-700',
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
  if (environment === 'beach') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="animate-sun-glow absolute right-6 top-12 h-14 w-14 rounded-full bg-yellow-300" />
        <div className="absolute bottom-0 h-20 w-full bg-amber-200/70" />
        <div className="absolute bottom-2 left-3 text-4xl">🏖️</div>
        <div className="absolute bottom-2 right-3 text-3xl">🐚</div>
      </div>
    )
  }
  if (environment === 'ocean') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute bottom-0 h-16 w-full bg-blue-900/30" />
        <div className="absolute bottom-2 left-3 text-3xl">🪸</div>
        <div className="absolute bottom-3 right-4 text-2xl">🐠</div>
        <motion.div
          className="absolute top-16 left-8 text-2xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          🫧
        </motion.div>
      </div>
    )
  }
  if (environment === 'space') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        {['⭐', '✨', '🌟', '⭐', '✨', '🌟'].map((s, i) => (
          <motion.div
            key={i}
            className="absolute text-lg"
            style={{ left: `${(i * 17 + 8) % 95}%`, top: `${(i * 23 + 10) % 80}%` }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 2 + i * 0.4, repeat: Infinity }}
          >
            {s}
          </motion.div>
        ))}
        <div className="absolute bottom-6 right-6 text-4xl">🪐</div>
        <div className="absolute top-16 left-6 text-3xl">🌙</div>
      </div>
    )
  }
  if (environment === 'farm') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="animate-sun-glow absolute right-6 top-12 h-12 w-12 rounded-full bg-yellow-300" />
        <div className="absolute bottom-0 h-20 w-full bg-lime-600/40" />
        <div className="absolute bottom-2 left-2 text-4xl">🚜</div>
        <div className="absolute bottom-2 right-3 text-3xl">🌾</div>
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
  if (environment === 'jungle') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute bottom-0 h-20 w-full bg-green-800/40" />
        <div className="absolute bottom-2 left-1 text-4xl">🌴</div>
        <div className="absolute bottom-2 right-1 text-4xl">🌴</div>
        <div className="absolute top-12 left-6 text-2xl">🦜</div>
        <div className="absolute top-16 right-8 text-2xl">🌿</div>
      </div>
    )
  }
  if (environment === 'map') {
    return (
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          className="absolute top-10 left-6 text-3xl"
          animate={{ x: [0, 16, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        >
          ☁️
        </motion.div>
        <div className="absolute bottom-4 right-4 text-3xl opacity-70">🗺️</div>
        <div className="absolute bottom-6 left-4 text-2xl opacity-70">🧭</div>
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
