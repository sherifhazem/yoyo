import { motion } from 'framer-motion'
import normal from '../../assets/characters/mom-normal.png'
import happy from '../../assets/characters/mom-happy.png'

const FACES = { normal, happy }

// ============================================================
// أم يوسف — صورة مولّدة بالذكاء الاصطناعي، مبتسمة ودافئة.
// expression: normal | happy
// ============================================================
export default function Mom({ size = 120, expression = 'normal' }) {
  return (
    <motion.img
      src={FACES[expression] || FACES.normal}
      alt="Yousef's Mom"
      className="inline-block"
      style={{ width: size }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  )
}
