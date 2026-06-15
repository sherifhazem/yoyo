import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { animalSort } from '../../data/day1Story'
import { playCorrect, playWrong, playCelebrate } from '../../utils/sound'

// ============================================================
// لوحة تصنيف الحيوانات — سحب وإفلات + بديل لمس (اضغط الحيوان ثم البيئة).
// بينادي onSolved() لما كل الحيوانات تتصنّف صح.
// ============================================================
export default function AnimalSort({ onSolved }) {
  const { habitats, animals, wrongHints } = animalSort
  const [placed, setPlaced] = useState({}) // animalId -> habitatId
  const [selected, setSelected] = useState(null) // للبديل باللمس
  const [hint, setHint] = useState(null)
  const [shakeHabitat, setShakeHabitat] = useState(null)
  const habitatRefs = useRef({})

  const remaining = animals.filter((a) => !placed[a.id])
  const allDone = remaining.length === 0

  const place = (animal, habitatId) => {
    if (placed[animal.id]) return
    if (animal.habitat === habitatId) {
      const next = { ...placed, [animal.id]: habitatId }
      setPlaced(next)
      setSelected(null)
      setHint(null)
      if (Object.keys(next).length === animals.length) {
        playCelebrate()
        setTimeout(() => onSolved?.(), 700)
      } else {
        playCorrect()
      }
    } else {
      playWrong()
      setHint(wrongHints[habitatId] || 'جرب تاني! 😊')
      setShakeHabitat(habitatId)
      setTimeout(() => setShakeHabitat(null), 500)
    }
  }

  // كشف منطقة الإفلات عند نهاية السحب
  const handleDragEnd = (animal, info) => {
    const { x, y } = info.point
    for (const h of habitats) {
      const el = habitatRefs.current[h.id]
      if (!el) continue
      const r = el.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        place(animal, h.id)
        return
      }
    }
  }

  // اللمس: اختار حيوان ثم بيئة
  const handleAnimalTap = (animal) => setSelected((cur) => (cur === animal.id ? null : animal.id))
  const handleHabitatTap = (habitatId) => {
    if (!selected) return
    const animal = animals.find((a) => a.id === selected)
    if (animal) place(animal, habitatId)
  }

  return (
    <div className="w-full">
      {/* تلميح أو تعليمات */}
      <div className="mb-3 min-h-[2.5rem] rounded-2xl bg-white/85 p-2 text-center text-sm font-bold text-explorer-brown shadow">
        {hint ? `🧭 ${hint}` : selected ? '👆 دلوقتي اضغط على البيئة الصح!' : '🤚 اسحب الحيوان لبيئته، أو اضغط عليه الأول.'}
      </div>

      {/* صينية الحيوانات الباقية */}
      <div className="mb-4 flex min-h-[80px] flex-wrap justify-center gap-2 rounded-2xl bg-white/40 p-2">
        {remaining.map((animal) => (
          <motion.button
            key={animal.id}
            type="button"
            drag
            dragSnapToOrigin
            whileDrag={{ scale: 1.2, zIndex: 50 }}
            onDragEnd={(_, info) => handleDragEnd(animal, info)}
            onTap={() => handleAnimalTap(animal)}
            animate={selected === animal.id ? { scale: 1.15 } : { scale: 1 }}
            className={`flex h-16 w-16 cursor-grab touch-none flex-col items-center justify-center rounded-2xl bg-white shadow-md active:cursor-grabbing ${
              selected === animal.id ? 'ring-4 ring-explorer-sky' : 'ring-2 ring-slate-200'
            }`}
          >
            <span className="text-3xl">{animal.emoji}</span>
            <span className="text-[10px] font-bold text-slate-600">{animal.label}</span>
          </motion.button>
        ))}
        {allDone && <span className="py-4 text-lg font-bold text-green-700">تمام! كله في مكانه 🎉</span>}
      </div>

      {/* البيئات */}
      <div className="grid grid-cols-3 gap-2">
        {habitats.map((h) => {
          const inHere = animals.filter((a) => placed[a.id] === h.id)
          return (
            <motion.div
              key={h.id}
              ref={(el) => (habitatRefs.current[h.id] = el)}
              onClick={() => handleHabitatTap(h.id)}
              animate={shakeHabitat === h.id ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              className="flex min-h-[120px] flex-col items-center rounded-2xl p-2 shadow-inner ring-2"
              style={{ backgroundColor: `${h.color}33`, borderColor: h.color }}
            >
              <div className="mb-1 text-center text-2xl">{h.emoji}</div>
              <div className="mb-1 text-xs font-extrabold text-slate-700">{h.label}</div>
              <div className="flex flex-wrap justify-center gap-1">
                {inHere.map((a) => (
                  <motion.span
                    key={a.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-2xl"
                  >
                    {a.emoji}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
