import { motion } from 'framer-motion'
import { isDayUnlocked } from '../../data/days'
import { playClick } from '../../utils/sound'

// ============================================================
// خريطة الأيام — شاشة البداية.
// المستخدم يشوف كل الأيام من الأول. اليوم اللي خلص جنبه ✅،
// اليوم الجديد المتاح مكتوب جنبه "جديد"، واللي لسه مقفول عليه 🔒.
// ============================================================
export default function DayMap({ days, completedDays, onSelectDay, onReset }) {
  const completedCount = completedDays.length

  return (
    <div className="flex flex-1 flex-col" dir="rtl">
      {/* العنوان */}
      <div className="mb-4 text-center">
        <div className="mb-1 text-5xl">🧭</div>
        <h1 className="text-2xl font-black text-explorer-brown drop-shadow">يوسف المستكشف</h1>
        <p className="text-sm font-bold text-slate-600">اختار يومك ومغامرتك! 🗺️</p>
        <p className="mt-1 text-xs font-bold text-explorer-sky">
          خلّصت {completedCount} من {days.length} أيام
        </p>
      </div>

      {/* قائمة الأيام */}
      <div className="space-y-3">
        {days.map((day, i) => {
          const unlocked = isDayUnlocked(day.id, completedDays)
          const completed = completedDays.includes(day.id)
          const isNew = unlocked && !completed

          return (
            <motion.button
              key={day.id}
              type="button"
              disabled={!unlocked}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              whileTap={unlocked ? { scale: 0.97 } : {}}
              onClick={() => {
                if (!unlocked) return
                playClick()
                onSelectDay(day.id)
              }}
              className={`flex w-full items-center gap-3 rounded-3xl p-3 text-right shadow-md ring-2 transition-colors ${
                unlocked
                  ? 'bg-white/95 ring-white'
                  : 'cursor-not-allowed bg-white/50 ring-slate-200 grayscale'
              } ${isNew ? 'ring-4 ring-explorer-sky' : ''}`}
            >
              {/* رقم اليوم + الإيموجي */}
              <div
                className="flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-white shadow"
                style={{ backgroundColor: day.color }}
              >
                <span className="text-2xl leading-none">{day.emoji}</span>
                <span className="mt-0.5 text-[10px] font-black">يوم {day.id}</span>
              </div>

              {/* العنوان */}
              <div className="flex-1">
                <div className="text-lg font-black text-explorer-brown">{day.title}</div>
                <div className="ltr text-xs font-bold text-slate-500">{day.subtitle}</div>
              </div>

              {/* الحالة */}
              <div className="flex min-w-[3.5rem] flex-col items-center justify-center">
                {completed ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring' }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl">✅</span>
                    <span className="text-[10px] font-black text-green-600">خلصت</span>
                  </motion.div>
                ) : isNew ? (
                  <motion.div
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-2xl">✨</span>
                    <span className="rounded-full bg-explorer-sky px-2 py-0.5 text-[10px] font-black text-white">
                      جديد
                    </span>
                  </motion.div>
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-2xl opacity-70">🔒</span>
                    <span className="text-[10px] font-black text-slate-500">مقفول</span>
                  </div>
                )}
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* إعادة الضبط */}
      {completedCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 self-center rounded-2xl bg-explorer-brown/80 px-5 py-2 text-sm font-bold text-white shadow active:scale-95"
        >
          ابدأ من جديد 🔄
        </button>
      )}
    </div>
  )
}
