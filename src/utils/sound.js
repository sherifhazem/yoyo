// ============================================================
// أصوات مولّدة بالـ Web Audio API — من غير ملفات صوت.
// تتفعّل بعد أول تفاعل من المستخدم (سياسة المتصفح).
// ============================================================

let ctx = null
let muted = false

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// نغمة بسيطة بتردد ومدة محددين
function tone(freq, start, duration, type = 'sine', gain = 0.15) {
  const audio = getCtx()
  if (!audio || muted) return
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, audio.currentTime + start)
  g.gain.setValueAtTime(0.0001, audio.currentTime + start)
  g.gain.exponentialRampToValueAtTime(gain, audio.currentTime + start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(audio.currentTime + start)
  osc.stop(audio.currentTime + start + duration + 0.02)
}

export function setMuted(value) {
  muted = value
}

export function isMuted() {
  return muted
}

// ضغطة زر
export function playClick() {
  tone(440, 0, 0.08, 'triangle', 0.1)
}

// انتقال بين المشاهد (سحبة لطيفة)
export function playTransition() {
  tone(330, 0, 0.12, 'sine', 0.08)
  tone(494, 0.08, 0.14, 'sine', 0.08)
}

// إجابة صح — نغمتين صاعدتين مبهجتين
export function playCorrect() {
  tone(523.25, 0, 0.12, 'sine', 0.15) // C5
  tone(659.25, 0.1, 0.16, 'sine', 0.15) // E5
}

// إجابة غلط — نغمة لطيفة منخفضة (مش قاسية ولا مزعجة)
export function playWrong() {
  tone(392, 0, 0.16, 'triangle', 0.1) // G4
  tone(330, 0.12, 0.2, 'triangle', 0.1) // E4
}

// احتفال — أربع نغمات صاعدة (آرپيدجو فرحان)
export function playCelebrate() {
  tone(523.25, 0, 0.14, 'sine', 0.15) // C5
  tone(659.25, 0.12, 0.14, 'sine', 0.15) // E5
  tone(783.99, 0.24, 0.14, 'sine', 0.15) // G5
  tone(1046.5, 0.36, 0.3, 'sine', 0.18) // C6
}
