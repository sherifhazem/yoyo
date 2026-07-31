import { useState } from 'react'
import { motion } from 'framer-motion'
import { playClick, playWrong } from '../../utils/sound'

const ERROR_MESSAGES = {
  wrong_pin: 'الرقم السري غلط، جرب تاني 🔑',
  invalid_input: 'اكتب اسمك ورقم سري من 4 أرقام',
}

// ============================================================
// شاشة الدخول — اسم يوسف + رقم سري من 4 أرقام.
// أول مرة بيتعمل حساب تلقائي؛ المرات اللي بعدها لازم نفس الرقم السري.
// لو الباك إند مش متاح، useGameState بيكمل أوفلاين بصمت من غير ما يوقفنا هنا.
// ============================================================
export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const canSubmit = name.trim().length > 0 && /^\d{4}$/.test(pin) && !busy

  const submit = async () => {
    if (!canSubmit) return
    setBusy(true)
    setError(null)
    const result = await onLogin(name.trim(), pin)
    setBusy(false)
    if (!result.ok) {
      playWrong()
      setError(ERROR_MESSAGES[result.error] || ERROR_MESSAGES.invalid_input)
      return
    }
    playClick()
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center" dir="rtl">
      <div className="mb-2 text-5xl">🧭</div>
      <h1 className="mb-1 text-2xl font-black text-explorer-brown drop-shadow">يوسف المستكشف</h1>
      <p className="mb-6 max-w-xs text-center text-sm font-bold text-slate-600">
        اكتب اسمك ورقمك السري عشان نحفظلك تقدمك 🔒
      </p>

      <div className="w-full max-w-xs space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اسمك"
          maxLength={30}
          className="h-14 w-full rounded-2xl bg-white px-4 text-center text-xl font-black text-slate-800 shadow-inner ring-2 ring-slate-200 focus:ring-explorer-sky focus:outline-none"
        />
        <input
          type="tel"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="رقمك السري (4 أرقام)"
          maxLength={4}
          className="h-14 w-full rounded-2xl bg-white px-4 text-center text-xl font-black tracking-[0.5em] text-slate-800 shadow-inner ring-2 ring-slate-200 focus:ring-explorer-sky focus:outline-none"
        />

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-sm font-bold text-amber-700"
          >
            {error}
          </motion.p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="h-14 w-full rounded-2xl bg-explorer-forest text-lg font-bold text-white shadow-md active:scale-95 disabled:opacity-50"
        >
          {busy ? 'لحظة... ⏳' : 'يلا نلعب 🚀'}
        </button>

        <p className="text-center text-xs font-bold text-slate-500">
          أول مرة؟ اكتب اسمك وأي رقم سري من 4 أرقام وهيتحفظ لك.
        </p>
      </div>
    </div>
  )
}
