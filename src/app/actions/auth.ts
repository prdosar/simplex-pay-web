'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/password';
import { createSession, destroySession } from '@/lib/session';

export interface AuthFormState {
  error?: string;
}

function safeLocale(value: FormDataEntryValue | null): string {
  return value === 'en' ? 'en' : 'fr';
}

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = safeLocale(formData.get('locale'));
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');

  if (!email || !password) {
    return {
      error:
        locale === 'fr'
          ? 'Veuillez remplir tous les champs.'
          : 'Please fill in all fields.',
    };
  }

  const user = await prisma.users.findUnique({ where: { Email: email } });
  if (!user || !verifyPassword(password, user.PasswordHash)) {
    return {
      error:
        locale === 'fr'
          ? 'Email ou mot de passe incorrect.'
          : 'Invalid email or password.',
    };
  }
  if (user.Status !== 'Active') {
    return {
      error:
        locale === 'fr'
          ? 'Ce compte est désactivé.'
          : 'This account is disabled.',
    };
  }

  await createSession(user.Id);
  revalidatePath('/', 'layout');
  redirect(`/${locale}`);
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const locale = safeLocale(formData.get('locale'));
  const firstName = String(formData.get('firstName') ?? '').trim();
  const lastName = String(formData.get('lastName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const phone = String(formData.get('phoneNumber') ?? '').trim();
  const country = String(formData.get('country') ?? '').trim();

  if (!firstName || !lastName || !email || !password || !phone) {
    return {
      error:
        locale === 'fr'
          ? 'Veuillez remplir tous les champs obligatoires.'
          : 'Please fill in all required fields.',
    };
  }
  if (password.length < 8) {
    return {
      error:
        locale === 'fr'
          ? 'Le mot de passe doit contenir au moins 8 caractères.'
          : 'Password must be at least 8 characters.',
    };
  }

  try {
    const user = await prisma.users.create({
      data: {
        FirstName: firstName,
        LastName: lastName,
        Email: email,
        Phone: phone,
        WhatsApp: String(formData.get('whatsAppNumber') ?? '').trim() || null,
        PasswordHash: hashPassword(password),
        CountryCode: country || null,
      },
    });
    await createSession(user.Id);
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === 'P2002') {
      return {
        error:
          locale === 'fr'
            ? 'Un compte avec cet email existe déjà.'
            : 'An account with this email already exists.',
      };
    }
    return {
      error:
        locale === 'fr'
          ? 'Une erreur est survenue.'
          : 'An error occurred.',
    };
  }

  revalidatePath('/', 'layout');
  redirect(`/${locale}`);
}

export async function logoutAction(formData: FormData): Promise<void> {
  const locale = safeLocale(formData.get('locale'));
  await destroySession();
  revalidatePath('/', 'layout');
  redirect(`/${locale}`);
}
