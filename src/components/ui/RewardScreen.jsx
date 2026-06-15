import { motion } from 'framer-motion'

// ============================================================
// دفتر المستكشف — يفتح بأنيميشن ويكشف الشارات واحدة واحدة.
// ============================================================
export default function RewardScreen({ badges }) {
  return (
    <motion.div
      initial={{ rotateX: -90, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{ transformOrigin: 'top' }}
      className="rounded-3xl border-4 border-amber-700 bg-amber-50 p-4 shadow-2xl"
    >
      <h2 className="mb-3 text-center text-xl font-black text-amber-800">📒 دفتر المستكشف</h2>
      <ul className="space-y-2">
        {badges.map((badge, i) => (
          <motion.li
            key={badge.id}
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.4 }}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-md ring-2 ring-amber-200"
          >
            <span className="text-3xl">{badge.emoji}</span>
            <span className="flex-1 font-bold text-slate-800">{badge.label}</span>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7 + i * 0.4, type: 'spring' }}
              className="text-2xl text-green-500"
            >
              ✅
            </motion.span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  )
}
