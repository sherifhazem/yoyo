export const DAY_MS = 90000;           // one game day = 90 real seconds
export const DAYS_PER_SEASON = 6;
export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const OFFLINE_CAP_DAYS = 320;   // 8 real hours

export const dayOf = (state, now = Date.now()) => (now - state.startedAt) / DAY_MS;
export const seasonIndex = (day) => ((Math.floor(day / DAYS_PER_SEASON) % 4) + 4) % 4;
export const seasonName = (day) => SEASONS[seasonIndex(day)];
export const hourOf = (day) => (day - Math.floor(day)) * 24;
export const year = (day) => Math.floor(day / (DAYS_PER_SEASON * 4)) + 1;
