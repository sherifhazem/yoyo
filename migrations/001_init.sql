-- يوسف المستكشف — جدول اللاعبين وتقدّمهم
-- شغّل الملف ده مرة واحدة على قاعدة بيانات Postgres (Vercel Postgres / Neon) المربوطة بالمشروع.

CREATE TABLE IF NOT EXISTS players (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  pin_hash    TEXT NOT NULL,
  progress    JSONB NOT NULL DEFAULT '{
    "view": "map",
    "activeDay": null,
    "currentScene": 0,
    "scores": {"logic": 0, "math": 0, "science": 0, "english": 0},
    "badges": [],
    "completedDays": []
  }'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS players_name_lower_idx ON players (lower(name));
