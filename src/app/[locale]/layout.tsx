import '../globals.css'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { AuthProvider } from '@/context/AuthContext'
import { getCurrentUser } from '@/lib/session'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const themeInitScript = `(function(){try{var t=localStorage.getItem('spx-theme');var d=document.documentElement;if(t==='light'){d.classList.remove('dark')}else if(t==='dark'){d.classList.add('dark')}else if(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches){d.classList.remove('dark')}}catch(e){}})()`

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) notFound()

  const [messages, user] = await Promise.all([getMessages(), getCurrentUser()])

  return (
    <html lang={locale} className={`${inter.variable} h-full dark`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider initialUser={user}>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
