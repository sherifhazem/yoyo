import { motion } from 'framer-motion'
import normal from '../../assets/characters/shareef-normal.png'
import excited from '../../assets/characters/shareef-excited.png'
import proud from '../../assets/characters/shareef-proud.png'
import explaining from '../../assets/characters/shareef-explaining.png'

const FACES = { normal, excited, proud, explaining }

// ============================================================
// كابتن شريف — صورة مولّدة بالذكاء الاصطناعي داخل إطار تابلت.
// expression: normal | excited | proud | explaining
// ============================================================
export default function CaptainShareef({ expression = 'normal', size = 130 }) {
  return (
    <div className="relative inline-block" style={{ width: size }}>
      {/* إطار التابلت */}
      <div className="animate-tablet-glow rounded-[20px] bg-slate-800 p-2 shadow-2xl ring-2 ring-cyan-400/60">
        <div className="overflow-hidden rounded-[12px] bg-gradient-to-b from-sky-200 to-sky-100">
          <motion.img
            src={FACES[expression] || FACES.normal}
            alt="Captain Shareef"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full"
          />
        </div>
      </div>
      {/* مؤشر الكاميرا في التابلت */}
      <div className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-slate-500" />
    </div>
  )
}
