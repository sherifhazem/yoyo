import { motion } from 'framer-motion'

// ============================================================
// كابتن شريف — رسم SVG كارتوني داخل إطار تابلت.
// expression: normal | excited | proud | explaining
// ============================================================
export default function CaptainShareef({ expression = 'normal', size = 130 }) {
  return (
    <div className="relative inline-block" style={{ width: size }}>
      {/* إطار التابلت */}
      <div className="animate-tablet-glow rounded-[20px] bg-slate-800 p-2 shadow-2xl ring-2 ring-cyan-400/60">
        <div className="overflow-hidden rounded-[12px] bg-gradient-to-b from-sky-200 to-sky-100">
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ShareefFace expression={expression} />
          </motion.div>
        </div>
      </div>
      {/* مؤشر الكاميرا في التابلت */}
      <div className="absolute left-1/2 top-1 h-1 w-1 -translate-x-1/2 rounded-full bg-slate-500" />
    </div>
  )
}

function ShareefFace({ expression }) {
  const excited = expression === 'excited'
  const proud = expression === 'proud'
  const explaining = expression === 'explaining'

  // العيون: مفتوحة أكتر في الحماس
  const eyeR = excited ? 5 : 4
  const mouthPath = proud || excited ? 'M 42 78 Q 60 96 78 78' : 'M 44 80 Q 60 90 76 80'

  return (
    <svg viewBox="0 0 120 130" width="100%" height="100%" aria-label="كابتن شريف">
      {/* الرقبة */}
      <rect x="48" y="92" width="24" height="16" fill="#D9A066" />
      {/* جاكيت المستكشف البني */}
      <path d="M 28 130 L 28 112 Q 60 96 92 112 L 92 130 Z" fill="#8B5E34" />
      <path d="M 52 104 L 60 130 L 68 104 Z" fill="#6B4423" />
      {/* البوصلة في الرقبة */}
      <circle cx="60" cy="112" r="6" fill="#F2C744" stroke="#6B4423" strokeWidth="1.5" />
      <path d="M 60 109 L 62 113 L 60 115 L 58 113 Z" fill="#C0392B" />
      {/* الوجه */}
      <ellipse cx="60" cy="64" rx="30" ry="32" fill="#F0B97D" />
      {/* الأذنين */}
      <circle cx="30" cy="66" r="5" fill="#F0B97D" />
      <circle cx="90" cy="66" r="5" fill="#F0B97D" />
      {/* قبعة المستكشف البيج */}
      <ellipse cx="60" cy="40" rx="38" ry="8" fill="#D4B483" />
      <path d="M 32 40 Q 60 8 88 40 Z" fill="#E8D5B5" />
      <rect x="32" y="36" width="56" height="5" rx="2" fill="#8B5E34" />
      {/* الحواجب */}
      <rect x="42" y="52" width="12" height="3" rx="1.5" fill="#5A3A1A" transform={excited ? 'rotate(-6 48 53)' : ''} />
      <rect x="66" y="52" width="12" height="3" rx="1.5" fill="#5A3A1A" transform={excited ? 'rotate(6 72 53)' : ''} />
      {/* العيون */}
      <circle cx="48" cy="62" r={eyeR} fill="#FFFFFF" />
      <circle cx="72" cy="62" r={eyeR} fill="#FFFFFF" />
      <circle cx="49" cy="63" r="2.2" fill="#2C2C2C" />
      <circle cx="73" cy="63" r="2.2" fill="#2C2C2C" />
      {/* بريق العين عند الشرح */}
      {explaining && (
        <>
          <circle cx="48" cy="61" r="0.9" fill="#FFFFFF" />
          <circle cx="72" cy="61" r="0.9" fill="#FFFFFF" />
        </>
      )}
      {/* الأنف */}
      <path d="M 60 64 L 57 72 L 63 72 Z" fill="#D9A066" />
      {/* الشنب */}
      <path d="M 48 76 Q 60 80 72 76" stroke="#5A3A1A" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* الفم */}
      <path d={mouthPath} stroke="#8B4513" strokeWidth="2.5" fill={proud || excited ? '#fff' : 'none'} strokeLinecap="round" />
      {/* الإبهام لفوق عند الفخر */}
      {proud && (
        <g>
          <circle cx="100" cy="100" r="9" fill="#F0B97D" stroke="#D9A066" strokeWidth="1.5" />
          <rect x="97" y="86" width="6" height="12" rx="3" fill="#F0B97D" stroke="#D9A066" strokeWidth="1" />
        </g>
      )}
    </svg>
  )
}
