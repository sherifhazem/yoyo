import { neon } from '@neondatabase/serverless'

// إنشاء الاتصال بالـ lazy loading — لو DATABASE_URL ناقص، الخطأ يحصل
// جوه هاندلر بيتحط في try/catch (مش وقت تحميل الملف)، عشان يرجع رد
// JSON واضح بدل ما الـ function كلها تعمل crash صامت.
let cached

export function getSql() {
  if (!cached) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL (or POSTGRES_URL) environment variable is not set')
    }
    cached = neon(connectionString, { fullResults: true })
  }
  return cached
}
