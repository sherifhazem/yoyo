import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Mom from '../characters/Mom'
import { playClick } from '../../utils/sound'

// ============================================================
// خطوات مساعدة تلقائية لتحديات الرياضيات.
// بتتبني من بيانات challenge.visual الموجودة أصلاً — من غير أي
// محتوى إضافي لازم يتكتب لكل مسألة على حدة.
// أنماط visual المدعومة: items/eggs (طرح) · groups/pancakes (ضرب) · cup (كسور).
// ============================================================
export default function MathHintSteps({ challenge, onDone }) {
  const [steps] = useState(() => buildSteps(challenge))
  const [index, setIndex] = useState(0)

  const step = steps[index]
  if (!step) {
    onDone()
    return null
  }
  const isLast = index === steps.length - 1

  const next = () => {
    playClick()
    if (isLast) onDone()
    else setIndex((i) => i + 1)
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-end justify-center gap-2">
        <Mom size={84} />
        <div className="mb-2 max-w-[70%] rounded-2xl rounded-br-sm bg-white/95 p-3 text-base font-bold text-slate-800 shadow-md">
          {step.text}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-3"
        >
          {step.visual}
        </motion.div>
      </AnimatePresence>

      <div className="mb-3 flex justify-center gap-1.5">
        {steps.map((_, i) => (
          <span key={i} className={`h-2 w-2 rounded-full ${i === index ? 'bg-explorer-sky' : 'bg-slate-300'}`} />
        ))}
      </div>

      <button
        type="button"
        onClick={next}
        className="w-full rounded-2xl bg-explorer-sky py-3 text-lg font-bold text-white shadow-md active:scale-95"
      >
        {isLast ? "Let's try again! 💪" : 'Next 👉'}
      </button>
    </div>
  )
}

function buildSteps(challenge) {
  const visual = challenge.visual || {}

  if (visual.type === 'items' || visual.type === 'eggs') {
    const { total, removed } = visual
    const remaining = total - removed
    const icon = visual.emoji || (visual.type === 'eggs' ? '🥚' : '⭐')
    return [
      { text: `We start with ${total} ${icon}.`, visual: <ItemsGrid total={total} crossed={0} dimmed={0} icon={icon} /> },
      { text: `We take away ${removed}.`, visual: <ItemsGrid total={total} crossed={removed} dimmed={0} icon={icon} /> },
      {
        text: "Now let's count what's left...",
        visual: <ItemsGrid total={total} crossed={removed} dimmed={removed} icon={icon} />,
      },
      { text: `${total} − ${removed} = ${remaining}. Great counting! 🎉`, visual: <BigNumber value={remaining} /> },
    ]
  }

  if (visual.type === 'groups' || visual.type === 'pancakes') {
    const { count, perItem } = visual
    const product = count * perItem
    const groupIcon = visual.groupEmoji || (visual.type === 'pancakes' ? '🥞' : '🔸')
    const itemIcon = visual.itemEmoji || (visual.type === 'pancakes' ? '🥄' : '🔹')
    return [
      {
        text: `We have ${count} groups.`,
        visual: <GroupsGrid count={count} perItem={perItem} groupIcon={groupIcon} itemIcon={itemIcon} showItems={false} />,
      },
      {
        text: `Each group has ${perItem}.`,
        visual: <GroupsGrid count={count} perItem={perItem} groupIcon={groupIcon} itemIcon={itemIcon} showItems />,
      },
      {
        text: `Let's add them all: ${Array(count).fill(perItem).join(' + ')}.`,
        visual: (
          <div className="rounded-2xl bg-white/60 p-4 text-center text-xl font-black text-slate-700">
            {Array(count).fill(perItem).join(' + ')}
          </div>
        ),
      },
      { text: `${count} × ${perItem} = ${product}. Nicely done! 🎉`, visual: <BigNumber value={product} /> },
    ]
  }

  if (visual.type === 'cup') {
    return [
      { text: 'We start with half a cup.', visual: <CupsRow fills={[50]} /> },
      { text: 'We want double, so we add one more half.', visual: <CupsRow fills={[50, 50]} /> },
      { text: 'Half + half makes one full cup! 🎉', visual: <CupsRow fills={[100]} /> },
    ]
  }

  return []
}

function ItemsGrid({ total, crossed, dimmed, icon }) {
  return (
    <div className="flex flex-wrap justify-center gap-1 rounded-2xl bg-white/60 p-3">
      {Array.from({ length: total }).map((_, i) => {
        const isCrossed = i >= total - crossed
        const isDimmed = i >= total - dimmed
        return (
          <motion.span
            key={i}
            animate={{ opacity: isDimmed ? 0.25 : 1, scale: isDimmed ? 0.85 : 1 }}
            className="relative text-2xl"
          >
            {icon}
            {isCrossed && <span className="absolute inset-0 flex items-center justify-center text-rose-500">✖️</span>}
          </motion.span>
        )
      })}
    </div>
  )
}

function GroupsGrid({ count, perItem, groupIcon, itemIcon, showItems }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 rounded-2xl bg-white/60 p-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="text-2xl">{groupIcon}</span>
          <span className="text-xs">{showItems ? itemIcon.repeat(perItem) : ' '}</span>
        </div>
      ))}
    </div>
  )
}

function CupsRow({ fills }) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl bg-white/60 p-3">
      {fills.map((fill, i) => (
        <div key={i} className="relative h-16 w-12 overflow-hidden rounded-b-xl rounded-t-md border-2 border-slate-400 bg-white">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${fill}%` }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-0 w-full bg-explorer-water/80"
          />
        </div>
      ))}
    </div>
  )
}

function BigNumber({ value }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring' }}
      className="flex items-center justify-center rounded-2xl bg-white/70 p-4 text-5xl font-black text-explorer-forest"
    >
      {value}
    </motion.div>
  )
}
