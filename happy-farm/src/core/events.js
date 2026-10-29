const subs = new Map();
export const on = (name, fn) => { (subs.get(name) || subs.set(name, []).get(name)).push(fn); };
export const emit = (name, data) => { (subs.get(name) || []).forEach((fn) => fn(data)); };
