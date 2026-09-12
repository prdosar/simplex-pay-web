import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'

export const metadata: Metadata = {
  title: 'SimplexPay Admin',
  description: 'Administration SimplexPay',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full bg-muted">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
