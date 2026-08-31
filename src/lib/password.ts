import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const N = 16384;
const r = 8;
const p = 1;
const KEY_LENGTH = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, KEY_LENGTH, { N, r, p }).toString('hex');
  return `scrypt$${N}$${r}$${p}$${salt}$${key}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [scheme, ns, rs, ps, salt, key] = stored.split('$');
    if (scheme !== 'scrypt' || !ns || !rs || !ps || !salt || !key) return false;
    const derived = scryptSync(password, salt, key.length / 2, {
      N: Number(ns),
      r: Number(rs),
      p: Number(ps),
    });
    const expected = Buffer.from(key, 'hex');
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}
