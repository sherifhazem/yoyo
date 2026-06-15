import { motion } from 'framer-motion'

// ============================================================
// أم يوسف — رسم SVG كارتوني، مبتسمة ودافئة (مشهد المطبخ).
// ============================================================
export default function Mom({ size = 120 }) {
  return (
    <motion.div
      className="inline-block"
      style={{ width: size }}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 120 130" width="100%" height="100%" aria-label="أم يوسف">
        {/* الرقبة */}
        <rect x="50" y="92" width="20" height="14" fill="#E8B98A" />
        {/* المريول */}
        <path d="M 26 130 L 28 110 Q 60 96 92 110 L 94 130 Z" fill="#E76F8E" />
        <path d="M 48 104 L 48 130 L 72 130 L 72 104 Z" fill="#F7A8BE" />
        <rect x="48" y="104" width="24" height="3" fill="#FFFFFF" opacity="0.6" />
        {/* الوجه */}
        <ellipse cx="60" cy="64" rx="29" ry="31" fill="#F5C9A0" />
        {/* الأذنين والحلق */}
        <circle cx="31" cy="66" r="5" fill="#F5C9A0" />
        <circle cx="89" cy="66" r="5" fill="#F5C9A0" />
        <circle cx="31" cy="70" r="2" fill="#F2C744" />
        <circle cx="89" cy="70" r="2" fill="#F2C744" />
        {/* الشعر المربوط */}
        <path d="M 30 60 Q 30 28 60 28 Q 90 28 90 60 L 86 60 Q 84 40 60 40 Q 36 40 34 60 Z" fill="#4A2C17" />
        <ellipse cx="60" cy="30" rx="22" ry="12" fill="#4A2C17" />
        {/* كعكة الشعر */}
        <circle cx="60" cy="22" r="9" fill="#5A3A22" />
        <rect x="55" y="20" width="10" height="5" rx="2" fill="#E76F8E" />
        {/* الحواجب */}
        <rect x="43" y="54" width="11" height="3" rx="1.5" fill="#4A2C17" />
        <rect x="66" y="54" width="11" height="3" rx="1.5" fill="#4A2C17" />
        {/* العيون */}
        <circle cx="49" cy="63" r="4" fill="#FFFFFF" />
        <circle cx="71" cy="63" r="4" fill="#FFFFFF" />
        <circle cx="50" cy="64" r="2.2" fill="#3A2A1A" />
        <circle cx="72" cy="64" r="2.2" fill="#3A2A1A" />
        {/* خدود وردية */}
        <circle cx="42" cy="72" r="5" fill="#F7A8BE" opacity="0.6" />
        <circle cx="78" cy="72" r="5" fill="#F7A8BE" opacity="0.6" />
        {/* الأنف */}
        <path d="M 60 65 L 58 71 L 62 71 Z" fill="#E8B98A" />
        {/* ابتسامة دافئة */}
        <path d="M 48 78 Q 60 90 72 78" stroke="#C0392B" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  )
}
