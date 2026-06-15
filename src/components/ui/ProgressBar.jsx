import { motion } from 'framer-motion'

// ============================================================
// شريط التقدم العام عبر المشاهد.
// ============================================================
export default function ProgressBar({ current, total }) {
  const pct = Math.min(100, Math.round((current / (total - 1)) * 100))

  return (
    <div className="flex items-center gap-2">
      <span className="text-base">🧭</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/40 shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-l from-yellow-400 to-orange-400"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
      <span className="min-w-[2.5rem] text-left text-xs font-bold text-white drop-shadow">
        {Math.min(current + 1, total)}/{total}
      </span>
    </div>
  )
}
