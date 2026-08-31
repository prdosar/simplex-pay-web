import { cache } from 'react';
import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { prisma } from './prisma';
import type { UserDto } from '@/types/api';

export const SESSION_COOKIE = 'sp_session';
const SESSION_TTL_DAYS = 30;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function toUserDto(u: {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string | null;
  CountryCode: string | null;
  Status: string;
  Rating: number;
  TransactionCount: number;
  CreatedAt: Date;
}): UserDto {
  return {
    id: u.Id,
    firstName: u.FirstName,
    lastName: u.LastName,
    email: u.Email,
    phone: u.Phone ?? '',
    country: u.CountryCode ?? '',
    status: u.Status,
    rating: u.Rating,
    transactionCount: u.TransactionCount,
    createdAt: u.CreatedAt.toISOString(),
  };
}

export const getCurrentUser = cache(async (): Promise<UserDto | null> => {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (!sid || !UUID_RE.test(sid)) return null;

  const session = await prisma.sessions.findUnique({
    where: { Id: sid },
    include: { User: true },
  });
  if (!session || session.ExpiresAt < new Date()) return null;

  return toUserDto(session.User);
});

export async function createSession(userId: string): Promise<void> {
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 86_400_000);
  await prisma.sessions.create({ data: { Id: id, UserId: userId, ExpiresAt: expiresAt } });

  const store = await cookies();
  store.set(SESSION_COOKIE, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const sid = store.get(SESSION_COOKIE)?.value;
  if (sid && UUID_RE.test(sid)) {
    await prisma.sessions.deleteMany({ where: { Id: sid } });
  }
  store.delete(SESSION_COOKIE);
}
