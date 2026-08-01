// ============================================================
// سجلّ الأيام — كل الأيام مجمّعة في مكان واحد + أدوات مساعدة.
// ============================================================
import day1 from './day1'
import day2 from './day2'
import day3 from './day3'
import day4 from './day4'
import day5 from './day5'

// كل أيام المغامرة بالترتيب
export const DAYS = [day1, day2, day3, day4, day5]

export const TOTAL_DAYS = DAYS.length

export function getDay(id) {
  return DAYS.find((d) => d.id === id) || DAYS[0]
}

// يوم يُفتح لو هو اليوم الأول أو لو اليوم اللي قبله اتخلّص
export function isDayUnlocked(id, completedDays = []) {
  if (id === DAYS[0].id) return true
  return completedDays.includes(id - 1)
}
