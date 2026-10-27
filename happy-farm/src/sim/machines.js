import { record } from './skills.js';

export const STRENGTH = 12;                 // kg-force the child can pull
export const BUCKETS = [
  { id: 1, name: 'Small bucket', kg: 12, units: 5 },
  { id: 2, name: 'Medium bucket', kg: 24, units: 10 },
  { id: 3, name: 'Large bucket', kg: 48, units: 20 },
];
export const PULLEY_COST = 15;
export const GEAR_COST = 20;
export const MAX_PULLEYS = 4;
export const MAX_GEARS = 3;
export const BASE_TIME_S = 2;               // seconds to lift at MA = 1

export const bucketOf = (s) => BUCKETS.find((b) => b.id === s.well.bucket) || BUCKETS[0];
export const advantage = (s) => s.well.pulleys * s.well.gears;
export const forceNeeded = (s) => bucketOf(s).kg / advantage(s);      // work = force x distance
export const liftSeconds = (s) => BASE_TIME_S * advantage(s);
export const minAdvantage = (s) => Math.max(1, Math.ceil(bucketOf(s).kg / STRENGTH));
export const canLift = (s) => forceNeeded(s) <= STRENGTH + 1e-9;

export function drawWater(s, now) {
  if (now < s.well.readyAt) return { ok: false, msg: 'The rope is still coming back…' };
  if (!canLift(s)) { record(s, 'mechanics', false); return { ok: false, msg: `Too heavy! You pull ${forceNeeded(s).toFixed(0)} kg but can only pull ${STRENGTH} kg.` }; }
  const b = bucketOf(s);
  s.well.readyAt = now + liftSeconds(s) * 1000;
  s.tank = Math.min(100, s.tank + b.units);
  record(s, 'mechanics', advantage(s) <= minAdvantage(s) * 2);
  s.stats.draws = (s.stats.draws || 0) + 1;
  return { ok: true, units: b.units };
}

// ---- delivery trips: time = distance / speed ----
export const CITY_KM = 12;
export const TRIP_SCALE_S = 30;             // real seconds per game hour of driving
export const SPEEDS = [30, 45, 60, 75, 90];
export const TRUCK_CAPACITY = 20;
export const tripSeconds = (v) => (CITY_KM / v) * TRIP_SCALE_S;
export const fuelCost = (v) => Math.round(CITY_KM * (0.02 + 0.0002 * v * v));
export const minSpeedFor = (deadlineS) => SPEEDS.find((v) => tripSeconds(v) <= deadlineS) || SPEEDS[SPEEDS.length - 1];
export function makeDeadline(day) { return [14, 9, 6][Math.floor(((day * 7919) % 3 + 3) % 3)]; }

export function startTrip(s, load, v, deadlineS, now, value) {
  if (s.trip) return { ok: false, msg: 'Truck is already away' };
  const n = Object.values(load).reduce((a, b) => a + b, 0);
  if (!n || n > TRUCK_CAPACITY) return { ok: false, msg: `Load 1–${TRUCK_CAPACITY} items` };
  const fuel = fuelCost(v);
  if (s.coins < fuel) return { ok: false, msg: `Fuel costs $${fuel}` };
  for (const id in load) if ((s.goods[id] || 0) < load[id]) return { ok: false, msg: 'Not enough goods' };
  for (const id in load) s.goods[id] -= load[id];
  s.coins -= fuel;
  s.trip = { load, v, fuel, deadlineS, startedAt: now, endsAt: now + tripSeconds(v) * 1000, value };
  return { ok: true, fuel };
}
export function finishTrip(s, now) {
  const t = s.trip;
  if (!t || now < t.endsAt) return null;
  const onTime = tripSeconds(t.v) <= t.deadlineS + 1e-9;
  const pay = Math.round(t.value * (onTime ? 1.4 : 1.0));
  s.coins += pay;
  record(s, 'speed', onTime && t.v === minSpeedFor(t.deadlineS));
  s.stats.deliveries = (s.stats.deliveries || 0) + 1;
  s.trip = null;
  return { pay, onTime, fuel: t.fuel };
}
